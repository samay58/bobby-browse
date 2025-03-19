// Check if script is already initialized
if (typeof window.__quickExplainInitialized === 'undefined') {
  // Wait for config to load before initializing
  window.configLoaded.then(() => {
    try {
      window.__quickExplainInitialized = true;

      console.log('Content script loaded!');

      // Define promptTypes at the top level
      const promptTypes = {
        explain: "Explain this in simple terms",
        eli5: "Explain this like I'm 5 years old",
        'key-points': "List the key points from this text",
        examples: "Give 3-4 concrete, real-world examples that illustrate this concept",
        'pros-cons': "Present both sides of this topic with 2-3 points for each side",
        'next-steps': "Suggest 3-5 practical next steps or actions based on this information",
        related: "Find related academic papers and research on this topic",
        summarize: "Summarize this text concisely"
      };

      // Tell background script we're ready
      chrome.runtime.sendMessage({ action: "content_script_ready" });

      // Initialize global variables
      let annotationDiv = null;
      let fabButton = null;
      let copyButton = null;
      
      // Use config values after they're loaded
      console.log('Config values:', {
        hasOpenAI: !!window.BOBBY_CONFIG?.OPENAI_API_KEY,
        hasExa: !!window.BOBBY_CONFIG?.EXA_API_KEY,
        hasPPLX: !!window.BOBBY_CONFIG?.PPLX_API_KEY
      });

      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('Content script received message:', request);
        
        if (request.action === "explain") {
          const selectedText = request.text || window.getSelection().toString();
          console.log('Selected text:', selectedText);
          
          if (!selectedText) {
            console.error('No text selected');
            return;
          }

          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) {
            console.error('No valid selection range');
            return;
          }

          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          console.log('Selection rect:', rect);
          
          showAnnotation(rect, selectedText);
        }
      });

      const initResize = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!annotationDiv) return; // Guard against null reference
        
        let isResizing = true;
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = annotationDiv.offsetWidth;
        const startHeight = annotationDiv.offsetHeight;
        
        // Store initial z-index to restore it later
        const initialZIndex = annotationDiv.style.zIndex || '2147483647';
        
        // Ensure the popup has the highest z-index during resize
        annotationDiv.style.zIndex = '2147483647';
        
        // Make sure the popup is fully visible before starting resize
        annotationDiv.style.display = 'flex';
        annotationDiv.style.opacity = '1';
        annotationDiv.style.visibility = 'visible';
        
        const resize = (e) => {
          if (!isResizing || !annotationDiv || !document.body.contains(annotationDiv)) {
            isResizing = false;
            return;
          }
          
          // Use requestAnimationFrame to optimize performance
          requestAnimationFrame(() => {
            try {
              // Calculate deltas
              const deltaX = e.clientX - startX;
              const deltaY = e.clientY - startY;
              
              // Set new dimensions with min/max constraints
              const newWidth = Math.min(800, Math.max(300, startWidth + deltaX));
              const newHeight = Math.min(800, Math.max(200, startHeight + deltaY));
              
              // Apply dimensions - directly modify both width and height
              annotationDiv.style.width = `${newWidth}px`;
              annotationDiv.style.height = `${newHeight}px`;
              
              // Force reflow to ensure the changes are applied
              void annotationDiv.offsetWidth;
              
              // Ensure the popup stays visible
              annotationDiv.style.display = 'flex';
              annotationDiv.style.opacity = '1';
              annotationDiv.style.visibility = 'visible';
              
              // Layout adjustments for child elements
              const mainView = annotationDiv.querySelector('.main-view');
              if (mainView) {
                mainView.style.width = '100%';
                mainView.style.height = '100%';
              }
              
              // Adjust content body height
              const header = annotationDiv.querySelector('.modern-popout-header');
              const content = annotationDiv.querySelector('.modern-popout-body');
              if (content && header) {
                // Calculate available height for content
                const availableHeight = newHeight - header.offsetHeight - 32;
                content.style.height = `${availableHeight}px`;
                content.style.overflow = 'auto';
                
                // Also adjust follow-up answer height if present
                const followupAnswer = content.querySelector('.followup-answer');
                if (followupAnswer) {
                  followupAnswer.style.maxHeight = `${availableHeight - 100}px`;
                  followupAnswer.style.overflowY = 'auto';
                }
                
                // Adjust fact check view if present
                const factCheckView = annotationDiv.querySelector('.fact-check-view');
                if (factCheckView && factCheckView.style.display !== 'none') {
                  factCheckView.style.width = '100%';
                  factCheckView.style.height = '100%';
                  
                  const factCheckContent = factCheckView.querySelector('.fact-check-content');
                  if (factCheckContent) {
                    const factCheckHeader = factCheckView.querySelector('.fact-check-header');
                    if (factCheckHeader) {
                      factCheckContent.style.height = `${newHeight - factCheckHeader.offsetHeight}px`;
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Error during resize:', error);
            }
          });
        };

        const stopResize = () => {
          isResizing = false;
          document.body.style.cursor = '';
          document.removeEventListener('mousemove', resize);
          document.removeEventListener('mouseup', stopResize);
          document.removeEventListener('mouseleave', stopResize);
          
          if (annotationDiv && document.body.contains(annotationDiv)) {
            try {
              // Restore original z-index
              annotationDiv.style.zIndex = initialZIndex;
              
              annotationDiv.classList.remove('resizing');
              
              // Ensure popup stays visible and fully opaque
              annotationDiv.style.display = 'flex';
              annotationDiv.style.opacity = '1';
              annotationDiv.style.visibility = 'visible';
              
              // Adjust all child elements to fit the new size
              const mainView = annotationDiv.querySelector('.main-view');
              if (mainView) {
                mainView.style.width = '100%';
                mainView.style.height = '100%';
              }
              
              // Adjust content height again to ensure it's correct
              const header = annotationDiv.querySelector('.modern-popout-header');
              const content = annotationDiv.querySelector('.modern-popout-body');
              if (content && header) {
                const availableHeight = annotationDiv.offsetHeight - header.offsetHeight - 32;
                content.style.height = `${availableHeight}px`;
                content.style.overflow = 'auto';
              }
              
              // Adjust fact check view if present
              const factCheckView = annotationDiv.querySelector('.fact-check-view');
              if (factCheckView && factCheckView.style.display !== 'none') {
                factCheckView.style.width = '100%';
                factCheckView.style.height = '100%';
                
                const factCheckContent = factCheckView.querySelector('.fact-check-content');
                if (factCheckContent) {
                  const factCheckHeader = factCheckView.querySelector('.fact-check-header');
                  if (factCheckHeader) {
                    factCheckContent.style.height = `${annotationDiv.offsetHeight - factCheckHeader.offsetHeight}px`;
                  }
                }
              }
              
              // Guarantee visibility after a brief delay (to handle any race conditions)
              setTimeout(() => {
                if (annotationDiv && document.body.contains(annotationDiv)) {
                  annotationDiv.style.display = 'flex';
                  annotationDiv.style.opacity = '1';
                  annotationDiv.style.visibility = 'visible';
                }
              }, 100);
            } catch (error) {
              console.error('Error during resize completion:', error);
            }
          }
        };

        // Set cursor for entire document during resize
        document.body.style.cursor = 'se-resize';
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('mouseleave', stopResize);
        annotationDiv.classList.add('resizing');
      };

      async function showAnnotation(rect, text) {
        // If no valid rect is provided, position the popup in the center
        if (!rect || !rect.top) {
          rect = {
            top: window.innerHeight / 2,
            bottom: window.innerHeight / 2,
            height: 0
          };
        }

        const settings = await chrome.storage.sync.get({
          defaultPrompt: 'explain',
          theme: 'auto'
        });

        // Count words in the selected text
        const wordCount = text.trim().split(/\s+/).length;
        // If more than 10 words, summarize. Otherwise explain
        const initialPrompt = wordCount > 10 ? 'summarize' : 'explain';
        settings.defaultPrompt = initialPrompt;

        // Apply theme
        if (settings.theme !== 'auto') {
          annotationDiv?.classList.toggle('dark', settings.theme === 'dark');
        }

        // Declare promptSelector at the function level so it's accessible throughout
        let promptSelector;
        let selectedDisplay;
        let dropdownArrow;
        let options;

        // Set default prompt
        if (!annotationDiv) {
          annotationDiv = document.createElement('div');
          annotationDiv.className = 'modern-popout resizable';
          
          // Create main view container
          const mainView = document.createElement('div');
          mainView.className = 'main-view';
          
          const header = document.createElement('div');
          header.className = 'modern-popout-header';
          
          // Initialize draggable functionality
          window.initDraggable(annotationDiv, header);
          
          // Add prompt label
          const promptLabel = document.createElement('span');
          promptLabel.className = 'prompt-label';
          promptLabel.textContent = 'Select Prompt:';
          header.appendChild(promptLabel);
          
          // Create content div
          content = document.createElement('div');
          content.className = 'modern-popout-body';
          
          // Add all the main UI elements to mainView
          mainView.appendChild(header);
          mainView.appendChild(content);
          annotationDiv.appendChild(mainView);
          
          // Add only bottom-right resizer
          const resizer = document.createElement('div');
          resizer.className = 'resizer bottom-right';
          resizer.addEventListener('mousedown', initResize);
          annotationDiv.appendChild(resizer);
          
          // Create a custom dropdown instead of using native select
          promptSelector = document.createElement('div');
          promptSelector.className = 'custom-prompt-selector';
          promptSelector.setAttribute('tabindex', '0'); // Make it focusable
          
          // Create the selected value display
          selectedDisplay = document.createElement('div');
          selectedDisplay.className = 'selected-prompt';
          selectedDisplay.textContent = 'Explain Simply'; // Default value
          promptSelector.appendChild(selectedDisplay);
          
          // Create dropdown arrow icon
          dropdownArrow = document.createElement('span');
          dropdownArrow.className = 'dropdown-arrow';
          dropdownArrow.innerHTML = '▼';
          selectedDisplay.appendChild(dropdownArrow);
          
          // Create the dropdown options container
          const optionsContainer = document.createElement('div');
          optionsContainer.className = 'prompt-options';
          promptSelector.appendChild(optionsContainer);
          
          // Define the options
          options = [
            {value: 'explain', text: 'Explain Simply'},
            {value: 'eli5', text: 'Explain Like I\'m 5'},
            {value: 'key-points', text: 'Key Points'},
            {value: 'examples', text: 'Real Examples'},
            {value: 'pros-cons', text: 'Pros & Cons'},
            {value: 'next-steps', text: 'Next Steps'},
            {value: 'related', text: 'Related Reading'},
            {value: 'summarize', text: 'Summarize'}
          ];
          
          // Add options to the dropdown
          options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'prompt-option';
            optionElement.dataset.value = option.value;
            optionElement.textContent = option.text;
            
            // Add click handler for this option
            optionElement.addEventListener('click', (e) => {
              e.stopPropagation();
              // Update selected display
              selectedDisplay.textContent = option.text;
              selectedDisplay.appendChild(dropdownArrow); // Re-add the arrow
              // Hide dropdown
              optionsContainer.style.display = 'none';
              // Set as the selected value
              promptSelector.dataset.value = option.value;
              
              // Trigger the change
              handlePromptChange(option.value);
            });
            
            optionsContainer.appendChild(optionElement);
          });
          
          // Toggle dropdown on click
          selectedDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Prompt selector clicked');
            // Toggle dropdown visibility
            if (optionsContainer.style.display === 'block') {
              optionsContainer.style.display = 'none';
            } else {
              optionsContainer.style.display = 'block';
            }
          });
          
          // Hide dropdown when clicking elsewhere
          document.addEventListener('click', () => {
            optionsContainer.style.display = 'none';
          });
          
          // Handle prompt change - extract the logic from the change handler
          const handlePromptChange = async (selectedPrompt) => {
            console.log('Prompt changed to:', selectedPrompt);
            
            annotationDiv.dataset.promptType = selectedPrompt;
            content.textContent = "Loading explanation...";
            annotationDiv.classList.add('loading');
            copyButton.style.display = 'none';
            
            try {
              const promptText = promptTypes[selectedPrompt];
              console.log('Prompt selected:', selectedPrompt, 'Prompt text:', promptText);
              
              const response = await sendToOpenAI(text);
              const formattedContent = await formatContent(selectedPrompt, response.choices[0].message.content, text);
              content.innerHTML = formattedContent;
              copyButton.style.display = 'block';
              annotationDiv.classList.remove('loading');
              
              // Setup expand/collapse functionality for long content
              setupCollapsibleContent();
              debugCollapsibleContent();

              // Add contextual buttons
              addContextualButtons(annotationDiv, text, formattedContent);

              // Add to history
              await window.HistoryManager.addToHistory(
                text,
                formattedContent,
                selectedPrompt
              );
            } catch (error) {
              console.error('API Error:', error);
              annotationDiv.classList.remove('loading');
              annotationDiv.classList.add('error');
              content.textContent = `Error: ${error.message}`;
            }
          };
          
          // Create copy button
          copyButton = document.createElement('button');
          copyButton.className = 'copy-button';
          copyButton.innerHTML = '📋 Copy';
          copyButton.style.display = 'none';
          
          // Add fact check button
          const factCheckButton = document.createElement('button');
          factCheckButton.className = 'fact-check-button';
          factCheckButton.innerHTML = '🔍 Fact Check';
          factCheckButton.onclick = async () => {
            console.log('Fact check button clicked');
            try {
              // Create fact check view if it doesn't exist
              let factCheckView = annotationDiv.querySelector('.fact-check-view');
              if (!factCheckView) {
                factCheckView = createFactCheckView();
              }

              // Show fact check view and hide main view
              factCheckView.style.display = 'flex';
              const mainView = annotationDiv.querySelector('.main-view');
              if (mainView) {
                // Completely hide the main view
                mainView.style.display = 'none';
                mainView.style.visibility = 'hidden'; // Ensure it's fully hidden
              }

              // Remove any Show More buttons that might be in the main view or fact check view
              const expandButtons = annotationDiv.querySelectorAll('.expand-collapse-btn');
              expandButtons.forEach(button => {
                button.style.display = 'none'; // Hide first
                setTimeout(() => button.remove(), 10); // Then remove for total cleanup
              });

              // Get the fact check content div
              const factCheckContent = factCheckView.querySelector('.fact-check-content');
              if (!factCheckContent) {
                throw new Error('Fact check content div not found');
              }

              factCheckContent.innerHTML = `
                <div class="modern-loading">
                  <div class="loading-text">Checking facts...</div>
                  <div class="loading-bar"></div>
                </div>
              `;

              // Ensure we have a valid selection
              if (!text) {
                throw new Error('No text selected for fact checking');
              }

              // Check if we have valid API keys
              if (!window.BOBBY_CONFIG?.OPENAI_API_KEY) {
                throw new Error('OpenAI API key not set. Please set it in the extension options.');
              }
              if (!window.BOBBY_CONFIG?.EXA_API_KEY) {
                throw new Error('Exa API key not set. Please set it in the extension options.');
              }

              console.log('Creating HallucinationDetector with keys:', {
                openAI: 'present',
                exa: 'present'
              });

              const detector = new HallucinationDetector(
                window.BOBBY_CONFIG.OPENAI_API_KEY,
                window.BOBBY_CONFIG.EXA_API_KEY
              );

              console.log('Extracting claims from text:', text);
              const claims = await detector.extractClaims(text);
              console.log('Extracted claims:', claims);

              if (!claims || claims.length === 0) {
                throw new Error('No claims could be extracted from the text');
              }

              console.log('Verifying claims...');
              const verifications = await Promise.all(
                claims.map(claim => detector.verifyClaim(claim.claim, claim.original_text))
              );
              console.log('Claim verifications:', verifications);

              // Make the popup bigger when showing results
              annotationDiv.style.width = `${Math.min(600, window.innerWidth - 40)}px`;
              annotationDiv.style.height = `${Math.min(700, window.innerHeight - 40)}px`;

              factCheckContent.innerHTML = formatFactCheckResults(verifications);
              annotationDiv.classList.remove('loading');
            } catch (error) {
              console.error('Fact check error:', error);
              console.error('Error stack:', error.stack);
              
              // Get or create fact check view
              let factCheckView = annotationDiv.querySelector('.fact-check-view');
              if (!factCheckView) {
                factCheckView = createFactCheckView();
              }
              
              const factCheckContent = factCheckView.querySelector('.fact-check-content');
              if (factCheckContent) {
                factCheckContent.innerHTML = `
                  <div class="error-message">
                    <h3>Error checking facts:</h3>
                    <p>${error.message}</p>
                    ${error.message.includes('API key') ? 
                      '<p>Please go to extension options and set up your API keys.</p>' : 
                      ''}
                  </div>
                `;
              }
              annotationDiv.classList.remove('loading');
            }
          };
          
          header.appendChild(promptSelector);
          header.appendChild(factCheckButton);
          header.appendChild(copyButton); // Add copy button to header
          
          copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(content.textContent);
            copyButton.innerHTML = '✓ Copied!';
            setTimeout(() => {
              copyButton.innerHTML = '📋 Copy';
            }, 2000);
          });
          
          // Update the initial prompt display based on the default
          const initialPromptDisplay = options.find(opt => opt.value === settings.defaultPrompt)?.text || 'Explain Simply';
          selectedDisplay.textContent = initialPromptDisplay;
          selectedDisplay.appendChild(dropdownArrow); // Re-add the arrow since textContent replaces everything
          promptSelector.dataset.value = settings.defaultPrompt;
          console.log('Initial prompt selector value set to:', promptSelector.dataset.value);

          // Force a style refresh to ensure proper rendering
          void promptSelector.offsetHeight;

          // Add to document body
          document.body.appendChild(annotationDiv);
        } else {
          copyButton = annotationDiv.querySelector('.copy-button');
          content = annotationDiv.querySelector('.modern-popout-body');
          
          // Find the existing prompt selector - with a more robust approach
          promptSelector = annotationDiv.querySelector('.custom-prompt-selector');
          
          // If for some reason it doesn't exist, create it
          if (!promptSelector) {
            console.log('Creating new prompt selector as it was not found');
            // We need to recreate the prompt selector
            const header = annotationDiv.querySelector('.modern-popout-header');
            if (header) {
              // Create a custom dropdown 
              promptSelector = document.createElement('div');
              promptSelector.className = 'custom-prompt-selector';
              promptSelector.setAttribute('tabindex', '0');
              
              // Create selected value display
              selectedDisplay = document.createElement('div');
              selectedDisplay.className = 'selected-prompt';
              selectedDisplay.textContent = 'Explain Simply';
              promptSelector.appendChild(selectedDisplay);
              
              // Create dropdown arrow
              dropdownArrow = document.createElement('span');
              dropdownArrow.className = 'dropdown-arrow';
              dropdownArrow.innerHTML = '▼';
              selectedDisplay.appendChild(dropdownArrow);
              
              // Add it to the header (at the beginning)
              if (header.firstChild) {
                header.insertBefore(promptSelector, header.firstChild);
              } else {
                header.appendChild(promptSelector);
              }
              
              // Set the value
              promptSelector.dataset.value = settings.defaultPrompt;
            }
          }
        }

        // Set initial position style
        annotationDiv.style.position = 'fixed';

        // Calculate available space and optimal dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 20; // Padding from viewport edges
        const minWidth = 300;
        const maxWidth = Math.min(380, viewportWidth - (padding * 2));
        const maxHeight = Math.min(400, viewportHeight - (padding * 2));

        // Set initial dimensions
        annotationDiv.style.maxHeight = `${maxHeight}px`;
        annotationDiv.style.width = `${maxWidth}px`;

        // Calculate optimal position
        let left, top;
        const selectionRect = rect || {
          top: viewportHeight / 2,
          bottom: viewportHeight / 2,
          right: viewportWidth / 2,
          left: viewportWidth / 2,
          height: 0,
          width: 0
        };

        // Determine horizontal position
        const isNarrowScreen = viewportWidth < 800;
        const spaceOnRight = viewportWidth - selectionRect.right - padding;
        const spaceOnLeft = selectionRect.left - padding;
        const preferredWidth = maxWidth;

        if (isNarrowScreen) {
          // Center horizontally on narrow screens
          left = Math.max(padding, Math.min(
            (viewportWidth - preferredWidth) / 2,
            viewportWidth - preferredWidth - padding
          ));
          annotationDiv.style.left = `${left}px`;
          annotationDiv.style.right = 'auto';
        } else if (spaceOnRight >= preferredWidth) {
          // Position on right if there's enough space
          annotationDiv.style.left = 'auto';
          annotationDiv.style.right = `${padding}px`;
        } else if (spaceOnLeft >= preferredWidth) {
          // Position on left if there's enough space
          left = Math.max(padding, selectionRect.left - preferredWidth - padding);
          annotationDiv.style.left = `${left}px`;
          annotationDiv.style.right = 'auto';
        } else {
          // Center horizontally if no good side positioning
          left = Math.max(padding, Math.min(
            (viewportWidth - preferredWidth) / 2,
            viewportWidth - preferredWidth - padding
          ));
          annotationDiv.style.left = `${left}px`;
          annotationDiv.style.right = 'auto';
        }

        // Determine vertical position
        const boxHeight = Math.min(400, viewportHeight - (padding * 2));
        const selectionMidpoint = selectionRect.top + (selectionRect.height / 2);
        
        if (selectionMidpoint < viewportHeight / 2) {
          // If selection is in upper half, position below
          top = Math.min(
            selectionMidpoint + padding,
            viewportHeight - boxHeight - padding
          );
        } else {
          // If selection is in lower half, position above
          top = Math.max(
            padding,
            selectionMidpoint - boxHeight - padding
          );
        }

        // Apply vertical position
        annotationDiv.style.top = `${top}px`;
        
        // Ensure popup stays within viewport bounds
        const bounds = annotationDiv.getBoundingClientRect();
        if (bounds.right > viewportWidth - padding) {
          annotationDiv.style.left = `${viewportWidth - bounds.width - padding}px`;
        }
        if (bounds.left < padding) {
          annotationDiv.style.left = `${padding}px`;
        }
        if (bounds.bottom > viewportHeight - padding) {
          annotationDiv.style.top = `${viewportHeight - bounds.height - padding}px`;
        }
        if (bounds.top < padding) {
          annotationDiv.style.top = `${padding}px`;
        }

        content.textContent = "Loading explanation...";
        annotationDiv.classList.add('loading');

        try {
          console.log('Sending request to OpenAI...');
          // Use a safer way to get the selected prompt value
          let selectedPrompt = settings.defaultPrompt; // Default fallback
          
          if (promptSelector) {
            selectedPrompt = promptSelector.dataset.value || settings.defaultPrompt;
            console.log('Using prompt value from selector:', selectedPrompt);
          } else {
            console.log('Using default prompt value:', selectedPrompt);
          }
          
          const promptText = promptTypes[selectedPrompt];

          const response = await sendToOpenAI(text);
          const formattedContent = await formatContent(selectedPrompt, response.choices[0].message.content, text);
          content.innerHTML = formattedContent;
          copyButton.style.display = 'block';
          annotationDiv.classList.remove('loading');

          // Add contextual buttons
          addContextualButtons(annotationDiv, text, formattedContent);

          // Add to history
          await window.HistoryManager.addToHistory(
            text,
            formattedContent,
            selectedPrompt
          );
        } catch (error) {
          console.error('API Error:', error);
          annotationDiv.classList.remove('loading');
          annotationDiv.classList.add('error');
          content.textContent = `Error: ${error.message}`;
          copyButton.style.display = 'none';
        }
      }

      // Close annotation on click outside
      document.addEventListener('click', (e) => {
        // Don't close if clicking the popup or during any interaction
        if (annotationDiv && 
            !annotationDiv.contains(e.target) && 
            !e.target.closest('.drag-handle') &&
            !window.isDragging &&
            !annotationDiv.querySelector('.followup-input') && // Don't close during follow-up
            !annotationDiv.querySelector('.followup-container')) { // Don't close during answer display
          annotationDiv.remove();
          annotationDiv = null;
        }
      });

      // Add these variables at the top level
      let currentSelectionRect = null;
      let currentSelectedText = null;
      let isUpdatingPosition = false;
      // Add a retry counter to prevent infinite loops
      let fabButtonRetryCount = 0;
      const MAX_FAB_RETRIES = 2;

      // Update showFabButton function
      function showFabButton(rect, text, retryCount = 0) {
        try {
          // If we've exceeded max retries, don't attempt again
          if (retryCount > MAX_FAB_RETRIES) {
            console.log('Giving up on showing FAB button after multiple retries');
            fabButtonRetryCount = 0; // Reset for future attempts
            return;
          }

          // Store current selection info
          currentSelectionRect = rect;
          currentSelectedText = text;

          if (!fabButton) {
            fabButton = document.createElement('button');
            fabButton.className = 'quick-explain-fab';
            
            const icon = document.createElement('img');
            icon.src = chrome.runtime.getURL('icon.png');
            icon.className = 'bobby-icon';
            
            fabButton.appendChild(icon);
            fabButton.appendChild(document.createTextNode('Explain'));
            
            document.body.appendChild(fabButton);
          }

          updateFabPosition();
          
          // Show the button with animation
          requestAnimationFrame(() => {
            fabButton.classList.add('visible');
          });
          
          fabButton.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            showAnnotation(range.getBoundingClientRect(), text);
            hideFabButton();
          };
        } catch (error) {
          console.error('Error showing FAB button:', error);
          // Create a new button if the old one was invalidated, but limit retries
          if (error.message.includes('Extension context invalidated')) {
            fabButton = null;
            // Retry showing the button with incremented retry count
            if (retryCount < MAX_FAB_RETRIES) {
              setTimeout(() => showFabButton(rect, text, retryCount + 1), 100);
            } else {
              console.warn('Maximum FAB button retries reached, giving up');
            }
          }
        }
      }

      // Add new function to update fab position
      function updateFabPosition() {
        if (!fabButton || !currentSelectionRect || !currentSelectedText || isUpdatingPosition) return;
        
        isUpdatingPosition = true;
        
        try {
          const selection = window.getSelection();
          if (!selection.rangeCount) {
            hideFabButton();
            return;
          }

          const range = selection.getRangeAt(0);
          const newRect = range.getBoundingClientRect();

          // If selection is empty or invalid, hide button
          if (!newRect || newRect.height === 0) {
            hideFabButton();
            return;
          }

          // Check if selection is visible in viewport
          if (newRect.bottom < 0 || newRect.top > window.innerHeight) {
            fabButton.style.opacity = '0';
            return;
          }

          // Get button dimensions
          const buttonWidth = fabButton.offsetWidth || 100;
          const buttonHeight = fabButton.offsetHeight || 32;
          const spacing = 8;
          
          // Calculate position at the end of selection
          let left = newRect.right + window.scrollX + spacing;
          let top = newRect.top + window.scrollY + (newRect.height / 2) - (buttonHeight / 2);

          // Adjust if would go off screen horizontally
          if (left + buttonWidth > window.scrollX + window.innerWidth - spacing) {
            // Place button to the left of the selection if no room on right
            left = newRect.left + window.scrollX - buttonWidth - spacing;
            
            // If still no room, place below selection
            if (left < spacing) {
              left = newRect.left + window.scrollX;
              top = newRect.bottom + window.scrollY + spacing;
            }
          }

          // Adjust if would go off screen vertically
          if (top < window.scrollY + spacing) {
            top = window.scrollY + spacing;
          } else if (top + buttonHeight > window.scrollY + window.innerHeight - spacing) {
            top = window.scrollY + window.innerHeight - buttonHeight - spacing;
          }
          
          // Apply position with smooth transition
          fabButton.style.opacity = '1';
          fabButton.style.transform = 'scale(1)';
          fabButton.style.top = `${top}px`;
          fabButton.style.left = `${left}px`;
        } finally {
          isUpdatingPosition = false;
        }
      }

      // Update event listeners
      // Replace the old scroll listener with the new one
      document.removeEventListener('scroll', hideFabButton);
      document.addEventListener('scroll', () => {
        if (fabButton && currentSelectedText) {
          requestAnimationFrame(updateFabPosition);
        }
      }, { passive: true });

      // Update mousedown handler
      document.addEventListener('mousedown', (e) => {
        if (fabButton && !fabButton.contains(e.target)) {
          currentSelectionRect = null;
          currentSelectedText = null;
          hideFabButton();
        }
      });

      // Add resize handler
      window.addEventListener('resize', () => {
        if (fabButton && currentSelectedText) {
          requestAnimationFrame(updateFabPosition);
        }
      }, { passive: true });

      // Update hideFabButton function
      function hideFabButton() {
        if (fabButton) {
          currentSelectionRect = null;
          currentSelectedText = null;
          fabButton.classList.remove('visible');
          setTimeout(() => {
            if (fabButton && fabButton.parentNode) {
              fabButton.parentNode.removeChild(fabButton);
            }
            fabButton = null;
          }, 200);
        }
      }

      // Add this function to format the content
      async function formatContent(type, content, text) {
        // Constants for response length management
        const CHAR_THRESHOLD = 500; // Character threshold to consider response as "long"
        const INITIAL_VISIBLE_CHARS = 400; // Characters to show initially for long responses
        
        // Helper to manage long text with expand/collapse functionality
        const manageResponseLength = (html) => {
          // Use a more reliable way to check content length
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          const textLength = tempDiv.textContent.length;
          
          console.log('Content length:', textLength, 'Threshold:', CHAR_THRESHOLD);
          
          if (textLength <= CHAR_THRESHOLD) {
            return html; // Return unchanged if content is not too long
          }
          
          // For long content, wrap in a container with expand/collapse functionality
          const collapsibleHtml = `
            <div class="collapsible-container">
              <div class="collapsible-content collapsed">
                ${html}
              </div>
              <button class="expand-collapse-btn">Show More</button>
            </div>
          `;
          
          // Log the created collapsible HTML
          console.log('Created collapsible content with length:', textLength);
          
          // Setup collapsible content on next tick to ensure DOM is updated
          setTimeout(() => {
            const containers = document.querySelectorAll('.collapsible-container');
            console.log('Found', containers.length, 'collapsible containers after creation');
            if (containers.length > 0) {
              setupCollapsibleContent();
            }
          }, 0);
          
          return collapsibleHtml;
        };
        
        // Helper to sanitize text and split into clean paragraphs
        const sanitizeText = (text) => {
          return text.split('\n')
            .map(p => p.trim())
            .filter(p => p)
            .join('\n\n');
        };

        // Helper to create bullet points from text
        const createBulletPoints = (text) => {
          return text.split(/\d+\.|•|-/)
            .map(point => point.trim())
            .filter(point => point)
            .map(point => `<li>${point}</li>`)
            .join('');
        };

        switch(type) {
          case 'key-points':
            return manageResponseLength(`
              <div class="bobby-response key-points">
                <div class="bobby-header">Key Points</div>
                <ul class="bobby-list">
                  ${createBulletPoints(content)}
                </ul>
              </div>
            `);
          
          case 'eli5':
            return manageResponseLength(`
              <div class="bobby-response eli5">
                <div class="bobby-header">Simple Explanation</div>
                <p class="bobby-text">
                  ${sanitizeText(content)}
                </p>
              </div>
            `);
          
          case 'pros-cons':
            try {
              // Split content into "Pros" and "Cons" sections
              const sections = content.split(/(?:pros?:|cons?:|advantages?:|disadvantages?:)/i)
                .filter(section => section.trim());
              
              const prosPoints = sections[0] ? createBulletPoints(sections[0]) : '<li>No pros provided</li>';
              const consPoints = sections[1] ? createBulletPoints(sections[1]) : '<li>No cons provided</li>';
              
              return manageResponseLength(`
                <div class="bobby-response pros-cons">
                  <div class="bobby-section pros-section">
                    <div class="bobby-header">Pros</div>
                    <ul class="bobby-list pros">${prosPoints}</ul>
                  </div>
                  <div class="bobby-section cons-section">
                    <div class="bobby-header">Cons</div>
                    <ul class="bobby-list cons">${consPoints}</ul>
                  </div>
                </div>
              `);
            } catch (error) {
              console.error('Error formatting pros/cons:', error);
              return `
                <div class="bobby-response error">
                  <div class="bobby-header">Error</div>
                  <p class="bobby-text">Failed to format pros and cons.</p>
                </div>
              `;
            }
          
          case 'next-steps':
            return manageResponseLength(`
              <div class="bobby-response next-steps">
                <div class="bobby-header">Suggested Next Steps</div>
                <ol class="bobby-list ordered">
                  ${content.split(/\d+\./)
                    .filter(step => step.trim())
                    .map(step => `<li>${step.trim()}</li>`)
                    .join('')}
                </ol>
              </div>
            `);
          
          case 'examples':
            return manageResponseLength(`
              <div class="bobby-response examples">
                <div class="bobby-header">Real-World Examples</div>
                <ul class="bobby-list">
                  ${createBulletPoints(content)}
                </ul>
              </div>
            `);
          
          case 'related':
            try {
              console.log('Fetching related reading...');
              const papers = await getRelatedReading(text);
              console.log('Received papers:', papers);  // Debug log
              
              if (!papers || papers.length === 0) {
                return `
                  <div class="bobby-response error">
                    <div class="bobby-header">No Results Found</div>
                    <p class="bobby-text">No related articles found. Try modifying your search.</p>
                  </div>
                `;
              }

              return manageResponseLength(`
                <div class="bobby-response related">
                  <div class="bobby-header">Related Reading</div>
                  <div class="bobby-papers">
                    ${papers.map(paper => `
                      <div class="bobby-paper">
                        <a href="${paper.url}" target="_blank" rel="noopener" class="bobby-paper-title">
                          ${paper.title}
                        </a>
                        ${paper.author ? `
                          <div class="bobby-paper-authors">${paper.author}</div>
                        ` : ''}
                        ${paper.date ? `
                          <div class="bobby-paper-date">${paper.date}</div>
                        ` : ''}
                        ${paper.highlight ? `
                          <p class="bobby-paper-highlight">${paper.highlight}</p>
                        ` : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              `);
            } catch (error) {
              console.error('Error in related reading:', error);
              return `
                <div class="bobby-response error">
                  <div class="bobby-header">Error</div>
                  <p class="bobby-text">Failed to load related content: ${error.message}</p>
                </div>
              `;
            }
          
          default:
            return manageResponseLength(`
              <div class="bobby-response explanation">
                <div class="bobby-header">Explanation</div>
                <p class="bobby-text">
                  ${sanitizeText(content)}
                </p>
              </div>
            `);
        }
      }

      // Setup collapsible content functionality
      function setupCollapsibleContent(targetElement = document) {
        // Use the provided element or document as the context
        const context = targetElement === document ? targetElement : targetElement.querySelector('.modern-popout-body') || targetElement;
        
        console.log('Setting up collapsible content in context:', context);
        
        // Find all expand buttons within the context
        const expandButtons = context.querySelectorAll('.expand-collapse-btn');
        console.log('Found expand buttons:', expandButtons.length);
        
        expandButtons.forEach(button => {
          // Remove any existing listeners to avoid duplicates
          const newButton = button.cloneNode(true);
          if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
          }
          
          newButton.addEventListener('click', (e) => {
            console.log('Show More button clicked');
            e.preventDefault();
            e.stopPropagation();
            
            const container = newButton.closest('.collapsible-container');
            if (!container) {
              console.error('No container found for expand button');
              return;
            }
            
            const content = container.querySelector('.collapsible-content');
            if (!content) {
              console.error('No content found in container');
              return;
            }
            
            console.log('Toggle content display, current state:', 
                       content.classList.contains('collapsed') ? 'collapsed' : 'expanded');
            
            if (content.classList.contains('collapsed')) {
              // Expand content
              content.classList.remove('collapsed');
              content.classList.add('expanded');
              
              // Remove the button entirely
              newButton.remove();
              
              // Make sure the parent container expands properly
              container.style.maxHeight = 'none';
              
              // If the popup has a fixed height, adjust it to fit content
              const popout = container.closest('.modern-popout');
              if (popout && content.scrollHeight > popout.offsetHeight) {
                const newHeight = Math.min(
                  // Limit to 80% of viewport height
                  window.innerHeight * 0.8,
                  // Add extra space for the header
                  content.scrollHeight + 100
                );
                popout.style.height = `${newHeight}px`;
              }
              
              // Force repaint to ensure styles apply correctly
              void content.offsetHeight;
              
              console.log('Content expanded and button removed');
            } else {
              // Collapse content
              content.classList.remove('expanded');
              content.classList.add('collapsed');
              newButton.textContent = 'Show More';
              
              // Scroll to top of container to ensure visibility
              container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          });
        });
        
        // Hide any stray Show More buttons in fact check view
        let factCheckView = null;

        // Check if context is a DOM element that can use closest
        if (context !== document && context.nodeType === 1) {
          factCheckView = context.closest('.modern-popout')?.querySelector('.fact-check-view');
        } else {
          // If context is document, find the modern-popout and then the fact-check-view
          const modernPopout = document.querySelector('.modern-popout');
          if (modernPopout) {
            factCheckView = modernPopout.querySelector('.fact-check-view');
          }
        }

        if (factCheckView && factCheckView.style.display !== 'none') {
          const factCheckButtons = factCheckView.querySelectorAll('.expand-collapse-btn');
          factCheckButtons.forEach(button => button.remove());
        }
        
        console.log(`Set up ${expandButtons.length} collapsible buttons`);
      }
      
      // Add this function to handle contextual actions
      async function handleContextualAction(action, originalText, originalResponse) {
        // Get current prompt type
        const currentPromptType = annotationDiv.dataset.promptType || 'explain';
        const currentPromptText = promptTypes[currentPromptType];

        // Define follow-up prompts that reference the current prompt type
        const promptMap = {
          'deeper': `Take the existing ${currentPromptType} explanation that was generated using "${currentPromptText}" and go deeper, providing more detail while maintaining the same format and style. Original text: "${originalText}"`,
          'technical': `Provide a more technical version of the ${currentPromptType} explanation, using specific terminology and concepts while maintaining the same format. Original text: "${originalText}"`,
          'examples': `Building on the ${currentPromptType} explanation, provide 3-4 concrete real-world examples that illustrate these points. Original text: "${originalText}"`,
          'analogy': `Based on the ${currentPromptType} explanation, explain these concepts using 2-3 clear analogies that relate to the key points. Original text: "${originalText}"`
        };

        content.textContent = "Loading explanation...";
        annotationDiv.classList.add('loading');

        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${!!window.BOBBY_CONFIG?.OPENAI_API_KEY ? window.BOBBY_CONFIG.OPENAI_API_KEY : ''}`
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: `You are helping to provide a follow-up ${action} explanation for a ${currentPromptType} response. Maintain the same structure and format as the original prompt type.`
                },
                {
                  role: "user",
                  content: promptMap[action]
                }
              ]
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          // Use the same format as the current prompt type
          const formattedContent = await formatContent(currentPromptType, data.choices[0].message.content, originalText);
          content.innerHTML = formattedContent;

          // Add to history with context
          await window.HistoryManager.addToHistory(
            originalText,
            formattedContent,
            `${currentPromptType} (${action} follow-up)`
          );
        } catch (error) {
          console.error('API Error:', error);
          content.textContent = `Error: ${error.message}`;
        } finally {
          annotationDiv.classList.remove('loading');
        }
      }

      // Update addContextualButtons to reflect the current prompt type
      function addContextualButtons(container, text, response) {
        const existingButtons = container.querySelector('.context-buttons');
        if (existingButtons) {
          existingButtons.remove();
        }

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'context-buttons';

        const currentPromptType = container.dataset.promptType || 'explain';
        
        const buttons = [
          { 
            action: 'deeper', 
            text: currentPromptType === 'summarize' ? '🔍 More Detail' : '🔍 Go Deeper'
          },
          { 
            action: 'technical', 
            text: currentPromptType === 'eli5' ? '🔬 Adult Version' : '🔬 More Technical'
          },
          { 
            action: 'examples', 
            text: currentPromptType === 'examples' ? '🔍 More Examples' : '💡 Show Examples'
          },
          { 
            action: 'followup', 
            text: '❓ Ask Follow-up'
          }
        ];

        buttons.forEach(({ action, text: buttonText }) => {
          const button = document.createElement('button');
          button.className = 'context-button';
          button.textContent = buttonText;
          button.onclick = action === 'followup' 
            ? () => showFollowUpInput(text, response)
            : () => handleContextualAction(action, text, response);
          buttonsContainer.appendChild(button);
        });

        container.appendChild(buttonsContainer);
      }

      // Add this at the top level of content.js
      let followUpStack = [];

      // Update showFollowUpInput function
      async function showFollowUpInput(originalText, originalResponse) {
        // Get references to the correct elements
        const popoutDiv = annotationDiv;
        const contentDiv = popoutDiv.querySelector('.modern-popout-body');
        
        // Push current state to stack instead of local variable
        followUpStack.push({
          content: contentDiv.innerHTML,
          text: originalText,
          response: originalResponse
        });

        // Ensure popup stays visible
        popoutDiv.style.display = 'flex';
        popoutDiv.style.opacity = '1';
        popoutDiv.style.visibility = 'visible';

        // Stop event propagation to prevent popup from closing
        popoutDiv.onclick = (e) => e.stopPropagation();

        // Create input container
        const inputContainer = document.createElement('div');
        inputContainer.className = 'followup-input';
        inputContainer.innerHTML = `
          <div class="followup-header">
            <button class="followup-back">← Back</button>
            <div class="followup-title">Ask a Follow-up Question</div>
          </div>
          <textarea 
            placeholder="Type your follow-up question here..."
            class="followup-textarea"
            rows="2"
          ></textarea>
          <div class="followup-buttons">
            <button class="followup-submit">Ask</button>
            <button class="followup-cancel">Cancel</button>
          </div>
        `;

        // Replace content
        contentDiv.innerHTML = '';
        contentDiv.appendChild(inputContainer);

        // Get textarea reference before adding event handlers
        const textarea = inputContainer.querySelector('textarea');
        const submitButton = inputContainer.querySelector('.followup-submit');

        // Stop propagation on input container
        inputContainer.onclick = (e) => e.stopPropagation();

        // Handle submit
        submitButton.onclick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const question = textarea.value.trim();
          if (!question) return;

          try {
            popoutDiv.style.display = 'flex';
            popoutDiv.style.opacity = '1';
            popoutDiv.style.visibility = 'visible';
            contentDiv.innerHTML = '<div class="loading-text">Loading response...</div>';
            popoutDiv.classList.add('loading');

            // Create combined prompt with context
            const combinedPrompt = `
              Context from previous explanation: "${originalResponse}"
              Original text being explained: "${originalText}"
              Follow-up question: "${question}"
              
              Please provide a detailed answer to the follow-up question, using the context provided and real-time information if needed.
            `;

            const response = await new Promise((resolve, reject) => {
              chrome.runtime.sendMessage({
                action: "exaAnswer",
                prompt: combinedPrompt,
                exaKey: !!window.BOBBY_CONFIG?.EXA_API_KEY ? window.BOBBY_CONFIG.EXA_API_KEY : ''
              }, response => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                  return;
                }
                if (response.success) {
                  resolve(response.data);
                } else {
                  reject(new Error(response.error));
                }
              });
            });

            // Add error checking for response format
            if (!response || !response.answer) {
              throw new Error('Invalid response format from Exa API');
            }

            const answer = response.answer
              // Remove [1], [2], etc.
              .replace(/\[\d+\]/g, '')
              // Remove (Source: ...) patterns
              .replace(/\(Source:.*?\)/g, '')
              // Remove any trailing citations list if present
              .split(/Sources:|References:/i)[0]
              // Clean up any double spaces or newlines
              .replace(/\s+/g, ' ')
              .trim();

            const citations = response.citations || [];

            // Format citations in a more elegant way
            let citationsHtml = '';
            if (citations.length > 0) {
              citationsHtml = `
                <div class="citations-block">
                  <div class="citations-title">Sources</div>
                  <ul class="citations-list">
                    ${citations.map((c, index) => `
                      <li class="citation-item">
                        <span class="citation-tooltip">
                          <span class="citation-number">[${index + 1}]</span>
                          <span class="tooltip-content">${c.url}</span>
                        </span>
                        <a href="${c.url}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="citation-link"
                           title="${c.text || ''}"
                        >
                          ${c.title || c.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                        </a>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              `;
            }

            // Add to history with properly formatted content
            await window.HistoryManager.addToHistory(
              question,
              `${answer}${citationsHtml}`,  // Changed from formattedAnswer
              'follow-up'
            );

            // Process answer based on length
            let answerContent = '';
            
            if (answer.length > 500) {
              // For long answers, create collapsible content
              answerContent = `
                <div class="collapsible-container">
                  <div class="collapsible-content collapsed">
                    <div class="followup-answer-content">
                      ${answer}
                      ${citationsHtml}
                    </div>
                  </div>
                  <button class="expand-collapse-btn">Show More</button>
                </div>
              `;
            } else {
              // For shorter answers, display normally
              answerContent = `
                <div class="followup-answer-content">
                  ${answer}
                  ${citationsHtml}
                </div>
              `;
            }
            
            // Update the formatted content template
            const formattedContent = `
              <div class="followup-container">
                <div class="followup-header">
                  <button class="followup-back">← Back</button>
                  <div class="followup-title">Follow-up Answer</div>
                </div>
                <div class="bobby-response followup">
                  <div class="followup-question">
                    <strong>Your question:</strong> ${question}
                  </div>
                  <div class="followup-answer">
                    ${answerContent}
                  </div>
                </div>
                <div class="followup-actions">
                  <button class="followup-ask-another">Ask Another Question</button>
                </div>
              </div>
            `;

            contentDiv.innerHTML = formattedContent;

            // Re-attach event listeners
            const container = contentDiv.querySelector('.followup-container');
            
            // Setup collapsible content
            setupCollapsibleContent();
            container.onclick = (e) => e.stopPropagation();

            // Ensure proper scrolling for the answer
            const followupAnswer = contentDiv.querySelector('.followup-answer');
            if (followupAnswer) {
              // Calculate available height
              const header = annotationDiv.querySelector('.followup-header');
              const question = annotationDiv.querySelector('.followup-question');
              const actions = annotationDiv.querySelector('.followup-actions');
              
              if (header && question && actions) {
                const totalHeight = annotationDiv.offsetHeight;
                const headerHeight = header.offsetHeight;
                const questionHeight = question.offsetHeight;
                const actionsHeight = actions.offsetHeight;
                
                // Calculate available height for the answer
                const availableHeight = totalHeight - headerHeight - questionHeight - actionsHeight - 40; // 40px for padding
                
                // Set max-height and ensure scrolling
                followupAnswer.style.maxHeight = `${Math.max(200, availableHeight)}px`;
                followupAnswer.style.overflowY = 'auto';
              }
            }

            const backButton = contentDiv.querySelector('.followup-back');
            backButton.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Pop the current state
              if (followUpStack.length > 0) {
                const previousState = followUpStack.pop();
                contentDiv.innerHTML = previousState.content;
                
                // Re-attach event handlers for the restored view
                reattachEventHandlers(contentDiv, previousState.text, previousState.response);
                
                // Re-attach back button handler for the restored view
                const restoredBackButton = contentDiv.querySelector('.followup-back');
                if (restoredBackButton) {
                  restoredBackButton.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (followUpStack.length > 0) {
                      const prevState = followUpStack.pop();
                      contentDiv.innerHTML = prevState.content;
                      reattachEventHandlers(contentDiv, prevState.text, prevState.response);
                    }
                  };
                }
              }
            };

            const askAnotherButton = contentDiv.querySelector('.followup-ask-another');
            askAnotherButton.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              showFollowUpInput(originalText, originalResponse);
            };
          } catch (error) {
            console.error('Follow-up error:', error);
            contentDiv.innerHTML = `
              <div class="followup-container">
                <div class="followup-header">
                  <button class="followup-back">← Back</button>
                  <div class="followup-title">Error</div>
                </div>
                <div class="bobby-response error">
                  <p class="bobby-text">Error: ${error.message}</p>
                </div>
              </div>
            `;
            
            const backButton = contentDiv.querySelector('.followup-back');
            backButton.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (followUpStack.length > 0) {
                const previousState = followUpStack.pop();
                contentDiv.innerHTML = previousState.content;
                reattachEventHandlers(contentDiv, previousState.text, previousState.response);
              }
            };
          } finally {
            popoutDiv.classList.remove('loading');
          }
        };

        // Handle cancel with propagation stopped
        const cancelButton = inputContainer.querySelector('.followup-cancel');
        cancelButton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (followUpStack.length > 0) {
            const previousState = followUpStack.pop();
            contentDiv.innerHTML = previousState.content;
            reattachEventHandlers(contentDiv, previousState.text, previousState.response);
          }
        };

        // Handle Enter key
        textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            submitButton.click();
          }
        });

        // Focus the textarea
        textarea.focus();
      }

      // Update reattachEventHandlers function to properly handle back buttons
      function reattachEventHandlers(contentDiv, originalText, originalResponse) {
        // Reattach click handlers for buttons in the restored view
        const container = contentDiv.querySelector('.followup-container');
        if (container) {
          container.onclick = (e) => e.stopPropagation();
          
          // Re-attach back button handler
          const backButton = container.querySelector('.followup-back');
          if (backButton) {
            backButton.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (followUpStack.length > 0) {
                const previousState = followUpStack.pop();
                contentDiv.innerHTML = previousState.content;
                reattachEventHandlers(contentDiv, previousState.text, previousState.response);
              }
            };
          }
          
          const askAnotherButton = container.querySelector('.followup-ask-another');
          if (askAnotherButton) {
            askAnotherButton.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              showFollowUpInput(originalText, originalResponse);
            };
          }
        }

        // Reattach handlers for contextual buttons if present
        const contextButtons = contentDiv.querySelectorAll('.context-button');
        contextButtons.forEach(button => {
          const action = button.getAttribute('data-action');
          if (action === 'followup') {
            button.onclick = () => showFollowUpInput(originalText, originalResponse);
          } else if (action) {
            button.onclick = () => handleContextualAction(action, originalText, originalResponse);
          }
        });
      }

      // Add Exa API integration for related reading
      async function getRelatedReading(text) {
        try {
          const response = await chrome.runtime.sendMessage({
            action: "getRelatedReading",
            text: text
          });
          
          if (!response.success) {
            throw new Error(response.error);
          }
          
          return response.data;
        } catch (error) {
          console.error('Error fetching related reading:', error);
          throw error;
        }
      }

      function formatFactCheckResults(results) {
        // Helper function to get status icon and color based on confidence
        const getStatusInfo = (assessment, confidence) => {
          if (assessment.toLowerCase() === 'true') {
            return {
              icon: '✅',
              bgClass: confidence > 75 ? 'high-confidence' : 
                      confidence > 50 ? 'medium-confidence' : 
                      'low-confidence',
              textClass: confidence > 75 ? 'text-green-700' :
                        confidence > 50 ? 'text-yellow-700' :
                        'text-red-700'
            };
          } else if (assessment.toLowerCase() === 'false') {
            return {
              icon: '❌',
              bgClass: 'false',
              textClass: 'text-red-700'
            };
          } else {
            return {
              icon: '❓',
              bgClass: 'insufficient',
              textClass: 'text-gray-700'
            };
          }
        };

        return `
          <div class="fact-check-results">
            ${results.map(result => {
              const { icon, bgClass, textClass } = getStatusInfo(result.assessment, result.confidence);
              return `
                <div class="fact-check-item ${bgClass}">
                  <div class="fact-status">
                    ${icon}
                    <span class="confidence ${textClass}">${result.confidence}% confident</span>
                  </div>
                  <div class="claim-text">${result.claim}</div>
                  <div class="summary">${result.summary}</div>
                  ${result.assessment === 'False' ? `
                    <div class="correction">
                      <strong>Correction:</strong> ${result.fixed_text}
                    </div>
                  ` : ''}
                  <div class="sources">
                    <strong>Sources:</strong>
                    <ul class="source-list">
                      ${result.sources.map(url => `
                        <li><a href="${url}" target="_blank" class="source-link">${url}</a></li>
                      `).join('')}
                    </ul>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      // Helper function to create fact check view
      function createFactCheckView() {
        const factCheckView = document.createElement('div');
        factCheckView.className = 'fact-check-view';
        
        factCheckView.innerHTML = `
          <div class="fact-check-header">
            <button class="go-back-button" title="Back to main view">←</button>
            <div class="bobby-header">FACT CHECK</div>
            <div class="powered-by">
              Powered by Exa
            </div>
          </div>
          <div class="fact-check-content"></div>
        `;

        // Make the fact check view draggable using the header
        const factCheckHeader = factCheckView.querySelector('.fact-check-header');
        window.initDraggable(annotationDiv, factCheckHeader);

        // Add click handler for go back button
        const backButton = factCheckView.querySelector('.go-back-button');
        backButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          console.log('Fact check back button clicked');
          
          // Hide fact check view completely
          factCheckView.style.display = 'none';
          factCheckView.style.visibility = 'hidden';
          
          // Show main view
          const mainView = annotationDiv.querySelector('.main-view');
          if (mainView) {
            // Make the main view fully visible
            mainView.style.display = 'flex';
            mainView.style.visibility = 'visible';
            mainView.style.opacity = '1';
            
            // Ensure the prompt selector is visible with higher specificity
            const promptSelector = annotationDiv.querySelector('.custom-prompt-selector');
            if (promptSelector) {
              promptSelector.style.display = 'inline-block';
              promptSelector.style.visibility = 'visible';
              promptSelector.style.opacity = '1';
              
              // Make sure the header is visible
              const header = mainView.querySelector('.modern-popout-header');
              if (header) {
                header.style.display = 'flex';
                header.style.visibility = 'visible';
              }
            }
            
            // Force a redraw by accessing offsetHeight to ensure styles apply
            void mainView.offsetHeight;
            
            // Ensure proper state of UI elements in main view
            const content = mainView.querySelector('.modern-popout-body');
            if (content) {
              // Make sure this is visible too
              content.style.display = 'block';
              content.style.visibility = 'visible';
              
              // Use try-catch to avoid errors if setupCollapsibleContent has issues
              try {
                setupCollapsibleContent(content);
              } catch (error) {
                console.error('Error setting up collapsible content:', error);
              }
            }
            
            console.log('Main view is now visible');
          }
          
          // Remove any stray Show More buttons in the fact check view
          const expandButtons = factCheckView.querySelectorAll('.expand-collapse-btn');
          expandButtons.forEach(button => button.remove());
        });

        annotationDiv.appendChild(factCheckView);
        return factCheckView;
      }

      // Add mouseup event listener to show the button when text is selected
      document.addEventListener('mouseup', (e) => {
        // Check for text selection
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        if (text.length > 0) {
          // Small delay to ensure selection is complete
          setTimeout(() => {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            showFabButton(rect, text, 0); // Add explicit retry count of 0
          }, 10);
        }
      });

      // Add cleanup when popup is closed
      document.addEventListener('click', (e) => {
        if (annotationDiv && 
            !annotationDiv.contains(e.target) && 
            !e.target.closest('.drag-handle') &&
            !window.isDragging) {
          // Clear the follow-up stack when closing the popup
          followUpStack = [];
          annotationDiv.remove();
          annotationDiv = null;
        }
      });

      async function sendToOpenAI(text) {
        await window.configLoaded; // Wait for config to load
        
        if (!window.BOBBY_CONFIG.OPENAI_API_KEY) {
          throw new Error('OpenAI API key not set. Please set it in the extension options.');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.BOBBY_CONFIG.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{
              role: "user",
              content: text
            }]
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      }

      // Add this function after setupCollapsibleContent
      function debugCollapsibleContent() {
        const containers = document.querySelectorAll('.collapsible-container');
        console.log('Found collapsible containers:', containers.length);
        
        containers.forEach((container, index) => {
          const content = container.querySelector('.collapsible-content');
          const button = container.querySelector('.expand-collapse-btn');
          
          console.log(`Container ${index}:`, {
            hasContent: !!content,
            contentClasses: content ? content.className : 'N/A',
            hasButton: !!button,
            buttonText: button ? button.textContent : 'N/A',
            contentHeight: content ? content.scrollHeight : 'N/A',
            containerHeight: container.scrollHeight
          });
        });
      }

      // Call this after setupCollapsibleContent() in the appropriate places
      // For example, after line 272 and line 1241
      setupCollapsibleContent();
      debugCollapsibleContent();
    } catch (error) {
      console.error('Initialization error:', error);
      // Attempt to recover
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }).catch(error => {
    console.error('Config loading error:', error);
  });
} 