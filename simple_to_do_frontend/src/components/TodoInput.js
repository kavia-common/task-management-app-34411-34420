/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';

/**
 * Task input form. Title is required; notes optional.
 * Calls onAdd({ title, notes }) when submitted.
 */
// PUBLIC_INTERFACE
export default function TodoInput({ onAdd, inputRef }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // autofocus initial mount for keyboard flow
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const onSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Title is required');
      return;
    }
    setError('');
    onAdd({ title: trimmed, notes: notes.trim() });
    setTitle('');
    setNotes('');
    // focus will be set by parent after add via live region handler
  };

  return (
    <form onSubmit={onSubmit} aria-label="Add new task" className="field-group" noValidate>
      <div className="input-row">
        <div>
          <label htmlFor="task-title" className="label">Title</label>
          <input
            id="task-title"
            ref={inputRef}
            className="input"
            placeholder="What do you need to do?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? 'title-error' : undefined}
          />
          {error ? (
            <div id="title-error" style={{ color: 'var(--color-error)', fontSize: 12, marginTop: 6 }}>
              {error}
            </div>
          ) : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn btn-primary" type="submit" aria-label="Add task">Add Task</button>
        </div>
      </div>
      <div>
        <label htmlFor="task-notes" className="label">Notes (optional)</label>
        <textarea
          id="task-notes"
          className="textarea"
          placeholder="Additional details…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </form>
  );
}
