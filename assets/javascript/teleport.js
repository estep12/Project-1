/*-------------------------------------------------------------------------
/ GLOBAL VARIABLES
/-------------------------------------------------------------------------*/
let cityName;
let stateName;
let countryName;
let fullName;
let latLong = {};
let population;
let cityPhotoURL;
let cityScore;
let scores;
const weatherApiKey = "d94860da10767bf2";
const jobApiKey = "96736d32f82b972c6e743b723d5d4a1d"


/*-------------------------------------------------------------------------
/ INITIALIZE FIREBASE
/-------------------------------------------------------------------------*/
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


/*-------------------------------------------------------------------------
/ INITIALIZE TELEPORT SEARCH WIDGET
/-------------------------------------------------------------------------*/
let teleport = TeleportAutocomplete.init("#teleport-autocomplete");
teleport.geoLocate = false;

// make teleport API calls when click the submit button
$("#submit").on("click", (e) => {
    e.preventDefault();
    const searchCity = $("#teleport-autocomplete").val();
    teleport.clear();
    if ((searchCity == "") || (!/^(?=.*[a-zA-Z])[a-zA-Z, ]+$/.test(searchCity))) {
        $("#teleport-autocomplete").attr("placeholder", "Please enter a valid city name!")
    } else {
        $("#teleport-autocomplete").attr("placeholder", "Search");
        apiCalls(searchCity);
    }
});

$("#most-searched-dropdown").on("click", "li", function () {
    apiCalls($(this).text());
});


/*-------------------------------------------------------------------------
/ FUNCTIONS
/-------------------------------------------------------------------------*/
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

// resize zomato widget when it loads
function zomatoLoad(obj) {
    console.log(obj);
}

