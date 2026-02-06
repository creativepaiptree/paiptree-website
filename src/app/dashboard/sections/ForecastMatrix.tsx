'use client';

// Production source for the /dashboard Rolling Forecast Matrix section.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';

Chart.register(...registerables);

type Cell =
  | { type: 'prediction'; value: string; error: string; errorClass: string; isToday: boolean }
  | { type: 'actual'; value: string; check: string; isToday: boolean }
  | { type: 'future'; value: string; label: string; isToday: boolean }
  | { type: 'empty'; value: string; isToday: boolean };

type Row = { age: string; cells: Cell[] };

const columns = [
  { "dateMain": { "ko": "1/20(월)", "en": "1/20(Mon)" }, "dateSub": { "ko": "13일 전", "en": "13 days ago" }, "isToday": false },
  { "dateMain": { "ko": "1/21(화)", "en": "1/21(Tue)" }, "dateSub": { "ko": "12일 전", "en": "12 days ago" }, "isToday": false },
  { "dateMain": { "ko": "1/22(수)", "en": "1/22(Wed)" }, "dateSub": { "ko": "11일 전", "en": "11 days ago" }, "isToday": false },
  { "dateMain": { "ko": "1/23(목)", "en": "1/23(Thu)" }, "dateSub": { "ko": "10일 전", "en": "10 days ago" }, "isToday": false },
  { "dateMain": { "ko": "1/24(금)", "en": "1/24(Fri)" }, "dateSub": { "ko": "9일 전", "en": "9 days ago" }, "isToday": false },
  { "dateMain": { "ko": "1/25(토)", "en": "1/25(Sat)" }, "dateSub": { "ko": "8일 전", "en": "8 days ago" }, "isToday": false },
  { "dateMain": { "ko": "1/26(일)", "en": "1/26(Sun)" }, "dateSub": { "ko": "7일 전", "en": "7 days ago" }, "isToday": false },
  { "dateMain": { "ko": "1/27(월)", "en": "1/27(Mon)" }, "dateSub": { "ko": "6일 전", "en": "6 days ago" }, "isToday": false },
  { "dateMain": { "ko": "1/28(화)", "en": "1/28(Tue)" }, "dateSub": { "ko": "5일 전", "en": "5 days ago" }, "isToday": false },
  { "dateMain": { "ko": "1/29(수)", "en": "1/29(Wed)" }, "dateSub": { "ko": "4일 전", "en": "4 days ago" }, "isToday": false },
  { "dateMain": { "ko": "1/30(목)", "en": "1/30(Thu)" }, "dateSub": { "ko": "3일 전", "en": "3 days ago" }, "isToday": false },
  { "dateMain": { "ko": "1/31(금)", "en": "1/31(Fri)" }, "dateSub": { "ko": "2일 전", "en": "2 days ago" }, "isToday": false },
  { "dateMain": { "ko": "2/1(토)", "en": "2/1(Sat)" }, "dateSub": { "ko": "1일 전", "en": "1 day ago" }, "isToday": false },
  { "dateMain": { "ko": "2/2(일)", "en": "2/2(Sun)" }, "dateSub": { "ko": "오늘", "en": "Today" }, "isToday": true },
  { "dateMain": { "ko": "2/3(월)", "en": "2/3(Mon)" }, "dateSub": { "ko": "내일", "en": "Tomorrow" }, "isToday": false },
  { "dateMain": { "ko": "2/4(화)", "en": "2/4(Tue)" }, "dateSub": { "ko": "모레", "en": "In 2 days" }, "isToday": false },
] as const;

