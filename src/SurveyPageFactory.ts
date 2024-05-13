import { SurveyPage } from "./SurveyPage";
import { GreenCheck } from '../src/icons';

export class SurveyPageFactory {

    static createLandingPage(title: string, description: string) {
        let landingPage = new SurveyPage('landing-page');
        landingPage.setTitle(title);
        landingPage.setContent(description);
        return landingPage;
    }

    static createErrorPage(errorType: 'empty' | 'invalid') {
        const errorIcon = errorType === 'empty' ? "❗" : "⚠️";
        const errorMessage = errorType === 'empty'
            ? "The survey configuration is missing. <br>Please ensure it is provided."
            : "The survey configuration is invalid. <br>Please check the format and try again.";

        let errorPage = new SurveyPage('error-page');
        errorPage.setTitle("error page title");
        errorPage.setContent(`
        <div id="error-message" class="error-container">
            <div class="error-icon">${errorIcon}</div>
            <div class="text error-title">Error!</div>
            <div class="text">Oh no, something went wrong.</div>
            <div class="text">${errorMessage}</div>
            <button onclick="location.reload()">
                <div class="button-label">Try Again</div>
            </button>
        </div>
    `);
        return errorPage;
    }


    static createThankYouPage() {
        let thankYouPage = new SurveyPage('thank-you-page');
        thankYouPage.setTitle("Thank you for your input");
        thankYouPage.setContent(
            `<div style="text-align: center; margin: 20px; font-size: 1.3rem;">`
            + GreenCheck +
            `<div>You can safely close this page.</div>
            <p style="text-align: center; margin: 20px; font-size: 1.1rem;">
            If you wish to discover how ServiceNow Creator Workflows 
            can streamline your business processes and enhance automation,  
            please follow this link to learn more about 
            <a href=http://URL_TO_SERVICE_NOW_CREATOR_WORKFLOWS>ServiceNow Creator Workflows</a>.</p>`);

        return thankYouPage;
    }
}