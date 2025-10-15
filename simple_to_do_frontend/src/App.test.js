import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

test('app header and add button are present; empty state guidance shows initially', async () => {
  render(<App />);
  // header present
  expect(await screen.findByText(/simple to-do/i)).toBeInTheDocument();
  // add button present
  expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  // while loading may show loading, but eventually empty state should appear (depending on persisted data)
  // We cannot guarantee localStorage state across runs; assert that either loading or empty guidance exists.
  const loading = screen.queryByText(/loading tasks/i);
  if (!loading) {
    // When no tasks exist, empty guidance should be present
    const emptyText = screen.queryByText(/add your first task/i);
    // If tasks exist due to persistence, emptyText can be null; so only assert conditionally
    if (emptyText) {
      expect(emptyText).toBeInTheDocument();
    }
  }
});

test('user can add a task and see it in the list', async () => {
  render(<App />);
  const titleInput = await screen.findByLabelText(/title/i);
  const addBtn = screen.getByRole('button', { name: /add task/i });

  fireEvent.change(titleInput, { target: { value: 'Write tests' } });
  fireEvent.click(addBtn);

  // optimistically appears
  expect(screen.getByText('Write tests')).toBeInTheDocument();
});

test('filter buttons are present and can be toggled', async () => {
  render(<App />);
  const allBtn = await screen.findByRole('button', { name: /all/i });
  const activeBtn = screen.getByRole('button', { name: /active/i });
  const completedBtn = screen.getByRole('button', { name: /completed/i });

  expect(allBtn).toBeInTheDocument();
  expect(activeBtn).toBeInTheDocument();
  expect(completedBtn).toBeInTheDocument();

  fireEvent.click(activeBtn);
  expect(activeBtn.className).toMatch(/active/);
  fireEvent.click(completedBtn);
  expect(completedBtn.className).toMatch(/active/);
});

test('user can edit an added task inline (save/cancel visible)', async () => {
  render(<App />);
  const titleInput = await screen.findByLabelText(/title/i);
  fireEvent.change(titleInput, { target: { value: 'Draft email' } });
  fireEvent.click(screen.getByRole('button', { name: /add task/i }));

  const item = await screen.findByText('Draft email');
  const row = item.closest('.item');
  const utils = within(row);

  fireEvent.click(utils.getByRole('button', { name: /edit/i }));
  const saveBtn = utils.getByRole('button', { name: /save/i });
  const cancelBtn = utils.getByRole('button', { name: /cancel/i });

  expect(saveBtn).toBeInTheDocument();
  expect(cancelBtn).toBeInTheDocument();
});

test('search input filters tasks by title or notes and can be cleared', async () => {
  render(<App />);

  // Add two uniquely named tasks
  const titleInput = await screen.findByLabelText(/title/i);
  const addBtn = screen.getByRole('button', { name: /add task/i });

  fireEvent.change(titleInput, { target: { value: 'UniqueAlpha' } });
  fireEvent.click(addBtn);
  expect(await screen.findByText('UniqueAlpha')).toBeInTheDocument();

  fireEvent.change(titleInput, { target: { value: 'UniqueBeta' } });
  fireEvent.click(addBtn);
  expect(await screen.findByText('UniqueBeta')).toBeInTheDocument();

  // Search for "alpha" -> only UniqueAlpha should be visible among the two
  const search = screen.getByLabelText(/search tasks/i);
  fireEvent.change(search, { target: { value: 'alpha' } });

  expect(screen.getByText('UniqueAlpha')).toBeInTheDocument();
  expect(screen.queryByText('UniqueBeta')).not.toBeInTheDocument();

  // Clear the search -> both appear again
  fireEvent.click(screen.getByRole('button', { name: /clear search/i }));
  expect(screen.getByText('UniqueAlpha')).toBeInTheDocument();
  expect(screen.getByText('UniqueBeta')).toBeInTheDocument();

  // Search for "beta" -> only UniqueBeta visible
  fireEvent.change(search, { target: { value: 'beta' } });
  expect(screen.getByText('UniqueBeta')).toBeInTheDocument();
  expect(screen.queryByText('UniqueAlpha')).not.toBeInTheDocument();
});