const rows: Row[] = [
  { "age": "25일령", "cells": [
    { "type": "prediction", "value": "1,360g", "error": "-5.7%", "errorClass": "bad", "isToday": false },
    { "type": "prediction", "value": "1,375g", "error": "+5.2%", "errorClass": "bad", "isToday": false },
    { "type": "prediction", "value": "1,390g", "error": "-3.1%", "errorClass": "medium", "isToday": false },
    { "type": "actual", "value": "1,405g", "check": "✓ 실측(+1.1% 15g)", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": true },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
  ]},
  { "age": "26일령", "cells": [
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "prediction", "value": "1,405g", "error": "-3.0%", "errorClass": "medium", "isToday": false },
    { "type": "prediction", "value": "1,420g", "error": "-2.8%", "errorClass": "medium", "isToday": false },
    { "type": "prediction", "value": "1,435g", "error": "-1.5%", "errorClass": "medium", "isToday": false },
    { "type": "actual", "value": "1,450g", "check": "✓ 실측(+1.0% 15g)", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": true },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
  ]},
  { "age": "27일령", "cells": [
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "prediction", "value": "1,462g", "error": "-2.8%", "errorClass": "medium", "isToday": false },
    { "type": "prediction", "value": "1,478g", "error": "-1.7%", "errorClass": "medium", "isToday": false },
    { "type": "prediction", "value": "1,490g", "error": "-0.9%", "errorClass": "good", "isToday": false },
    { "type": "actual", "value": "1,504g", "check": "✓ 실측(+0.9% 14g)", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": true },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
  ]},
  { "age": "28일령", "cells": [
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "prediction", "value": "1,520g", "error": "-6.1%", "errorClass": "bad", "isToday": false },
    { "type": "prediction", "value": "1,538g", "error": "-2.5%", "errorClass": "medium", "isToday": false },
    { "type": "prediction", "value": "1,558g", "error": "-1.3%", "errorClass": "medium", "isToday": false },
    { "type": "actual", "value": "1,578g", "check": "✓ 실측(+1.3% 20g)", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": true },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
  ]},
  { "age": "29일령", "cells": [
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "prediction", "value": "1,592g", "error": "-3.5%", "errorClass": "medium", "isToday": false },
    { "type": "prediction", "value": "1,612g", "error": "+5.6%", "errorClass": "bad", "isToday": false },
    { "type": "prediction", "value": "1,628g", "error": "-1.3%", "errorClass": "medium", "isToday": false },
    { "type": "actual", "value": "1,650g", "check": "✓ 실측(+1.4% 22g)", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": true },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
  ]},
  { "age": "30일령", "cells": [
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "prediction", "value": "1,658g", "error": "-5.4%", "errorClass": "bad", "isToday": false },
    { "type": "prediction", "value": "1,670g", "error": "-1.5%", "errorClass": "medium", "isToday": false },
    { "type": "prediction", "value": "1,680g", "error": "-0.9%", "errorClass": "good", "isToday": false },
    { "type": "actual", "value": "1,695g", "check": "✓ 실측(+0.9% 15g)", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": true },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
  ]},
  { "age": "31일령", "cells": [
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "prediction", "value": "1,748g", "error": "-2.2%", "errorClass": "medium", "isToday": false },
    { "type": "prediction", "value": "1,762g", "error": "-1.5%", "errorClass": "medium", "isToday": false },
    { "type": "prediction", "value": "1,778g", "error": "-0.6%", "errorClass": "good", "isToday": false },
    { "type": "actual", "value": "1,788g", "check": "✓ 실측(+0.6% 10g)", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": true },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
  ]},
  { "age": "32일령", "cells": [
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "prediction", "value": "1,842g", "error": "-2.1%", "errorClass": "medium", "isToday": false },
    { "type": "prediction", "value": "1,858g", "error": "-1.3%", "errorClass": "medium", "isToday": false },
    { "type": "prediction", "value": "1,872g", "error": "-0.5%", "errorClass": "good", "isToday": false },
    { "type": "actual", "value": "1,882g", "check": "✓ 실측(+0.5% 10g)", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": true },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
  ]},
  { "age": "33일령", "cells": [
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "prediction", "value": "1,935g", "error": "-1.9%", "errorClass": "medium", "isToday": false },
    { "type": "prediction", "value": "1,952g", "error": "-1.0%", "errorClass": "good", "isToday": false },
    { "type": "prediction", "value": "1,965g", "error": "-0.4%", "errorClass": "good", "isToday": false },
    { "type": "actual", "value": "1,972g", "check": "✓ 실측(+0.4% 7g)", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": true },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
  ]},
  { "age": "34일령", "cells": [
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "prediction", "value": "2,032g", "error": "-1.9%", "errorClass": "medium", "isToday": false },
    { "type": "prediction", "value": "2,045g", "error": "-1.0%", "errorClass": "good", "isToday": false },
    { "type": "prediction", "value": "2,060g", "error": "-0.4%", "errorClass": "good", "isToday": false },
    { "type": "actual", "value": "2,075g", "check": "✓ 실측(+0.7% 15g)", "isToday": false },
    { "type": "empty", "value": "-", "isToday": true },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
  ]},
  { "age": "35일령", "cells": [
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "prediction", "value": "2,135g", "error": "-1.9%", "errorClass": "medium", "isToday": false },
    { "type": "prediction", "value": "2,150g", "error": "-1.0%", "errorClass": "good", "isToday": false },
    { "type": "prediction", "value": "2,165g", "error": "-0.4%", "errorClass": "good", "isToday": false },
    { "type": "actual", "value": "2,180g", "check": "✓ 실측(+0.7% 15g)", "isToday": true },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
  ]},
  { "age": "36일령", "cells": [
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "prediction", "value": "2,250g", "error": "", "errorClass": "", "isToday": false },
    { "type": "prediction", "value": "2,265g", "error": "", "errorClass": "", "isToday": false },
    { "type": "prediction", "value": "2,280g", "error": "", "errorClass": "", "isToday": true },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
  ]},
  { "age": "37일령", "cells": [
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "prediction", "value": "2,320g", "error": "", "errorClass": "", "isToday": false },
    { "type": "prediction", "value": "2,340g", "error": "", "errorClass": "", "isToday": false },
    { "type": "prediction", "value": "2,360g", "error": "", "errorClass": "", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
  ]},
  { "age": "38일령", "cells": [
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "empty", "value": "-", "isToday": false },
    { "type": "prediction", "value": "2,385g", "error": "", "errorClass": "", "isToday": false },
    { "type": "prediction", "value": "2,405g", "error": "", "errorClass": "", "isToday": false },
    { "type": "prediction", "value": "2,425g", "error": "", "errorClass": "", "isToday": false },
  ]},
];

const weekLabels: Record<number, string> = {
  1: '1/20~1/21',
  2: '1/22~1/28',
  3: '1/29~2/4',
};

type Point = { x: number; y: number };
type AccuracyLineTone = 'good' | 'medium' | 'bad';
type AccuracyHoverLine = { text: string; tone: AccuracyLineTone };
type AccuracyHoverInfo = { summary: string; lines: AccuracyHoverLine[] };

const BASE_DATE = new Date(2025, 11, 27); // x=0 -> 12/27
const FORECAST_START_INDEX = 27; // 1/23 = 25일령
const TODAY_INDEX = 37; // 2/2 = 35일령
const AGE_OFFSET = 2; // age = x - 2
const CHART_MIN_INDEX = 10; // 8일령
const CHART_MAX_INDEX = 47; // 45일령

const HISTORY_POINTS: Point[] = [
  { x: 10, y: 358 }, { x: 11, y: 412 }, { x: 12, y: 478 },
  { x: 13, y: 535 }, { x: 14, y: 598 }, { x: 15, y: 672 }, { x: 16, y: 738 }, { x: 17, y: 815 },
  { x: 18, y: 885 }, { x: 19, y: 962 }, { x: 20, y: 1035 }, { x: 21, y: 1108 }, { x: 22, y: 1175 },
  { x: 23, y: 1248 }, { x: 24, y: 1295 }, { x: 25, y: 1328 }, { x: 26, y: 1362 },
];

