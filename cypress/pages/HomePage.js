const Config = require('../config/config.properties');

class HomePage {
  constructor() {
    this.selectors = {
      // Navigation menu
      exploreMenu: '[data-testid="explore-menu"], a[href*="explore"]',
      homeMenu: '[data-testid="home-menu"], a[href*="home"]',
      automationMenu: '[data-testid="automation-menu"], a[href*="automation"]',
      activityMenu: '[data-testid="activity-menu"], a[href*="activity"]',
      manageMenu: '[data-testid="manage-menu"], a[href*="manage"]',
      administrationMenu: '[data-testid="administration-menu"], a[href*="administration"]',

      // Corrected welcome message selector
      welcomeMessage: '.homepage-welcome-greeting',

      // Bot creation
      createBotButton: 'button:contains("Create a bot"), .create-bot-btn',
      createBotButtonInRPA: 'button:contains("Create a bot")',

      // RPA Section
      rpaSection: '.rpa-section, [data-testid="rpa-section"]',

      // Learning Instances navigation
      learningInstancesLink: 'a[href*="learning-instances"], a:contains("Learning Instances")',

      // User profile
      userProfile: '.user-profile, .profile-dropdown',
      logoutButton: 'button:contains("Logout"), a:contains("Logout")',

      // Dashboard elements
      myAutomations: '.my-automations, [data-testid="my-automations"]',
      pathfinderProgram: '.pathfinder-program',
      universitySection: '.university-section'
    };
  }

  visit() {
    cy.visit(Config.urls.home);
    this.waitForPageLoad();
    return this;
  }

  waitForPageLoad() {
    cy.get('body', { timeout: Config.timeout.long }).should('contain.text', 'HELLO, HUMAN');
    return this;
  }

  verifyHomePageLoaded() {
    cy.url().should('include', 'home');

    // Updated to match actual div and allow for ™ character
    cy.get(this.selectors.welcomeMessage)
      .should('be.visible')
      .invoke('text')
      .should('match', /HELLO,\s*HUMAN/i); // regex allows extra symbols like ™

    cy.get('body').invoke('text').should('match', /automation anywhere community edition/i);
    return this;
  }

  clickCreateBot() {
    cy.get('body').then($body => {
      if ($body.find(this.selectors.createBotButton).length > 0) {
        cy.get(this.selectors.createBotButton).first().click();
      } else if ($body.find(this.selectors.createBotButtonInRPA).length > 0) {
        cy.get(this.selectors.createBotButtonInRPA).first().click();
      } else {
        this.navigateToAutomation();
        cy.get(this.selectors.createBotButton).first().click();
      }
    });
    return this;
  }

  navigateToAutomation() {
    cy.get(this.selectors.automationMenu).should('be.visible').click();
    cy.url().should('include', 'automation');
    return this;
  }

  navigateToLearningInstances() {
    cy.get('body').then($body => {
      if ($body.find(this.selectors.learningInstancesLink).length > 0) {
        cy.get(this.selectors.learningInstancesLink).first().click();
      } else {
        cy.visit(Config.urls.learningInstance);
      }
    });
    cy.url().should('include', 'learning-instances');
    return this;
  }

  navigateToManage() {
    cy.get(this.selectors.manageMenu).should('be.visible').click();
    return this;
  }

logout() {
  cy.get('body').then($body => {
    if ($body.find(this.selectors.userProfile).length > 0) {
      cy.get(this.selectors.userProfile).first().click();
      if ($body.find(this.selectors.logoutButton).length > 0) {
        cy.get(this.selectors.logoutButton).first().click();
        cy.url().should('include', 'login');
      } else {
        cy.log('Logout button not found!');
      }
    } else {
      cy.log('User profile not found: Possibly already logged out, redirected, or not on home page.');
    }
  });
  return this;
}



  verifyDashboardElements() {
    cy.get(this.selectors.myAutomations).should('be.visible');
    cy.get(this.selectors.pathfinderProgram).should('be.visible');
    cy.get(this.selectors.universitySection).should('be.visible');
    return this;
  }
}

module.exports = HomePage;
