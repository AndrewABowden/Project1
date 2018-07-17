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

    var query = "javascript";
    //zipcode seems to work fine
    var zipcode = "85281";
    //needs mi or km as suffix for eventbrite only
    var distance = 10;
    var token = "OPXO3YNHODUWUYTO6G2N";
    function getEventBrite() {
        // our search term

        var eventBriteURL = "https://www.eventbriteapi.com/v3/events/search/?q=" + query + "&location.address=" + zipcode + "&location.within=" + distance + "mi&token=" + token
        console.log(eventBriteURL)
        $.ajax({
            url: eventBriteURL,
            method: "GET"
        }).then(function (res) {
            // console.log(res);
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

    //MEETUP 
    var pre = "https://cors-anywhere.herokuapp.com/";
    var meetupKey = "221a475e5932e6c6c497a294d424e30";
    var meetupURL = pre + "api.meetup.com/find/groups?key=" + meetupKey + "&photo-host=public&zip=" + zipcode + "&upcoming_events=true&text=" + query + "&radius=" + distance;
    console.log(meetupURL);
    function getMeetUp() {
        $.ajax({
            url: meetupURL,
            method: "GET"
        }).then(function (res) {
            res.forEach(element => {
                formatMeetUp(element);
            });
        });
    }

    getMeetUp();

    //newEvent
    function formatMeetUp(event) {
        var date = moment(event.next_event.time).format("MMMM DD YYYY hh:mm a");
        newEvent = new Event(event.name, date, event.link, event.next_event.name);
    }

}); 
