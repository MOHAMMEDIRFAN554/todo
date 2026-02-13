"use client";
import { useState } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// SVG Icons as components for a cleaner UI
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

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const addTodo = () => {
    if (inputValue.trim() === "") return;
    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue,
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setInputValue("");
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const toggleComplete = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const startEditing = (id: number, text: string) => {
    setEditingId(id);
    setEditValue(text);
  };

  const saveEdit = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: editValue } : todo
      )
    );
    setEditingId(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-gray-900">
      <div className="max-w-xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-2">
            Tasks
          </h1>
          <p className="text-lg text-gray-600">Stay organized and productive.</p>
        </header>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 group focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="What needs to be done?"
              className="flex-grow bg-transparent border-none focus:ring-0 text-lg placeholder-gray-400"
            />
            <button
              onClick={addTodo}
              className="inline-flex items-center justify-center p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
            >
              <PlusIcon />
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length > 0 ? (
            <ul className="space-y-3">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className={`group bg-white rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${todo.completed ? "border-gray-100 bg-gray-50/50" : "border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Custom Styled Checkbox */}
                    <div className="relative flex items-center">
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
                      // Edit Mode
                      <div className="flex-grow flex items-center gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                          className="flex-grow p-2 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                        <button
                          onClick={() => saveEdit(todo.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Save"
                        >
                          <CheckIcon />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <XIcon />
                        </button>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex-grow flex items-center justify-between">
                        <span
                          onClick={() => toggleComplete(todo.id)}
                          className={`text-lg cursor-pointer transition-all duration-300 ${todo.completed ? "line-through text-gray-400" : "text-gray-700"
                            }`}
                        >
                          {todo.text}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => startEditing(todo.id, todo.text)}
                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit task"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete task"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No tasks yet</h3>
              <p className="text-gray-500">Add a task to get started with your day.</p>
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
