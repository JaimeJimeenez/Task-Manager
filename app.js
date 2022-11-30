"use strict"

const config = require("./config");
const DAOTasks = require("./DAOTasks");
const DAOUsers = require("./DAOUsers");
const utils = require("./utils");

const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const morgan = require("morgan");


// Middleware session
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore(config.mysqlConfig);

const middlewareSession = session( {
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});

const controlAccess = (request, response, next) => {
    if (!request.session.currentUser) response.redirect("/login");
    else {
        response.locals.userEmail = request.session.currentUser;
        next();
    }
};
// Create Server
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded( { extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(middlewareSession);

// Using morgan
app.use(morgan("dev"));

// Create pool's connections to the database
const pool = mysql.createPool(config.mysqlConfig);

// Create a DAOTasks instance
const daoTasks = new DAOTasks(pool);
const daoUsers = new DAOUsers(pool);

const user = "felipe.lotas@ucm.es";

app.get("/", (request, response) => {
    response.status(200);
    response.redirect("/login");
});

app.get("/login", (request, response) => {
    response.status(200);
    response.render("login", { errorMsg : null });
});

app.post("/login", (request, response) => {
    daoUsers.isUserCorrect(request.body.email, request.body.password, (err, user) => {
        if (err) console.log(err);
        else if (user) {
            response.status(200);
            request.session.currentUser = request.body.email;
            response.redirect("/tasks");
        } else {
            response.status(200);
            response.render("login", { errorMsg : "Email o contraseña incorrectos" });
        }
    });
});

app.get("/logout", (request, response) => {
    request.session.destroy();
    response.redirect("/login");
});

app.get("/tasks", controlAccess, (request, response) => {
    daoTasks.getAllTasks(request.session.currentUser, (err, rows) => {
        if (err) console.log(err);
        else response.render("tasks", { user : request.session.currentUser, tasks : rows });
    }); 
});

app.post("/addTask", controlAccess, (request, response) => {
    response.status(200);
    let task = utils.createTask(request.body.newTask);

    if (task.text.length !== 0) 
        daoTasks.insertTask(request.session.currentUser, task, (err) => {
            if (err) console.log(err);
            else response.redirect("/tasks");
        });
});

app.get("/finish/:id", controlAccess, (request, response) => {
    response.status(200);
    daoTasks.markTaskDone(request.params.id, (err) => {
        if (err) console.log(err);
        else response.redirect("/tasks");
    });
});

app.get("/deletedCompleted", controlAccess, (request, response) => {
    response.status(200);
    daoTasks.deleteCompleted(request.session.currentUser, (err) => {
        if (err) console.log(err);
        else response.redirect("/tasks");
    });

});

app.get("/imageUser", controlAccess, (request, response) => {
    console.log("Hola");
    daoUsers.getUserImageName(request.session.currentUser, (err, result) => {
        console.log(result);
        if (err) console.log(err);
        else if (result === null) response.sendFile(path.join(__dirname, "public/images", "noUser.png"));
        else response.sendFile(path.join(__dirname, "profile_imgs", result));
    });
});

// Initiate the server
app.listen(config.port, (err) => {
    if (err) console.log("ERROR al iniciar el servidor");
    else console.log("Servidor escuchando en el puerto " + config.port);
});