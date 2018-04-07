$('#jobs-btn').on("click", function (event) {
    const jobApiKey = "96736d32f82b972c6e743b723d5d4a1d"
    const queryJobUrl = "https://authenticjobs.com/api/?api_key=96736d32f82b972c6e743b723d5d4a1d&method=aj.jobs.search&perpage=100&format=json";

    let allListings = [];
    let matchedListings = [];

    $.ajax({
        url : queryJobUrl,
        method : "GET",
        dataType : "jsonp",
    }).then(function(response){
        console.log(response);
        console.log(response.listings.total)

        let length = response.listings.total;

        for(let i = 0; i<length; i++){
            if(response.listings.listing[i].company.location.lat == latLong.lat){
                matchedListings.push(response.listings.listing[i]);
            }
            console.log(response.listings.listing[i].company.location.lat);
            //console.log(matchedListings);
            //if(response.listings.listing[i].company.location.lat)
        }
        //create an array to hold all objects, cross object long/lat with our saved long/lat. if long/lat are the same, save the object
    })
// $('#ReEmptxtCareerLocationPortrait').val(cityName + ", " + stateName);
// console.log($('#ReEmptxtCareerLocationPortrait').val())
})