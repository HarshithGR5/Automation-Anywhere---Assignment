const Config = require('../config/config.properties');

class LearningInstancePage {
  constructor() {
    this.selectors = {
      // Main page elements
      pageTitle: 'h1:contains("Learning Instances"), .page-title',
      createLearningInstanceButton: 'button:contains("Create Learning Instance"), .create-learning-instance-btn',
      learningInstancesList: '.learning-instances-list, .instances-table',
      
      // Create Learning Instance Dialog
      createDialog: '.modal, .dialog, [role="dialog"]',
      nameInput: 'input[name="name"], input[placeholder*="Name"]',
      descriptionInput: 'textarea[name="description"], textarea[placeholder*="Description"]',
      
      // Dropdowns
      documentTypeDropdown: 'select[name="documentType"], .document-type-select',
      languageDropdown: 'select[name="language"], .language-select',
      localeDropdown: 'select[name="locale"], .locale-select',
      providerDropdown: 'select[name="provider"], .provider-select',
      
      // Checkboxes
      improveAccuracyCheckbox: 'input[name="improveAccuracy"], input[type="checkbox"]',
      
      // Navigation buttons
      nextButton: 'button:contains("Next"), .next-btn',
      cancelButton: 'button:contains("Cancel"), .cancel-btn',
      submitButton: 'button:contains("Submit"), .submit-btn',
      
      // Field Configuration
      formFieldsTab: '.form-fields-tab, [data-tab="form-fields"]',
      tableFieldsTab: '.table-fields-tab, [data-tab="table-fields"]',
      fieldPropertiesTab: '.field-properties-tab, [data-tab="field-properties"]',
      fieldRulesTab: '.field-rules-tab, [data-tab="field-rules"]',
      documentRulesTab: '.document-rules-tab, [data-tab="document-rules"]',
      
      // Field configuration elements
      fieldNameInput: 'input[name="fieldName"], input[placeholder*="Field name"]',
      fieldLabelInput: 'input[name="fieldLabel"], input[placeholder*="Field label"]',
      dataTypeDropdown: 'select[name="dataType"], .data-type-select',
      confidenceInput: 'input[name="confidence"], input[placeholder*="Confidence"]',
      
      // Field properties
      requiredRadio: 'input[name="required"][value="required"], input[type="radio"]',
      optionalRadio: 'input[name="required"][value="optional"]',
      extractPatternCheckbox: 'input[name="extractPattern"], input[type="checkbox"]',
      
      // Field management
      addFieldButton: 'button:contains("Add a field"), .add-field-btn',
      fieldsTable: '.fields-table, table',
      fieldRow: '.field-row, tr',
      
      // Status and notifications
      successMessage: '.success-message, .alert-success',
      errorMessage: '.error-message, .alert-error',
      loadingSpinner: '.loading-spinner, .spinner',
      
      // Learning instance details
      instanceName: '.instance-name',
      instanceStatus: '.instance-status',
      instanceActions: '.instance-actions'
    };
  }

  visit() {
    cy.visit(Config.urls.learningInstance);
    this.waitForPageLoad();
    return this;
  }

  waitForPageLoad() {
    cy.get(this.selectors.pageTitle, { timeout: Config.timeout.long })
      .should('be.visible');
    cy.url().should('include', 'learning-instances');
    return this;
  }

  clickCreateLearningInstance() {
    cy.get(this.selectors.createLearningInstanceButton)
      .should('be.visible')
      .should('be.enabled')
      .click();
    
    // Wait for dialog to appear
    cy.get(this.selectors.createDialog, { timeout: Config.timeout.medium })
      .should('be.visible');
    
    return this;
  }

  fillBasicDetails(name, description = '') {
    // Fill name
    cy.get(this.selectors.nameInput)
      .should('be.visible')
      .clear()
      .type(name, { delay: 100 });
    
    // Fill description if provided
    if (description) {
      cy.get(this.selectors.descriptionInput)
        .should('be.visible')
        .clear()
        .type(description, { delay: 100 });
    }
    
    return this;
  }

  selectDocumentType(documentType = 'User-defined') {
    cy.get(this.selectors.documentTypeDropdown)
      .should('be.visible')
      .select(documentType);
    return this;
  }

  selectLanguage(language = 'English') {
    cy.get(this.selectors.languageDropdown)
      .should('be.visible')
      .select(language);
    return this;
  }

  selectLocale(locale = 'English (United States)') {
    cy.get(this.selectors.localeDropdown)
      .should('be.visible')
      .select(locale);
    return this;
  }

  selectProvider(provider = 'Automation Anywhere (User-defined)') {
    cy.get(this.selectors.providerDropdown)
      .should('be.visible')
      .select(provider);
    return this;
  }

  checkImproveAccuracy() {
    cy.get(this.selectors.improveAccuracyCheckbox)
      .check()
      .should('be.checked');
    return this;
  }

  clickNext() {
    cy.get(this.selectors.nextButton)
      .should('be.visible')
      .should('be.enabled')
      .click();
    return this;
  }

  clickCancel() {
    cy.get(this.selectors.cancelButton)
      .should('be.visible')
      .click();
    return this;
  }

