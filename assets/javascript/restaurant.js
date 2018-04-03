
$('#food-btn').on("click", function foodWidget(){
    // let newDiv = $('<div class="widget_wrap" style="width:500px;height:450px;display:inline-block;"><iframe src="https://www.zomato.com/widgets/res_search_widget.php?city_id=826&theme=red&sort=popularity" style="position:relative;width:100%;height:100%;" border="0" frameborder="0"></iframe></div>')
    let newCityName = $('#teleport-autocomplete').val().trim()
    console.log(newCityName);
    
    // $('#food-add-on').append(newDiv);
    $('.city_select>input>#city_input').val(newCityName);
})