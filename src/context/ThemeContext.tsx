import React, { createContext, useContext, useEffect, useState } from "react"

type ThemeContextType = {
    theme?: 'light' | 'dark';
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const ThemeProvider = ({ children }: React.PropsWithChildren) => {

    const [theme, setTheme] = useState<ThemeContextType['theme']>();

    // initial state from storage
    useEffect(() => {
        const theme = localStorage.getItem('theme') || 'dark';
        setTheme(theme as ThemeContextType['theme']);
    }, [])

    // update html and storage
    useEffect(() => {
        if (theme) {
            const html = document.querySelector('html');
            if (theme === 'light') {
                html?.classList.remove('dark')
            } else {
                html?.classList.add('dark')
            }
            localStorage.setItem('theme', theme);
        }
    }, [theme])

    // utility toggle
    function toggleTheme() {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme);
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export default ThemeProvider

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme deve essere usato all\'interno di ThemeProvider')
    }
    return context;
}
