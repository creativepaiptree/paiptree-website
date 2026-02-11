'use client';

import type { ReactNode } from 'react';
import type { TraceabilityPayload } from '@/types/traceability';

type TraceableValueProps = {
  value: ReactNode;
  trace: TraceabilityPayload;
  onOpenTrace: (trace: TraceabilityPayload) => void;
  valueClassName?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
  indicatorMode?: 'full' | 'compact';
  showOriginBadge?: boolean;
};

const ALIGN_CLASS: Record<NonNullable<TraceableValueProps['align']>, string> = {
  left: 'justify-start text-left',
  center: 'justify-center text-center',
  right: 'justify-end text-right',
};

const TraceableValue = ({
  value,
  trace,
  onOpenTrace,
  valueClassName,
  className,
  align = 'left',
  showOriginBadge = true,
}: TraceableValueProps) => {
  const originClass = trace.is_ai_generated
    ? 'border-[#8b5cf6] text-[#c4b5fd] bg-[#8b5cf6]/10'
    : 'border-[#4da3ff] text-[#93c5fd] bg-[#4da3ff]/10';

  return (
    <button
      type="button"
      onClick={() => onOpenTrace(trace)}
      className={`group w-full inline-flex items-center gap-2 rounded-[2px] px-1 py-0.5 transition-colors hover:bg-[#1f2937] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#58a6ff] ${ALIGN_CLASS[align]} ${className ?? ''}`}
      aria-label={`${trace.display_value} 상세 열기`}
    >
      <span className={valueClassName}>{value}</span>
      {showOriginBadge && (
        <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 group-hover:text-gray-300">
          <span className={`inline-flex items-center rounded-[2px] border px-1 py-0.5 leading-none ${originClass}`}>
            {trace.is_ai_generated ? 'AI' : 'H'}
          </span>
        </span>
      )}
    </button>
  );
};

export default TraceableValue;
