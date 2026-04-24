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

export function GroupingTable({ rows }: GroupingTableProps) {
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
                    <span>{row.startRegion}</span>
                    <span className="mx-1 text-slate-600">→</span>
                    <span>{row.endRegion}</span>
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
                        <div className="text-right text-[#9ab6ff]">묶음 조건</div>
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
                  <div className="px-3 py-2 text-slate-300">{row.routeOrder}</div>
                  <div className={`${compactCellClass} text-right`}>
                    <SaveButton label="묶음저장" />
                  </div>
                </summary>

                <div className="cherry-light-detail-panel border-t border-[#162131] bg-[#07101b]">
                  {row.details.map((detail) => {
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
                          <div className="truncate text-slate-200">{detail.region} → {detail.destination}</div>
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
