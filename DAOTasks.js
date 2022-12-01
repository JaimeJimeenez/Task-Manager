"use strict"

let DAOUsers = require("./DAOUsers");

class DAOTasks {

    constructor(pool) { this.pool = pool; }

    getAllTasks(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback("Error de conexión a la base de datos: " + err.message);
            else {
                let daoUsers = new DAOUsers(this.pool);
                
                daoUsers.getUserByEmail(email, (err, user) => {
                    if (err) callback(err);
                    else {
                        let idUser = user.Id;
                        const sql = "SELECT Tasks.Id, Done, Tasks.Text, Tags.Text AS Tags FROM UsersTasks JOIN Tasks ON Tasks.Id = UsersTasks.IdTask JOIN TasksTags ON TasksTags.IdTask = UsersTasks.IdTask JOIN Tags ON Tags.Id = TasksTags.IdTag WHERE IdUser = ?;";
                        
                        connection.query(sql, [idUser], (err, rows) => {
                            connection.release();
                            if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                            else {
                                let actId = 0;
                                let tasks = [];
                                let task = { };
                                let tags = [];

                                rows.forEach(row => {
                                    if (row.Id !== actId) {
                                        task = {};
                                        task.Id = row.Id;
                                        task.Done = row.Done;
                                        task.Text = row.Text;
                                        tags = [];
                                        task.Tags = tags;
                                        tasks.push(task);
                                        tags.push(row.Tags);
                                        actId = row.Id;
                                    } else tags.push(row.Tags);
                                });
                                callback(null, tasks);
                            } 
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
                const sql = "SELECT Tasks.Id, Tasks.Text, Tags.Text FROM Tasks JOIN TasksTags ON Tasks.Id = TasksTags.IdTask JOIN Tags ON Tags.Id = TasksTags.IdTag WHERE Tasks.Text = ?;";

                connection.query(sql, [text], (err, task) => {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos"));
                    else callback(null, task);
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

    newTask(text, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "INSERT INTO Tasks (Text) VALUES (?)";

                connection.query(sql, [text], (err, result) => {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null, result);
                });
            }
        });
    }

    // -- Tablas externas --

    insertUserTask(idUser, idTask, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "INSERT INTO UsersTasks (IdUser, IdTask, Done) VALUES (?, ?, false);";

                connection.query(sql, [idUser, idTask], (err) => {
                    connection.release();
                    if (err) console.log(new Error("Error de acceso a la base de datos: " + err.message));
                    else callback(null);
                });
            }
        });
    }

    insertTaskTag(idTask, idTag, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "INSERT INTO TasksTags (IdTask, IdTag) VALUES (?, ?);";

                connection.query(sql, [idTask, idTag], (err) => {
                    connection.release();
                    if (err) console.log(new Error("Error de acceso a la base de datos: " + err.message));
                });
            }
        });
    }

    // -------

    insertTask(email, task, callback) {
        this.pool.getConnection((err, connection) => {

            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                let daoUsers = new DAOUsers(this.pool);

                daoUsers.getUserByEmail(email, (err, user) => {
                    if (err) callback(err);
                    else {
                        let idUser = user.Id;
                        
                        this.newTask(task.text, (err, newTask) => {
                            if (err) console.log(err);
                            else {
                                let idTask = newTask.insertId;

                                this.insertUserTask(idUser, idTask, (err) => {
                                    if (err) console.log(err);
                                });

                                task.tags.forEach((tag) => {
                                    
                                    // Check if the tag already exists
                                    this.getTag(tag, (err, result) => {
                                        if (err) console.log(err);
                                        else if (result === undefined) 
                                            this.insertTag(tag, (err, newTag) => {
                                                if (err) console.log(err);
                                                else 
                                                    this.insertTaskTag(idTask, newTag.insertId, (err) => {
                                                        if (err) console.log(err);
                                                    });
                                            });
                                        else this.insertTaskTag(idTask, result.Id, (err) => {
                                            if (err) console.log(err);
                                        })
                                    });
                                });
                            }
                        });
                    }
                });
                callback(null);
            }
        });
    }


    // Mark Task Done
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

    // Deleted Completed
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
                    connection.release();
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
                    connection.release();
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
                    }
                });
                callback(null);
            }
        });
    }
}

module.exports = DAOTasks;