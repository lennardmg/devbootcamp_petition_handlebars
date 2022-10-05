//////////////////////////////// To create the error messages on /registration /////////////////////////////////////////

const registrationForm = document.getElementById("registration_form");

document.getElementById("registration_form").onsubmit = function () {
    let submit = true;

    const firstname = document.forms["registration_form"]["firstname"].value;
    const lastname = document.forms["registration_form"]["lastname"].value;
    const email = document.forms["registration_form"]["email"].value;
    const password = document.forms["registration_form"]["password"].value;

    if (firstname == null || firstname == "") {
        let firstnameError = "*Please enter your firstname!";
        document.getElementById("firstname_error").innerHTML = firstnameError;
        submit = false;
    }

    if (lastname == null || lastname == "") {
        let lastnameError = "*Please enter your lastname!";
        document.getElementById("lastname_error").innerHTML = lastnameError;
        submit = false;
    }

    if (email == null || email == "") {
        let emailError = "*Please enter your E-Mail!";
        document.getElementById("email_error").innerHTML = emailError;
        submit = false;
    }

    if (password == null || password == "") {
        let passwordError = "*Please enter a password!";
        document.getElementById("password_error").innerHTML = passwordError;
        submit = false;
    }

    return submit;
};

function removeWarning() {
    document.getElementById(this.id + "_error").innerHTML = "";
}

document.getElementById("firstname").onkeyup = removeWarning;
document.getElementById("lastname").onkeyup = removeWarning;
document.getElementById("email").onkeyup = removeWarning;
document.getElementById("password").onkeyup = removeWarning;

//////////////////////////////// To create the error messages on /LogIn /////////////////////////////////////////
