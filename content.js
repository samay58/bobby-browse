// Check if script is already initialized
if (typeof window.__quickExplainInitialized === 'undefined') {
  // Wait for config to load before initializing
  window.configLoaded.then(() => {
  try {
    window.__quickExplainInitialized = true;

      // Add custom CSS for the Teenage Engineering inspired UI
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        /* Clean modern prompt toggle buttons */
        .prompt-toggle-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 6px;
          margin-top: 8px;
          max-height: 230px;
          overflow-y: auto;
        }
        
        .prompt-toggle {
          position: relative;
          padding: 8px 12px;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          color: #495057;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }
        
        .prompt-toggle:hover {
          background: #f8f9fa;
          border-color: #ced4da;
        }
        
        .prompt-toggle.active {
          background: #e7f5ff;
          border-color: #4dabf7;
          color: #1971c2;
          outline: 2px solid #74c0fc;
          outline-offset: 1px;
        }
        
        .prompt-icon {
          font-size: 14px;
          opacity: 0.8;
        }
        
        .prompt-text {
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        /* Differentiate between prompt types with subtle colors */
        .prompt-toggle[data-value="explain"] {
          border-left: 3px solid #fd7e14;
        }
        
        .prompt-toggle[data-value="eli5"] {
          border-left: 3px solid #339af0;
        }
        
        .prompt-toggle[data-value="key-points"] {
          border-left: 3px solid #7950f2;
        }
        
        .prompt-toggle[data-value="summarize"] {
          border-left: 3px solid #20c997;
        }
        
        .prompt-toggle[data-value="pros-cons"] {
          border-left: 3px solid #495057;
        }
        
        .prompt-toggle[data-value="examples"] {
          border-left: 3px solid #e64980;
        }
        
        .prompt-toggle[data-value="technical"] {
          border-left: 3px solid #495057;
        }
        
        .prompt-toggle[data-value="fact-check"] {
          border-left: 3px solid #fa5252;
        }
        
        .prompt-toggle[data-value="analogy"] {
          border-left: 3px solid #fab005;
        }
        
        /* Dark mode adjustments */
        .modern-popout.dark .prompt-toggle-bar {
          background: #343a40;
        }
        
        .modern-popout.dark .prompt-toggle {
          background: #212529;
          border-color: #495057;
          color: #ced4da;
        }
        
        .modern-popout.dark .prompt-toggle:hover {
          background: #2b3035;
        }
        
        .modern-popout.dark .prompt-toggle.active {
          background: #1864ab;
          border-color: #339af0;
          color: #e7f5ff;
        }
        
        /* Context buttons at the bottom - secondary style */
        .context-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
          justify-content: flex-start;
        }
        
        .context-button {
          padding: 6px 10px;
          background: #f1f3f5;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 12px;
          color: #495057;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .context-button:hover {
          background: #e9ecef;
          border-color: #ced4da;
        }
        
        .modern-popout.dark .context-button {
          background: #343a40;
          border-color: #495057;
          color: #ced4da;
        }
        
        .modern-popout.dark .context-button:hover {
          background: #2b3035;
        }
        
        /* Fix layout - ensure buttons are contained within popup */
        .modern-popout-body {
          display: flex;
          flex-direction: column;
        }
        
        .modern-popout-body .bobby-response {
          flex: 1;
          overflow-y: auto;
        }
        
        .modern-popout-body .prompt-toggle-bar {
          flex-shrink: 0;
        }
      `;
      document.head.appendChild(styleElement);

    console.log('Content script loaded!');
    
    // We keep text labels now, so this function is modified to just ensure proper layout
    function convertButtonsToIconOnly() {
      // Find all buttons with the class 'prompt-toggle'
      const promptButtons = document.querySelectorAll('.prompt-toggle');
      
      promptButtons.forEach(btn => {
        // Make sure each button has proper structure
        const iconEl = btn.querySelector('.prompt-icon');
        const textEl = btn.querySelector('.prompt-text');
        
        if (iconEl && textEl) {
          // Just ensure the title attribute is set for accessibility
          const buttonText = textEl.textContent;
          btn.setAttribute('title', buttonText);
        }
      });
      
      console.log('Button display format maintained with text labels');
    }
    
    // Set up a mutation observer to catch dynamically added buttons
    const buttonObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length || mutation.type === 'childList') {
          // Look for prompt-toggle-bar being added
          const toggleBar = document.querySelector('.prompt-toggle-bar');
          if (toggleBar) {
            // Wait a bit for the buttons to be added to the bar
            setTimeout(convertButtonsToIconOnly, 50);
          }
        }
      }
    });
    
    // Start observing
    buttonObserver.observe(document.body, { 
      childList: true,
      subtree: true
    });

    // Define promptTypes at the top level with enhanced, detailed instructions
    const promptTypes = {
      explain: "Explain this text in simple, clear terms that anyone can understand. Break down complex concepts and provide context where needed. Focus on making the content accessible while preserving the key information.",
      
      eli5: "Explain this text as if talking to a 5-year-old child. Use extremely simple language, short sentences, and child-friendly examples. Avoid complex terminology completely. Make it engaging and easy to understand for someone with no background knowledge.",
      
      'key-points': "Extract and list the most important key points from this text in bullet-point format. Focus on the main ideas, critical facts, and essential takeaways. Organize points by importance and ensure none of the crucial information is missed.",
      
      examples: "Provide 3-4 concrete, real-world examples that illustrate this concept clearly. For each example, explain how it demonstrates the main idea. Use diverse, relatable scenarios that help show practical applications.",
      
      'pros-cons': "Present a balanced analysis of both sides of this topic. List 3-4 clear advantages/benefits and 3-4 disadvantages/limitations, each with a brief explanation. Be objective and thorough in covering different perspectives.",
      
      'next-steps': "Suggest 4-5 practical, actionable next steps based on this information. Make recommendations specific, realistic and immediately applicable. Include brief explanations of how each step helps and what outcome to expect.",
      
      related: "Identify the most relevant academic papers, research, and publications related to this topic. For each source, provide the title, authors, publication date, and a 1-2 sentence summary of key findings or contributions.",
      
      summarize: "Create a concise, comprehensive summary of this text that captures all essential information in roughly 25% of the original length. Maintain the core message while eliminating redundancies and secondary details.",
      
      'fact-check': "Thoroughly verify the factual claims in this text and provide evidence for each verification. Identify any potential inaccuracies or misrepresentations. Support your analysis with credible sources where possible.",
      
      technical: "Provide a detailed technical explanation with precise terminology and domain-specific language. Assume an expert audience with background knowledge. Include relevant technical concepts, methodologies, frameworks, and technical implications.",
      
      analogy: "Explain this concept using 3-4 clear, intuitive analogies or metaphors. For each analogy, explain how it maps to the original concept and helps understand it. Choose analogies from different domains to provide multiple perspectives."
    };

    // Tell background script we're ready
    chrome.runtime.sendMessage({ action: "content_script_ready" });

      // Initialize global variables
    let annotationDiv = null;
    let fabButton = null;
    let copyButton = null;
    // isPinned functionality removed
      
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
      
      const resize = (e) => {
          if (!isResizing || !annotationDiv || !document.body.contains(annotationDiv)) {
            isResizing = false;
            return;
          }
        
          // Use requestAnimationFrame to optimize performance
        requestAnimationFrame(() => {
          // Calculate deltas
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          
            // Set new dimensions with min/max constraints
            // Enforce both width and height changes together
          const newWidth = Math.min(800, Math.max(300, startWidth + deltaX));
          const newHeight = Math.min(800, Math.max(200, startHeight + deltaY));
          
            // Save current dimensions before resizing to check if they changed
            const oldWidth = annotationDiv.offsetWidth;
            const oldHeight = annotationDiv.offsetHeight;
            
            // Apply dimensions - directly modify both width and height
          annotationDiv.style.width = `${newWidth}px`;
          annotationDiv.style.height = `${newHeight}px`;
          
            // Force reflow to ensure the changes are applied
            void annotationDiv.offsetWidth;
            
            // Ensure the popup stays visible
            annotationDiv.style.display = 'flex';
            annotationDiv.style.opacity = '1';
            
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
            }
            
            // Log resize dimensions for debugging
            console.log(`Resizing: ${oldWidth}x${oldHeight} → ${newWidth}x${newHeight}`);
        });
      };

      const stopResize = () => {
        isResizing = false;
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        document.removeEventListener('mouseleave', stopResize);
          
          if (annotationDiv && document.body.contains(annotationDiv)) {
          annotationDiv.classList.remove('resizing');
            // Ensure popup stays visible and fully opaque
          annotationDiv.style.display = 'flex';
          annotationDiv.style.opacity = '1';
            
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
              content.style.height = `${annotationDiv.offsetHeight - header.offsetHeight - 32}px`;
            }
            
            // Guarantee visibility after a brief delay (to handle any race conditions)
            setTimeout(() => {
              if (annotationDiv && document.body.contains(annotationDiv)) {
                annotationDiv.style.display = 'flex';
                annotationDiv.style.opacity = '1';
              }
            }, 50);
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
        
        // Create content div
        content = document.createElement('div');
        content.className = 'modern-popout-body';
        
        // Add all the main UI elements to mainView
        mainView.appendChild(header);
        mainView.appendChild(content);
        annotationDiv.appendChild(mainView);
        
        // Ensure content takes available space
        content.style.flex = '1';
        content.style.overflow = 'auto';
        
        // Add only bottom-right resizer
        const resizer = document.createElement('div');
        resizer.className = 'resizer bottom-right';
        resizer.addEventListener('mousedown', initResize);
        annotationDiv.appendChild(resizer);
        
          // Create fact check button
          const factCheckButton = document.createElement('button');
          factCheckButton.className = 'fact-check-button';
          factCheckButton.innerHTML = '🔍 Fact Check';
        
        // Create copy button
        copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '📋 Copy';
        copyButton.style.display = 'none';
        
        // Pin button removed per requirements
        
        // Add buttons to the header
        header.appendChild(factCheckButton);
        header.appendChild(copyButton);
          
          // Set up copy button click handler
          copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(content.textContent);
            copyButton.innerHTML = '✓ Copied!';
            setTimeout(() => {
              copyButton.innerHTML = '📋 Copy';
            }, 2000);
          });
          
          // Set up fact check button click handler
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
              const text = annotationDiv.dataset.originalText;
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
        
          // Set initial prompt
          const initialPrompt = settings.defaultPrompt;
          
          // Store the prompt type on the annotation div
          annotationDiv.dataset.promptType = initialPrompt;

        // Add to document body
        document.body.appendChild(annotationDiv);
      } else {
        copyButton = annotationDiv.querySelector('.copy-button');
        content = annotationDiv.querySelector('.modern-popout-body');
          
          // Reset the prompt type
          annotationDiv.dataset.promptType = settings.defaultPrompt;
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

        // Apply animation to make it visible
        setTimeout(() => {
          if (annotationDiv) {
            annotationDiv.classList.add('visible');
            
            // Call the function to convert buttons to icon-only when popup becomes visible
            setTimeout(() => {
              convertButtonsToIconOnly();
              
              // Call it again after some time to catch any late-added buttons
              setTimeout(convertButtonsToIconOnly, 300);
            }, 100);
            
            // After it's visible, check if we need to adjust the size to fit all content
            setTimeout(() => {
              const promptToggleBar = annotationDiv.querySelector('.prompt-toggle-bar');
              const contentBody = annotationDiv.querySelector('.modern-popout-body');
              const header = annotationDiv.querySelector('.modern-popout-header');
              
              if (promptToggleBar && contentBody && header) {
                // Set up flex layout for better content expansion
                contentBody.style.flex = '1';
                contentBody.style.overflow = 'auto';
                contentBody.style.display = 'flex';
                contentBody.style.flexDirection = 'column';
                
                // Find bobby-response container and make it take available space
                const responseContainer = contentBody.querySelector('.bobby-response');
                if (responseContainer) {
                  responseContainer.style.flex = '1';
                  responseContainer.style.overflow = 'auto';
                }
                
                const headerHeight = header.offsetHeight;
                const promptBarHeight = promptToggleBar.offsetHeight;
                
                console.log('Adjusted heights:', {
                  annotationHeight: annotationDiv.offsetHeight,
                  headerHeight,
                  promptBarHeight,
                  contentBodyHeight: contentBody.offsetHeight
                });
              }
            }, 100);
          }
        }, 10);
        
        // START: Dynamic Prompt Selector
        // After positioning is set up, determine relevant prompts and create toggle bar
        determineRelevantPrompts(text).then(relevantPrompts => {
          console.log('Relevant prompts for selected text:', relevantPrompts);
          
          // Store the original text for later prompt changes
          annotationDiv.dataset.originalText = text;
          
          // Remove any existing toggle bar
          const existingToggleBar = annotationDiv.querySelector('.prompt-toggle-bar');
          if (existingToggleBar) {
            existingToggleBar.remove();
          }
          
          // Create prompt toggle bar
          const promptToggleBar = document.createElement('div');
          promptToggleBar.className = 'prompt-toggle-bar';
          
          // Add buttons for each relevant prompt
          relevantPrompts.forEach(promptId => {
            const btn = document.createElement('button');
            btn.className = 'prompt-toggle';
            btn.setAttribute('data-value', promptId);
            
            // Add appropriate icon based on prompt type (Teenage Engineering style)
            let iconChar = '';
            switch(promptId) {
              case 'explain':
                iconChar = '⚡';
                break;
              case 'eli5':
                iconChar = '🔄';
                break;
              case 'key-points':
                iconChar = '⋮';
                break;
              case 'summarize':
                iconChar = '◯';
                break;
              case 'pros-cons':
                iconChar = '◆';
                break;
              case 'examples':
                iconChar = '⧠';
                break;
              case 'technical':
                iconChar = '∞';
                break;
              case 'fact-check':
                iconChar = '🔍';
                break;
              case 'analogy':
                iconChar = '≈';
                break;
              default:
                iconChar = '•';
            }
            
            // Create the button content with icon and text
            btn.innerHTML = `<span class="prompt-icon">${iconChar}</span><span class="prompt-text">${prettyNameFor(promptId)}</span>`;
            
            // Mark initial prompt as active
            if (promptId === settings.defaultPrompt) {
              btn.classList.add('active');
            }
            
            // Set up click handler
            btn.addEventListener('click', () => {
              // Special case for fact-check prompt
              if (promptId === 'fact-check') {
                // Manually trigger the fact check button
                const factCheckButton = annotationDiv.querySelector('.fact-check-button');
                if (factCheckButton) {
                  factCheckButton.click();
                  return;
                }
              }
              
              // Remove active class from all buttons
              promptToggleBar.querySelectorAll('.prompt-toggle').forEach(b => {
                b.classList.remove('active');
              });
              
              // Add active class to clicked button
              btn.classList.add('active');
              
              // Update the prompt type on the annotation div
              annotationDiv.dataset.promptType = promptId;
              
              // Process the selected prompt
              handlePromptChange(promptId);
            });
            
            promptToggleBar.appendChild(btn);
          });
          
          // Add the toggle bar to the main view
          const mainView = annotationDiv.querySelector('.main-view');
          mainView.appendChild(promptToggleBar);
        });
        // END: Dynamic Prompt Selector
        
        // Initialize content with loading message
        content.textContent = "Loading explanation...";
        annotationDiv.classList.add('loading');
        
        // Send the initial request with the default prompt
        try {
          console.log('Sending initial request to OpenAI...');
          // Use the default prompt
          const initialPrompt = settings.defaultPrompt;
          annotationDiv.dataset.promptType = initialPrompt;
          
          const promptText = promptTypes[initialPrompt];
          console.log('Initial prompt:', initialPrompt, 'Prompt text:', promptText);
          
          const response = await sendToOpenAI(text, initialPrompt);
          const formattedContent = await formatContent(initialPrompt, response.choices[0].message.content, text);
        content.innerHTML = formattedContent;
        copyButton.style.display = 'block';
        annotationDiv.classList.remove('loading');

        // Add contextual buttons
        addContextualButtons(annotationDiv, text, formattedContent);

        // Add to history
        await window.HistoryManager.addToHistory(
          text,
          formattedContent,
            initialPrompt
        );
      } catch (error) {
        console.error('API Error:', error);
        annotationDiv.classList.remove('loading');
        annotationDiv.classList.add('error');
        content.textContent = `Error: ${error.message}`;
        copyButton.style.display = 'none';
      }

        // Regardless of the API success/failure, create the prompt toggle bar
        // Now determine the relevant prompts and create the toggle bar
        determineRelevantPrompts(text).then(relevantPrompts => {
          console.log('Relevant prompts for selected text:', relevantPrompts);
          
          // Remove any existing toggle bar
          const existingToggleBar = annotationDiv.querySelector('.prompt-toggle-bar');
          if (existingToggleBar) {
            existingToggleBar.remove();
          }
          
          // Create prompt toggle bar
          const promptToggleBar = document.createElement('div');
          promptToggleBar.className = 'prompt-toggle-bar';
          
          // Add buttons for each relevant prompt
          relevantPrompts.forEach(promptId => {
            const btn = document.createElement('button');
            btn.className = 'prompt-toggle';
            btn.setAttribute('data-value', promptId);
            
            // Add appropriate icon based on prompt type (Teenage Engineering style)
            let iconChar = '';
            switch(promptId) {
              case 'explain':
                iconChar = '⚡';
                break;
              case 'eli5':
                iconChar = '🔄';
                break;
              case 'key-points':
                iconChar = '⋮';
                break;
              case 'summarize':
                iconChar = '◯';
                break;
              case 'pros-cons':
                iconChar = '◆';
                break;
              case 'examples':
                iconChar = '⧠';
                break;
              case 'technical':
                iconChar = '∞';
                break;
              case 'fact-check':
                iconChar = '🔍';
                break;
              case 'analogy':
                iconChar = '≈';
                break;
              default:
                iconChar = '•';
            }
            
            // Create the button content with icon and text
            btn.innerHTML = `<span class="prompt-icon">${iconChar}</span><span class="prompt-text">${prettyNameFor(promptId)}</span>`;
            
            // Mark initial prompt as active
            if (promptId === settings.defaultPrompt) {
              btn.classList.add('active');
            }
            
            // Set up click handler
            btn.addEventListener('click', () => {
              // Special case for fact-check prompt
              if (promptId === 'fact-check') {
                // Manually trigger the fact check button
                const factCheckButton = annotationDiv.querySelector('.fact-check-button');
                if (factCheckButton) {
                  factCheckButton.click();
                  return;
                }
              }
              
              // Remove active class from all buttons
              promptToggleBar.querySelectorAll('.prompt-toggle').forEach(b => {
                b.classList.remove('active');
              });
              
              // Add active class to clicked button
              btn.classList.add('active');
              
              // Update the prompt type on the annotation div
              annotationDiv.dataset.promptType = promptId;
              
              // Process the selected prompt
              handlePromptChange(promptId);
            });
            
            promptToggleBar.appendChild(btn);
          });
          
          // Add the toggle bar to the main view
          const mainView = annotationDiv.querySelector('.main-view');
          mainView.appendChild(promptToggleBar);
      });
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
            console.warn('Maximum FAB button retries reached, giving up');
            return;
          }

          // Check if extension context is still valid
          if (!chrome || !chrome.runtime) {
            console.error('Extension context is no longer valid');
            return;
          }

        // Store current selection info
        currentSelectionRect = rect;
        currentSelectedText = text;

        if (!fabButton) {
          fabButton = document.createElement('button');
          fabButton.className = 'quick-explain-fab';
          
            try {
          const icon = document.createElement('img');
          icon.src = chrome.runtime.getURL('assets/feather.svg');
          icon.className = 'bobby-icon';
          fabButton.appendChild(icon);
            } catch (iconError) {
              // If icon loading fails, continue without it
              console.warn('Failed to load FAB button icon:', iconError);
            }
            
          // Set tooltip for accessibility
          fabButton.setAttribute('title', 'Quick Explain');
          
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
            if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          showAnnotation(range.getBoundingClientRect(), text);
            } else {
              showAnnotation(null, text);
            }
          hideFabButton();
        };
      } catch (error) {
        console.error('Error showing FAB button:', error);
          // Create a new button if the old one was invalidated, but limit retries
          if (error.message.includes('Extension context invalidated') || 
              error.message.includes('chrome is not defined') ||
              error.message.includes('runtime is not defined')) {
            // Clean up any existing button
            if (fabButton && fabButton.parentNode) {
              try {
                fabButton.parentNode.removeChild(fabButton);
              } catch (e) {
                // Ignore removal errors
              }
            }
          fabButton = null;
            
            // Retry showing the button with incremented retry count
            setTimeout(() => showFabButton(rect, text, retryCount + 1), 200 * (retryCount + 1));
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
              <div class="bobby-section key-points-section">
                <div class="bobby-header">Key Points</div>
                <ul class="bobby-list">
                  ${createBulletPoints(content)}
                </ul>
              </div>
            </div>
            `);
        
        case 'eli5':
            return manageResponseLength(`
            <div class="bobby-response eli5">
              <div class="bobby-section eli5-section">
                <div class="bobby-header">Simple Explanation</div>
                <p class="bobby-text">
                  ${sanitizeText(content)}
                </p>
              </div>
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
              <div class="bobby-section next-steps-section">
                <div class="bobby-header">Suggested Next Steps</div>
                <ol class="bobby-list ordered">
                  ${content.split(/\d+\./)
                    .filter(step => step.trim())
                    .map(step => `<li>${step.trim()}</li>`)
                    .join('')}
                </ol>
              </div>
            </div>
            `);
        
        case 'examples':
            return manageResponseLength(`
            <div class="bobby-response examples">
              <div class="bobby-section examples-section">
                <div class="bobby-header">Real-World Examples</div>
                <ul class="bobby-list">
                  ${createBulletPoints(content)}
                </ul>
              </div>
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
              
              // Adjust the popup to fit expanded content
              const popout = container.closest('.modern-popout');
              if (popout) {
                // Get main container elements
                const mainView = popout.querySelector('.main-view');
                const popoutBody = popout.querySelector('.modern-popout-body');
                const header = popout.querySelector('.modern-popout-header');
                const promptToggleBar = popout.querySelector('.prompt-toggle-bar');
                
                // Calculate available height and new content height
                const totalHeight = Math.min(
                  // Limit to 80% of viewport height
                  window.innerHeight * 0.8,
                  // Set a reasonable max height based on content
                  Math.max(500, content.scrollHeight + 150)
                );
                
                // Apply new size to popup
                popout.style.height = `${totalHeight}px`;
                
                // Ensure content body takes available space
                if (popoutBody) {
                  popoutBody.style.flex = '1';
                  popoutBody.style.overflow = 'auto';
                  popoutBody.style.display = 'flex';
                  popoutBody.style.flexDirection = 'column';
                  
                  // Find and adjust the bobby-response container
                  const responseContainer = popoutBody.querySelector('.bobby-response');
                  if (responseContainer) {
                    responseContainer.style.flex = '1';
                    responseContainer.style.overflow = 'auto';
                  }
                }
                
                console.log('Adjusted popup size for expanded content:', {
                  totalHeight,
                  contentHeight: content.scrollHeight
                });
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

            // Extract citation markers and create references map
            let citationsMap = new Map();
            const citations = response.citations || [];
            
            // Process answer to replace URLs with footnote references
            let answer = response.answer;
            
            // First, remove standard citation patterns and all URLs
            answer = answer
              // Remove standard citation notation like [1], [2], etc.
            .replace(/\[\d+\]/g, '')
            // Remove (Source: ...) patterns
            .replace(/\(Source:.*?\)/g, '')
              // Remove any citation links with URLs - more aggressive pattern
              .replace(/\bhttps?:\/\/\S+/g, '')
              // Also remove URLs that might be in parentheses
              .replace(/\([^()]*https?:\/\/[^()]*\)/g, '')
            // Remove any trailing citations list if present
              .split(/Sources:|References:|Source[s]? list:/i)[0]
            // Clean up any double spaces or newlines
            .replace(/\s+/g, ' ')
            .trim();

            // Add footnote markers to the text at better positions
            if (citations.length > 0) {
              // We'll create an array to store citations that were successfully placed
              const placedCitations = [];
              
              citations.forEach((citation, index) => {
                // Create a unique ID for this citation
                const citationId = `citation-${Date.now()}-${index}`;
                const citationNumber = index + 1;
                
                // Store citation details
                citationsMap.set(citationId, {
                  index: citationNumber,
                  url: citation.url,
                  title: citation.title || citation.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0],
                  text: citation.text || ''
                });
                
                // Try to place the citation in appropriate positions in the text
                let inserted = false;
                
                // First try: keywords from citation text
                if (citation.text) {
                  // Extract phrases (3+ words) or significant words from citation
                  const phrases = citation.text.match(/\b[\w\s]{10,60}\b/g) || [];
                  const significantWords = citation.text.match(/\b[A-Za-z]{6,}\b/g) || [];
                  
                  // Check phrases first (more specific)
                  for (const phrase of phrases) {
                    if (answer.includes(phrase) && !inserted) {
                      const phraseBoundary = answer.indexOf(phrase) + phrase.length;
                      answer = insertCitationAt(answer, phraseBoundary, citationId, citationNumber);
                      placedCitations.push(citationId);
                      inserted = true;
                      break;
                    }
                  }
                  
                  // If phrase matching didn't work, try words
                  if (!inserted) {
                    for (const word of significantWords) {
                      if (answer.includes(word) && !inserted) {
                        // Find sentence containing the word
                        const wordIndex = answer.indexOf(word);
                        const sentenceEnd = answer.indexOf('.', wordIndex);
                        
                        if (sentenceEnd > wordIndex) {
                          answer = insertCitationAt(answer, sentenceEnd, citationId, citationNumber);
                          placedCitations.push(citationId);
                          inserted = true;
                          break;
                        }
                      }
                    }
                  }
                }
                
                // Second try: title keywords
                if (!inserted && citation.title) {
                  const titleWords = citation.title.match(/\b[A-Za-z]{5,}\b/g) || [];
                  for (const word of titleWords) {
                    if (answer.includes(word) && !inserted) {
                      const sentenceEnd = answer.indexOf('.', answer.indexOf(word));
                      if (sentenceEnd > -1) {
                        answer = insertCitationAt(answer, sentenceEnd, citationId, citationNumber);
                        placedCitations.push(citationId);
                        inserted = true;
                        break;
                      }
                    }
                  }
                }
                
                // Third try (fallback): insert at the end of the paragraph/sentence with relevant content
                if (!inserted) {
                  // For unplaced citations, add at the end of the answer
                  const paragraphs = answer.split('. ');
                  if (paragraphs.length > 1) {
                    // Add to the last paragraph that's long enough
                    for (let i = paragraphs.length - 1; i >= 0; i--) {
                      if (paragraphs[i].length > 50 && !inserted) {
                        paragraphs[i] += ` <sup class="citation-marker" data-id="${citationId}">[${citationNumber}]</sup>`;
                        placedCitations.push(citationId);
                        inserted = true;
                        break;
                      }
                    }
                    
                    // Join paragraphs back together
                    answer = paragraphs.join('. ');
                  } else {
                    // If there's only one paragraph, add at the end
                    answer += ` <sup class="citation-marker" data-id="${citationId}">[${citationNumber}]</sup>`;
                    placedCitations.push(citationId);
                    inserted = true;
                  }
                }
              });
              
              // Create a filtered map of only placed citations
              try {
                const placedCitationsMap = new Map();
                placedCitations.forEach(id => {
                  if (citationsMap.has(id)) {
                    placedCitationsMap.set(id, citationsMap.get(id));
                  }
                });
                
                // Use the filtered map for rendering
                citationsMap = placedCitationsMap;
              } catch (mapError) {
                console.error('Error while filtering citation map:', mapError);
                // If we encounter an error, just continue with the original map
              }
            }
            
            // Helper function to insert citation at a specific position
            function insertCitationAt(text, position, id, number) {
              if (position <= 0 || position >= text.length) return text;
              
              // Find the nearest sentence boundary
              const nextChar = text.charAt(position);
              let insertPos = position;
              
              // If we're not at the end of a sentence, try to find one
              if (!['.', '!', '?'].includes(nextChar)) {
                const nextPeriod = text.indexOf('.', position);
                const nextQuestion = text.indexOf('?', position);
                const nextExclamation = text.indexOf('!', position);
                
                // Find the closest sentence ending
                const candidates = [
                  nextPeriod > -1 ? nextPeriod : Infinity,
                  nextQuestion > -1 ? nextQuestion : Infinity,
                  nextExclamation > -1 ? nextExclamation : Infinity
                ];
                
                const minPos = Math.min(...candidates);
                if (minPos < Infinity) {
                  insertPos = minPos + 1; // +1 to place after the punctuation
                }
              }
              
              // Insert the citation marker
              return text.substring(0, insertPos) + 
                    ` <sup class="citation-marker" data-id="${id}">[${number}]</sup>` + 
                    text.substring(insertPos);
            }

            // Format citations as clean footnotes
          let citationsHtml = '';
            try {
              if (citationsMap && citationsMap.size > 0) {
            citationsHtml = `
                  <div class="citations-footnotes">
                    <hr class="citations-divider">
                    <div class="citations-title">References</div>
                    <ol class="citations-list">
                      ${Array.from(citationsMap.values()).sort((a, b) => a.index - b.index).map(citation => {
                        try {
                          // Create a short display URL
                          const displayUrl = citation.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
                          // Get title or domain name
                          const title = citation.title || displayUrl;
                          // Format the snippet
                          const snippet = citation.text 
                            ? citation.text.substring(0, 120) + (citation.text.length > 120 ? '...' : '') 
                            : '';
                          
                          return `
                            <li class="citation-item" id="${citation.index}">
                              <div class="citation-content">
                                <span class="citation-tooltip">
                                  <span class="citation-text">${title}</span>
                                  <span class="tooltip-content">
                                    <div class="tooltip-snippet">${snippet}</div>
                                    <div class="tooltip-url">${citation.url}</div>
                                  </span>
                                </span>
                                <a href="${citation.url}" 
                         target="_blank" 
                         rel="noopener noreferrer" 
                         class="citation-link"
                      >
                                  ${citation.url}
                      </a>
                              </div>
                    </li>
                          `;
                        } catch (citationError) {
                          console.error('Error formatting citation:', citationError);
                          return `<li class="citation-item">Citation information unavailable</li>`;
                        }
                      }).join('')}
                    </ol>
              </div>
            `;
              }
            } catch (formatError) {
              console.error('Error formatting citations:', formatError);
              citationsHtml = ''; // Use empty string if there's an error
          }

          // Add to history with properly formatted content
          await window.HistoryManager.addToHistory(
            question,
              `${answer}${citationsHtml}`,
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

            // Setup citation marker clicks
            setupCitationMarkers(contentDiv);

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

            // Update the back button to always return to the main answer
          const backButton = contentDiv.querySelector('.followup-back');
          backButton.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (followUpStack.length > 0) {
                const mainState = followUpStack[0]; // Always go to the main view
                followUpStack = []; // Reset the stack
                
                contentDiv.innerHTML = mainState.content;
                
                // Explicitly set up the Show More button functionality
                setupCollapsibleContent(contentDiv);
                
                // Set up any citation markers
                if (typeof setupCitationMarkers === 'function') {
                  setupCitationMarkers(contentDiv);
                }
                
                console.log('Returned to main view from error handler');
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
        // Always make sure the collapsible content works
        setupCollapsibleContent(contentDiv);
        
      // Reattach click handlers for buttons in the restored view
      const container = contentDiv.querySelector('.followup-container');
      if (container) {
        container.onclick = (e) => e.stopPropagation();
        
          // Re-attach back button handler with the new behavior (always return to main view)
        const backButton = container.querySelector('.followup-back');
        if (backButton) {
          backButton.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
              
              // Always return to the main answer (first in stack)
            if (followUpStack.length > 0) {
                // Get the main answer state (first item added to the stack)
                const mainState = followUpStack[0];
                
                // Reset the stack
                followUpStack = [];
                
                // Restore the main answer view
                contentDiv.innerHTML = mainState.content;
                
                // Explicitly reattach event handlers
                setupCollapsibleContent(contentDiv);
                
                // Setup citation markers if available
                if (typeof setupCitationMarkers === 'function') {
                  setupCitationMarkers(contentDiv);
                }
                
                console.log('Returned to main answer view with event handlers restored');
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
              Powered by <img src="${chrome.runtime.getURL('assets/exa-logo.png')}" alt="Exa" class="exa-logo">
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

      async function sendToOpenAI(text, promptType) {
        await window.configLoaded; // Wait for config to load
        
        if (!window.BOBBY_CONFIG.OPENAI_API_KEY) {
          throw new Error('OpenAI API key not set. Please set it in the extension options.');
        }
        
        // If no promptType was provided, try to get it from the current annotation div
        if (!promptType && annotationDiv) {
          promptType = annotationDiv.dataset.promptType || 'explain';
        } else if (!promptType) {
          promptType = 'explain'; // Default fallback
        }
        
        // Get the prompt template for the selected type
        const promptTemplate = promptTypes[promptType] || promptTypes['explain'];
        
        // Combine the prompt template with the selected text
        const combinedPrompt = `${promptTemplate}\n\nText: "${text}"`;
        
        console.log('Sending to OpenAI with prompt type:', promptType);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.BOBBY_CONFIG.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant that provides clear, accurate explanations based on the prompt type requested."
              },
              {
                role: "user",
                content: combinedPrompt
              }
            ]
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

      // Add this function for citation marker handling
      function setupCitationMarkers(container) {
        if (!container) {
          console.log('No container provided to setupCitationMarkers');
          return;
        }
        
        // First, make sure the container is fully rendered
        setTimeout(() => {
          try {
            // Find all citation markers
            const markers = container.querySelectorAll('.citation-marker');
            console.log(`Found ${markers.length} citation markers to setup`);
            
            if (markers.length === 0) return;
            
            markers.forEach(marker => {
              // Remove any existing click listeners to avoid duplicates
              const newMarker = marker.cloneNode(true);
              if (marker.parentNode) {
                marker.parentNode.replaceChild(newMarker, marker);
              }
              
              newMarker.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                  // Get the citation number
                  const citationNumber = newMarker.textContent.replace(/[\[\]]/g, '');
                  
                  // Find the corresponding footnote
                  const footnote = container.querySelector(`.citation-item[id="${citationNumber}"]`);
                  
                  if (footnote) {
                    // Highlight the footnote temporarily
                    footnote.style.backgroundColor = 'rgba(26, 115, 232, 0.1)';
                    
                    // Scroll to the footnote
                    const answerContainer = container.querySelector('.followup-answer');
                    if (answerContainer) {
                      const footnotesContainer = answerContainer.querySelector('.citations-footnotes');
                      if (footnotesContainer) {
                        // Make sure the footnotes section is visible
                        footnotesContainer.style.display = 'block';
                        
                        // Calculate scroll position (add a small offset for better visibility)
                        const footnoteTop = footnote.offsetTop;
                        const desiredPosition = footnoteTop - 60; // 60px offset from top
                        
                        // Smooth scroll to the footnote
                        answerContainer.scrollTo({
                          top: desiredPosition,
                          behavior: 'smooth'
                        });
                        
                        // Log for debugging
                        console.log(`Scrolling to citation #${citationNumber}`);
                      }
                    }
                    
                    // Remove highlight after a delay
                    setTimeout(() => {
                      footnote.style.backgroundColor = '';
                    }, 2000);
                  } else {
                    console.warn(`Citation #${citationNumber} not found in the document`);
                  }
                } catch (markerError) {
                  console.error('Error handling citation marker click:', markerError);
                }
              });
            });
            
            // Add return links from footnotes back to citations in text
            const footnoteItems = container.querySelectorAll('.citation-item');
            console.log(`Found ${footnoteItems.length} footnote items to setup`);
            
            footnoteItems.forEach(item => {
              // Skip if already has return link
              if (item.querySelector('.citation-return-link')) return;
              
              try {
                const itemNumber = item.id;
                if (!itemNumber) {
                  console.warn('Footnote item has no ID:', item);
                  return;
                }
                
                // Create a "return to text" button
                const returnButton = document.createElement('span');
                returnButton.className = 'citation-return-link';
                returnButton.innerHTML = '↑';
                returnButton.title = 'Return to citation in text';
                
                returnButton.addEventListener('click', () => {
                  try {
                    // Find all markers with this number
                    const markers = Array.from(container.querySelectorAll('.citation-marker')).filter(
                      marker => marker.textContent.includes(`[${itemNumber}]`)
                    );
                    
                    if (markers.length > 0) {
                      // Scroll to the first occurrence of this marker
                      const marker = markers[0];
                      
                      // Find the answer container
                      const answerContainer = container.querySelector('.followup-answer');
                      if (answerContainer) {
                        try {
                          // Calculate scroll position
                          const markerPosition = marker.getBoundingClientRect().top;
                          const containerPosition = answerContainer.getBoundingClientRect().top;
                          const relativePosition = markerPosition - containerPosition;
                          
                          // Scroll the container
                          answerContainer.scrollTo({
                            top: answerContainer.scrollTop + relativePosition - 30,
                            behavior: 'smooth'
                          });
                        } catch (scrollError) {
                          console.error('Error scrolling to marker:', scrollError);
                          // Fallback scrolling method
                          answerContainer.scrollTop = 0;
                        }
                      }
                      
                      // Highlight the marker temporarily
                      marker.style.backgroundColor = 'rgba(26, 115, 232, 0.2)';
                      setTimeout(() => {
                        marker.style.backgroundColor = '';
                      }, 2000);
                    }
                  } catch (returnError) {
                    console.error('Error handling return link click:', returnError);
                  }
                });
                
                // Add return button to the appropriate location in the footnote
                if (item.querySelector('.citation-text')) {
                  // Add it near the title
                  item.querySelector('.citation-text').appendChild(returnButton);
                } else if (item.querySelector('.citation-content')) {
                  // Alternative: add it to the content container
                  item.querySelector('.citation-content').appendChild(returnButton);
                } else {
                  // Last resort: add directly to the list item
                  item.appendChild(returnButton);
                }
              } catch (itemError) {
                console.error('Error setting up footnote item:', itemError);
              }
            });
          } catch (error) {
            console.error('Error setting up citation markers:', error);
          }
        }, 150); // Increased delay to ensure DOM is ready
      }

      // Add a new function to analyze text and suggest relevant prompts
      function analyzeTextForPromptSuggestions(text) {
        // Base set of universal prompts that are always included
        const suggestedPrompts = [
          {value: 'explain', text: 'Explain Simply'},
          {value: 'eli5', text: 'Explain Like I\'m 5'},
          {value: 'summarize', text: 'Summarize'}
        ];
        
        // Clean and normalize the text for analysis
        const cleanText = text.toLowerCase().trim();
        
        // Check for opinions, debates, or comparative content (Pros/Cons)
        if (
          /\b(should|versus|vs\.|vs|compared to|better than|worse than|advantages|disadvantages|benefits|drawbacks|pros|cons|for and against|arguments|debate|opinion|perspective|viewpoint|disagree|agree)\b/i.test(cleanText) ||
          /\bor\b.{1,30}\bor\b/i.test(cleanText) || // Checking for "X or Y or Z" patterns
          /\?(.*)(yes|no)/i.test(cleanText) ||
          /\b(good|bad)\b.{1,20}\b(good|bad)\b/i.test(cleanText)
        ) {
          suggestedPrompts.push({value: 'pros-cons', text: 'Pros & Cons'});
        }
        
        // Check for factual claims
        const factualPatterns = [
          /\b(according to|research shows|studies indicate|report|reported|survey|data shows|statistics|percent|percentage|[0-9]+%|in [0-9]{4})\b/i,
          /\b(said|stated|claimed|announced|published|released|confirmed|verified|proven|discovered)\b/i,
          /\b(historical|history|fact|factual|factually|actually|literally|officially|genuinely|authentically|verifiably|truthfully)\b/i,
          /\b(experts|scientists|researchers|scholars|historians|analysts|professionals|specialists|authorities)\b/i,
          /\b(found|produced|created|generated|developed|established|determined|calculated|measured|observed)\b/i
        ];
        
        if (factualPatterns.some(pattern => pattern.test(cleanText))) {
          suggestedPrompts.push({value: 'fact-check', text: 'Fact Check'});
        }
        
        // Check for technical content
        const technicalPatterns = [
          /\b(code|function|algorithm|api|database|variable|class|method|object|interface|module|component|parameter|argument|return|value|array|string|integer|boolean|compile|runtime|syntax|framework|library|package|dependency|version|release|update|bug|error|exception|try|catch|finally|async|await|promise|callback|event|listener|protocol|request|response|server|client|endpoint|authentication|authorization|token|cookie|session|cache|buffer|stream|thread|process|cpu|memory|disk|network|bandwidth|latency|throughput|performance|optimization|scalability|security|vulnerability|encryption|decryption|hash|cipher|key|certificate|firewall|proxy|load balancer|cluster|node|instance|container|docker|kubernetes|aws|azure|gcp|cloud|deployment|continuous integration|continuous deployment|agile|scrum|kanban|sprint|backlog|user story|feature|milestone|iteration|regression|unit test|integration test|acceptance test|end-to-end test|mock|stub|harness|fixture|assert|expect|describe|it|test|spec)\b/i,
          /\b[a-z]+\.[a-z]+\(/i, // Method calls like object.method()
          /\b(function|class|const|let|var|if|else|for|while|do|switch|case|try|catch|finally|async|await)\b/i, // Programming keywords
          /(```[\s\S]*?```|\{|\}|\[|\]|\(|\)|;|\/\/|\/\*|\*\/)/g, // Code blocks or symbols
          /\b[A-Z][a-z]+([A-Z][a-z]+)+\b/g // CamelCase identifiers
        ];
        
        if (technicalPatterns.some(pattern => pattern.test(cleanText))) {
          suggestedPrompts.push({value: 'technical', text: 'Technical'});
        }
        
        // Check for content that needs next steps or actions
        const nextStepsPatterns = [
          /\b(how (can|do|should|would) i|what (can|do|should|would) i|steps to|guide to|tutorial|instructions|procedure|process|strategy|approach|plan|roadmap|blueprint|framework|methodology|technique|best practice|recommendation|suggestion|advice|tip|hint|pointer|insight|direction|guidance|help me|assist me|show me|teach me|explain how|tell me how|what is the way to|how to|what to do)\b/i,
          /\?/g // Contains questions
        ];
        
        if (
          nextStepsPatterns.some(pattern => pattern.test(cleanText)) ||
          (cleanText.match(/\?/g) || []).length >= 2 // Contains multiple questions
        ) {
          suggestedPrompts.push({value: 'next-steps', text: 'Next Steps'});
        }
        
        // Check for complex concepts that would benefit from analogies
        const complexPatterns = [
          /\b(complex|complicated|difficult|advanced|sophisticated|intricate|elaborate|convoluted|nuanced|subtle|abstract|theoretical|conceptual|philosophical|academic|scholarly|scientific|technical|specialized|professional|expert|high-level|deep|profound|esoteric|obscure|arcane|abstruse|recondite|enigmatic|mysterious|puzzling|perplexing|baffling|confusing|bewildering|mind-boggling|head-scratching)\b/i,
          /\b(concept|theory|principle|idea|notion|hypothesis|postulate|axiom|theorem|law|rule|formula|equation|model|framework|paradigm|perspective|viewpoint|approach|methodology|technique)\b/i
        ];
        
        if (complexPatterns.some(pattern => pattern.test(cleanText))) {
          suggestedPrompts.push({value: 'analogy', text: 'Analogies'});
        }
        
        // Check for educational content that would benefit from examples
        const examplePatterns = [
          /\b(example|instance|case|scenario|situation|illustration|demonstration|sample|specimen|model|paradigm|exemplar|prototype|archetype|template|pattern|standard|reference|benchmark)\b/i,
          /\b(such as|like|for instance|in particular|specifically|namely|to illustrate|to demonstrate|as an example|as a case in point|for example|e\.g\.)\b/i
        ];
        
        if (examplePatterns.some(pattern => pattern.test(cleanText))) {
          suggestedPrompts.push({value: 'examples', text: 'Real Examples'});
        }
        
        // Add key points for longer text
        if (text.length > 200 || text.split(' ').length > 40) {
          suggestedPrompts.push({value: 'key-points', text: 'Key Points'});
        }
        
        // Add related reading for academic or research-oriented content
        const academicPatterns = [
          /\b(research|study|studies|investigation|experiment|trial|survey|analysis|examination|exploration|inquiry|probe|review|assessment|evaluation|article|paper|publication|journal|conference|symposium|seminar|workshop|thesis|dissertation|monograph|treatise|manuscript|volume|edition|issue|chapter|section|paragraph|academia|academic|scholarly|scientific|empirical|theoretical|conceptual|experimental|qualitative|quantitative|mixed methods|methodology|data|result|finding|conclusion|implication|recommendation|limitation|delimitation|assumption|hypothesis|research question|objective|aim|purpose|goal|scope|significance|rationale|justification|background|context|literature|framework|theory|model|paradigm|approach|perspective|viewpoint|stance|position|argument|reasoning|logic|critique|criticism|debate|discourse|discussion|dialogue|conversation|deliberation|negotiation|mediation|consensus|disagreement|contention|controversy|dispute|bibliography|reference|citation|quotation|paraphrase|summary|synthesis|analysis)\b/i
        ];
        
        if (academicPatterns.some(pattern => pattern.test(cleanText))) {
          suggestedPrompts.push({value: 'related', text: 'Related Reading'});
        }
        
        // Limit to a reasonable number of options (max 7)
        return suggestedPrompts.slice(0, 7);
      }

      // Create a more sophisticated function to determine relevant prompts
      async function determineRelevantPrompts(selectedText) {
        // Always include these universal prompts
        const universalPrompts = ['explain', 'eli5', 'summarize'];
        let dynamicPrompts = [];
        
        // Clean the text for analysis
        const cleanText = selectedText.toLowerCase().trim();
        
        // A. Detect potential opinions/arguments for "Pros/Cons"
        if (/(should|ought to|best|worst|versus|vs\.?|debate|pros|cons|advantages?|disadvantages?|benefits|drawbacks|better|worse|good|bad|better than|worse than|compared to|against|for|agree|disagree|neutral|balance|weigh|consider|critique|review|assessment|recommendation)/i.test(cleanText)) {
          dynamicPrompts.push('pros-cons');
        }
        
        // B. Detect likely factual statements for "Fact Check"
        if (/\d{4}/.test(cleanText) || 
            /(study|data|report|survey|claims?|statistics|according|research|evidence|showed|demonstrates|concludes|state(s|d)?|experts?|scientists?|said|mentioned|noted|published|released|announced|confirmed|found|discovered|verified|proven|disproven|valid|invalid|accurate|inaccurate|true|false|correct|incorrect|statistics|percent|[\d]+\%)/i.test(cleanText)) {
          dynamicPrompts.push('fact-check');
        }
        
        // C. Detect code/technical references for "Technical Explanation"
        if (/(function|class|method|interface|API|endpoint|parameter|algorithm|framework|library|package|module|component|service|server|client|database|query|schema|model|architecture|pattern|design|implementation|system|network|protocol|authentication|authorization|encryption|security|performance|optimization|compiler|interpreter|runtime|syntax|semantics|debugging|testing|deployment|infrastructure|cloud|containerization|orchestration|scaling|load balancing|caching|indexing|hashing|encryption|decryption|frontend|backend|fullstack|dev|programming|code|coding|software|development|engineering|computation|Java|C\+\+|Python|JavaScript|TypeScript|Ruby|PHP|Go|Swift|Kotlin|Rust|SQL|NoSQL|HTML|CSS|JSON|XML|YAML|HTTP|HTTPS|TCP|IP|DNS|SSL|TLS|SaaS|PaaS|IaaS)/i.test(cleanText) ||
           /\b[A-Z][a-z]+([A-Z][a-z]+)+\b/.test(cleanText) || // CamelCase
           /\b[a-z]+\.[a-z]+\(/.test(cleanText) || // method calls
           /[{}[\]()<>]/.test(cleanText)) { // code symbols
          dynamicPrompts.push('technical');
        }
        
        // D. Detect next-step or advice-oriented language for "Next Steps"
        if (/(how (can|do|should|would|could|might) i|what (can|do|should|would|could|might) i|steps to|guide to|tutorial|instructions|procedure|process|strategy|approach|plan|roadmap|blueprint|framework|methodology|technique|best practice|recommendation|suggestion|advice|tip|hint|pointer|insight|direction|guidance|help me|assist me|show me|teach me|explain how|tell me how|what is the way to|how to|what to do|improve|increase|decrease|reduce|enhance|optimize|maximize|minimize|grow|expand|develop|advance|progress|succeed|achieve|accomplish|reach|attain|gain|earn|win|conquer|overcome|beat|defeat|handle|manage|deal with|cope with|address|solve|resolve|fix|repair|correct|adjust|modify|change|transform|convert|adapt|evolve|innovate|create|build|construct|make|produce|generate|formulate|design|devise|craft|establish)/i.test(cleanText) ||
           (cleanText.match(/\?/g) || []).length >= 2) { // Multiple questions
          dynamicPrompts.push('next-steps');
        }
        
        // E. Detect possibly complex or abstract text for "Analogy"
        if (/(complex|complicated|difficult|hard|confusing|abstract|theoretical|conceptual|philosophical|metaphysical|existential|epistemological|ontological|phenomenological|hermeneutical|dialectical|quantum|relativity|machine learning|deep learning|neural network|artificial intelligence|cognitive science|neuroscience|psychology|psychoanalysis|sociology|anthropology|economics|finance|thermodynamics|electromagnetism|chemistry|biology|genetics|molecular|atomic|subatomic|nuclear|fundamental|principle|theory|hypothesis|postulate|axiom|law|rule|formula|equation|model|framework|paradigm|perspective|viewpoint|understanding|comprehension|interpretation|meaning|implication|consequence|inference|deduction|induction|analysis|synthesis|evaluation|assessment|judgment|critique|criticism|review|examination|investigation|exploration|inquiry|probe|scrutiny|contemplation|reflection|introspection|meditation|rumination|consideration|deliberation|cogitation|thinking|thought|reasoning|logic|rationality|intellect|intelligence|mind|consciousness|awareness|perception|sensation|intuition|insight|revelation|epiphany|breakthrough|discovery|realization|recognition|cognition|metacognition|learning|knowledge|wisdom|enlightenment|illumination|clarity|lucidity|transparency|opacity|obscurity|ambiguity|vagueness|uncertainty|complexity|intricacy|sophistication|elaboration|nuance|subtlety|refinement|precision|accuracy|exactitude|rigor|formality|structure|organization|system|order|pattern|regularity|consistency|coherence|cohesion|integration|unity|wholeness|completeness|comprehensiveness|thoroughness|exhaustiveness|inclusiveness|exclusiveness|limitations|constraints|boundaries|parameters|dimensions|variables|constants|invariants|universals|particulars|specifics|details|aspects|facets|features|characteristics|qualities|properties|attributes|traits|types|kinds|classes|categories|classifications|taxonomies|hierarchies|networks|systems|structures|functions|operations|processes|mechanisms|dynamics|kinetics|statics|equilibria|homeostasis|feedback|control|regulation|adaptation|evolution|development|growth|maturation|decline|decay|entropy|negentropy|information|data|signal|noise|transmission|reception|encoding|decoding|interpretation|understanding)/i.test(cleanText)) {
          dynamicPrompts.push('analogy');
        }
        
        // F. Detect content that would benefit from examples
        if (/(example|instance|illustration|case study|demonstration|showcase|sample|specimen|exemplar|prototype|model|pattern|template|blueprint|archetype|precedent|antecedent|forerunner|precursor|such as|like|similar to|akin to|analogous to|comparable to|equivalent to|corresponding to|resembling|for instance|specifically|particularly|notably|especially|in particular|chiefly|principally|primarily|mainly|largely|mostly|predominantly|preponderantly|for example|e\.g\.|i\.e\.)/i.test(cleanText)) {
          dynamicPrompts.push('examples');
        }
        
        // G. Detect academic or research content
        if (/(research|study|studies|investigation|experiment|survey|analysis|review|literature|publication|journal|article|paper|monograph|thesis|dissertation|treatise|scholarly|academic|scientific|empirical|theoretical|methodology|method|approach|technique|procedure|protocol|data|result|finding|conclusion|implication|recommendation|limitation|scope|significance|relevance|importance|impact|influence|effect|consequence|correlation|causation|relationship|association|connection|link|bond|tie|nexus|reference|citation|quote|quotation|excerpt|extract|passage|section|chapter|volume|edition|issue|book|journal|proceedings|conference|symposium|colloquium|seminar|workshop|lecture|presentation|panel|discussion|debate|discourse|dialogue|conversation|inquiry|question|problem|issue|topic|subject|theme|matter|idea|concept|notion|theory|hypothesis|postulate|proposition|assumption|premise|inference|deduction|induction|abduction|logic|reason|reasoning|argument|argumentation|persuasion|rhetoric|dialectic|critique|criticism|evaluation|assessment|judgment|opinion|view|viewpoint|perspective|standpoint|stance|position|posture|attitude|orientation|outlook|mindset|worldview|paradigm|framework|schema|structure|system|network|taxonomy|classification|categorization|organization|arrangement|ordering|sequence|series|progression|hierarchy|spectrum|continuum|scale|gradation|degree|level|tier|rank|status|class|category|type|kind|genre|style|mode|manner|method|way|means|technique|approach|procedure|process|protocol|standard|principle|rule|law|maxim|dictum|adage|aphorism|apothegm|saying|proverb|mantra|motto|slogan|catchphrase|byword|byline|epigraph|epithet|epitaph|eulogy|encomium|accolade|tribute|homage|honor|respect|reverence|veneration|esteem|recognition|acknowledgment|appreciation|gratitude|thankfulness|indebtedness)/i.test(cleanText)) {
          dynamicPrompts.push('related');
        }
        
        // H. Detect content that would benefit from key points (longer text)
        if (selectedText.length > 200 || (selectedText.match(/\s+/g) || []).length > 30) {
          dynamicPrompts.push('key-points');
        }
        
        // Deduplicate prompts
        const allPrompts = [...new Set([...universalPrompts, ...dynamicPrompts])];
        
        // Limit to a reasonable number
        return allPrompts.slice(0, 7);
      }
      
      // Helper function to convert prompt IDs to user-friendly names
      function prettyNameFor(promptId) {
        switch (promptId) {
          case 'explain': return 'Explain Simply';
          case 'eli5': return 'ELI5';
          case 'summarize': return 'Summarize';
          case 'pros-cons': return 'Pros & Cons';
          case 'fact-check': return 'Fact Check';
          case 'technical': return 'Technical';
          case 'next-steps': return 'Next Steps';
          case 'analogy': return 'Analogies';
          case 'examples': return 'Real Examples';
          case 'key-points': return 'Key Points';
          case 'related': return 'Related Reading';
          default: return promptId.charAt(0).toUpperCase() + promptId.slice(1).replace(/-/g, ' ');
        }
      }

      // Add the handlePromptChange function to process prompt selections
      async function handlePromptChange(selectedPrompt) {
        console.log('Prompt changed to:', selectedPrompt);
        
        if (!annotationDiv || !content) {
          console.error('Cannot change prompt: annotation elements not found');
          return;
        }
        
        // Update the current prompt type
        annotationDiv.dataset.promptType = selectedPrompt;
        
        // Show loading state
        content.textContent = "Loading explanation...";
        annotationDiv.classList.add('loading');
        if (copyButton) copyButton.style.display = 'none';
        
        try {
          // Get the text from the currently stored content
          const text = annotationDiv.dataset.originalText;
          if (!text) {
            throw new Error('No text found to explain');
          }
          
          // Get the prompt text from the prompt type
          const promptText = promptTypes[selectedPrompt];
          console.log('Prompt selected:', selectedPrompt, 'Prompt text:', promptText);
          
          // Send request to OpenAI with the selected prompt type
          const response = await sendToOpenAI(text, selectedPrompt);
          const formattedContent = await formatContent(selectedPrompt, response.choices[0].message.content, text);
          
          // Update the content
          content.innerHTML = formattedContent;
          if (copyButton) copyButton.style.display = 'block';
          annotationDiv.classList.remove('loading');
          
          // Setup expand/collapse functionality for long content
          setupCollapsibleContent(content);
          
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
      }
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
