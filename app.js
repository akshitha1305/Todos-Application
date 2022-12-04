const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// Get all Todos whose status is TO DO
app.get("/todos/", async (request, response) => {
  const { search_q, priority, status } = request.query;
  const getToDosQuery = `
    SELECT *
    FROM todo 
    WHERE status = '${status}'; 
    `;
  const todoDetails = await db.all(getToDosQuery);
  response.send(todoDetails);
});
//get all Todos who priority is HIGH
app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  const getQuery = `
    SELECT *
    FROM todo
    WHERE priority = '${priority}';
    `;
  const dbResponse = await db.all(getQuery);
  console.log(dbResponse);
  response.send(dbResponse);
});

//get all Todos who priority is HIGH and status IN PROGRESS
app.get("/todos/", async (request, response) => {
  const { search_q, priority, status } = request.query;
  const getQuery = `
    SELECT *
    FROM todo
    WHERE priority = '${priority}' AND status = '${status}';
    `;
  const dbResponse = await db.all(getQuery);
  console.log(dbResponse);
  response.send(dbResponse);
});
//get todos which contains play in todo column
app.get("/todos/", async (request, response) => {
  const { search_q, priority, status } = response.query;
  const getQuery = `
    SELECT *
    FROM todo 
    WHERE todo LIKE '%${search_q}%';
    `;
  const dbResponse = await db.all(getQuery);
  response.send(dbResponse);
});
//Get specific todo based on the todoId
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};
    `;
  const dbResponse = await db.get(getTodo);
  response.send(dbResponse);
});
//Create a todo
app.post("/todos/", async (request, response) => {
  const { todoDetails } = request.body;
  const { id, todo, priority, status } = todoDetails;
  const postTodo = `
    INSERT INTO todo(id, todo, priority, status)
    VALUES(
        ${id},
        '${todo}',
        '${priority}',
        '${status}');
    `;
  const dbResponse = await db.run(postTodo);
  console.log(dbResponse);
  response.send("Todo Successfully Added");
});
//update todo status
app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  const { status } = todoDetails;
  const getQuery = `
    UPDATE todo
    SET status = ${status}
    WHERE id = ${todoId};
    `;
  await db.run(getQuery);
  response.send("Status Updated");
});

//update todo priority
//update todo
app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  const { priority } = todoDetails;
  const getQuery = `
    UPDATE todo
    SET priority = ${priority}
    WHERE id = ${todoId};
    `;
  await db.run(getQuery);
  response.send("Priority Updated");
});

//update todo
//update todo
app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  const { todo } = todoDetails;
  const getQuery = `
    UPDATE todo
    SET todo = ${todo}
    WHERE id = ${todoId};
    `;
  await db.run(getQuery);
  response.send("Todo Updated");
});

//delete a todo
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    DELETE FROM todo
    WHERE id = ${todoId};
    `;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
