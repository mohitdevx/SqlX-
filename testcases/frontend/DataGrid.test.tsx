// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { DataGrid } from '../../src/components/grid/DataGrid';
import '@testing-library/jest-dom/vitest';

// Mock the virtualizer to render all rows for testing
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }) => {
    const items = Array.from({ length: count }, (_, i) => ({ index: i, size: 30, start: i * 30 }));
    return {
      getVirtualItems: () => items,
      getTotalSize: () => items.length * 30,
    };
  },
}));

// Mock the executeQuery function used by the component

vi.mock('../../src/lib/queries', () => ({
  executeQuery: vi.fn(() => Promise.resolve()),
}));

const mockGridData = {
  columns: [
    { name: 'id', data_type: 'int', nullable: false },
    { name: 'name', data_type: 'varchar', nullable: true },
  ],
  rows: [
    [1, 'Alice'],
    [2, 'Bob'],
  ],
};

describe('DataGrid component', () => {
  test('renders column headers and rows', async () => {
    await act(async () => {
      render(<DataGrid data={mockGridData} />);
    });
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getAllByText('Alice')[0]).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  test('opens context menu on cell right‑click and triggers update flow', async () => {
    await act(async () => {
      render(<DataGrid data={mockGridData} />);
    });
    const cell = screen.getAllByText('Alice')[0];
    fireEvent.contextMenu(cell);
    // The context menu is rendered in a portal; check for menu item text
    expect(screen.getByText(/Update "name"/i)).toBeInTheDocument();
    // Simulate clicking the update menu item
    fireEvent.click(screen.getByText(/Update "name" in Row #/i));
    // Verify that the UpdateCellModal appears
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
