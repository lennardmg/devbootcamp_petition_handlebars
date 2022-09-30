-- DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    firstname VARCHAR(255) NOT NULL CHECK(firstname != ''),
    lastname VARCHAR(255) NOT NULL CHECK(lastname != ''),
    canvassignature VARCHAR NOT NULL
);