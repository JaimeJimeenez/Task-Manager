"use strict"

function isUserCorrect(email, password, callback) {
    this.pool.getConnection(function(err, connection) {
        if (err) callback(new Error("Error de conexión a la base de datos"));
        else {
            connection.query("SELECT * FROM User WHERE Email = ? AND Password = ?", [Email, password], 
            function(err, rows) {
                connection.release(); // Get back the conection to the pool
                if (err) callback(new Error("Error de acceso a la base de datos"));
                else if (rows.length === 0)
                    callback(null, false) // There is no user with that password 
                    else callback(null, true);
            });
        }
    })
}

function getUserImage(email, callback) {
    
}