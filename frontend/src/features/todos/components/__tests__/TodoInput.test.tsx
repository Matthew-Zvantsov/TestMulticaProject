import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TodoInput } from '../TodoInput';

describe('TodoInput component', () => {
  it('renders input field and add button', () => {
    render(<TodoInput onAdd={vi.fn()} />);

    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('disables add button when input is empty or whitespace only', async () => {
    const user = userEvent.setup();
    render(<TodoInput onAdd={vi.fn()} />);

    const button = screen.getByRole('button', { name: /add task/i });
    expect(button).toBeDisabled();

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, '   ');
    expect(button).toBeDisabled();
  });

  it('calls onAdd with trimmed title and clears input upon success', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn().mockResolvedValue(true);
    render(<TodoInput onAdd={handleAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: /add task/i });

    await user.type(input, ' Buy groceries ');
    expect(button).not.toBeDisabled();

    await user.click(button);

    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith('Buy groceries');
    expect(input).toHaveValue('');
  });

  it('does not clear input if onAdd fails', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn().mockResolvedValue(false);
    render(<TodoInput onAdd={handleAdd} />);

    const input = screen.getByPlaceholderText('What needs to be done?');
    await user.type(input, 'Task to fail');
    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(handleAdd).toHaveBeenCalledWith('Task to fail');
    expect(input).toHaveValue('Task to fail');
  });

  it('disables input and button when disabled prop is true', () => {
    render(<TodoInput onAdd={vi.fn()} disabled={true} />);

    expect(screen.getByPlaceholderText('What needs to be done?')).toBeDisabled();
    expect(screen.getByRole('button', { name: /add task/i })).toBeDisabled();
  });
});
