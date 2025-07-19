// cypress/support/utilities/CommonUtils.js
const Config = require('../../config/config.properties');

class CommonUtils {
  /**
   * Generate a random string with specified length
   * @param {number} length - Length of the string
   * @param {string} charset - Character set to use
   * @returns {string} Random string
   */
  static generateRandomString(length = 8, charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Generate a unique timestamp-based identifier
   * @param {string} prefix - Prefix for the identifier
   * @returns {string} Unique identifier
   */
  static generateUniqueId(prefix = 'test') {
    const timestamp = Date.now();
    const randomStr = this.generateRandomString(4);
    return `${prefix}_${timestamp}_${randomStr}`;
  }

  /**
   * Generate test data for bot creation
   * @param {string} baseName - Base name for the bot
   * @returns {object} Bot test data
   */
  static generateBotTestData(baseName = 'TestBot') {
    return {
      name: this.generateUniqueId(baseName),
      description: `Automated test bot created at ${new Date().toISOString()}`,
      folder: '\\Bots',
      messageText: 'Test Message from Automation Framework',
      windowTitle: 'Automation Test Window',
      scrollbarLines: '30'
    };
  }

  /**
   * Generate test data for learning instance creation
   * @param {string} baseName - Base name for the learning instance
   * @returns {object} Learning instance test data
   */
  static generateLearningInstanceTestData(baseName = 'TestLearningInstance') {
    return {
      name: this.generateUniqueId(baseName),
      description: `Test learning instance created at ${new Date().toISOString()}`,
      documentType: 'User-defined',
      language: 'English',
      locale: 'English (United States)',
      provider: 'Automation Anywhere (User-defined)',
      improveAccuracy: true,
      fields: [
        {
          fieldName: 'invoice',
          fieldLabel: 'invoice',
          dataType: 'Text',
          confidence: 80,
          required: true,
          extractPattern: false
        },
        {
          fieldName: 'amount',
          fieldLabel: 'amount',
          dataType: 'Number',
          confidence: 85,
          required: true,
          extractPattern: false
        }
      ]
    };
  }

  /**
   * Wait for element to be visible with custom timeout
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Cypress.Chainable} Cypress element
   */
  static waitForElement(selector, timeout = Config.timeout.medium) {
    return cy.get(selector, { timeout }).should('be.visible');
  }

  /**
   * Wait for element to disappear
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Cypress.Chainable} Cypress element
   */
  static waitForElementToDisappear(selector, timeout = Config.timeout.medium) {
    return cy.get(selector, { timeout }).should('not.exist');
  }

  /**
   * Type text with delay for better stability
   * @param {string} selector - CSS selector
   * @param {string} text - Text to type
   * @param {number} delay - Delay between keystrokes
   * @returns {Cypress.Chainable} Cypress element
   */
  static typeWithDelay(selector, text, delay = 100) {
    return cy.get(selector)
      .should('be.visible')
      .clear()
      .type(text, { delay });
  }

  /**
   * Click element with retry mechanism
   * @param {string} selector - CSS selector
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Cypress.Chainable} Cypress element
   */
  static clickWithRetry(selector, maxRetries = 3) {
    let attempts = 0;
    
    const clickElement = () => {
      attempts++;
      return cy.get(selector).then($el => {
        if ($el.is(':visible') && $el.is(':enabled')) {
          cy.wrap($el).click();
        } else if (attempts < maxRetries) {
          cy.wait(1000);
          clickElement();
        } else {
          throw new Error(`Element ${selector} is not clickable after ${maxRetries} attempts`);
        }
      });
    };
    
    return clickElement();
  }

  /**
   * Select dropdown option with verification
   * @param {string} selector - CSS selector for dropdown
   * @param {string} option - Option to select
   * @returns {Cypress.Chainable} Cypress element
   */
  static selectDropdownOption(selector, option) {
    return cy.get(selector)
      .should('be.visible')
      .select(option)
      .should('have.value', option);
  }

  /**
   * Check checkbox with verification
   * @param {string} selector - CSS selector for checkbox
   * @returns {Cypress.Chainable} Cypress element
   */
  static checkCheckbox(selector) {
    return cy.get(selector)
      .should('be.visible')
      .check()
      .should('be.checked');
  }

  /**
   * Uncheck checkbox with verification
   * @param {string} selector - CSS selector for checkbox
   * @returns {Cypress.Chainable} Cypress element
   */
  static uncheckCheckbox(selector) {
    return cy.get(selector)
      .should('be.visible')
      .uncheck()
      .should('not.be.checked');
  }

  /**
   * Handle drag and drop operations
   * @param {string} sourceSelector - Source element selector
   * @param {string} targetSelector - Target element selector
   * @returns {Cypress.Chainable} Cypress element
   */
  static dragAndDrop(sourceSelector, targetSelector) {
    return cy.get(sourceSelector).then($source => {
      cy.get(targetSelector).then($target => {
        const sourceRect = $source[0].getBoundingClientRect();
        const targetRect = $target[0].getBoundingClientRect();
        
        cy.get(sourceSelector)
          .trigger('mousedown', { button: 0 })
          .wait(100);
        
        cy.get(targetSelector)
          .trigger('mousemove', {
            clientX: targetRect.left + targetRect.width / 2,
            clientY: targetRect.top + targetRect.height / 2
          })
          .trigger('mouseup');
      });
    });
  }

  /**
   * Take screenshot with timestamp
   * @param {string} name - Screenshot name
   * @returns {Cypress.Chainable} Cypress screenshot
   */
  static takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return cy.screenshot(`${name}_${timestamp}`);
  }

