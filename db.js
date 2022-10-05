// loads all variables that are found in the .env file,
// and adds them to process.env! Now you can use them in your script below.
require("dotenv").config();

const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;

// create a db object. it can talk to the database: use db.query(...)
const db = spicedPg(DATABASE_URL);



module.exports.getAllSignatures = function () {
    const sql = "SELECT firstname, lastname FROM signatures;";
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



module.exports.createSignature = function (firstname, lastname, canvassignature) {
    const sql = `
        INSERT INTO signatures (firstname, lastname, canvassignature)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    // Here we are using SAFE interpolation to protect against SQL injection attacks
    return db
        .query(sql, [firstname, lastname, canvassignature])
        .then((result) => result.rows)
        .catch((error) => console.log("error in createSignature function", error));
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
     const sql =
         `SELECT canvassignature FROM signatures WHERE id= $1;`;
     return db
         .query(sql, [signatureId])
         .then((result) => {
             return result.rows;
         })
         .catch((error) => {
             console.log("error in showLastSigner function", error);
         });
 };


// Example of an SQL injection attack!
// createCity("Berlin'; DROP TABLE users;")