  clickSubmit() {
    cy.get(this.selectors.submitButton)
      .should('be.visible')
      .should('be.enabled')
      .click();
    
    // Wait for submission to complete
    cy.get(this.selectors.loadingSpinner, { timeout: Config.timeout.medium })
      .should('not.exist');
    
    return this;
  }

  // Field Configuration Methods
  navigateToFormFields() {
    cy.get(this.selectors.formFieldsTab)
      .should('be.visible')
      .click();
    return this;
  }

  navigateToFieldProperties() {
    cy.get(this.selectors.fieldPropertiesTab)
      .should('be.visible')
      .click();
    return this;
  }

  addField(fieldData) {
    // Click add field button
    cy.get(this.selectors.addFieldButton)
      .should('be.visible')
      .click();
    
    // Fill field details
    this.fillFieldDetails(fieldData);
    
    return this;
  }

  fillFieldDetails(fieldData) {
    const { fieldName, fieldLabel, dataType, confidence, required, extractPattern } = fieldData;
    
    // Fill field name
    if (fieldName) {
      cy.get(this.selectors.fieldNameInput)
        .should('be.visible')
        .clear()
        .type(fieldName, { delay: 100 });
    }
    
    // Fill field label
    if (fieldLabel) {
      cy.get(this.selectors.fieldLabelInput)
        .should('be.visible')
        .clear()
        .type(fieldLabel, { delay: 100 });
    }
    
    // Select data type
    if (dataType) {
      cy.get(this.selectors.dataTypeDropdown)
        .should('be.visible')
        .select(dataType);
    }
    
    // Fill confidence
    if (confidence) {
      cy.get(this.selectors.confidenceInput)
        .should('be.visible')
        .clear()
        .type(confidence.toString(), { delay: 100 });
    }
    
    // Set required/optional
    if (required !== undefined) {
      if (required) {
        cy.get(this.selectors.requiredRadio).check();
      } else {
        cy.get(this.selectors.optionalRadio).check();
      }
    }
    
    // Set extract pattern
    if (extractPattern !== undefined) {
      if (extractPattern) {
        cy.get(this.selectors.extractPatternCheckbox).check();
      } else {
        cy.get(this.selectors.extractPatternCheckbox).uncheck();
      }
    }
    
    return this;
  }

  // Verification Methods
  verifyLearningInstanceCreated() {
    cy.get(this.selectors.successMessage, { timeout: Config.timeout.long })
      .should('be.visible')
      .and('contain.text', 'Learning instance created successfully');
    
    // Verify we're back on the learning instances page
    cy.url().should('include', 'learning-instances');
    return this;
  }

  verifyFieldAdded(fieldName) {
    cy.get(this.selectors.fieldsTable)
      .should('be.visible')
      .and('contain.text', fieldName);
    return this;
  }

  verifyFormFieldsTabActive() {
    cy.get(this.selectors.formFieldsTab)
      .should('have.class', 'active');
    return this;
  }

  verifyFieldPropertiesVisible() {
    cy.get(this.selectors.fieldPropertiesTab)
      .should('be.visible');
    return this;
  }

  verifyCreateDialogVisible() {
    cy.get(this.selectors.createDialog)
      .should('be.visible');
    return this;
  }

  verifyPageTitle() {
    cy.get(this.selectors.pageTitle)
      .should('be.visible')
      .and('contain.text', 'Learning Instances');
    return this;
  }

  verifyErrorMessage() {
    cy.get(this.selectors.errorMessage)
      .should('be.visible');
    return this;
  }

  // Utility Methods
  waitForDialogToClose() {
    cy.get(this.selectors.createDialog, { timeout: Config.timeout.medium })
      .should('not.exist');
    return this;
  }

  getFieldRowByName(fieldName) {
    return cy.get(this.selectors.fieldsTable)
      .contains('tr', fieldName);
  }

  deleteFieldByName(fieldName) {
    this.getFieldRowByName(fieldName)
      .find('button:contains("Delete"), .delete-btn')
      .click();
    return this;
  }

  editFieldByName(fieldName) {
    this.getFieldRowByName(fieldName)
      .find('button:contains("Edit"), .edit-btn')
      .click();
    return this;
  }

  // Complete workflow for creating learning instance
  createLearningInstanceWithFields(instanceData) {
    const { name, description, documentType, language, locale, provider, improveAccuracy, fields } = instanceData;
    
    // Fill basic details
    this.fillBasicDetails(name, description);
    
    // Select dropdown values
    if (documentType) this.selectDocumentType(documentType);
    if (language) this.selectLanguage(language);
    if (locale) this.selectLocale(locale);
    if (provider) this.selectProvider(provider);
    
    // Check improve accuracy if needed
    if (improveAccuracy) this.checkImproveAccuracy();
    
    // Click next to proceed to field configuration
    this.clickNext();
    
    // Add fields if provided
    if (fields && fields.length > 0) {
      fields.forEach(field => {
        this.addField(field);
      });
    }
    
    // Submit the form
    this.clickSubmit();
    
    return this;
  }
}

module.exports = LearningInstancePage;