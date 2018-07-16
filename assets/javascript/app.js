var events = [];

class Event{
    constructor(date,time,link, info){
        this.date=date;
        this.time=time;
        this.link=link,
        this.info=info
    }
}

function getEventBrite() {
    // our search term
    var query = ""
    //zipcode seems to work fine
    var address = ""
    //needs mi or km as suffix
    var distance = "3mi"

    var eventBriteURL = "https://www.eventbriteapi.com/v3/events/search/?q=" + query + "&location.address=" + address + "&location.within=" + distance + "&token=" + token
    $().ajax({
        URL: eventBriteURL,
        method: "GET"
    }).then(function (res) {
        res.data["events"].forEach(function(e){
            var event = new Event( e.start.local, e.start.local, e.url, e.description.text);
            events.push(event);  
        })
        sortEvents()
    })
}
function formatEventBriteData(event){
    // this is where we will make all the stuff uniform so that we can compare values easily in sortEvents
}
function sortEvents(){
    // this is where we would sort the events by date.
}
