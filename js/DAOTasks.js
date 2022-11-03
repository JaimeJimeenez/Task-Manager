"use strict"

class DAOTasks {
    
    #pool;

    constructor(pool) { this.pool = pool; }

    getAllTasks(email, callback) {
        this.pool.getConnection(function(err, connection) {

            if (err) callback(new Error("Error de conexión a la base de datos"));
            else {
                connection.query("SELECT Id FROM Users WHERE Email = ?" (email)),
                function(err, rows) {
                    connection.release(); // Get back the connection to the pool

                    if (err) callback(new Error("Error de acceso a la base de datos"));
                    else if (rows.length === 0) callback(null, false);
                        else callback(null, true);
                }
            }
        });
    }

    insertTask(email, task, callback) {
        this.pool.getConnection(function(err, connection) {

            if (err) callback(new Error("Error de conexión a la base de datos"));
            else {
                connection.query("INSERT INTO UsersTasks VALUES task.Done WHERE User.email = ? AND User.Id = UsersTasks.IdUser" (email),
                function(err, rows) {
                    connection.release();
                })
            }
        })
    }

    markTaskDone(idTask, callback) {
        this.pool.getConnection(function(err, connection) {

            if (err) callback(new Error("Error de conexión en la base de datos"));
            else {
                connection.query("UPDATE TABLE Tasks VALUES Done = true WHERE Id = ?", (idTask)),
                function(err, rows) {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos"));
                }
            }

        });
    }

    deleteCompleted(email, callback) {
        this.pool.getConnection(function(err, connection) {
            
            if (err) callback(new Error("Error de conexión en la base de datos"));
            else {
                connection.query("DELETE FROM UsersTasks WHERE Users.Id = UsersTasks.IdUser AND User.email = ? AND UsersTasks.Done = true", (email)),
                function(err, rows) {
                    connection.release();
                    if (err) callback(new Error("Error de acceso a la base de datos"));
                }
            }
        })
    }
}

module.exports = DAOTasks;

//Si peta cambiar las mayusculas