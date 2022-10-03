// console.log("script.js in public folder is running");

const petitionForm = document.getElementById("petition_form");

document.getElementById("petition_form").onsubmit = function () {
    
    let submit = true;
    
    const a = document.forms["petition_form"]["firstname"].value;
    const b = document.forms["petition_form"]["lastname"].value;
    const c = document.forms["petition_form"]["signature"].value;


    if (a == null || a == "") {
        let firstnameError = "*Please enter your firstname!";
        document.getElementById("firstname_error").innerHTML = firstnameError;
        submit = false;
    }

    if (b == null || b == "") {
        let lastnameError = "*Please enter your lastname!";
        document.getElementById("lastname_error").innerHTML = lastnameError;
        submit = false;
    }

    if (c == null || c == "") {
        let signatureError = "*Please enter your signature!";
        document.getElementById("signature_error").innerHTML = signatureError;
        submit = false;
    }

    return submit;
};

function removeWarning() {
    document.getElementById(this.id + "_error").innerHTML = "";
}

document.getElementById("firstname").onkeyup = removeWarning;
document.getElementById("lastname").onkeyup = removeWarning;
document.getElementById("signature").onkeyup = removeWarning;
