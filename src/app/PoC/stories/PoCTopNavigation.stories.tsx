import Navbar from '../sections/Navbar';
import { BLOCK_IDS, noop } from './poc-story-fixtures';

const AVAILABLE_LANGS = ['ko', 'en'] as const;

export default {
  title: 'PoC/Blocks/Top Navigation',
  argTypes: {
    lang: {
      control: { type: 'inline-radio' },
      options: AVAILABLE_LANGS,
    },
  },
  args: {
    lang: 'ko',
  },
};

export const Default = {
  render: (args: { lang: 'ko' | 'en' }) => (
    <div className="p-2">
      <Navbar
        lang={args.lang}
        setLang={noop}
        setThemeMode={(_themeMode: 'dark' | 'light') => noop()}
        themeMode="dark"
      />
    </div>
  ),
};

export const PolicyReference = {
  parameters: {
    docs: {
      description: {
        story: `정책 블록 ID: ${BLOCK_IDS[0]} / top-navigation`,
      },
    },
  },
};
