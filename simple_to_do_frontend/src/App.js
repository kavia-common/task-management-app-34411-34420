import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import './index.css';
import { mockApi } from './api/mockApi';
import TodoHeader from './components/TodoHeader';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';

// PUBLIC_INTERFACE
function App() {
  /**
   * App manages the task list with an in-memory API that persists to localStorage.
   * Features:
   * - Add tasks (title required, optional notes)
   * - Toggle complete
   * - Inline edit (save/cancel)
   * - Delete
   * - Filter: All, Active, Completed
   * - Text search: filters by title and notes
   * Optimistic UI updates are used with rollback on API error.
   */
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [searchQuery, setSearchQuery] = useState(''); // text search query
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const mainRef = useRef(null);
  const addInputRef = useRef(null);

  // Load tasks on mount
  useEffect(() => {
    let mounted = true;
    mockApi
      .list()
      .then((res) => {
        if (!mounted) return;
        setTasks(res);
      })
      .catch(() => setErrorMsg('Failed to load tasks'))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Derived tasks by filter + search (memoized, does not mutate source)
  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (filter === 'active') {
      list = list.filter((t) => !t.completed);
    } else if (filter === 'completed') {
      list = list.filter((t) => t.completed);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          (t.title || '').toLowerCase().includes(q) ||
          (t.notes || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [tasks, filter, searchQuery]);

  // Helper to announce politely without flooding
  const announce = (msg) => {
    setAnnouncement(''); // clear first to ensure SRs speak repeated messages
    setTimeout(() => setAnnouncement(msg), 10);
  };

  // PUBLIC_INTERFACE
  const addTask = async ({ title, notes }) => {
    setErrorMsg('');
    const optimistic = {
      id: `tmp-${Date.now()}`,
      title,
      notes: notes || '',
      completed: false,
    };
    setTasks((prev) => [optimistic, ...prev]);
    announce('Task added');
    try {
      const saved = await mockApi.create({ title, notes });
      setTasks((prev) => prev.map((t) => (t.id === optimistic.id ? saved : t)));
    } catch (e) {
      setTasks((prev) => prev.filter((t) => t.id !== optimistic.id));
      setErrorMsg('Could not add task.');
      announce('Add failed');
    } finally {
      // return focus to add input
      if (addInputRef.current) addInputRef.current.focus();
    }
  };

  // PUBLIC_INTERFACE
  const toggleComplete = async (id) => {
    setErrorMsg('');
    const before = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    announce('Task status updated');
    try {
      const current = before.find((t) => t.id === id);
      await mockApi.update(id, { completed: !current.completed });
    } catch (e) {
      setTasks(before); // rollback
      setErrorMsg('Could not update task.');
      announce('Update failed');
    }
  };

  // PUBLIC_INTERFACE
  const saveTask = async (id, { title, notes }) => {
    setErrorMsg('');
    const before = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title, notes } : t))
    );
    announce('Task updated');
    try {
      await mockApi.update(id, { title, notes });
    } catch (e) {
      setTasks(before);
      setErrorMsg('Could not save changes.');
      announce('Save failed');
    }
  };

  // PUBLIC_INTERFACE
  const deleteTask = async (id) => {
    setErrorMsg('');
    const before = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    announce('Task deleted');
    try {
      await mockApi.remove(id);
    } catch (e) {
      setTasks(before);
      setErrorMsg('Could not delete task.');
      announce('Delete failed');
    }
  };

  return (
    <div className="App">
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <header className="header" role="banner">
        <div className="header-inner">
          <div className="logo" aria-hidden="true">
            ✓
          </div>
          <div className="title-wrap">
            <h1 className="app-title">Simple To-Do</h1>
            <p className="app-subtitle">Stay focused. Get things done.</p>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        ref={mainRef}
        className="container"
        role="main"
        tabIndex="-1"
      >
        {/* polite live region for key actions */}
        <div
          aria-live="polite"
          aria-atomic="true"
          role="status"
          className="sr-only"
        >
          {announcement}
        </div>

        <section className="card" aria-label="Add task">
          <TodoInput onAdd={addTask} inputRef={addInputRef} />

          {/* Search + Filters control group */}
          <div className="controls" role="group" aria-label="Search and filter tasks">
            <div className="search">
              <label htmlFor="task-search" className="label">
                Search
              </label>
              <div className="search-field">
                <input
                  id="task-search"
                  className="input search-input"
                  type="search"
                  placeholder="Search title or notes"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search tasks"
                />
                {searchQuery ? (
                  <button
                    className="btn btn-ghost clear-btn"
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            <div className="filters" role="group" aria-label="Filter tasks">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
                aria-pressed={filter === 'all'}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
                aria-pressed={filter === 'active'}
              >
                Active
              </button>
              <button
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
                aria-pressed={filter === 'completed'}
              >
                Completed
              </button>
            </div>
          </div>
        </section>

        <section className="list" aria-label="Task list">
          {errorMsg ? <div role="alert" className="empty">{errorMsg}</div> : null}
          {loading ? (
            <div className="empty" aria-busy="true">
              Loading tasks…
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="card empty empty-panel" role="region" aria-label="Empty state">
              <div className="empty-emoji" aria-hidden="true">
                🌊
              </div>
              <h2 className="empty-title">You’re all set</h2>
              <p className="empty-text">
                No tasks here yet. Add your first task to get started.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (addInputRef.current) addInputRef.current.focus();
                }}
              >
                Add a task
              </button>
            </div>
          ) : (
            <TodoList
              tasks={filteredTasks}
              onToggleComplete={toggleComplete}
              onDelete={deleteTask}
              onSave={saveTask}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
