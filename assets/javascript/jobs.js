$('#jobs-btn').on("click", function (event) {
    const jobApiKey = "96736d32f82b972c6e743b723d5d4a1d"
    const queryJobUrl = "https://authenticjobs.com/api/?api_key=" + jobApiKey + "&method=aj.jobs.search&location=" + cityName + "&format=json";
    
    let authenticJobsArray = [];

    $.ajax({
        url : queryJobUrl,
        method : "GET",
        dataType : "jsonp",
    }).then(function(response){
        console.log(response);

        let totalListings = response.listings.total;
        console.log(totalListings);

        for(i =0 ; i < totalListings; i++){
            authenticJobsArray.push(response.listings.listing[i]);
        }

        const queryJobUrl2 = "https://authenticjobs.com/api/?api_key=" + jobApiKey + "&method=aj.jobs.search&location=" + stateName + "&format=json";

        $.ajax({
            url : queryJobUrl2,
            method : "GET",
            dataType : "jsonp",
        }).then(function(response){
            console.log(response);

            let totalListings = response.listings.total;
            console.log(totalListings);

            for(i = 0; i < totalListings; i++){
                let compare = authenticJobsArray.length;

                for(j = 0; j<compare; j++){
                    if(response.listings.listing[i].id != authenticJobsArray[j].id){
                        authenticJobsArray.push(response.listings.listing[i]);
                    }
                }
            }
            displayJobs();
        })
    })
       

    function displayJobs(){
        for(let i = 0; i< authenticJobsArray.length; i++){
            const newJobsTableRow = $('<tr class="highlight">');
            const newJob = $("<td>").append($('<a class="job">').attr("href",authenticJobsArray[i].apply_url).text(authenticJobsArray[i].title));
            const newcompany = $("<td>").append($('<a class="job">').attr("href",authenticJobsArray[i].company.url).text(authenticJobsArray[i].company.name));
            console.log(authenticJobsArray[i].apply_url);
            console.log(authenticJobsArray[i].company.url);
            newJobsTableRow.append(newJob);
            newJobsTableRow.append(newcompany);
            $("#jobs-tbody").append(newJobsTableRow);
        }
    }

})