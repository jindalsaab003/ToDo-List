import { useState } from "react";

export default function TodoItem({ task, onToggleTask, onEditTask, onDeleteTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(task.text);

  function saveEdit() {
    const trimmedText = editedText.trim();

    if (!trimmedText) return;

    onEditTask(task.id, trimmedText);
    setIsEditing(false);
  }

  function cancelEdit() {
    setEditedText(task.text);
    setIsEditing(false);
  }

  return (
    <li className="todo-item">
      <div className="task-content">
        <input
          aria-label={`Mark ${task.text} as complete`}
          checked={task.completed}
          onChange={() => onToggleTask(task.id)}
          type="checkbox"
        />
        {isEditing ? (
          <input
            aria-label="Edit task"
            autoFocus
            className="edit-input"
            onChange={(event) => setEditedText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") saveEdit();
              if (event.key === "Escape") cancelEdit();
            }}
            type="text"
            value={editedText}
          />
        ) : (
          <span className={task.completed ? "completed" : ""}>{task.text}</span>
        )}
      </div>

      <div className="task-actions">
        {isEditing ? (
          <>
            <button className="save-button" onClick={saveEdit} type="button">
              Save
            </button>
            <button className="secondary-button" onClick={cancelEdit} type="button">
              Cancel
            </button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} type="button">
            Edit
          </button>
        )}
        <button className="delete-button" onClick={() => onDeleteTask(task.id)} type="button">
          Delete
        </button>
      </div>
    </li>
  );
}
