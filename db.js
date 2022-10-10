// loads all variables that are found in the .env file,
// and adds them to process.env! Now you can use them in your script below.
require("dotenv").config();

const bcrypt = require("bcryptjs");

const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;

// create a db object. it can talk to the database: use db.query(...)
const db = spicedPg(DATABASE_URL);

//////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports.getAllSignatures = function () {
    const sql = `SELECT users.first_name, users.last_name, profiles.age, profiles.city, 
        profiles.homepage FROM users JOIN signatures ON users.id = signatures.user_id 
        JOIN profiles ON profiles.user_id = signatures.user_id;`;
    // NB! remember to RETURN the promise!
    return db
        .query(sql)
        .then((result) => {
            return result.rows;
        })
        .catch((error) => {
            console.log("error in getAllSignatures function", error);
        });
};


module.exports.getAllSignaturesByCity = (city) => {
    const sql = `SELECT users.first_name, users.last_name, profiles.age, profiles.city, 
        profiles.homepage FROM users JOIN signatures ON users.id = signatures.user_id 
        JOIN profiles ON profiles.user_id = signatures.user_id WHERE profiles.city = $1;`;
    return db
        .query(sql, [city])
        .then((result) => {
            return result.rows;
        })
        .catch((error) => {
            console.log("error in getAllSignaturesByCity function", error);
        });
};



module.exports.createSignature = function (user_id, canvassignature) {
    const sql = `
        INSERT INTO signatures (user_id, canvassignature)
        VALUES ($1, $2)
        RETURNING *;
    `;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db
        .query(sql, [user_id, canvassignature])
        .then((result) => result.rows)
        .catch((error) =>
            console.log("error in createSignature function", error)
        );
};


module.exports.countSignatures = function () {
    const sql = "SELECT COUNT(*) FROM signatures;";
    return db
        .query(sql)
        .then((result) => {
            return result.rows;
        })
        .catch((error) => {
            console.log("error in countSignatures function", error);
        });
};


module.exports.showLastSigner = function (user_id) {
    //  console.log(signatureId);
    const sql = `SELECT canvassignature FROM signatures WHERE user_id = $1;`;
    return db
        .query(sql, [user_id])
        .then((result) => {
            // console.log("results in showlastsigner function: ", result);
            return result.rows;
        })
        .catch((error) => {
            console.log("error in showLastSigner function", error);
        });
};


module.exports.insertUser = function (first_name, last_name, email, password) {
    const sql = `
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db
        .query(sql, [first_name, last_name, email, password])
        .then((result) => result.rows)
        .catch((error) => console.log("error in insertUser function", error));
};


module.exports.findUserByEmail = function (email) {
    const sql = `
        SELECT id, email, password, first_name, last_name FROM users WHERE email= $1;
    `;
    return db
        .query(sql, [email])
        .then((result) => {
            return result.rows;
        })
        .catch((error) => {
            console.log("error in findUserByEmail function", error);
        });
};


module.exports.authenticate = function (password, hashedPassword) {
    const PwInUsersTable = hashedPassword;
    const inputPassword = password;
    return bcrypt.compare(inputPassword, PwInUsersTable);
};


module.exports.insertProfile = function (user_id, age, city, homepage) {
    const sql = `
        INSERT INTO profiles (user_id, age, city, homepage)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $2, city = $3, homepage = $4
        RETURNING *;
    `;
    return db
        .query(sql, [user_id, age, city, homepage])
};


module.exports.getUserInfo = (user_id) => {
    const sql = `SELECT users.first_name, users.last_name, users.email, profiles.age, profiles.city, 
        profiles.homepage FROM users JOIN profiles ON users.id = profiles.user_id 
        WHERE users.id = $1;`;
    return db
        .query(sql, [user_id])
};


module.exports.updateUserWithoutPassword = function (id, first_name, last_name, email) {
    const sql = `
        UPDATE users SET first_name = $2, last_name = $3, email = $4
        WHERE id = $1;
    `;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db
        .query(sql, [id, first_name, last_name, email])
};



module.exports.updateUserWithPassword = function (
    id,
    first_name,
    last_name,
    email,
    password
) {
    const sql = `
        UPDATE users SET first_name = $2, last_name = $3, email = $4, password = $5
        WHERE id = $1;
    `;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db.query(sql, [id, first_name, last_name, email, password]);
};



module.exports.deleteSignature = (user_id) => {
    const sql = `DELETE FROM signatures WHERE user_id = $1;`;
    return db.query(sql, [user_id]);

};



module.exports.checkForSignature = (user_id) => {
    const sql = ` SELECT
      CASE WHEN EXISTS 
      (
            SELECT canvassignature FROM signatures WHERE user_id = $1
      )
      THEN 'true'
      ELSE 'false'
   END;`;
    return db.query(sql, [user_id]);
};


module.exports.checkIfEmailExists = (email) => {
    const sql = ` SELECT
      CASE WHEN EXISTS 
      (
            SELECT email FROM users WHERE email = $1
      )
      THEN 'true'
      ELSE 'false'
   END;`;
    return db.query(sql, [email]);
};

// Example of an SQL injection attack!
// createCity("Berlin'; DROP TABLE users;")
