/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/layouts/**/*.{js,jsx}",
    "./index.html",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--color-border)", // gray-200
        input: "var(--color-input)", // white
        ring: "var(--color-ring)", // blue-600
        background: "var(--color-background)", // gray-50
        foreground: "var(--color-foreground)", // gray-800
        primary: {
          DEFAULT: "var(--color-primary)", // deep navy
          foreground: "var(--color-primary-foreground)", // white
        },
        secondary: {
          DEFAULT: "var(--color-secondary)", // slate grey
          foreground: "var(--color-secondary-foreground)", // white
        },
        destructive: {
          DEFAULT: "var(--color-destructive)", // red-600
          foreground: "var(--color-destructive-foreground)", // white
        },
        muted: {
          DEFAULT: "var(--color-muted)", // gray-100
          foreground: "var(--color-muted-foreground)", // gray-500
        },
        accent: {
          DEFAULT: "var(--color-accent)", // electric blue
          foreground: "var(--color-accent-foreground)", // white
        },
        popover: {
          DEFAULT: "var(--color-popover)", // white
          foreground: "var(--color-popover-foreground)", // gray-800
        },
        card: {
          DEFAULT: "var(--color-card)", // white
          foreground: "var(--color-card-foreground)", // gray-800
        },
        success: {
          DEFAULT: "var(--color-success)", // green-600
          foreground: "var(--color-success-foreground)", // white
        },
        warning: {
          DEFAULT: "var(--color-warning)", // yellow-600
          foreground: "var(--color-warning-foreground)", // gray-900
        },
        error: {
          DEFAULT: "var(--color-error)", // red-600
          foreground: "var(--color-error-foreground)", // white
        },
        brand: {
          navy: "var(--color-brand-navy)", // deep navy
          slate: "var(--color-brand-slate)", // slate grey
          electric: "var(--color-brand-electric)", // electric blue
          orange: "var(--color-brand-orange)", // energetic orange
          success: "var(--color-brand-success)", // success green
          charcoal: "var(--color-brand-charcoal)", // charcoal
          grey: "var(--color-brand-medium-grey)", // medium grey
          white: "var(--color-brand-soft-white)", // soft white
        },
      },
      fontFamily: {
        headline: ["var(--font-headline)"],
        body: ["var(--font-body)"],
        cta: ["var(--font-cta)"],
        accent: ["var(--font-accent)"],
        "brand-headline": ["var(--font-brand-headline)"],
        "brand-value": ["var(--font-brand-value)"],
      },
      borderRadius: {
        lg: "var(--radius-lg)", // 12px
        md: "var(--radius-md)", // 8px
        sm: "var(--radius-sm)", // 6px
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      spacing: {
        xs: "var(--spacing-xs)", // 8px
        sm: "var(--spacing-sm)", // 12px
        md: "var(--spacing-md)", // 16px
        lg: "var(--spacing-lg)", // 24px
        xl: "var(--spacing-xl)", // 32px
        "2xl": "var(--spacing-2xl)", // 48px
      },
      transitionDuration: {
        fast: "var(--transition-fast)", // 150ms
        base: "var(--transition-base)", // 200ms
        slow: "var(--transition-slow)", // 300ms
        slower: "var(--transition-slower)", // 500ms
        slowest: "var(--transition-slowest)", // 800ms
      },
      zIndex: {
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        fixed: "var(--z-fixed)",
        "modal-backdrop": "var(--z-modal-backdrop)",
        modal: "var(--z-modal)",
        popover: "var(--z-popover)",
        tooltip: "var(--z-tooltip)",
      },
      keyframes: {
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "roi-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "slide-down": "slide-down 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in-right":
          "slide-in-right 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "slide-out-right":
          "slide-out-right 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "roi-float": "roi-float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
  ],
};
