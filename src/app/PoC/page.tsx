'use client';

import { useCallback, useState } from 'react';
import Navbar from './sections/Navbar';
import LeftSidebar from './sections/LeftSidebar';
import Header from './sections/Header';
import ForecastMatrix from './sections/ForecastMatrix';
import WeightDistribution from './sections/WeightDistribution';
import RightSidebar from './sections/RightSidebar';
import CCTVMonitor from './sections/CCTVMonitor';
import TracePanel from './components/trace/TracePanel';
import type { TraceabilityPayload } from '@/types/traceability';
import {
  feedbinBySensorSample,
  humidityBySensorSample,
  temperatureBySensorSample,
} from './sample-sensor-data';

export default function DashboardPage() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
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

  return (
    <div data-theme="showcase" data-surface="product" className="h-screen bg-[#0d1117] text-gray-100 flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <Navbar lang={lang} setLang={setLang} />

      {/* Main content area */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-4">
        <div className="max-w-[1760px] w-full mx-auto space-y-4">
          {/* 3-column layout */}
          <div className="flex flex-col 2xl:flex-row gap-4 w-full">
            {/* Left Sidebar - 280px */}
            <div className="hidden 2xl:block w-[280px] flex-shrink-0">
              <LeftSidebar lang={lang} />
            </div>

            {/* Center Content - flexible, max 1100px */}
            <div className="w-full flex-1 flex flex-col min-w-0 space-y-4">
              {/* Header */}
              <Header lang={lang} onOpenTrace={openTracePanel} />

              {/* CCTV Weight Chart + Rolling Forecast Matrix */}
              <ForecastMatrix lang={lang} onOpenTrace={openTracePanel} />

              {/* Weight Distribution */}
              <WeightDistribution lang={lang} onOpenTrace={openTracePanel} />
            </div>

            {/* Right Sidebar - 320px */}
            <div className="hidden 2xl:block w-[320px] flex-shrink-0">
              <RightSidebar
                lang={lang}
                feedbinBySensor={feedbinBySensorSample}
                temperatureBySensor={temperatureBySensorSample}
                humidityBySensor={humidityBySensorSample}
                totalBirdCount={totalBirdCount}
                onOpenTrace={openTracePanel}
              />
            </div>
          </div>

          {/* CCTV Monitoring - full width */}
          <CCTVMonitor lang={lang} onOpenTrace={openTracePanel} />
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
