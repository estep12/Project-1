
$('#food-btn').on("click", function foodWidget(){
    console.log(latLong)
    let latitudeFood = latLong.lat;
    let longitudeFood = latLong.lng;

    console.log(latitudeFood);
    console.log(longitudeFood);
    
    // $('#food-add-on').empty().append(newDiv);
    let newSrc ="https://www.zomato.com/widgets/res_search_widget.php?lat=" + latitudeFood + "&lon=" + longitudeFood + "&theme=red&hideCitySearch=on&hideResSearch=on&sort=rating"
    $("iframe").attr("src", newSrc);
})