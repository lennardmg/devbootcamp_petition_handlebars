// const db = require("./db");
const { getAllSignatures } = require("./db");
const { createSignature } = require("./db");
const { countSignatures } = require("./db");
const { showLastSigner } = require("./db");

const chalk = require("chalk");
const path = require("path");

const express = require("express");
const app = express();

const PORT = 8080;

// const cookieParser = require("cookie-parser");
// will encript the information within the cookies:
const cookieSession = require("cookie-session");

const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

/////////////////////////////////// setting the static folder /////////////////////////
app.use(express.static(path.join(__dirname, "public")));

////////////////////////////////// MIDDLEWARES /////////////////////////////////////
app.use(
    express.urlencoded({
        extended: false,
    })
);

// app.use(cookieParser());
// to activate the cookie session: the string in "secret" could be anything, its kind of like a password
// at maxAge its Miliseconds
// sameSite is for security measurements
app.use(
    cookieSession({
        secret: process.env.SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

/////////////////////////////////////////////////////////////////////////////////////

app.get("/main", (req, res) => {
    // to see the content of the signatures table in the petition database:
    // getAllSignatures().then((result) => console.log(result));

    if (!req.session.signatureId) {
        res.render("mainPage", {
            title: "Main Page",
        });
    } else {
        res.redirect("/thankyou");
    }

    // if user has NOT signed:
    //    render the petition page with the form
    // else
    //    REDIRECT to thank-you page
});

app.post("/main", (req, res) => {
    // console.log("this is the request body: ", req.body);

    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const signature = req.body.signature;

    createSignature(firstname, lastname, signature)
        .then((data) => {
            // console.log(data);
            req.session.signatureId = data[0].id;
            res.redirect("/thankyou");
        })
        .catch((err) => {
            console.log("error in POST request from /main", err);
            // renderWithError(res, "error in post request from /main");
        });

    // res.cookie("alreadySigned", true);

    // check input: first, last names, signature
    // if they are VALID:
    //     STORE in database
    //     SET a cookie
    //     REDIRECT to thank-you page
    // else:
    //     show the form again with an error message
});

app.get("/thankyou", (req, res) => {
    

    Promise.all([countSignatures(), showLastSigner(req.session.signatureId)])

        .then((result) => {
            // console.log("results in count signatures: ", result);

            if (req.session.signatureId) {
                res.render("thankyou", {
                    title: "Thanks for your vote!",
                    signatures: result[0][0].count,
                    lastPersonWhoSigned: result[1][0].canvassignature,
                });
            } else {
                res.redirect("/main");
            }
        })
        .catch((err) => {
            console.log("error in GET request from /thankyou", err);
        });

    // if user has signed:
    //     Get data from db
    //     Show info: thank you for signing + how many people have signed
    // else:
    //     REDIRECT to home/petition page
});

app.get("/signatures", (req, res) => {

    getAllSignatures().then((result) => {

        // console.log("results in getAllSignatures: ", result);

        if (req.session.signatureId) {
            res.render("signatures", {
                title: "Supporters",
                signatures: result,
            });
        } else {
            res.redirect("/main");
        }
    })
        .catch((err) => {
            console.log("error in GET request from /signatures", err);
    });


    // if user has signed:
    //     Get data from db
    //     Show info: all previous signatures
    // else:
    //     REDIRECT to home/petition page
});

///////////////////// MAKE THE SERVER LISTEN ////////////////////////
app.listen(PORT, () =>
    console.log(`Petition project running, listening on port: ${PORT}`)
);
