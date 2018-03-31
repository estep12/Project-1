$(document).ready(function(){
    let city;
    let stateAbbrev;

    const weatherApiKey = d94860da10767bf2;
    
    $("#submit").on("click", function(event){
        event.preventDefault();
        city = $("#search").val().trim();
        //state abbreviations to figure out through autocomplete teleport api
        
        //to all the apis
        weatherApi();

    });

    function weatherApi(){
        let queryURL = "http://api.wunderground.com/api/" + weatherApiKey + "/conditions/q/" + stateAbbrev + "/" + city + ".json";

    }

})
