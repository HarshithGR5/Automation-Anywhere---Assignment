// cypress/e2e/debug/debug-taskbot-dom.cy.js
const LoginPage = require('../../pages/LoginPage');
const HomePage = require('../../pages/HomePage');
const TaskBotPage = require('../../pages/TaskBotPage');
const Config = require('../../config/config.properties');

describe('Debug TaskBot DOM Structure', () => {
  let loginPage;
  let homePage;
  let taskBotPage;
  let testData;

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

  it('Debug: Inspect DOM after clicking Create & Edit', () => {
    // Navigate to create bot
    homePage
      .verifyHomePageLoaded()
      .clickCreateBot();

    // Debug initial state
    taskBotPage.debugDOMStructure('initial-create-bot-dialog');

    // Fill basic details
    taskBotPage.fillTaskBotDetails('DEBUG_BOT_TEST');

    // Debug after filling details
    taskBotPage.debugDOMStructure('after-filling-details');

    // Click create and edit
    cy.get(taskBotPage.selectors.createAndEditButton)
      .should('be.visible')
      .click();

    // Wait for navigation/loading
    cy.wait(5000); // Give plenty of time for the editor to load

    // Debug what's available now
    taskBotPage.debugDOMStructure('after-editor-loads');

    // Try to find ANY elements that might be the toolbox
    cy.get('body').then($body => {
      cy.log('🔍 COMPREHENSIVE TOOLBOX SEARCH:');
      
      // Search for common toolbox patterns
      const toolboxPatterns = [
        '*[class*="tool"]',
        '*[class*="action"]', 
        '*[class*="panel"]',
        '*[class*="sidebar"]',
        '*[class*="palette"]',
        '*[class*="component"]',
        '*[class*="package"]',
        '*[id*="tool"]',
        '*[id*="action"]',
        '*[id*="panel"]'
      ];

      toolboxPatterns.forEach(pattern => {
        const elements = $body.find(pattern);
        if (elements.length > 0) {
          cy.log(`📦 Pattern "${pattern}" found ${elements.length} elements:`);
          elements.slice(0, 5).each((i, el) => { // Show first 5 only
            cy.log(`   - ${el.tagName}.${el.className} | ID: ${el.id}`);
          });
        }
      });

      // Look for any navigation/menu structures
      const navElements = $body.find('nav, .nav, .menu, .navigation, aside, .aside');
      if (navElements.length > 0) {
        cy.log(`🧭 Navigation elements: ${navElements.length}`);
        navElements.each((i, el) => {
          cy.log(`   - ${el.tagName}.${el.className}`);
        });
      }

      // Look for iframe (editor might be in iframe)
      const iframes = $body.find('iframe');
      if (iframes.length > 0) {
        cy.log(`🖼️ Found ${iframes.length} iframes - editor might be inside one!`);
        iframes.each((i, frame) => {
          cy.log(`   - iframe src: ${frame.src} | id: ${frame.id} | class: ${frame.className}`);
        });
      }
    });

    // Wait a bit more and debug again
    cy.wait(3000);
    taskBotPage.debugDOMStructure('final-state-after-wait');

    // Take a full page screenshot
    cy.screenshot('debug-full-editor-page', { capture: 'fullPage' });
  });

  it('Debug: Check if editor loads in iframe', () => {
    homePage
      .verifyHomePageLoaded()
      .clickCreateBot();

    taskBotPage.fillTaskBotDetails('IFRAME_TEST_BOT');

    cy.get(taskBotPage.selectors.createAndEditButton)
      .should('be.visible')
      .click();

    cy.wait(5000);

    // Check for iframes and try to switch context
    cy.get('body').then($body => {
      const iframes = $body.find('iframe');
      if (iframes.length > 0) {
        cy.log(`Found ${iframes.length} iframes, checking their contents...`);
        
        // Try to access iframe content (if same-origin)
        cy.get('iframe').each(($iframe, index) => {
          cy.log(`Checking iframe ${index}...`);
          
          // Try to get the iframe document
          cy.wrap($iframe)
            .its('0.contentDocument')
            .should('exist')
            .its('body')
            .should('not.be.empty')
            .then($iframeBody => {
              cy.log(`Iframe ${index} body classes: ${$iframeBody[0].className}`);
              
              // Look for toolbox in iframe
              const toolboxInIframe = $iframeBody.find('*[class*="tool"], *[class*="action"], *[class*="panel"]');
              if (toolboxInIframe.length > 0) {
                cy.log(`🎯 FOUND TOOLBOX IN IFRAME ${index}! Elements: ${toolboxInIframe.length}`);
                toolboxInIframe.each((i, el) => {
                  cy.log(`   - ${el.tagName}.${el.className}`);
                });
              }
            })
            .catch(() => {
              cy.log(`Cannot access iframe ${index} content (likely cross-origin)`);
            });
        });
      } else {
        cy.log('No iframes found');
      }
    });
  });
});