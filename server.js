// const db = require("./db");
const { getAllSignatures } = require("./db");
const { createSignature } = require("./db");
const { countSignatures } = require("./db");
const { showLastSigner } = require("./db");
const { insertUser } = require("./db");
const { findUserByEmail } = require("./db");
const { authenticate } = require("./db");
const { insertProfile } = require("./db");
const { getAllSignaturesByCity } = require("./db");
const { getUserInfo } = require("./db");
const { deleteSignature } = require("./db");
const { updateUserWithoutPassword } = require("./db");
const { updateUserWithPassword } = require("./db");
const { checkForSignature } = require("./db");
const { checkIfEmailExists } = require("./db");

// imported function to check if a user is logged-in
const { requireLoggedInUser } = require("./db");

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

/// to be able to insert a global error: ///
let globalError = "";


/////////////////////////////////// setting the static folder /////////////////////////
app.use(express.static(path.join(__dirname, "public")));

////////////////////////////////// MIDDLEWARES /////////////////////////////////////
app.use(express.urlencoded({extended: false}));

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

app.get("/petition", (req, res) => {
    // to see the content of the signatures table in the petition database:
    // getAllSignatures().then((result) => console.log(result));
    // console.log("req.query to string in get /petition: ", req.query.deleted);

    if (req.session.userId) {

        // in the case, that the signature just got deleted:
        if (req.query.deleted == "true" && req.session.signed == false) {
            res.render("petition", {
                title: "Sign Here",
                message: "*Your signature got successfully deleted.",
            });
        } else if (req.session.signed == false) {
            res.render("petition", {
                title: "Sign Here",
            });
        } else if (req.session.signed == true) {
            res.redirect("/thankyou")
        }

    } else {
        res.redirect("/registration");
    }
});



app.post("/petition", (req, res) => {
    // console.log("this is the request body: ", req.body);
    // console.log("the saved signature: ", req.body.savedSignature);

    const signature = req.body.savedSignature;

    createSignature(req.session.userId, signature)
        .then((data) => {
            // console.log(data);
            // console.log("userId cookie: ", req.session.userId[0].id);
            req.session.signed = true;
            res.redirect("/thankyou");
        })
        .catch((err) => {
            console.log("error in POST request from /main", err);
        });


});



app.get("/thankyou", (req, res) => {
    

    Promise.all([countSignatures(), showLastSigner(req.session.userId)])

        .then((result) => {
            // console.log("results in count signatures: ", result);

            if (req.session.userId && req.session.signed == true) {
                res.render("thankyou", {
                    title: "Thanks for your vote!",
                    signatures: result[0][0].count,
                    name: req.session.userName,
                    lastPersonWhoSigned: result[1][0].canvassignature,
                });
            } else {
                res.redirect("/petition");
            }
        })
        .catch((err) => {
            console.log("error in GET request from /thankyou", err);
        });
});



