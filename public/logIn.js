//////////////////////////////// To create the error messages on /LogIn /////////////////////////////////////////

const logInForm = document.getElementById("login_form");

document.getElementById("login_form").onsubmit = function () {

    let submit = true;

    const email = document.forms["login_form"]["email"].value;
    const password = document.forms["login_form"]["password"].value;

    if (email == null || email == "") {
        let emailError = "*Please enter your E-Mail!";
        document.getElementById("email_error").innerHTML = emailError;
        submit = false;
    }

    if (password == null || password == "") {
        let passwordError = "*Please enter your password!";
        document.getElementById("password_error").innerHTML = passwordError;
        submit = false;
    }

    return submit;
};

function removeWarning() {
    document.getElementById(this.id + "_error").innerHTML = "";
}

document.getElementById("email").onkeyup = removeWarning;
document.getElementById("password").onkeyup = removeWarning;