const MODEL_POINTS: Point[] = [
  { x: 27, y: 1405 }, { x: 28, y: 1450 }, { x: 29, y: 1504 }, { x: 30, y: 1578 },
  { x: 31, y: 1650 }, { x: 32, y: 1695 }, { x: 33, y: 1788 }, { x: 34, y: 1882 },
  { x: 35, y: 1972 }, { x: 36, y: 2075 }, { x: 37, y: 2180 }, { x: 38, y: 2405 }, { x: 39, y: 2425 }, { x: 40, y: 2445 },
];

const D1_BASE_POINTS: Point[] = [
  { x: 27, y: 1390 }, { x: 28, y: 1435 }, { x: 29, y: 1490 }, { x: 30, y: 1558 },
  { x: 31, y: 1628 }, { x: 32, y: 1680 }, { x: 33, y: 1778 }, { x: 34, y: 1872 },
  { x: 35, y: 1965 }, { x: 36, y: 2060 }, { x: 37, y: 2165 }, { x: 38, y: 2280 }, { x: 39, y: 2360 }, { x: 40, y: 2425 },
];

const D2_BASE_POINTS: Point[] = [
  { x: 27, y: 1375 }, { x: 28, y: 1420 }, { x: 29, y: 1478 }, { x: 30, y: 1538 },
  { x: 31, y: 1612 }, { x: 32, y: 1670 }, { x: 33, y: 1762 }, { x: 34, y: 1858 },
  { x: 35, y: 1952 }, { x: 36, y: 2045 }, { x: 37, y: 2150 }, { x: 38, y: 2265 }, { x: 39, y: 2340 }, { x: 40, y: 2405 },
];

const D3_BASE_POINTS: Point[] = [
  { x: 27, y: 1360 }, { x: 28, y: 1405 }, { x: 29, y: 1462 }, { x: 30, y: 1520 },
  { x: 31, y: 1592 }, { x: 32, y: 1658 }, { x: 33, y: 1748 }, { x: 34, y: 1842 },
  { x: 35, y: 1935 }, { x: 36, y: 2032 }, { x: 37, y: 2135 }, { x: 38, y: 2250 }, { x: 39, y: 2320 }, { x: 40, y: 2385 },
];

const applyPredictionShift = (points: Point[], factor: number): Point[] =>
  points.map((point) => ({ x: point.x, y: Math.round(point.y * factor) }));

// Stress-test profile requested by user: 1/3 (+2%), 1/3 (+7%), 1/3 (base).
const D1_POINTS: Point[] = applyPredictionShift(D1_BASE_POINTS, 1.02);
const D2_POINTS: Point[] = applyPredictionShift(D2_BASE_POINTS, 1.07);
const D3_POINTS: Point[] = applyPredictionShift(D3_BASE_POINTS, 1.0);

const OBSERVED_ACTUAL_POINTS: Point[] = [
  { x: 27, y: 1405 }, { x: 28, y: 1450 }, { x: 29, y: 1504 }, { x: 30, y: 1578 },
  { x: 31, y: 1650 }, { x: 32, y: 1695 }, { x: 33, y: 1788 }, { x: 34, y: 1882 },
  { x: 35, y: 1972 }, { x: 36, y: 2075 }, { x: 37, y: 2180 },
];

const STANDARD_WEIGHT_POINTS: Point[] = [
  { x: 9, y: 156 }, { x: 10, y: 185 }, { x: 11, y: 216 }, { x: 12, y: 251 }, { x: 13, y: 289 },
  { x: 14, y: 330 }, { x: 15, y: 375 }, { x: 16, y: 423 }, { x: 17, y: 474 }, { x: 18, y: 529 },
  { x: 19, y: 587 }, { x: 20, y: 648 }, { x: 21, y: 713 }, { x: 22, y: 780 }, { x: 23, y: 850 },
  { x: 24, y: 923 }, { x: 25, y: 998 }, { x: 26, y: 1076 }, { x: 27, y: 1156 }, { x: 28, y: 1238 },
  { x: 29, y: 1322 }, { x: 30, y: 1408 }, { x: 31, y: 1495 }, { x: 32, y: 1584 }, { x: 33, y: 1674 },
  { x: 34, y: 1764 }, { x: 35, y: 1856 }, { x: 36, y: 1949 }, { x: 37, y: 2042 }, { x: 38, y: 2136 },
  { x: 39, y: 2230 }, { x: 40, y: 2324 }, { x: 41, y: 2418 }, { x: 42, y: 2512 }, { x: 43, y: 2606 },
  { x: 44, y: 2700 }, { x: 45, y: 2794 }, { x: 46, y: 2888 }, { x: 47, y: 2982 },
];

