'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

type Cell =
  | { type: 'prediction'; value: string; error: string; errorClass: string; isToday: boolean }
  | { type: 'actual'; value: string; check: string; isToday: boolean }
  | { type: 'future'; value: string; label: string; isToday: boolean }
  | { type: 'empty'; value: string; isToday: boolean };

type Row = { age: string; cells: Cell[] };

const columns = [
  {
    "dateMain": {
      "ko": "1/20(월)",
      "en": "1/20(Mon)"
    },
    "dateSub": {
      "ko": "13일 전",
      "en": "13 days ago"
    },
    "isToday": false
  },
  {
    "dateMain": {
      "ko": "1/21(화)",
      "en": "1/21(Tue)"
    },
    "dateSub": {
      "ko": "12일 전",
      "en": "12 days ago"
    },
    "isToday": false
  },
  {
    "dateMain": {
      "ko": "1/22(수)",
      "en": "1/22(Wed)"
    },
    "dateSub": {
      "ko": "11일 전",
      "en": "11 days ago"
    },
    "isToday": false
  },
  {
    "dateMain": {
      "ko": "1/23(목)",
      "en": "1/23(Thu)"
    },
    "dateSub": {
      "ko": "10일 전",
      "en": "10 days ago"
    },
    "isToday": false
  },
  {
    "dateMain": {
      "ko": "1/24(금)",
      "en": "1/24(Fri)"
    },
    "dateSub": {
      "ko": "9일 전",
      "en": "9 days ago"
    },
    "isToday": false
  },
  {
    "dateMain": {
      "ko": "1/25(토)",
      "en": "1/25(Sat)"
    },
    "dateSub": {
      "ko": "8일 전",
      "en": "8 days ago"
    },
    "isToday": false
  },
  {
    "dateMain": {
      "ko": "1/26(일)",
      "en": "1/26(Sun)"
    },
    "dateSub": {
      "ko": "7일 전",
      "en": "7 days ago"
    },
    "isToday": false
  },
  {
    "dateMain": {
      "ko": "1/27(월)",
      "en": "1/27(Mon)"
    },
    "dateSub": {
      "ko": "6일 전",
      "en": "6 days ago"
    },
    "isToday": false
  },
  {
    "dateMain": {
      "ko": "1/28(화)",
      "en": "1/28(Tue)"
    },
    "dateSub": {
      "ko": "5일 전",
      "en": "5 days ago"
    },
    "isToday": false
  },
  {
    "dateMain": {
      "ko": "1/29(수)",
      "en": "1/29(Wed)"
    },
    "dateSub": {
      "ko": "4일 전",
      "en": "4 days ago"
    },
    "isToday": false
  },
  {
    "dateMain": {
      "ko": "1/30(목)",
      "en": "1/30(Thu)"
    },
    "dateSub": {
      "ko": "3일 전",
      "en": "3 days ago"
    },
    "isToday": false
  },
  {
    "dateMain": {
      "ko": "1/31(금)",
      "en": "1/31(Fri)"
    },
    "dateSub": {
      "ko": "2일 전",
      "en": "2 days ago"
    },
    "isToday": false
  },
  {
    "dateMain": {
      "ko": "2/1(토)",
      "en": "2/1(Sat)"
    },
    "dateSub": {
      "ko": "1일 전",
      "en": "1 day ago"
    },
    "isToday": false
  },
  {
    "dateMain": {
      "ko": "2/2(일)",
      "en": "2/2(Sun)"
    },
    "dateSub": {
      "ko": "오늘",
      "en": "Today"
    },
    "isToday": true
  }
] as const;
const rows = [
  {
    "age": "25일령",
    "cells": [
      {
        "type": "prediction",
        "value": "1,360g",
        "error": "-3.5%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,375g",
        "error": "-3.3%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,390g",
        "error": "-3.1%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "actual",
        "value": "1,405g",
        "check": "✓ 실측(+1.1% 15g)",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": true
      }
    ]
  },
  {
    "age": "26일령",
    "cells": [
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,405g",
        "error": "-3.0%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,420g",
        "error": "-2.8%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,435g",
        "error": "-1.5%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "actual",
        "value": "1,450g",
        "check": "✓ 실측(+1.0% 15g)",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": true
      }
    ]
  },
  {
    "age": "27일령",
    "cells": [
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,462g",
        "error": "-2.8%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,478g",
        "error": "-1.7%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,490g",
        "error": "-0.9%",
        "errorClass": "good",
        "isToday": false
      },
      {
        "type": "actual",
        "value": "1,504g",
        "check": "✓ 실측(+0.9% 14g)",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": true
      }
    ]
  },
  {
    "age": "28일령",
    "cells": [
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,520g",
        "error": "-3.7%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,538g",
        "error": "-2.5%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,558g",
        "error": "-1.3%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "actual",
        "value": "1,578g",
        "check": "✓ 실측(+1.3% 20g)",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": true
      }
    ]
  },
  {
    "age": "29일령",
    "cells": [
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,592g",
        "error": "-3.5%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,612g",
        "error": "-2.3%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,628g",
        "error": "-1.3%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "actual",
        "value": "1,650g",
        "check": "✓ 실측(+1.4% 22g)",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": true
      }
    ]
  },
  {
    "age": "30일령",
    "cells": [
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,658g",
        "error": "-2.2%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,670g",
        "error": "-1.5%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,680g",
        "error": "-0.9%",
        "errorClass": "good",
        "isToday": false
      },
      {
        "type": "actual",
        "value": "1,695g",
        "check": "✓ 실측(+0.9% 15g)",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": true
      }
    ]
  },
  {
    "age": "31일령",
    "cells": [
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,748g",
        "error": "-2.2%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,762g",
        "error": "-1.5%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,778g",
        "error": "-0.6%",
        "errorClass": "good",
        "isToday": false
      },
      {
        "type": "actual",
        "value": "1,788g",
        "check": "✓ 실측(+0.6% 10g)",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": true
      }
    ]
  },
  {
    "age": "32일령",
    "cells": [
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,842g",
        "error": "-2.1%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,858g",
        "error": "-1.3%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,872g",
        "error": "-0.5%",
        "errorClass": "good",
        "isToday": false
      },
      {
        "type": "actual",
        "value": "1,882g",
        "check": "✓ 실측(+0.5% 10g)",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": true
      }
    ]
  },
  {
    "age": "33일령",
    "cells": [
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,935g",
        "error": "-1.9%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,952g",
        "error": "-1.0%",
        "errorClass": "good",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "1,965g",
        "error": "-0.4%",
        "errorClass": "good",
        "isToday": false
      },
      {
        "type": "actual",
        "value": "1,972g",
        "check": "✓ 실측(+0.4% 7g)",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": true
      }
    ]
  },
  {
    "age": "34일령",
    "cells": [
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "2,032g",
        "error": "-1.9%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "2,045g",
        "error": "-1.0%",
        "errorClass": "good",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "2,060g",
        "error": "-0.4%",
        "errorClass": "good",
        "isToday": false
      },
      {
        "type": "actual",
        "value": "2,075g",
        "check": "✓ 실측(+0.7% 15g)",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": true
      }
    ]
  },
  {
    "age": "35일령",
    "cells": [
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "2,135g",
        "error": "-1.9%",
        "errorClass": "medium",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "2,150g",
        "error": "-1.0%",
        "errorClass": "good",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "2,165g",
        "error": "-0.4%",
        "errorClass": "good",
        "isToday": false
      },
      {
        "type": "actual",
        "value": "2,180g",
        "check": "✓ 실측(+0.7% 15g)",
        "isToday": true
      }
    ]
  },
  {
    "age": "36일령",
    "cells": [
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "2,250g",
        "error": "",
        "errorClass": "",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "2,265g",
        "error": "",
        "errorClass": "",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "2,280g",
        "error": "",
        "errorClass": "",
        "isToday": true
      }
    ]
  }
] as Row[];

