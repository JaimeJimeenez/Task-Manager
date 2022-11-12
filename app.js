"use strict"

const config = require("./config");
const DAOTasks = require("./DAOTasks");
const utils = require("./utils");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();

const pool = mysql.createPool(config.mysqlConfig);

const daoTasks = new DAOTasks(pool);

app.listen(3000, (err) => {
    if (err) console.log("Error al iniciar el servidor");
    else console.log("Servidor escuchando por el puerto 3000");
})