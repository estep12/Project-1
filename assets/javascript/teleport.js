// variables to set on city search
let cityName;
let stateName;
let countryName;
let latLong = [];
let population;
let cityPhotoURL;

// listen for autocomplete on Teleport search widget
TeleportAutocomplete.init('#teleport-autocomplete').on('change', function(response) {
    const geoID = response.geonameId;
    const queryURL = "https://api.teleport.org/api/cities/geonameid:" + geoID;

    $.ajax({
        url: queryURL,
        method: "GET",
    }).then((response) => {
        console.log(response);
        cityName = response.name;
        stateName = response._links["city:admin1_division"].name;
        countryName = response._links["city:country"].name;
        latLong.push(response.location.latlon.latitude);
        latLong.push(response.location.latlon.longitude);
        population = response.population;

        $("#search-city").text(`${cityName}, ${stateName}, ${countryName}`);
        $("#city-info").append($("<p>").text(`Population: ${population}`));

        if (response._links["city:urban_area"]) {
            return $.ajax({
                url: response._links["city:urban_area"].href,
                method: "GET",
            })
        }
    }).then((response) => {
        console.log(response);
        if (response) {
            return $.ajax({
                url: response._links["ua:images"].href,
                method: "GET"
            })
        }
    }).then((response) => {
        console.log(response);
        cityPhotoURL = response.photos[0].image.web;
        $("#city-info").append($("<img>").attr("src", cityPhotoURL));
    })
});
