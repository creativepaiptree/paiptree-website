// src/components/StatsSection.tsx

const stats = [
  { value: '22.63%', label: 'DOMESTIC FARM COVERAGE', note: '2025.02 기준' },
  { value: '20+',    label: 'PARTNERS & CLIENTS',     note: '국내외' },
  { value: '4',      label: 'COUNTRIES',              note: '한·일·인니·대만' },
  { value: '3',      label: 'CORE PLATFORMS',         note: 'FarmersMind · SCM · TmS' },
];

export default function StatsSection() {
  return (
    <section style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-line)' }}>
      <div className="container-max px-6">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map(({ value, label, note }, i) => (
            <div
              key={label}
              className={[
                'py-10 px-6',
                // 모바일(2col): 홀수번째 → 왼쪽 선, 하단행(i>=2) → 상단 선
                i % 2 === 1 ? 'border-l'         : '',
                i >= 2      ? 'border-t md:border-t-0' : '',
                // 데스크톱(4col): 첫번째 제외 모두 왼쪽 선
                i > 0       ? 'md:border-l'      : '',
                i === 0     ? 'pl-0'             : '',
              ].filter(Boolean).join(' ')}
              style={{ borderColor: 'var(--color-line)' }}
            >
              <div
                className="type-mono mb-1"
                style={{ color: 'var(--color-text-dim)', fontSize: '0.6875rem', letterSpacing: '0.1em' }}
              >
                {note}
              </div>
              <div
                className="font-bold leading-none mb-3"
                style={{
                  fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                  fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                  letterSpacing: '-0.04em',
                  color: 'var(--color-text)',
                }}
              >
                {value}
              </div>
              <div className="type-label" style={{ color: 'var(--color-text-dim)' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
