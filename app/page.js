"use client";

import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import TodoFilters from "./components/TodoFilters";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import TodoStats from "./components/TodoStats";
import { supabase } from "../lib/supabase";

export default function TodoApp() {
  // React holds the current screen data. Supabase PostgreSQL is the source of truth.
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!supabase) {
      setErrorMessage("Add your Supabase URL and publishable key to .env.local, then restart the dev server.");
      setIsLoading(false);
      setIsCheckingSession(false);
      return;
    }

    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsCheckingSession(false);
      if (session?.user) loadTasks();
      else setIsLoading(false);
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setTasks([]);
      if (nextUser) loadTasks();
      else setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadTasks() {
    if (!supabase) return;

    setIsLoading(true);
    setErrorMessage("");
    const { data, error } = await supabase
      .from("tasks")
      .select("id, text, completed, created_at")
      .order("created_at", { ascending: false });

    if (error) setErrorMessage(error.message);
    else setTasks(data);
    setIsLoading(false);
  }

  async function addTask(taskText) {
    if (!supabase || !user) return false;

    setErrorMessage("");
    const { data, error } = await supabase
      .from("tasks")
      .insert({ text: taskText, user_id: user.id })
      .select()
      .single();

    if (error) {
      setErrorMessage(error.message);
      return false;
    }

    setTasks([data, ...tasks]);
    return true;
  }

  async function toggleTask(taskId) {
    if (!supabase) return;
    const task = tasks.find((currentTask) => currentTask.id === taskId);
    if (!task) return;

    setErrorMessage("");
    const { data, error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", taskId)
      .select()
      .single();

    if (error) setErrorMessage(error.message);
    else setTasks(tasks.map((currentTask) => (currentTask.id === taskId ? data : currentTask)));
  }

  async function editTask(taskId, newText) {
    if (!supabase) return;

    setErrorMessage("");
    const { data, error } = await supabase
      .from("tasks")
      .update({ text: newText })
      .eq("id", taskId)
      .select()
      .single();

    if (error) setErrorMessage(error.message);
    else setTasks(tasks.map((task) => (task.id === taskId ? data : task)));
  }

  async function deleteTask(taskId) {
    if (!supabase) return;

    setErrorMessage("");
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) setErrorMessage(error.message);
    else setTasks(tasks.filter((task) => task.id !== taskId));
  }

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setErrorMessage(error.message);
  }

  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <main className="page">
      <section className="todo-app" aria-labelledby="app-title">
        <h1 id="app-title">My Todo App</h1>
        <p className="intro">Keep your day simple and organized.</p>

        {isCheckingSession ? (
          <p className="empty-message">Checking your session...</p>
        ) : user ? (
          <>
            <div className="user-bar">
              <span>Signed in as {user.email}</span>
              <button className="text-button" onClick={signOut} type="button">Sign out</button>
            </div>
            <TodoForm onAddTask={addTask} />
            <TodoFilters currentFilter={filter} onFilterChange={setFilter} />
            {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}
            {isLoading && <p className="empty-message">Loading tasks...</p>}
            <TodoList
              tasks={isLoading ? [] : visibleTasks}
              onToggleTask={toggleTask}
              onEditTask={editTask}
              onDeleteTask={deleteTask}
            />
            <TodoStats tasks={tasks} />
          </>
        ) : (
          <>
            {errorMessage && <p className="error-message" role="alert">{errorMessage}</p>}
            {!errorMessage && <AuthForm />}
          </>
        )}
      </section>
    </main>
  );
}
