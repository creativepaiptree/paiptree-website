'use client';

import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useMemo } from 'react';
import type { DashActionItem, DashAlertItem, DashHouseTile } from '../mock-data';

export interface DashDrillSelection {
  region: string | null;
  farm: string | null;
  houseId: string | null;
  focus: 'environment' | 'operations' | 'events' | null;
}

interface DrillMenuPanelProps {
  houseTiles: DashHouseTile[];
  alerts: DashAlertItem[];
  actions: DashActionItem[];
  selection: DashDrillSelection;
  onChange: (next: DashDrillSelection) => void;
}

type FarmNode = {
  farmName: string;
  region: string;
  houses: DashHouseTile[];
};

const focusOptions: Array<{ key: DashDrillSelection['focus']; label: string }> = [
  { key: 'environment', label: '환경' },
  { key: 'operations', label: '운영' },
  { key: 'events', label: '이벤트' },
];

const parseFarmName = (tile: DashHouseTile) => tile.name.replace(/\sH-\d+$/i, '');

const levelTitleMap = {
  1: 'Level 1 · 권역 선택',
  2: 'Level 2 · 농장 선택',
  3: 'Level 3 · 동 선택',
  4: 'Level 4 · 포커스 선택',
} as const;

const DrillMenuPanel = ({ houseTiles, alerts, actions, selection, onChange }: DrillMenuPanelProps) => {
  const MAX_VISIBLE_ITEMS = 8;
  const regions = useMemo(
    () => Array.from(new Set(houseTiles.map((tile) => tile.region))).sort((a, b) => a.localeCompare(b)),
    [houseTiles]
  );

  const farmNodes = useMemo(() => {
    const map = new Map<string, FarmNode>();
    for (const tile of houseTiles) {
      const farmName = parseFarmName(tile);
      const key = `${tile.region}__${farmName}`;
      const existing = map.get(key);
      if (existing) {
        existing.houses.push(tile);
      } else {
        map.set(key, { farmName, region: tile.region, houses: [tile] });
      }
    }
    return Array.from(map.values());
  }, [houseTiles]);

  const farmsByRegion = useMemo(
    () => farmNodes.filter((node) => node.region === selection.region).sort((a, b) => a.farmName.localeCompare(b.farmName)),
    [farmNodes, selection.region]
  );

  const housesByFarm = useMemo(
    () => farmNodes.find((node) => node.farmName === selection.farm && node.region === selection.region)?.houses ?? [],
    [farmNodes, selection.farm, selection.region]
  );

  const breadcrumb = [
    selection.region ?? '권역',
    selection.farm ?? '농장',
    houseTiles.find((tile) => tile.id === selection.houseId)?.name.split(' ').pop() ?? '동',
    selection.focus === 'environment' ? '환경' : selection.focus === 'operations' ? '운영' : selection.focus === 'events' ? '이벤트' : '컨텍스트',
  ];

  const currentLevel = selection.houseId ? (selection.focus ? 4 : 4) : selection.farm ? 3 : selection.region ? 2 : 1;

  const canGoBack = !!selection.region || !!selection.farm || !!selection.houseId || !!selection.focus;

  const goBack = () => {
    if (selection.focus) {
      onChange({ ...selection, focus: null });
      return;
    }
    if (selection.houseId) {
      onChange({ ...selection, houseId: null, focus: null });
      return;
    }
    if (selection.farm) {
      onChange({ ...selection, farm: null, houseId: null, focus: null });
      return;
    }
    if (selection.region) {
      onChange({ region: null, farm: null, houseId: null, focus: null });
    }
  };

  const listItems = (() => {
    if (!selection.region) {
      return regions.map((region) => ({
        id: `region-${region}`,
        label: region,
        meta: `${farmNodes.filter((node) => node.region === region).length}개 농장`,
        onClick: () => onChange({ region, farm: null, houseId: null, focus: null }),
        active: selection.region === region,
      }));
    }

    if (!selection.farm) {
      return farmsByRegion.map((farm) => ({
        id: `farm-${farm.region}-${farm.farmName}`,
        label: farm.farmName,
        meta: `${farm.houses.length}개 동`,
        onClick: () => onChange({ region: farm.region, farm: farm.farmName, houseId: null, focus: null }),
        active: selection.farm === farm.farmName,
      }));
    }

    if (!selection.houseId) {
      return housesByFarm.map((house) => ({
        id: `house-${house.id}`,
        label: house.name.split(' ').pop() ?? house.name,
        meta: house.status === 'alert' ? '경고' : house.status === 'caution' ? '주의' : '정상',
        onClick: () =>
          onChange({
            region: selection.region,
            farm: selection.farm,
            houseId: house.id,
            focus: null,
          }),
        active: selection.houseId === house.id,
      }));
    }

    return focusOptions.map((focus) => ({
      id: `focus-${focus.key}`,
      label: focus.label,
      meta: '상세 패널 동기화',
      onClick: () =>
        onChange({
          region: selection.region,
          farm: selection.farm,
          houseId: selection.houseId,
          focus: focus.key,
        }),
      active: selection.focus === focus.key,
    }));
  })();

  const visibleItems = listItems.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = Math.max(0, listItems.length - MAX_VISIBLE_ITEMS);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden border border-[#30363d] bg-[#161b22] p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#e6edf3]">드릴 메뉴</h2>
        <button
          type="button"
          onClick={() => onChange({ region: null, farm: null, houseId: null, focus: null })}
          className="inline-flex items-center gap-1 border border-[#30363d] bg-[#0d1117] px-2 py-1 text-[11px] text-[#8b949e] transition-colors hover:text-[#c9d1d9]"
        >
          <RotateCcw className="h-3 w-3" />
          초기화
        </button>
      </div>

      <section className="shrink-0 border border-[#30363d] bg-[#0d1117] p-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b949e]">
            {levelTitleMap[currentLevel]}
          </p>
          <button
            type="button"
            onClick={goBack}
            disabled={!canGoBack}
            className="inline-flex items-center gap-1 border border-[#30363d] bg-[#111826] px-2 py-1 text-[10px] text-[#c9d1d9] disabled:opacity-40"
          >
            <ChevronLeft className="h-3 w-3" />
            뒤로
          </button>
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-auto border border-[#30363d] bg-[#0d1117] p-2 hide-scrollbar">
        <div className="space-y-1">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`flex w-full items-center justify-between border px-2 py-2 text-left text-xs transition-colors ${
                item.active
                  ? 'border-[#1f6feb] bg-[#1f6feb1f] text-[#79c0ff]'
                  : 'border-[#30363d] bg-[#111826] text-[#c9d1d9] hover:border-[#6e7681]'
              }`}
            >
              <span className="truncate">{item.label}</span>
              <span className="ml-2 flex items-center gap-1 text-[10px] text-[#8b949e]">
                {item.meta}
                <ChevronRight className="h-3 w-3" />
              </span>
            </button>
          ))}
          {hiddenCount > 0 ? (
            <div className="border border-dashed border-[#30363d] bg-[#111826] px-2 py-2 text-[10px] text-[#8b949e]">
              +{hiddenCount}개 항목은 포맷 고정 모드에서 숨김 처리됨
            </div>
          ) : null}
        </div>
      </section>

      <section className="shrink-0 border border-[#30363d] bg-[#0d1117] p-2">
        <p className="text-[11px] text-[#8b949e]">현재 경로</p>
        <p className="mt-1 text-xs font-medium text-[#e6edf3]">{breadcrumb.join(' > ')}</p>
      </section>

      <section className="shrink-0 grid grid-cols-2 gap-2">
        <div className="border border-[#30363d] bg-[#0d1117] p-2">
          <p className="text-[11px] text-[#8b949e]">활성 알림</p>
          <p className="mt-1 text-lg font-bold text-[#f85149]">{alerts.length}</p>
        </div>
        <div className="border border-[#30363d] bg-[#0d1117] p-2">
          <p className="text-[11px] text-[#8b949e]">조치 큐</p>
          <p className="mt-1 text-lg font-bold text-[#d29922]">{actions.length}</p>
        </div>
      </section>
    </div>
  );
};

export default DrillMenuPanel;
