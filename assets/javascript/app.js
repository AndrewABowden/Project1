$(document).ready(function () {
    var events = []; 
    // this var is for testing to see if we got both our ajax calls back.
    var readyCheck = 0;

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
            isReady()
        })
    }
    getEventBrite()
    //new Event(da)
    function formatEventBriteData(event) {
        date = moment(event.start.local,"YYYY-MM-DD HH:mm:ss")
        e = new Event(event.name, date, event.url,event.description.text)
        // this is where we will make all the stuff uniform so that we can compare values easily in sortEvents
    }
    function isReady(){
        readyCheck++
        if(readyCheck === 2){
            sortEvents()
        }
    }
    function sortEvents() {
        readyCheck = 0;
        events.sort(function(a,b){
            var adate= a.date
            var bdate = b.date
            if(adate.isBefore(bdate)){
                return -1
            }else if(adate.isSame(bdate)){
                return 0
            }
            else return 1
        })
    // this is where we would sort the events by date.
    }
}); 
