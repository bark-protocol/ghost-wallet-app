import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PinInput } from '@/components/ghost/PinInput';

describe('PinInput', () => {
  it('adds digits and deletes', () => {
    let pin = '';
    const onPinChange = (next: string) => {
      pin = next;
      rerender(
        <PinInput pin={pin} onPinChange={onPinChange} pinLength={6} testID="pin" />
      );
    };

    const { getByTestId, rerender } = render(
      <PinInput pin={pin} onPinChange={onPinChange} pinLength={6} testID="pin" />
    );

    fireEvent.press(getByTestId('pin-key-1'));
    fireEvent.press(getByTestId('pin-key-2'));
    fireEvent.press(getByTestId('pin-key-3'));
    expect(pin).toBe('123');

    fireEvent.press(getByTestId('pin-key-del'));
    expect(pin).toBe('12');
  });

  it('does not change pin when disabled', () => {
    const onPinChange = jest.fn();
    const { getByTestId } = render(
      <PinInput pin="" onPinChange={onPinChange} pinLength={6} disabled testID="pin" />
    );

    fireEvent.press(getByTestId('pin-key-1'));
    expect(onPinChange).not.toHaveBeenCalled();
  });
});
