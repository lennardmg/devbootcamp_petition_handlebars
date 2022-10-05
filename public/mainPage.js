// console.log("script.js in public folder is running");


//////////////////////////////// To create the error messages on /mainPage /////////////////////////////////////////
const petitionForm = document.getElementById("petition_form");

document.getElementById("petition_form").onsubmit = function () {
    
    let submit = true;
    
    const savedSignature = document.forms["petition_form"]["savedSignature"].value;


    if (savedSignature == null || savedSignature == "") {
        let signatureError = "*Please enter your signature!";
        document.getElementById("signature_error").innerHTML = signatureError;
        submit = false;
    }

    return submit;
};

function removeWarning() {
    document.getElementById(this.id + "_error").innerHTML = "";
}

document.getElementById("signature").onmouseup = removeWarning;




//////////////////////////////// To draw the Canvas /////////////////////////////////////////

let drawingSignature = false;

let myCanvas = document.getElementById("signature");
let context = myCanvas.getContext("2d");

function saveSignature() {
    let canvasField = document.getElementById("signature");
    document.getElementById("savedSignature").value =
        canvasField.toDataURL("image/png");
}

function emptySignature () {
    document.getElementById("savedSignature").value = "";
}

function beginSignature(event) {
    emptySignature();
    drawingSignature = true;
    context.beginPath();
    context.moveTo(
        event.pageX - myCanvas.offsetLeft,
        event.pageY - myCanvas.offsetTop
    );
}


// I need to set the if statement, because otherwise it would set a value to my hidden canvasField if my mouse was inside the canvas
// and then the "onmouseout"-event gets triggered even without drawing anything.
function endSignature() {

    if (drawingSignature) {

        drawingSignature = false;
        saveSignature();
    } else {
        drawingSignature = false;
    }
}

function clearSignature() {
    myCanvas.width = myCanvas.width;
    emptySignature();
}

function doDrawSignature(event) {
    if (drawingSignature) {
        context.lineTo(
            event.pageX - myCanvas.offsetLeft,
            event.pageY - myCanvas.offsetTop
        );
        context.stroke();
    }
}



myCanvas.onmousedown = beginSignature;
myCanvas.onmouseup = endSignature;
myCanvas.onmouseout = endSignature;
myCanvas.onmousemove = doDrawSignature;