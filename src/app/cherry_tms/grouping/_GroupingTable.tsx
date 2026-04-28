import { useEffect, useMemo, useState } from 'react';

type GroupingPriceVariables = {
  standardFare: string;
  g70TransportFare: string;
  i70FuelFare: string;
  m70RoundTrip: string;
  q70CustomerAllowance: string;
  t70EtcAllowance: string;
  o70HolidayFare: string;
  s70MorningDrop: string;
};

type GroupingDetailRow = {
  order: string;
  transportId: string;
  transportSeq: string;
  carSeq: string;
  region: string;
  weight: string;
  destination: string;
  judgement: string;
};

type GroupingRow = {
  driver: string;
  vehicle: string;
  trips: string;
  startRegion: string;
  endRegion: string;
  businessOffice: string;
  totalWeight: string;
  routeOrder: string;
  autoStatus: string;
  prices: GroupingPriceVariables;
  details: GroupingDetailRow[];
};

type GroupingTableProps = {
  rows: GroupingRow[];
};

type PriceItem = {
  label: string;
  value: string;
  tone?: 'fare' | 'sourceAllowance' | 'groupAllowance';
  editable?: boolean;
};

const columns = ['DB row', '기사/차량', '건수', '출발/도착', '영업소', '중량', '운임요약', '조건/수당', '경로', '저장'];
const gridClass = 'grid min-w-[1220px] grid-cols-[76px_170px_70px_148px_130px_76px_170px_180px_1fr_96px]';
const compactCellClass = 'px-3 py-2 whitespace-nowrap';
const detailCellClass = 'px-2 py-0.5 whitespace-nowrap align-top';

type RouteOption = {
  label: string;
  value: string;
  region: string;
  keywords: string[];
};

const routeOptions: RouteOption[] = [
  { label: '대전 / 대전 물류센터', value: '대전 물류센터', region: '대전', keywords: ['대전', '대전 물류센터', '물류센터', '대전센터'] },
  { label: '대전 / 대전 서구', value: '대전 서구', region: '대전', keywords: ['대전', '서구', '대전 서구'] },
  { label: '대전 / 대전 동구', value: '대전 동구', region: '대전', keywords: ['대전', '동구', '대전 동구'] },
  { label: '세종 / 세종 전의', value: '세종 전의', region: '세종', keywords: ['세종', '전의', '세종 전의'] },
  { label: '충북 / 진천 산수', value: '진천 산수', region: '진천', keywords: ['충북', '진천', '산수', '진천 산수'] },
  { label: '청주 / 오창 산업단지', value: '청주 오창', region: '청주', keywords: ['청주', '오창', '산업단지', '청주 오창'] },
  { label: '천안 / 서북 물류지점', value: '천안 서북', region: '천안', keywords: ['천안', '서북', '천안 서북'] },
  { label: '수원 / 수원 장안', value: '수원 장안', region: '수원', keywords: ['경기', '수원', '장안', '수원 장안'] },
  { label: '수원 / 수원 권선', value: '수원 권선', region: '수원', keywords: ['경기', '수원', '권선', '수원 권선'] },
  { label: '서울 강서 / 강서 물류센터', value: '서울 강서', region: '서울', keywords: ['서울', '강서', '서울 강서', '강서 물류센터'] },
  { label: '서울 양천 / 양천 거래처', value: '서울 양천', region: '서울', keywords: ['서울', '양천', '양천 거래처', '양천'] },
  { label: '경기 광명 / 광명 하안', value: '광명 하안', region: '광명', keywords: ['경기', '광명', '하안', '광명 하안'] },
  { label: '경기 광명 / 광명 소하', value: '광명 소하', region: '광명', keywords: ['경기', '광명', '소하', '광명 소하'] },
  { label: '경기 부천 / 부천 소사', value: '부천 소사', region: '부천', keywords: ['경기', '부천', '소사', '부천 소사'] },
  { label: '경기 시흥 / 시흥 정왕', value: '시흥 정왕', region: '시흥', keywords: ['경기', '시흥', '정왕', '시흥 정왕'] },
  { label: '경기 안산 / 안산 단원', value: '안산 단원', region: '안산', keywords: ['경기', '안산', '단원', '안산 단원'] },
  { label: '경기 화성 / 화성 향남', value: '화성 향남', region: '화성', keywords: ['경기', '화성', '향남', '화성 향남'] },
  { label: '경기 화성 / 화성 동탄', value: '화성 동탄', region: '화성', keywords: ['경기', '화성', '동탄', '화성 동탄'] },
  { label: '경기 김포 / 김포 고촌', value: '김포 고촌', region: '김포', keywords: ['경기', '김포', '고촌', '김포 고촌'] },
  { label: '경기 용인 / 용인 남사', value: '용인 남사', region: '용인', keywords: ['경기', '용인', '남사', '용인 남사'] },
  { label: '경기 오산 / 오산 세교', value: '오산 세교', region: '오산', keywords: ['경기', '오산', '세교', '오산 세교'] },
  { label: '경기 평택 / 평택 고덕', value: '평택 고덕', region: '평택', keywords: ['경기', '평택', '고덕', '평택 고덕'] },
  { label: '경기 평택 / 평택 포승', value: '평택 포승', region: '평택', keywords: ['경기', '평택', '포승', '평택 포승'] },
  { label: '인천 남동 / 남동 공단', value: '인천 남동', region: '인천', keywords: ['인천', '남동', '남동 공단', '인천 남동'] },
  { label: '울산 / 울산 온산', value: '울산 온산', region: '울산', keywords: ['울산', '온산', '울산 온산'] },
  { label: '울산 / 울산 삼산', value: '울산 삼산', region: '울산', keywords: ['울산', '삼산', '울산 삼산'] },
  { label: '부산 / 부산 강서 물류센터', value: '부산 강서', region: '부산', keywords: ['부산', '강서', '부산 강서', '부산 강서 물류센터'] },
  { label: '부산 / 부산 사상', value: '부산 사상', region: '부산', keywords: ['부산', '사상', '부산 사상'] },
];

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function filterRouteOptions(query: string) {
  const normalized = normalizeQuery(query);
  if (!normalized) return routeOptions;
  return routeOptions.filter((option) => [option.label, option.value, option.region, ...option.keywords].some((item) => item.toLowerCase().includes(normalized)));
}

