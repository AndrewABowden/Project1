$("#log-in").on("click", function () {
    const promise = auth.signInWithEmailAndPassword($("#user-Email").val(), $("#user-Password").val())
        .then(user => {
            window.location.href = "index2.html";
        })
        .catch(e => loginError(e.code));
});

firebase.auth().onAuthStateChanged(function (user) {
    window.user = user; // user is undefined if no user signed in
});

function loginError(error) {
    if (error === "auth/user-not-found") {
        $('#modal-userNotFound').modal({
            show: true
        })
    }
    else if (error === "auth/invalid-email") {
        $('#modal-invalidEmail').modal({
            show: true
        })
    }
    else if (error === "auth/wrong-password") {
        $('#modal-wrongPWD').modal({
            show: true
        })
    }
}