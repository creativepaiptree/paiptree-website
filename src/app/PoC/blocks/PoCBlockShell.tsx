import type { ReactNode } from 'react';
import { pocBlockPolicies } from './poc-block-policy';

type PoCBlockShellProps = {
  blockId: string;
  className?: string;
  children: ReactNode;
};

const BLOCK_BASE_CLASS = 'w-full';

const PoCBlockShell = ({ blockId, className, children }: PoCBlockShellProps) => {
  const policy = pocBlockPolicies[blockId];

  return (
    <section
      id={`poc-block-${blockId}`}
      data-poc-block={blockId}
      data-poc-block-name={policy?.name ?? blockId}
      className={`${BLOCK_BASE_CLASS} ${className ?? ''}`.trim()}
      aria-label={policy?.name ?? blockId}
    >
      <div className="sr-only">
        블록 정책: {policy?.name ?? blockId}
      </div>
      {children}
    </section>
  );
};

export default PoCBlockShell;
