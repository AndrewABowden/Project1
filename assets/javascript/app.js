$(document).ready(function () {
    var eventBriteIds = [];
    var meetupIds = [];
    var events = [];
    // this var is for testing to see if we got both our ajax calls back.
    var readyCheck = 0;
    // the search term for events
    var query = "javascript";
    //zipcode for address we are at
    var zipcode = "85281";
    // distance in miles
    var distance = 10;
    var token = "OPXO3YNHODUWUYTO6G2N";
    var eventBriteNum = 0;
    var eventMeetupNum = 0;

    class Event {
        constructor(name, date, link, info, src, id, urlName) {
            this.name = name;
            // store as moment display using formatgit
            this.date = date;
            this.link = link;
            this.info = info;
            this.src = src;
            this.id = id;
            this.urlName = urlName;
            events.push(this);
            //console.log(this)
        }
    }

    //EventBrite Query
    function getEventBrite() {
        var eventBriteURL = "https://www.eventbriteapi.com/v3/events/search/?q=" + query + "&location.address=" + zipcode + "&location.within=" + distance + "mi&token=" + token
        // console.log(eventBriteURL)
        $.ajax({
            url: eventBriteURL,
            method: "GET"
        }).then(function (res) {
            console.log(res)
            res.events.forEach(element => {
                formatEventBriteData(element)
            });
            isReady()
        })

    }

    function getEventBriteFavorites(arrayOfIDs) {
        var eBArray = []
        arrayOfIDs.forEach(function (e) {
            eBArray.push(returnEventBriteFavorite(e))
        })
    }

    function returnEventBriteFavorite(str) {
        var URL = "https://www.eventbriteapi.com/v3/events/" + str + "/?token=" + token
        $.ajax({
            url: URL,
            method: "GET"
        }).then(function (res) {
            //console.logconsole.log("eventbrite fave", res)
            formatEventBriteData(res);
            checkEventBriteFinished();
        })
    }
    function checkEventBriteFinished() {
        eventBriteNum++
        if (eventBriteNum === eventBriteIds.length) {
            eventBriteNum = 0;
            isReady();
            //console.log('sorting');
        }
    }

    function formatEventBriteData(event) {
        date = moment(event.start.local, "YYYY-MM-DD HH:mm:ss")
        //console.log(event.id)
        e = new Event(event.name.text, date, event.url, event.description.text, "eventBrite", event.id, "");
        //console.log(e);
    }

    function populateEvents() {
        $("#results-display").empty();
        console.log("populate called");
        events.forEach(function (e) {
            // creating a div to rule them all
            var containingDiv = $("<div>").addClass("apielements");
            // creating the title of the gathering
            var title = $("<h2>").text(e.name)
            // showing the date
            var date = $("<p>").text(e.date.format("MMMM DD YYYY hh:mm a"))
            // showing the summary
            var sum = $("<p>").text(e.info)
            // giving a link to 
            var link = $("<a>").text(e.link).attr("href", e.link)
            // appending it all to the ruler
            containingDiv.append(title, date, sum, link)
            // showing it on the screen
            $("#results-display").append(containingDiv)
        })
    }

    //MEETUP Query
    function getMeetUp() {
        var pre = "https://cors-anywhere.herokuapp.com/";
        var meetupKey = "221a475e5932e6c6c497a294d424e30";
        var meetupURL = pre + "api.meetup.com/find/groups?key=" + meetupKey + "&photo-host=public&zip=" + zipcode + "&upcoming_events=true&text=" + query + "&radius=" + distance;
        //console.log(meetupURL);
        $.ajax({
            url: meetupURL,
            method: "GET"
        }).then(function (res) {
            console.log(res);
            res.forEach(element => {
                formatMeetUp(element);
            });
            isReady();
        });
    }

    //Meetup - newEvent
    function formatMeetUp(event) {
        var date = moment(event.next_event.time) /*format date when populated to html*/;
        newEvent = new Event(event.name, date, event.link, event.next_event.name, "meetup", event.next_event.id, event.urlname);
    }

    //Meetup favorites 
    function getMeetupFavorites(idArray) {
            var meetupArray = [];
            idArray.forEach(function (e) {
                meetupArray.push(returnMeetupFav(e))
            })
    }

    function returnMeetupFav(id, urlName) {
        var pre = "https://cors-anywhere.herokuapp.com/";
        var meetupKey = "221a475e5932e6c6c497a294d424e30";
        var meetupURL = pre + "api.meetup.com/" + urlName + "/events/" + id + "?key=" + meetupKey + "&photo-host=public";
        $.ajax({
            url: meetupURL,
            method: "GET"
        }).then(function (res) {
            formatMeetUp(res);
            checkMeetupFinished();
        });
    }

    function checkMeetupFinished() {
        meetupNum++
        if (meetupNum === meetupIds.length) {
            eventMeetupNum = 0;
            isReady();
        }
    }

    $("#submit-Search").on("click", function () {
        event.preventDefault();
        query = $("#search-Event").val().trim();
        zipcode = $("#search-Number").val().trim();
        distance = $("#search-Location").val().trim();
        getEventBrite();
        getMeetUp();
        console.log("Query: " + query + "Zip: " + zipcode + "Distance: " + distance);
    });

    function isReady() {
        readyCheck++
        if (readyCheck === 2) {
            sortEvents()
            readyCheck = 0;
        }
    }

    function sortEvents() {
        readyCheck = 0;
        events.sort(function (a, b) {
            var adate = a.date
            var bdate = b.date
            if (adate.isBefore(bdate)) {
                return -1
            } else if (adate.isSame(bdate)) {
                return 0
            }
            else return 1
        })
        populateEvents();
    }
}); 
