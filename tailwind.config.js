import { theme } from './client/theme';
import { getMantineColorValue } from './client/util/theme-utils';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/index.html', './client/**/*.{jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        h1: ['3rem', '2.5rem'],
        h2: ['2.5rem', '2.5rem'],
        h3: ['2.125rem', '2.5rem'],
        h4: ['1.75rem', '1.5rem'],
        h5: ['1.125rem', '1.5rem'],
        h6: ['1rem', '1.5rem'],
        lg: ['1.25rem', '1.5rem'],
        md: ['1.125rem', '1.5rem'],
        sm: ['1rem', '1.5rem'],
        xs: ['0.875rem', '1.5rem'],
      },
      colors: {
        'lightest-grey': '#f7f8fb',
        'light-grey': '#d0d7e5',
        'dark-grey': '#596981',
        'darkest-gray': '#4f5359',
        'near-black': '#201B28',
        'heroku-orange': '#fa9f47',
        'luminaire-green': '#03b665',
        'heroku-red': '#d64141',
        'primary-color': getMantineColorValue(theme.primaryColor),
        'cloud-blue': {
          95: '#eaf5fe',
          90: '#cfe9fe',
          80: '#90d0fe',
          70: '#1ab9ff',
          65: '#08abed',
          60: '#0d9dda',
          50: '#107cad',
          40: '#05628A',
          30: '#084968',
          20: '#023248',
          15: '#0a2636',
          10: '#001a28',
        },
        purple: {
          95: '#f6f2fb',
          90: '#ece1f9',
          80: '#d7bff2',
          70: '#c29ef1',
          65: '#b78def',
          60: '#ad7bee',
          50: '#9050e9',
          40: '#7526e3',
          30: '#5a1ba9',
          20: '#401075',
          15: '#300b60',
          10: '#240643',
        },
      },
    },
    screens: {
      desktop: '1024px',
    },
  },
  plugins: [],
};
