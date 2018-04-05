$(document).ready(function () {
    let city;
    let stateAbbrev;
    $('.collapsible').collapsible();
    const weatherApiKey = "d94860da10767bf2";

    $("#weather-btn").on("click", function (event) {
        $('#weather-add-on').empty();
        weatherApi();
    })

    $("#job-search").on("click", function (event) {

    })


    function weatherApi() {
        let queryURL = "http://api.wunderground.com/api/" + weatherApiKey + "/conditions/q/" + stateName + "/" + cityName + ".json";

        let temp;
        let weather;
        let weatherFeels;
        let webcamUrl;
        let avgLowF;
        let avgLowC;
        let avgHighF;
        let avgHighC;
        
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            temp = response.current_observation.temperature_string;
            weatherFeels = response.current_observation.feelslike_string;
            weather = response.current_observation.weather;
            iconUrl = response.current_observation.icon_url;

            let tempP = $("<p>");
            tempP.text("Current Temperature: " + temp);
            $("#weather-add-on").append(tempP);
            console.log(tempP);

            let weatherFeelsP = $("<p>");
            weatherFeelsP.text("Feels like: " + weatherFeels);
            $("#weather-add-on").append(weatherFeelsP);
            console.log(weatherFeelsP);

            let weatherP = $("<p>");
            weatherP.text("Current Weather Conditions: " + weather);
            $("#weather-add-on").append(weatherP);
            console.log(weatherP);

            $("#weather-add-on").append($('<div><img id="icon"></div>'));
            $('#icon').attr("src", iconUrl)
            console.log(iconUrl);
        })

        queryURL = "http://api.wunderground.com/api/" + weatherApiKey + "/almanac/q/" + stateName + "/" + cityName + ".json";

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);

            avgHighF = response.almanac.temp_high.normal.F;
            avgHighC = response.almanac.temp_high.normal.C;
            avgLowF = response.almanac.temp_low.normal.F;
            avgLowC = response.almanac.temp_low.normal.C;

            let avgHighs = $("<p>");
            avgHighs.text("Average High: " + avgHighF + "(" + avgHighC + ")");
            $("#weather-add-on").append(avgHighs);
            console.log(avgHighs);

            let avgLows = $("<p>");
            avgLows.text("Average Low: " + avgLowF + "(" + avgLowC + ")");
            $("#weather-add-on").append(avgLows);
            console.log(avgLows);
        })

        // queryURL = "http://api.wunderground.com/api/" + weatherApiKey + "/webcams/q/" + stateName + "/" + cityName + ".json";

        // //ajax call for webcam
        // $.ajax({
        //     url: queryURL,
        //     method: "GET"
        // }).then(function (response) {
        //     console.log(response);
        //     webcamUrl = response.webcams[1].CURRENTIMAGEURL;
        //     $("#weather-add-on").append($("<img>").attr("src", webcamUrl));
        // })
    }

})
