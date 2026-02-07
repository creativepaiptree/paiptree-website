'use client';

import { ChevronDown, Download, ChevronRight } from 'lucide-react';

interface LeftSidebarProps {
  lang: 'ko' | 'en';
}

const alerts = [
  {
    date: '26.01.04 14:23:07',
    type: { ko: 'System_Down', en: 'System_Down' },
    location: '21Barn P',
    message: { ko: '전원공급이 끊겼습니다', en: 'Power supply disconnected' },
    errorCode: 'ERR_141_07',
  },
  {
    date: '26.01.02 09:15:42',
    type: { ko: 'Sensor_Error', en: 'Sensor_Error' },
    location: '21Barn T1',
    message: { ko: '온도센서 응답없음', en: 'Temperature sensor not responding' },
    errorCode: 'ERR_023_12',
  },
  {
    date: '25.12.28 22:08:31',
    type: { ko: 'Network_Fail', en: 'Network_Fail' },
    location: '21Barn N',
    message: { ko: '네트워크 연결 실패', en: 'Network connection failed' },
    errorCode: 'ERR_087_03',
  },
];

const t = {
  previousCycles: { ko: '이전 사이클', en: 'Previous Cycles' },
  alert: { ko: '알림', en: 'ALERT' },
  dataCollectionStatus: { ko: '데이터 수집 현황', en: 'DATA COLLECTION STATUS' },
  images: { ko: '이미지', en: 'IMAGES' },
  collected: { ko: '수집:', en: 'Collected:' },
  analyzed: { ko: '분석:', en: 'Analyzed:' },
  imagesUnit: { ko: '장', en: 'images' },
  sensor: { ko: '센서', en: 'SENSOR' },
  feedbin: { ko: '사료빈:', en: 'Feedbin:' },
  thermometer: { ko: '온도계:', en: 'Thermometer:' },
  hygrometer: { ko: '습도계:', en: 'Hygrometer:' },
  records: { ko: '건', en: 'records' },
  excelDownload: { ko: '엑셀 다운로드', en: 'EXCEL DOWNLOAD' },
  inputManagement: { ko: '입력 관리', en: 'INPUT MANAGEMENT' },
  cullingMortality: { ko: '도태 & 폐사', en: 'CULLING & MORTALITY' },
  measuredWeights: { ko: '실측 체중', en: 'MEASURED WEIGHTS' },
  feedDelivery: { ko: '사료 배송', en: 'FEED DELIVERY' },
};

const LeftSidebar = ({ lang }: LeftSidebarProps) => {
  return (
    <div className="h-full bg-[#161b22] border border-[#30363d]  flex flex-col overflow-hidden">
      {/* Previous Cycles Dropdown */}
      <div className="p-4 border-b border-gray-800">
        <button className="w-full flex items-center justify-between px-3 py-1.5 bg-[#0d1117] border border-gray-700 text-xs font-medium text-gray-300 hover:bg-gray-800 transition-colors">
          <span>{t.previousCycles[lang]}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Alert Section */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center mb-3">
          <span className="text-gray-400 font-medium">{t.alert[lang]}</span>
        </div>
        <div className="bg-[#0d1117] p-3 space-y-2 min-h-[160px]">
          {alerts.map((alert, idx) => (
            <div key={idx} className="text-red-400">
              <div className="text-[10px] text-red-500">{alert.date}_{alert.type[lang]}: <span className="text-gray-400">{alert.location}</span></div>
              <div className="text-xs">{alert.message[lang]} ({alert.errorCode})</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Collection Status */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-gray-400 font-medium mb-4">{t.dataCollectionStatus[lang]}</h3>

        {/* Images */}
        <div className="mb-4">
          <p className="text-gray-500 text-sm mb-2">{t.images[lang]}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t.collected[lang]}</span>
              <span className="text-gray-300">31,818 {t.imagesUnit[lang]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t.analyzed[lang]}</span>
              <span className="text-gray-300">30,771 {t.imagesUnit[lang]}</span>
            </div>
          </div>
        </div>

        {/* Sensor */}
        <div>
          <p className="text-gray-500 text-sm mb-2">{t.sensor[lang]}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t.feedbin[lang]}</span>
              <span className="text-gray-300">16,344 {t.records[lang]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t.thermometer[lang]}</span>
              <span className="text-gray-300">4,475 {t.records[lang]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t.hygrometer[lang]}</span>
              <span className="text-gray-300">4,472 {t.records[lang]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Excel Download Button */}
      <div className="p-4 border-b border-gray-800">
        <button className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#30363d] hover:bg-[#3d444d] text-gray-300 text-xs font-medium  transition-colors">
          <Download className="w-3.5 h-3.5" />
          <span>{t.excelDownload[lang]}</span>
        </button>
      </div>

      {/* Input Management */}
      <div className="p-4 flex-1">
        <h3 className="text-gray-400 font-medium mb-4">{t.inputManagement[lang]}</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between px-4 py-2 bg-[#0d1117] border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
            <span>{t.cullingMortality[lang]}</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
          <button className="w-full flex items-center justify-between px-4 py-2 bg-[#0d1117] border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
            <span>{t.measuredWeights[lang]}</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
          <button className="w-full flex items-center justify-between px-4 py-2 bg-[#0d1117] border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
            <span>{t.feedDelivery[lang]}</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
