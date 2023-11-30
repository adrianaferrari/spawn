const defaultTheme = require('tailwindcss/defaultTheme');
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/demo/**/*.{html,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				display: ['"Paytone One"', 'cursive'],
				sans: ['Onest', ...defaultTheme.fontFamily.sans],
			},
		},
	},
	plugins: [],
};
