const db = require("./db");
const { getAllSignatures } = require("./db");
const { createSignature } = require("./db");
const { countSignatures } = require("./db");

const chalk = require("chalk");
const path = require("path");

const express = require("express");
const app = express();

const PORT = 8080;

const cookieParser = require("cookie-parser");

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

     app.use(cookieParser());

/////////////////////////////////////////////////////////////////////////////////////


app.get("/main", (req, res) => {

    // to see the content of the signatures table in the petition database:
    // getAllSignatures().then((result) => console.log(result));

    if (!req.cookies.alreadySigned) {
        res.render("mainPage", {
        title: "Main Page",
    })
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

    const a = req.body.firstname;
    const b = req.body.lastname;
    const c = req.body.signature;

    createSignature(a, b, c);

    res.cookie("alreadySigned", true);    

    res.redirect("/thankyou");
    // check input: first, last names, signature
    // if they are VALID:
    //     STORE in database
    //     SET a cookie
    //     REDIRECT to thank-you page
    // else:
    //     show the form again with an error message
});

app.get("/thankyou", (req, res) => {

    countSignatures().then((result) => console.log(result));

    if (req.cookies.alreadySigned) {

        res.render("thankyou", {
            title: "Thanks for your vote!",
            signatures: 5,
        });

    } else {

        res.redirect("/main");

    }
    // if user has signed:
    //     Get data from db
    //     Show info: thank you for signing + how many people have signed
    // else:
    //     REDIRECT to home/petition page
});

app.get("/signatures", (req, res) => {

    if (req.cookies.alreadySigned) {
        res.render("signatures", {
            title: "Supporters",
        });
    } else {
        res.redirect("/main");
    }
    // if user has signed:
    //     Get data from db
    //     Show info: all previous signatures
    // else:
    //     REDIRECT to home/petition page
});





///////////////////// MAKE THE SERVER LISTEN ////////////////////////
app.listen(PORT, () =>
    console.log(`Express project running, listening on port:${PORT}`)
);
