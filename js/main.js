"use strict"

const mysql = require("mysql");
const config = require("./config");
const DAOUsers = require("./DAOUsers");
const DAOTasks = require("./DAOTasks");

// Create pool's connection
const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

let daoUser = new DAOUsers(pool);
let daoTasks = new DAOTasks(pool);

// Callback functions


// Methods of the DAO's
daoUser.isUserCorrect("usuario@ucm.es", "mipass", cb_isUserCorrect);
daoUser.isUserCorrect("aitor.tilla@ucm.es", "aitor", cb_isUserCorrect);
daoUser.getUserImage("aitor.tilla@ucm.es", cb_getUserImage);

function cb_isUserCorrect(err, result) {
    if (err) console.log(err.message);
    else if (result) console.log("Usuario y contraseña correctos");
    else console.log("Usuario y/o contraseña incorrectos");
}

function cb_getUserImage(err, result) {
    if (err) console.log(err.mesage);
    else console.log("Imagen de usuario: " + result);
}

function cb_getAllTasks(err, result) {
    if (err) console.log(err.mesage);
    else console.log(result);
}

function cb_insertTask(err, result) {
    if (err) console.log(err.message);
    else console.log("Task inserted");
}

function cb_markTaskDone(err, result) {
    if (err) console.log(err.message);
    else console.log("Tasks mark done");
}

function cb_deleteCompleted(err, result) {
    if (err) console.log(err.message);
    else console.log("Tasks completed deleted");
}

daoTasks.getAllTasks("aitor.tilla@ucm.es", cb_getAllTasks);
//daoTasks.insertTask()
daoTasks.markTaskDone(2, cb_markTaskDone);
daoTasks.deleteCompleted("aitor.tilla@ucm.es", cb_deleteCompleted);
