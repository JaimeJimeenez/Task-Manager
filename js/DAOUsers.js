"use strict"

class DAOUsers {

    #pool;

    constructor(pool) { this.pool = pool; }

    isUserCorrect(email, password, callback) {
        this.pool.getConnection(function(err, connection) {

            if (err) callback(new Error("Error de conexión a la base de datos"));
            else {
                connection.query("SELECT * FROM Users WHERE Email = ? AND Password = ?", (email, password)),
                function(err, rows) {
                    connection.release(); // Get back the connection to the pool

                    if (err) callback(new Error("Error de acceso a la base de datos"));
                    else if (rows.length === 0) callback(null, false);
                        else callback(null, true);
                }
            }
        });
    }

    getUserImage(email, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) callback(new Error("Error de conexión a la base de datos"));
            else {
                connection.query("SELECT * FROM Users WHERE Email = ?", (email)),
                function(err, rows) {
                    connection.release(); // Get back the connection to the pool

                    if (err) callback(new Error("Error de acceso a la base de datos"));
                    else {

                    }
                }
            }
        });
    }
}

module.exports = DAOUsers;