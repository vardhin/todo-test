import "./style.css"
import { useState, useEffect } from "react"

export default function App() {
  const [newItem, setNewItem] = useState("")
  const [image, setImage] = useState(null)
  const [todos, setTodos] = useState([])
  const [isPremium, setIsPremium] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const response = await fetch('http://localhost:3001/todos', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch todos')
      }
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error("Error fetching todos:", error)
      setError("Failed to load todos")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newItem.trim()) return

    try {
      let body
      if (isPremium && image) {
        const formData = new FormData()
        formData.append('task', newItem)
        formData.append('image', image)
        body = formData
      } else {
        body = JSON.stringify({ task: newItem })
      }

      const response = await fetch('http://localhost:3001/todos', {
        method: 'POST',
        headers: !image ? { 'Content-Type': 'application/json' } : undefined,
        body: body,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to add todo')
      }

      const newTodo = await response.json()
      setTodos(currentTodos => [...currentTodos, newTodo])
      setNewItem("")
      setImage(null)
      setError(null) // Clear any existing errors
    } catch (error) {
      console.error("Error adding todo:", error)
      setError("Failed to add todo")
    }
  }

  const toggleTodo = async (id, completed) => {
    try {
      const response = await fetch(`http://localhost:3001/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to update todo')
      }

      const updatedTodo = await response.json()
      setTodos(currentTodos =>
        currentTodos.map(todo =>
          todo.id === id ? updatedTodo : todo
        )
      )
      setError(null)
    } catch (error) {
      console.error("Error updating todo:", error)
      setError("Failed to update todo")
    }
  }

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/todos/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to delete todo')
      }

      setTodos(currentTodos => currentTodos.filter(todo => todo.id !== id))
      setError(null)
    } catch (error) {
      console.error("Error deleting todo:", error)
      setError("Failed to delete todo")
    }
  }

  const handleBuyPremium = () => {
    setIsPremium(true)
    alert("You are now a premium user!")
  }

  return (
    <>
      <button className="btn premium-btn" onClick={handleBuyPremium}>
        Buy Premium
      </button>

      <form onSubmit={handleSubmit} className="new-item-form">
        <div className="form-row">
          <label htmlFor="item">New Item</label>
          <input
            type="text"
            value={newItem}
            id="item"
            onChange={e => setNewItem(e.target.value)}
          />
        </div>
        {isPremium && (
          <div className="form-row">
            <label htmlFor="image">Image</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={e => setImage(e.target.files[0])}
            />
          </div>
        )}
        <button className="btn">Add</button>
      </form>

      <h1 className="header">To Do List</h1>

      {error && <div className="error" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <ul className="list">
        {todos.length === 0 && "No Todos"}
        {todos.map(todo => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={e => toggleTodo(todo.id, e.target.checked)}
              />
              {todo.task || todo.title}
            </label>
            {todo.image && (
              <img 
                src={`http://localhost:3001/${todo.image}`} 
                alt="Todo" 
                className="todo-image"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <button 
              onClick={() => deleteTodo(todo.id)} 
              className="btn btn-danger"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
