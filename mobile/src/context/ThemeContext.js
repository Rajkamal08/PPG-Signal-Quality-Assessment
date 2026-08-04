import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const lightTheme = {
  isDark: false,
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textDim: '#64748B',
  primary: '#FF6B6B',
  border: '#E2E8F0',
  success: '#16A34A',
  error: '#DC2626',
  warning: '#F59E0B',
};

export const darkTheme = {
  isDark: true,
  background: '#0F172A',
  card: '#1E293B',
  text: '#F8FAFC',
  textDim: '#94A3B8',
  primary: '#FF6B6B',
  border: '#334155',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#FBBF24',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('isDarkMode');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'true');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem('isDarkMode', String(newValue));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
