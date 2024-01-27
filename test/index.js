

function fetchSurveyData() {
    return fetch('survey-data.json')
        .then(response => response.json())
        .then(json => {
            const survey = new SurveyBuilder(json, 'survey-container');
            survey.onComplete(printResponses); 
            return survey; 
        })
        .catch(error => console.error('Error fetching survey data:', error));
}

fetchSurveyData();

function printResponses(responses) {
    console.log("Survey Results:", JSON.stringify(responses, null, 2));
}