const pointMap = (points: Point[]) => new Map(points.map((point) => [point.x, point.y]));
const formatSigned = (value: number, unit: string) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}${unit}`;
const getAccuracyTone = (accuracy: number): 'good' | 'medium' | 'bad' => {
  if (accuracy >= 97) return 'good';
  if (accuracy >= 95) return 'medium';
  return 'bad';
};

interface ForecastMatrixProps {
  lang: 'ko' | 'en';
}

const ForecastMatrix = ({ lang }: ForecastMatrixProps) => {
  const [fitAll, setFitAll] = useState(false);
  const [week, setWeek] = useState<1 | 2 | 3>(3);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const maxDay = CHART_MAX_INDEX;

  const avgAccuracy = useMemo(() => {
    const observedMap = pointMap(OBSERVED_ACTUAL_POINTS);
    const calcAvgAccuracy = (predictions: Point[]) => {
      let totalAbsErrorPct = 0;
      let count = 0;
      predictions.forEach((pred) => {
        const actual = observedMap.get(pred.x);
        if (typeof actual === 'number') {
          const errorPct = Math.abs(((pred.y - actual) / actual) * 100);
          totalAbsErrorPct += errorPct;
          count++;
        }
      });
      const avgError = count > 0 ? totalAbsErrorPct / count : 0;
      return Math.max(0, 100 - avgError).toFixed(1);
    };

    return {
      d1: calcAvgAccuracy(D1_POINTS),
      d2: calcAvgAccuracy(D2_POINTS),
      d3: calcAvgAccuracy(D3_POINTS),
    };
  }, []);

  const accuracyHoverInfo = useMemo(() => {
    const observedMap = pointMap(OBSERVED_ACTUAL_POINTS);
    const getLineTone = (absPct: number): AccuracyLineTone => {
      if (absPct <= 3) return 'good';
      if (absPct <= 5) return 'medium';
      return 'bad';
    };
    const build = (predictions: Point[], horizonKo: string, horizonEn: string): AccuracyHoverInfo => {
      const terms: AccuracyHoverLine[] = [];
      let totalDiff = 0;
      let totalSignedPct = 0;
      let count = 0;

      predictions.forEach((pred) => {
        const actual = observedMap.get(pred.x);
        if (typeof actual !== 'number') return;
        const age = pred.x - AGE_OFFSET;
        const diff = actual - pred.y;
        const pct = (diff / actual) * 100;
        terms.push(
          {
            text:
              lang === 'ko'
                ? `${age}일령 ${horizonKo}: ${formatSigned(Number(diff.toFixed(1)), 'g')} (${formatSigned(Number(pct.toFixed(1)), '%')})`
                : `${age}d ${horizonEn}: ${formatSigned(Number(diff.toFixed(1)), 'g')} (${formatSigned(Number(pct.toFixed(1)), '%')})`,
            tone: getLineTone(Math.abs(pct)),
          }
        );
        totalDiff += diff;
        totalSignedPct += pct;
        count += 1;
      });

      if (count === 0) return { summary: lang === 'ko' ? '데이터 없음' : 'No data', lines: [] };
      const avgDiff = totalDiff / count;
      const meanPct = totalSignedPct / count;
      return {
        summary:
          lang === 'ko'
            ? `총 ${count}일: ${formatSigned(Number(avgDiff.toFixed(1)), 'g')} (${formatSigned(Number(meanPct.toFixed(1)), '%')})`
            : `Total ${count}d: ${formatSigned(Number(avgDiff.toFixed(1)), 'g')} (${formatSigned(Number(meanPct.toFixed(1)), '%')})`,
        lines: terms,
      };
    };

    return {
      d1: build(D1_POINTS, '1일전', 'D-1'),
      d2: build(D2_POINTS, '2일전', 'D-2'),
      d3: build(D3_POINTS, '3일전', 'D-3'),
    };
  }, [lang]);

  const dateMaps = useMemo(() => {
    const weekdaysKo = ['일', '월', '화', '수', '목', '금', '토'];
    const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mapKo = new Map<number, string>();
    const mapEn = new Map<number, string>();
    const mapPlain = new Map<number, string>();
    for (let d = 0; d <= maxDay; d += 1) {
      const date = new Date(BASE_DATE);
      date.setDate(BASE_DATE.getDate() + d);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      mapKo.set(d, `${month}/${day}(${weekdaysKo[date.getDay()]})`);
      mapEn.set(d, `${month}/${day}(${weekdaysEn[date.getDay()]})`);
      mapPlain.set(d, `${month}/${day}`);
    }
    return { ko: mapKo, en: mapEn, plain: mapPlain };
  }, [maxDay]);

  const dateMap = lang === 'ko' ? dateMaps.ko : dateMaps.en;
  const plainDateMap = dateMaps.plain;

  const visibleColumns = useMemo(() => {
    if (fitAll) return columns.map((col, idx) => ({ col, idx, week: idx < 2 ? 1 : idx < 9 ? 2 : 3 }));
    return columns
      .map((col, idx) => ({ col, idx, week: idx < 2 ? 1 : idx < 9 ? 2 : 3 }))
      .filter(item => item.week === week);
  }, [fitAll, week]);

  const visibleRows = useMemo(() => {
    return rows
      .filter(row => {
        const ageNum = Number(String(row.age).replace(/\D/g, ''));
        if (Number.isNaN(ageNum)) return true;
        if (fitAll) return true;
        if (week === 1) return ageNum >= 25 && ageNum <= 31;
        if (week === 2) return ageNum >= 25 && ageNum <= 31;
        return ageNum >= 32 && ageNum <= 38;
      })
      .slice()
      .sort((a, b) => {
        const aNum = Number(String(a.age).replace(/\D/g, ''));
        const bNum = Number(String(b.age).replace(/\D/g, ''));
        if (Number.isNaN(aNum) || Number.isNaN(bNum)) return 0;
        return bNum - aNum;
      });
  }, [fitAll, week]);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);

  useEffect(() => {
    const historyMap = pointMap(HISTORY_POINTS);
    const modelMap = pointMap(MODEL_POINTS);
    const d1Map = pointMap(D1_POINTS);
    const d2Map = pointMap(D2_POINTS);
    const d3Map = pointMap(D3_POINTS);
    const historyWithLink = [...HISTORY_POINTS, { x: FORECAST_START_INDEX, y: 1405 }];
    const standardWeightSeries = STANDARD_WEIGHT_POINTS.filter(
      (point) => point.x >= CHART_MIN_INDEX && point.x <= CHART_MAX_INDEX
    );
    const actualOnlyPoints = MODEL_POINTS.filter((point) => point.x <= TODAY_INDEX);
    const forecastPoints = MODEL_POINTS.filter((point) => point.x >= TODAY_INDEX);
    const barPastColor = '#3fb950';
    const makeBarColor = (defaultColor: string) => (context: any) => {
      const xVal = context?.parsed?.x;
      if (typeof xVal === 'number' && xVal >= FORECAST_START_INDEX && xVal <= TODAY_INDEX) return barPastColor;
      return defaultColor;
    };

    const calcError = (current: number, baseline: number) => {
      const diff = current - baseline;
      const pct = baseline === 0 ? 0 : (diff / baseline) * 100;
      return {
        diff,
        pct,
        pctText: formatSigned(Number(pct.toFixed(1)), '%'),
        diffText: formatSigned(Number(diff.toFixed(1)), 'g'),
      };
    };

    const getErrorColor = (pctAbs: number) => {
      if (pctAbs <= 3) return '#3fb950';
      if (pctAbs <= 5) return '#ffc107';
      return '#f85149';
    };

    const todayForwardLabelsPlugin = {
      id: 'todayForwardLabels',
      afterDatasetsDraw: (chart: any) => {
        const ctx = chart.ctx;
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        const labels = [
          { x: TODAY_INDEX, value: modelMap.get(TODAY_INDEX) },
          { x: TODAY_INDEX + 1, value: d1Map.get(TODAY_INDEX + 1) },
          { x: TODAY_INDEX + 2, value: d2Map.get(TODAY_INDEX + 2) },
          { x: TODAY_INDEX + 3, value: d3Map.get(TODAY_INDEX + 3) },
        ];

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        labels.forEach((label: { x: number; value: number | undefined }) => {
          if (typeof label.value !== 'number') return;
          const x = xScale.getPixelForValue(label.x);
          const y = yScale.getPixelForValue(label.value);
          const text = `${label.value.toLocaleString()}`;
          const isTodayValue = label.x === TODAY_INDEX;
          ctx.font = isTodayValue
            ? '700 10px "Noto Sans KR", sans-serif'
            : '400 9px "Noto Sans KR", sans-serif';
          ctx.strokeStyle = 'rgba(10,10,15,0.9)';
          ctx.lineWidth = 3;
          ctx.strokeText(text, x, y - 16);
          ctx.fillStyle = isTodayValue ? '#3fb950' : '#ffc107';
          ctx.fillText(text, x, y - 16);
        });
        ctx.restore();
      },
    };

    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      plugins: [todayForwardLabelsPlugin],
      data: {
        datasets: [
          {
            label: lang === 'ko' ? '예측 영역' : 'Forecast Area',
            data: MODEL_POINTS,
            borderColor: 'transparent',
            backgroundColor: 'rgba(0, 212, 170, 0.15)',
            pointRadius: 0,
            borderWidth: 0,
            fill: 'origin',
            tension: 0.35,
            order: 0,
          },
          {
            label: lang === 'ko' ? '표준 체중' : 'Standard Weight',
            data: standardWeightSeries,
            borderColor: '#4da3ff',
            backgroundColor: '#4da3ff',
            pointRadius: 0,
            borderWidth: 1,
            tension: 0.3,
            spanGaps: true,
            order: 1,
          },
          {
            type: 'bar',
            label: lang === 'ko' ? '과거 데이터(막대)' : 'History (Bars)',
            data: historyWithLink,
            backgroundColor: makeBarColor('rgb(128 128 128)'),
            borderWidth: 0,
            barThickness: 6,
            maxBarThickness: 6,
            grouped: false,
            order: 10,
          },
          {
            type: 'bar',
            label: lang === 'ko' ? '실측값(막대)' : 'Actual (Bars)',
            data: actualOnlyPoints,
            backgroundColor: makeBarColor('rgb(0 212 170)'),
            borderWidth: 0,
            barThickness: 6,
            maxBarThickness: 6,
            grouped: false,
            order: 10,
          },
          {
            type: 'bar',
            label: lang === 'ko' ? '예측값(막대)' : 'Forecast (Bars)',
            data: forecastPoints,
            backgroundColor: makeBarColor('rgb(255 193 7)'),
            borderWidth: 0,
            barThickness: 6,
            maxBarThickness: 6,
            grouped: false,
            order: 10,
          },
          {
            label: lang === 'ko' ? '과거 데이터' : 'History',
            data: historyWithLink,
            borderColor: '#808080',
            backgroundColor: '#808080',
            pointBackgroundColor: '#808080',
            pointBorderColor: '#808080',
            pointRadius: 0,
            pointHoverRadius: 0,
            pointHitRadius: 8,
            borderWidth: 1.5,
            tension: 0.35,
            order: 2,
          },
          {
            label: lang === 'ko' ? '실측값' : 'Actual',
            data: actualOnlyPoints,
            borderColor: '#3fb950',
            backgroundColor: '#3fb950',
            pointBackgroundColor: '#3fb950',
            pointBorderColor: '#3fb950',
            pointRadius: 0,
            pointHoverRadius: 0,
            pointHitRadius: 8,
            borderWidth: 2,
            tension: 0.35,
            order: 3,
          },
          {
            label: lang === 'ko' ? '예측값' : 'Forecast',
            data: forecastPoints,
            borderColor: '#ffc107',
            backgroundColor: '#ffc107',
            pointBackgroundColor: '#ffc107',
            pointBorderColor: '#ffc107',
            pointRadius: 0,
            pointHoverRadius: 0,
            pointHitRadius: 8,
            borderWidth: 2,
            borderDash: [6, 4],
            tension: 0.35,
            order: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onHover: (event: any, elements: any[]) => {
          if (!elements || elements.length === 0) {
            setHoveredDay(null);
            return;
          }
          const el = elements[0];
          const xVal = el.element?.parsed?.x;
          if (typeof xVal === 'number') {
            setHoveredDay(Math.round(xVal));
          }
        },
        plugins: {
          filler: { drawTime: 'beforeDatasetsDraw' },
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: (context: any) => {
              const { chart, tooltip } = context;
              let tooltipEl = document.getElementById('chartjs-tooltip');

              if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'chartjs-tooltip';
                tooltipEl.style.cssText = 'background: rgba(10,10,15,0.95); border: 1px solid #2a2a3a; border-radius: 4px; padding: 12px; pointer-events: none; position: absolute; font-family: "Noto Sans KR", sans-serif; font-size: 12px; color: #f0f0f5; z-index: 9999;';
                document.body.appendChild(tooltipEl);
              }

              if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = '0';
                return;
              }

              const dayIndex = tooltip.dataPoints?.[0]?.parsed?.x;
              if (typeof dayIndex !== 'number') return;

              const dayAge = dayIndex - AGE_OFFSET;
              const dateLabel = plainDateMap.get(dayIndex) ?? '';
              const headerAgeText = dayAge > 0 ? `${dayAge}${lang === 'ko' ? '일령' : 'd'}` : '-';
              let html = `<div style="font-weight:600; margin-bottom:8px;">${headerAgeText} ${dateLabel} 22:00</div>`;

              const isArrivedDay = dayIndex <= TODAY_INDEX;
              const isFutureScenario = dayIndex > TODAY_INDEX;
              const todayPrediction = isFutureScenario
                ? undefined
                : (isArrivedDay ? (modelMap.get(dayIndex) ?? historyMap.get(dayIndex)) : undefined);
              const tomorrowPrediction = d1Map.get(dayIndex + 1);
              const dayAfterPrediction = d2Map.get(dayIndex + 2);
              const thirdDayPrediction = d3Map.get(dayIndex + 3);

              const primaryLabel = lang === 'ko' ? '예측무게' : 'Predicted Weight';
              const primaryValue = isFutureScenario
                ? `(${lang === 'ko' ? '분석중' : 'Analyzing'})`
                : (typeof todayPrediction === 'number' ? `${todayPrediction.toLocaleString()}g` : '-');
              html += `<div style="margin-bottom:6px;">${primaryLabel}: ${primaryValue}</div>`;

              const renderHorizonLine = (targetIndex: number, currentPrediction: number | undefined) => {
                const targetAge = targetIndex - AGE_OFFSET;
                const targetDate = plainDateMap.get(targetIndex) ?? '-';
                if (typeof currentPrediction !== 'number') {
                  return `<div style="margin-bottom:4px;">${targetAge}${lang === 'ko' ? '일령' : 'd'}(${targetDate}): -</div>`;
                }
                const baselinePrediction = targetIndex <= TODAY_INDEX ? modelMap.get(targetIndex) : undefined;
                if (typeof baselinePrediction !== 'number') {
                  return `<div style="margin-bottom:4px;">${targetAge}${lang === 'ko' ? '일령' : 'd'}(${targetDate}): ${currentPrediction.toLocaleString()}g <span style="color:#8b949e;">(${lang === 'ko' ? '분석중' : 'Analyzing'})</span></div>`;
                }
                const delta = calcError(currentPrediction, baselinePrediction);
                const color = getErrorColor(Math.abs(delta.pct));
                return `<div style="margin-bottom:4px; color:${color};">${targetAge}${lang === 'ko' ? '일령' : 'd'}(${targetDate}): ${currentPrediction.toLocaleString()}g (${delta.diffText}, ${delta.pctText})</div>`;
              };

              if (dayIndex >= FORECAST_START_INDEX) {
                if (isFutureScenario) {
                  html += `<div style="margin-bottom:4px;">${lang === 'ko' ? '오늘+1일령' : 'Today+1d'}: -</div>`;
                  html += `<div style="margin-bottom:4px;">${lang === 'ko' ? '오늘+2일령' : 'Today+2d'}: -</div>`;
                  html += `<div style="margin-bottom:4px;">${lang === 'ko' ? '오늘+3일령' : 'Today+3d'}: -</div>`;
                } else {
                  html += renderHorizonLine(dayIndex + 1, tomorrowPrediction);
                  html += renderHorizonLine(dayIndex + 2, dayAfterPrediction);
                  html += renderHorizonLine(dayIndex + 3, thirdDayPrediction);
                }
              }

              tooltipEl.innerHTML = html;
              tooltipEl.style.opacity = '1';

              const pos = chart.canvas.getBoundingClientRect();
              tooltipEl.style.left = pos.left + window.scrollX + tooltip.caretX + 10 + 'px';
              tooltipEl.style.top = pos.top + window.scrollY + tooltip.caretY - 10 + 'px';
            },
          },
        },
        scales: {
          x: {
            type: 'linear',
            min: CHART_MIN_INDEX,
            max: CHART_MAX_INDEX,
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: {
              color: (context: any) => {
                const value = context.tick?.value;
                return value === TODAY_INDEX ? '#00d4aa' : '#8888a0';
              },
              stepSize: 1,
              callback: (value: any) => {
                const day = Number(value);
                if (!Number.isFinite(day)) return '';
                const age = day - AGE_OFFSET;
                if (age < 8) return '';
                return `${age}`;
              },
            },
          },
          y: {
            min: 0,
            max: 3500,
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: {
              color: '#8888a0',
              stepSize: 500,
              callback: (value: any) => `${value}g`,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [lang, dateMap, plainDateMap]);

  const hoveredDate = hoveredDay != null ? dateMap.get(hoveredDay) : null;
  const hoveredColumnIndex = hoveredDate
    ? columns.findIndex(col => col.dateMain[lang] === hoveredDate)
    : null;

  return (
    <>
      <style jsx>{`
        .forecast-card {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 12px;
        }
        .chart-container {
          height: 300px;
          margin-bottom: 12px;
        }
        .table-wrapper {
          overflow-x: auto;
        }
        .matrix-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          table-layout: fixed;
        }
        .matrix-table th, .matrix-table td {
          padding: 4px 5px;
          text-align: center;
          border-bottom: 1px solid #30363d;
        }
        .matrix-table th:first-child,
        .matrix-table td:first-child {
          width: 52px;
          min-width: 52px;
        }
        .matrix-table thead {
          position: sticky;
          top: 0;
          background: #161b22;
          z-index: 1;
        }
        .matrix-table thead th {
          color: #8b949e;
          font-weight: 500;
        }
        .date-main {
          display: block;
          color: #c9d1d9;
          font-weight: 600;
        }
        .date-sub {
          font-size: 8px;
          color: #6e7681;
        }
        .today-col {
          background: rgba(63, 185, 80, 0.1);
        }
        .hovered-col {
          background: rgba(139, 92, 246, 0.15);
        }
        .row-header {
          text-align: left !important;
          color: #c9d1d9;
          font-weight: 600;
        }
        .prediction-cell .value {
          color: #c9d1d9;
          display: block;
        }
        .prediction-cell .error {
          font-size: 9px;
          color: #ffc107;
          display: block;
          margin-top: 2px;
        }
        .prediction-cell .error.good { color: #3fb950; }
        .prediction-cell .error.medium { color: #ffc107; }
        .prediction-cell .error.bad { color: #f85149; }
        .actual-cell {
          background: rgba(63, 185, 80, 0.15);
        }
        .actual-cell .value {
          color: #3fb950;
          font-weight: 700;
          display: block;
          font-size: 11px;
        }
        .actual-cell .check {
          color: #3fb950;
          font-size: 9px;
          display: block;
          margin-top: 2px;
        }
        .future-cell {
          background: rgba(255, 193, 7, 0.1);
        }
        .future-cell .value {
          color: #ffc107;
        }
        .future-cell .label {
          font-size: 9px;
          color: #6e7681;
        }
        .empty-cell {
          color: #484f58;
        }
        .legend {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #30363d;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          color: #8b949e;
        }
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .legend-dot.actual { background: #3fb950; }
        .legend-dot.future { background: #ffc107; }
        .legend-dot.good { background: #3fb950; }
        .legend-dot.medium { background: #ffc107; }
        .legend-dot.bad { background: #f85149; }
        .accuracy-indicators {
          display: flex;
          gap: 6px;
          align-items: stretch;
        }
        .accuracy-item {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #30363d;
          border-radius: 4px;
          padding: 3px 8px;
          min-width: 102px;
          position: relative;
        }
        .accuracy-tooltip {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          display: none;
          width: 240px;
          max-width: calc(100vw - 48px);
          background: rgba(10, 10, 15, 0.96);
          border: 1px solid #2a2a3a;
          border-radius: 6px;
          padding: 10px 12px;
          color: #f0f0f5;
          font-size: 12px;
          line-height: 1.35;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
          z-index: 40;
        }
        .accuracy-item:hover .accuracy-tooltip {
          display: block;
        }
        .accuracy-tooltip-summary {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .accuracy-tooltip-line {
          white-space: normal;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .accuracy-tooltip-line.good { color: rgba(63, 185, 80, 0.6); }
        .accuracy-tooltip-line.medium { color: rgba(255, 193, 7, 0.6); }
        .accuracy-tooltip-line.bad { color: rgba(248, 81, 73, 0.6); }
        .accuracy-label {
          display: flex;
          flex-direction: column;
          min-width: 24px;
          line-height: 1.1;
        }
        .accuracy-label .day {
          font-size: 9px;
          font-weight: 700;
          color: #c9d1d9;
        }
        .accuracy-label .sub {
          font-size: 6px;
          color: #6e7681;
        }
        .accuracy-bar {
          flex: 0 0 78px;
          width: 78px;
          height: 6px;
          background: #21262d;
          border-radius: 4px;
          overflow: hidden;
        }
        .accuracy-bar-fill {
          height: 100%;
          border-radius: 4px;
        }
        .accuracy-value {
          font-size: 9px;
          font-weight: 600;
          min-width: 28px;
          text-align: right;
        }
        .accuracy-item.good .accuracy-bar-fill { background: linear-gradient(90deg, #3fb950, #2ea043); }
        .accuracy-item.medium .accuracy-bar-fill { background: linear-gradient(90deg, #ffc107, #e6ac00); }
        .accuracy-item.bad .accuracy-bar-fill { background: linear-gradient(90deg, #f85149, #da3633); }
        .accuracy-item.good .accuracy-value { color: #3fb950; }
        .accuracy-item.medium .accuracy-value { color: #ffc107; }
        .accuracy-item.bad .accuracy-value { color: #f85149; }
        .accuracy-item.good .accuracy-tooltip-summary { color: #3fb950; }
        .accuracy-item.medium .accuracy-tooltip-summary { color: #ffc107; }
        .accuracy-item.bad .accuracy-tooltip-summary { color: #f85149; }
        .week-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          color: #8b949e;
        }
        .week-btn {
          background: transparent;
          border: none;
          color: #8b949e;
          padding: 2px;
          cursor: pointer;
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .week-btn:hover {
          color: #c9d1d9;
        }
        .fit-switch {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #8b949e;
          cursor: pointer;
          background: transparent;
          border: 1px solid #30363d;
          padding: 3px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .fit-switch:hover {
          background: #21262d;
        }
        .fit-switch.active {
          background: rgba(63, 185, 80, 0.15);
          color: #3fb950;
          border-color: #3fb950;
        }
      `}</style>

      <div className="forecast-card">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-gray-400 font-medium">CCTV WEIGHT</h3>
            {/* Chart Legend */}
            <div className="flex gap-2 text-[9px] text-gray-500 ml-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#3fb950] rounded-sm" />
                <span>{lang === 'ko' ? '3일 예측 구간' : '3-day Forecast Area'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#4da3ff] rounded-sm" />
                <span>{lang === 'ko' ? '표준 체중' : 'Standard Weight'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#808080] rounded-sm" />
                <span>{lang === 'ko' ? '예측무게' : 'Predicted Weight'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#ffc107] rounded-sm" />
                <span>{lang === 'ko' ? '3일예측' : '3-day Forecast'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="accuracy-indicators">
              <div className={`accuracy-item ${getAccuracyTone(Number(avgAccuracy.d1))}`}>
                <div className="accuracy-label">
                  <span className="day">D-1</span>
                  <span className="sub">{lang === 'ko' ? '1일 전' : '1 day'}</span>
                </div>
                <div className="accuracy-bar">
                  <div className="accuracy-bar-fill" style={{ width: `${avgAccuracy.d1}%` }}></div>
                </div>
                <span className="accuracy-value">{avgAccuracy.d1}%</span>
                <div className="accuracy-tooltip">
                  <div className="accuracy-tooltip-summary">{accuracyHoverInfo.d1.summary}</div>
                  {accuracyHoverInfo.d1.lines.map((line, idx) => (
                    <div key={`d1-${idx}`} className={`accuracy-tooltip-line ${line.tone}`}>
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>
              <div className={`accuracy-item ${getAccuracyTone(Number(avgAccuracy.d2))}`}>
                <div className="accuracy-label">
                  <span className="day">D-2</span>
                  <span className="sub">{lang === 'ko' ? '2일 전' : '2 days'}</span>
                </div>
                <div className="accuracy-bar">
                  <div className="accuracy-bar-fill" style={{ width: `${avgAccuracy.d2}%` }}></div>
                </div>
                <span className="accuracy-value">{avgAccuracy.d2}%</span>
                <div className="accuracy-tooltip">
                  <div className="accuracy-tooltip-summary">{accuracyHoverInfo.d2.summary}</div>
                  {accuracyHoverInfo.d2.lines.map((line, idx) => (
                    <div key={`d2-${idx}`} className={`accuracy-tooltip-line ${line.tone}`}>
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>
              <div className={`accuracy-item ${getAccuracyTone(Number(avgAccuracy.d3))}`}>
                <div className="accuracy-label">
                  <span className="day">D-3</span>
                  <span className="sub">{lang === 'ko' ? '3일 전' : '3 days'}</span>
                </div>
                <div className="accuracy-bar">
                  <div className="accuracy-bar-fill" style={{ width: `${avgAccuracy.d3}%` }}></div>
                </div>
                <span className="accuracy-value">{avgAccuracy.d3}%</span>
                <div className="accuracy-tooltip">
                  <div className="accuracy-tooltip-summary">{accuracyHoverInfo.d3.summary}</div>
                  {accuracyHoverInfo.d3.lines.map((line, idx) => (
                    <div key={`d3-${idx}`} className={`accuracy-tooltip-line ${line.tone}`}>
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="chart-container">
          <canvas ref={chartRef} />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Table Title & Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-400 font-medium">ROLLING FORECAST MATRIX</h3>
          <div className="flex items-center gap-3">
            <div className="week-nav">
              <button className="week-btn" onClick={() => setWeek(w => (w === 1 ? 3 : w - 1) as 1 | 2 | 3)}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>{weekLabels[week]}</span>
              <button className="week-btn" onClick={() => setWeek(w => (w === 3 ? 1 : w + 1) as 1 | 2 | 3)}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              className={`fit-switch ${!fitAll ? 'active' : ''}`}
              onClick={() => setFitAll(v => !v)}
            >
              <span>↕</span>
              <span>{fitAll ? (lang === 'ko' ? '전체보기' : 'All') : (lang === 'ko' ? '주간보기' : 'Weekly')}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="matrix-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>{lang === 'ko' ? '일령' : 'Age'}</th>
                {visibleColumns.map(({ col, idx }) => (
                  <th
                    key={idx}
                    className={`${col.isToday ? 'today-col' : ''} ${hoveredColumnIndex === idx ? 'hovered-col' : ''}`}
                  >
                    <span className="date-main">{col.dateMain[lang]}</span>
                    <span className="date-sub">{col.dateSub[lang]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="row-header">{lang === 'ko' ? row.age : row.age.replace('일령', 'd')}</td>
                  {visibleColumns.map(({ idx: colIdx }) => {
                    const cell = row.cells[colIdx];
                    const todayClass = columns[colIdx]?.isToday ? ' today-col' : '';
                    const hoveredClass = hoveredColumnIndex === colIdx ? ' hovered-col' : '';
                    if (!cell) return <td key={colIdx} className={`empty-cell${todayClass}${hoveredClass}`}>-</td>;

                    if (cell.type === 'prediction') {
                      return (
                        <td key={colIdx} className={`prediction-cell${todayClass}${hoveredClass}`}>
                          <span className="value">{cell.value}</span>
                          {cell.error && <span className={`error ${cell.errorClass}`}>{cell.error}</span>}
                        </td>
                      );
                    }
                    if (cell.type === 'actual') {
                      const checkText =
                        lang === 'ko'
                          ? cell.check
                              .replace(/✓/g, '')
                              .replace(/실측/g, '')
                              .replace(/[()]/g, '')
                              .replace(/\s+/g, ' ')
                              .trim()
                          : cell.check
                              .replace(/✓/g, '')
                              .replace('실측', 'Actual')
                              .replace(/[()]/g, '')
                              .trim();
                      return (
                        <td key={colIdx} className={`actual-cell${todayClass}${hoveredClass}`}>
                          <span className="value">{cell.value}</span>
                          <span className="check">{checkText}</span>
                        </td>
                      );
                    }
                    if (cell.type === 'future') {
                      return (
                        <td key={colIdx} className={`future-cell${todayClass}${hoveredClass}`}>
                          <span className="value">{cell.value}</span>
                          <span className="label">{cell.label}</span>
                        </td>
                      );
                    }
                    return <td key={colIdx} className={`empty-cell${todayClass}${hoveredClass}`}>{cell.value}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Legend */}
        <div className="legend">
          <div className="legend-item">
            <span className="legend-dot actual"></span>
            <span>{lang === 'ko' ? '실측' : 'Actual'}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot future"></span>
            <span>{lang === 'ko' ? '미래 예측' : 'Forecast'}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot good"></span>
            <span>{lang === 'ko' ? '오차 ±1%' : '±1%'}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot medium"></span>
            <span>{lang === 'ko' ? '오차 ±3%' : '±3%'}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot bad"></span>
            <span>{lang === 'ko' ? '오차 >±5%' : '>±5%'}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForecastMatrix;
