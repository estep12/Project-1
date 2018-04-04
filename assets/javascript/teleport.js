// variables to set on city search
let cityName;
let stateName;
let countryName;
let fullName;
let latLong = {};
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

    snapshot.forEach(function (data) {
        $("#most-searched-dropdown").prepend($("<li>").append($("<a>").attr("href", "#").text(data.key)));
    });
}, (errorObject) => {
    console.log(`Errors handled: ${errorObject.code}`);
});

// initialize teleport autocomplete widget
let teleport = TeleportAutocomplete.init("#teleport-autocomplete");

// make teleport API calls when click the submit button
$("#submit").on("click", (e) => {
    e.preventDefault();
    const searchCity = $("#teleport-autocomplete").val();
    teleport.clear();

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

        latLong.lat = response.location.latlon.latitude;
        latLong.lng = response.location.latlon.longitude;
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

        initMap(latLong);

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
        $("#city-image").empty().append($('<img id="dynamic-img">').attr("src", cityPhotoURL));
        $('#dynamic-img').attr("style", "width:100%;")
    })
});

$(".dropdown-trigger").dropdown();


// add google map on search
function initMap(latlonobj) {
    // var uluru = { lat: -25.363, lng: 131.044 };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: latlonobj
    });
    var marker = new google.maps.Marker({
        position: latlonobj,
        map: map
    });
}