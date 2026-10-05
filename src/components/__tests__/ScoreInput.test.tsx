import React from 'react';
import { Modal } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { ScoreInput } from '../ScoreInput';

function renderInput() {
  const onAddScore = jest.fn();
  const onUndo = jest.fn();
  render(<ScoreInput playerName="Alice" currentScore={0} onAddScore={onAddScore} onUndo={onUndo} />, {
    wrapper: ThemeProvider,
  });
  return { onAddScore, onUndo };
}

describe('ScoreInput', () => {
  it('adds the preset amounts', () => {
    const { onAddScore } = renderInput();
    ['+1', '+5', '+10', '+50', '+100', '-1'].forEach(label => fireEvent.press(screen.getByText(label)));
    expect(onAddScore.mock.calls.flat()).toEqual([1, 5, 10, 50, 100, -1]);
  });

  it('undoes the last move', () => {
    const { onUndo } = renderInput();
    fireEvent.press(screen.getByText('Annuler'));
    expect(onUndo).toHaveBeenCalled();
  });

  it('adds a custom amount from the modal', () => {
    const { onAddScore } = renderInput();
    fireEvent.press(screen.getByText('Personnalisé'));
    fireEvent.changeText(screen.getByPlaceholderText('Nombre de points'), '42');
    fireEvent.press(screen.getByText('Ajouter'));
    expect(onAddScore).toHaveBeenCalledWith(42);
    expect(screen.queryByText('Ajouter des points')).toBeNull();
  });

  it('keeps the modal open on an invalid amount', () => {
    const { onAddScore } = renderInput();
    fireEvent.press(screen.getByText('Personnalisé'));
    fireEvent.changeText(screen.getByPlaceholderText('Nombre de points'), 'abc');
    fireEvent.press(screen.getByText('Ajouter'));
    expect(onAddScore).not.toHaveBeenCalled();
    expect(screen.getByText('Ajouter des points')).toBeTruthy();
  });

  it('closes the modal on cancel or back button', () => {
    renderInput();
    fireEvent.press(screen.getByText('Personnalisé'));
    fireEvent.press(screen.getAllByText('Annuler')[1]);
    expect(screen.queryByText('Ajouter des points')).toBeNull();

    fireEvent.press(screen.getByText('Personnalisé'));
    fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
    expect(screen.queryByText('Ajouter des points')).toBeNull();
  });
});
