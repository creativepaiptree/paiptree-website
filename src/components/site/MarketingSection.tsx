import { ReactNode } from 'react';

type MarketingSectionProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  surface?: 'base' | 'surface' | 'raised';
  padding?: 'default' | 'none';
  withContainer?: boolean;
};

const surfaceClassNames = {
  base: 'marketing-section--base',
  surface: 'marketing-section--surface',
  raised: 'marketing-section--raised',
} as const;

const paddingClassNames = {
  default: 'marketing-section--default-padding',
  none: 'marketing-section--no-padding',
} as const;

export default function MarketingSection({
  children,
  className = '',
  containerClassName = '',
  surface = 'base',
  padding = 'default',
  withContainer = true,
}: MarketingSectionProps) {
  const sectionClassName = [
    'marketing-section',
    surfaceClassNames[surface],
    paddingClassNames[padding],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!withContainer) {
    return <section className={sectionClassName}>{children}</section>;
  }

  return (
    <section className={sectionClassName}>
      <div className={['container-max px-6', containerClassName].filter(Boolean).join(' ')}>
        {children}
      </div>
    </section>
  );
}
