require('../src/app/globals.css');

module.exports = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { expanded: true },
    layout: 'fullscreen',
    backgrounds: {
      default: 'poc-dark',
      values: [
        {
          name: 'poc-dark',
          value: '#0d1117',
        },
      ],
    },
    a11y: {
      test: 'error',
      options: {
        checks: { 'color-contrast': { options: { noScroll: true } } },
      },
    },
  },
};
