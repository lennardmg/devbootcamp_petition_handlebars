//////////////////////////////// To create the error messages on /profileEdit /////////////////////////////////////////

const registrationForm = document.getElementById("updateProfile_form");

document.getElementById("updateProfile_form").onsubmit = function () {
    let submit = true;

    const firstname = document.forms["updateProfile_form"]["firstname"].value;
    const lastname = document.forms["updateProfile_form"]["lastname"].value;
    const email = document.forms["updateProfile_form"]["email"].value;

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
        let emailError = "*Please enter an E-Mail!";
        document.getElementById("email_error").innerHTML = emailError;
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
