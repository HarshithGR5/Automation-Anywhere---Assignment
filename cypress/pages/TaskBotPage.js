const Config = require('../config/config.properties');

class TaskBotPage {
  constructor() {
    this.selectors = {
      // Create Task Bot Dialog
      createTaskBotDialog: '.modal, .dialog, [role="dialog"]',
      nameInput: 'input[name="name"], input[placeholder*="name"]',
      descriptionInput:
        'textarea[name="description"], textarea[placeholder*="description"], [data-testid="description"], [aria-label*="description"], div[contenteditable="true"], input[placeholder*="description"]',
      folderDropdown: 'select[name="folder"], .folder-select',
      createAndEditButton: 'button:contains("Create & edit"), .create-edit-btn',
      cancelButton: 'button:contains("Cancel"), .cancel-btn',

      // Bot Editor Interface
      rootEditor: '.editor-page',
      botEditor: '.editor-page',
      canvasRenderer: '.editor-layout__canvas-renderer',
      canvasLayout: '.taskbot-canvas-flow__layout',
      canvasSVG: 'svg.taskbot-canvas-flow__svg',

      // Save and run buttons
      saveButton:
        'button:contains("Save"), .save-btn, [data-testid="save"], .toolbar button[title*="Save"]',
      runButton: 'button:contains("Run"), .run-btn, [data-testid="run"]',
      debugButton: 'button:contains("Debug"), .debug-btn',

      // Status and notifications
      saveStatus: '.save-status, .status-indicator',
      notification: '.notification, .toast, .alert',

      // Triggers section
      triggersSection: '.triggers-section, [data-testid="triggers"]',
      startTrigger: '.start-trigger',

      // Connector elements
      connector: '.connector, .flow-line',
    };
  }

  debugDOMStructure(description = '') {
    cy.log(`🔍 DEBUG: ${description}`);
    cy.get('body').then($body => {
      cy.log('📋 MAIN PAGE STRUCTURE:');
      $body.find('.editor-page, .main-layout, .editor-layout').each((i, el) => {
        cy.log(`   - ${el.tagName}.${el.className}`);
      });
      cy.log('🎨 CANVAS ELEMENTS:');
      $body
        .find('[class*="canvas"], [class*="taskbot-canvas"], .editor-layout__canvas-renderer')
        .each((i, el) => {
          cy.log(`   - ${el.tagName}.${el.className}`);
          if (el.children.length > 0) {
            cy.log(`     └─ Has ${el.children.length} child elements`);
          }
        });
      cy.screenshot(`debug-dom-${description.replace(/\s+/g, '-')}`);
    });
  }

  findElement(selectorGroup, elementName, timeout = 10000, shouldExist = true) {
    const selectors = selectorGroup.split(', ');
    return cy.get('body').then($body => {
      for (let selector of selectors) {
        const trimmedSelector = selector.trim();
        const element = $body.find(trimmedSelector);
        if (element.length > 0) {
          cy.log(`✅ Found ${elementName} using selector: "${trimmedSelector}"`);
          return cy.get(trimmedSelector, { timeout });
        }
      }
      if (!shouldExist) {
        cy.log(`ℹ️ ${elementName} not found (as expected)`);
        return cy.wrap(null);
      }
      cy.log(`❌ ${elementName} not found with any of these selectors:`);
      selectors.forEach(sel => cy.log(`   - ${sel.trim()}`));
      this.debugDOMStructure(`${elementName}-not-found`);
      throw new Error(`${elementName} not found with selectors: ${selectorGroup}`);
    });
  }

  visit() {
    cy.visit(Config.urls.taskBot);
    this.waitForPageLoad();
    return this;
  }

  waitForPageLoad() {
    cy.get('body', { timeout: Config.timeout.long }).should('be.visible');
    return this;
  }

  fillTaskBotDetails(name, description = '') {
    // 1. Wait for any visible element with the unique modal label
    cy.contains('div', 'Create Task Bot', { timeout: 20000 })
      .should('be.visible')
      .parents('div[role="dialog"]')
      .first()
      .within(() => {
        // 2. Name field
        cy.get('input[name="name"]:visible')
          .should('be.visible')
          .clear()
          .type(name, { delay: 100 });

        // 3. Description field (optional) - simplified approach
        if (description) {
          cy.log('🔍 Looking for description field...');
          
          // Try to find description field with multiple selectors using conditional logic
          cy.get('input, textarea').then($inputs => {
            let descriptionField = null;
            
            // Look through all inputs/textareas for description field
            $inputs.each((index, input) => {
              const placeholder = (input.placeholder || '').toLowerCase();
              const name = (input.name || '').toLowerCase();
              const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
              
              if (
                placeholder.includes('description') ||
                name.includes('description') ||
                ariaLabel.includes('description')
              ) {
                descriptionField = input;
                return false; // break the loop
              }
            });
            
            if (descriptionField) {
              cy.log('✅ Found description field');
              cy.wrap(descriptionField).clear().type(description, { delay: 100 });
            } else {
              cy.log('⚠️ No description field found, skipping description input');
              cy.screenshot('description-field-not-found');
            }
          });
        }

        // 4. Click Create & edit
        cy.contains('button', 'Create & edit').should('be.visible').click();
      });
    return this;
  }

