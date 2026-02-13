"use client";
import { useState, useEffect, useRef } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string;
  dueTime?: string;
  notified?: boolean;
}

// SVG Icons
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [inputTime, setInputTime] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
    // Initialize audio
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  }, []);

  // Check for due tasks every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      setTodos(prevTodos => {
        let changed = false;
        const newTodos = prevTodos.map(todo => {
          if (!todo.completed && !todo.notified && todo.dueDate && todo.dueTime) {
            if (todo.dueDate < currentDate || (todo.dueDate === currentDate && todo.dueTime <= currentTime)) {
              triggerNotification(todo);
              changed = true;
              return { ...todo, notified: true };
            }
          }
          return todo;
        });
        return changed ? newTodos : prevTodos;
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [todos]);

  const triggerNotification = (todo: Todo) => {
    if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
      new Notification("Task Reminder", {
        body: `Your task "${todo.text}" is due now!`,
        icon: "/favicon.ico"
      });
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      }
    }
  };

  const addTodo = () => {
    if (inputValue.trim() === "") return;
    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
      dueDate: inputDate || undefined,
      dueTime: inputTime || undefined,
      notified: false,
    };
    setTodos([...todos, newTodo]);
    setInputValue("");
    setInputDate("");
    setInputTime("");
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const toggleComplete = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed, notified: !todo.completed ? todo.notified : false } : todo
      )
    );
  };

  const startEditing = (id: number, todo: Todo) => {
    setEditingId(id);
    setEditValue(todo.text);
    setEditDate(todo.dueDate || "");
    setEditTime(todo.dueTime || "");
  };

  const saveEdit = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: editValue, dueDate: editDate || undefined, dueTime: editTime || undefined, notified: false } : todo
      )
    );
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-gray-900">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-2">
            Tasks
          </h1>
          <p className="text-lg text-gray-600">Advanced organization with reminders.</p>
        </header>

        {/* New Task Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500/20">
          <div className="space-y-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="What needs to be done?"
              className="w-full text-xl bg-transparent border-none focus:ring-0 placeholder-gray-400"
            />

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 group">
                <span className="text-sm font-medium text-gray-500 group-focus-within:text-blue-600">Due:</span>
                <input
                  type="date"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="time"
                  value={inputTime}
                  onChange={(e) => setInputTime(e.target.value)}
                  className="text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                onClick={addTodo}
                disabled={!inputValue.trim()}
                className="ml-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
              >
                <PlusIcon /> Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          {todos.length > 0 ? (
            <ul className="space-y-3">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className={`group bg-white rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${todo.completed ? "border-gray-100 bg-gray-50/50" : "border-gray-200"
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative flex items-center mt-1">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleComplete(todo.id)}
                        className="h-6 w-6 rounded-full border-2 border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer appearance-none checked:bg-blue-600 checked:border-transparent"
                      />
                      {todo.completed && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white">
                          <CheckIcon />
                        </div>
                      )}
                    </div>

                    {editingId === todo.id ? (
                      <div className="flex-grow space-y-3">
                        <input
                          type="text"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full p-2 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-200 text-lg"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="text-sm border-gray-200 rounded-lg"
                          />
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="text-sm border-gray-200 rounded-lg"
                          />
                          <div className="ml-auto flex gap-2">
                            <button onClick={() => saveEdit(todo.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><CheckIcon /></button>
                            <button onClick={cancelEdit} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><XIcon /></button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span
                            onClick={() => toggleComplete(todo.id)}
                            className={`text-lg transition-all duration-300 ${todo.completed ? "line-through text-gray-400" : "text-gray-700 font-medium"
                              }`}
                          >
                            {todo.text}
                          </span>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => startEditing(todo.id, todo)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><EditIcon /></button>
                            <button onClick={() => deleteTodo(todo.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon /></button>
                          </div>
                        </div>

                        {(todo.dueDate || todo.dueTime) && (
                          <div className={`mt-1 flex items-center gap-2 text-sm ${todo.completed ? "text-gray-300" : todo.notified ? "text-red-500 font-bold" : "text-gray-500"
                            }`}>
                            <BellIcon />
                            <span>
                              {todo.dueDate && new Date(todo.dueDate).toLocaleDateString()}
                              {todo.dueTime && ` @ ${todo.dueTime}`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              <p className="text-lg">No tasks scheduled</p>
            </div>
          )}
        </div>

        {todos.length > 0 && (
          <footer className="mt-8 text-center text-sm text-gray-400">
            {todos.filter(t => t.completed).length} of {todos.length} tasks completed
          </footer>
        )}
      </div>
    </main>
  );
}
