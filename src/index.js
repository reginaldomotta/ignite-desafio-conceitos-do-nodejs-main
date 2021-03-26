const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());
app.use(cors());

const users = [];

//check user -- OK
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  } else {
    request.user = user;
    return next();
  }
}

//create user -- OK
app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  } else {
    const user = {
      id: uuidv4(),
      name,
      username,
      todos: [],
    };
    users.push(user);
    return response.status(201).send(user);
  }
});

//listing activities user -- OK
app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

//create activity user -- OK
app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const activity = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(activity);

  return response.status(201).json(activity);
});

//update activity -- OK
app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const activityAlreadyExists = user.todos.some(
    (activity) => activity.id === id
  );

  if (!activityAlreadyExists) {
    return response.status(404).json({ error: "Activity not found!" });
  } else {
    const activity = user.todos.find((activity) => activity.id === id);
    activity.title = title;
    activity.deadline = new Date(deadline);

    return response.status(200).json(activity);
  }
});

//update activity done -- OK
app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const activityAlreadyExists = user.todos.some(
    (activity) => activity.id === id
  );

  if (!activityAlreadyExists) {
    return response.status(404).json({ error: "Activity not found!" });
  } else {
    const activity = user.todos.find((activity) => activity.id === id);
    activity.done = true;

    return response.status(200).json(activity);
  }
});

//delete activity -- OK
app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const activityAlreadyExists = user.todos.some(
    (activity) => activity.id === id
  );

  if (!activityAlreadyExists) {
    return response.status(404).json({ error: "Activity not found!" });
  } else {
    const toDelete = user.todos.filter((activity) => activity.id === id);
    user.todos.splice(toDelete);

    return response.status(204).json(user.todos);
  }
});

module.exports = app;