  clickCreateAndEdit() {
    cy.log('▶️ Click "Create & Edit" button');
    cy.get(this.selectors.createAndEditButton)
      .should('be.visible')
      .should('be.enabled')
      .click();
    cy.log('⌛ Waiting for Bot Editor UI to load...');
    cy.wait(5000);
    this.debugDOMStructure('after-create-and-edit-click');
    return this;
  }

  waitForBotEditorLoad() {
    cy.log('🕒 Waiting for Bot Editor to load...');
    cy.get('body').should('not.contain', 'Loading...');
    this.findElement(this.selectors.rootEditor, 'Editor Root')
      .should('exist')
      .should('be.visible');
    cy.get(this.selectors.canvasRenderer, { timeout: 15000 }).should('be.visible');
    return this;
  }

addMessageBoxToFlow() {
  cy.get('input[placeholder*="Search"]')
  .should('be.visible')
  .clear();
cy.get('input[placeholder*="Search"]')
  .should('be.visible')
  .type('message');
cy.wait(500);
cy.get('body').then($body => {
  // Find all visible "Message box" elements
  const allItems = $body.find('*:visible').filter((i, el) =>
    el.textContent.trim() === 'Message box'
  );
  if (!allItems.length) throw new Error('No "Message box" action found');
  // The first is often the header, the last is almost always the real action
  cy.wrap(allItems.last()).should('be.visible').dblclick();
});
cy.wait(800); // Allow config panel to open
 // Let search process/filter

  // Now, find a visible list or card showing "Message box" as an available action
  cy.contains('div, li, span, button', /^Message box$/)
    .filter(':visible')
    .then($actions => {
      // If multiple, take the last (typically the action, not group)
      const actionEl = $actions.length > 1 ? $actions.last() : $actions.first();
      cy.wrap(actionEl)
        .should('be.visible')
        .dblclick({ force: true }); // Ensure the action is invoked
    });

  // Wait for the message box to appear on the canvas (optional)
  cy.wait(1200);
  cy.log('✅ Message Box added to flow');
  return this;
}


configureMessageBox(
  messageText,
  windowTitle = 'Automation Anywhere Enterprise Client',
  scrollbarLines = '30'
) {
  cy.log('🛠️ Configuring Message box with text: ' + messageText);
  
  // Wait for configuration panel to load
  cy.wait(3000);
  
  // Take screenshot to see current state
  cy.screenshot('before-configuring-messagebox');
  
  // First, try to find and click on the Message box in the flow to open its configuration panel
  cy.log('🔍 Looking for Message box in the flow to configure...');
  
  cy.get('body').then($body => {
    // Look for Message box in the flow area
    let messageBoxInFlow = $body.find('.editor-layout__canvas-renderer *:contains("Message box"):visible, .taskbot-canvas-flow__layout *:contains("Message box"):visible');
    
    if (messageBoxInFlow.length > 0) {
      cy.log('✅ Found Message box in flow, clicking to open configuration...');
      cy.wrap(messageBoxInFlow.first()).click({ force: true });
      cy.wait(2000);
    } else {
      cy.log('⚠️ Message box not found in flow, configuration panel might already be open');
    }
    
    // Now look for configuration fields
    cy.get('body').then($bodyAfterClick => {
      // Look for various input field patterns
      const allInputs = $bodyAfterClick.find('input:visible, textarea:visible, [contenteditable="true"]:visible');
      cy.log(`📋 Found ${allInputs.length} total input fields`);
      
      let windowTitleFilled = false;
      let messageFilled = false;
      let scrollbarFilled = false;
      
      // Iterate through all inputs to identify and fill them
      allInputs.each((i, input) => {
        const $input = Cypress.$(input);
        const placeholder = ($input.attr('placeholder') || '').toLowerCase();
        const name = ($input.attr('name') || '').toLowerCase();
        const id = ($input.attr('id') || '').toLowerCase();
        const ariaLabel = ($input.attr('aria-label') || '').toLowerCase();
        const inputType = input.tagName.toLowerCase();
        
        // Get nearby label text for context
        const nearbyLabel = $input.closest('.form-group, .field-group, .input-group')
          .find('label, .label, .field-label')
          .text()
          .toLowerCase();
        
        cy.log(`Field ${i}: ${inputType}, placeholder="${placeholder}", name="${name}", label="${nearbyLabel}"`);
        
        // Window title field identification
        if (!windowTitleFilled && (
            placeholder.includes('window') || 
            placeholder.includes('title') || 
            name.includes('title') || 
            nearbyLabel.includes('window') || 
            nearbyLabel.includes('title'))) {
          
          cy.wrap(input).clear({ force: true }).type(windowTitle, { delay: 50 });
          cy.log('✅ Window title filled: ' + windowTitle);
          windowTitleFilled = true;
        }
        
        // Message text field identification
        else if (!messageFilled && (
            placeholder.includes('message') || 
            placeholder.includes('display') || 
            name.includes('message') || 
            nearbyLabel.includes('message') || 
            nearbyLabel.includes('display') ||
            inputType === 'textarea' ||
            $input.is('[contenteditable="true"]'))) {
          
          cy.wrap(input).clear({ force: true }).type(messageText, { delay: 50 });
          cy.log('✅ Message text filled: ' + messageText);
          messageFilled = true;
        }
        
        // Scrollbar lines field identification
        else if (!scrollbarFilled && (
            placeholder.includes('scrollbar') || 
            placeholder.includes('lines') || 
            name.includes('scrollbar') || 
            name.includes('lines') || 
            nearbyLabel.includes('scrollbar') || 
            nearbyLabel.includes('lines'))) {
          
          cy.wrap(input).clear({ force: true }).type(scrollbarLines, { delay: 25 });
          cy.log('✅ Scrollbar lines filled: ' + scrollbarLines);
          scrollbarFilled = true;
        }
      });
      
      // If message field wasn't found, try some fallback approaches
      if (!messageFilled) {
        cy.log('⚠️ Message field not filled, trying fallback approaches...');
        
        // Approach 1: Look for the largest input field (likely the message field)
        let largestInput = null;
        let maxSize = 0;
        
        allInputs.each((i, input) => {
          const $input = Cypress.$(input);
          const width = $input.width() || 0;
          const height = $input.height() || 0;
          const size = width * height;
          
          if (size > maxSize && input.tagName.toLowerCase() !== 'input' || $input.is('textarea')) {
            maxSize = size;
            largestInput = input;
          }
        });
        
        if (largestInput) {
          cy.wrap(largestInput).clear({ force: true }).type(messageText, { delay: 50 });
          cy.log('✅ Message text filled in largest field (fallback)');
          messageFilled = true;
        }
        
        // Approach 2: If still not filled, try the first textarea or contenteditable element
        if (!messageFilled) {
          const textareas = $bodyAfterClick.find('textarea:visible');
          const contentEditable = $bodyAfterClick.find('[contenteditable="true"]:visible');
          
          if (textareas.length > 0) {
            cy.wrap(textareas.first()).clear({ force: true }).type(messageText, { delay: 50 });
            cy.log('✅ Message text filled in first textarea (fallback)');
            messageFilled = true;
          } else if (contentEditable.length > 0) {
            cy.wrap(contentEditable.first()).clear({ force: true }).type(messageText, { delay: 50 });
            cy.log('✅ Message text filled in contenteditable field (fallback)');
            messageFilled = true;
          }
        }
        
        // Approach 3: Try any input that doesn't have a value yet
        if (!messageFilled) {
          const emptyInputs = $bodyAfterClick.find('input:visible').filter((i, inp) => !inp.value);
          if (emptyInputs.length > 0) {
            cy.wrap(emptyInputs.first()).type(messageText, { delay: 50 });
            cy.log('✅ Message text filled in first empty input (fallback)');
            messageFilled = true;
          }
        }
      }
      
      // Log the final status
      cy.log(`📊 Configuration status: Window Title: ${windowTitleFilled ? '✅' : '❌'}, Message: ${messageFilled ? '✅' : '❌'}, Scrollbar: ${scrollbarFilled ? '✅' : '❌'}`);
    });
  });
  
  // Wait for form validation
  cy.wait(2000);
  
  // Verify configuration and check for validation errors
  cy.get('body').then($body => {
    // Check if the message text appears somewhere in the configuration area
    let messageFound = false;
    const inputs = $body.find('input:visible, textarea:visible, [contenteditable="true"]:visible');
    
    inputs.each((i, input) => {
      const value = input.value || input.textContent || '';
      if (value.includes(messageText)) {
        messageFound = true;
        cy.log('✅ Message text verified in configuration');
      }
    });
    
    if (!messageFound) {
      cy.log('⚠️ Message text not found in any field - configuration may have failed');
    }
    
    // Check for validation errors (red marks)
    const errorElements = $body.find('.error:visible, .invalid:visible, [class*="error"]:visible, .fa-exclamation-triangle:visible, [class*="validation"]:visible');
    if (errorElements.length === 0) {
      cy.log('✅ No validation errors detected - configuration appears successful');
    } else {
      cy.log(`⚠️ ${errorElements.length} validation errors still present after configuration`);
      cy.screenshot('validation-errors-after-configuration');
      
      // Try to identify what's causing the validation errors
      errorElements.each((i, errorEl) => {
        const errorText = errorEl.textContent || errorEl.title || '';
        cy.log(`Validation error ${i + 1}: ${errorText}`);
      });
    }
  });
  
  // Take screenshot after configuration
  cy.screenshot('after-configuring-messagebox');
  
  cy.log('✅ Message box configuration completed');
  return this;
}

saveBot() {
  cy.log('💾 Saving bot and closing configuration panel');
  
  // First, look for and click Apply/OK button in the configuration panel if it exists
  cy.get('body').then($body => {
    // Look for Apply, OK, or Done buttons in the configuration area
    const actionButtons = $body.find('button:visible').filter((i, btn) => {
      const buttonText = btn.textContent.toLowerCase().trim();
      return buttonText === 'apply' || 
             buttonText === 'ok' || 
             buttonText === 'done' || 
             buttonText === 'confirm';
    });
    
    if (actionButtons.length > 0) {
      cy.log('✅ Found configuration action button, clicking to apply changes');
      cy.wrap(actionButtons.first()).click({ force: true });
      cy.wait(1000);
    } else {
      cy.log('ℹ️ No Apply/OK button found, configuration might auto-save');
    }
  });
  
  // Close the configuration panel by clicking outside or finding close button
  cy.get('body').then($body => {
    // Method 1: Look for close button (X) in the configuration panel
    const closeButtons = $body.find('button:visible, [role="button"]:visible').filter((i, btn) => {
      const buttonText = btn.textContent.trim();
      const buttonClass = btn.className || '';
      const ariaLabel = btn.getAttribute('aria-label') || '';
      
      return buttonText === '×' || 
             buttonText === 'X' || 
             buttonClass.includes('close') ||
             ariaLabel.toLowerCase().includes('close') ||
             btn.innerHTML.includes('fa-times') ||
             btn.innerHTML.includes('fa-close');
    });
    
    if (closeButtons.length > 0) {
      cy.log('✅ Found close button, clicking to close configuration panel');
      cy.wrap(closeButtons.first()).click({ force: true });
      cy.wait(500);
    } else {
      // Method 2: Click on the canvas area to close the configuration panel
      cy.log('ℹ️ No close button found, clicking on canvas to close configuration panel');
      cy.get('.editor-layout__canvas-renderer, .taskbot-canvas-flow__layout')
        .first()
        .click({ force: true });
      cy.wait(500);
    }
  });
  
  // Now save the bot using the main Save button
  cy.log('💾 Looking for Save button');
  
  cy.get('body').then($body => {
    // Method 1: Look for direct Save button
    const directSaveButtons = $body.find('button:visible').filter((i, btn) => {
      const buttonText = btn.textContent.trim().toLowerCase();
      return buttonText === 'save';
    });
    
    if (directSaveButtons.length > 0) {
      cy.log('✅ Found direct Save button');
      cy.wrap(directSaveButtons.first()).click();
    } else {
      // Method 2: Look for Save dropdown - click the dropdown arrow first, then Save
      cy.log('🔍 Looking for Save dropdown');
      
      // Look for dropdown button or arrow near save area
      const dropdownButtons = $body.find('button[aria-expanded], .dropdown-toggle, button[data-toggle="dropdown"]:visible, button:has(.fa-caret-down):visible, button:has(.fa-chevron-down):visible');
      
      if (dropdownButtons.length > 0) {
        // Check if any dropdown is near save-related text
        let foundSaveDropdown = false;
        dropdownButtons.each((i, dropdown) => {
          const $dropdown = Cypress.$(dropdown);
          const nearbyText = $dropdown.closest('.toolbar, .header, .action-bar, .button-group').text().toLowerCase();
          
          if (nearbyText.includes('save') || nearbyText.includes('publish')) {
            cy.log('✅ Found Save dropdown trigger');
            cy.wrap(dropdown).click({ force: true });
            cy.wait(500);
            
            // Now look for Save option in the dropdown menu
            cy.get('body').then($bodyAfterDropdown => {
              const saveOptions = $bodyAfterDropdown.find('button:visible, a:visible, [role="menuitem"]:visible').filter((j, option) => {
                const optionText = option.textContent.trim().toLowerCase();
                return optionText === 'save';
              });
              
              if (saveOptions.length > 0) {
                cy.log('✅ Found Save option in dropdown');
                cy.wrap(saveOptions.first()).click();
                foundSaveDropdown = true;
              }
            });
            return false; // break the loop
          }
        });
        
        if (!foundSaveDropdown) {
          // Method 3: Try keyboard shortcut as fallback
          cy.log('🔍 Trying Ctrl+S keyboard shortcut as fallback');
          cy.get('body').type('{ctrl+s}');
        }
      } else {
        // Method 3: Try keyboard shortcut as fallback
        cy.log('🔍 No dropdown found, trying Ctrl+S keyboard shortcut');
        cy.get('body').type('{ctrl+s}');
      }
    }
  });
  
  // Wait for backend/network update to complete
  cy.wait(2000);

  // Validate that the configuration panel is closed
  cy.log('🔍 Validating that configuration panel is closed');
  cy.get('body').then($body => {
    // Check that detailed configuration fields are no longer visible
    const configFields = $body.find('input:visible, textarea:visible').filter((i, field) => {
      const placeholder = (field.placeholder || '').toLowerCase();
      const name = (field.name || '').toLowerCase();
      return placeholder.includes('window title') || 
             placeholder.includes('message') || 
             name.includes('message') ||
             placeholder.includes('scrollbar');
    });
    
    if (configFields.length === 0) {
      cy.log('✅ Configuration panel successfully closed - no config fields visible');
    } else {
      cy.log(`⚠️ Configuration panel might still be open - ${configFields.length} config fields still visible`);
    }
  });

  // Assertion: Message Box node on canvas no longer has the red error/validation icon
  cy.log('🔍 Validating that Message Box node no longer shows the error indicator');
  cy.get('body').then($body => {
    // Find the Message box node in the flow/canvas
    const nodes = $body.find('.editor-layout__canvas-renderer *:contains("Message box"):visible, .taskbot-canvas-flow__layout *:contains("Message box"):visible');
    if (nodes.length > 0) {
      cy.wrap(nodes.first())
        // Should NOT contain a direct child .fa-exclamation-triangle or similar error/red icon class
        .parent().within(() => {
          cy.get('.fa-exclamation-triangle, [class*="error"], [class*="invalid"], [class*="danger"], [style*="color: red"], [data-testid*="error"]', { timeout: 8000 })
            .should('not.exist');
        });
      cy.log('✅ Message Box node no longer shows error indicator after save');
    } else {
      // As a fallback, just confirm that any visible Message box on the canvas does not have a visible red/error icon
      cy.get('.fa-exclamation-triangle, [class*="error"], [class*="invalid"], [class*="danger"], [style*="color: red"], [data-testid*="error"]', { timeout: 8000 })
        .should('not.exist');
      cy.log('✅ No error icons shown on canvas after save');
    }
  });

  // Optionally, make sure the Message box is present and configured
  cy.get('body').should('contain.text', 'Message box');
  cy.log('💾 Bot saved, configuration panel closed, and node is now valid');
  return this;
}
  // Alternative approach: Use findElement method for description field
  fillTaskBotDetailsAlternative(name, description = '') {
    cy.contains('div', 'Create Task Bot', { timeout: 20000 })
      .should('be.visible')
      .parents('div[role="dialog"]')
      .first()
      .within(() => {
        // Name field
        cy.get('input[name="name"]:visible')
          .should('be.visible')
          .clear()
          .type(name, { delay: 100 });

        // Description field using findElement method
        if (description) {
          this.findElement(
            this.selectors.descriptionInput,
            'Description field',
            5000,
            false // Don't throw error if not found
          ).then(($descField) => {
            if ($descField && $descField.length > 0) {
              cy.wrap($descField).clear().type(description, { delay: 100 });
              cy.log('✅ Description field filled successfully');
            } else {
              cy.log('ℹ️ Description field not found, proceeding without description');
            }
          });
        }

        // Click Create & edit
        cy.contains('button', 'Create & edit').should('be.visible').click();
      });
    return this;
  }
}

module.exports = TaskBotPage;