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
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null, tag[0]);
                });
            }
        });
    }

    getTagsByTask(idTask, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "SELECT IdTag FROM TasksTags WHERE IdTask = ?;"

                connection.query(sql, [idTask], (err, tags) => {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null, tags);
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
                    connection.release();
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
                    connection.release();
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
                    connection.release();
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
                                                        });
                                                    }
                                                });
                                            });
                                        });                            
                                        callback(null);
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

    countTags(idTag, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión en la base de datos: " + err.message));
            else {
                const sql = "SELECT COUNT(*) FROM TasksTags WHERE IdTag = ?;";
                
                connection.query(sql, [idTag], (err, count) => {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null, count[0]);
                });
            }
        });
    }

    countTasks(idTask, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "SELECT COUNT(*) FROM UsersTasks WHERE IdTask = ?;";

                connection.query(sql, [idTask], (err, count) => {
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null, count[0]);
                });
            }
        });
    }

    deleteTag(idTag, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "DELETE FROM Tags WHERE Id = ?;";

                connection.query(sql, [idTag], (err) => {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null);
                });
            }
        });
    }

    deleteTaskTag(idTask, idTag, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "DELETE FROM TasksTags WHERE IdTask = ? AND IdTag = ?;"

                connection.query(sql, [idTask, idTag], (err) => {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null);
                });
            }
        });
    }

    deleteTask(idTask, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión en la base de datos: " + err.message));
            else {
                const sql = "DELETE FROM Tasks WHERE Id = ?;";

                connection.query(sql, [idTask], (err) => {
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null);
                });
            }
        });
    }

    deleteCompleted(email, callback) {
        this.pool.getConnection((err, connection) => {
            
            if (err) callback(new Error("Error de conexión en la base de datos"));
            else {
                let daoUsers = new DAOUsers(this.pool);

                daoUsers.getUserByEmail(email, (err, user) => {
                    if (err) callback(err);
                    else {
                        let idUser = user.Id;

                        daoUsers.getTasksDone(idUser, (err, tasks) => {
                            if (err) callback(err);
                            else {

                                tasks.forEach(task => {
                                    let idTask = task.IdTask;

                                    this.countTasks(idTask, (err, countTask) => {
                                        
                                        if (err) callback(err);
                                        else {
                                            let count = countTask['COUNT(*)'];

                                            if (count === 1) {

                                                this.getTagsByTask(idTask, (err, tags) => {
                                                    if (err) callback(err);
                                                    else {

                                                        tags.forEach(tag => {
                                                            let idTag = tag.IdTag;

                                                            this.countTags(idTag, (err, countTag) => {
                                                                if (err) callback(err);
                                                                else {
                                                                    count = countTag['COUNT(*)'];

                                                                    if (count === 1) {
                                                                        this.deleteTag(idTag, (err) => {
                                                                            if (err) callback(err);
                                                                        });
                                                                    }
                                                                }
                                                            });
                                                        });

                                                        this.deleteTask(idTask, (err) => {
                                                            if (err) callback(err);
                                                        });
                                                    }
                                                });
                                            }
                                            daoUsers.deleteTask(idUser, idTask, (err) => {
                                                if (err) callback(err);
                                            });
                                        }
                                    });
                                });
                            }
                        });
                        callback(null);
                    }
                });
            }
        });
    }
}

module.exports = DAOTasks;