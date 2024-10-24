require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db/init');
const { getAllTodos, createTodo, updateTodoStatus, deleteTodo } = require('./db/queries');

const app = express();
const port = process.env.PORT || 3001;
console.log(process.env.DATABASE_URL);

// Updated CORS configuration
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add this before your routes
app.options('*', cors()); // Enable pre-flight requests for all routes

// Middleware
app.use(express.json());

// Initialize database
initDatabase().catch(console.error);

// Test Route (optional)
app.get('/', (req, res) => {
    res.send('Connection Successful!');
});

// Get all tasks
app.get('/todos', async(req, res) => {
    try {
        const todos = await getAllTodos();
        res.json(todos);
    } catch (error) {
        console.error('Error in GET /todos:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new task
app.post('/todos', async(req, res) => {
    const { task } = req.body;
    try {
        const newTodo = await createTodo(task);
        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error in POST /todos:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update task status
app.patch('/todos/:id', async(req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updatedTodo = await updateTodoStatus(id, status);
        if (!updatedTodo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(updatedTodo);
    } catch (error) {
        console.error('Error in PATCH /todos/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete task
app.delete('/todos/:id', async(req, res) => {
    const { id } = req.params;
    try {
        const deleted = await deleteTodo(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error in DELETE /todos/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Export as a serverless function
module.exports = app;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});