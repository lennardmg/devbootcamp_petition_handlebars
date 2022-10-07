// const db = require("./db");
const { getAllSignatures } = require("./db");
const { createSignature } = require("./db");
const { countSignatures } = require("./db");
const { showLastSigner } = require("./db");
const { insertUser } = require("./db");
const { findUserByEmail } = require("./db");
const { authenticate } = require("./db");
const { insertProfile } = require("./db");

const chalk = require("chalk");
const path = require("path");

const bcrypt = require("bcryptjs");

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

    if (req.session.userId) {
        res.render("mainPage", {
            title: "Main Page",
        });
    } else {
        res.redirect("/registration");
    }

    // if user has NOT signed:
    //    render the petition page with the form
    // else
    //    REDIRECT to thank-you page
});

app.post("/main", (req, res) => {
    // console.log("this is the request body: ", req.body);
    // console.log("the saved signature: ", req.body.savedSignature);

    const signature = req.body.savedSignature;

    createSignature(req.session.userId[0].id, signature)
        .then((data) => {
            // console.log(data);
            // console.log("userId cookie: ", req.session.userId[0].id);
            req.session.signed = true;
            res.redirect("/thankyou");
        })
        .catch((err) => {
            console.log("error in POST request from /main", err);
            // renderWithError(res, "error in post request from /main");
        });


});

app.get("/thankyou", (req, res) => {
    

    Promise.all([countSignatures(), showLastSigner(req.session.userId[0].id)])

        .then((result) => {
            console.log("results in count signatures: ", result);

            if (req.session.userId) {
                res.render("thankyou", {
                    title: "Thanks for your vote!",
                    signatures: result[0][0].count,
                    lastPersonWhoSigned: result[1][0].canvassignature,
                });
            } else {
                res.redirect("/registration");
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

        if (req.session.userId) {
            res.render("signatures", {
                title: "Supporters",
                signatures: result,
            });
        } else {
            res.redirect("/registration");
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


////////////////////// Part 3, registration ////////////////////////////

app.get("/registration", (req, res) => {

res.render("registration", {
    title: "Register",
});

});


app.post("/registration", (req, res) => {

    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    // first the password needs to be encrypted/hashed:
    const password = req.body.password;

    console.log("password from user: ", password);
    
    function hashing() {
        const initalPassword = password;
        let hashedPassword = "";
       
        bcrypt
            .genSalt()
            .then((salt) => {
                return bcrypt.hash(initalPassword, salt);
            })
            .then((hash) => {
                hashedPassword = hash;
                console.log("hashedPassword: ", hashedPassword);
            })
            .then(() => {

                // now all of the user data + the hashed password is going to get inserted in the users table
                insertUser(firstname, lastname, email, hashedPassword)
                    .then((data) => {
                          console.log("data: ", data);
                          req.session.userId = data;
                          res.redirect("/profile");
                    })
                    .catch((err) => {
                        console.log("error in POST request from /registration", err);
                        res.render("registration", {
                            title: "Register",
                            error: "*Something went wrong. Please try again!"
                        });
                    });

            })
            .catch((err) => {
            console.log("error in hashing function inside POST request from /registration ", err);
            });
    }

    hashing();


});



app.get("/logIn", (req, res) => {
    res.render("logIn", {
        title: "Log-In",
    });
});



app.post("/logIn", (req, res) => {

 const email = req.body.email;
 const password = req.body.password;

 findUserByEmail(email)
     .then((user) => {
        
        console.log("users in findUserByEmail: ", user);
         if (!user.length) {
             console.log("NO USER FOUND");
             res.render("logIn", {
                 title: "Log-In",
                 error: "*Something went wrong. Please try again!",
             });
             return false;
         } 

         const userInfo = user;
            
        authenticate(password, user[0].password).then((result) => {
            console.log("results after athenticating: ", result);
            console.log("user after athenticating: ", userInfo);
            req.session.userId = userInfo;
            res.redirect("/profile");
        })
        .catch((err) => {
            console.log("error after athentication process: ", err);
        })
     })
     .catch((err) => {
        //  console.log("error in POST request from /logIn", err);
         res.render("logIn", {
             title: "Log-In",
             error: "*Something went wrong. Please try again!",
         });
     });


});


app.get("/logOut", (req, res) => {
    
    req.session = null;
    res.redirect("/logIn")

});

////////////////////// Part 4, profile information ////////////////////////////

app.get("/profile", (req, res) => {

    console.log("my cookie: ", req.session.userId);

  res.render("profile", {
      title: "Your Profile",
      name: req.session.userId[0].first_name
  });

});


app.post("/profile", (req, res) => {
    
    const age = req.body.age;
    const city = req.body.city;
    const homepage = req.body.homepage;

    insertProfile(req.session.userId[0].id, age, city, homepage)
        .then((profileData) => {
            console.log("profileData after insertProfile: ", profileData);
            res.redirect("/main")
        })
        .catch((err) => {
            console.log("error in POST request from /profile", err);
        });
});


///////////////////// MAKE THE SERVER LISTEN ////////////////////////
app.listen(PORT, () =>
    console.log(`Petition project running, listening on port: ${PORT}`)
);
