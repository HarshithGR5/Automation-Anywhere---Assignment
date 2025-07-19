const LoginPage = require('../pages/LoginPage');
const HomePage = require('../pages/HomePage');
const TaskBotPage = require('../pages/TaskBotPage');
const LearningInstancePage = require('../pages/learningInstancePage');
const CommonUtils = require('./utilities/CommonUtils');
const Config = require('../config/config.properties');
/**
 * Custom command to login with credentials
 * @param {string} username - Username
 * @param {string} password - Password
 */
Cypress.Commands.add('login', (username, password) => {
  cy.visit(Config.urls.login || '/');
  cy.get(
    'input[type=email]:visible, input[type=text]:visible, input[name="username"]:visible, input[placeholder*="email"]:visible, input[placeholder*="Username"]:visible, input[placeholder*="login"]:visible',
    { timeout: 15000 })
    .should('be.visible')
    .clear()
    .type(username);

  cy.get(
    'input[type=password]:visible, input[name="password"]:visible, input[placeholder*="Password"]:visible',
    { timeout: 15000 })
    .should('be.visible')
    .clear()
    .type(password);

  cy.get('button[type=submit]:visible, button:contains("Log in"):visible, button:contains("Login"):visible', { timeout: 10000 })
    .first()
    .should('be.visible')
    .click();

  cy.url({ timeout: 20000 }).should('include', 'home');
});

/**
 * Custom command to logout
 */
Cypress.Commands.add('logout', () => {
  CommonUtils.logTestStep('Logging out');
  
  const homePage = new HomePage();
  homePage.logout();
  
  CommonUtils.logTestStep('Logout successful');
});

/**
 * Custom command to create a task bot with message box
 * @param {object} botData - Bot configuration data
 */
Cypress.Commands.add('createTaskBot', (botData) => {
  const testData = botData || CommonUtils.generateBotTestData();
  CommonUtils.logTestStep(`Creating task bot: ${testData.name}`);
  
  const homePage = new HomePage();
  const taskBotPage = new TaskBotPage();
  
  // Navigate to create bot
  homePage.visit()
    .verifyHomePageLoaded()
    .clickCreateBot();
  
  // Fill bot details and create
  taskBotPage.fillTaskBotDetails(testData.name, testData.description, testData.folder)
    .clickCreateAndEdit()
    .waitForBotEditorLoad();
  
  // Add message box action
  taskBotPage.dragMessageBoxToCanvas()
    .configureMessageBox(testData.messageText, testData.windowTitle, testData.scrollbarLines)
    .saveBot()
    .verifyBotCreated()
    .verifyMessageBoxAdded();
  
  CommonUtils.logTestStep(`Task bot created successfully: ${testData.name}`);
  
  // Store bot data for later use
  cy.wrap(testData).as('createdBotData');
});

/**
 * Custom command to create a learning instance
 * @param {object} instanceData - Learning instance configuration data
 */
Cypress.Commands.add('createLearningInstance', (instanceData) => {
  const testData = instanceData || CommonUtils.generateLearningInstanceTestData();
  CommonUtils.logTestStep(`Creating learning instance: ${testData.name}`);
  
  const homePage = new HomePage();
  const learningInstancePage = new LearningInstancePage();
  
  // Navigate to learning instances
  homePage.visit()
    .verifyHomePageLoaded()
    .navigateToLearningInstances();
  
  // Create learning instance
  learningInstancePage.waitForPageLoad()
    .clickCreateLearningInstance()
    .createLearningInstanceWithFields(testData)
    .verifyLearningInstanceCreated();
  
  CommonUtils.logTestStep(`Learning instance created successfully: ${testData.name}`);
  
  // Store instance data for later use
  cy.wrap(testData).as('createdInstanceData');
});