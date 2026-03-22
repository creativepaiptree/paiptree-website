// src/components/StatsSection.tsx
import MarketingSection from '@/components/site/MarketingSection';

const stats = [
  { value: '22.63%', label: 'DOMESTIC FARM COVERAGE', note: '2025.02 기준' },
  { value: '20+',    label: 'PARTNERS & CLIENTS',     note: '국내외' },
  { value: '4',      label: 'COUNTRIES',              note: '한·일·인니·대만' },
  { value: '3',      label: 'CORE PLATFORMS',         note: 'FarmersMind · SCM · TmS' },
];

export default function StatsSection() {
  return (
    <MarketingSection surface="base" padding="none" className="marketing-border-bottom">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {stats.map(({ value, label, note }, i) => (
          <div
            key={label}
            className={[
              'marketing-metric-cell',
              'marketing-border-line',
              // 모바일(2col): 홀수번째 → 왼쪽 선, 하단행(i>=2) → 상단 선
              i % 2 === 1 ? 'border-l'         : '',
              i >= 2      ? 'border-t md:border-t-0' : '',
              // 데스크톱(4col): 첫번째 제외 모두 왼쪽 선
              i > 0       ? 'md:border-l'      : '',
              i === 0     ? 'pl-0'             : '',
            ].filter(Boolean).join(' ')}
          >
            <div className="type-mono marketing-metric-note marketing-text-dim mb-1">
              {note}
            </div>
            <div className="marketing-metric-value marketing-text-primary mb-3">
              {value}
            </div>
            <div className="type-label marketing-text-dim">
              {label}
            </div>
          </div>
        ))}
      </div>
    </MarketingSection>
  );
}
