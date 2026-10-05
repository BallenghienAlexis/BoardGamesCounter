import { renderHook } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../ThemeContext';

describe('ThemeContext', () => {
  it('exposes the dark theme colors', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    expect(result.current.colors.background).toBe('#0F1419');
    expect(result.current.colors.primary).toBe('#6366F1');
  });

  it('throws outside of the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within ThemeProvider');
  });
});
