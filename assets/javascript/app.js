$(document).ready(function () {
    //Checking for acces token
    if (location.href.indexOf("#") == -1) {
        //OAuth2 seetup for meetup
        var meetupAuthorizationURL = "https://secure.meetup.com/oauth2/authorize?client_id=idg65cddfd4a7uhbd2c90841o7&response_type=token&redirect_uri=https://l-ward.github.io/Project1/"
        $(location).attr("href", meetupAuthorizationURL);
    } else {
        var meetupAccessToken = location.href.split("#")[1];
        console.log(meetupAccessToken);
        var meetupURL = "https://api.meetup.com/2/events?" + meetupAccessToken + "&group_urlname=books";

        $.ajax({
            url: meetupURL,
            method: "GET"
        }).then(function (res) {
            console.log(res);
        });
    }
});