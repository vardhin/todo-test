const pool = require('./config');

const getAllTodos = async () => {
    const result = await pool.query('SELECT * FROM tasks');
    return result.rows;
};

const createTodo = async (task) => {
    const result = await pool.query('INSERT INTO tasks (task) VALUES ($1) RETURNING *', [task]);
    return result.rows[0];
};

const updateTodoStatus = async (id, completed) => {
    const status = completed ? 'completed' : 'pending';
    const result = await pool.query('UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    return result.rows[0];
};

const deleteTodo = async (id) => {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    return result.rowCount > 0;
};

module.exports = { getAllTodos, createTodo, updateTodoStatus, deleteTodo };
