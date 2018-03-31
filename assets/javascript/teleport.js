let queryURL = "https://api.teleport.org/api/cities/?search=san%20francisco";

$.ajax({
    url: queryURL,
    method: "GET",
}).then((response) => {
    console.log(response);
});

// var $results = document.querySelector('.results');
// var appendToResult = $results.insertAdjacentHTML.bind($results, 'afterend');

TeleportAutocomplete.init('#teleport-autocomplete').on('change', function(value) {
    console.log(value);
//   appendToResult('<pre>' + JSON.stringify(value, null, 2) + '</pre>');
});