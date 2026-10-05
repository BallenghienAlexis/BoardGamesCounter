import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { AlertModal } from '../AlertModal';
import { Button } from '../Button';
import { GameCard } from '../GameCard';
import { GameTypeSelector } from '../GameTypeSelector';
import { PageHeader } from '../PageHeader';
import { PlayerCard } from '../PlayerCard';

const renderThemed = (ui: React.ReactElement) => render(ui, { wrapper: ThemeProvider });

describe('Button', () => {
  it.each(['primary', 'secondary', 'danger', 'success'] as const)('calls onPress (%s)', variant => {
    const onPress = jest.fn();
    renderThemed(<Button title="OK" variant={variant} onPress={onPress} />);
    fireEvent.press(screen.getByText('OK'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it.each(['small', 'medium', 'large'] as const)('renders the %s size', size => {
    renderThemed(<Button title="OK" size={size} onPress={jest.fn()} />);
    expect(screen.getByText('OK')).toBeTruthy();
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    renderThemed(<Button title="OK" disabled onPress={onPress} />);
    fireEvent.press(screen.getByText('OK'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('AlertModal', () => {
  it('shows the title, message and buttons, then dismisses after a press', () => {
    const onConfirm = jest.fn();
    const onDismiss = jest.fn();
    renderThemed(
      <AlertModal
        visible
        title="Titre"
        message="Message"
        buttons={[
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: onConfirm },
          { text: 'OK' },
        ]}
        onDismiss={onDismiss}
      />
    );
    expect(screen.getByText('Titre')).toBeTruthy();
    expect(screen.getByText('Message')).toBeTruthy();

    fireEvent.press(screen.getByText('Supprimer'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByText('Annuler'));
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('works without onDismiss', () => {
    renderThemed(<AlertModal visible title="T" message="M" buttons={[{ text: 'OK' }]} />);
    expect(() => fireEvent.press(screen.getByText('OK'))).not.toThrow();
  });

  it('renders nothing when hidden', () => {
    renderThemed(<AlertModal visible={false} title="Titre" message="M" buttons={[]} />);
    expect(screen.queryByText('Titre')).toBeNull();
  });
});

describe('GameCard', () => {
  it('shows the game and handles open and delete', () => {
    const onPress = jest.fn();
    const onDelete = jest.fn();
    renderThemed(<GameCard name="Belote" playersCount={4} onPress={onPress} onDelete={onDelete} />);
    expect(screen.getByText('4 joueurs')).toBeTruthy();

    fireEvent.press(screen.getByText('Belote'));
    expect(onPress).toHaveBeenCalled();

    fireEvent.press(screen.UNSAFE_getByProps({ name: 'trash-outline' }));
    expect(onDelete).toHaveBeenCalled();
  });
});

describe('GameTypeSelector', () => {
  it('lists the game types and returns the selected one', () => {
    const onSelect = jest.fn();
    renderThemed(<GameTypeSelector onSelectType={onSelect} />);
    fireEvent.press(screen.getByText('Jeu de Base + Extension'));
    fireEvent.press(screen.getByText('Mode Incremental'));
    fireEvent.press(screen.getByText('Jeu de Base'));
    expect(onSelect.mock.calls).toEqual([['base-extension'], ['incremental'], ['base']]);
  });
});

describe('PageHeader', () => {
  it('renders the title and optional subtitle', () => {
    renderThemed(<PageHeader title="Titre" subtitle="Sous-titre" size="large" />);
    expect(screen.getByText('Titre')).toBeTruthy();
    expect(screen.getByText('Sous-titre')).toBeTruthy();
  });

  it('renders without subtitle', () => {
    renderThemed(<PageHeader title="Titre" />);
    expect(screen.queryByText('Sous-titre')).toBeNull();
  });
});

describe('PlayerCard', () => {
  const player = { id: 'p', name: 'Alice', score: 42, history: [42] };
  it.each([
    [1, 3, '#FFD700'],
    [2, 3, '#C0C0C0'],
    [3, 3, '#CD7F32'],
    [4, 4, '#6366F1'],
    [1, 1, '#6366F1'],
  ])('rank %i of %i uses color %s', (rank, total, color) => {
    renderThemed(<PlayerCard player={player} rank={rank} totalPlayers={total} />);
    expect(screen.getByText(`#${rank}`)).toBeTruthy();
    expect(screen.getByText('42')).toHaveStyle({ color });
  });
});
