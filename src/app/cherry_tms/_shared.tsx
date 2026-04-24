import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { stageItems } from './_stage-items';
import { CherryTmsThemeFrame } from './_ThemeFrame';

export { stageItems };
export type { StageItem } from './_stage-items';

export function CherryTmsShell({
  current,
  eyebrow,
  title,
  description,
  children,
}: {
  current?: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] text-slate-900" />}>
      <CherryTmsThemeFrame current={current} eyebrow={eyebrow} title={title} description={description}>
        {children}
      </CherryTmsThemeFrame>
    </Suspense>
  );
}
