import React from 'react';
import { act, render, screen } from '@testing-library/react-native';
import { useFonts } from '@expo-google-fonts/poppins';
import { SplashScreen } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import RootLayout from '@/app/_layout';

jest.mock('@expo-google-fonts/poppins', () => ({
  useFonts: jest.fn(),
  Poppins_400Regular: 1,
  Poppins_600SemiBold: 2,
  Poppins_700Bold: 3,
}));
jest.mock('expo-system-ui', () => ({ setBackgroundColorAsync: jest.fn() }));

const mockedUseFonts = jest.mocked(useFonts);

describe('RootLayout', () => {
  it('keeps the splash screen while fonts are loading', () => {
    mockedUseFonts.mockReturnValue([false, null]);
    render(<RootLayout />);
    expect(screen.toJSON()).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
    expect(SystemUI.setBackgroundColorAsync).toHaveBeenCalledWith('#0F1419');
  });

  it('hides the splash screen and declares the stack once fonts are loaded', async () => {
    mockedUseFonts.mockReturnValue([true, null]);
    render(<RootLayout />);
    // Laisse les providers terminer leur chargement depuis le stockage
    await act(async () => {});
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
    const names = screen.UNSAFE_getAllByType('Stack.Screen' as never).map(s => s.props.name);
    expect(names).toEqual(['(tabs)', 'skull-king/[gameId]', '[gameId]']);
  });

  it('throws the font error so it reaches the error boundary', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedUseFonts.mockReturnValue([false, new Error('font')]);
    expect(() => render(<RootLayout />)).toThrow('font');
  });
});
