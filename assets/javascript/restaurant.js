
$('#food-btn').on("click", function foodWidget(){
    console.log(latLong)
    let latitudeFood = latLong[0];
    let longitudeFood = latLong[1];

    console.log(latitudeFood);
    console.log(longitudeFood);
    
    $('#food-add-on').empty().append(newDiv);

})