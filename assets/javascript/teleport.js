// variables to set on city search
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
    console.log(searchCity);
    teleport.clear();
    if (searchCity == ""){
        $("#teleport-autocomplete").attr("placeholder", "Please enter a valid city name!")
    }else if (searchCity != ""){
        $("#teleport-autocomplete").attr("placeholder", "Search");
        apiCalls(searchCity);
    }
    
});

$("#most-searched-dropdown").on("click", "li", function () {
    apiCalls($(this).text());
});

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

// function to run API calls
function apiCalls(searchCity) {
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

        $(".container").show();
        $('html, body').animate({
            scrollTop: $(".container").offset().top
        }, 2000);
        $("#search-city").text(`${cityName}, ${stateName}, ${countryName}`);
        $("#explore-city").text(`Explore ${cityName}`);
        $("#city-info").empty().append($("<p>").text(`Population: ${population.toLocaleString()}`));
        let newSrc = "https://www.zomato.com/widgets/res_search_widget.php?lat=" + latLong.lat + "&lon=" + latLong.lng + "&theme=dark&hideCitySearch=on&hideResSearch=on&sort=rating"
        $("#restaurant-widget").attr("src", newSrc);

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

        return Promise.all([urbanAreaRequest, gitHubJobsRequest, weatherRequest, avgWeatherRequest]);
    }).then((response) => {
        $("#jobs-tbody").empty();
        if (response[1].length === 0) {
            $("#no-jobs-message").show();
            $("#jobs-table").hide();
            $("#jobs-add-on").height("auto");
        } else {
            $("#no-jobs-message").hide();
            $("#jobs-table").show();
            $("#jobs-add-on").height("450px");
        }
        for (let i = 0; i < response[1].length; i++) {
            const newJobsTableRow = $('<tr class="highlight">');
            const newJob = $("<td>").append($('<a class="job">').attr("href", response[1][i].url).text(response[1][i].title));
            const newcompany = $("<td>").append($('<a class="job">').attr("href", response[1][i].company_url).text(response[1][i].company));
            newJobsTableRow.append(newJob);
            newJobsTableRow.append(newcompany);
            $("#jobs-tbody").append(newJobsTableRow);
        }

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
            tempP.text("Current Temperature: " + temp);
            $("#weather-current").append(tempP);

            let weatherFeelsP = $("<p>");
            weatherFeelsP.text("Feels like: " + weatherFeels);
            $("#weather-current").append(weatherFeelsP);

            let weatherP = $("<p>");
            weatherP.text("Current Weather Conditions: " + weather);
            $("#weather-current").append(weatherP);
            
            $("#weather-pic").append($('<img id="icon">'));
            $('#icon').attr("src", iconUrl)
        } else {
            $("#weather-row").hide();
            $("#no-weather-message").show();
        }

        if ("almanac" in response[3]) {
            const avgWeatherResponse = response[3];
            const avgHighF = avgWeatherResponse.almanac.temp_high.normal.F;
            const avgHighC = avgWeatherResponse.almanac.temp_high.normal.C;
            const avgLowF = avgWeatherResponse.almanac.temp_low.normal.F;
            const avgLowC = avgWeatherResponse.almanac.temp_low.normal.C;

            $("#weather-average p").remove();
            let avgHighs = $("<p>");
            avgHighs.text("Average High: " + avgHighF + " F (" + avgHighC + " C)");
            $("#weather-average").append(avgHighs);

            let avgLows = $("<p>");
            avgLows.text("Average Low: " + avgLowF + " F (" + avgLowC + " C)");
            $("#weather-average").append(avgLows);
        }

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
    }).then((response) => {
        cityPhotoURL = response[0].photos[0].image.web;
        cityScore = Math.round(response[1].teleport_city_score);
        scores = response[1].categories;
        scores.sort(function (a, b) { return (a.score_out_of_10 > b.score_out_of_10) ? -1 : ((b.score_out_of_10 > a.score_out_of_10) ? 1 : 0); });
        $("#city-image img").remove();
        $("#city-image").prepend($('<img id="dynamic-img">').attr("src", cityPhotoURL));
        $("#city-summary").empty().append(response[1].summary);
        $("#city-summary p").last().remove();
        $('#dynamic-img').attr("style", "width: 100%;");
        $("#city-info").append($("<p>").text(`City Score: ${cityScore} / 100`));
        // TODO: UPDATE TABLE ID
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
    })
}

$(document).ready(function () {
    $('.collapsible').collapsible();
    $(".dropdown-trigger").dropdown();
});
