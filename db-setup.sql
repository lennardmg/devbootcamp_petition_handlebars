DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL primary key,
    firstname VARCHAR(255) NOT NULL CHECK(firstname != ''),
    lastname VARCHAR(255) NOT NULL CHECK(lastname != ''),
    canvassignature TEXT NOT NULL
);