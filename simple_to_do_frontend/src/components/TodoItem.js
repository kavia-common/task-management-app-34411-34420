/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';

/**
 * Single to-do item with:
 * - checkbox to toggle completion
 * - inline edit (save/cancel)
 * - delete button
 */
// PUBLIC_INTERFACE
export default function TodoItem({ task, onToggleComplete, onDelete, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [err, setErr] = useState('');
  const titleEditRef = useRef(null);

  useEffect(() => {
    if (isEditing && titleEditRef.current) {
      titleEditRef.current.focus();
      titleEditRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const t = title.trim();
    if (!t) {
      setErr('Title is required');
      return;
    }
    setErr('');
    onSave(task.id, { title: t, notes: notes.trim() });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(task.title);
    setNotes(task.notes || '');
    setErr('');
    setIsEditing(false);
  };

  const onKeyDownEditing = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className={`item ${task.completed ? 'completed' : ''}`} role="listitem" aria-label={`Task: ${task.title}`}>
      <div className="checkbox">
        <input
          id={`chk-${task.id}`}
          type="checkbox"
          checked={!!task.completed}
          onChange={() => onToggleComplete(task.id)}
          aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
        />
      </div>

      <div>
        {!isEditing ? (
          <>
            <label htmlFor={`chk-${task.id}`} className="item-title">
              {task.title}
            </label>
            {task.notes ? <p className="item-notes">{task.notes}</p> : null}
          </>
        ) : (
          <div className="inline-edit" role="group" aria-label="Edit task">
            <input
              ref={titleEditRef}
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={onKeyDownEditing}
              aria-invalid={!!err}
              aria-label="Edit title"
            />
            <textarea
              className="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={onKeyDownEditing}
              aria-label="Edit notes"
            />
            {err ? <div style={{ color: 'var(--color-error)', fontSize: 12 }}>{err}</div> : null}
          </div>
        )}
      </div>

      <div className="item-actions">
        {!isEditing ? (
          <>
            <button className="btn" onClick={() => setIsEditing(true)} aria-label="Edit task">Edit</button>
            <button className="btn btn-danger" onClick={() => onDelete(task.id)} aria-label="Delete task">Delete</button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" onClick={handleSave} aria-label="Save task">Save</button>
            <button className="btn btn-ghost" onClick={handleCancel} aria-label="Cancel edit">Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}
