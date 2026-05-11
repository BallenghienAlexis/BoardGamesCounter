import React, { createContext, useContext, ReactNode } from 'react';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;
  text: string;
  textSecondary: string;
  primary: string;
  accent: string;
  danger: string;
  success: string;
  warning: string;
  border: string;
}

const colors: ThemeColors = {
  background: '#0F1419',
  surface: '#1A202C',
  surfaceLight: '#2D3748',
  text: '#FFFFFF',
  textSecondary: '#A0AEC0',
  primary: '#6366F1',
  accent: '#8B5CF6',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  border: '#2D3748',
};

interface ThemeContextType {
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

