
var user;


window.onload = function () {
    // Listening for auth state changes.
    auth.onAuthStateChanged(function (user) {
        if (user) {
            // User is already signed in, send them to the home page
            window.location.href = "index2.html";
        }
    });
}

// input string validations
var emailGood = false;
var lastNameGood = false;
var firstNameGood = false;
var passwordGood = false;
var zipGood = false;

// email (must be a valid email)
$('#user-Email').on('keypress keydown keyup', function () {
    var emailRegEx = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (!$(this).val().match(emailRegEx)) {
        // there is a mismatch, hence show the error message
        $("#email-Error").removeClass('hidden');
        $("#email-Error").show();
        emailGood = false;
    }
    else {
        // else, do not display message
        emailGood = true;
        $("#email-Error").addClass('hidden');
    }
});
// The name just has to exist.
$('#first-Name').on('keypress keydown keyup', function () {
    if ($(this).val().length < 1) {
        // there is a mismatch, hence show the error message
        $('#firstname-Error').removeClass('hidden');
        $('#firstname-Error').show();
        firstNameGood = false;
    }
    else {
        // else, do not display message
        firstNameGood = true;
        $('#firstname-error').addClass('hidden');
    }
});

// The name just has to exist.
$('#last-Name').on('keypress keydown keyup', function () {
    if ($(this).val().length < 1) {
        // there is a mismatch, hence show the error message
        $('#lastname-error').removeClass('hidden');
        $('#lastname-error').show();
        lastNameGood = false;
    }
    else {
        // else, do not display message
        lastNameGood = true;
        $('#lastname-error').addClass('hidden');
    }
});

// password (must be six characters or longer)
$('#user-Password').on('keypress keydown keyup', function () {
    if ($(this).val().length < 6) {
        // there is a mismatch, hence show the error message
        $('#passwd-Error').removeClass('hidden');
        $('#passwd-Error').show();
        passwordGood = false;
    }
    else {
        // else, do not display message
        passwordGood = true;
        $('#passwd-Error').addClass('hidden');
    }
});

// zipcode (must be 5 numbers)
$('#user-Zip').on('keypress keydown keyup', function () {
    var zipRegEx = /(^\d{5}$)/;
    if (!$(this).val().match(zipRegEx)) {
        // there is a mismatch, hence show the error message
        $('#zip-Error').removeClass('hidden');
        $('#zip-Error').show();
        zipGood = false;
    }
    else {
        zipGood = true;
        // else, do not display message
        $('#zip-Error').addClass('hidden');
    }
});



$("#register").on("click", function (event) {
    if (emailGood && firstNameGood && lastNameGood && passwordGood && zipGood) {

         auth.createUserWithEmailAndPassword($("#user-Email").val(), $("#user-Password").val())
             .then(user => {
                 // Make the database entries from user
                 database.ref("/users/" + user.user.uid).set({ email: user.user.email, firstName: $("#first-Name").val(), lastName: $("#last-Name").val(), userZip: $("#user-Zip").val() });
                 console.log($("#user-firstName").val());
                 console.log($("#user-lastName").val());
                 window.location.href = "index2.html";
             })
             .catch(e => {
                 if (e.code === "auth/email-already-in-use") {
                     alert("The specified email has a valid account.")
                 }

             });
    }
    else {
        alert("Review your inputs!");
    }

});
