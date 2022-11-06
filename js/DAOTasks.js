"use strict"

class DAOTasks {
    
    #pool;

    constructor(pool) { this.pool = pool; }

    getAllTasks(email, callback) {
        this.pool.getConnection(function(err, connection) {

            if (err) callback(new Error("Error de conexión a la base de datos: " + err.message));
            else {
                const sql = "SELECT t.Id, t.Text, ut.Done FROM Users JOIN UsersTasks ut ON Id = ut.IdUser JOIN Tasks t ON ut.IdTask = t.Id WHERE email = ?";

                connection.query(sql, [email],
                function(err, rows) {
                    connection.release(); // Get back the connection to the pool

                    if (err) callback(new Error("Error de acceso a la base de datos"));
                    else if (rows.length === 0) callback(null, false);
                        else callback(null, true);
                });
            }
        });
    }

    insertTask(email, task, callback) {
        this.pool.getConnection(function(err, connection) {

            if (err) callback(new Error("Error de conexión a la base de datos"));
            else {
                let text = task.text;
                let done = task.done;
                let tags = task.tags;
                console.log(text + " " + done + " " + tags);
            }
        })
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
                })
            }
        })
    }
}

module.exports = DAOTasks;
