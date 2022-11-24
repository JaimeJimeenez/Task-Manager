"use strict"

const config = require("./config");
const DAOTasks = require("./DAOTasks");
const utils = require("./utils");

const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const fs = require("fs");

// Create Server
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded( { extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Using morgan
app.use(morgan("dev"));

// Create pool's connections to the database
const pool = mysql.createPool(config.mysqlConfig);

// Create a DAOTasks instance
const daoTasks = new DAOTasks(pool);

const user = "felipe.lotas@ucm.es";

app.get("/", (request, response) => {
    response.status(200);
    response.redirect("/tasks");
});

app.get("/tasks", (request, response) => {
    daoTasks.getAllTasks(user, (err, rows) => {
        if (err) console.log(err);
        else response.render("tasks", { 
            tasks : rows 
        });
    }); 
});

app.post("/addTask", (request, response) => {
    response.status(200);
    let task = utils.createTask(request.body.newTask);
    console.log(task);
    if (task.text.length !== 0) 
        daoTasks.insertTask(user, task, (err) => {
            if (err) console.log(err);
            else response.redirect("/tasks");
        });
});

app.get("/finish/:id", (request, response) => {
    response.status(200);
    daoTasks.markTaskDone(request.params.id, (err) => {
        if (err) console.log(err);
        else response.redirect("/tasks");
    });
});

app.get("/deletedCompleted", (request, response) => {
    response.status(200);

    daoTasks.deleteCompleted(user, (err) => {
        if (err) console.log(err);
        else response.redirect("/tasks");
    });

});

// Initiate the server
app.listen(config.port, (err) => {
    if (err) console.log("ERROR al iniciar el servidor");
    else console.log("Servidor escuchando en el puerto " + config.port);
});