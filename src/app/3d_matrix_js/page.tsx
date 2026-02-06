'use client';

// Demo/experimental page; not used by /dashboard. Do not apply dashboard fixes here.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    Chart?: any;
  }
}

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
  },
  {
    "dateMain": {
      "ko": "2/3(월)",
      "en": "2/3(Mon)"
    },
    "dateSub": {
      "ko": "내일",
      "en": "Tomorrow"
    },
    "isToday": false
  },
  {
    "dateMain": {
      "ko": "2/4(화)",
      "en": "2/4(Tue)"
    },
    "dateSub": {
      "ko": "모레",
      "en": "In 2 days"
    },
    "isToday": false
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
      }
    ]
  },
  {
    "age": "37일령",
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
        "type": "empty",
        "value": "-",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "2,320g",
        "error": "",
        "errorClass": "",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "2,340g",
        "error": "",
        "errorClass": "",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "2,360g",
        "error": "",
        "errorClass": "",
        "isToday": false
      },
      {
        "type": "empty",
        "value": "-",
        "isToday": false
      }
    ]
  },
  {
    "age": "38일령",
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
        "value": "2,385g",
        "error": "",
        "errorClass": "",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "2,405g",
        "error": "",
        "errorClass": "",
        "isToday": false
      },
      {
        "type": "prediction",
        "value": "2,425g",
        "error": "",
        "errorClass": "",
        "isToday": false
      }
    ]
  }
] as Row[];

const weekLabels: Record<number, string> = {
  1: '1/20~1/21',
  2: '1/22~1/28',
  3: '1/29~2/4',
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
  '--info': '#74b9ff',
  '--orange': '#fdcb6e',
  '--purple': '#a29bfe',
  '--accent-glow': 'rgba(0, 212, 170, 0.15)',
  background: '#0a0a0f',
  color: '#f0f0f5',
  fontFamily: "'Noto Sans KR', -apple-system, sans-serif",
  padding: 32,
  minHeight: '100vh',
} as CSSProperties & Record<string, string | number>;

