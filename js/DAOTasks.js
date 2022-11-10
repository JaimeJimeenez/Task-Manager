"use strict"

let DAOUsers = require("./DAOUsers");

class DAOTasks {

    constructor(pool) { this.pool = pool; }

    getAllTasks(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback("Error de conexión a la base de datos: " + err.message);
            else {
                let idUser;
                let daoUsers = new DAOUsers(this.pool);
                
                daoUsers.getUserByEmail(email, (err, user) => {
                    if (err) callback(err);
                    else {
                        idUser = user.Id;
                        const sql = "SELECT IdUser, Tasks.Id, Done, Tasks.Text, Tags.Text AS Etiquetas FROM UsersTasks JOIN Tasks ON Tasks.Id = UsersTasks.IdTask JOIN TasksTags ON TasksTags.IdTask = UsersTasks.IdTask JOIN Tags ON Tags.Id = TasksTags.IdTag WHERE IdUser = ?;";
                        connection.query(sql, [idUser], (err, rows) => {
                            connection.release();
                            if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                            else callback(null, rows);
                        });
                    } 
                });
            }
        });
    }

    getTaskByText(text, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) callback("Error de conexión a la base de datos: " + err.message);
            else {
                const sql = "SELECT * FROM Tasks WHERE Text = ?;";

                connection.query(sql, [text], (err, rows) => {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos"));
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

    insertTask(email, task, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                let daoUsers = new DAOUsers(this.pool);
                let idUser, idTask, idTag, sql;

                daoUsers.getUserByEmail(email, (err, user) => {
                    if (err) callback(err);
                    else {
                        idUser = user.Id; // Assuming that the user exists
                        
                        this.getTaskByText(task.text, (err, result) => {
                            if (err) callback(err);
                            else if (result === undefined) {
                                sql = "INSERT INTO Tasks (Text) VALUE (?);";

                                connection.query(sql, [task.text], (err, result) => {
                                    connection.release();
                                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                                    else callback(null);
                                });
                            }
                        });

                        this.getTaskByText(task.text, (err, result) => {
                            if (err) callback(err);
                            else {
                                console.log(result);
                                idTask = result.Id;

                                this.getUserTask(idUser, idTask, (err, result) => {
                                    console.log(result);
                                    if (err) callback(err);
                                    else if (result === undefined) {
                                        sql = "INSERT INTO UsersTasks (IdUser, IdTask, Done) VALUES (?, ?, ?);";

                                        connection.query(sql, [idUser, idTask, task.done], (err, row) => {
                                            connection.release();
                                            if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                                            else callback(null);
                                        });
                                    }
                                });

                                task.tags.forEach(tag => {
                                    this.getTagByText(tag, (err, row) => {
                                        if (err) callback(err);
                                        else if (row === undefined) {
                                            sql = "INSERT INTO Tags (Text) VALUE (?);";

                                            connection.query(sql, [tag], (err, result) => {
                                                connection.release();
                                                if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                                                else idTag = result.insertId;
                                            });
                                        }
                                        else idTag = row.Id;

                                        this.getTagsByTask(idTask, (err, rows) => {
                                            if (err) callback(err);
                                            else {
                                                rows.forEach(row => {
                                                    sql = "SELECT * FROM TasksTags WHERE IdTask = ? AND IdTag = ?;";

                                                    connection.query(sql, [idTask, idTag], (err, result) => {
                                                        connection.release();
                                                        if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                                                        else if (result === undefined) {
                                                            sql = "INSERT INTO TasksTags (IdTask, IdTag) VALUES (?, ?);"

                                                            connection.query(sql, [idTask, idTag], (err, result) => {
                                                                connection.release();
                                                                if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                                                                else callback(null);
                                                            });
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    });
                                });
                            } 
                        });
                    }
                });
            }
        });   
    }

    getTagsByTask(idTask, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                //console.log(idTask);
                const sql = "SELECT * FROM TasksTags WHERE IdTask = ?";

                connection.query(sql, [idTask], (err, tags) => {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null, tags);
                });
            }
        });
    }

    getTagByText(text, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos"));
            else {
                const sql = "SELECT * FROM Tags WHERE Text = ?";

                connection.query(sql, [text], (err, tag) => {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos"));
                    else callback(null, tag[0]);
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