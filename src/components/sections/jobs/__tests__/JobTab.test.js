import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import JobTab from '../JobTab';
import { theme } from '@styles';

const renderWithTheme = component => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('JobTab', () => {
  const defaultProps = {
    company: 'Test Company',
    isActive: false,
    onClick: jest.fn(),
    id: 'test-tab',
    tabIndex: '-1',
    ariaSelected: false,
    ariaControls: 'test-panel',
  };

  beforeEach(() => {
    defaultProps.onClick.mockClear();
  });

  it('renders company name', () => {
    renderWithTheme(<JobTab {...defaultProps} />);

    expect(screen.getByText('Test Company')).toBeInTheDocument();
  });

  it('applies active styles when isActive is true', () => {
    renderWithTheme(<JobTab {...defaultProps} isActive={true} ariaSelected={true} />);

    const button = screen.getByRole('tab');
    expect(button).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onClick when clicked', () => {
    renderWithTheme(<JobTab {...defaultProps} />);

    const button = screen.getByRole('tab');
    fireEvent.click(button);

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility attributes', () => {
    renderWithTheme(<JobTab {...defaultProps} />);

    const button = screen.getByRole('tab');

    expect(button).toHaveAttribute('id', 'test-tab');
    expect(button).toHaveAttribute('tabIndex', '-1');
    expect(button).toHaveAttribute('aria-selected', 'false');
    expect(button).toHaveAttribute('aria-controls', 'test-panel');
  });

  it('forwards ref correctly', () => {
    const ref = jest.fn();

    renderWithTheme(<JobTab {...defaultProps} tabRef={ref} />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('handles keyboard focus', () => {
    renderWithTheme(<JobTab {...defaultProps} isActive={true} tabIndex="0" ariaSelected={true} />);

    const button = screen.getByRole('tab');
    button.focus();

    expect(button).toHaveFocus();
  });
});
