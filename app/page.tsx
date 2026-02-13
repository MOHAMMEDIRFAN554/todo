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
const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

const EditIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const XIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const BellIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);

const CalendarIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
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
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  }, []);

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
    }, 15000); // Check every 15 seconds for more responsiveness

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
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
    setTodos([newTodo, ...todos]); // Add new tasks to the top
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

  const filteredTodos = todos.filter(todo => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const completionRate = todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Dynamic Header */}
        <header className="relative py-8 px-1 rounded-3xl overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-5xl mb-2">
                {getGreeting()}, <span className="text-blue-600">User</span>
              </h1>
              <p className="text-lg text-slate-500 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/20">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{todos.length}</p>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Total</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{todos.filter(t => t.completed).length}</p>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Done</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Rate</p>
              </div>
            </div>
          </div>
        </header>

        {/* Task Creation Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-2 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 transform active:scale-[0.995]">
          <div className="p-6">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a new task..."
              className="w-full text-2xl font-medium bg-transparent border-none focus:ring-0 placeholder-slate-300 py-2"
            />

            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-50">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl group focus-within:bg-blue-50 transition-colors">
                  <CalendarIcon className="text-slate-400 group-focus-within:text-blue-500" />
                  <input
                    type="date"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    className="bg-transparent border-none p-0 text-sm font-semibold text-slate-600 focus:ring-0"
                  />
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <input
                    type="time"
                    value={inputTime}
                    onChange={(e) => setInputTime(e.target.value)}
                    className="bg-transparent border-none p-0 text-sm font-semibold text-slate-600 focus:ring-0"
                  />
                </div>
              </div>

              <button
                onClick={addTodo}
                disabled={!inputValue.trim()}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-black transition-all shadow-lg hover:shadow-slate-300 disabled:opacity-50 disabled:shadow-none"
              >
                <PlusIcon className="w-6 h-6" /> Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex items-center justify-between px-2">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
          <p className="hidden sm:block text-sm font-bold text-slate-400">
            {filteredTodos.length} Tasks
          </p>
        </div>

        {/* Tasks Grid/List */}
        <div className="space-y-4">
          {filteredTodos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`group relative bg-white rounded-3xl border-2 p-5 transition-all duration-300 hover:border-slate-300 ${todo.completed ? "border-slate-50 bg-slate-50/20" : "border-white shadow-sm"
                    }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleComplete(todo.id)}
                      className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full border-3 flex items-center justify-center transition-all ${todo.completed
                        ? "bg-green-500 border-green-500 text-white scale-110"
                        : "border-slate-200 bg-white group-hover:border-blue-500 scale-100"
                        }`}
                    >
                      {todo.completed && <CheckIcon />}
                    </button>

                    {editingId === todo.id ? (
                      <div className="flex-grow space-y-4 pr-12">
                        <input
                          type="text"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full text-xl font-bold bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 py-2"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="bg-slate-50 border-none rounded-lg text-sm font-bold focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="bg-slate-50 border-none rounded-lg text-sm font-bold focus:ring-1 focus:ring-blue-500"
                          />
                          <div className="ml-auto flex gap-2">
                            <button onClick={() => saveEdit(todo.id)} className="p-3 bg-green-500 text-white rounded-xl shadow-lg shadow-green-100 hover:bg-green-600 transition-all"><CheckIcon className="w-5 h-5" /></button>
                            <button onClick={() => setEditingId(null)} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"><XIcon className="w-5 h-5" /></button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-grow pr-12">
                        <div className="flex flex-col">
                          <span
                            onClick={() => toggleComplete(todo.id)}
                            className={`text-xl font-bold cursor-pointer transition-all duration-300 ${todo.completed ? "text-slate-300 line-through" : "text-slate-800"
                              }`}
                          >
                            {todo.text}
                          </span>

                          {(todo.dueDate || todo.dueTime) && (
                            <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-xs font-bold leading-none ${todo.completed
                              ? "bg-slate-100 text-slate-400"
                              : todo.notified
                                ? "bg-rose-100 text-rose-600 animate-pulse"
                                : "bg-blue-50 text-blue-600"
                              }`}>
                              <BellIcon className="w-3 h-3" />
                              <span>
                                {todo.dueDate && new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {todo.dueTime && ` at ${todo.dueTime}`}
                                {todo.notified && !todo.completed && " • OVERDUE"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Desktop Actions */}
                  {!editingId && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => startEditing(todo.id, todo)}
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                        title="Edit task"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                        title="Delete task"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <PlusIcon className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Clean Slate!</h3>
              <p className="text-slate-400 font-medium">Nothing on the menu right now.</p>
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
