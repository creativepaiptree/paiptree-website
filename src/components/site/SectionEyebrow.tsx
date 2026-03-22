type SectionEyebrowProps = {
  number: string;
  label: string;
  tone?: 'dark' | 'light' | 'accent';
  className?: string;
};

const tones = {
  dark: {
    text: 'var(--color-text-dim)',
    line: 'var(--color-line-mid)',
    label: 'var(--color-text-dim)',
  },
  light: {
    text: 'var(--color-light-text-sub)',
    line: 'var(--color-light-line)',
    label: 'var(--color-light-text-sub)',
  },
  accent: {
    text: 'var(--color-accent)',
    label: 'var(--color-text-dim)',
    line: 'var(--color-accent)',
  },
} as const;

export default function SectionEyebrow({
  number,
  label,
  tone = 'dark',
  className = '',
}: SectionEyebrowProps) {
  const palette = tones[tone];

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <span
        className="type-label"
        style={{ color: palette.text }}
      >
        {number}
      </span>
      <span
        className="w-6 h-px"
        style={{
          background: palette.line,
          opacity: tone === 'accent' ? 0.4 : 1,
        }}
      />
      <span
        className="type-label"
        style={{ color: palette.label }}
      >
        {label}
      </span>
    </div>
  );
}
