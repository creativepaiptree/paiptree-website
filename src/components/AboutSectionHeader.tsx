import SectionEyebrow from '@/components/site/SectionEyebrow';

type AboutSectionHeaderProps = {
  number: string;
  label: string;
  title: string;
  description?: string;
  aside?: string;
  titleSize?: 'l' | 'm';
  compact?: boolean;
};

export default function AboutSectionHeader({
  number,
  label,
  title,
  description,
  aside,
  titleSize = 'l',
  compact = false,
}: AboutSectionHeaderProps) {
  const titleClassName = titleSize === 'm' ? 'type-heading-m' : 'type-heading-l';
  const wrapperClassName = aside
    ? 'mb-16 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between'
    : compact
      ? 'mb-10'
      : 'mb-16';
  const bodyClassName = compact ? 'type-body-s' : 'type-body';

  return (
    <div className={wrapperClassName}>
      <div className={compact ? 'max-w-lg' : 'max-w-3xl'}>
        <SectionEyebrow number={number} label={label} className="mb-6" />
        <h2 className={`${titleClassName} marketing-text-primary mb-4`}>
          {title}
        </h2>
        {description ? (
          <p className={`${bodyClassName} marketing-text-sub`}>
            {description}
          </p>
        ) : null}
      </div>

      {aside ? (
        <p className="type-body-s marketing-text-sub max-w-sm italic">
          {aside}
        </p>
      ) : null}
    </div>
  );
}
