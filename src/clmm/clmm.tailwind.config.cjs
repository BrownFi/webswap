/** @type {import('tailwindcss').Config} */
// Tailwind 3 config for the CLMM (Algebra) sub-app. CLMM was downgraded from
// Tailwind 4 to share webswap's in-tree PostCSS/Vite pipeline (one Tailwind
// version, no out-of-tree compile, no committed generated CSS). This config is
// selected only for CLMM CSS via `@config` in src/clmm/clmm.css; webswap's own
// pages use the root tailwind.config.js (which excludes src/clmm from content).
//
// The color tokens mirror the old src/clmm/tailwind.css `@theme` block. Palette
// values live as CSS variables in src/clmm/config/colors.css and are referenced
// here via var(), so dark/light and re-theming stay data-driven.
module.exports = {
    content: ["./src/clmm/**/*.{js,jsx,ts,tsx}"],
    darkMode: "class",
    theme: {
        // CLMM's own breakpoints (differ from webswap's — the reason CLMM needs
        // its own config rather than merging into the root one).
        screens: {
            xs: "380px",
            sm: "640px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
            "2xl": "1400px",
        },
        extend: {
            colors: {
                "app-background": "#050505",

                "primary-50": "var(--primary-50)",
                "primary-100": "var(--primary-100)",
                "primary-200": "var(--primary-200)",
                "primary-300": "var(--primary-300)",
                "primary-800": "var(--primary-800)",

                "accent-100": "var(--accent-100)",
                "accent-200": "var(--accent-200)",

                "text-100": "var(--text-100)",
                "text-200": "var(--text-200)",
                "text-300": "var(--text-300)",
                "text-400": "var(--text-400)",

                "bg-100": "var(--bg-100)",
                "bg-200": "var(--bg-200)",
                "bg-300": "var(--bg-300)",
                "bg-500": "var(--bg-500)",

                text: "var(--text-100)",
                border: "var(--bg-300)",
                input: "var(--bg-100)",
                ring: "var(--primary-200)",
                background: "var(--bg-100)",
                foreground: "var(--text-100)",

                primary: "var(--primary-100)",
                "primary-foreground": "var(--text-100)",
                "primary-button": "var(--primary-100)",
                "primary-text": "var(--primary-300)",

                secondary: "var(--bg-200)",
                "secondary-foreground": "var(--text-200)",

                destructive: "var(--accent-100)",
                "destructive-foreground": "var(--text-100)",

                muted: "var(--bg-300)",
                "muted-foreground": "var(--text-200)",
                "muted-primary": "var(--primary-100)",

                accent: "var(--accent-100)",
                "accent-foreground": "var(--accent-200)",

                popover: "var(--bg-200)",
                "popover-foreground": "var(--text-100)",

                card: "var(--bg-100)",
                "card-foreground": "var(--text-100)",
                "card-hover": "var(--bg-500)",
                "card-dark": "var(--bg-100)",
                "card-light": "var(--bg-300)",
                "card-border": "var(--gray-100)",

                farm: "#c4943a",
                alm: "#d4a94f",
            },
            backgroundImage: {
                "dark-gradient": "radial-gradient(circle, rgba(26, 21, 16, 1) 0%, rgba(18, 16, 11, 1) 100%)",
                "primary-gradient": "linear-gradient(180deg, rgb(213, 153, 103) 0%, rgb(152, 92, 42) 100%)",
                "destructive-gradient": "linear-gradient(180deg, rgb(253, 64, 64) 0%, rgb(214, 0, 0) 100%)",
            },
            boxShadow: {
                popover: "0 0 15px rgba(0, 0, 0, 0.4)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fade-in": {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                // Skeleton shimmer: a gradient sweep across the placeholder.
                shimmer: {
                    "100%": { transform: "translateX(100%)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.2s ease-out",
                shimmer: "shimmer 1.6s ease-in-out infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
