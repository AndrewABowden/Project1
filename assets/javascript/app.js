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

                    // Populated zipcode with user zipcode
                    if (document.URL.includes("index2")) {
                        $("#search-Number").val(currentUser.userZip);
                    }

                    /* end of Insert HTML formatting */
                    loadEBFavorites(currentUser.userID)
                        .then(function () {
                            /* Insert HTML formatting for Event Brite Favorites here */
                            if (document.URL.includes("favorites")) {
                                if (currentUser.ebFavorites.length > 0) {
                                    currentUser.ebFavorites.forEach(function (e) { returnEventBriteFavorite(e) })
                                }
                                else {
                                    isReady()
                                }
                            }
                            /* end of Insert HTML formatting */
                        })
                    .catch(function () {  });
                    loadMUFavorites(currentUser.userID)
                        .then(function () {
                            /* Insert HTML formatting for MeetUp Favorites here */
                            if (document.URL.includes("favorites")) {
                                if (currentUser.muFavorites.length > 0) {
                                    currentUser.muFavorites.forEach(function (e) {
                                        returnMeetupFav(e.id, e.URL)
                                    })
                                } else {
                                    isReady();
                                }
                            }
                            /* end of Insert HTML formatting */
                        })
                        .catch(function () {  });
                    /***************************************************/
                }, function (errorObject) {
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
                    if (some !== null) {
                        Object.values(some).forEach(function (childSnapshot, i) {
                        var childKey = childSnapshot.eID;
                            var childVal = childSnapshot.eURL;
                            var muObj = { id: childKey, URL: childVal }
                            muFavs.push(muObj);
                        });
                    }
                    currentUser.muFavorites = muFavs;
                    return resolve();
                });
        })
    };

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
        }
    }

    //EventBrite Query
    function getEventBrite() {
        var eventBriteURL = "https://www.eventbriteapi.com/v3/events/search/?q=" + query + "&location.address=" + zipcode + "&location.within=" + distance + "mi&token=" + token
      
        $.ajax({
            url: eventBriteURL,
            method: "GET"
        }).then(function (res) {

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
            formatEventBriteData(res);
            checkEventBriteFinished();
        })
    }
    function checkEventBriteFinished() {
        eventBriteNum++
        if (eventBriteNum === currentUser.ebFavorites.length) {
            eventBriteNum = 0;
            isReady();
        }
    }

    function formatEventBriteData(event) {
        date = moment(event.start.local, "YYYY-MM-DD HH:mm:ss")
        e = new Event(event.name.text, date, event.url, event.description.text, "eventBrite", event.id, "");
    }

    function populateEvents() {
        $("#results-display").empty()
        if (events.length === 0 && document.URL.includes("index2")) {
            var containingDiv = $("<div>").addClass("api-Elements")
            var noResults = $("<p>").addClass("text-center").text("There are no results that meet your search parameters. Try increasing your search distance.");
            $(containingDiv).append(noResults);
            $("#results-display").append(containingDiv);
        } else {
            events.forEach(function (e) {
                // creating a div to rule them all
                var containingDiv = $("<div>").addClass("api-Elements")
                // creating the title of the gathering
                var title = $("<h2>").text(e.name)
                // showing the date
                var date = $("<p>").text(e.date.format("MMMM DD YYYY hh:mm a"))
                // showing the summary
                var sum = $("<p>").text(e.info)
                // giving a link to 
                var link = $("<a>").text(e.link).addClass("event-link").attr("target", "_blank").attr("href", e.link)
                // creating favorite button needs a font awesome icon
                var favBtn = $("<i>").addClass("fav-btn far fa-heart fa-2x").attr("data-not-favorite", 'fav-btn far fa-heart fa-2x').attr("data-favorite", "fav-btn fas fa-heart fa-2x").attr("data-state", "not").attr("data-src", e.src).attr("data-id", e.id).attr("data-url-name", e.urlName)
                // appending it all to the ruler
                containingDiv.append(title, date, sum, link, favBtn)
                if (e.src === "eventBrite") {
                    if (currentUser.ebFavorites.indexOf(e.id) > -1) {
                        favBtn.attr("class", favBtn.attr("data-favorite")).attr("data-state", "faved")
                    }
                } else if (e.src === "meetup") {
                    //we cannot directly use indexOf() since this is an array of objects, so I had to write out this crazy statement.
                    if (currentUser.muFavorites.find(function (element) { return element.id === e.id }) !== undefined) {
                        favBtn.attr("class", favBtn.attr("data-favorite")).attr("data-state", "faved")
                    }
                }
                // showing it on the screen
                $("#results-display").append(containingDiv)
            })
        }
    }

    $(document).on("click", ".fav-btn", function () {
        if ($(this).attr("data-state") === "not") {
            $(this).attr("class", $(this).attr("data-favorite"))
            $(this).attr("data-state", "faved")
            if ($(this).attr("data-src") === "eventBrite") {
                //add to eventBrite faves
                setEBFav(currentUser.userID, $(this).attr("data-id"))
            }
            else if ($(this).attr("data-src") === "meetup") {
                // add to meetup faves
                setMUFav(currentUser.userID, $(this).attr("data-id"), $(this).attr("data-url-name"))
            }
        }
        else if ($(this).attr("data-state") === "faved") {
            $(this).attr("class", $(this).attr("data-not-favorite"))
            $(this).attr("data-state", "not");
            if ($(this).attr("data-src") === "eventBrite") {
                //remove from eventBrite faves
                remEBFav(currentUser.userID, $(this).attr("data-id"))
            }
            else if ($(this).attr("data-src") === "meetup") {
                // remove from meetup faves
                remMUFav(currentUser.userID, $(this).attr("data-id"))
            }
        }
    })

    //MEETUP Query
    function getMeetUp() {
        var pre = "https://cors-anywhere.herokuapp.com/";
        var meetupKey = "221a475e5932e6c6c497a294d424e30";
        var meetupURL = pre + "api.meetup.com/find/groups?key=" + meetupKey + "&photo-host=public&zip=" + zipcode + "&upcoming_events=true&text=" + query + "&radius=" + distance;
        $.ajax({
            url: meetupURL,
            method: "GET"
        }).then(function (res) {
            res.forEach(element => {
                //had to add this because events were populating despite not having current event
                if (element.next_event) {
                    formatMeetUp(element);
                }
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
        newEvent = new Event(event.name, date, event.link, event.name, "meetup", event.id, event.urlname);
    }


    function returnMeetupFav(id, urlName) {
        var pre = "https://cors-anywhere.herokuapp.com/";
        var meetupKey = "221a475e5932e6c6c497a294d424e30";
        var meetupURL = pre + "api.meetup.com/" + urlName + "/events/" + id + "?key=" + meetupKey + "&photo-host=public";
        $.ajax({
            url: meetupURL,
            method: "GET"
        }).then(function (res) {
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
        if (query !== $("#search-Event").val().trim() || zipcode !== $("#search-Number").val().trim() || distance !== $("#search-Location").val().trim()) {
            $("#results-display").empty()
            query = $("#search-Event").val().trim();
            if (query.includes("#") || query ==="") {
                $('#modal-wrong-query').modal({
                    show: true
                })
                return;
            }
            zipcode = $("#search-Number").val().trim();
            if (parseInt(zipcode) === NaN || (parseInt(zipcode) <= 501 && parseInt(zipcode) >= 99950)) {
                $('#modal-zipcode-invalid').modal({
                    show: true
                })
                return;
            }
            distance = $("#search-Location").val().trim();
            if (parseInt(distance) === NaN || parseInt(distance) > 100) {
                $('#modal-invalid-distance').modal({
                    show: true
                })
                return;
            }
            events = []
            var spinner = $("<i>").addClass("fas fa-spinner fa-spin fa-4x");
            $("#results-display").append(spinner);
            getEventBrite();
            getMeetUp();    
        }
    });

    function isReady() {
        readyCheck++
        if (readyCheck === 2) {
            sortEvents()
            readyCheck = 0;
            if (document.URL.includes("index2")) {
                var header = $("<h3>").addClass("header-small rounded").text("Top Events:");
                $("#results-display").prepend(header);
            }
            $(".fa-spinner").remove();
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

    // Run this at the start of your page.. it grabs the DB info.
    promiseLoadUser.then(function (fromResolve) {
    }).catch(function (fromReject) {
    });
});
