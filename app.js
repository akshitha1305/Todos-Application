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

//get all Todo according to priority and status

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let getQuery = "";
  let dbResponse = null;

  switch (true) {
    case hasStatusProperty(request.query):
      getQuery = `
            SELECT *
            FROM todo
            WHERE status = '${status}';
            `;
      break;

    case hasPriorityProperty(request.query):
      getQuery = `
          SELECT *
          FROM todo
          WHERE priority = '${priority}';
          `;
      break;

    case hasPriorityAndStatus(request.query):
      getQuery = `
        SELECT *
        FROM todo 
        WHERE priority = '${priority}' AND status = '${status}';
        `;
      break;

    default:
      getQuery = `
        SELECT * FROM todo WHERE todo LIKE '%${search_q}%';
        `;
  }

  dbResponse = await db.all(getQuery);
  response.send(dbResponse);
});

//get Todo by todoId
app.get("/todos/:todoId", async (request, response) => {
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
  response.send("Todo Successfully Added");
});
//update todo status
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updateColumn = "";
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `
    SELECT * 
    FROM todo
    WHERE id = ${todoId};
    `;
  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updatedTodoQuery = `
    UPDATE todo
    SET todo = '${todo}',
    priority = '${priority}',
    status = '${status}'
    WHERE id = ${todoId};
    `;

  await db.run(updatedTodoQuery);
  response.send(`${updateColumn} Updated`);
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
