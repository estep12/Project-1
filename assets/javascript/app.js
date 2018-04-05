$(document).ready(function(){
    let city;
    let stateAbbrev;
    $('.collapsible').collapsible();
    const weatherApiKey = "d94860da10767bf2";
    
    $("#weather-btn").on("click", function(event) {
        weatherApi();
    })

    $("#food").on("click", function(event) {
        
    })

    $("#job-search").on("click", function(event) {
        
    })


    function weatherApi(){
        $("#food-add-on").hide();
        $("#jobs-add-on").hide();

        let queryURL = "http://api.wunderground.com/api/" + weatherApiKey + "/conditions/q/" + stateName + "/" + cityName + ".json";

        let temp;
        let weather;
        let webcamUrl;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            //conditions: current temp and weather conditions
            console.log(response);
            temp = response.current_observation.temp_f;
            weather = response.current_observation.weather; 
            
            let tempP = $("<p>");
            tempP.text("Current Temperature: " + temp);
            $("#weather-add-on").append(tempP);
            console.log(tempP);

            let weatherP = $("<p>");
            weatherP.text("Current Weather Conditions: " + weather);
            $("#weather-add-on").append(weatherP);
            console.log(weatherP);

        })

        queryURL = "http://api.wunderground.com/api/" + weatherApiKey + "/webcams/q/" + stateName + "/" + cityName + ".json";

        //ajax call for webcam
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            console.log(response);
            webcamUrl = response.webcams[1].CURRENTIMAGEURL;
            $("#weather-add-on").append($("<img>").attr("src", webcamUrl));
        })
    }

})