app.get("/signatures", (req, res) => {

    getAllSignatures().then((result) => {

        // console.log("results in getAllSignatures: ", result);

        if (req.session.userId && req.session.signed == true) {
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

    // console.log("password from user: ", password);
    
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
                // console.log("hashedPassword: ", hashedPassword);
            })
            .then(() => {

                // now all of the user data + the hashed password is going to get inserted in the users table
                insertUser(firstname, lastname, email, hashedPassword)
                    .then((data) => {
                        // console.log("data in Post registration: ", data);
                        req.session.userId = data[0].id;
                        req.session.userName = data[0].first_name;
                        req.session.signed = false;
                        
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
        
        // console.log("users in findUserByEmail: ", user);
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
            // console.log("results after athenticating: ", result);
            // console.log("user after athenticating: ", userInfo);

            req.session.userId = userInfo[0].id;
            req.session.userName = userInfo[0].first_name;

            // to check if user has previously signed:
            checkForSignature(req.session.userId).then((result) => {
                // console.log("result in checkForSignature: ", result.rows[0].case);

                if (result.rows[0].case == "true") {
                    req.session.signed = true;
                    // console.log(req.session);
                    res.redirect("/petition");
                } else {

                    req.session.signed = false;
                    // console.log(req.session);
                    res.redirect("/petition");
                }
            });
        })
        .catch((err) => {
            console.log("error after athentication process: ", err);
            res.render("logIn", {
                title: "Log-In",
                error: "*Something went wrong. Please try again!",
            });
        })
     });
});


app.get("/logOut", (req, res) => {
    
    req.session = null;
    res.redirect("/logIn")

});

////////////////////// Part 4, profile information ////////////////////////////

app.get("/profile", (req, res) => {

    // console.log("my cookie: ", req.session.userId);

  res.render("profile", {
      title: "Your Profile",
      name: req.session.userName
  });

});


app.post("/profile", (req, res) => {
    
    const age = req.body.age || null;
    const city = req.body.city;
    const homepage = req.body.homepage;

    insertProfile(req.session.userId, age, city, homepage)
        .then((profileData) => {
            // console.log("userId at inserting profile ", req.session.userId[0].id);
            // console.log("age, city and homepage at inserting profile: ", age, city, homepage);
            // console.log("profileData after insertProfile: ", profileData);
            res.redirect("/petition")
        })
        .catch((err) => {
            console.log("error in POST request from /profile", err);
        });
});



app.get("/signatures/:city", (req, res) => {
    
    let city = req.params.city;
    // console.log(req.params);

    getAllSignaturesByCity(city)
        .then((result) => {

            if (req.session.userId && req.session.signed == true) {
                res.render("signaturesByCity", {
                    title: `Supporters from ${city}`,
                    city: city,
                    signatures: result,
                });
            } else {
                res.redirect("/registration");
            }
        })
        .catch((err) => {
            console.log("error in GET request from /signaturesByCity", err);
        });
});

////////////////////// Part 5, edit profile information ////////////////////////////

app.get("/profileEdit", (req, res) => {

    if (req.session.userId) {
        // console.log(req.session);
        getUserInfo(req.session.userId)
        .then((userData) => {
    
        res.render("profileEdit", {
            title: "Your Profile",
            name: userData.rows[0].first_name,
            firstname: userData.rows[0].first_name,
            lastname: userData.rows[0].last_name,
            email: userData.rows[0].email,
            emailError: globalError,
            age: userData.rows[0].age,
            city: userData.rows[0].city,
            homepage: userData.rows[0].homepage,
        });
    
        })
        .catch((err) => {
            console.log("error in getUserInfo in get /profileEdit: ", err);
        })

    } else {
        res.redirect("/registration");
    }
});


app.post("/profileEdit", (req, res) => {
 
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const email = req.body.email;
        const age = req.body.age;
        const city = req.body.city;
        const homepage = req.body.homepage;

        const password = req.body.password;

            if (req.session.userId) {
                  
                /////////  when the user does NOT change his/her password:  ////////////
                if (password == "") {
                    
                    Promise.all([
                        insertProfile(
                            req.session.userId,
                            age,
                            city,
                            homepage
                        ),
                        updateUserWithoutPassword(req.session.userId, firstname, lastname, email)
                    ])
                    .then(() => {
                        globalError = "";
                        res.redirect("/petition");
                    })
                    .catch((err) => {
                        console.log("error in updateUserWithoutPassword at post /profileEdit: ", err);
                        globalError = err.detail;
                        res.redirect("/profileEdit");
                    });

                    //// when the user DOES change his/her password
                } else {

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
                                // console.log("hashedPassword: ", hashedPassword);
                            })
                            .then(() => {
                                
                                      Promise.all([
                                          insertProfile(
                                              req.session.userId,
                                              age,
                                              city,
                                              homepage
                                          ),
                                          updateUserWithPassword(
                                              req.session.userId,
                                              firstname,
                                              lastname,
                                              email,
                                              hashedPassword
                                          ),
                                      ])
                                          .then(() => {
                                            globalError = "";
                                              res.redirect("/petition");
                                          })
                                          .catch((err) => {
                                              console.log("error in updateUserWithPassword at post /profileEdit: ", err);
                                              globalError = err.detail;
                                              res.redirect("/profileEdit");
                                          });

                            })
                            .catch((err) => {
                                console.log("error in hashing function inside POST request from /profileEdit ", err);
                            });
                    }
                    hashing();
                }
                ////////////////////////////////////////////
            } else {
                      res.redirect("/registration");
            }
});



app.post("/petition/delete", (req, res) => {

  
        deleteSignature(req.session.userId)
            .then(() => {

                // I have to define a particular route with a query, otherwise I'd be redirected to /petition/delete
                req.session.signed = false;
                res.redirect(
                    "/petition?deleted=true");
            })
            .catch((err) => {
                console.log(
                    "error in deleteSignature in post /petition/delete: ",
                    err
                );
            });
  
});


app.get("/about", (req, res) => {
    res.render("about", {
        title: "About our cause ...",
    });
});


///////////////////// MAKE THE SERVER LISTEN ////////////////////////
app.listen(PORT, () =>
    console.log(`Petition project running, listening on port: ${PORT}`)
);
