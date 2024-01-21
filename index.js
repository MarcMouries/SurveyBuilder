function fetchSurveyData() {
    fetch('survey-data.json')
        .then(response => response.json())
        .then(json => window.SurveyBuilder.create(json))
        .catch(error => console.error('Error fetching survey data:', error));
}

fetchSurveyData();
