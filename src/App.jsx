import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null); // State untuk notifikasi

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/todo')
      .then(response => {
        setTodos(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (event) => {
    setNewTask(event.target.value);
  };

  const handleCheckboxChange = (event) => {
    setIsDone(event.target.checked);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editingTask) {
      handleUpdate(editingTask.id, newTask, isDone);
    } else {
      handleCreate();
    }
  };

  const handleCreate = () => {
    const newTodo = {
      task: newTask,
      is_done: isDone ? 1 : 0,
    };

    axios.post('http://127.0.0.1:8000/api/todo', newTodo, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        setTodos([...todos, response.data]);
        setNewTask('');
        setIsDone(false);
        setNotification('Task added successfully'); // Notifikasi sukses
      })
      .catch(error => {
        setError(error);
        setNotification('Failed to add task'); // Notifikasi gagal
      });
  };

  const handleUpdate = (id, task, isDone) => {
    const updatedTodo = {
      task,
      is_done: isDone ? 1 : 0,
    };

    axios.put(`http://127.0.0.1:8000/api/todo/${id}`, updatedTodo, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        setTodos(todos.map(todo => (todo.id === id ? response.data : todo)));
        setNewTask('');
        setEditingTask(null);
        setIsDone(false);
        setNotification('Task updated successfully'); // Notifikasi sukses
      })
      .catch(error => {
        setError(error);
        setNotification('Failed to update task'); // Notifikasi gagal
      });
  };

  const handleEdit = (todo) => {
    setNewTask(todo.task);
    setEditingTask(todo);
    setIsDone(todo.is_done);
  };

  const handleDelete = (id) => {
    axios.delete(`http://127.0.0.1:8000/api/todo/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(() => {
        setTodos(todos.filter(todo => todo.id !== id));
        setNotification('Task deleted successfully'); // Notifikasi sukses
      })
      .catch(error => {
        setError(error);
        setNotification('Failed to delete task'); // Notifikasi gagal
      });
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      {notification && (
        <div className="mb-4 p-4 border border-green-500 bg-green-100 text-green-700">
          {notification}
          <button
            onClick={handleCloseNotification}
            className="ml-4 bg-transparent border-0 text-green-700 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={newTask}
          onChange={handleInputChange}
          placeholder="Add a new task"
          required
          className="border p-2 mr-2"
        />
        {editingTask && (
          <label className="mr-2">
            <input
              type="checkbox"
              checked={isDone}
              onChange={handleCheckboxChange}
              className="mr-1"
            />
            Mark as completed
          </label>
        )}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          {editingTask ? 'Update Task' : 'Add Task'}
        </button>
      </form>
      <ul className="list-disc pl-5">
        {todos.map(todo => (
          <li key={todo.id} className="mb-2 flex justify-between items-center">
            <span>
              {todo.task} - {todo.is_done ? 'Completed' : 'Pending'}
            </span>
            <div>
              <button
                onClick={() => handleEdit(todo)}
                className="bg-yellow-500 text-white px-4 py-2 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(todo.id)}
                className="bg-red-500 text-white px-4 py-2"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
