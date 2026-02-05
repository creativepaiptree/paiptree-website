export default function Matrix3DPage() {
  const html = String.raw`<!DOCTYPE html>
<html lang="ko">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rolling Forecast Matrix - 개선안</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap"
        rel="stylesheet">
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-card: #1a1a24;
            --border-color: #2a2a3a;
            --text-primary: #f0f0f5;
            --text-secondary: #8888a0;
            --text-muted: #555568;
            --accent-primary: #00d4aa;
            --warning: #ffc107;
            --danger: #ff6b6b;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Noto Sans KR', -apple-system, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 32px;
            min-height: 100vh;
        }

        .card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 2px;
            padding: 24px;
            width: fit-content;
            min-width: 100%;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .card-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 15px;
            font-weight: 600;
        }

        .card-subtitle {
            font-size: 12px;
            color: var(--text-muted);
        }

        .header-controls {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .fit-switch {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 2px;
            transition: all 0.2s;
        }

        .fit-switch:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-primary);
        }

        .fit-switch.active {
            background: rgba(0, 212, 170, 0.15);
            color: var(--accent-primary);
        }

        /* 언어 스위치 */
        .lang-switch {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--text-secondary);
        }

        .lang-switch span {
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 2px;
            transition: all 0.2s;
        }

        .lang-switch span.active {
            background: rgba(0, 212, 170, 0.15);
            color: var(--accent-primary);
        }

        .lang-switch span:hover:not(.active) {
            background: rgba(255, 255, 255, 0.05);
        }

        /* 테이블 스타일 */
        .table-wrapper {
            max-height: 315px;
            overflow-y: auto;
            overflow-x: auto;
            transition: max-height 0.3s ease;
        }

        .table-wrapper.fit-all {
            max-height: 100vh;
            /* Large enough value */
        }

        .matrix-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }

        .matrix-table thead {
            position: sticky;
            top: 0;
            background: var(--bg-card);
            z-index: 1;
        }

        .matrix-table th,
        .matrix-table td {
            padding: 6px 8px;
            text-align: center;
            border-bottom: 1px solid var(--border-color);
            height: 45px;
            min-width: 110px;
        }
        /* Left "예측 대상" column: narrower after removing labels */
        .matrix-table th:first-child,
        .matrix-table td.row-header {
            min-width: 80px;
            padding-left: 6px;
            padding-right: 6px;
        }

        .matrix-table thead th {
            font-weight: 500;
            color: var(--text-secondary);
            font-size: 11px;
            padding-bottom: 8px;
        }

        .matrix-table thead th .date-main {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 2px;
        }

        .matrix-table thead th .date-sub {
            font-size: 10px;
            color: var(--text-muted);
        }

        .matrix-table thead th.today-col {
            background: rgba(0, 212, 170, 0.1);
        }

        /* 행 헤더 (일령) */
        .row-header {
            text-align: left !important;
            font-weight: 500;
            color: var(--text-secondary);
            white-space: nowrap;
        }

        .row-header .age {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .row-header .label {
            font-size: 10px;
            color: var(--text-muted);
        }

        /* 예측 셀 */
        .prediction-cell {
            position: relative;
            font-weight: 500;
            font-variant-numeric: tabular-nums;
        }

        .prediction-cell .value {
            display: block;
            font-size: 14px;
        }

        .prediction-cell .error {
            display: block;
            font-size: 10px;
            margin-top: 2px;
        }

        .prediction-cell .error.good {
            color: var(--accent-primary);
        }

        .prediction-cell .error.medium {
            color: var(--warning);
        }

        .prediction-cell .error.bad {
            color: var(--danger);
        }

        /* 화살표 */
        .arrow {
            color: var(--text-muted);
            font-size: 12px;
        }

        /* 실측(오늘) 컬럼 */
        .today-col {
            background: rgba(0, 212, 170, 0.08);
        }

        .actual-cell {
            background: rgba(0, 212, 170, 0.15);
            position: relative;
        }

        .actual-cell.today-col {
            background: rgba(0, 212, 170, 0.15);
        }

        .actual-cell .value {
            color: var(--accent-primary);
            font-weight: 700;
        }

        .actual-cell .check {
            font-size: 10px;
            color: var(--accent-primary);
            display: block;
            margin-top: 2px;
        }

        /* 미래 예측 (아직 실측 없음) */
        .future-cell {
            background: rgba(255, 193, 7, 0.08);
        }

        .future-cell .value {
            color: var(--warning);
        }

        .future-cell .label {
            font-size: 9px;
            color: var(--text-muted);
        }

        /* 빈 셀 */
        .empty-cell {
            color: var(--text-muted);
            background: transparent;
        }

        /* 오늘 컬럼 빈 셀도 배경색 적용 */
        .empty-cell.today-col {
            background: rgba(0, 212, 170, 0.08);
        }

        /* 범례 */
        .legend {
            display: flex;
            gap: 20px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid var(--border-color);
            font-size: 11px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--text-secondary);
        }

        .legend-dot {
            width: 8px;
            height: 8px;
            border-radius: 0;
        }

        .legend-dot.actual {
            background: var(--accent-primary);
        }

        .legend-dot.future {
            background: var(--warning);
        }

        .legend-dot.good {
            background: var(--accent-primary);
        }

        .legend-dot.medium {
            background: var(--warning);
        }

        .legend-dot.bad {
            background: var(--danger);
        }

        /* 행 호버 효과 */
        .matrix-table tbody tr:hover {
            background: rgba(255, 255, 255, 0.02);
        }

        /* 결과 행 강조 - 투명 */
        .result-row {
            background: transparent;
        }
    </style>
</head>

<body>
    <div class="card">
        <div class="card-header">
            <div>
                <div class="card-title">
                    <span>📊</span>
                    <span data-ko="Rolling Forecast Matrix" data-en="Rolling Forecast Matrix">Rolling Forecast
                        Matrix</span>
                </div>
                <div class="card-subtitle" data-ko="예측값이 실측에 수렴하는 과정 추적"
                    data-en="Tracking prediction convergence to actual values">예측값이 실측에 수렴하는 과정 추적</div>
            </div>
            <div class="header-controls">
                <div class="fit-switch" onclick="toggleFit()">
                    <span class="icon">↕</span>
                    <span data-ko="전체 보기" data-en="Fit All">전체 보기</span>
                </div>
                <div class="lang-switch">
                    <span class="active" onclick="setLang('ko')">KO</span>
                    <span onclick="setLang('en')">EN</span>
                </div>
            </div>
        </div>

        <div class="table-wrapper">
            <table class="matrix-table">
                <thead>
                    <tr>
                        <th style="text-align: left;" data-ko="예측 대상" data-en="Target">예측 대상</th>
                        <th>
                            <span class="date-main" data-ko="1/20(월)" data-en="1/20(Mon)">1/20(월)</span>
                            <span class="date-sub" data-ko="13일 전" data-en="13 days ago">13일 전</span>
                        </th>
                        <th>
                            <span class="date-main" data-ko="1/21(화)" data-en="1/21(Tue)">1/21(화)</span>
                            <span class="date-sub" data-ko="12일 전" data-en="12 days ago">12일 전</span>
                        </th>
                        <th>
                            <span class="date-main" data-ko="1/22(수)" data-en="1/22(Wed)">1/22(수)</span>
                            <span class="date-sub" data-ko="11일 전" data-en="11 days ago">11일 전</span>
                        </th>
                        <th>
                            <span class="date-main" data-ko="1/23(목)" data-en="1/23(Thu)">1/23(목)</span>
                            <span class="date-sub" data-ko="10일 전" data-en="10 days ago">10일 전</span>
                        </th>
                        <th>
                            <span class="date-main" data-ko="1/24(금)" data-en="1/24(Fri)">1/24(금)</span>
                            <span class="date-sub" data-ko="9일 전" data-en="9 days ago">9일 전</span>
                        </th>
                        <th>
                            <span class="date-main" data-ko="1/25(토)" data-en="1/25(Sat)">1/25(토)</span>
                            <span class="date-sub" data-ko="8일 전" data-en="8 days ago">8일 전</span>
                        </th>
                        <th>
                            <span class="date-main" data-ko="1/26(일)" data-en="1/26(Sun)">1/26(일)</span>
                            <span class="date-sub" data-ko="7일 전" data-en="7 days ago">7일 전</span>
                        </th>
                        <th>
                            <span class="date-main" data-ko="1/27(월)" data-en="1/27(Mon)">1/27(월)</span>
                            <span class="date-sub" data-ko="6일 전" data-en="6 days ago">6일 전</span>
                        </th>
                        <th>
                            <span class="date-main" data-ko="1/28(화)" data-en="1/28(Tue)">1/28(화)</span>
                            <span class="date-sub" data-ko="5일 전" data-en="5 days ago">5일 전</span>
                        </th>
                        <th>
                            <span class="date-main" data-ko="1/29(수)" data-en="1/29(Wed)">1/29(수)</span>
                            <span class="date-sub" data-ko="4일 전" data-en="4 days ago">4일 전</span>
                        </th>
                        <th>
                            <span class="date-main" data-ko="1/30(목)" data-en="1/30(Thu)">1/30(목)</span>
                            <span class="date-sub" data-ko="3일 전" data-en="3 days ago">3일 전</span>
                        </th>
                        <th>
                            <span class="date-main" data-ko="1/31(금)" data-en="1/31(Fri)">1/31(금)</span>
                            <span class="date-sub" data-ko="2일 전" data-en="2 days ago">2일 전</span>
                        </th>
                        <th>
                            <span class="date-main" data-ko="2/1(토)" data-en="2/1(Sat)">2/1(토)</span>
                            <span class="date-sub" data-ko="1일 전" data-en="1 day ago">1일 전</span>
                        </th>
                        <th class="today-col">
                            <span class="date-main" data-ko="2/2(일)" data-en="2/2(Sun)">2/2(일)</span>
                            <span class="date-sub" data-ko="오늘" data-en="Today">오늘</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="scrollable-body">
                    <!-- 25일령 - 1/27 이전 실측 -->
                    <tr class="result-row">
                        <td class="row-header">
                            <span class="age" data-ko="25일령" data-en="Day 25">25일령</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,360g</span>
                            <span class="error medium">-3.5%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,375g</span>
                            <span class="error medium">-3.3%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,390g</span>
                            <span class="error medium">-3.1%</span>
                        </td>
                        <td class="actual-cell">
                            <span class="value">1,405g</span>
                            <span class="check" data-ko="✓ 실측(+1.1% 15g)" data-en="✓ Actual(+1.1% 15g)">✓ 실측(+1.1%
                                15g)</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell today-col">-</td>
                    </tr>

                    <!-- 26일령 - 1/27 이전 실측 -->
                    <tr class="result-row">
                        <td class="row-header">
                            <span class="age" data-ko="26일령" data-en="Day 26">26일령</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="prediction-cell">
                            <span class="value">1,405g</span>
                            <span class="error medium">-3.0%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,420g</span>
                            <span class="error medium">-2.8%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,435g</span>
                            <span class="error medium">-1.5%</span>
                        </td>
                        <td class="actual-cell">
                            <span class="value">1,450g</span>
                            <span class="check" data-ko="✓ 실측(+1.0% 15g)" data-en="✓ Actual(+1.0% 15g)">✓ 실측(+1.0%
                                15g)</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell today-col">-</td>
                    </tr>

                    <!-- 27일령 - 1/27 실측 -->
                    <tr class="result-row">
                        <td class="row-header">
                            <span class="age" data-ko="27일령" data-en="Day 27">27일령</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="prediction-cell">
                            <span class="value">1,462g</span>
                            <span class="error medium">-2.8%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,478g</span>
                            <span class="error medium">-1.7%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,490g</span>
                            <span class="error good">-0.9%</span>
                        </td>
                        <td class="actual-cell">
                            <span class="value">1,504g</span>
                            <span class="check" data-ko="✓ 실측(+0.9% 14g)" data-en="✓ Actual(+0.9% 14g)">✓ 실측(+0.9%
                                14g)</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell today-col">-</td>
                    </tr>

                    <!-- 28일령 - 1/28 실측 -->
                    <tr class="result-row">
                        <td class="row-header">
                            <span class="age" data-ko="28일령" data-en="Day 28">28일령</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="prediction-cell">
                            <span class="value">1,520g</span>
                            <span class="error medium">-3.7%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,538g</span>
                            <span class="error medium">-2.5%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,558g</span>
                            <span class="error medium">-1.3%</span>
                        </td>
                        <td class="actual-cell">
                            <span class="value">1,578g</span>
                            <span class="check" data-ko="✓ 실측(+1.3% 20g)" data-en="✓ Actual(+1.3% 20g)">✓ 실측(+1.3%
                                20g)</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell today-col">-</td>
                    </tr>

                    <!-- 29일령 - 1/29 실측 -->
                    <tr class="result-row">
                        <td class="row-header">
                            <span class="age" data-ko="29일령" data-en="Day 29">29일령</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="prediction-cell">
                            <span class="value">1,592g</span>
                            <span class="error medium">-3.5%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,612g</span>
                            <span class="error medium">-2.3%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,628g</span>
                            <span class="error medium">-1.3%</span>
                        </td>
                        <td class="actual-cell">
                            <span class="value">1,650g</span>
                            <span class="check" data-ko="✓ 실측(+1.4% 22g)" data-en="✓ Actual(+1.4% 22g)">✓ 실측(+1.4%
                                22g)</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell today-col">-</td>
                    </tr>

                    <!-- 30일령 - 1/30 실측 -->
                    <tr class="result-row">
                        <td class="row-header">
                            <span class="age" data-ko="30일령" data-en="Day 30">30일령</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="prediction-cell">
                            <span class="value">1,658g</span>
                            <span class="error medium">-2.2%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,670g</span>
                            <span class="error medium">-1.5%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,680g</span>
                            <span class="error good">-0.9%</span>
                        </td>
                        <td class="actual-cell">
                            <span class="value">1,695g</span>
                            <span class="check" data-ko="✓ 실측(+0.9% 15g)" data-en="✓ Actual(+0.9% 15g)">✓ 실측(+0.9%
                                15g)</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell today-col">-</td>
                    </tr>

                    <!-- 31일령 - 1/31 실측 -->
                    <tr class="result-row">
                        <td class="row-header">
                            <span class="age" data-ko="31일령" data-en="Day 31">31일령</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="prediction-cell">
                            <span class="value">1,748g</span>
                            <span class="error medium">-2.2%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,762g</span>
                            <span class="error medium">-1.5%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,778g</span>
                            <span class="error good">-0.6%</span>
                        </td>
                        <td class="actual-cell">
                            <span class="value">1,788g</span>
                            <span class="check" data-ko="✓ 실측(+0.6% 10g)" data-en="✓ Actual(+0.6% 10g)">✓ 실측(+0.6%
                                10g)</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell today-col">-</td>
                    </tr>

                    <!-- 32일령 - 2/1 실측 -->
                    <tr class="result-row">
                        <td class="row-header">
                            <span class="age" data-ko="32일령" data-en="Day 32">32일령</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="prediction-cell">
                            <span class="value">1,842g</span>
                            <span class="error medium">-2.1%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,858g</span>
                            <span class="error medium">-1.3%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,872g</span>
                            <span class="error good">-0.5%</span>
                        </td>
                        <td class="actual-cell">
                            <span class="value">1,882g</span>
                            <span class="check" data-ko="✓ 실측(+0.5% 10g)" data-en="✓ Actual(+0.5% 10g)">✓ 실측(+0.5%
                                10g)</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell today-col">-</td>
                    </tr>

                    <!-- 33일령 - 오늘 실측 -->
                    <tr class="result-row">
                        <td class="row-header">
                            <span class="age" data-ko="33일령" data-en="Day 33">33일령</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="prediction-cell">
                            <span class="value">1,935g</span>
                            <span class="error medium">-1.9%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,952g</span>
                            <span class="error good">-1.0%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">1,965g</span>
                            <span class="error good">-0.4%</span>
                        </td>
                        <td class="actual-cell">
                            <span class="value">1,972g</span>
                            <span class="check" data-ko="✓ 실측(+0.4% 7g)" data-en="✓ Actual(+0.4% 7g)">✓ 실측(+0.4%
                                7g)</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell today-col">-</td>
                    </tr>


                    <!-- 34일령 - 미래 (D+1) -->
                    <tr>
                        <td class="row-header">
                            <span class="age" data-ko="34일령" data-en="Day 34">34일령</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="prediction-cell">
                            <span class="value">2,032g</span>
                            <span class="error medium">-1.9%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">2,045g</span>
                            <span class="error good">-1.0%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">2,060g</span>
                            <span class="error good">-0.4%</span>
                        </td>
                        <td class="actual-cell">
                            <span class="value">2,075g</span>
                            <span class="check" data-ko="✓ 실측(+0.7% 15g)" data-en="✓ Actual(+0.7% 15g)">✓ 실측(+0.7%
                                15g)</span>
                        </td>
                        <td class="empty-cell today-col">-</td>
                    </tr>

                    <!-- 35일령 - 미래 (D+2) -->
                    <tr>
                        <td class="row-header">
                            <span class="age" data-ko="35일령" data-en="Day 35">35일령</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="prediction-cell">
                            <span class="value">2,135g</span>
                            <span class="error medium">-1.9%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">2,150g</span>
                            <span class="error good">-1.0%</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">2,165g</span>
                            <span class="error good">-0.4%</span>
                        </td>
                        <td class="actual-cell today-col">
                            <span class="value">2,180g</span>
                            <span class="check" data-ko="✓ 실측(+0.7% 15g)" data-en="✓ Actual(+0.7% 15g)">✓ 실측(+0.7%
                                15g)</span>
                        </td>
                    </tr>

                    <!-- 36일령 - 미래 (D+3) -->
                    <tr>
                        <td class="row-header">
                            <span class="age" data-ko="36일령" data-en="Day 36">36일령</span>
                        </td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="empty-cell">-</td>
                        <td class="prediction-cell">
                            <span class="value">2,250g</span>
                        </td>
                        <td class="prediction-cell">
                            <span class="value">2,265g</span>
                        </td>
                        <td class="prediction-cell today-col">
                            <span class="value">2,280g</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="legend">
            <div class="legend-item">
                <span class="legend-dot actual"></span>
                <span data-ko="실측 완료" data-en="Actual">실측 완료</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot future"></span>
                <span data-ko="예측 중" data-en="Forecast">예측 중</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot good"></span>
                <span data-ko="오차 ±1% 이내" data-en="Error ±1%">오차 ±1% 이내</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot medium"></span>
                <span data-ko="오차 ±3% 이내" data-en="Error ±3%">오차 ±3% 이내</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot bad"></span>
                <span data-ko="오차 ±5% 초과" data-en="Error >±5%">오차 ±5% 초과</span>
            </div>
        </div>
    </div>

    <script>
        function setLang(lang) {
            // 스위치 버튼 active 상태 변경
            document.querySelectorAll('.lang-switch span').forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent === lang.toUpperCase()) {
                    btn.classList.add('active');
                }
            });

            // data-ko, data-en 속성이 있는 모든 요소 텍스트 변경
            document.querySelectorAll('[data-ko][data-en]').forEach(el => {
                el.textContent = el.getAttribute('data-' + lang);
            });
        }

        function toggleFit() {
            const wrapper = document.querySelector('.table-wrapper');
            const btn = document.querySelector('.fit-switch');
            wrapper.classList.toggle('fit-all');
            btn.classList.toggle('active');
        }
    </script>
</body>

</html>
`;

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        srcDoc={html}
        title="3d_matrix"
        style={{ width: '100%', height: '100%', border: 0 }}
      />
    </div>
  );
}