export default function Matrix3DJsPage() {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [fitAll, setFitAll] = useState(false);
  const [week, setWeek] = useState<1 | 2 | 3>(3);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const maxDay = 47;

  // D-1, D-2, D-3 평균 정확도 계산
  const avgAccuracy = useMemo(() => {
    // 실측값 (dayIndex 27~36, 1/23~2/1)
    const actualData = [
      { x: 27, y: 1405 }, { x: 28, y: 1450 }, { x: 29, y: 1504 },
      { x: 30, y: 1578 }, { x: 31, y: 1650 }, { x: 32, y: 1695 },
      { x: 33, y: 1788 }, { x: 34, y: 1882 }, { x: 35, y: 1972 },
      { x: 36, y: 2075 },
    ];
    // D-1, D-2, D-3 예측값
    const d1Data = [
      { x: 27, y: 1390 }, { x: 28, y: 1435 }, { x: 29, y: 1490 },
      { x: 30, y: 1558 }, { x: 31, y: 1628 }, { x: 32, y: 1680 },
      { x: 33, y: 1778 }, { x: 34, y: 1872 }, { x: 35, y: 1965 },
      { x: 36, y: 2060 },
    ];
    const d2Data = [
      { x: 27, y: 1375 }, { x: 28, y: 1420 }, { x: 29, y: 1478 },
      { x: 30, y: 1538 }, { x: 31, y: 1612 }, { x: 32, y: 1670 },
      { x: 33, y: 1762 }, { x: 34, y: 1858 }, { x: 35, y: 1952 },
      { x: 36, y: 2045 },
    ];
    const d3Data = [
      { x: 27, y: 1360 }, { x: 28, y: 1405 }, { x: 29, y: 1462 },
      { x: 30, y: 1520 }, { x: 31, y: 1592 }, { x: 32, y: 1658 },
      { x: 33, y: 1748 }, { x: 34, y: 1842 }, { x: 35, y: 1935 },
      { x: 36, y: 2032 },
    ];

    const calcAvgAccuracy = (predictions: { x: number; y: number }[]) => {
      let totalError = 0;
      let count = 0;
      predictions.forEach((pred, idx) => {
        const actual = actualData[idx];
        if (actual) {
          const errorPct = Math.abs((pred.y - actual.y) / actual.y * 100);
          totalError += errorPct;
          count++;
        }
      });
      const avgError = count > 0 ? totalError / count : 0;
      return Math.max(0, 100 - avgError).toFixed(1);
    };

    return {
      d1: calcAvgAccuracy(d1Data),
      d2: calcAvgAccuracy(d2Data),
      d3: calcAvgAccuracy(d3Data),
    };
  }, []);
  const dateMaps = useMemo(() => {
    const baseDate = new Date(2025, 11, 27);
    const weekdaysKo = ['일', '월', '화', '수', '목', '금', '토'];
    const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mapKo = new Map<number, string>();
    const mapEn = new Map<number, string>();
    for (let d = 0; d <= maxDay; d += 1) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + d);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      mapKo.set(d, `${month}/${day}(${weekdaysKo[date.getDay()]})`);
      mapEn.set(d, `${month}/${day}(${weekdaysEn[date.getDay()]})`);
    }
    return { ko: mapKo, en: mapEn };
  }, [maxDay]);
  const dateMap = lang === 'ko' ? dateMaps.ko : dateMaps.en;

  const [chartReady, setChartReady] = useState(false);

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
        if (week === 1) return ageNum >= 25 && ageNum <= 31; // 1/20~1/21: 25~31일령
        if (week === 2) return ageNum >= 25 && ageNum <= 31; // 1/22~1/28: 25~31일령
        return ageNum >= 32 && ageNum <= 38; // 1/29~2/4: 32~38일령
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
    let alive = true;

    const toNumber = (value: string) => Number(value.replace(/,/g, '').replace('g', '').trim());

    const columnDates = columns.map(col => col.dateMain.ko);
    const tableValueByDate = new Map<string, { value: number; type: string }>();
    const actualValueByDate = new Map<string, number>();

    rows.forEach(row => {
      row.cells.forEach((cell, idx) => {
        const dateKey = columnDates[idx];
        if (!dateKey) return;
        if (!('value' in cell)) return;
        if (!cell.value || cell.value === '-') return;
        const value = toNumber(cell.value);
        if (!Number.isFinite(value)) return;
        if (cell.type === 'actual') {
          actualValueByDate.set(dateKey, value);
        }
        const existing = tableValueByDate.get(dateKey);
        // prefer actual > prediction > future
        const rank = cell.type === 'actual' ? 3 : cell.type === 'prediction' ? 2 : cell.type === 'future' ? 1 : 0;
        const existingRank = existing?.type === 'actual' ? 3 : existing?.type === 'prediction' ? 2 : existing?.type === 'future' ? 1 : 0;
        if (!existing || rank >= existingRank) {
          tableValueByDate.set(dateKey, { value, type: cell.type });
        }
      });
    });

    const dayIndexByDate = new Map<string, number>();
    dateMaps.ko.forEach((label, dayIndex) => {
      dayIndexByDate.set(label, dayIndex);
    });

    const tablePoints = Array.from(tableValueByDate.entries())
      .map(([date, payload]) => ({
        x: dayIndexByDate.get(date),
        y: payload.value,
      }))
      .filter(point => typeof point.x === 'number') as { x: number; y: number }[];

    // 과거 데이터 (12/27~1/22, dayIndex 0~26) - 10% 내외 랜덤 오차 적용
    // 기준: 45g(1일령) ~ 1350g(1/22) 선형 증가에 ±10% 오차
    const historyPoints = [
      { x: 0, y: 45 },    // 12/27 - 1일령
      { x: 1, y: 52 },    // 12/28 - 2일령
      { x: 2, y: 68 },    // 12/29 - 3일령
      { x: 3, y: 89 },    // 12/30 - 4일령
      { x: 4, y: 115 },   // 12/31 - 5일령
      { x: 5, y: 148 },   // 1/1 - 6일령
      { x: 6, y: 178 },   // 1/2 - 7일령
      { x: 7, y: 215 },   // 1/3 - 8일령
      { x: 8, y: 262 },   // 1/4 - 9일령
      { x: 9, y: 305 },   // 1/5 - 10일령
      { x: 10, y: 358 },  // 1/6 - 11일령
      { x: 11, y: 412 },  // 1/7 - 12일령
      { x: 12, y: 478 },  // 1/8 - 13일령
      { x: 13, y: 535 },  // 1/9 - 14일령
      { x: 14, y: 598 },  // 1/10 - 15일령
      { x: 15, y: 672 },  // 1/11 - 16일령
      { x: 16, y: 738 },  // 1/12 - 17일령
      { x: 17, y: 815 },  // 1/13 - 18일령
      { x: 18, y: 885 },  // 1/14 - 19일령
      { x: 19, y: 962 },  // 1/15 - 20일령
      { x: 20, y: 1035 }, // 1/16 - 21일령
      { x: 21, y: 1108 }, // 1/17 - 22일령
      { x: 22, y: 1175 }, // 1/18 - 23일령
      { x: 23, y: 1248 }, // 1/19 - 24일령
      { x: 24, y: 1295 }, // 1/20 - 25일령 (예측시작일)
      { x: 25, y: 1328 }, // 1/21 - 26일령
      { x: 26, y: 1362 }, // 1/22 - 27일령
    ];

    // 실측값 (1/23=dayIndex27 ~ 2/2=dayIndex37) + 예측값 (2/3~2/4)
    const actualPoints = [
      { x: 27, y: 1405 },  // 1/23 - 25일령
      { x: 28, y: 1450 },  // 1/24 - 26일령
      { x: 29, y: 1504 },  // 1/25 - 27일령
      { x: 30, y: 1578 },  // 1/26 - 28일령
      { x: 31, y: 1650 },  // 1/27 - 29일령
      { x: 32, y: 1695 },  // 1/28 - 30일령
      { x: 33, y: 1788 },  // 1/29 - 31일령
      { x: 34, y: 1882 },  // 1/30 - 32일령
      { x: 35, y: 1972 },  // 1/31 - 33일령
      { x: 36, y: 2075 },  // 2/1 - 34일령
      { x: 37, y: 2385 },  // 2/2 - 36일령 (오늘 예측)
      { x: 38, y: 2405 },  // 2/3 - 36일령 (오늘 예측)
      { x: 39, y: 2425 },  // 2/4 - 37일령 (오늘 예측)
    ];

    // D-3 예측값 (3일전 예측)
    const d3Points = [
      { x: 27, y: 1360 },  // 1/23 - 1/20 예측
      { x: 28, y: 1405 },  // 1/24 - 1/21 예측
      { x: 29, y: 1462 },  // 1/25 - 1/22 예측
      { x: 30, y: 1520 },  // 1/26 - 1/23 예측
      { x: 31, y: 1592 },  // 1/27 - 1/24 예측
      { x: 32, y: 1658 },  // 1/28 - 1/25 예측
      { x: 33, y: 1748 },  // 1/29 - 1/26 예측
      { x: 34, y: 1842 },  // 1/30 - 1/27 예측
      { x: 35, y: 1935 },  // 1/31 - 1/28 예측
      { x: 36, y: 2032 },  // 2/1 - 1/29 예측
      { x: 37, y: 2135 },  // 2/2 - 1/30 예측
      { x: 38, y: 2250 },  // 2/3 - 1/31 예측 (36일령)
      { x: 39, y: 2320 },  // 2/4 - 2/1 예측 (37일령)
    ];

    // D-2 예측값 (2일전 예측)
    const d2Points = [
      { x: 27, y: 1375 },  // 1/23 - 1/21 예측
      { x: 28, y: 1420 },  // 1/24 - 1/22 예측
      { x: 29, y: 1478 },  // 1/25 - 1/23 예측
      { x: 30, y: 1538 },  // 1/26 - 1/24 예측
      { x: 31, y: 1612 },  // 1/27 - 1/25 예측
      { x: 32, y: 1670 },  // 1/28 - 1/26 예측
      { x: 33, y: 1762 },  // 1/29 - 1/27 예측
      { x: 34, y: 1858 },  // 1/30 - 1/28 예측
      { x: 35, y: 1952 },  // 1/31 - 1/29 예측
      { x: 36, y: 2045 },  // 2/1 - 1/30 예측
      { x: 37, y: 2150 },  // 2/2 - 1/31 예측
      { x: 38, y: 2265 },  // 2/3 - 2/1 예측 (36일령)
      { x: 39, y: 2340 },  // 2/4 - 2/2 예측 (37일령)
    ];

    // D-1 예측값 (1일전 예측)
    const d1Points = [
      { x: 27, y: 1390 },  // 1/23 - 1/22 예측
      { x: 28, y: 1435 },  // 1/24 - 1/23 예측
      { x: 29, y: 1490 },  // 1/25 - 1/24 예측
      { x: 30, y: 1558 },  // 1/26 - 1/25 예측
      { x: 31, y: 1628 },  // 1/27 - 1/26 예측
      { x: 32, y: 1680 },  // 1/28 - 1/27 예측
      { x: 33, y: 1778 },  // 1/29 - 1/28 예측
      { x: 34, y: 1872 },  // 1/30 - 1/29 예측
      { x: 35, y: 1965 },  // 1/31 - 1/30 예측
      { x: 36, y: 2060 },  // 2/1 - 1/31 예측
      { x: 37, y: 2165 },  // 2/2 - 2/1 예측
      { x: 38, y: 2280 },  // 2/3 - 2/2 예측 (36일령, 오늘)
      { x: 39, y: 2360 },  // 2/4 - 2/3 예측 (37일령)
    ];

    tablePoints.sort((a, b) => a.x - b.x);

    // X축 범위: 12/27(1일령, dayIndex=0) ~ 2/5(dayIndex=40) - 오른쪽 여백 포함
    const chartMinIndex = 0; // 12/27(토) = 1일령
    const chartMaxIndex = (dayIndexByDate.get('2/4(화)') ?? 39) + 1; // +1 여백

    const baseSeries = actualPoints.length ? actualPoints : tablePoints;
    const standardPoints = baseSeries.map(point => ({
      x: point.x,
      y: Math.round(point.y * 1.02),
    }));

    // 3일 예측영역: 1/23(dayIndex=27) ~ 2/4까지만
    const forecastStartIndex = 27; // 1/23(목) - 첫 실측일
    const forecastAreaPoints: { x: number; y: number }[] = [];
    let lastValue = actualPoints[0]?.y ?? 0;
    for (let d = forecastStartIndex; d <= chartMaxIndex; d += 1) {
      const match = actualPoints.find(p => p.x === d);
      if (match) lastValue = match.y;
      forecastAreaPoints.push({ x: d, y: lastValue });
    }

    const todayLabel = '2/2(일)';
    const todayDay = dayIndexByDate.get(todayLabel) ?? chartMaxIndex;
    const forecastLinePoints = [
      { x: todayDay, y: (actualPoints.find(p => p.x === todayDay)?.y ?? lastValue) },
      { x: todayDay + 1, y: (actualPoints.find(p => p.x === todayDay + 1)?.y ?? lastValue) },
      { x: todayDay + 2, y: (actualPoints.find(p => p.x === todayDay + 2)?.y ?? lastValue) },
      { x: todayDay + 3, y: (actualPoints.find(p => p.x === todayDay + 3)?.y ?? lastValue) },
    ];

    if (!chartReady || !window.Chart || !chartRef.current) return;
    const Chart = window.Chart;
      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // 툴팁용 데이터 맵 (dayIndex -> { actual, d1, d2, d3, dates })
      const tooltipDataMap = new Map<number, { actual: number; d1: number; d2: number; d3: number; d1Date: string; d2Date: string; d3Date: string }>();
      actualPoints.forEach((pt, idx) => {
        tooltipDataMap.set(pt.x, {
          actual: pt.y,
          d1: d1Points[idx]?.y ?? 0,
          d2: d2Points[idx]?.y ?? 0,
          d3: d3Points[idx]?.y ?? 0,
          d1Date: dateMap.get(pt.x - 1) ?? '',
          d2Date: dateMap.get(pt.x - 2) ?? '',
          d3Date: dateMap.get(pt.x - 3) ?? '',
        });
      });

      // 과거 데이터 (12/27~1/22) + 1/23 첫 점 연결용
      const historyWithLink = [...historyPoints, { x: 27, y: 1405 }];
      // 실측값 (1/23~2/2)
      const actualOnlyPoints = actualPoints.filter(pt => pt.x <= 37);
      // 오늘 (2/2, dayIndex 37) - 오늘 예측값
      const todayPoint = [{ x: 37, y: 2385 }];
      // 예측값 (2/2~2/4) - 2/2에서 연결되도록
      const forecastPoints = actualPoints.filter(pt => pt.x >= 37);

      // 오늘 텍스트 표시 플러그인
      const todayLabelPlugin = {
        id: 'todayLabel',
        afterDraw: (chart: any) => {
          const ctx = chart.ctx;
          const xScale = chart.scales.x;
          const yScale = chart.scales.y;
          const todayX = xScale.getPixelForValue(37); // 2/2 dayIndex
          const todayY = yScale.getPixelForValue(2385); // 오늘 예측값

          ctx.save();
          ctx.font = 'bold 12px "Noto Sans KR", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(lang === 'ko' ? '오늘' : 'Today', todayX, todayY - 12);
          ctx.restore();
        },
      };

      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        plugins: [todayLabelPlugin],
        data: {
          datasets: [
            {
              label: lang === 'ko' ? '예측 영역' : 'Forecast Area',
              data: actualPoints, // 1/23~2/4 전체
              borderColor: 'transparent',
              backgroundColor: 'rgba(0, 212, 170, 0.15)',
              pointRadius: 0,
              borderWidth: 0,
              fill: 'origin',
              tension: 0.35,
              order: 5, // 가장 뒤
            },
            {
              label: lang === 'ko' ? '과거 데이터' : 'History',
              data: historyWithLink,
              borderColor: '#808080',
              backgroundColor: '#808080',
              pointBackgroundColor: '#808080',
              pointBorderColor: '#808080',
              pointRadius: 3,
              pointHoverRadius: 5,
              borderWidth: 1.5,
              tension: 0.35,
              order: 4,
            },
            {
              label: lang === 'ko' ? '실측값' : 'Actual',
              data: actualOnlyPoints,
              borderColor: '#00d4aa',
              backgroundColor: '#00d4aa',
              pointBackgroundColor: '#00d4aa',
              pointBorderColor: '#00d4aa',
              pointRadius: 6,
              pointHoverRadius: 8,
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
              pointRadius: 6,
              pointHoverRadius: 8,
              borderWidth: 2,
              borderDash: [6, 4],
              tension: 0.35,
              order: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onHover: (event: any, elements: any[], chart: any) => {
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

                const data = tooltipDataMap.get(dayIndex);
                if (!data) return;

                const dateLabel = dateMap.get(dayIndex) ?? '';

                // 오차 계산 함수
                const calcError = (predicted: number, actual: number) => {
                  const diff = predicted - actual;
                  const pct = ((diff / actual) * 100).toFixed(1);
                  const sign = diff >= 0 ? '+' : '';
                  const isPass = Math.abs(diff / actual * 100) <= 3;
                  return { pct: `${sign}${pct}%`, diff: Math.abs(diff), isPass };
                };

                let html = `<div style="font-weight:600; margin-bottom:8px;">${dateLabel}</div>`;

                // T/F 박스 스타일 (실측용)
                const tfBox = (isPass: boolean) => `<span style="display:inline-block; width:18px; height:18px; line-height:18px; text-align:center; background:${isPass ? '#74b9ff' : '#ff6b6b'}; color:#000; font-weight:bold; font-size:11px; border-radius:4px; margin-right:6px;">${isPass ? 'T' : 'F'}</span>`;
                // T/F 텍스트 스타일 (예측용)
                const tfText = (isPass: boolean) => `<span style="color:${isPass ? '#74b9ff' : '#ff6b6b'}; font-weight:bold; margin-right:4px;">${isPass ? 'T' : 'F'}</span>`;

                if (dayIndex >= 37) {
                  // 2/2~2/4: 오늘 예측만
                  html += `<div>오늘 예측: ${data.actual.toLocaleString()}g</div>`;
                } else {
                  // 과거: 실측 + D-1, D-2, D-3
                  const e1 = calcError(data.d1, data.actual);
                  const e2 = calcError(data.d2, data.actual);
                  const e3 = calcError(data.d3, data.actual);

                  // 실측: 박스 스타일 (D-1 기준)
                  html += `<div style="margin-bottom:8px;">${tfBox(e1.isPass)} 실측: ${data.actual.toLocaleString()}g (${e1.pct} ${e1.diff}g)</div>`;
                  html += `<div style="margin-top:4px;">`;
                  // 예측: 텍스트 스타일 + 오차값
                  html += `<div style="margin-bottom:4px;">${tfText(e1.isPass)} D-1 (${data.d1Date}): ${data.d1.toLocaleString()}g (${e1.pct} ${e1.diff}g)</div>`;
                  html += `<div style="margin-bottom:4px;">${tfText(e2.isPass)} D-2 (${data.d2Date}): ${data.d2.toLocaleString()}g (${e2.pct} ${e2.diff}g)</div>`;
                  html += `<div>${tfText(e3.isPass)} D-3 (${data.d3Date}): ${data.d3.toLocaleString()}g (${e3.pct} ${e3.diff}g)</div>`;
                  html += `</div>`;
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
              min: chartMinIndex,
              max: chartMaxIndex,
              grid: { color: 'rgba(255, 255, 255, 0.06)' },
              ticks: {
                color: (context: any) => {
                  const value = context.tick?.value;
                  return value === 37 ? '#00d4aa' : '#8888a0'; // 2/2(오늘)만 초록색
                },
                stepSize: 2,
                callback: (value: any) => {
                  const day = Number(value);
                  if (!Number.isFinite(day)) return '';
                  if (day % 2 !== 0) return ''; // 2일마다 표시
                  const date = dateMap.get(day);
                  return date || '';
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
      alive = false;
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [lang, chartReady]);

  const hoveredDate = hoveredDay != null ? dateMaps.ko.get(hoveredDay) : null;
  const hoveredColumnIndex = hoveredDate
    ? columns.findIndex(col => col.dateMain[lang] === hoveredDate)
    : null;

  return (
    <div className="matrix-page" style={rootStyle}>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="afterInteractive"
        onLoad={() => setChartReady(true)}
      />
      <style jsx>{`\n@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');\n.matrix-page {
            --bg-primary: #0a0a0f;
            --bg-card: #1a1a24;
            --border-color: #2a2a3a;
            --text-primary: #f0f0f5;
            --text-secondary: #8888a0;
            --text-muted: #555568;
            --accent-primary: #00d4aa;
            --warning: #ffc107;
            --danger: #ff6b6b;
            --info: #74b9ff;
            --orange: #fdcb6e;
            --purple: #a29bfe;
            --accent-glow: rgba(0, 212, 170, 0.15);}
.matrix-page * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;}
.matrix-page {
            font-family: 'Noto Sans KR', -apple-system, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 16px;
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
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 12px;}
.matrix-page .card-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 15px;
            font-weight: 600;}
.matrix-page .card-title .icon {
            width: 20px;
            height: 20px;
            background: var(--accent-primary);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: var(--bg-primary);}
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
            border: 1px solid var(--border-color);
            font: inherit;
            padding: 4px 8px;
            border-radius: 2px;
            transition: all 0.2s;}
.matrix-page .fit-switch:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-primary);
            border-color: var(--text-muted);}
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
            max-height: 175px;
            overflow-y: auto;
            overflow-x: auto;
            transition: max-height 0.3s ease;}
.matrix-page .table-wrapper.fit-all {
            max-height: none;
            overflow-y: visible;
            /* Large enough value */}
.matrix-page .matrix-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;}
.matrix-page .matrix-table thead {
            position: sticky;
            top: 0;
            background: var(--bg-card);
            z-index: 1;}
.matrix-page .matrix-table th, .matrix-page .matrix-table td {
            padding: 2px 4px;
            text-align: center;
            border-bottom: 1px solid var(--border-color);
            height: 24px;
            min-width: 70px;}
.matrix-page /* Left "예측 대상" column: narrower after removing labels */
        .matrix-table th:first-child, .matrix-page .matrix-table td.row-header {
            min-width: 60px;
            padding-left: 4px;
            padding-right: 4px;}
.matrix-page .matrix-table thead th {
            font-weight: 500;
            color: var(--text-secondary);
            font-size: 10px;
            padding-bottom: 4px;}
.matrix-page .matrix-table thead th .date-main {
            display: block;
            font-size: 10px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1px;}
.matrix-page .matrix-table thead th .date-sub {
            font-size: 8px;
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
            font-size: 10px;
            font-weight: 600;
            color: var(--text-primary);}
.matrix-page .row-header .label {
            font-size: 8px;
            color: var(--text-muted);}
.matrix-page /* 예측 셀 */
        .prediction-cell {
            position: relative;
            font-weight: 500;
            font-variant-numeric: tabular-nums;}
.matrix-page .prediction-cell .value {
            display: block;
            font-size: 10px;}
.matrix-page .prediction-cell .error {
            display: block;
            font-size: 8px;
            margin-top: 1px;}
.matrix-page .prediction-cell .error.good,
.matrix-page .prediction-cell .error.medium,
.matrix-page .prediction-cell .error.bad {
            color: var(--warning);}
.matrix-page /* 화살표 */
        .arrow {
            color: var(--text-muted);
            font-size: 10px;}
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
            font-weight: 700;
            display: block;}
.matrix-page .actual-cell .check {
            font-size: 8px;
            color: var(--accent-primary);
            display: block;
            margin-top: 1px;}
.matrix-page /* 미래 예측 (아직 실측 없음) */
        .future-cell {
            background: rgba(255, 193, 7, 0.08);}
.matrix-page .future-cell .value {
            color: var(--warning);}
.matrix-page .future-cell .label {
            font-size: 8px;
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
.matrix-page .hovered-col {
            background: rgba(0, 212, 170, 0.12);
            box-shadow: inset 0 0 0 1px rgba(0, 212, 170, 0.25);}
.matrix-page .hovered-row .row-header {
            color: var(--accent-primary);}

.matrix-page .chart-card {
            margin-bottom: 24px;}
.matrix-page .accuracy-indicators {
            display: flex;
            gap: 8px;}
.matrix-page .accuracy-item {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 8px 12px;
            width: 180px;
            flex: 0 0 auto;}
.matrix-page .accuracy-label {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 36px;}
.matrix-page .accuracy-label .day {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-primary);}
.matrix-page .accuracy-label .sub {
            font-size: 9px;
            color: var(--text-muted);}
.matrix-page .accuracy-bar {
            flex: 1;
            height: 6px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 3px;
            overflow: hidden;
            min-width: 50px;}
.matrix-page .accuracy-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--warning), #ffe066);
            border-radius: 4px;
            transition: width 0.5s ease;
            box-shadow: 0 0 8px rgba(255, 193, 7, 0.4);}
.matrix-page .accuracy-value {
            font-size: 13px;
            font-weight: 700;
            color: var(--warning);
            min-width: 40px;
            text-align: right;}
.matrix-page .chart-subtitle {
            font-size: 11px;
            color: var(--text-muted);}
.matrix-page .chart-subtitle:empty {
            display: none;}
.matrix-page .chart-container {
            position: relative;
            height: 175px;
            margin-bottom: 16px;}
.matrix-page .chart-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--border-color);}
.matrix-page .chart-legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--text-secondary);}
.matrix-page .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 3px;}
.matrix-page .legend-color.history { background: #808080; }
.matrix-page .legend-color.actual { background: var(--accent-primary); }
.matrix-page .legend-color.today { background: var(--info); }
.matrix-page .legend-color.forecast { background: var(--warning); }
.matrix-page .legend-color.area { background: rgba(0, 212, 170, 0.15); border: 1px solid var(--accent-primary); }

.matrix-page /* 주간 페이지 전환 */
        .week-nav {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            color: var(--text-secondary);
            font-size: 10px;}
.matrix-page .week-btn {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            padding: 2px 6px;
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

      {/* Dashboard Layout - Center only (sidebars hidden) */}
      <div className="min-h-[calc(100vh-32px)]">
        {/* Left Sidebar - Hidden */}
        <div className="hidden flex-col gap-3">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-4">
            <div className="bg-black/30 border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-secondary)] text-xs cursor-pointer flex items-center justify-between mb-3">
              <span>Previous Cycles</span>
              <span className="text-[8px]">▼</span>
            </div>
            <div className="text-base font-semibold text-[var(--accent-primary)] mb-1">FarmersMind_PoC(Ver. 1.0.0)</div>
            <div className="text-xs text-[var(--text-muted)]">ChampaHomFarm_C.P.Group</div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-4">
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <span>ALERT</span>
              <span className="text-[var(--warning)]">⚠</span>
            </div>
            <div className="text-sm text-[var(--text-muted)] text-center py-4">No Alerts</div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-4">
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-4">DATA COLLECTION STATUS</div>
            <div className="mb-4">
              <div className="text-xs font-semibold text-[var(--text-secondary)] mb-2">IMAGES</div>
              <div className="text-xs text-[var(--text-muted)] space-y-1">
                <div className="flex justify-between"><span>Collected:</span><span>31,818 images</span></div>
                <div className="flex justify-between"><span>Analyzed:</span><span>30,771 images</span></div>
              </div>
            </div>
            <div className="mb-4">
              <div className="text-xs font-semibold text-[var(--text-secondary)] mb-2">SENSOR</div>
              <div className="text-xs text-[var(--text-muted)] space-y-1">
                <div className="flex justify-between"><span>Feedbin:</span><span>16,344 records</span></div>
                <div className="flex justify-between"><span>Thermometer:</span><span>4,475 records</span></div>
                <div className="flex justify-between"><span>Hygrometer:</span><span>4,472 records</span></div>
              </div>
            </div>
            <button className="w-full bg-[#27ae60] hover:bg-[#2ecc71] border-none rounded px-4 py-3 text-white text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2">
              <span>↓</span>
              <span>EXCEL DOWNLOAD</span>
            </button>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-4">
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-4">INPUT MANAGEMENT</div>
            <button className="w-full bg-black/30 border border-[var(--border-color)] hover:border-[var(--text-muted)] rounded px-4 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium cursor-pointer mb-2 transition-all flex items-center justify-between">
              <span>CULLING & MORTALITY</span>
              <span>&gt;</span>
            </button>
            <button className="w-full bg-black/30 border border-[var(--border-color)] hover:border-[var(--text-muted)] rounded px-4 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium cursor-pointer transition-all flex items-center justify-between">
              <span>MEASURED WEIGHTS</span>
              <span>&gt;</span>
            </button>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex flex-col gap-4">
          {/* Top Cards - Hidden */}
          <div className="hidden grid-cols-[1fr_2fr] gap-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-5 flex items-center justify-center">
              <div className="text-sm text-[var(--text-muted)]">No Weather Data Available</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-5 text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">CYCLE COMPLETED</div>
              <div className="text-sm text-[var(--text-muted)] mb-2">AWAITING PLACEMENT</div>
              <div className="text-sm text-[var(--text-muted)]">2025-12-20 ~ 2026-01-28</div>
            </div>
          </div>

          {/* Chart Card */}
          <div className="card chart-card">
          <div className="flex justify-between items-center mb-4">
          {/* 왼쪽: 타이틀 */}
          <div>
            <div className="card-title">
              <span className="icon">📊</span>
              <span>CCTV WEIGHT + 3일 예측</span>
            </div>
          </div>
          {/* 오른쪽: D-1,2,3 + 한영 */}
          <div className="flex items-center gap-3">
            <div className="accuracy-indicators">
              <div className="accuracy-item">
                <div className="accuracy-label">
                  <span className="day">D-1</span>
                  <span className="sub">{lang === 'ko' ? '1일 전' : '1 day'}</span>
                </div>
                <div className="accuracy-bar">
                  <div className="accuracy-bar-fill" style={{ width: `${avgAccuracy.d1}%` }}></div>
                </div>
                <span className="accuracy-value">{avgAccuracy.d1}%</span>
              </div>
              <div className="accuracy-item">
                <div className="accuracy-label">
                  <span className="day">D-2</span>
                  <span className="sub">{lang === 'ko' ? '2일 전' : '2 days'}</span>
                </div>
                <div className="accuracy-bar">
                  <div className="accuracy-bar-fill" style={{ width: `${avgAccuracy.d2}%` }}></div>
                </div>
                <span className="accuracy-value">{avgAccuracy.d2}%</span>
              </div>
              <div className="accuracy-item">
                <div className="accuracy-label">
                  <span className="day">D-3</span>
                  <span className="sub">{lang === 'ko' ? '3일 전' : '3 days'}</span>
                </div>
                <div className="accuracy-bar">
                  <div className="accuracy-bar-fill" style={{ width: `${avgAccuracy.d3}%` }}></div>
                </div>
                <span className="accuracy-value">{avgAccuracy.d3}%</span>
              </div>
            </div>
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
        <div className="chart-container">
          <canvas ref={chartRef} />
        </div>
        <div className="chart-legend">
          <div className="chart-legend-item">
            <div className="legend-color history"></div>
            <span>{lang === 'ko' ? '중량예측값' : 'Weight Prediction'}</span>
          </div>
          <div className="chart-legend-item">
            <div className="legend-color actual"></div>
            <span>{lang === 'ko' ? '실측값' : 'Actual'}</span>
          </div>
          <div className="chart-legend-item">
            <div className="legend-color forecast"></div>
            <span>{lang === 'ko' ? '예측값' : 'Forecast'}</span>
          </div>
          <div className="chart-legend-item">
            <div className="legend-color area"></div>
            <span>{lang === 'ko' ? '예측 영역' : 'Forecast Area'}</span>
          </div>
        </div>

        {/* 구분선 */}
        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '48px', marginBottom: '48px' }}></div>

        <div className="flex justify-between items-center mb-4">
          <div className="week-nav" style={{ margin: 0 }}>
            <button className="week-btn" onClick={() => setWeek(w => (w === 1 ? 3 : w - 1) as 1 | 2 | 3)}>←</button>
            <div className="week-label" id="weekLabel">{weekLabels[week]}</div>
            <button className="week-btn" onClick={() => setWeek(w => (w === 3 ? 1 : w + 1) as 1 | 2 | 3)}>→</button>
          </div>
          <button
              type="button"
              className={`fit-switch ${!fitAll ? 'active' : ''}`}
              onClick={() => setFitAll(v => !v)}
            >
              <span className="icon">↕</span>
              <span>{lang === 'ko' ? '주간보기' : 'Weekly'}</span>
            </button>
        </div>

        <div className={`table-wrapper ${fitAll ? 'fit-all' : ''}`}>
          <table className="matrix-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>{lang === 'ko' ? '예측 대상' : 'Target'}</th>
                {visibleColumns.map(({ col, idx }) => (
                  <th key={idx} className={`${col.isToday ? 'today-col' : ''}${hoveredColumnIndex === idx ? ' hovered-col' : ''}`.trim()}>

                    <span className="date-main">{col.dateMain[lang]}</span>
                    <span className="date-sub">{col.dateSub[lang]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="scrollable-body">
              {visibleRows.map((row, rowIdx) => (
                <tr className={`result-row${hoveredDay != null && Number(String(row.age).replace(/\D/g, '')) === hoveredDay + 1 ? ' hovered-row' : ''}`} key={`${row.age}-${rowIdx}`}>
                  <td className="row-header">
                    <span className="age">
                      {lang === 'ko'
                        ? row.age
                        : `Day ${String(row.age).replace(/\D/g, '')}`}
                    </span>
                  </td>
                  {visibleColumns.map(({ idx, col }, colIdx) => {
                    const cell = row.cells[idx];
                    if (!cell) return <td key={colIdx} className="empty-cell">-</td>;
                    const todayClass = cell.isToday || col.isToday ? ' today-col' : '';
                    const hoverClass = hoveredColumnIndex === idx ? ' hovered-col' : '';

                    if (cell.type === 'prediction') {
                      return (
                        <td key={colIdx} className={`prediction-cell${todayClass}${hoverClass}`}>
                          <span className="value">{cell.value}</span>
                          <span className={`error ${cell.errorClass}`}>{cell.error}</span>
                        </td>
                      );
                    }

                    if (cell.type === 'actual') {
                      const checkTextRaw =
                        lang === 'ko'
                          ? cell.check
                          : cell.check.replace('실측', 'Actual');
                      const hasCheckMark = checkTextRaw.trim().startsWith('✓');
                      const checkMark = hasCheckMark ? '✓' : '';
                      const checkTextBase = hasCheckMark
                        ? checkTextRaw.replace(/^✓\s*/, '')
                        : checkTextRaw;
                      const checkText = checkTextBase
                        .replace(/실측/g, '')
                        .replace(/Actual/g, '')
                        .replace(/\s+/g, ' ')
                        .trim();
                      return (
                        <td key={colIdx} className={`actual-cell${todayClass}${hoverClass}`}>
                          <span className="value">{cell.value}{checkMark ? ` ${checkMark}` : ''}</span>
                          <span className="check">{checkText}</span>
                        </td>
                      );
                    }

                    if (cell.type === 'future') {
                      return (
                        <td key={colIdx} className={`future-cell${todayClass}${hoverClass}`}>
                          <span className="value">{cell.value}</span>
                          <span className="label">{cell.label}</span>
                        </td>
                      );
                    }

                    return (
                      <td key={colIdx} className={`empty-cell${todayClass}${hoverClass}`}>
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
        </div>{/* End center-content */}

        {/* Right Sidebar - Hidden */}
        <div className="hidden flex-col gap-3">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-4 flex-1">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-semibold text-[var(--text-primary)]">SURVIVAL RATE & CULLING</div>
            </div>
            <div className="h-[140px] bg-black/20 rounded flex items-center justify-center text-[var(--text-muted)] text-xs">
              📈 Survival Rate Chart (녹색 라인)
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-4 flex-1">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-semibold text-[var(--text-primary)]">FEEDBIN FULLNESS</div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <button className="hover:text-[var(--text-primary)] cursor-pointer">&lt;</button>
                <span>H01B1</span>
                <button className="hover:text-[var(--text-primary)] cursor-pointer">&gt;</button>
              </div>
            </div>
            <div className="h-[140px] bg-black/20 rounded flex items-center justify-center text-[var(--text-muted)] text-xs">
              📊 Feedbin Level Chart (녹색 라인)
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-4 flex-1">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-semibold text-[var(--text-primary)]">TEMPERATURE</div>
              <div className="text-xs text-[var(--text-muted)]">H01T1</div>
            </div>
            <div className="h-[140px] bg-black/20 rounded flex items-center justify-center text-[var(--text-muted)] text-xs">
              🌡 Temperature Chart (빨간 라인)
            </div>
          </div>
        </div>
      </div>{/* End dashboard-layout */}
    </div>
  );
}
