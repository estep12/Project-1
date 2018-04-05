$('#jobs-btn').on("click", function jobs(){
//     const jobApiKey = "96736d32f82b972c6e743b723d5d4a1d"
//     const queryJobUrl = "https://authenticjobs.com/api/?api_key=96736d32f82b972c6e743b723d5d4a1d&method=aj.jobs.getCompanies"
// // $.ajax({
// //     url : queryJobUrl,
// //     method : "GET",
// //     dataType : "jsonp",
// // }).then(function(response){
// //     console.log(response);
// // })
$('#ReEmptxtCareerLocationPortrait').val(cityName + ", " + stateName);
console.log($('#ReEmptxtCareerLocationPortrait').val())
})