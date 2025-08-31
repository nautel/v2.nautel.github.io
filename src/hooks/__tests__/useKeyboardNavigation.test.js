import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';
import useKeyboardNavigation from '../useKeyboardNavigation';
import { KEY_CODES } from '@utils';

describe('useKeyboardNavigation', () => {
  const mockSetTabFocus = jest.fn();
  const mockTabs = { current: [null, null, null] };

  beforeEach(() => {
    mockSetTabFocus.mockClear();
  });

  it('should handle arrow up key', () => {
    const { result } = renderHook(() => useKeyboardNavigation(1, mockSetTabFocus, mockTabs));

    const mockEvent = {
      key: KEY_CODES.ARROW_UP,
      preventDefault: jest.fn(),
    };

    act(() => {
      result.current(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockSetTabFocus).toHaveBeenCalledWith(0);
  });

  it('should handle arrow down key', () => {
    const { result } = renderHook(() => useKeyboardNavigation(1, mockSetTabFocus, mockTabs));

    const mockEvent = {
      key: KEY_CODES.ARROW_DOWN,
      preventDefault: jest.fn(),
    };

    act(() => {
      result.current(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockSetTabFocus).toHaveBeenCalledWith(2);
  });

  it('should handle IE11 arrow keys', () => {
    const { result } = renderHook(() => useKeyboardNavigation(1, mockSetTabFocus, mockTabs));

    const upEvent = {
      key: KEY_CODES.ARROW_UP_IE11,
      preventDefault: jest.fn(),
    };

    const downEvent = {
      key: KEY_CODES.ARROW_DOWN_IE11,
      preventDefault: jest.fn(),
    };

    act(() => {
      result.current(upEvent);
    });

    expect(upEvent.preventDefault).toHaveBeenCalled();
    expect(mockSetTabFocus).toHaveBeenCalledWith(0);

    mockSetTabFocus.mockClear();

    act(() => {
      result.current(downEvent);
    });

    expect(downEvent.preventDefault).toHaveBeenCalled();
    expect(mockSetTabFocus).toHaveBeenCalledWith(2);
  });

  it('should ignore other keys', () => {
    const { result } = renderHook(() => useKeyboardNavigation(1, mockSetTabFocus, mockTabs));

    const mockEvent = {
      key: 'Enter',
      preventDefault: jest.fn(),
    };

    act(() => {
      result.current(mockEvent);
    });

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    expect(mockSetTabFocus).not.toHaveBeenCalled();
  });

  it('should update handler when tabFocus changes', () => {
    const { result, rerender } = renderHook(
      ({ tabFocus }) => useKeyboardNavigation(tabFocus, mockSetTabFocus, mockTabs),
      { initialProps: { tabFocus: 0 } },
    );

    const mockEvent = {
      key: KEY_CODES.ARROW_DOWN,
      preventDefault: jest.fn(),
    };

    act(() => {
      result.current(mockEvent);
    });

    expect(mockSetTabFocus).toHaveBeenCalledWith(1);

    mockSetTabFocus.mockClear();

    rerender({ tabFocus: 2 });

    act(() => {
      result.current(mockEvent);
    });

    expect(mockSetTabFocus).toHaveBeenCalledWith(3);
  });
});
