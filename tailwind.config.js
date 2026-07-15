import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/**/*.tsx',
        './resources/**/*.ts',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    green: '#2FAE1E',
                    'green-dark': '#1E8A10',
                    'green-soft': '#D2F5C7',
                    orange: '#FF8C00',
                    peach: '#F2621A',
                },
                category: {
                    grains: '#22B80D',
                    fruits: '#D42213',
                    veggies: '#F5401A',
                    protein: '#F58058',
                    dairy: '#B341D6',
                    others: '#5C8FB8',
                },
                surface: {
                    bg: '#FFFFFF',
                    'bg-dark': '#14161A',
                    card: '#FFFFFF',
                    'card-dark': '#1C1F26',
                    border: '#E8E2D5',
                    'border-dark': '#2B2F38',
                },
                ink: {
                    DEFAULT: '#1F1F1F',
                    dark: '#F1F1EF',
                    muted: '#8A8378',
                    'muted-dark': '#8F94A0',
                },
            },
            borderRadius: {
                card: '16px',
            },
            boxShadow: {
                card: '0 3px 14px rgba(0,0,0,0.05)',
                'card-dark': '0 3px 14px rgba(0,0,0,0.25)',
                sidebar: '2px 0 12px rgba(0,0,0,0.035)',
                'sidebar-dark': '2px 0 16px rgba(0,0,0,0.35)',
            },
        },
    },

    plugins: [forms, daisyui],

    daisyui: {
        themes: [
            {
                nutrigo: {
                    'primary': '#2FAE1E',
                    'primary-content': '#FFFFFF',
                    'secondary': '#FF8C00',
                    'secondary-content': '#FFFFFF',
                    'accent': '#B341D6',
                    'accent-content': '#FFFFFF',
                    'neutral': '#1F1F1F',
                    'neutral-content': '#FFFFFF',
                    'base-100': '#FFFFFF',
                    'base-200': '#FAFAF9',
                    'base-300': '#E8E2D5',
                    'base-content': '#1F1F1F',
                    'info': '#5C8FB8',
                    'info-content': '#FFFFFF',
                    'success': '#2FAE1E',
                    'success-content': '#FFFFFF',
                    'warning': '#FFA317',
                    'warning-content': '#FFFFFF',
                    'error': '#D42213',
                    'error-content': '#FFFFFF',
                },
            },
            'dark',
        ],
        darkTheme: 'dark',
    },
};
