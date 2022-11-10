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

    getUserImageName(email, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) callback(new Error("Error de conexión a la base de datos" + err.message));
            else {
                const sql = "SELECT Img FROM Users WHERE Email = ?";

                connection.query(sql, [email], function(err, row) {
                    connection.release();
                    if (err) callback(new Error("Error en la consulta"));
                    else {
                        if (row.length === 0) callback(new Error("No existe ese usuario"));
                        else callback(row);
                    }
                });
            }
        });
    }
}

module.exports = DAOUsers;