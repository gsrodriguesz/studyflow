import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'
type PrimaryColor = 'amber' | 'blue' | 'green' | 'purple' | 'rose'

interface ThemeContextType {
    theme: Theme
    primaryColor: PrimaryColor
    setTheme: (theme: Theme) => void
    setPrimaryColor: (color: PrimaryColor) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const colors: Record<PrimaryColor, string> = {
    amber: '#f59e0b',
    blue: '#3b82f6',
    green: '#22c55e',
    purple: '#a855f7',
    rose: '#f43f5e',
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark')
    const [primaryColor, setPrimaryColor] = useState<PrimaryColor>('amber')

    useEffect(() => {
        const root = document.documentElement

        // Update Theme
        if (theme === 'dark') {
            root.classList.add('dark')
            root.style.setProperty('--color-background', '#18181b') // Zinc 900
            root.style.setProperty('--color-surface', '#27272a') // Zinc 800
            root.style.color = 'white'
        } else {
            root.classList.remove('dark')
            root.style.setProperty('--color-background', '#f4f4f5') // Zinc 100
            root.style.setProperty('--color-surface', '#ffffff') // White
            root.style.color = '#18181b' // Zinc 900
        }

        // Update Primary Color
        root.style.setProperty('--color-primary', colors[primaryColor])

    }, [theme, primaryColor])

    return (
        <ThemeContext.Provider value={{ theme, primaryColor, setTheme, setPrimaryColor }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
