// variables to set on city search
let cityName;
let stateName;
let countryName;
let fullName;
let latLong = [];
let population;
let cityPhotoURL;

// initialize firebase
var config = {
    apiKey: "AIzaSyDtbDtrYHKNrdkYMqAmMAXxcHhIa4tLW-8",
    authDomain: "relocation-app-bd038.firebaseapp.com",
    databaseURL: "https://relocation-app-bd038.firebaseio.com",
    projectId: "relocation-app-bd038",
    storageBucket: "relocation-app-bd038.appspot.com",
    messagingSenderId: "37449828472"
  };
firebase.initializeApp(config);
const database = firebase.database();

// display firebase
database.ref().orderByValue().limitToLast(3).on("value", (snapshot) => {
    $("#most-searched-dropdown").empty();
    snapshot.forEach(function(data) {
        $("#most-searched-dropdown").prepend($("<li>").append($("<a>").attr("href","#").text(data.key)));
     });
}, (errorObject) => {
    console.log(`Errors handled: ${errorObject.code}`);
});

// initialize teleport autocomplete widget
TeleportAutocomplete.init("#teleport-autocomplete");


// make teleport API calls when click the submit button
$("#submit").on("click", (e) => {
    e.preventDefault();
    const searchCity = $("#teleport-autocomplete").val();
    $("#teleport-autocomplete").val("");
    const queryURL = "https://api.teleport.org/api/cities/?search=" + searchCity.split(" ").join("+");
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then((response) => {
        return $.ajax({
            url: response._embedded["city:search-results"][0]._links["city:item"].href,
            method: "GET"
        });
    }).then((response) => {
        cityName = response.name;
        stateName = response._links["city:admin1_division"].name;
        countryName = response._links["city:country"].name;
        fullName = response.full_name;
        latLong.push(response.location.latlon.latitude);
        latLong.push(response.location.latlon.longitude);
        population = response.population;

        // update firebase
        database.ref(fullName).transaction((snapshot) => {
            if (snapshot === null) {
                return 1;
            }
            const newCount = snapshot + 1;
            return newCount;
        });

        $("#search-city").text(`${cityName}, ${stateName}, ${countryName}`);
        $("#city-info").empty().append($("<p>").text(`Population: ${population}`));

        if (response._links["city:urban_area"]) {
            return $.ajax({
                url: response._links["city:urban_area"].href,
                method: "GET",
            })
        }
    }).then((response) => {
        if (response) {
            return $.ajax({
                url: response._links["ua:images"].href,
                method: "GET"
            })
        }
    }).then((response) => {
        cityPhotoURL = response.photos[0].image.web;
        $("#city-image").append($("<img>").attr("src", cityPhotoURL));
    })
});

$(".dropdown-trigger").dropdown();