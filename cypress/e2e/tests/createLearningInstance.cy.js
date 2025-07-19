const LoginPage = require('../../pages/LoginPage');
const HomePage = require('../../pages/HomePage');
const LearningInstancePage = require('../../pages/learningInstancePage');
const Config = require('../../config/config.properties');

describe('Create Learning Instance Test Suite', () => {
  let loginPage;
  let homePage;
  let learningInstancePage;
  let testData;

  before(() => {
    // Initialize page objects
    loginPage = new LoginPage();
    homePage = new HomePage();
    learningInstancePage = new LearningInstancePage();
    
    // Load test data
    cy.fixture('testData').then((data) => {
      testData = data;
    });
  });

  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Login before each test
    cy.login(testData.credentials.username, testData.credentials.password);
  });

  afterEach(() => {
    // Take screenshot on failure
    cy.screenshot({ capture: 'runner' });
  });

  after(() => {
    // Logout after all tests
    cy.logout();
  });

  it('Should successfully create a learning instance with user-defined fields', () => {
    // Navigate to Learning Instances page
    homePage
      .verifyHomePageLoaded()
      .navigateToLearningInstances();

    // Verify Learning Instances page is loaded
    learningInstancePage
      .waitForPageLoad()
      .clickCreateLearningInstance();

    // Fill basic details
    learningInstancePage
      .fillBasicDetails(
        testData.learningInstance.name,
        testData.learningInstance.description
      )
      .selectDocumentType(testData.learningInstance.documentType)
      .selectLanguage(testData.learningInstance.language)
      .selectLocale(testData.learningInstance.locale)
      .selectProvider(testData.learningInstance.provider);

    // Configure accuracy improvement if enabled
    if (testData.learningInstance.improveAccuracy) {
      learningInstancePage.enableAccuracyImprovement();
    }

    // Navigate to next step
    learningInstancePage.clickNext();

    // Configure form fields
    learningInstancePage.navigateToFormFields();

    // Add user-defined fields
    testData.learningInstance.fields.forEach((field, index) => {
      learningInstancePage
        .addField()
        .configureField(
          field.fieldName,
          field.fieldLabel,
          field.dataType,
          field.confidence,
          field.required,
          field.extractPattern
        );
      
      // Verify field is added
      learningInstancePage.verifyFieldAdded(field.fieldName);
    });

    // Submit the learning instance
    learningInstancePage.submitLearningInstance();

    // Verify learning instance creation
    learningInstancePage
      .verifyLearningInstanceCreated()
      .verifySuccessMessage();

    // Assert the learning instance appears in the list
    cy.get('.learning-instances-list')
      .should('contain', testData.learningInstance.name);

    // Verify the instance status
    cy.get('.instance-status')
      .should('be.visible')
      .should('contain', 'Active');
  });

  it('Should validate required fields when creating learning instance', () => {
    // Navigate to Learning Instances page
    homePage
      .verifyHomePageLoaded()
      .navigateToLearningInstances();

    // Click create without filling required fields
    learningInstancePage
      .waitForPageLoad()
      .clickCreateLearningInstance();

    // Try to submit without filling required fields
    learningInstancePage.clickNext();

    // Verify validation errors
    cy.get('.error-message, .alert-danger')
      .should('be.visible')
      .should('contain', 'required');

    // Verify name field validation
    cy.get('input[name="name"]')
      .should('have.class', 'error')
      .or('have.attr', 'aria-invalid', 'true');
  });

  it('Should allow canceling learning instance creation', () => {
    // Navigate to Learning Instances page
    homePage
      .verifyHomePageLoaded()
      .navigateToLearningInstances();

    // Start creating learning instance
    learningInstancePage
      .waitForPageLoad()
      .clickCreateLearningInstance();

    // Fill some data
    learningInstancePage.fillBasicDetails('Test Cancel Instance');

    // Cancel the creation
    learningInstancePage.clickCancel();

    // Verify we're back to the main page
    learningInstancePage.waitForPageLoad();
    
    // Verify the instance was not created
    cy.get('.learning-instances-list')
      .should('not.contain', 'Test Cancel Instance');
  });

  it('Should handle different document types and languages', () => {
    const documentTypes = ['User-defined', 'Invoice', 'Purchase Order'];
    const languages = ['English', 'Spanish', 'French'];

    documentTypes.forEach((docType) => {
      languages.forEach((language) => {
        // Navigate to Learning Instances page
        homePage
          .verifyHomePageLoaded()
          .navigateToLearningInstances();

        // Create learning instance with different combinations
        learningInstancePage
          .waitForPageLoad()
          .clickCreateLearningInstance()
          .fillBasicDetails(`Test_${docType}_${language}`)
          .selectDocumentType(docType)
          .selectLanguage(language);

        // Verify the selections are applied
        cy.get('select[name="documentType"]')
          .should('have.value', docType);
        
        cy.get('select[name="language"]')
          .should('have.value', language);

        // Cancel to avoid creating multiple instances
        learningInstancePage.clickCancel();
      });
    });
  });

  it('Should verify field configuration options', () => {
    // Navigate to Learning Instances page
    homePage
      .verifyHomePageLoaded()
      .navigateToLearningInstances();

    // Create learning instance
    learningInstancePage
      .waitForPageLoad()
      .clickCreateLearningInstance()
      .fillBasicDetails('Field Configuration Test')
      .selectDocumentType('User-defined')
      .clickNext();

    // Navigate to form fields
    learningInstancePage.navigateToFormFields();

    // Add a field and verify all configuration options
    learningInstancePage.addField();

    // Verify field configuration options are available
    cy.get('input[name="fieldName"]').should('be.visible');
    cy.get('input[name="fieldLabel"]').should('be.visible');
    cy.get('select[name="dataType"]').should('be.visible');
    cy.get('input[name="confidence"]').should('be.visible');
    cy.get('input[name="required"]').should('be.visible');
    cy.get('input[name="extractPattern"]').should('be.visible');

    // Verify data type options
    cy.get('select[name="dataType"]').within(() => {
      cy.get('option').should('contain', 'Text');
      cy.get('option').should('contain', 'Number');
      cy.get('option').should('contain', 'Date');
    });

    // Cancel the creation
    learningInstancePage.clickCancel();
  });
});