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
    const sql = "SELECT id FROM signatures;";
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


module.exports.createSignature = function (canvassignature) {
    const sql = `
        INSERT INTO signatures (canvassignature)
        VALUES ($1)
        RETURNING *;
    `;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db
        .query(sql, [canvassignature])
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


module.exports.showLastSigner = function (signatureId) {
    //  console.log(signatureId);
    const sql = `SELECT canvassignature FROM signatures WHERE id= $1;`;
    return db
        .query(sql, [signatureId])
        .then((result) => {
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
        RETURNING *;
    `;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db
        .query(sql, [user_id, age, city, homepage])
        .then((result) => result.rows)
        .catch((error) => console.log("error in insertProfile function", error));
};

// Example of an SQL injection attack!
// createCity("Berlin'; DROP TABLE users;")
