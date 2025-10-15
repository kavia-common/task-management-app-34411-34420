import React, { useEffect, useMemo, useState } from 'react';
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
   * Optimistic UI updates are used with rollback on API error.
   */
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Load tasks on mount
  useEffect(() => {
    let mounted = true;
    mockApi.list()
      .then((res) => {
        if (!mounted) return;
        setTasks(res);
      })
      .catch(() => setErrorMsg('Failed to load tasks'))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  // Derived tasks by filter
  const visibleTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter(t => !t.completed);
    if (filter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
  }, [tasks, filter]);

  // PUBLIC_INTERFACE
  const addTask = async ({ title, notes }) => {
    setErrorMsg('');
    const optimistic = { id: `tmp-${Date.now()}`, title, notes: notes || '', completed: false };
    setTasks(prev => [optimistic, ...prev]);
    try {
      const saved = await mockApi.create({ title, notes });
      setTasks(prev => prev.map(t => (t.id === optimistic.id ? saved : t)));
    } catch (e) {
      setTasks(prev => prev.filter(t => t.id !== optimistic.id));
      setErrorMsg('Could not add task.');
    }
  };

  // PUBLIC_INTERFACE
  const toggleComplete = async (id) => {
    setErrorMsg('');
    const before = tasks;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    try {
      const current = before.find(t => t.id === id);
      await mockApi.update(id, { completed: !current.completed });
    } catch (e) {
      setTasks(before); // rollback
      setErrorMsg('Could not update task.');
    }
  };

  // PUBLIC_INTERFACE
  const saveTask = async (id, { title, notes }) => {
    setErrorMsg('');
    const before = tasks;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title, notes } : t));
    try {
      await mockApi.update(id, { title, notes });
    } catch (e) {
      setTasks(before);
      setErrorMsg('Could not save changes.');
    }
  };

  // PUBLIC_INTERFACE
  const deleteTask = async (id) => {
    setErrorMsg('');
    const before = tasks;
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await mockApi.remove(id);
    } catch (e) {
      setTasks(before);
      setErrorMsg('Could not delete task.');
    }
  };

  return (
    <div className="App">
      <header className="header" role="banner">
        <div className="header-inner">
          <div className="logo" aria-hidden="true">✓</div>
          <div className="title-wrap">
            <h1 className="app-title">Simple To-Do</h1>
            <p className="app-subtitle">Stay focused. Get things done.</p>
          </div>
        </div>
      </header>

      <main className="container" role="main">
        <section className="card" aria-label="Add task">
          <TodoInput onAdd={addTask} />
          <div className="filters" role="group" aria-label="Filter tasks">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </section>

        <section className="list" aria-label="Task list">
          {errorMsg ? <div role="alert" className="empty">{errorMsg}</div> : null}
          {loading ? (
            <div className="empty" aria-busy="true">Loading tasks…</div>
          ) : visibleTasks.length === 0 ? (
            <div className="card empty">No tasks yet. Add your first task above.</div>
          ) : (
            <TodoList
              tasks={visibleTasks}
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
