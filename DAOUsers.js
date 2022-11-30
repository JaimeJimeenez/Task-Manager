"use strict"

class DAOUsers {

    constructor(pool) { this.pool = pool; }

    getUserByEmail(email, callback) {
        this.pool.getConnection( (err, connection) => {

            if (err) callback(new Error("Error de conexión en la base de datos" + err.message));
            else {
                const sql = "SELECT * FROM Users WHERE Email = ?";

                connection.query(sql, [email], (err, rows) => {
                    connection.release();
                    if (err) callback("Error de acceso a la base de datos: " + err.message);
                    else callback(null, rows[0]);
                });
            }
        });
    }

    getUserTask(idUser, idTask, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback("Error de conexión a la base de datos: " + err.message);
            else {
                const sql = "SELECT * FROM UsersTasks WHERE IdUser = ? AND IdTask = ?;";

                connection.query(sql, [idUser, idTask], (err, result) => {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null, result[0]);
                });
            }
        });
    }

    getTasksDone(idUser, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "SELECT IdTask FROM UsersTasks WHERE IdUser = ? AND Done = 1;"

                connection.query(sql, [idUser], (err, tasks) => {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null, tasks);
                });
            }
        });
    }

    isUserCorrect(email, password, callback) {
        this.pool.getConnection(function(err, connection) {

            if (err) callback(new Error("Error de conexión a la base de datos" + err.message));
            else {
                const sql = "SELECT * FROM Users WHERE Email = ? AND Password = ?";

                connection.query(sql, [email, password], function(err, rows) {
                    connection.release();
                    if (err) callback(new Error("Error en la consulta"));
                    else if (rows.length === 0) callback(null, false);
                    else callback(null, true);
                });
            }
        });
    }

    insertTask(idUser, idTask, done, callback) {
        this.pool.getConnection((err, connection) => {

            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "INSERT INTO UsersTasks (IdUser, IdTask, Done) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM UsersTasks WHERE IdUser = ? AND IdTask = ?)"

                connection.query(sql, [idUser, idTask, done, idUser, idTask], (err, row) => {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null, row);
                })
            }
        });
    }

    getUserImageName(email, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) callback(new Error("Error de conexión a la base de datos" + err.message));
            else {
                const sql = "SELECT Img FROM Users WHERE Email = ?";

                connection.query(sql, [email], function(err, row) {
                    connection.release();
                    if (err) callback(new Error("Error en la consulta"));
                    else if (row.length === 0) callback(new Error("No existe ese usuario"));
                    else callback(null, row[0].Img);
                });
            }
        });
    }

    deleteTask(idUser, idTask, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "DELETE FROM UsersTasks WHERE IdUser = ? AND IdTask = ?;";

                connection.query(sql, [idUser, idTask], (err) => {
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null);
                });
            }
        });
    }
}

module.exports = DAOUsers;