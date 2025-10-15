/**
 * In-memory mock API with localStorage persistence and tiny artificial delay.
 * Easily replaceable with real backend calls later.
 */
const STORAGE_KEY = 'todo.tasks.v1';

function sleep(ms = 220) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function readStore() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStore(tasks) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore storage errors
  }
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeTask(data) {
  const title = (data?.title || '').trim();
  const notes = (data?.notes || '').trim();
  if (!title) throw new Error('Title is required');
  return { title, notes, completed: !!data?.completed };
}

// PUBLIC_INTERFACE
export const mockApi = {
  /** List all tasks */
  async list() {
    await sleep();
    return readStore();
  },
  /** Create a task */
  async create(data) {
    await sleep();
    const clean = sanitizeTask(data);
    const tasks = readStore();
    const newTask = { id: generateId(), ...clean };
    const next = [newTask, ...tasks];
    writeStore(next);
    return newTask;
  },
  /** Update a task by id with partial fields */
  async update(id, patch) {
    await sleep();
    const tasks = readStore();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Not found');
    const updated = { ...tasks[idx], ...patch };
    // validate if title is changed
    if (Object.prototype.hasOwnProperty.call(patch, 'title')) {
      if (!String(updated.title || '').trim()) throw new Error('Title is required');
      updated.title = String(updated.title).trim();
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'notes')) {
      updated.notes = String(updated.notes || '').trim();
    }
    tasks[idx] = updated;
    writeStore(tasks);
    return updated;
  },
  /** Remove a task by id */
  async remove(id) {
    await sleep();
    const tasks = readStore();
    const next = tasks.filter(t => t.id !== id);
    writeStore(next);
    return { ok: true };
  }
};
