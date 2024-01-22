function fetchSurveyData() {
    fetch('survey-data.json')
        .then(response => response.json())
        .then(json => new SurveyBuilder(json, 'survey-container'))
        .catch(error => console.error('Error fetching survey data:', error));
}

fetchSurveyData();