  /**
   * Verify URL contains expected path
   * @param {string} expectedPath - Expected path in URL
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Cypress.Chainable} Cypress URL assertion
   */
  static verifyUrlContains(expectedPath, timeout = Config.timeout.medium) {
    return cy.url({ timeout }).should('include', expectedPath);
  }

  /**
   * Verify element text contains expected text
   * @param {string} selector - CSS selector
   * @param {string} expectedText - Expected text
   * @returns {Cypress.Chainable} Cypress element
   */
  static verifyElementContainsText(selector, expectedText) {
    return cy.get(selector)
      .should('be.visible')
      .and('contain.text', expectedText);
  }

  /**
   * Verify element attribute value
   * @param {string} selector - CSS selector
   * @param {string} attribute - Attribute name
   * @param {string} expectedValue - Expected attribute value
   * @returns {Cypress.Chainable} Cypress element
   */
  static verifyElementAttribute(selector, attribute, expectedValue) {
    return cy.get(selector)
      .should('be.visible')
      .and('have.attr', attribute, expectedValue);
  }

  /**
   * Wait for page to load completely
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Cypress.Chainable} Cypress window
   */
  static waitForPageLoad(timeout = Config.timeout.long) {
    return cy.window({ timeout }).should('have.property', 'document');
  }

  /**
   * Clear all cookies and local storage
   * @returns {Cypress.Chainable} Cypress clear operations
   */
  static clearBrowserData() {
    cy.clearCookies();
    cy.clearLocalStorage();
    return cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  }

  /**
   * Format date for display
   * @param {Date} date - Date object
   * @param {string} format - Format string
   * @returns {string} Formatted date string
   */
  static formatDate(date = new Date(), format = 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * Generate random email address
   * @param {string} domain - Email domain
   * @returns {string} Random email address
   */
  static generateRandomEmail(domain = 'testautomation.com') {
    const randomString = this.generateRandomString(8);
    return `test_${randomString}@${domain}`;
  }

  /**
   * Generate random phone number
   * @param {string} format - Phone number format
   * @returns {string} Random phone number
   */
  static generateRandomPhone(format = '###-###-####') {
    let phone = format;
    for (let i = 0; i < 10; i++) {
      phone = phone.replace('#', Math.floor(Math.random() * 10));
    }
    return phone;
  }

  /**
   * Log test step with timestamp
   * @param {string} step - Test step description
   * @param {string} level - Log level (info, warn, error)
   */
  static logTestStep(step, level = 'info') {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ${step}`;
    
    switch (level) {
      case 'warn':
        console.warn(message);
        break;
      case 'error':
        console.error(message);
        break;
      default:
        console.log(message);
    }
  }

  /**
   * Generate test report data
   * @param {string} testName - Test name
   * @param {string} status - Test status
   * @param {number} duration - Test duration in milliseconds
   * @returns {object} Test report data
   */
  static generateTestReport(testName, status, duration) {
    return {
      testName,
      status,
      duration,
      timestamp: new Date().toISOString(),
      environment: Cypress.config('baseUrl'),
      browser: Cypress.browser.name,
      version: Cypress.version
    };
  }

  /**
   * Validate email format
   * @param {string} email - Email address
   * @returns {boolean} True if valid email format
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number
   * @returns {boolean} True if valid phone format
   */
  static validatePhone(phone) {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Get current timestamp as string
   * @returns {string} Current timestamp
   */
  static getCurrentTimestamp() {
    return Date.now().toString();
  }

  /**
   * Wait for specified time
   * @param {number} milliseconds - Wait time in milliseconds
   * @returns {Cypress.Chainable} Cypress wait
   */
  static wait(milliseconds) {
    return cy.wait(milliseconds);
  }

  /**
   * Reload page and wait for load
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Cypress.Chainable} Cypress reload
   */
  static reloadPage(timeout = Config.timeout.medium) {
    return cy.reload().then(() => {
      cy.get('body', { timeout }).should('be.visible');
    });
  }
}

module.exports = CommonUtils;