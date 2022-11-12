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

    getTask(text, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) callback("Error de conexión a la base de datos: " + err.message);
            else {
                const sql = "SELECT * FROM Tasks WHERE Text = ?;";

                connection.query(sql, [text], (err, task) => {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos"));
                    else callback(null, task[0]);
                });
            }
        });
    }

    getTag(text, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "SELECT * FROM Tags WHERE Text = ?;"

                connection.query(sql, [text], (err, tag) => {
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null, tag[0]);
                });
            }
        });
    }

    insertTaskIfNotExists(text, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "INSERT INTO Tasks (Text) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM Tasks WHERE Text = ?);";

                connection.query(sql, [text, text], (err, task) => {
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null, task);
                });
            }
        });
    }

    insertTaskTag(idTask, idTag, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "INSERT INTO TasksTags (IdTask, IdTag) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM TasksTags WHERE IdTask = ? AND IdTag = ?);"

                connection.query(sql, [idTask, idTag, idTask, idTag], (err) => {
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null);
                });
            }
        });
    }

    insertTag(text, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "INSERT INTO Tags (Text) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM Tags WHERE Text = ?);"

                connection.query(sql, [text, text], (err, tag) => {
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null, tag);
                });
            }
        });
    }

    insertTask(email, task, callback) {
        this.pool.getConnection((err, connection) => {

            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                let daoUsers = new DAOUsers(this.pool);

                daoUsers.getUserByEmail(email, (err, user) => {
                    if (err) callback(err);
                    else {
                        let idUser = user.Id;
                        
                        this.insertTaskIfNotExists(task.text, (err, result) => {
                            if (err) callback(err);
                            else {
                                this.getTask(task.text, (err, row) => {
                                    if (err) callback(err);
                                    else {
                                        let idTask = row.Id;

                                        daoUsers.insertTask(idUser, idTask, task.done, (err, row) => {
                                            if (err) callback(err);
                                        });

                                        task.tags.forEach(tag => {
                                            this.insertTag(tag, (err) => {
                                                if (err) callback(err);
                                                else this.getTag(tag, (err, row) => {
                                                    if (err) callback(err);
                                                    else {
                                                        let idTag = row.Id;

                                                        this.insertTaskTag(idTask, idTag, (err) => {
                                                            if (err) callback(err);
                                                            else callback(null);
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