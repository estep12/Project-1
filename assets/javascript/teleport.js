let queryURL = "https://api.teleport.org/api/cities/?search=san%20francisco";

$.ajax({
    url: queryURL,
    method: "GET",
}).then((response) => {
    console.log(response);
});
