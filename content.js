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

      let annotationDiv = null;
      let fabButton = null;

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
        
        let isResizing = true;
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = annotationDiv.offsetWidth;
        const startHeight = annotationDiv.offsetHeight;
        
        const resize = (e) => {
          if (!isResizing || !annotationDiv) return;
          
          requestAnimationFrame(() => {
            // Calculate deltas
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            // Set new dimensions
            const newWidth = Math.min(800, Math.max(300, startWidth + deltaX));
            const newHeight = Math.min(800, Math.max(200, startHeight + deltaY));
            
            // Apply dimensions
            annotationDiv.style.width = `${newWidth}px`;
            annotationDiv.style.height = `${newHeight}px`;
            
            // Adjust content height
            const header = annotationDiv.querySelector('.modern-popout-header');
            const content = annotationDiv.querySelector('.modern-popout-body');
            if (content && header) {
              content.style.height = `${newHeight - header.offsetHeight - 32}px`;
            }
          });
        };

        const stopResize = () => {
          isResizing = false;
          document.body.style.cursor = '';
          document.removeEventListener('mousemove', resize);
          document.removeEventListener('mouseup', stopResize);
          document.removeEventListener('mouseleave', stopResize);
          if (annotationDiv) {
            annotationDiv.classList.remove('resizing');
            // Ensure popup stays visible
            annotationDiv.style.display = 'flex';
            annotationDiv.style.opacity = '1';
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
          
          // Create prompt selector
          const promptSelector = document.createElement('select');
          promptSelector.className = 'prompt-selector';
          promptSelector.innerHTML = `
            <option value="explain">Explain Simply</option>
            <option value="eli5">Explain Like I'm 5</option>
            <option value="key-points">Key Points</option>
            <option value="examples">Real Examples</option>
            <option value="pros-cons">Pros & Cons</option>
            <option value="next-steps">Next Steps</option>
            <option value="related">Related Reading</option>
            <option value="summarize">Summarize</option>
          `;
          
          // Add change event listener for prompt selector
          promptSelector.addEventListener('change', async () => {
            const selectedPrompt = promptSelector.value;
            annotationDiv.dataset.promptType = selectedPrompt;
            content.textContent = "Loading explanation...";
            annotationDiv.classList.add('loading');
            copyButton.style.display = 'none';
            
            try {
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
            }
          });
          
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
          
          promptSelector.value = settings.defaultPrompt;

          // Add to document body
          document.body.appendChild(annotationDiv);
        } else {
          copyButton = annotationDiv.querySelector('.copy-button');
          content = annotationDiv.querySelector('.modern-popout-body');
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
          const selectedPrompt = annotationDiv.querySelector('.prompt-selector').value;
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

        // Add event listeners to resizers
        annotationDiv.querySelectorAll('.resizer').forEach(resizer => {
          resizer.addEventListener('mousedown', initResize);
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

      // Update showFabButton function
      function showFabButton(rect, text) {
        try {
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
          // Create a new button if the old one was invalidated
          if (error.message.includes('Extension context invalidated')) {
            fabButton = null;
            // Retry showing the button
            setTimeout(() => showFabButton(rect, text), 100);
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
          if (left + buttonWidth > window.innerWidth - spacing) {
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
            return `
              <div class="bobby-response key-points">
                <div class="bobby-header">Key Points</div>
                <ul class="bobby-list">
                  ${createBulletPoints(content)}
                </ul>
              </div>
            `;
          
          case 'eli5':
            return `
              <div class="bobby-response eli5">
                <div class="bobby-header">Simple Explanation</div>
                <p class="bobby-text">
                  ${sanitizeText(content)}
                </p>
              </div>
            `;
          
          case 'pros-cons':
            try {
              // Split content into "Pros" and "Cons" sections
              const sections = content.split(/(?:pros?:|cons?:|advantages?:|disadvantages?:)/i)
                .filter(section => section.trim());
              
              const prosPoints = sections[0] ? createBulletPoints(sections[0]) : '<li>No pros provided</li>';
              const consPoints = sections[1] ? createBulletPoints(sections[1]) : '<li>No cons provided</li>';
              
              return `
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
              `;
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
            return `
              <div class="bobby-response next-steps">
                <div class="bobby-header">Suggested Next Steps</div>
                <ol class="bobby-list ordered">
                  ${content.split(/\d+\./)
                    .filter(step => step.trim())
                    .map(step => `<li>${step.trim()}</li>`)
                    .join('')}
                </ol>
              </div>
            `;
          
          case 'examples':
            return `
              <div class="bobby-response examples">
                <div class="bobby-header">Real-World Examples</div>
                <ul class="bobby-list">
                  ${createBulletPoints(content)}
                </ul>
              </div>
            `;
          
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

              return `
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
              `;
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
            return `
              <div class="bobby-response explanation">
                <div class="bobby-header">Explanation</div>
                <p class="bobby-text">
                  ${sanitizeText(content)}
                </p>
              </div>
            `;
        }
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
      function showFollowUpInput(originalText, originalResponse) {
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
                        <span class="citation-number">[${index + 1}]</span>
                        <a href="${c.url}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="citation-link"
                           title="${c.text || ''}"
                        >
                          ${c.title || c.url}
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
                    <div class="followup-answer-content">
                      ${answer}
                      ${citationsHtml}
                    </div>
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
            container.onclick = (e) => e.stopPropagation();

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
        factCheckView.querySelector('.go-back-button').onclick = () => {
          factCheckView.style.display = 'none';
          annotationDiv.querySelector('.main-view').style.display = 'flex';
        };

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
            showFabButton(rect, text);
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