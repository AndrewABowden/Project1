$(document).ready(function () {
    var events = []; 

    class Event {
        constructor(name, date, link, info) {
            this.name = name;
            this.date = date;
            this.link = link;
            this.info = info;
            events.push(this);
            console.log(this)
        }
    }
    var query = "tech"
    //zipcode seems to work fine
    var zipcode = "85302"
    //needs mi or km as suffix
    var distance = 5
    function getEventBrite() {
        // our search term

        var eventBriteURL = "https://www.eventbriteapi.com/v3/events/search/?q=" + query + "&location.address=" + zipcode + "&location.within=" + distance + "mi&token=" + token
        console.log(eventBriteURL)
        $.ajax({
            url: eventBriteURL,
            method: "GET"
        }).then(function (res) {
            console.log(res);
            res.top_match_events.forEach(element => {
                formatEventBriteData(element)
            });
        })
    }
    getEventBrite()
    //new Event(da)
    function formatEventBriteData(event) {
        e = new Event(event.name, event.start.local, event.url,event.description.text)
    // this is where we will make all the stuff uniform so that we can compare values easily in sortEvents
    }
    function sortEvents() {
    // this is where we would sort the events by date.
    }
    // //Checking for acces token
    // // if (location.href.indexOf("#") == -1) {
    // //     //OAuth2 seetup for meetup
    // //     var meetupAuthorizationURL = "https://secure.meetup.com/oauth2/authorize?client_id=idg65cddfd4a7uhbd2c90841o7&response_type=token&redirect_uri=https://l-ward.github.io/Project1/"
    // //     $(location).attr("href", meetupAuthorizationURL);
    // // } else {
    // //     var meetupAccessToken = location.href.split("#")[1];
    // //     console.log(meetupAccessToken);
    // //     var meetupURL = "https://api.meetup.com/find/groups?" + meetupAccessToken + "&text=tech";

    // //     $.ajax({
    // //         url: meetupURL,
    // //         method: "GET"
    // //     }).then(function (res) {
    // //         console.log(res);
    // //     });
    // // }
}); 
