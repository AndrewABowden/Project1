// Initialize Firebase
var config = {
    apiKey: "AIzaSyCtggqMZIVe6lGYWFhdhwSnvQmHVt7ZawM",
    authDomain: "eventagg-ae1ec.firebaseapp.com",
    databaseURL: "https://eventagg-ae1ec.firebaseio.com",
    projectId: "eventagg-ae1ec",
    storageBucket: "eventagg-ae1ec.appspot.com",
    messagingSenderId: "640143422232"
  };
  
  firebase.initializeApp(config);
  var database = firebase.database();
  const auth = firebase.auth();
  
  // User signout
  function logOut() {
    auth.signOut().then(function () {
      console.log("user signed out");
      // Sign-out successful.
    }).catch(function (error) {
      console.log(error.code);
    });
  }
  
  
  
  
  // Takes in a user id and event it and adds a favorite. Return true on success, false on failure
  function setMUFav(uID, eID, urlName) {
        // build object
        var meetUpObject = { eID: eID, eURL: urlName }
        // first check make sure the eID doesn't exist, add if it does
        database.ref("/users/" + uID + "/MUFavs/").on('value', function (snapshot) {
          if (snapshot.hasChild(eID)) {
            return false;
          }
          else {
            database.ref("/users/" + uID + "/MUFavs/" + eID).set(meetUpObject);
            return true;
          }
        })
      }
  
    // Takes in a user id and event it and adds a favorite. Return true on success, false on failure
    function setEBFav(uID, eID) {
      // first check make sure the eID doesn't exist, add if it does
      database.ref("/users/" + uID + "/EBFavs").once('value', function (snapshot) {
        if (snapshot.hasChild(eID)) {
          return false;
        }
        else {
          database.ref("/users/" + uID + "/EBFavs/" + eID).set(eID);
          return true;
        }
      })
    };
  
  
  
// Takes in a user id and event it and removes the favorite. Return true on success, false on failure
function remMUFav(uID, eID) {
  database.ref("/users/" + uID + "/MUFavs").once('value', function (snapshot) {
    if (snapshot.hasChild(eID)) { 
      database.ref("/users/" + uID + "/MUFavs/"+eID).remove();
    }
  })
};

// Takes in a user id and event it and removes the favorite. Returntrue on success, false on failure
function remEBFav(uID, eID) {
  database.ref("/users/" + uID + "/EBFavs").once('value', function (snapshot) {
    if (snapshot.hasChild(eID)) {
      database.ref("/users/" + uID + "/EBFavs/"+eID).remove();
    }
  })
};
  