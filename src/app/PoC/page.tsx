'use client';

import { Fragment, useCallback, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import TracePanel from './components/trace/TracePanel';
import type { TraceabilityPayload } from '@/types/traceability';
import { buildPocBlockCatalog, type PoCBlockCatalog, type PoCBlockSpec } from './blocks/poc-block-catalog';
import {
  feedbinBySensorSample,
  humidityBySensorSample,
  temperatureBySensorSample,
} from './sample-sensor-data';

type RenderableBlock = Pick<PoCBlockSpec, 'id' | 'render'>;

const renderBlockList = (blocks: ReadonlyArray<RenderableBlock>) =>
  blocks.map((block) => <Fragment key={block.id}>{block.render()}</Fragment>);

export default function DashboardPage(): ReactElement {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [activeTrace, setActiveTrace] = useState<TraceabilityPayload | null>(null);
  const [isTracePanelOpen, setIsTracePanelOpen] = useState(false);
  const totalBirdCount = 20500;
  const openTracePanel = useCallback((trace: TraceabilityPayload) => {
    setActiveTrace(trace);
    setIsTracePanelOpen(true);
  }, []);

  const closeTracePanel = useCallback(() => {
    setIsTracePanelOpen(false);
  }, []);

  const blockCatalog: PoCBlockCatalog = useMemo(
    () =>
      buildPocBlockCatalog({
        lang,
        setLang,
        themeMode,
        setThemeMode,
        onOpenTrace: openTracePanel,
        rightSidebarData: {
          feedbinBySensor: feedbinBySensorSample,
          temperatureBySensor: temperatureBySensorSample,
          humidityBySensor: humidityBySensorSample,
          totalBirdCount,
        },
      }),
    [lang, themeMode, openTracePanel, totalBirdCount]
  );

  return (
    <div
      className={`h-screen flex flex-col overflow-hidden ${
        themeMode === 'light' ? 'poc-theme-light bg-[#f8fafc] text-gray-900' : 'bg-[#0d1117] text-gray-100'
      }`}
      data-poc-theme={themeMode}
    >
      {renderBlockList(blockCatalog.top)}

      <div className="flex-1 overflow-x-hidden overflow-y-auto p-4">
        <div className="max-w-[1760px] w-full mx-auto space-y-4">
          <div className="flex flex-col 2xl:flex-row gap-4 w-full">
            <div className="hidden 2xl:block w-[280px] flex-shrink-0">
              {renderBlockList(blockCatalog.left)}
            </div>

            <div className="w-full flex-1 flex flex-col min-w-0 space-y-4">
              {renderBlockList(blockCatalog.center)}
            </div>

            <div className="hidden 2xl:block w-[320px] flex-shrink-0">
              {renderBlockList(blockCatalog.right)}
            </div>
          </div>

          {renderBlockList(blockCatalog.bottom)}
        </div>
      </div>

      <TracePanel
        lang={lang}
        open={isTracePanelOpen}
        trace={activeTrace}
        onClose={closeTracePanel}
      />
    </div>
  );
}
