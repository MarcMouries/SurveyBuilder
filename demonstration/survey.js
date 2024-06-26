document.addEventListener('DOMContentLoaded', () => {
    function fetchSurveyData() {
        const urlParams = new URLSearchParams(window.location.search);
        const testType = urlParams.get('test');

        let configFile = 'survey-data.json'; // Default survey configuration
        if (testType === 'one-question') {
            configFile = 'survey-one-question.json';
        } else if (testType === 'empty') {
            // Empty config
            new SurveyBuilder("", 'survey-container').onComplete(printResponses); 
            return;
        } else if (testType === 'all-qestion') {
            configFile = 'survey-data.json';
        }

        fetch(configFile)
            .then(response => response.json())
            .then(json => {
                const survey = new SurveyBuilder(json, 'survey-container');
                survey.onComplete(printResponses);
            })
            .catch(error => console.error('Error fetching survey data:', error));
    }

    fetchSurveyData();

    function printResponses(responses) {
        console.log("Survey Results:", JSON.stringify(responses, null, 2));
    }
});
