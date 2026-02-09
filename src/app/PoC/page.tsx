'use client';

import { useState } from 'react';
import Navbar from './sections/Navbar';
import LeftSidebar from './sections/LeftSidebar';
import Header from './sections/Header';
import ForecastMatrix from './sections/ForecastMatrix';
import WeightDistribution from './sections/WeightDistribution';
import RightSidebar from './sections/RightSidebar';
import CCTVMonitor from './sections/CCTVMonitor';
import {
  feedbinBySensorSample,
  humidityBySensorSample,
  temperatureBySensorSample,
} from './sample-sensor-data';

export default function DashboardPage() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const totalBirdCount = 20500;

  return (
    <div className="h-screen bg-[#0d1117] text-gray-100 flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <Navbar lang={lang} setLang={setLang} />

      {/* Main content area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-[1760px] mx-auto space-y-4">
          {/* 3-column layout */}
          <div className="flex gap-4 w-full">
            {/* Left Sidebar - 280px */}
            <div className="w-[280px] flex-shrink-0">
              <LeftSidebar lang={lang} />
            </div>

            {/* Center Content - flexible, max 1100px */}
            <div className="flex-1 flex flex-col min-w-0 max-w-[1128px] space-y-4">
              {/* Header */}
              <Header lang={lang} />

              {/* CCTV Weight Chart + Rolling Forecast Matrix */}
              <ForecastMatrix lang={lang} />

              {/* Weight Distribution */}
              <WeightDistribution lang={lang} />
            </div>

            {/* Right Sidebar - 320px */}
            <div className="w-[320px] flex-shrink-0">
              <RightSidebar
                lang={lang}
                feedbinBySensor={feedbinBySensorSample}
                temperatureBySensor={temperatureBySensorSample}
                humidityBySensor={humidityBySensorSample}
                totalBirdCount={totalBirdCount}
              />
            </div>
          </div>

          {/* CCTV Monitoring - full width */}
          <CCTVMonitor lang={lang} />
        </div>
      </div>
    </div>
  );
}
