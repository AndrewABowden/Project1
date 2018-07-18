$(document).ready(function () {
    var currentUser = { userID: "", firstName: "", lastName: "", email: "", userZip: "", ebFavorites: [], muFavorites: [] };

    firebase.auth().onAuthStateChanged(function (user) {
        window.user = user; // user is undefined if no user signed in
        if (user) { }
        else {
            //Return user to initial index page.
            window.location.href = "index.html";
        }
    });

    let promiseLoadUser = new Promise(function (resolve, reject) {
        auth.onAuthStateChanged(function (user) {
            if (user) {
                // Get the user's information.
                currentUser.userID = auth.currentUser.uid;
                database.ref('/users/' + currentUser.userID).once('value', function (snapshot) {
                    currentUser.firstName = snapshot.val().firstName;
                    currentUser.lastName = snapshot.val().lastName;
                    currentUser.email = snapshot.val().email;
                    currentUser.userZip = snapshot.val().userZip;
                    /* Insert HTML Formatting here for user information. */

                    /* end of Insert HTML formatting */
                    loadEBFavorites(currentUser.userID)
                        .then(function () {
                            /* Insert HTML formatting for Event Brite Favorites here */
                            if (document.URL.includes("favorites")) {
                                if (currentUser.ebFavorites.length > 0) {
                                    currentUser.ebFavorites.forEach(function (e) { returnEventBriteFavorite(e) })
                                }
                                else {
                                    console.log("no ebfavorites")
                                    isReady()
                                }
                            }
                            /* end of Insert HTML formatting */
                        })
                    //.catch(function () { console.log("Error getting EB Favorites") });
                    loadMUFavorites(currentUser.userID)
                        .then(function () {
                            /* Insert HTML formatting for MeetUp Favorites here */
                            if (document.URL.includes("favorites") > 0) {
                                if (currentUser.muFavorites.length) {
                                    currentUser.muFavorites.forEach(function (e) {
                                        returnMeetupFav(e.id, e.URL)
                                    })
                                } else {
                                    console.log("no muFavorites")
                                    isReady();
                                }
                            }
                            /* end of Insert HTML formatting */
                        })
                        .catch(function () { console.log("Error getting MU Favorites") });
                    /***************************************************/
                }, function (errorObject) {
                    console.log("The read failed: " + errorObject.code);
                    reject("Read Error");
                });
            }
            // if user is not logged in, send them to the log in page
            else {
                reject("User not loaded.");
                window.location.href = "index.html";
            }
        })
    })


    function loadEBFavorites(uID) {
        return new Promise(function (resolve, reject) {
            var ebFavs = [];
            database.ref("/users/" + uID + "/EBFavs").once("value")
                .then(function (snap) {
                    var some = snap.val()
                    if (some !== null) {
                        Object.values(some).forEach(function (childSnapshot) {
                            var childObject = childSnapshot;
                            ebFavs.push(childObject);
                        });
                    }
                    currentUser.ebFavorites = ebFavs;
                    return resolve();
                });
        })
    };

    function loadMUFavorites(uID) {
        return new Promise(function (resolve, reject) {
            var muFavs = [];
            database.ref("/users/" + uID + "/MUFavs").once("value")
                .then(function (snap) {
                    var some = snap.val()
                    console.log(Object.values(some))
                    if (some !== null) {
                        Object.values(some).forEach(function (childSnapshot, i) {
                            var childKey = childSnapshot.eID;
                            var childVal = childSnapshot.eURL;
                            var muObj = { id: childKey, URL: childVal }
                            muFavs.push(muObj);
                            console.log(muFavs[i])
                        });
                    }
                    currentUser.muFavorites = muFavs;
                    console.log(currentUser.muFavorites)
                    return resolve();
                });
        })
    };

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
    var meetupNum = 0;

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
        if (eventBriteNum === currentUser.ebFavorites.length) {
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
        $("#results-display").empty()
        // creating a div to rule them all
        var containingDiv = $("<div>").addClass("api-Elements");
        console.log(events)
        console.log("populate called")
        if (events.length === 0) {
            var noResults = $("<p>").addClass("text-center").text("There are no results that meet your search parameters. Try increaseing your search distance.");
            $(containingDiv).append(noResults);
            $("#results-display").append(containingDiv);
            console.log("no results");
        } else {
            events.forEach(function (e) {
                // creating the title of the gathering
                var title = $("<h2>").text(e.name)
                // showing the date
                var date = $("<p>").text(e.date.format("MMMM DD YYYY hh:mm a"))
                // showing the summary
                var sum = $("<p>").text(e.info)
                // giving a link to 
                var link = $("<a>").text(e.link).attr("href", e.link)
                // creating favorite button needs a font awesome icon
                var favBtn = $("<i>").addClass("fav-btn far fa-heart").attr("data-not-favorite", 'fav-btn far fa-heart').attr("data-favorite", "fav-btn fas fa-heart").attr("data-state", "not").attr("data-src", e.src).attr("data-id", e.id).attr("data-url-name", e.urlName)
                // appending it all to the ruler
                containingDiv.append(title, date, sum, link, favBtn)
                // showing it on the screen
                $("#results-display").append(containingDiv)
            })
        }
    }

    $(document).on("click", ".fav-btn", function () {
        console.log(".fav-btn clicked")
        if ($(this).attr("data-state") === "not") {
            $(this).attr("class", $(this).attr("data-favorite"))
            $(this).attr("data-state", "faved")
            if ($(this).attr("data-src") === "eventBrite") {
                //add to eventBrite faves
                setEBFav(currentUser.userID, $(this).attr("data-id"))
            }
            else if ($(this).attr("data-src") === "meetup") {
                // add to meetup faves
                setMUFav($(this).attr("data-id"), $(this).attr("data-url-name"))
            }
        }
        else if ($(this).attr("data-state") === "faved") {
            $(this).attr("class", $(this).attr("data-not-favorite"))
            $(this).attr("data-state", "not");
            if ($(this).attr("data-src") === "eventBrite") {
                //remove from eventBrite faves
                remEBFav(currentUser, $(this).attr("data-id"))
            }
            else if ($(this).attr("data-src") === "meetup") {
                // remove from meetup faves
                remMUFav(currentUser, $(this).attr("data-id"))
            }
        }
    })

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
    function formatMeetUpFavorite(event) {
        var date = moment(event.time) /*format date when populated to html*/;
        console.log(event);
        console.log(event.name)
        newEvent = new Event(event.name, date, event.link, event.name, "meetup", event.id, event.urlname);
        console.log("successful formatMeetupFavorite")
    }


    function returnMeetupFav(id, urlName) {
        var pre = "https://cors-anywhere.herokuapp.com/";
        var meetupKey = "221a475e5932e6c6c497a294d424e30";
        var meetupURL = pre + "api.meetup.com/" + urlName + "/events/" + id + "?key=" + meetupKey + "&photo-host=public";
        console.log(meetupURL);
        $.ajax({
            url: meetupURL,
            method: "GET"
        }).then(function (res) {
            console.log(res);
            formatMeetUpFavorite(res);
            checkMeetUpFinished()
        });
    }

    function checkMeetUpFinished() {
        meetupNum++
        if (meetupNum === currentUser.muFavorites.length) {
            MeetupNum = 0;
            isReady();
        }
    }

    $("#submit-Search").on("click", function () {
        event.preventDefault();
        $("#results-display").empty()
        if (query !== $("#search-Event").val().trim() || zipcode !== $("#search-Number").val().trim() || distance !== $("#search-Location").val().trim()) {
            query = $("#search-Event").val().trim();
            if (query.includes("#")) {
                // here is where we need a function asking people to not use # character
                return;
            }
            zipcode = $("#search-Number").val().trim();
            if (parseInt(zipcode) === NaN || (parseInt(zipcode) <= 501 && parseInt(zipcode) >= 99950)) {
                // here is where we need a function for not valid zipcode
                return;
                // 

            }
            distance = $("#search-Location").val().trim();
            if (parseInt(distance) === NaN) {
                // here is where we need a function for not a valid distance
                return;
            }
            events = []
            getEventBrite();
            getMeetUp();
            console.log("Query: " + query + "Zip: " + zipcode + "Distance: " + distance);
        }
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

    // function noResults() {
    //     if (events.length === 0) {
    //         var containingDiv = $("<div>").addClass("api-Elements");
    //         var noResultsSpan = $("span").text("There are no results that meet your search parameters. Try increaseing your search distance.");
    //         $(containingDiv).append(noResultsSpan);
    //         $("#results-display").append(containingDiv);
    //     } 
    // }

    // Run this at the start of your page.. it grabs the DB info.
    promiseLoadUser.then(function (fromResolve) {
    }).catch(function (fromReject) {
    });
});
