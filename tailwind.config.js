/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Enable class-based dark mode
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': 'rgba(var(--bg-primary), <alpha-value>)',
                'bg-card': 'rgba(var(--bg-card), <alpha-value>)',
                'bg-card-glass': 'rgba(var(--bg-card-glass), <alpha-value>)',

                'text-main': 'rgba(var(--text-main), <alpha-value>)',
                'text-muted': 'rgba(var(--text-muted), <alpha-value>)',

                'glass-border': 'rgba(var(--border-glass), 0.1)',

                'primary': 'rgba(var(--primary), <alpha-value>)',
                'secondary': 'rgba(var(--secondary), <alpha-value>)',
                'success': 'rgba(var(--success), <alpha-value>)',
                'danger': 'rgba(var(--danger), <alpha-value>)',
                'warning': '#f59e0b',
            },
            boxShadow: {
                'glow': '0 0 15px rgba(var(--primary), 0.3)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
