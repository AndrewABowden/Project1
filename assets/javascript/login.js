$("#log-in").on("click", function () {
    const promise = auth.signInWithEmailAndPassword($("#user-Email").val(), $("#user-Password").val());
    promise
        .then(user => {
            window.location.href = "index2.html";
        })
        .catch(e => loginError(e.code));
});

firebase.auth().onAuthStateChanged(function (user) {
    window.user = user; // user is undefined if no user signed in
});

function loginError(error) {
    if (error == "auth/user-not-found") {
        alert("You do not have an account, please register.");
    }
    else if (error = "auth/wrong-password") {
        alert("Incorrect password.");
    }
    else if (error = "auth/invalid-email") {
        alert("Please use a valid email address");
    }
}