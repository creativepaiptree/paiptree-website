'use client';

import { useState } from 'react';
import Navbar from './sections/Navbar';
import LeftSidebar from './sections/LeftSidebar';
import Header from './sections/Header';
import ForecastMatrix from './sections/ForecastMatrix';
import WeightDistribution from './sections/WeightDistribution';
import RightSidebar from './sections/RightSidebar';

export default function DashboardPage() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');

  return (
    <div className="h-screen bg-[#0d1117] text-gray-100 flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <Navbar lang={lang} setLang={setLang} />

      {/* Main content area */}
      <div className="flex-1 flex justify-center p-4 overflow-hidden">
        {/* 3-column layout wrapper with fixed max-width and centered */}
        <div className="flex gap-4 max-w-[1760px] w-full mx-auto h-full">
          {/* Left Sidebar - 280px */}
          <div className="w-[280px] flex-shrink-0 overflow-auto">
            <LeftSidebar lang={lang} />
          </div>

          {/* Center Content - flexible, max 1100px */}
          <div className="flex-1 flex flex-col min-w-0 max-w-[1100px] space-y-4 overflow-auto hide-scrollbar">
            {/* Header */}
            <Header lang={lang} />

            {/* CCTV Weight Chart + Rolling Forecast Matrix */}
            <ForecastMatrix lang={lang} />

            {/* Weight Distribution */}
            <WeightDistribution lang={lang} />
          </div>

          {/* Right Sidebar - 320px */}
          <div className="w-[320px] flex-shrink-0 overflow-auto hide-scrollbar">
            <RightSidebar lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
