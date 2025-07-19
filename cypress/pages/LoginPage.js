const Config = require('../config/config.properties');

class LoginPage {
  visit() {
    cy.visit(Config.urls.login || '/');
    cy.get('body', { timeout: 15000 }).should('be.visible');
    return this;
  }

  enterUsername(username) {
    // Try the most common selectors, always using :visible
    const selectors = [
      'input[type="email"]:visible',
      'input[type="text"]:visible',
      'input[name="username"]:visible',
      'input[placeholder*="email"]:visible',
      'input[placeholder*="Username"]:visible',
      '.username-input:visible',
      '#username:visible',
      '[data-testid="username"]:visible'
    ];

    let attempted = false;
    selectors.forEach(selector => {
      cy.get('body').then($body => {
        if (!attempted && $body.find(selector).length > 0) {
          attempted = true;
          cy.get(selector).first().clear().type(username);
          cy.log(`Username entered using selector: ${selector}`);
        }
      });
    });
    return this;
  }

  enterPassword(password) {
    const selectors = [
      'input[type="password"]:visible',
      'input[name="password"]:visible',
      '.password-input:visible',
      '#password:visible',
      '[data-testid="password"]:visible'
    ];
    let attempted = false;
    selectors.forEach(selector => {
      cy.get('body').then($body => {
        if (!attempted && $body.find(selector).length > 0) {
          attempted = true;
          cy.get(selector).first().clear().type(password);
          cy.log(`Password entered using selector: ${selector}`);
        }
      });
    });
    return this;
  }

  clickLoginButton() {
    const selectors = [
      'button[type="submit"]:visible',
      '.btn-primary:visible',
      '.login-btn:visible',
      'button:contains("Log in"):visible',
      'button:contains("Login"):visible',
      '[data-testid="login-button"]:visible'
    ];
    let attempted = false;
    selectors.forEach(selector => {
      cy.get('body').then($body => {
        if (!attempted && $body.find(selector).length > 0) {
          attempted = true;
          cy.get(selector).first().click();
          cy.log(`Login button clicked using selector: ${selector}`);
        }
      });
    });
    return this;
  }

  login(username, password) {
    this.visit();
    this.enterUsername(username);
    this.enterPassword(password);
    this.clickLoginButton();
    cy.url({ timeout: 20000 }).should('include', 'home');
    cy.log('Login successful');
    return this;
  }
}

module.exports = LoginPage;
