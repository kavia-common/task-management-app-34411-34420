/* eslint-disable react/prop-types */
import TodoItem from './TodoItem';

/**
 * Renders a list of tasks as TodoItem components.
 */
// PUBLIC_INTERFACE
export default function TodoList({ tasks, onToggleComplete, onDelete, onSave }) {
  return (
    <>
      {tasks.map(task => (
        <TodoItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onSave={onSave}
        />
      ))}
    </>
  );
}
