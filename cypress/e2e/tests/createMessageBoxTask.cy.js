const LoginPage = require('../../pages/LoginPage');
const HomePage = require('../../pages/HomePage');
const TaskBotPage = require('../../pages/TaskBotPage');
const Config = require('../../config/config.properties');

describe('Create Message Box Task Bot', () => {
  let loginPage, homePage, taskBotPage, testData;

  before(() => {
    loginPage = new LoginPage();
    homePage = new HomePage();
    taskBotPage = new TaskBotPage();
    cy.fixture('testData').then((data) => {
      testData = data;
    });
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login(testData.credentials.username, testData.credentials.password);
  });

  afterEach(() => {
    cy.screenshot({ capture: 'runner' });
  });

  after(() => {
    cy.logout();
  });

  it('should create a bot with a Message box action', () => {
    // Go to create a bot
    homePage.verifyHomePageLoaded().clickCreateBot();

    // Fill TaskBot details and create
    taskBotPage
      .fillTaskBotDetails(
        testData.taskBot.name,
        testData.taskBot.description,
        testData.taskBot.folder
      )
      .clickCreateAndEdit();

    // Add message box to the flow
    taskBotPage.addMessageBoxToFlow();

    // Configure the message box in the right panel
    taskBotPage.configureMessageBox(testData.taskBot.messageText);

    // Save the bot
    taskBotPage.saveBot();

    // Optional: Validate presence in UI if needed
    cy.get('body').should('contain', testData.taskBot.messageText);
  });
});
