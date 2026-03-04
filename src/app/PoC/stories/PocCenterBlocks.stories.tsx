import Header from '../sections/Header';
import ForecastMatrix from '../sections/ForecastMatrix';
import WeightDistribution from '../sections/WeightDistribution';
import { openTraceNoop } from './poc-story-fixtures';
import { BLOCK_IDS } from './poc-story-fixtures';

export default {
  title: 'PoC/Blocks/Center Blocks',
  argTypes: {
    lang: {
      control: { type: 'inline-radio' },
      options: ['ko', 'en'],
    },
    blockId: {
      control: { type: 'select' },
      options: [BLOCK_IDS[2], BLOCK_IDS[3], BLOCK_IDS[4]],
    },
  },
  args: {
    lang: 'ko',
    blockId: BLOCK_IDS[2],
  },
};

const CenterContent = (props: { lang: 'ko' | 'en'; blockId: string }) => {
  const { lang, blockId } = props;

  if (blockId === BLOCK_IDS[2]) {
    return <Header lang={lang} onOpenTrace={openTraceNoop} />;
  }
  if (blockId === BLOCK_IDS[3]) {
    return <ForecastMatrix lang={lang} onOpenTrace={openTraceNoop} />;
  }

  return <WeightDistribution lang={lang} onOpenTrace={openTraceNoop} />;
};

export const Default = {
  render: ({ lang, blockId }: { lang: 'ko' | 'en'; blockId: string }) => (
    <div className="p-2">
      <CenterContent lang={lang} blockId={blockId} />
    </div>
  ),
};

export const PolicyMap = {
  parameters: {
    docs: {
      description: {
        story: `정책 블록 ID: ${BLOCK_IDS[2]}, ${BLOCK_IDS[3]}, ${BLOCK_IDS[4]}`,
      },
    },
  },
};
