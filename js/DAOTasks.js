"use strict"

let DAOUsers = require("./DAOUsers");

class DAOTasks {

    constructor(pool) { this.pool = pool; }

    getAllTasks(email, callback) {

    }

    getTaskByText(text, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) callback("Error de conexión a la base de datos: " + err.message);
            else {
                const sql = "SELECT * FROM Tasks WHERE Text = ?";

                connection.query(sql, [text], (err, rows) => {
                    connection.release();

                    if (err) callback(new Error("Error de acceso a la base de datos"));
                    else callback(null, rows[0]);
                });
            }
        })
    }

    insertTask(email, task, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                let daoUsers = new DAOUsers(this.pool);
                let idUser, idTask, sql;

                daoUsers.getUserByEmail(email, (err, user) => {
                    if (err) callback(err);
                    else {
                        idUser = user.Id; // Assuming that the user exists
                        
                        this.getTaskByText(task.text, (err, result) => {
                            if (err) callback(err);
                            else {
                                if (result === undefined) {
                                    sql = "INSERT INTO Tasks (Text) VALUE (?)";

                                    connection.query(sql, [task.text], (err, row) => {
                                        if (err) callback(new Error("Error de acceso a la base de datos" + err.message));
                                        else idTask = row.insertId;
                                    });
                                }
                                else idTask = result.Id;
                            }

                            sql = "INSERT INTO UsersTasks (IdUser, IdTask, Done) VALUES (?, ?, ?)";

                            connection.query(sql, [idUser, idTask, task.done], (err, row) => {
                                if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                                else callback(null);
                            });

                            sql = "INSERT INTO TasksTags (IdTask, IdTag) VALUES (?, ?)";

                            task.tags.forEach(tag => {
                                connection.query(sql, [idTask, tag], (err, row) => {
                                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                                });
                            });
                        });
                    }
                    connection.release();
                });
            }
        });
    }

    markTaskDone(idTask, callback) {
        this.pool.getConnection(function(err, connection) {

            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "UPDATE UsersTasks SET Done = 1 WHERE IdTask = ?";
                connection.query(sql, [idTask], function(err, rows){
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null);
                });
            }

        });
    }

    deleteCompleted(email, callback) {
        this.pool.getConnection(function(err, connection) {
            
            if (err) callback(new Error("Error de conexión en la base de datos"));
            else {
                const sql = "DELETE FROM UsersTasks WHERE EXISTS ( SELECT * FROM Users WHERE UsersTasks.IdUser = Id AND Email = ? AND UsersTasks.Done = 1) ";

                connection.query(sql, [email], function(err, rows) {
                    connection.release();

                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null);
                });
            }
        });
    }
}

module.exports = DAOTasks;