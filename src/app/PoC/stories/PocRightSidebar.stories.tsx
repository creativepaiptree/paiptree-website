import RightSidebar from '../sections/RightSidebar';
import { rightSidebarSampleData } from './poc-story-fixtures';
import { BLOCK_IDS } from './poc-story-fixtures';

export default {
  title: 'PoC/Blocks/Right Sidebar',
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
      <RightSidebar
        lang={args.lang}
        feedbinBySensor={rightSidebarSampleData.feedbinBySensor}
        temperatureBySensor={rightSidebarSampleData.temperatureBySensor}
        humidityBySensor={rightSidebarSampleData.humidityBySensor}
        totalBirdCount={rightSidebarSampleData.totalBirdCount}
        onOpenTrace={() => undefined}
      />
    </div>
  ),
};

export const PolicyReference = {
  parameters: {
    docs: {
      description: {
        story: `정책 블록 ID: ${BLOCK_IDS[5]} / right-sidebar-overview`,
      },
    },
  },
};
