import type { Config } from "tailwindcss";

export default {
	
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				inter: ['Inter', 'system-ui', 'sans-serif'],
				serif: ['Playfair Display', 'serif'],
				playfair: ['Playfair Display', 'serif'],
				grotesk: ['Space Grotesk', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace']
			},
			screens: {
				'xs': '375px',
				'safe-area': '414px',
			},
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Cameroonian Flag Colors
				'cm-green': {
					DEFAULT: 'hsl(var(--cm-green))',
					light: 'hsl(var(--cm-green-light))'
				},
				'cm-red': {
					DEFAULT: 'hsl(var(--cm-red))',
					light: 'hsl(var(--cm-red-light))'
				},
				'cm-yellow': {
					DEFAULT: 'hsl(var(--cm-yellow))',
					light: 'hsl(var(--cm-yellow-light))'
				},
				// Directory Service Colors
				'directory-school': 'hsl(var(--directory-school))',
				'directory-hospital': 'hsl(var(--directory-hospital))',
				'directory-pharmacy': 'hsl(var(--directory-pharmacy))',
				'directory-village': 'hsl(var(--directory-village))',
				'directory-verified': 'hsl(var(--directory-verified))',
				'directory-pending': 'hsl(var(--directory-pending))',
				'directory-rejected': 'hsl(var(--directory-rejected))',
				// Institution Status Colors
				'status-active': 'hsl(var(--status-active))',
				'status-inactive': 'hsl(var(--status-inactive))',
				'status-verified': 'hsl(var(--status-verified))',
				'status-claimed': 'hsl(var(--status-claimed))',
				'status-sponsored': 'hsl(var(--status-sponsored))',
				// Message Priority Colors
				'message-urgent': 'hsl(var(--message-urgent))',
				'message-normal': 'hsl(var(--message-normal))',
				'message-support': 'hsl(var(--message-support))',
				// Rating Colors
				'rating-excellent': 'hsl(var(--rating-excellent))',
				'rating-good': 'hsl(var(--rating-good))',
				'rating-average': 'hsl(var(--rating-average))',
				'rating-poor': 'hsl(var(--rating-poor))',
				'rating-terrible': 'hsl(var(--rating-terrible))'
			},
			backgroundImage: {
				'gradient-flag': 'var(--gradient-flag)',
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-civic': 'var(--gradient-civic)',
				'gradient-pulse': 'var(--gradient-pulse)',
				// Lux Aeterna Enhanced Gradients
				'gradient-lux-primary': 'var(--gradient-lux-primary)',
				'gradient-lux-divine': 'var(--gradient-lux-divine)',
				'gradient-lux-noble': 'var(--gradient-lux-noble)',
				'gradient-lux-celebration': 'var(--gradient-lux-celebration)',
				// Directory Service Gradients
				'gradient-directory-schools': 'var(--gradient-directory-schools)',
				'gradient-directory-hospitals': 'var(--gradient-directory-hospitals)',
				'gradient-directory-pharmacies': 'var(--gradient-directory-pharmacies)',
				'gradient-directory-villages': 'var(--gradient-directory-villages)',
				'gradient-verification': 'var(--gradient-verification)',
				'gradient-sponsorship': 'var(--gradient-sponsorship)'
			},
			boxShadow: {
				'green': 'var(--shadow-green)',
				'red': 'var(--shadow-red)',
				'yellow': 'var(--shadow-yellow)',
				'elegant': 'var(--shadow-elegant)',
				'glow': 'var(--shadow-glow)',
				// Directory Service Shadows
				'directory-school': 'var(--shadow-directory-school)',
				'directory-hospital': 'var(--shadow-directory-hospital)',
				'directory-pharmacy': 'var(--shadow-directory-pharmacy)',
				'directory-village': 'var(--shadow-directory-village)',
				'verified': 'var(--shadow-verified)',
				'sponsored': 'var(--shadow-sponsored)',
				// Lux Aeterna Shadows
				'lux-divine': 'var(--shadow-lux-divine)',
				'lux-sacred': 'var(--shadow-lux-sacred)',
				'lux-ethereal': 'var(--shadow-lux-ethereal)',
				'lux-celebration': 'var(--shadow-lux-celebration)'
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
