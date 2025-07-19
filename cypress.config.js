const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://community.cloud.automationanywhere.digital',
    viewportWidth: 1920,
    viewportHeight: 1080,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    video: true,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    experimentalStudio: true,
    
    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Reporter configuration for Mocha
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: true,
      json: true,
      timestamp: 'mmddyyyy_HHMMss'
    },
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
      log(message) {
        console.log(message);
        return null;
      }
      });
    },
    
    // Spec patterns
    specPattern: 'cypress/e2e/tests/**/*.cy.{js,jsx,ts,tsx}',
    
    // Environment variables
    env: {
      username: 'eng22am0021@dsu.edu.in',
      password: 'Harshith@123'
    }
  }
});

