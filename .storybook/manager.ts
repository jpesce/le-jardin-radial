import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
import brandLogo from './brand-logo.svg';

const theme = create({
  base: 'light',

  // Brand
  brandTitle: 'Le Jardin Radial',
  brandUrl: 'https://jardin.pesce.cc',
  brandImage: brandLogo,

  // Colors — earth palette
  colorPrimary: '#443528',
  colorSecondary: '#9b938c',

  // UI
  appBg: '#f3f2f1',
  appContentBg: '#fff',
  appBorderColor: '#eeedec',
  appBorderRadius: 8,

  // Text
  textColor: '#443528',
  textMutedColor: '#9b938c',

  // Font
  fontBase: "'JetBrains Mono Variable', monospace",
  fontCode: "'JetBrains Mono Variable', monospace",

  // Toolbar
  barBg: '#fbfbfb',
  barTextColor: '#9b938c',
  barSelectedColor: '#443528',

  // Inputs
  inputBg: '#fff',
  inputBorder: '#eeedec',
  inputTextColor: '#443528',
  inputBorderRadius: 6,
});

addons.setConfig({ theme });
