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
              className="py-12 px-6 first:pl-0"
              style={{
                borderLeft: i > 0 ? '1px solid var(--color-line)' : undefined,
              }}
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
