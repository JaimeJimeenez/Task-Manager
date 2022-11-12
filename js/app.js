"use strict"

const mysql = require("mysql");
const config = require("./config.js");
const DAOUsers = require("./DAOUsers.js");
const DAOTasks = require("./DAOTasks");

const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

let daoUsers = new DAOUsers(pool);
let daoTasks = new DAOTasks(pool);

//DAO User
//daoUsers.isUserCorrect("aitor.tilla@ucm.es", "aitor", cb_isUserCorrect);
//daoUsers.isUserCorrect("usuario@ucm.es", "mipass", cb_isUserCorrect);

function cb_isUserCorrect(err, result) {
    if (err) console.log(err.message);
    else if (result) console.log("Usuario y contraseña correctos");
    else console.log("Usuario y/o contraseña incorrectos");
}

//daoUsers.getUserImageName("aitor.tilla@ucm.es", cb_getUserImageName);
//daoUsers.getUserImageName("usuario@ucm.es", cb_getUserImageName);

function cb_getUserImageName(err, result) {
    if (err) console.log(err.message);
    else console.log("Nombre de la imagen del usuario: " + result);
}

// DAO Task
//daoTasks.getAllTasks("aitor.tilla@ucm.es", cb_getAllTasks);

function cb_getAllTasks(err, result) {
    if (err) console.log(err.message);
    else console.log(result);
}

let task = {
    text: "Comer pizza",
    done: false,
    tags: ["Comida", "Arroz"]
}

daoTasks.insertTask("felipe.lotas@ucm.es", task, cb_insertTask);

function cb_insertTask(err, result) {
    if (err) console.log(err.message);
    else console.log("Tarea insertada");
}

//daoTasks.markTaskDone(1, cb_markTaskDone);

function cb_markTaskDone(err) {
    if (err) console.log(err.message);
    else console.log("Tarea marcada como hecha");
}

//daoTasks.deleteCompleted("aitor.tilla@ucm.es", cb_deleteCompleted);

function cb_deleteCompleted(err) {
    if (err) console.log(err.message);
    else console.log("Tarea eliminada");
}