// function to run API calls
function apiCalls(searchCity) {
    const queryURL = "https://api.teleport.org/api/cities/?search=" + searchCity.split(" ").join("+");
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then((response) => {
        if (response.count === 0) {
            $("#teleport-autocomplete").attr("placeholder", "Please enter a valid city name!")
        } else {
            return $.ajax({
                url: response._embedded["city:search-results"][0]._links["city:item"].href,
                method: "GET"
            });
        }
    }).then((response) => {
        if (response) {
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

            $(".container").show();
            $('html, body').animate({
                scrollTop: $(".container").offset().top
            }, 2000);
            $("#search-city").text(`${cityName}, ${stateName}, ${countryName}`);
            $("#explore-city").text(`Explore ${cityName}`);
            $("#city-info").empty().append($("<p>").append(`<b>Population: </b>${population.toLocaleString()}`));
            let newSrc = "https://www.zomato.com/widgets/res_search_widget.php?lat=" + latLong.lat + "&lon=" + latLong.lng + "&theme=dark&hideCitySearch=on&hideResSearch=on&sort=rating"
            $("#restaurant-widget").attr("src", newSrc);
            // console.log("res text", $("#restaurant-widget").contents().find(".res").text());

            initMap(latLong);

            let urbanAreaRequest;
            if (response._links["city:urban_area"]) {
                urbanAreaRequest = $.ajax({
                    url: response._links["city:urban_area"].href,
                    method: "GET",
                })
            }

            const gitHubJobsRequest = $.ajax({
                url: "https://jobs.github.com/positions.json?location=" + cityName,
                method: "GET",
                dataType: "jsonp"
            })

            const weatherQueryURL = "http://api.wunderground.com/api/" + weatherApiKey + "/conditions/q/" + stateName + "/" + cityName + ".json";
            const weatherRequest = $.ajax({
                url: weatherQueryURL,
                method: "GET"
            })

            const avgWeatherQueryURL = "http://api.wunderground.com/api/" + weatherApiKey + "/almanac/q/" + stateName + "/" + cityName + ".json";
            const avgWeatherRequest = $.ajax({
                url: avgWeatherQueryURL,
                method: "GET"
            })

            const queryCityJobURL = "https://authenticjobs.com/api/?api_key=" + jobApiKey + "&method=aj.jobs.search&location=" + cityName + "&format=json";
            const authJobsByCityRequest = $.ajax({
                url: queryCityJobURL,
                method: "GET",
                dataType: "jsonp"
            })

            const queryStateJobURL = "https://authenticjobs.com/api/?api_key=" + jobApiKey + "&method=aj.jobs.search&location=" + stateName + "&format=json";
            const authJobsByStateRequest = $.ajax({
                url: queryStateJobURL,
                method: "GET",
                dataType: "jsonp"
            })

            return Promise.all([urbanAreaRequest, gitHubJobsRequest, weatherRequest, avgWeatherRequest, authJobsByCityRequest, authJobsByStateRequest]);
        }
    }).then((response) => {
        if (response) {
            // populate jobs table with GitHub jobs
            $("#jobs-tbody").empty();
            for (let i = 0; i < response[1].length; i++) {
                const newJobsTableRow = $('<tr class="highlight">');
                const newJob = $("<td>").append($('<a class="job">').attr("href", response[1][i].url).text(response[1][i].title));
                const newcompany = $("<td>").append($('<a class="job">').attr("href", response[1][i].company_url).text(response[1][i].company));
                newJobsTableRow.append(newJob);
                newJobsTableRow.append(newcompany);
                $("#jobs-tbody").append(newJobsTableRow);
            }

            // populate current weather info
            if ("current_observation" in response[2]) {
                $("#weather-row").show();
                $("#no-weather-message").hide();
                const weatherResponse = response[2];
                const temp = weatherResponse.current_observation.temperature_string;
                const weatherFeels = weatherResponse.current_observation.feelslike_string;
                const weather = weatherResponse.current_observation.weather;
                const iconUrl = weatherResponse.current_observation.icon_url;

                $("#weather-current p").remove();
                let tempP = $("<p>");
                tempP.append("<b>Current Temperature: </b>" + temp);
                $("#weather-current").append(tempP);

                let weatherFeelsP = $("<p>");
                weatherFeelsP.append("<b>Feels like: </b>" + weatherFeels);
                $("#weather-current").append(weatherFeelsP);

                let weatherP = $("<p>");
                weatherP.append("<b>Current Weather Conditions: </b>" + weather);
                $("#weather-current").append(weatherP);

                $("#weather-pic").empty();
                $("#weather-pic").append($('<img id="icon">'));
                $('#icon').attr("src", iconUrl)
            } else {
                $("#weather-row").hide();
                $("#no-weather-message").show();
            }

            // populate average weather info
            if ("almanac" in response[3]) {
                const avgWeatherResponse = response[3];
                const avgHighF = avgWeatherResponse.almanac.temp_high.normal.F;
                const avgHighC = avgWeatherResponse.almanac.temp_high.normal.C;
                const avgLowF = avgWeatherResponse.almanac.temp_low.normal.F;
                const avgLowC = avgWeatherResponse.almanac.temp_low.normal.C;

                $("#weather-average p").remove();
                let avgHighs = $("<p>");
                avgHighs.append("<b>Average High: </b>" + avgHighF + " F (" + avgHighC + " C)");
                $("#weather-average").append(avgHighs);

                let avgLows = $("<p>");
                avgLows.append("<b>Average Low: </b>" + avgLowF + " F (" + avgLowC + " C)");
                $("#weather-average").append(avgLows);
            }

            // populate authentic jobs info
            let authenticJobsArray = [];
            let totalCityListings = response[4].listings.total;
            for (let i = 0; i < totalCityListings; i++) {
                authenticJobsArray.push(response[4].listings.listing[i]);
            }
            let totalStateListings = response[5].listings.total;
            for (let i = 0; i < totalStateListings; i++) {
                if (totalCityListings === 0) {
                    authenticJobsArray.push(response[5].listings.listing[i]);
                } else {
                    for (let j = 0; j < totalCityListings; j++) {
                        if (response[5].listings.listing[i].id !== authenticJobsArray[j].id) {
                            authenticJobsArray.push(response[5].listings.listing[i]);
                        }
                    }
                }
            }
            for (let i = 0; i < authenticJobsArray.length; i++) {
                const newJobsTableRow = $('<tr class="highlight">');
                const newJob = $("<td>").append($('<a class="job">').attr("href", authenticJobsArray[i].apply_url).text(authenticJobsArray[i].title));
                const newcompany = $("<td>").append($('<a class="job">').attr("href", authenticJobsArray[i].company.url).text(authenticJobsArray[i].company.name));
                newJobsTableRow.append(newJob);
                newJobsTableRow.append(newcompany);
                $("#jobs-tbody").append(newJobsTableRow);
            }

            // check if any jobs were populated and hide table if no jobs
            if ($("#jobs-tbody").children().length > 0) {
                $("#no-jobs-message").hide();
                $("#jobs-table").show();
                $("#jobs-add-on").height("450px");
            } else {
                $("#no-jobs-message").show();
                $("#jobs-table").hide();
                $("#jobs-add-on").height("auto");
            }

            // create request to get urban area images and scores
            if (response[0]) {
                const imageRequest = $.ajax({
                    url: response[0]._links["ua:images"].href,
                    method: "GET"
                })
                const scoresRequest = $.ajax({
                    url: response[0]._links["ua:scores"].href,
                    method: "GET"
                })
                return Promise.all([imageRequest, scoresRequest]);
            }
        }
    }).then((response) => {
        if (response) {
            cityPhotoURL = response[0].photos[0].image.web;
            cityScore = Math.round(response[1].teleport_city_score);
            scores = response[1].categories;
            scores.sort(function (a, b) { return (a.score_out_of_10 > b.score_out_of_10) ? -1 : ((b.score_out_of_10 > a.score_out_of_10) ? 1 : 0); });
            $("#city-image img").remove();
            $("#city-image").prepend($('<img id="dynamic-img">').attr("src", cityPhotoURL));
            $("#city-summary").empty().append(response[1].summary);
            $("#city-summary p").last().remove();
            $('#dynamic-img').attr("style", "width: 100%;");
            $("#city-info").append($("<p>").append(`<b>City Score: </b>${cityScore} / 100`));
            $("#map-col").removeClass("offset-m3");
            $("#scoring-col").show();
            $("#scores-tbody-top").empty();
            $("#scores-tbody-bot").empty();
            for (let i = 0; i < 3; i++) {
                const newTableRowTop = $('<tr>').append($("<td>").text(scores[i].name));
                newTableRowTop.append($("<td>").text(Math.round(scores[i].score_out_of_10)));
                $("#scores-tbody-top").append(newTableRowTop);
                const newTableRowBot = $('<tr>').append($("<td>").text(scores[scores.length - i - 1].name));
                newTableRowBot.append($("<td>").text(Math.round(scores[scores.length - i - 1].score_out_of_10)));
                $("#scores-tbody-bot").append(newTableRowBot);
            }
        } else {
            $("#city-image img").remove();
            $("#city-image").prepend($('<img id="dynamic-img">').attr("src", "assets/images/placeholder-city-image.png"));
            $("#map-col").addClass("offset-m3");
            $("#scoring-col").hide();
        }
    })
}

/*-------------------------------------------------------------------------
/ MATERIALIZE HELPERS
/-------------------------------------------------------------------------*/
$(document).ready(function () {
    $('.collapsible').collapsible();
    $(".dropdown-trigger").dropdown();
});
