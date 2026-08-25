import { useState } from "react";

export default function TodoForm({ onAddTask }) {
  const [taskText, setTaskText] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedText = taskText.trim();

    if (!trimmedText) return;

    const wasAdded = await onAddTask(trimmedText);
    if (wasAdded) setTaskText("");
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="new-task">
        New task
      </label>
      <input
        id="new-task"
        type="text"
        value={taskText}
        onChange={(event) => setTaskText(event.target.value)}
        placeholder="Enter a task..."
      />
      <button type="submit">Add</button>
    </form>
  );
}
