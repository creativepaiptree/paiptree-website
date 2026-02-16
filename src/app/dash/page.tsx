'use client';

import { useMemo, useState } from 'react';
import { mockDashViewModel } from './mock-data';
import ClusterStatusBar from './sections/ClusterStatusBar';
import DashTopBar from './sections/DashTopBar';
import DrillMenuPanel, { type DashDrillSelection } from './sections/DrillMenuPanel';
import OperationsPanel from './sections/OperationsPanel';
import SensorPanel from './sections/SensorPanel';

export default function DashPage() {
  const viewModel = mockDashViewModel;
  const [selection, setSelection] = useState<DashDrillSelection>({
    region: null,
    farm: null,
    houseId: null,
    focus: null,
  });

  const filteredHouseTiles = useMemo(() => {
    return viewModel.houseTiles.filter((tile) => {
      if (selection.region && tile.region !== selection.region) return false;
      if (selection.farm && !tile.name.replace(/\sH-\d+$/i, '').includes(selection.farm)) return false;
      if (selection.houseId && tile.id !== selection.houseId) return false;
      return true;
    });
  }, [selection.farm, selection.houseId, selection.region, viewModel.houseTiles]);

  const filteredSensors = useMemo(() => {
    if (!selection.region && !selection.farm && !selection.houseId) {
      return viewModel.sensors.slice(0, 2);
    }
    const allowedIds = new Set(filteredHouseTiles.map((tile) => tile.id));
    const matched = viewModel.sensors.filter((sensor) => allowedIds.has(sensor.id));
    if (selection.houseId) return matched.slice(0, 1);
    if (selection.farm) return matched.slice(0, 4);
    return matched.slice(0, 3);
  }, [filteredHouseTiles, selection.farm, selection.houseId, selection.region, viewModel.sensors]);

  const contextLabel = useMemo(() => {
    if (!selection.region && !selection.farm && !selection.houseId && !selection.focus) return 'Global';
    return [
      selection.region ?? '권역',
      selection.farm ?? '농장',
      viewModel.houseTiles.find((tile) => tile.id === selection.houseId)?.name.split(' ').pop() ?? '동',
      selection.focus === 'environment'
        ? '환경'
        : selection.focus === 'operations'
          ? '운영'
          : selection.focus === 'events'
            ? '이벤트'
            : '컨텍스트',
    ].join(' > ');
  }, [selection.farm, selection.focus, selection.houseId, selection.region, viewModel.houseTiles]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0d1117] text-gray-100">
      <div className="flex-1 overflow-hidden p-4">
        <div className="mx-auto flex h-full max-w-[1760px] flex-col gap-2">
          <DashTopBar lastUpdatedAt={viewModel.lastUpdatedAt} contextLabel={contextLabel} />
          <ClusterStatusBar metrics={viewModel.statusMetrics} />

          <div className="flex min-h-0 flex-1 w-full gap-4">
            <div className="h-full w-[280px] flex-shrink-0">
              <DrillMenuPanel
                houseTiles={viewModel.houseTiles}
                alerts={viewModel.alerts}
                actions={viewModel.actions}
                selection={selection}
                onChange={setSelection}
              />
            </div>

            <div className="min-w-0 max-w-[1128px] h-full flex-1">
              <OperationsPanel
                kpiCards={viewModel.kpiCards}
                growthTrack={viewModel.growthTrack}
                houseTiles={filteredHouseTiles}
              />
            </div>

            <div className="h-full w-[320px] flex-shrink-0">
              <SensorPanel sensors={filteredSensors} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