const weekLabels: Record<number, string> = {
  1: '1/20~1/26',
  2: '1/27~2/2',
};

const rootStyle = {
  '--bg-primary': '#0a0a0f',
  '--bg-card': '#1a1a24',
  '--border-color': '#2a2a3a',
  '--text-primary': '#f0f0f5',
  '--text-secondary': '#8888a0',
  '--text-muted': '#555568',
  '--accent-primary': '#00d4aa',
  '--warning': '#ffc107',
  '--danger': '#ff6b6b',
  background: '#0a0a0f',
  color: '#f0f0f5',
  fontFamily: "'Noto Sans KR', -apple-system, sans-serif",
  padding: 32,
  minHeight: '100vh',
} as CSSProperties & Record<string, string | number>;

export default function Matrix3DJsPage() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [fitAll, setFitAll] = useState(false);
  const [week, setWeek] = useState<1 | 2>(2);

  const visibleColumns = useMemo(() => {
    if (fitAll) return columns.map((col, idx) => ({ col, idx, week: idx < 7 ? 1 : 2 }));
    return columns
      .map((col, idx) => ({ col, idx, week: idx < 7 ? 1 : 2 }))
      .filter(item => item.week === week);
  }, [fitAll, week]);

  const visibleRows = useMemo(() => {
    return rows
      .filter(row => {
        const ageNum = Number(String(row.age).replace(/\D/g, ''));
        if (Number.isNaN(ageNum)) return true;
        if (fitAll) return true;
        if (week === 1) return ageNum >= 25 && ageNum <= 31; // 1/20~1/26: 25~31일령
        return ageNum >= 32 && ageNum <= 38; // 1/27~2/2: 32~38일령
      })
      .slice()
      .sort((a, b) => {
        const aNum = Number(String(a.age).replace(/\D/g, ''));
        const bNum = Number(String(b.age).replace(/\D/g, ''));
        if (Number.isNaN(aNum) || Number.isNaN(bNum)) return 0;
        return bNum - aNum;
      });
  }, [fitAll, week]);

  return (
    <div className="matrix-page" style={rootStyle}>
      <style jsx>{`\n@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');\n.matrix-page {
            --bg-primary: #0a0a0f;
            --bg-card: #1a1a24;
            --border-color: #2a2a3a;
            --text-primary: #f0f0f5;
            --text-secondary: #8888a0;
            --text-muted: #555568;
            --accent-primary: #00d4aa;
            --warning: #ffc107;
            --danger: #ff6b6b;}
.matrix-page * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;}
.matrix-page {
            font-family: 'Noto Sans KR', -apple-system, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 32px;
            min-height: 100vh;}
.matrix-page .card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 2px;
            padding: 24px;
            width: fit-content;
            min-width: 100%;}
.matrix-page .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;}
.matrix-page .card-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 15px;
            font-weight: 600;}
.matrix-page .card-subtitle {
            font-size: 12px;
            color: var(--text-muted);}
.matrix-page .header-controls {
            display: flex;
            align-items: center;
            gap: 16px;}
.matrix-page .fit-switch {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--text-secondary);
            cursor: pointer;
            background: transparent;
            border: none;
            font: inherit;
            padding: 4px 8px;
            border-radius: 2px;
            transition: all 0.2s;}
.matrix-page .fit-switch:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-primary);}
.matrix-page .fit-switch.active {
            background: rgba(0, 212, 170, 0.15);
            color: var(--accent-primary);}
.matrix-page /* 언어 스위치 */
        .lang-switch {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--text-secondary);}
.matrix-page .lang-switch span {
            cursor: pointer;
            background: transparent;
            border: none;
            font: inherit;
            padding: 4px 8px;
            border-radius: 2px;
            transition: all 0.2s;}
.matrix-page .lang-switch span.active {
            background: rgba(0, 212, 170, 0.15);
            color: var(--accent-primary);}
.matrix-page .lang-switch span:hover:not(.active) {
            background: rgba(255, 255, 255, 0.05);}
.matrix-page /* 테이블 스타일 */
        .table-wrapper {
            max-height: none;
            overflow-y: visible;
            overflow-x: auto;
            transition: max-height 0.3s ease;}
.matrix-page .table-wrapper.fit-all {
            max-height: none;
            overflow-y: visible;
            /* Large enough value */}
.matrix-page .matrix-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;}
.matrix-page .matrix-table thead {
            position: sticky;
            top: 0;
            background: var(--bg-card);
            z-index: 1;}
.matrix-page .matrix-table th, .matrix-page .matrix-table td {
            padding: 6px 8px;
            text-align: center;
            border-bottom: 1px solid var(--border-color);
            height: 45px;
            min-width: 110px;}
.matrix-page /* Left "예측 대상" column: narrower after removing labels */
        .matrix-table th:first-child, .matrix-page .matrix-table td.row-header {
            min-width: 80px;
            padding-left: 6px;
            padding-right: 6px;}
.matrix-page .matrix-table thead th {
            font-weight: 500;
            color: var(--text-secondary);
            font-size: 11px;
            padding-bottom: 8px;}
.matrix-page .matrix-table thead th .date-main {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 2px;}
.matrix-page .matrix-table thead th .date-sub {
            font-size: 10px;
            color: var(--text-muted);}
.matrix-page .matrix-table thead th.today-col {
            background: rgba(0, 212, 170, 0.1);}
.matrix-page /* 행 헤더 (일령) */
        .row-header {
            text-align: left !important;
            font-weight: 500;
            color: var(--text-secondary);
            white-space: nowrap;}
.matrix-page .row-header .age {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);}
.matrix-page .row-header .label {
            font-size: 10px;
            color: var(--text-muted);}
.matrix-page /* 예측 셀 */
        .prediction-cell {
            position: relative;
            font-weight: 500;
            font-variant-numeric: tabular-nums;}
.matrix-page .prediction-cell .value {
            display: block;
            font-size: 14px;}
.matrix-page .prediction-cell .error {
            display: block;
            font-size: 10px;
            margin-top: 2px;}
.matrix-page .prediction-cell .error.good {
            color: var(--accent-primary);}
.matrix-page .prediction-cell .error.medium {
            color: var(--warning);}
.matrix-page .prediction-cell .error.bad {
            color: var(--danger);}
.matrix-page /* 화살표 */
        .arrow {
            color: var(--text-muted);
            font-size: 12px;}
.matrix-page /* 실측(오늘) 컬럼 */
        .today-col {
            background: rgba(0, 212, 170, 0.08);}
.matrix-page .actual-cell {
            background: rgba(0, 212, 170, 0.15);
            position: relative;}
.matrix-page .actual-cell.today-col {
            background: rgba(0, 212, 170, 0.15);}
.matrix-page .actual-cell .value {
            color: var(--accent-primary);
            font-weight: 700;}
.matrix-page .actual-cell .check {
            font-size: 10px;
            color: var(--accent-primary);
            display: block;
            margin-top: 2px;}
.matrix-page /* 미래 예측 (아직 실측 없음) */
        .future-cell {
            background: rgba(255, 193, 7, 0.08);}
.matrix-page .future-cell .value {
            color: var(--warning);}
.matrix-page .future-cell .label {
            font-size: 9px;
            color: var(--text-muted);}
.matrix-page /* 빈 셀 */
        .empty-cell {
            color: var(--text-muted);
            background: transparent;}
.matrix-page /* 오늘 컬럼 빈 셀도 배경색 적용 */
        .empty-cell.today-col {
            background: rgba(0, 212, 170, 0.08);}
.matrix-page /* 범례 */
        .legend {
            display: flex;
            gap: 20px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--border-color);
            font-size: 11px;}
.matrix-page .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--text-secondary);}
.matrix-page .legend-dot {
            width: 8px;
            height: 8px;
            border-radius: 0;}
.matrix-page .legend-dot.actual {
            background: var(--accent-primary);}
.matrix-page .legend-dot.future {
            background: var(--warning);}
.matrix-page .legend-dot.good {
            background: var(--accent-primary);}
.matrix-page .legend-dot.medium {
            background: var(--warning);}
.matrix-page .legend-dot.bad {
            background: var(--danger);}
.matrix-page /* 행 호버 효과 */
        .matrix-table tbody tr:hover {
            background: rgba(255, 255, 255, 0.02);}
.matrix-page /* 결과 행 강조 - 투명 */
        .result-row {
            background: transparent;}
.matrix-page /* 주간 페이지 전환 */
        .week-nav {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
            color: var(--text-secondary);
            font-size: 12px;}
.matrix-page .week-btn {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            padding: 4px 8px;
            cursor: pointer;
            border-radius: 2px;
            transition: all 0.2s;}
.matrix-page .week-btn:hover {
            color: var(--text-primary);
            border-color: var(--text-muted);}
.matrix-page .week-label {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;}\n`}</style>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <span>📊</span>
              <span>Rolling Forecast Matrix</span>
            </div>
            <div className="card-subtitle">
              {lang === 'ko'
                ? '예측값이 실측에 수렴하는 과정 추적'
                : 'Tracking prediction convergence to actual values'}
            </div>
          </div>
          <div className="header-controls">
            <button
              type="button"
              className={`fit-switch ${fitAll ? 'active' : ''}`}
              onClick={() => setFitAll(v => !v)}
            >
              <span className="icon">↕</span>
              <span>{lang === 'ko' ? '전체 보기' : 'Fit All'}</span>
            </button>
            <div className="lang-switch">
              <span
                className={lang === 'ko' ? 'active' : ''}
                onClick={() => setLang('ko')}
              >
                KO
              </span>
              <span
                className={lang === 'en' ? 'active' : ''}
                onClick={() => setLang('en')}
              >
                EN
              </span>
            </div>
          </div>
        </div>

        <div className="week-nav">
          <button className="week-btn" onClick={() => setWeek(w => (w === 1 ? 2 : 1))}>←</button>
          <div className="week-label" id="weekLabel">{weekLabels[week]}</div>
          <button className="week-btn" onClick={() => setWeek(w => (w === 2 ? 1 : 2))}>→</button>
        </div>

        <div className={`table-wrapper ${fitAll ? 'fit-all' : ''}`}>
          <table className="matrix-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>{lang === 'ko' ? '예측 대상' : 'Target'}</th>
                {visibleColumns.map(({ col, idx }) => (
                  <th key={idx} className={col.isToday ? 'today-col' : ''}>
                    <span className="date-main">{col.dateMain[lang]}</span>
                    <span className="date-sub">{col.dateSub[lang]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="scrollable-body">
              {visibleRows.map((row, rowIdx) => (
                <tr className="result-row" key={`${row.age}-${rowIdx}`}>
                  <td className="row-header">
                    <span className="age">{row.age}</span>
                  </td>
                  {visibleColumns.map(({ idx, col }, colIdx) => {
                    const cell = row.cells[idx];
                    if (!cell) return <td key={colIdx} className="empty-cell">-</td>;
                    const todayClass = cell.isToday || col.isToday ? ' today-col' : '';

                    if (cell.type === 'prediction') {
                      return (
                        <td key={colIdx} className={`prediction-cell${todayClass}`}>
                          <span className="value">{cell.value}</span>
                          <span className={`error ${cell.errorClass}`}>{cell.error}</span>
                        </td>
                      );
                    }

                    if (cell.type === 'actual') {
                      return (
                        <td key={colIdx} className={`actual-cell${todayClass}`}>
                          <span className="value">{cell.value}</span>
                          <span className="check">{cell.check}</span>
                        </td>
                      );
                    }

                    if (cell.type === 'future') {
                      return (
                        <td key={colIdx} className={`future-cell${todayClass}`}>
                          <span className="value">{cell.value}</span>
                          <span className="label">{cell.label}</span>
                        </td>
                      );
                    }

                    return (
                      <td key={colIdx} className={`empty-cell${todayClass}`}>
                        {cell.value || '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="legend">
          <div className="legend-item">
            <span className="legend-dot actual"></span>
            <span>{lang === 'ko' ? '실측' : 'Actual'}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot future"></span>
            <span>{lang === 'ko' ? '미래 예측' : 'Future Forecast'}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot good"></span>
            <span>{lang === 'ko' ? '오차 ±1% 이내' : 'Error ±1%'}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot medium"></span>
            <span>{lang === 'ko' ? '오차 ±3% 이내' : 'Error ±3%'}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot bad"></span>
            <span>{lang === 'ko' ? '오차 ±5% 초과' : 'Error >±5%'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
