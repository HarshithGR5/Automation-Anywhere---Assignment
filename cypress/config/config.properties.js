class Config {
  static get baseUrl() {
    return 'https://community.cloud.automationanywhere.digital';
  }

  static get timeout() {
    return {
      default: 10000,
      long: 30000,
      short: 5000
    };
  }

  static get credentials() {
    return {
      username: Cypress.env('username') || 'eng22am0021@dsu.edu.in',
      password: Cypress.env('password') || 'Harshith@123'
    };
  }

  static get urls() {
    return {
      login: '/#/login?next=/home',
      home: '/#/home',
      taskBot: '/#/bots/repository/private/taskbots',
      learningInstance: '/#/modules/cognitive/iqbot/pages/learning-instances'
    };
  }

  static get selectors() {
    return {
      loadingSpinner: '.loading-spinner',
      confirmButton: '[data-testid="confirm-button"]',
      cancelButton: '[data-testid="cancel-button"]',
      textInput: 'input[type="text"]',
      passwordInput: 'input[type="password"]',
      dropdown: 'select',
      checkbox: 'input[type="checkbox"]',
      primaryButton: '.btn-primary',
      secondaryButton: '.btn-secondary',
      submitButton: '[type="submit"]'
    };
  }
}

module.exports = Config;
