import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

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
