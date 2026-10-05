import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import TabLayout from '@/app/(tabs)/_layout';

describe('TabLayout', () => {
  it('declares the three tabs with French labels and icons', () => {
    render(<TabLayout />, { wrapper: ThemeProvider });
    const tabs = screen.UNSAFE_getAllByType('Tabs.Screen' as never);
    expect(tabs.map(t => [t.props.name, t.props.options.tabBarLabel])).toEqual([
      ['index', 'Jeux'],
      ['history', 'Historique'],
      ['stats', 'Statistiques'],
    ]);
    const icons = tabs.map(t => t.props.options.tabBarIcon({ color: 'red', size: 20, focused: true }).props.name);
    expect(icons).toEqual(['dice', 'document-text', 'bar-chart']);
  });
});
