import LeftSidebar from '../sections/LeftSidebar';
import { BLOCK_IDS } from './poc-story-fixtures';

export default {
  title: 'PoC/Blocks/Left Sidebar',
  argTypes: {
    lang: {
      control: { type: 'inline-radio' },
      options: ['ko', 'en'],
    },
  },
  args: {
    lang: 'ko',
  },
};

export const Default = {
  render: (args: { lang: 'ko' | 'en' }) => (
    <div className="p-2">
      <LeftSidebar lang={args.lang} />
    </div>
  ),
};

export const PolicyReference = {
  parameters: {
    docs: {
      description: {
        story: `정책 블록 ID: ${BLOCK_IDS[1]} / left-sidebar-alerts`,
      },
    },
  },
};
