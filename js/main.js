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

pool.getConnection(function(err, connection) {
    if (err) console.log("Error al obtener acceso a la base de datos: " + err.message);
    else {
        const query = "SELECT Email, Password FROM Users";
        connection.query(query, function(err, rows) {
            connection.release();
            if (err) console.log("Error al realizar la consulta");
            else rows.forEach(function(row) {
                console.log(row.Email + " " + row.Password);
            });
        })
    }
});

let daoUsers = new DAOUsers(pool);


//DAO User
daoUsers.isUserCorrect("aitor.tilla@ucm.es", "aitor", cb_isUserCorrect);
daoUsers.isUserCorrect("usuario@ucm.es", "mipass", cb_isUserCorrect);

function cb_isUserCorrect(err, result) {
    if (err) console.log(err.message);
    else if (result) console.log("Usuario y contraseña correctos");
    else console.log("Usuario y/o contraseña incorrectos");
}

daoUsers.getUserImageName("aitor.tilla@ucm.es", cb_getUserImageName);
daoUsers.getUserImageName("usuario@ucm.es", cb_getUserImageName);

function cb_getUserImageName(err, result) {
    if (err) console.log(err.message);
    else console.log("Nombre de la imagen del usuario: " + result);
}

// DAO Task
let daoTasks = new DAOTasks(pool);