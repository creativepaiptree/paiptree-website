#!/usr/bin/env python3
"""Import the Cherrybro 용차 Excel bundle into Supabase.

What this script does:
1) Parse the uploaded xlsx with stdlib only.
2) Normalize the target sheet into raw rows.
3) Optionally write those rows into Supabase tables.
4) Build grouping runs/rows/details so /cherry_tms/grouping can read real data.

Default mode is dry-run.
Use --apply to write to Supabase.

Usage:
  python3 scripts/cherry-tms/import_cherrybro_excel.py <xlsx-path> [--sheet <sheet-substring>] [--apply]

Environment:
  SUPABASE_URL
  SUPABASE_SERVICE_KEY (preferred)
  SUPABASE_SERVICE_ROLE_KEY
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

NS = {
    "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}

TARGET_HEADERS = [
    "순번",
    "날짜",
    "일별횟수",
    "발지",
    "착지",
    "착지수",
    "톤",
    "체리청구비용",
    "기사지급비용",
    "소속",
    "외부배송기사",
    "내부배송기사",
    "비용부담",
    "비용귀책",
    "특이사항",
    "업무구분",
    "업무",
]

REVIEW_HINTS = ("보류", "확인", "수정", "재검토", "중복", "오류", "누락", "미확인", "미입력")


@dataclass
class WorkbookSheet:
    name: str
    path: str
    order: int


@dataclass
class ParsedRow:
    row_no: int
    raw: Dict[str, Any]
    normalized: Dict[str, Any]


@dataclass
class GroupDetail:
    row_order: int
    source_row_no: int
    source_row_id: Optional[str]
    transport_id: str
    transport_seq: str
    car_seq: str
    region: str
    weight_text: str
    destination_text: str
    judgement: str
    fare_label: str
    allowance_label: str
    note: str


@dataclass
class GroupRow:
    row_order: int
    driver_label: str
    vehicle_label: str
    trip_count: int
    origin: str
    destination: str
    business_office: str
    vehicle_ton_class: str
    route_order: str
    auto_status: str
    standard_fare: int
    transport_fare: int
    fuel_fare: int
    round_trip_fare: int
    customer_allowance: int
    etc_allowance: int
    holiday_fare: int
    morning_drop_allowance: int
    memo: str
    raw_row_count: int
    manual_review_count: int
    meta: Dict[str, Any]
    details: List[GroupDetail]


def col_to_idx(cell_ref: str) -> int:
    letters = "".join(re.findall(r"[A-Z]+", cell_ref))
    n = 0
    for ch in letters:
        n = n * 26 + ord(ch) - 64
    return n


def load_shared_strings(zf: zipfile.ZipFile) -> List[str]:
    try:
        root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    except KeyError:
        return []
    shared: List[str] = []
    for si in root.findall("a:si", NS):
        texts = [t.text or "" for t in si.findall(".//a:t", NS)]
        shared.append("".join(texts))
    return shared


def cell_value(cell: ET.Element, shared: List[str]) -> Optional[str]:
    cell_type = cell.attrib.get("t")
    value_node = cell.find("a:v", NS)

    if cell_type == "inlineStr":
        return "".join([t.text or "" for t in cell.findall(".//a:t", NS)])
    if value_node is None:
        return None

    raw = value_node.text or ""
    if cell_type == "s":
        try:
            return shared[int(raw)]
        except Exception:
            return raw
    return raw


def excel_serial_to_date(value: str) -> Optional[str]:
    try:
        serial = float(value)
    except Exception:
        return None

    # Excel date serial range; keep non-dates untouched.
    if not (20000 < serial < 70000):
        return None

    base = dt.datetime(1899, 12, 30)
    return (base + dt.timedelta(days=serial)).date().isoformat()


def normalize_date(value: Any) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None

    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", text):
        return text

    compact = text.replace(".", "-").replace("/", "-")
    if re.fullmatch(r"\d{4}-\d{1,2}-\d{1,2}", compact):
        year, month, day = compact.split("-")
        return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"

    if re.fullmatch(r"\d{8}", text):
        return f"{text[:4]}-{text[4:6]}-{text[6:8]}"

    if re.fullmatch(r"\d+(?:\.0+)?", text):
        serial_date = excel_serial_to_date(text)
        if serial_date:
            return serial_date

    match = re.search(r"(\d{4})[년\-/\. ](\d{1,2})[월\-/\. ](\d{1,2})", text)
    if match:
        return f"{int(match.group(1)):04d}-{int(match.group(2)):02d}-{int(match.group(3)):02d}"

    return None


def as_int(value: Any) -> Optional[int]:
    if value is None:
        return None
    text = str(value).strip()
    if text == "":
        return None
    text = text.replace(",", "")
    if not re.fullmatch(r"-?\d+", text):
        return None
    return int(text)


def as_money(value: Any) -> Optional[int]:
    if value is None:
        return None
    text = str(value).strip()
    if text in {"", "-"}:
        return None
    text = text.replace(",", "")
    text = re.sub(r"[^0-9-]", "", text)
    if text in {"", "-"}:
        return None
    try:
        return int(text)
    except Exception:
        return None


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def split_driver(value: Any) -> Dict[str, Optional[str]]:
    text = clean_text(value)
    if not text:
        return {"name": None, "phone": None}

    phone_match = re.search(r"(01[016789])[- ]?(\d{3,4})[- ]?(\d{4})", text)
    if phone_match:
        phone = "".join(phone_match.groups())
        name = text[: phone_match.start()].strip()
        return {"name": name or None, "phone": phone}

    parts = [p for p in re.split(r"\s+", text.replace("\n", " ")) if p]
    return {"name": (parts[0] if parts else text) or None, "phone": None}


def infer_sheet_period(sheet_name: str, rows: Sequence[ParsedRow]) -> Tuple[Optional[int], Optional[int]]:
    match = re.search(r"(\d{4})년.*?(\d{1,2})월", sheet_name)
    if match:
        return int(match.group(1)), int(match.group(2))

    dates = [row.normalized.get("work_date") for row in rows if row.normalized.get("work_date")]
    if dates:
        year, month = str(dates[0]).split("-")[:2]
        return int(year), int(month)
    return None, None


def derive_fallback_grouping_date(sheet_name: str, rows: Sequence[ParsedRow]) -> str:
    dates = sorted({row.normalized.get("work_date") for row in rows if row.normalized.get("work_date")})
    if dates:
        return dates[-1]
    year, month = infer_sheet_period(sheet_name, rows)
    if year and month:
        return f"{year:04d}-{month:02d}-01"
    return dt.date.today().isoformat()


def is_review_row(normalized: Dict[str, Any]) -> bool:
    driver_label = clean_text(normalized.get("driver_label"))
    origin = clean_text(normalized.get("origin"))
    destination = clean_text(normalized.get("destination"))
    work_date = clean_text(normalized.get("work_date"))
    if not driver_label or not origin or not destination or not work_date:
        return True

    for field in (normalized.get("cost_burden"), normalized.get("cost_reason"), normalized.get("memo"), normalized.get("work_type_code"), normalized.get("work_type")):
        text = clean_text(field)
        if any(hint in text for hint in REVIEW_HINTS):
            return True
    return False


def build_route_order(rows: Sequence[ParsedRow]) -> str:
    points: List[str] = []
    for row in rows:
        origin = clean_text(row.normalized.get("origin"))
        destination = clean_text(row.normalized.get("destination"))
        if origin:
            points.append(origin)
        if destination:
            points.append(destination)
    deduped: List[str] = []
    for point in points:
        if not deduped or deduped[-1] != point:
            deduped.append(point)
    return " → ".join(deduped)


def build_group_key(row: ParsedRow) -> str:
    normalized = row.normalized
    parts = [
        clean_text(normalized.get("work_date")),
        clean_text(normalized.get("driver_label")),
    ]
    return "|".join(parts)


def build_detail(row: ParsedRow, row_order: int, work_date: str) -> GroupDetail:
    normalized = row.normalized
    source_row_no = row.row_no
    amount_in = normalized.get("cherry_charge_amount")
    amount_out = normalized.get("driver_pay_amount")
    amount_in_text = f"{amount_in:,}" if isinstance(amount_in, int) else "0"
    amount_out_text = f"{amount_out:,}" if isinstance(amount_out, int) else "0"
    review = is_review_row(normalized)
    judgement = "검토필요" if review else "정상"

    return GroupDetail(
        row_order=row_order,
        source_row_no=source_row_no,
        source_row_id=None,
        transport_id=f"CHERRY-{work_date}-{source_row_no:04d}",
        transport_seq=str(normalized.get("daily_seq") or row_order),
        car_seq=str(normalized.get("daily_seq") or row_order),
        region=clean_text(normalized.get("origin")) or clean_text(normalized.get("affiliation")) or "",
        weight_text=clean_text(normalized.get("vehicle_ton_class")) or "-",
        destination_text=clean_text(normalized.get("destination")) or "",
        judgement=judgement,
        fare_label=f"청구 {amount_in_text} / 지급 {amount_out_text}",
        allowance_label=" / ".join(
            part for part in [clean_text(normalized.get("cost_burden")), clean_text(normalized.get("cost_reason"))] if part
        ) or "-",
        note=clean_text(normalized.get("memo")) or "",
    )


def group_rows_by_date(rows: Sequence[ParsedRow], fallback_date: str) -> Dict[str, List[ParsedRow]]:
    buckets: Dict[str, List[ParsedRow]] = defaultdict(list)
    for row in rows:
        work_date = clean_text(row.normalized.get("work_date")) or fallback_date
        row.normalized["work_date"] = work_date
        buckets[work_date].append(row)
    return dict(sorted(buckets.items(), key=lambda item: item[0]))


def build_group_rows(rows_for_date: Sequence[ParsedRow], work_date: str) -> List[GroupRow]:
    grouped: Dict[str, List[ParsedRow]] = defaultdict(list)
    for row in rows_for_date:
        grouped[build_group_key(row)].append(row)

    group_rows: List[GroupRow] = []
    for index, (group_key, members) in enumerate(sorted(grouped.items(), key=lambda item: min(item[1], key=lambda r: r.row_no).row_no), start=1):
        members_sorted = sorted(members, key=lambda row: (as_int(row.normalized.get("daily_seq")) or 0, row.row_no))
        normalized_first = members_sorted[0].normalized
        review_count = sum(1 for row in members_sorted if is_review_row(row.normalized))
        standard_fare = sum(int(row.normalized.get("cherry_charge_amount") or 0) for row in members_sorted)
        transport_fare = sum(int(row.normalized.get("driver_pay_amount") or 0) for row in members_sorted)
        memo = next((clean_text(row.normalized.get("memo")) for row in members_sorted if clean_text(row.normalized.get("memo"))), "")
        row_details: List[GroupDetail] = []
        for detail_index, member in enumerate(members_sorted, start=1):
            detail = build_detail(member, detail_index, work_date)
            row_details.append(detail)

        group_rows.append(
            GroupRow(
                row_order=index,
                driver_label=clean_text(normalized_first.get("driver_label")) or clean_text(normalized_first.get("internal_driver_name")) or clean_text(normalized_first.get("external_driver_name")) or "미확인",
                vehicle_label=clean_text(normalized_first.get("vehicle_label")),
                trip_count=len(members_sorted),
                origin=clean_text(normalized_first.get("origin")) or "",
                destination=clean_text(members_sorted[-1].normalized.get("destination")) or clean_text(normalized_first.get("destination")) or "",
                business_office=clean_text(normalized_first.get("affiliation")),
                vehicle_ton_class=clean_text(normalized_first.get("vehicle_ton_class")),
                route_order=build_route_order(members_sorted),
                auto_status="검토필요" if review_count > 0 else "자동완료",
                standard_fare=standard_fare,
                transport_fare=transport_fare,
                fuel_fare=0,
                round_trip_fare=0,
                customer_allowance=0,
                etc_allowance=0,
                holiday_fare=0,
                morning_drop_allowance=0,
                memo=memo,
                raw_row_count=len(members_sorted),
                manual_review_count=review_count,
                meta={
                    "group_key": group_key,
                    "work_date": work_date,
                    "source_row_nos": [row.row_no for row in members_sorted],
                    "driver_names": sorted({clean_text(row.normalized.get("driver_label")) for row in members_sorted if clean_text(row.normalized.get("driver_label"))}),
                    "vehicle_ton_classes": sorted({clean_text(row.normalized.get("vehicle_ton_class")) for row in members_sorted if clean_text(row.normalized.get("vehicle_ton_class"))}),
                },
                details=row_details,
            )
        )

    return group_rows


def load_workbook_sheet_names(zf: zipfile.ZipFile) -> List[WorkbookSheet]:
    workbook = ET.fromstring(zf.read("xl/workbook.xml"))
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    rid_to_target = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels.findall("rel:Relationship", NS)}
    sheets: List[WorkbookSheet] = []
    for index, sheet in enumerate(workbook.find("a:sheets", NS), start=1):
        rid = sheet.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
        target = rid_to_target.get(rid, "")
        if not target.startswith("/"):
            target = "xl/" + target
        target = target.replace("xl//", "xl/")
        sheets.append(WorkbookSheet(name=sheet.attrib["name"], path=target, order=index))
    return sheets


def find_sheet(sheets: Sequence[WorkbookSheet], needle: str) -> WorkbookSheet:
    for sheet in sheets:
        if needle in sheet.name:
            return sheet
    available = ", ".join(sheet.name for sheet in sheets[:12])
    raise SystemExit(f"sheet not found: {needle}\navailable: {available}")


def parse_sheet_rows(zf: zipfile.ZipFile, sheet_path: str, shared: Sequence[str]) -> Dict[str, Any]:
    root = ET.fromstring(zf.read(sheet_path))
    sheet_data = root.find("a:sheetData", NS)
    if sheet_data is None:
        return {"headers": [], "rows": []}

    headers: List[str] = []
    rows: List[ParsedRow] = []

    for row in sheet_data.findall("a:row", NS):
        row_no = int(float(row.attrib.get("r", "0")))
        values: Dict[int, Any] = {}
        for cell in row.findall("a:c", NS):
            idx = col_to_idx(cell.attrib.get("r", ""))
            value = cell_value(cell, shared)
            if value is not None and str(value).strip() != "":
                values[idx] = value

        ordered = [values.get(i) for i in range(1, max(values.keys(), default=0) + 1)]
        while ordered and ordered[-1] is None:
            ordered.pop()

        if row_no == 2:
            headers = [str(v) if v is not None else "" for v in ordered]
            continue

        if row_no < 3 or not any(v is not None and str(v).strip() != "" for v in ordered):
            continue

        row_map = {headers[i]: ordered[i] if i < len(ordered) else None for i in range(min(len(headers), len(ordered)))}
        rows.append(ParsedRow(row_no=row_no, raw=row_map, normalized=normalize_row(row_map)))

    return {"headers": headers, "rows": rows}


def normalize_row(row: Dict[str, Any]) -> Dict[str, Any]:
    date_raw = row.get("날짜")
    date_value = normalize_date(date_raw)

    internal_driver = split_driver(row.get("내부배송기사"))
    external_driver = split_driver(row.get("외부배송기사"))
    driver_label = internal_driver["name"] or external_driver["name"]
    vehicle_label = clean_text(row.get("소속"))

    normalized = {
        "work_date": date_value,
        "daily_seq": as_int(row.get("일별횟수")),
        "origin": clean_text(row.get("발지")),
        "destination": clean_text(row.get("착지")),
        "destination_count": as_int(row.get("착지수")),
        "vehicle_ton_class": clean_text(row.get("톤")),
        "cherry_charge_amount": as_money(row.get("체리청구비용")),
        "driver_pay_amount": as_money(row.get("기사지급비용")),
        "affiliation": clean_text(row.get("소속")),
        "external_driver_name": external_driver["name"],
        "external_driver_phone": external_driver["phone"],
        "internal_driver_name": internal_driver["name"],
        "internal_driver_phone": internal_driver["phone"],
        "cost_burden": clean_text(row.get("비용부담")),
        "cost_reason": clean_text(row.get("비용귀책")),
        "memo": clean_text(row.get("특이사항")),
        "work_type_code": clean_text(row.get("업무구분")),
        "work_type": clean_text(row.get("업무")),
        "driver_label": driver_label,
        "vehicle_label": vehicle_label,
    }
    normalized["grouping_key"] = " | ".join(
        [
            str(normalized.get("work_date") or ""),
            str(normalized.get("driver_label") or ""),
            str(normalized.get("origin") or ""),
            str(normalized.get("destination") or ""),
            str(normalized.get("vehicle_ton_class") or ""),
        ]
    ).strip(" |")
    return normalized


class SupabaseClient:
    def __init__(self, url: str, key: str):
        self.url = url.rstrip("/")
        self.key = key

    def request(self, method: str, path: str, *, params: Optional[Dict[str, str]] = None, json_body: Optional[Any] = None, prefer: Optional[str] = None) -> Any:
        full_url = f"{self.url}{path}"
        if params:
            full_url = f"{full_url}?{urllib.parse.urlencode(params)}"
        headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Accept": "application/json",
        }
        if json_body is not None:
            headers["Content-Type"] = "application/json"
        if prefer:
            headers["Prefer"] = prefer

        data = None if json_body is None else json.dumps(json_body, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(full_url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read().decode("utf-8")
                if not raw:
                    return None
                return json.loads(raw)
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Supabase {method} {path} failed ({exc.code}): {body}") from exc

    def select(self, table: str, params: Dict[str, str]) -> List[Dict[str, Any]]:
        return self.request("GET", f"/rest/v1/{table}", params=params) or []

    def insert(self, table: str, rows: Sequence[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not rows:
            return []
        result = self.request("POST", f"/rest/v1/{table}", json_body=list(rows), prefer="return=representation")
        return result or []

    def delete(self, table: str, params: Dict[str, str]) -> None:
        self.request("DELETE", f"/rest/v1/{table}", params=params, prefer="return=minimal")


def chunked(items: Sequence[Any], size: int) -> Iterable[Sequence[Any]]:
    for start in range(0, len(items), size):
        yield items[start : start + size]


def get_supabase_config() -> Tuple[str, str]:
    supabase_url = os.environ.get("SUPABASE_URL", "").strip() or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    supabase_key = (
        os.environ.get("SUPABASE_SERVICE_KEY", "").strip()
        or os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
        or os.environ.get("NEXT_PUBLIC_SUPABASE_KEY", "").strip()
    )
    return supabase_url, supabase_key


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        while True:
            chunk = handle.read(1024 * 1024)
            if not chunk:
                break
            digest.update(chunk)
    return digest.hexdigest()


def build_raw_rows_payload(sheet: WorkbookSheet, parsed_rows: Sequence[ParsedRow], source_file_id: str, source_file_size: int, file_sha256: str, source_year: Optional[int], source_month: Optional[int]) -> List[Dict[str, Any]]:
    payload: List[Dict[str, Any]] = []
    for row in parsed_rows:
        normalized = row.normalized
        payload.append(
            {
                "file_id": source_file_id,
                "sheet_name": sheet.name,
                "sheet_order": sheet.order,
                "source_row_no": row.row_no,
                "source_col_count": len(TARGET_HEADERS),
                "source_row_type": "data",
                "work_date": normalized.get("work_date"),
                "daily_seq": normalized.get("daily_seq"),
                "origin": normalized.get("origin"),
                "destination": normalized.get("destination"),
                "destination_count": normalized.get("destination_count"),
                "vehicle_ton_class": normalized.get("vehicle_ton_class"),
                "cherry_charge_amount": normalized.get("cherry_charge_amount"),
                "driver_pay_amount": normalized.get("driver_pay_amount"),
                "affiliation": normalized.get("affiliation"),
                "external_driver_name": normalized.get("external_driver_name"),
                "external_driver_phone": normalized.get("external_driver_phone"),
                "internal_driver_name": normalized.get("internal_driver_name"),
                "internal_driver_phone": normalized.get("internal_driver_phone"),
                "cost_burden": normalized.get("cost_burden"),
                "cost_reason": normalized.get("cost_reason"),
                "memo": normalized.get("memo"),
                "work_type_code": normalized.get("work_type_code"),
                "work_type": normalized.get("work_type"),
                "grouping_key": normalized.get("grouping_key"),
                "normalize_status": "review" if is_review_row(normalized) else "normalized",
                "raw_json": row.raw,
                "meta": {
                    "driver_label": normalized.get("driver_label"),
                    "vehicle_label": normalized.get("vehicle_label"),
                    "file_sha256": file_sha256,
                    "source_file_size": source_file_size,
                    "source_year": source_year,
                    "source_month": source_month,
                },
            }
        )
    return payload


def main() -> int:
    parser = argparse.ArgumentParser(description="Import the Cherrybro 용차 Excel bundle into Supabase.")
    parser.add_argument("xlsx_path", help="Path to the uploaded .xlsx file")
    parser.add_argument("--sheet", default="2026년 체리부로 용차현황 1월", help="Sheet name substring to import")
    parser.add_argument("--scope", default="grouping", choices=["grouping", "settlement", "archive"], help="Import scope for file record")
    parser.add_argument("--apply", action="store_true", help="Write to Supabase (default is dry-run)")
    parser.add_argument("--no-replace-existing", action="store_true", help="Do not delete an existing same-hash import before inserting")
    parser.add_argument("--grouping-date", default="", help="Force a single grouping date instead of grouping by work_date")
    parser.add_argument("--limit-rows", type=int, default=0, help="Limit raw rows for debugging")
    parser.add_argument("--json", action="store_true", help="Emit JSON summary only")
    args = parser.parse_args()

    xlsx_path = Path(args.xlsx_path).expanduser().resolve()
    if not xlsx_path.exists():
        print(f"xlsx not found: {xlsx_path}", file=sys.stderr)
        return 2

    file_sha256 = sha256_file(xlsx_path)
    source_file_size = xlsx_path.stat().st_size

    with zipfile.ZipFile(xlsx_path) as zf:
        shared = load_shared_strings(zf)
        sheets = load_workbook_sheet_names(zf)
        target_sheet = find_sheet(sheets, args.sheet)
        parsed = parse_sheet_rows(zf, target_sheet.path, shared)

    parsed_rows: List[ParsedRow] = parsed["rows"]
    if args.limit_rows and args.limit_rows > 0:
        parsed_rows = parsed_rows[: args.limit_rows]

    source_year, source_month = infer_sheet_period(target_sheet.name, parsed_rows)
    fallback_grouping_date = args.grouping_date.strip() or derive_fallback_grouping_date(target_sheet.name, parsed_rows)

    # Normalize all rows with a guaranteed grouping date.
    for row in parsed_rows:
        if not clean_text(row.normalized.get("work_date")):
            row.normalized["work_date"] = fallback_grouping_date

    grouped_by_date = {fallback_grouping_date: parsed_rows} if args.grouping_date.strip() else group_rows_by_date(parsed_rows, fallback_grouping_date)
    grouping_plan: List[Dict[str, Any]] = []
    for work_date, rows_for_date in grouped_by_date.items():
        group_rows = build_group_rows(rows_for_date, work_date)
        grouping_plan.append(
            {
                "grouping_date": work_date,
                "source_row_count": len(rows_for_date),
                "candidate_count": len(group_rows),
                "manual_review_count": sum(group.manual_review_count for group in group_rows),
                "group_rows": group_rows,
            }
        )

    summary = {
        "file": xlsx_path.name,
        "file_sha256": file_sha256,
        "sheet_name": target_sheet.name,
        "headers": parsed["headers"],
        "row_count": len(parsed_rows),
        "source_year": source_year,
        "source_month": source_month,
        "grouping_dates": [item["grouping_date"] for item in grouping_plan],
        "apply": args.apply,
        "scope": args.scope,
    }

    if not args.apply:
        summary["dry_run"] = True
        summary["planned_grouping_runs"] = len(grouping_plan)
        summary["planned_grouping_rows"] = sum(item["candidate_count"] for item in grouping_plan)
        summary["planned_grouping_details"] = sum(group.raw_row_count for item in grouping_plan for group in item["group_rows"])
        if args.json:
            print(json.dumps(summary, ensure_ascii=False, indent=2))
        else:
            print(json.dumps(summary, ensure_ascii=False, indent=2))
        return 0

    supabase_url, supabase_key = get_supabase_config()
    if not supabase_url or not supabase_key:
        print("missing SUPABASE_URL / SUPABASE_SERVICE_KEY", file=sys.stderr)
        return 2

    client = SupabaseClient(supabase_url, supabase_key)

    if not args.no_replace_existing:
        existing = client.select(
            "tbl_tms_cherrybro_excel_files",
            {
                "select": "id,source_file_name,source_file_sha256",
                "source_file_sha256": f"eq.{file_sha256}",
                "limit": "1",
            },
        )
        if existing:
            existing_id = existing[0]["id"]
            client.delete("tbl_tms_cherrybro_excel_files", {"id": f"eq.{existing_id}"})

    file_rows = client.insert(
        "tbl_tms_cherrybro_excel_files",
        [
            {
                "source_file_name": xlsx_path.name,
                "source_file_size": source_file_size,
                "source_file_sha256": file_sha256,
                "import_scope": args.scope,
                "source_year": source_year,
                "source_month": source_month,
                "sheet_count": len(sheets),
                "row_count": len(parsed_rows),
                "import_status": "parsed",
                "source_note": target_sheet.name,
                "meta": {
                    "sheet_name": target_sheet.name,
                    "sheet_order": target_sheet.order,
                    "headers": parsed["headers"],
                    "file_sha256": file_sha256,
                },
            }
        ],
    )
    if not file_rows:
        raise RuntimeError("file insert returned no rows")
    file_id = file_rows[0]["id"]

    raw_rows_payload = build_raw_rows_payload(target_sheet, parsed_rows, file_id, source_file_size, file_sha256, source_year, source_month)
    raw_row_ids: List[str] = []
    for batch in chunked(raw_rows_payload, 200):
        inserted = client.insert("tbl_tms_cherrybro_excel_rows", batch)
        raw_row_ids.extend([item["id"] for item in inserted])

    raw_row_lookup = {payload["source_row_no"]: raw_id for payload, raw_id in zip(raw_rows_payload, raw_row_ids)}

    grouping_runs_inserted: List[Dict[str, Any]] = []
    total_group_rows = 0
    total_group_details = 0

    for plan in grouping_plan:
        grouping_date = plan["grouping_date"]
        group_rows: List[GroupRow] = plan["group_rows"]

        run_rows = client.insert(
            "tbl_tms_cherrybro_grouping_runs",
            [
                {
                    "file_id": file_id,
                    "grouping_date": grouping_date,
                    "run_status": "review" if plan["manual_review_count"] > 0 else "draft",
                    "source_row_count": plan["source_row_count"],
                    "candidate_count": plan["candidate_count"],
                    "manual_review_count": plan["manual_review_count"],
                    "note": target_sheet.name,
                    "meta": {
                        "source_file_name": xlsx_path.name,
                        "file_sha256": file_sha256,
                        "grouping_date": grouping_date,
                    },
                }
            ],
        )
        if not run_rows:
            raise RuntimeError(f"grouping run insert returned no rows for {grouping_date}")
        run_id = run_rows[0]["id"]
        grouping_runs_inserted.append({"grouping_date": grouping_date, "id": run_id})

        group_row_payload: List[Dict[str, Any]] = []
        for group in group_rows:
            group_row_payload.append(
                {
                    "run_id": run_id,
                    "row_order": group.row_order,
                    "driver_label": group.driver_label,
                    "vehicle_label": group.vehicle_label,
                    "trip_count": group.trip_count,
                    "origin": group.origin,
                    "destination": group.destination,
                    "business_office": group.business_office,
                    "vehicle_ton_class": group.vehicle_ton_class,
                    "route_order": group.route_order,
                    "auto_status": group.auto_status,
                    "standard_fare": group.standard_fare,
                    "transport_fare": group.transport_fare,
                    "fuel_fare": group.fuel_fare,
                    "round_trip_fare": group.round_trip_fare,
                    "customer_allowance": group.customer_allowance,
                    "etc_allowance": group.etc_allowance,
                    "holiday_fare": group.holiday_fare,
                    "morning_drop_allowance": group.morning_drop_allowance,
                    "memo": group.memo,
                    "raw_row_count": group.raw_row_count,
                    "manual_review_count": group.manual_review_count,
                    "meta": group.meta,
                }
            )
        inserted_group_rows: List[Dict[str, Any]] = []
        for batch in chunked(group_row_payload, 200):
            inserted_group_rows.extend(client.insert("tbl_tms_cherrybro_grouping_rows", batch))
        total_group_rows += len(inserted_group_rows)

        grouping_row_id_by_order = {int(item["row_order"]): item["id"] for item in inserted_group_rows}

        detail_payload: List[Dict[str, Any]] = []
        for group in group_rows:
            grouping_row_id = grouping_row_id_by_order[group.row_order]
            for detail in group.details:
                source_row_id = raw_row_lookup.get(detail.source_row_no)
                detail_payload.append(
                    {
                        "grouping_row_id": grouping_row_id,
                        "row_order": detail.row_order,
                        "source_row_id": source_row_id,
                        "transport_id": detail.transport_id,
                        "transport_seq": detail.transport_seq,
                        "car_seq": detail.car_seq,
                        "region": detail.region,
                        "weight_text": detail.weight_text,
                        "destination_text": detail.destination_text,
                        "judgement": detail.judgement,
                        "fare_label": detail.fare_label,
                        "allowance_label": detail.allowance_label,
                        "note": detail.note,
                        "meta": {
                            "grouping_date": grouping_date,
                            "source_row_no": detail.source_row_no,
                        },
                    }
                )
        for batch in chunked(detail_payload, 200):
            client.insert("tbl_tms_cherrybro_grouping_row_details", batch)
        total_group_details += len(detail_payload)

    client.request(
        "PATCH",
        "/rest/v1/tbl_tms_cherrybro_excel_files",
        params={"id": f"eq.{file_id}"},
        json_body={"import_status": "normalized", "row_count": len(parsed_rows)},
        prefer="return=minimal",
    )

    summary.update(
        {
            "dry_run": False,
            "file_id": file_id,
            "inserted_raw_rows": len(raw_row_ids),
            "inserted_grouping_runs": len(grouping_runs_inserted),
            "inserted_grouping_rows": total_group_rows,
            "inserted_grouping_details": total_group_details,
        }
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