function getRouteRegion(value: string) {
  const normalized = normalizeQuery(value);
  const option = routeOptions.find((item) => normalizeQuery(item.value) === normalized || normalizeQuery(item.label) === normalized);
  if (option) return option.region;
  const matched = routeOptions.find((item) => [item.region, item.value, ...item.keywords].some((keyword) => normalized.includes(normalizeQuery(keyword))));
  return matched?.region ?? value.trim() ?? '-';
}

function compactRegions(values: string[]) {
  return values.reduce<string[]>((acc, value) => {
    const region = getRouteRegion(value);
    if (!region || region === '-') return acc;
    if (acc[acc.length - 1] !== region) acc.push(region);
    return acc;
  }, []);
}

function RoutePickerCell({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (next: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filteredOptions = useMemo(() => filterRouteOptions(query), [query]);

  return (
    <div
      className="grid gap-1"
      onClick={(event) => {
        event.stopPropagation();
        setOpen(true);
      }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <span className="text-[10px] uppercase tracking-[0.08em] text-slate-500">{label}</span>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          setOpen(true);
          onChange(next);
        }}
        className="border border-[#314056] bg-[#0a1019] px-2 py-1 text-[11px] text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-[#4D7CFF] focus:bg-[#121e33]"
      />
      {open ? (
        <div className="max-h-32 overflow-auto border border-[#162131] bg-[#07101b]">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={`${label}-${option.value}`}
                type="button"
                className={`flex w-full items-start justify-between gap-2 border-b border-[#101a2a] px-2 py-1 text-left text-[11px] transition last:border-b-0 hover:bg-[#101a2a] ${option.value === value ? 'bg-[#13213a] text-white' : 'text-slate-200'}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setQuery(option.value);
                  setOpen(false);
                  onChange(option.value);
                }}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                <span className="shrink-0 text-[10px] text-slate-500">{option.region}</span>
              </button>
            ))
          ) : (
            <div className="px-2 py-2 text-[11px] text-slate-500">검색 결과 없음</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function parseAmount(value: string) {
  const parsed = Number(value.replace(/,/g, '').replace('%', ''));

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(value: number) {
  return value.toLocaleString('ko-KR');
}

function isZeroValue(value: string) {
  return value === '0' || value === '0%' || value === '-';
}

function getBasePay(prices: GroupingPriceVariables) {
  return parseAmount(prices.g70TransportFare) + parseAmount(prices.i70FuelFare);
}

function getGroupAllowanceItems(prices: GroupingPriceVariables): PriceItem[] {
  const items: PriceItem[] = [
    { label: '왕복', value: prices.m70RoundTrip, tone: 'groupAllowance' },
    { label: '휴일운송비/일요상차', value: prices.o70HolidayFare, tone: 'groupAllowance' },
    { label: '아침하차', value: prices.s70MorningDrop, tone: 'groupAllowance' },
  ];

  return items.filter((item) => !isZeroValue(item.value));
}

function needsManualSourceInput(detail: GroupingDetailRow) {
  return ['병합대상', '경유후보', '순서확인', '정렬검토', '기사확인', '중간지'].includes(detail.judgement);
}

function getSourceFareItems(prices: GroupingPriceVariables, detail: GroupingDetailRow): PriceItem[] {
  const manual = needsManualSourceInput(detail);
  const isFirstSource = detail.order === '1';

  return [
    { label: '표준운임비', value: isFirstSource ? prices.standardFare : '-', tone: 'fare' },
    { label: '운반비', value: isFirstSource ? prices.g70TransportFare : '미입력', tone: 'fare', editable: !isFirstSource },
    { label: '경유비', value: manual ? '미입력' : prices.i70FuelFare, tone: 'fare', editable: manual },
  ];
}

function getSourceAllowanceItems(prices: GroupingPriceVariables, detail: GroupingDetailRow): PriceItem[] {
  const manual = needsManualSourceInput(detail);
  const sourceAllowanceItems: PriceItem[] = [
    { label: '거래처수당', value: prices.q70CustomerAllowance, tone: 'sourceAllowance' },
    { label: '기타수당', value: manual ? '미입력' : prices.t70EtcAllowance, tone: 'sourceAllowance', editable: manual },
  ];

  return sourceAllowanceItems.map((item) => ({
    ...item,
    value: isZeroValue(item.value) ? '-' : item.value,
  }));
}

function AmountInput({ item }: { item: PriceItem }) {
  const isEmpty = item.value === '-' || item.value === '미입력';
  const defaultValue = isEmpty ? '' : item.value;
  const placeholder = item.editable && isEmpty ? '미입력' : isEmpty ? '-' : '';
  const inputClass = item.editable
    ? 'border-[#263244] bg-[#0a1019] text-slate-200 placeholder-shown:border-[#4D7CFF]/50 placeholder-shown:bg-[#14213b] placeholder-shown:text-[#9ab6ff]'
    : isEmpty
      ? 'border-[#2a3443] bg-[#0a1019] text-slate-500'
      : 'border-[#263244] bg-[#0a1019] text-slate-200';

  return (
    <input
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      spellCheck={false}
      className={`w-full rounded-none border px-1 py-[1px] text-right tabular-nums outline-none transition placeholder:text-slate-600 focus:border-[#4D7CFF] ${inputClass}`}
    />
  );
}

function PriceStack({ items }: { items: PriceItem[] }) {
  return (
    <div className="grid gap-0.5 text-[10px] leading-none">
      {items.map((item) => (
        <label key={item.label} className="grid grid-cols-[minmax(0,1fr)_88px] items-center gap-1.5">
          <span className="min-w-0 truncate text-slate-500">{item.label}</span>
          <AmountInput item={item} />
        </label>
      ))}
    </div>
  );
}

function SaveButton({ label = '저장' }: { label?: string }) {
  return (
    <button type="button" className="cherry-light-badge border border-[#314056] bg-[#0a1019] px-2 py-0.5 text-[10px] text-slate-200 transition hover:border-[#4D7CFF] hover:text-white">
      {label}
    </button>
  );
}

type DetailRouteDraft = {
  origin: string;
  destination: string;
};

export function GroupingTable({ rows }: GroupingTableProps) {
  const [routeDrafts, setRouteDrafts] = useState<Record<string, Record<string, DetailRouteDraft>>>({});

  useEffect(() => {
    setRouteDrafts(
      Object.fromEntries(
        rows.map((row) => [
          `${row.driver}-${row.vehicle}`,
          Object.fromEntries(
            row.details.map((detail) => [
              `${detail.order}-${detail.transportSeq}-${detail.carSeq}`,
              {
                origin: '',
                destination: '',
              },
            ]),
          ),
        ]),
      ),
    );
  }, [rows]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1220px] text-left text-xs">
        <div className={`${gridClass} cherry-light-table-head bg-[#111a27] text-[11px] text-slate-400`}>
          {columns.map((head) => (
            <div key={head} className="border-b border-[#243041] px-3 py-2 font-medium whitespace-nowrap">
              {head}
            </div>
          ))}
        </div>

        <div>
          {rows.map((row) => {
            const rowKey = `${row.driver}-${row.vehicle}`;
            const groupAllowanceItems = getGroupAllowanceItems(row.prices);
            const rowRouteDrafts = routeDrafts[rowKey] ?? {};
            const orderedDestinations = row.details.map((detail) => {
              const detailKey = `${detail.order}-${detail.transportSeq}-${detail.carSeq}`;
              return rowRouteDrafts[detailKey]?.destination ?? detail.destination;
            });
            const groupedRegions = compactRegions(orderedDestinations);
            const summaryStartRegion = groupedRegions[0] ?? getRouteRegion(row.startRegion);
            const summaryEndRegion = groupedRegions[groupedRegions.length - 1] ?? getRouteRegion(row.endRegion);
            const summaryRouteOrder = groupedRegions.length > 0 ? groupedRegions.join(' → ') : row.routeOrder;

            return (
              <details key={rowKey} className="cherry-light-row group border-b border-[#1b2636] bg-[#0b1220] text-slate-200">
                <summary className={`${gridClass} cursor-pointer list-none transition hover:bg-[#101a2a] [&::-webkit-details-marker]:hidden`}>
                  <div className={`${compactCellClass} text-[#9ab6ff]`}>
                    <span className="cherry-light-badge inline-block border border-[#314056] bg-[#0a1019] px-2 py-1 text-[11px] font-medium group-open:hidden">상세</span>
                    <span className="cherry-light-active hidden border border-[#4D7CFF] bg-[#13213a] px-2 py-1 text-[11px] font-medium group-open:inline-block">접기</span>
                  </div>
                  <div className={`${compactCellClass} text-white`}>
                    <div className="font-semibold">{row.driver}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">{row.vehicle}</div>
                  </div>
                  <div className={`${compactCellClass} text-slate-300`}>{row.trips}</div>
                  <div className={`${compactCellClass} text-slate-300`}>
                    <div className="grid gap-1">
                      <div className="text-[10px] uppercase tracking-[0.08em] text-slate-500">묶음 결과</div>
                      <div className="border border-[#243041] bg-[#07101b] px-2 py-1 text-[11px] font-semibold text-slate-100">
                        {summaryStartRegion} → {summaryEndRegion}
                      </div>
                      <div className="text-[10px] text-slate-500">원천 지역 기준 / 수정불가</div>
                    </div>
                  </div>
                  <div className={`${compactCellClass} text-slate-300`}>{row.businessOffice}</div>
                  <div className={`${compactCellClass} text-slate-300`}>{row.totalWeight}</div>
                  <div className="px-3 py-2 text-right tabular-nums">
                    <div className="text-slate-400">표준 {row.prices.standardFare}</div>
                    <div className="mt-0.5 text-white">지급 {formatAmount(getBasePay(row.prices))}</div>
                  </div>
                  <div className="px-3 py-2">
                    {groupAllowanceItems.length > 0 ? (
                      <div className="grid gap-1 text-[11px]">
                        <div className="text-right text-[#9ab6ff]">지역 {groupedRegions.length.toLocaleString('ko-KR')}개</div>
                        {groupAllowanceItems.map((item) => (
                          <div key={item.label} className="flex justify-between gap-2 text-slate-500">
                            <span className="truncate">{item.label}</span>
                            <span className="tabular-nums text-slate-200">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-right text-slate-600">-</div>
                    )}
                  </div>
                  <div className="px-3 py-2 text-slate-300">{summaryRouteOrder}</div>
                  <div className={`${compactCellClass} text-right`}>
                    <SaveButton label="묶음저장" />
                  </div>
                </summary>

                <div className="cherry-light-detail-panel border-t border-[#162131] bg-[#07101b]">
                  {row.details.map((detail) => {
                    const detailKey = `${detail.order}-${detail.transportSeq}-${detail.carSeq}`;
                    const detailRouteDraft = rowRouteDrafts[detailKey] ?? { origin: '', destination: '' };
                    const fareItems = getSourceFareItems(row.prices, detail);
                    const allowanceItems = getSourceAllowanceItems(row.prices, detail);

                    return (
                      <div key={`${rowKey}-${detail.order}-${detail.region}`} className={`${gridClass} cherry-light-detail-row border-b border-[#101a2a] bg-[#07101b] text-[10px] leading-tight last:border-b-0`}>
                        <div className={`${detailCellClass} text-slate-500`}>
                          <div>원천 {detail.order}</div>
                          <div className="mt-0.5 text-[9px] text-slate-600">seq {detail.transportSeq}/{detail.carSeq}</div>
                        </div>
                        <div className={detailCellClass}>
                          <div className="truncate text-slate-300">{row.driver} / {row.vehicle}</div>
                          <div className="mt-0.5 truncate text-[9px] text-slate-600">{detail.transportId}</div>
                        </div>
                        <div className={`${detailCellClass} text-slate-300`}>1건</div>
                        <div className={detailCellClass}>
                          <div className="grid gap-1">
                            <RoutePickerCell
                              label="원천 출발"
                              value={detailRouteDraft.origin}
                              placeholder="출발 지역/거래처"
                              onChange={(next) => {
                                setRouteDrafts((current) => ({
                                  ...current,
                                  [rowKey]: {
                                    ...(current[rowKey] ?? rowRouteDrafts),
                                    [detailKey]: {
                                      ...detailRouteDraft,
                                      origin: next,
                                    },
                                  },
                                }));
                              }}
                            />
                            <RoutePickerCell
                              label="원천 도착"
                              value={detailRouteDraft.destination}
                              placeholder="도착 지역/거래처"
                              onChange={(next) => {
                                setRouteDrafts((current) => ({
                                  ...current,
                                  [rowKey]: {
                                    ...(current[rowKey] ?? rowRouteDrafts),
                                    [detailKey]: {
                                      ...detailRouteDraft,
                                      destination: next,
                                    },
                                  },
                                }));
                              }}
                            />
                            <div className="text-[9px] text-slate-600">지역: {getRouteRegion(detailRouteDraft.destination)}</div>
                          </div>
                        </div>
                        <div className={`${detailCellClass} truncate text-slate-300`}>{detail.destination.includes('영업소') || detail.destination.includes('아워홈') ? detail.destination : '-'}</div>
                        <div className={`${detailCellClass} text-right tabular-nums text-slate-300`}>{detail.weight}</div>
                        <div className="px-2 py-1">
                          <PriceStack items={fareItems} />
                        </div>
                        <div className="px-2 py-1">
                          <div className="mb-0.5 text-[9px] uppercase tracking-[0.08em] text-slate-600">원천별</div>
                          <PriceStack items={allowanceItems} />
                        </div>
                        <div className={detailCellClass}>
                          <div className="truncate text-slate-300">{detail.judgement} / detail+car 연결</div>
                        </div>
                        <div className={`${detailCellClass} text-right`}>
                          <SaveButton />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}
