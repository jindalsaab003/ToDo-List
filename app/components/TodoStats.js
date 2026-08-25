export default function TodoStats({ tasks }) {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const remainingTasks = tasks.filter((task) => !task.completed).length;

  return (
    <footer className="stats">
      <p>Total: <strong>{tasks.length}</strong></p>
      <p>Completed: <strong>{completedTasks}</strong></p>
      <p>Remaining: <strong>{remainingTasks}</strong></p>
    </footer>
  );
}
