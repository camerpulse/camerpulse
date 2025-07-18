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
				serif: ['Playfair Display', 'Georgia', 'serif'],
				playfair: ['Playfair Display', 'Georgia', 'serif']
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
				}
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
				'gradient-lux-celebration': 'var(--gradient-lux-celebration)'
			},
			boxShadow: {
				'green': 'var(--shadow-green)',
				'red': 'var(--shadow-red)',
				'yellow': 'var(--shadow-yellow)',
				'elegant': 'var(--shadow-elegant)',
				'glow': 'var(--shadow-glow)'
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'heartbeat': {
					'0%': { transform: 'scale(1)' },
					'14%': { transform: 'scale(1.3)' },
					'28%': { transform: 'scale(1)' },
					'42%': { transform: 'scale(1.3)' },
					'70%': { transform: 'scale(1)' }
				},
				'pulse-heartbeat': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'heartbeat-line': {
					'0%': { strokeDasharray: '0, 100' },
					'50%': { strokeDasharray: '50, 100' },
					'100%': { strokeDasharray: '100, 100' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'press': {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(0.95)' },
					'100%': { transform: 'scale(1)' }
				},
				'slide-shine': {
					'0%': { transform: 'translateX(-100%) skewX(12deg)' },
					'100%': { transform: 'translateX(200%) skewX(12deg)' }
				},
				'eternal-glow': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(45, 95%, 60%, 0.3)' },
					'50%': { boxShadow: '0 0 40px hsl(45, 95%, 60%, 0.6)' }
				},
				'patriotic-pulse': {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'50%': { transform: 'scale(1.05)', opacity: '0.9' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'hope-rise': {
					'0%': { opacity: '0', transform: 'translateY(30px) scale(0.95)' },
					'100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
				},
				'golden-shimmer': {
					'0%': { backgroundPosition: '-200% center' },
					'100%': { backgroundPosition: '200% center' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'heartbeat': 'heartbeat 2s infinite',
				'pulse-heartbeat': 'pulse-heartbeat 2s infinite',
				'heartbeat-line': 'heartbeat-line 3s infinite',
				'fade-in': 'fade-in 0.6s ease-out',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'press': 'press 0.1s ease-out',
				'slide-shine': 'slide-shine 2s infinite',
				'eternal-glow': 'eternal-glow 3s ease-in-out infinite',
				'patriotic-pulse': 'patriotic-pulse 2s ease-in-out infinite',
				'hope-rise': 'hope-rise 0.8s ease-out forwards',
				'golden-shimmer': 'golden-shimmer 2s infinite'
			},
			animationDelay: {
				'300': '300ms',
				'500': '500ms'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
