import './commands';
import './utilities/CommonUtils';
// Configure Cypress behavior
Cypress.on('uncaught:exception', (err, runnable) => {
  console.log('Uncaught exception:', err.message);
 
  if (err.message.includes('ResizeObserver loop limit exceeded') ||
      err.message.includes('Non-Error promise rejection captured') ||
      err.message.includes('Script error') ||
      err.message.includes('Network request failed')) {
    return false;
  }
  return true;
});

// Global configuration for all tests
beforeEach(() => {
  // Set default viewport
  cy.viewport(1920, 1080);
  
  // Set default timeout for commands
  Cypress.config('defaultCommandTimeout', 10000);
  Cypress.config('requestTimeout', 10000);
  Cypress.config('responseTimeout', 10000);
  
  // Intercept common API calls to handle them gracefully
  cy.intercept('GET', '**/api/**', { statusCode: 200 }).as('apiCall');
  cy.intercept('POST', '**/api/**', { statusCode: 200 }).as('apiPost');
  cy.intercept('PUT', '**/api/**', { statusCode: 200 }).as('apiPut');
  cy.intercept('DELETE', '**/api/**', { statusCode: 200 }).as('apiDelete');
  
  // Set up session storage if needed
  cy.window().then((win) => {
    // Clear any existing session data
    win.sessionStorage.clear();
    
    // Set any default session data if needed
    win.sessionStorage.setItem('cypress-test', 'true');
  });
});

// Global cleanup after each test
afterEach(() => {
  // Clear cookies and local storage after each test
  cy.clearCookies();
  cy.clearLocalStorage();
  
  // Take screenshot on failure
  cy.screenshot({ capture: 'runner', onlyOnFailure: true });
  
  // Log test completion
  cy.task('log', `Test completed: ${Cypress.currentTest.title}`);
});

// Handle test failures
Cypress.on('fail', (err, runnable) => {
  // Log the error details
  console.error('Test failed:', err.message);
  console.error('Test title:', runnable.title);
  
  // Take a screenshot on failure
  cy.screenshot(`FAILED-${runnable.title}`, { capture: 'runner' });  
  throw err; // Re-throw the error to maintain Cypress's failure behavior
});
// Custom configuration for specific environments
if (Cypress.env('environment') === 'production') {
  // Production-specific settings
  Cypress.config('defaultCommandTimeout', 15000);
  Cypress.config('requestTimeout', 15000);
} else if (Cypress.env('environment') === 'staging') {
  // Staging-specific settings
  Cypress.config('defaultCommandTimeout', 12000);
  Cypress.config('requestTimeout', 12000);
}

// Add custom Cypress commands for better debugging
Cypress.Commands.add('logStep', (message) => {
  cy.task('log', `Step: ${message}`);
  cy.log(message);
});

// Add support for custom assertions
chai.use((chai, utils) => {
  // Custom assertion for checking if element is visible and enabled
  chai.Assertion.addMethod('visibleAndEnabled', function () {
    const obj = this._obj;
    
    new chai.Assertion(obj).to.be.visible;
    new chai.Assertion(obj).to.be.enabled;
  });
  
  // Custom assertion for checking if element contains text (case insensitive)
  chai.Assertion.addMethod('containTextIgnoreCase', function (text) {
    const obj = this._obj;
    
    obj.should('contain.text', text, { matchCase: false });
  });
});

// Add support for mobile testing
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667); // iPhone 6/7/8 size
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024); // iPad size
});

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1920, 1080); // Desktop size
});

// Add support for waiting for specific conditions
Cypress.Commands.add('waitForLoad', (timeout = 10000) => {
  cy.get('body', { timeout }).should('be.visible');
  cy.get('.loading, .spinner', { timeout: 5000 }).should('not.exist');
});

// Add support for retry mechanism
Cypress.Commands.add('retryableClick', (selector, options = {}) => {
  const maxRetries = options.maxRetries || 3;
  const delay = options.delay || 1000;
  
  const clickWithRetry = (retryCount = 0) => {
    return cy.get(selector).click().then(() => {
      // Verify the click was successful by checking some condition
      if (options.verify) {
        return cy.get(options.verify).should('be.visible');
      }
    }).catch((error) => {
      if (retryCount < maxRetries) {
        cy.wait(delay);
        return clickWithRetry(retryCount + 1);
      }
      throw error;
    });
  };
  
  return clickWithRetry();
});

// Add support for environment-specific URLs
Cypress.Commands.add('visitApp', (path = '') => {
  const baseUrl = Cypress.env('baseUrl') || Cypress.config('baseUrl');
  const fullUrl = `${baseUrl}${path}`;
  
  cy.visit(fullUrl);
  cy.waitForLoad();
});

// Add support for API testing
Cypress.Commands.add('apiRequest', (method, url, body = null, headers = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  return cy.request({
    method,
    url,
    body,
    headers: defaultHeaders,
    failOnStatusCode: false
  });
});

// Add support for file operations
Cypress.Commands.add('uploadFile', (selector, filePath) => {
  return cy.get(selector).selectFile(filePath);
});

// Add support for drag and drop operations
Cypress.Commands.add('dragAndDrop', (dragSelector, dropSelector) => {
  return cy.get(dragSelector).trigger('mousedown', { button: 0 })
    .then(() => {
      return cy.get(dropSelector).trigger('mousemove').trigger('mouseup');
    });
});

// Add support for keyboard shortcuts
Cypress.Commands.add('pressKeyboardShortcut', (shortcut) => {
  const keys = shortcut.split('+');
  const modifiers = keys.slice(0, -1);
  const key = keys[keys.length - 1];
  
  const keyOptions = {};
  if (modifiers.includes('ctrl')) keyOptions.ctrlKey = true;
  if (modifiers.includes('alt')) keyOptions.altKey = true;
  if (modifiers.includes('shift')) keyOptions.shiftKey = true;
  if (modifiers.includes('meta')) keyOptions.metaKey = true;
  
  return cy.get('body').type(`{${key}}`, keyOptions);
});

// Add support for waiting for animations
Cypress.Commands.add('waitForAnimation', (selector, timeout = 5000) => {
  return cy.get(selector, { timeout }).should('not.have.class', 'animating');
});

// Add support for custom wait conditions
Cypress.Commands.add('waitUntil', (conditionFn, options = {}) => {
  const timeout = options.timeout || 10000;
  const interval = options.interval || 100;
  
  return cy.wrap(null).should(() => {
    expect(conditionFn()).to.be.true;
  });
});