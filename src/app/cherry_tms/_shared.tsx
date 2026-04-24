import type { ReactNode } from 'react';

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
    <CherryTmsThemeFrame current={current} eyebrow={eyebrow} title={title} description={description}>
      {children}
    </CherryTmsThemeFrame>
  );
}
