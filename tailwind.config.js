/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.tsx", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  corePlugins: {
    space: false,
  },
  theme: {
    // NOTE to AI: You can extend the theme with custom colors or styles here.
    extend: {
      colors: {
        // Holiday Excitement Theme
        primary: {
          DEFAULT: '#FF6B6B',
          dark: '#E55555',
          light: '#FF8A8A',
        },
        secondary: {
          DEFAULT: '#4ECDC4', 
          dark: '#3FB8B1',
          light: '#6FD5CE',
        },
        accent: {
          DEFAULT: '#FFD93D',
          dark: '#E6C235', 
          light: '#FFE066',
        },
        holiday: {
          coral: '#FF6B6B',
          turquoise: '#4ECDC4',
          sunshine: '#FFD93D',
          success: '#45B69C',
          ocean: '#42A5F5',
        },
        neutral: {
          50: '#F7F7F7',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#999999',
          400: '#666666', 
          500: '#333333',
        }
      },
      fontFamily: {
        'poppins': ['Poppins-Regular'],
        'poppins-medium': ['Poppins-Medium'],
        'poppins-semibold': ['Poppins-SemiBold'],
        'poppins-bold': ['Poppins-Bold'],
        'playfair': ['PlayfairDisplay-Regular'],
        'playfair-medium': ['PlayfairDisplay-Medium'],
        'playfair-semibold': ['PlayfairDisplay-SemiBold'],
        'playfair-bold': ['PlayfairDisplay-Bold'],
      },
      fontSize: {
        xs: "10px",
        sm: "12px",
        base: "14px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "40px",
        "5xl": "48px",
        "6xl": "56px",
        "7xl": "64px",
        "8xl": "72px",
        "9xl": "80px",
      },
    },
  },
  darkMode: "class",
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      const spacing = theme("spacing");

      // space-{n}  ->  gap: {n}
      matchUtilities(
        { space: (value) => ({ gap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );

      // space-x-{n}  ->  column-gap: {n}
      matchUtilities(
        { "space-x": (value) => ({ columnGap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );

      // space-y-{n}  ->  row-gap: {n}
      matchUtilities(
        { "space-y": (value) => ({ rowGap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );
    }),
  ],
};
