"use client";
import { useState, useEffect, useRef } from "react";

interface Todo {
  _id?: string; // MongoDB uses _id
  id?: number;  // Fallback for old local todos if any
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

const LogOutIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [inputTime, setInputTime] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("todoToken");
    if (savedToken) {
      setToken(savedToken);
      fetchTodos(savedToken);
    } else {
      setIsLoading(false);
    }

    if (typeof window !== 'undefined' && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  }, []);

  const fetchTodos = async (authToken: string) => {
    try {
      const res = await fetch("/api/todos", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error("Failed to fetch todos", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("todoToken", data.token);
        setToken(data.token);
        fetchTodos(data.token);
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch (error) {
      setLoginError("An error occurred during login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("todoToken");
    setToken(null);
    setTodos([]);
    setUsername("");
    setPassword("");
  };

  useEffect(() => {
    if (!token) return;

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
              updateTodoStatus(todo._id!, { notified: true });
              return { ...todo, notified: true };
            }
          }
          return todo;
        });
        return changed ? newTodos : prevTodos;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [todos, token]);

  const updateTodoStatus = async (id: string, updates: Partial<Todo>) => {
    if (!token) return;
    try {
      await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Failed to update todo status", error);
    }
  };

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

  const addTodo = async () => {
    if (inputValue.trim() === "" || !token) return;
    const newTodo: Omit<Todo, "_id"> = {
      text: inputValue,
      completed: false,
      dueDate: inputDate || undefined,
      dueTime: inputTime || undefined,
      notified: false,
    };

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTodo),
      });
      if (res.ok) {
        const savedTodo = await res.json();
        setTodos([savedTodo, ...todos]);
        setInputValue("");
        setInputDate("");
        setInputTime("");
      }
    } catch (error) {
      console.error("Failed to add todo", error);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTodos(todos.filter((todo) => todo._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete todo", error);
    }
  };

  const toggleComplete = async (todo: Todo) => {
    if (!token || !todo._id) return;
    const newCompleted = !todo.completed;
    const updates = {
      completed: newCompleted,
      notified: newCompleted ? todo.notified : false
    };

    try {
      const res = await fetch(`/api/todos/${todo._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updatedTodo = await res.json();
        setTodos(todos.map((t) => (t._id === todo._id ? updatedTodo : t)));
      }
    } catch (error) {
      console.error("Failed to toggle complete", error);
    }
  };

  const startEditing = (todo: Todo) => {
    if (!todo._id) return;
    setEditingId(todo._id);
    setEditValue(todo.text);
    setEditDate(todo.dueDate || "");
    setEditTime(todo.dueTime || "");
  };

  const saveEdit = async (id: string) => {
    if (!token) return;
    const updates = {
      text: editValue,
      dueDate: editDate || undefined,
      dueTime: editTime || undefined,
      notified: false
    };

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updatedTodo = await res.json();
        setTodos(todos.map((todo) => (todo._id === id ? updatedTodo : todo)));
        setEditingId(null);
      }
    } catch (error) {
      console.error("Failed to save edit", error);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const completionRate = todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-900">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-blue-600">
              <CalendarIcon className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">System Access</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Awaiting authorization</p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-800"
                  placeholder="admin123"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-rose-500 text-xs font-black uppercase tracking-widest text-center mt-2 animate-pulse">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-5 px-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-200 transform hover:-translate-y-1 active:translate-y-0"
            >
              Initiate Login
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-900">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Dynamic Header */}
        <header className="relative py-8 px-1 rounded-3xl overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={handleLogout}
                  className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all group"
                  title="Logout"
                >
                  <LogOutIcon className="w-5 h-5" />
                </button>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">Secure Session</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-5xl mb-2">
                {getGreeting()}, <span className="text-blue-600">Admin</span>
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
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-2 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300 transform active:scale-[0.998]">
          <div className="p-8">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="What's on your mind?"
              className="w-full text-2xl font-bold bg-transparent border-none focus:ring-0 placeholder-slate-300 py-2"
            />

            <div className="flex flex-wrap items-center justify-between gap-6 mt-8 pt-8 border-t border-slate-50">
              <div className="flex flex-wrap items-center gap-4">
                <div className="group relative flex items-center gap-3 bg-slate-50/50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-100 px-5 py-2.5 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-blue-100/50">
                  <CalendarIcon className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={inputDate}
                      onChange={(e) => setInputDate(e.target.value)}
                      className="bg-transparent border-none p-0 text-xs font-black uppercase tracking-widest text-slate-500 focus:ring-0 w-[105px] cursor-pointer"
                    />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-blue-200 mx-1" />
                    <input
                      type="time"
                      value={inputTime}
                      onChange={(e) => setInputTime(e.target.value)}
                      className="bg-transparent border-none p-0 text-xs font-black uppercase tracking-widest text-slate-500 focus:ring-0 w-[65px] cursor-pointer font-mono"
                    />
                  </div>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Optional Reminder
                  </span>
                </div>
              </div>

              <button
                onClick={addTodo}
                disabled={!inputValue.trim()}
                className="inline-flex items-center gap-3 px-10 py-4 rounded-[1.5rem] bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-200 disabled:opacity-30 disabled:shadow-none translate-y-0 hover:-translate-y-1 active:translate-y-0"
              >
                <PlusIcon className="w-5 h-5" /> Launch Task
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex items-center justify-between px-4">
          <div className="flex gap-2 p-1.5 bg-slate-100/80 backdrop-blur rounded-[1.25rem] border border-slate-200/50 shadow-inner">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-8 py-2.5 rounded-[0.9rem] text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${filter === f
                    ? "bg-white text-slate-900 shadow-md transform scale-[1.05]"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {filteredTodos.length} Active Modules
            </span>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-5">
          {filteredTodos.length > 0 ? (
            <div className="grid grid-cols-1 gap-5">
              {filteredTodos.map((todo) => (
                <div
                  key={todo._id}
                  className={`group relative bg-white rounded-[2rem] border-2 transition-all duration-500 ${todo.completed
                      ? "border-slate-50 bg-slate-50/10 grayscale opacity-60"
                      : "border-transparent shadow-lg shadow-slate-200/40 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/20"
                    }`}
                >
                  <div className="flex items-start gap-6 p-6">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleComplete(todo)}
                      className={`mt-1.5 flex-shrink-0 w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${todo.completed
                          ? "bg-green-500 border-green-500 text-white rotate-[360deg] shadow-lg shadow-green-200"
                          : "border-slate-100 bg-slate-50/50 group-hover:border-blue-400 group-hover:bg-blue-50/30 group-hover:scale-110"
                        }`}
                    >
                      {todo.completed && <CheckIcon className="w-5 h-5" />}
                    </button>

                    {editingId === todo._id ? (
                      <div className="flex-grow space-y-5 pr-16 animate-in fade-in slide-in-from-left-4">
                        <input
                          type="text"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full text-2xl font-bold bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 py-3 px-4 transition-all"
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="bg-transparent border-none p-0 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-0 cursor-pointer"
                            />
                            <div className="w-1 h-1 rounded-full bg-slate-300 mx-1" />
                            <input
                              type="time"
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              className="bg-transparent border-none p-0 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-0 cursor-pointer font-mono"
                            />
                          </div>
                          <div className="ml-auto flex gap-2">
                            <button onClick={() => saveEdit(todo._id!)} className="p-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-blue-600 transition-all"><CheckIcon className="w-5 h-5" /></button>
                            <button onClick={() => setEditingId(null)} className="p-3 bg-white text-slate-400 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all"><XIcon className="w-5 h-5" /></button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-grow pr-16">
                        <div className="flex flex-col">
                          <span
                            onClick={() => toggleComplete(todo)}
                            className={`text-2xl font-bold cursor-pointer transition-all duration-500 ${todo.completed ? "text-slate-300 line-through tracking-normal" : "text-slate-800 tracking-tight"
                              }`}
                          >
                            {todo.text}
                          </span>

                          {(todo.dueDate || todo.dueTime) && (
                            <div className={`inline-flex items-center gap-2.5 mt-3 self-start px-4 py-1.5 rounded-xl text-[10px] font-black tracking-[0.15em] leading-none transition-all duration-500 ${todo.completed
                                ? "bg-slate-100/50 text-slate-400"
                                : todo.notified
                                  ? "bg-rose-500 text-white shadow-lg shadow-rose-200 animate-pulse"
                                  : "bg-blue-600 text-white shadow-lg shadow-blue-100"
                              }`}>
                              <BellIcon className="w-3.5 h-3.5" />
                              <span className="uppercase">
                                {todo.dueDate && new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                {todo.dueTime && (
                                  <>
                                    <span className="mx-2 opacity-50">|</span>
                                    <span className="font-mono">{todo.dueTime}</span>
                                  </>
                                )}
                                {todo.notified && !todo.completed && " • SYSTEM OVERLOAD"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* High-Tech Actions */}
                  {!editingId && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => startEditing(todo)}
                        className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                        title="Edit Module"
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo._id!)}
                        className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                        title="Terminate Module"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 group-hover:rotate-[15deg] transition-all duration-700">
                  <PlusIcon className="w-14 h-14" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">Zero Objectives Remaining</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Awaiting new directives</p>
              </div>
            </div>
          )}
        </div>

        {todos.length > 0 && (
          <footer className="mt-12 flex items-center justify-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-slate-200" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
              {todos.filter(t => t.completed).length} / {todos.length} Protocols Finalized
            </p>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-slate-200" />
          </footer>
        )}
      </div>
    </main>
  );
}
