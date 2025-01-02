// Check if script is already initialized
if (typeof window.__quickExplainInitialized === 'undefined') {
  window.__quickExplainInitialized = true;

  console.log('Content script loaded!');

  // Define promptTypes at the top level
  const promptTypes = {
    explain: "Explain this in simple terms",
    eli5: "Explain this like I'm 5 years old",
    'key-points': "List the key points from this text",
    examples: "Give 3-4 concrete, real-world examples that illustrate this concept",
    debate: "Present both sides of this topic with 2-3 points for each side",
    'next-steps': "Suggest 3-5 practical next steps or actions based on this information",
    related: "Find related academic papers and research on this topic",
    counter: "What are the main counter-arguments or limitations",
    summarize: "Summarize this text concisely"
  };

  // Tell background script we're ready
  chrome.runtime.sendMessage({ action: "content_script_ready" });

  let annotationDiv = null;
  let fabButton = null;

  // Use config values
  const OPENAI_API_KEY = window.BOBBY_CONFIG.OPENAI_API_KEY;

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
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      console.log('Selection rect:', rect);
      
      showAnnotation(rect, selectedText);
    }
  });

  async function showAnnotation(rect, text) {
    const settings = await chrome.storage.sync.get({
      defaultPrompt: 'explain',
      theme: 'auto'
    });

    // Apply theme
    if (settings.theme !== 'auto') {
      annotationDiv?.classList.toggle('dark', settings.theme === 'dark');
    }

    // Set default prompt
    if (!annotationDiv) {
      annotationDiv = document.createElement('div');
      annotationDiv.className = 'modern-popout';
      
      const header = document.createElement('div');
      header.className = 'modern-popout-header';
      
      // Initialize draggable functionality
      window.initDraggable(annotationDiv, header);
      
      // Add prompt label
      const promptLabel = document.createElement('span');
      promptLabel.className = 'prompt-label';
      promptLabel.textContent = 'Select Prompt:';
      header.appendChild(promptLabel);
      
      // Create prompt selector
      const promptSelector = document.createElement('select');
      promptSelector.className = 'prompt-selector';
      promptSelector.innerHTML = `
        <option value="explain">Explain Simply</option>
        <option value="eli5">Explain Like I'm 5</option>
        <option value="key-points">Key Points</option>
        <option value="examples">Real Examples</option>
        <option value="debate">Debate Mode</option>
        <option value="next-steps">Next Steps</option>
        <option value="related">Related Reading</option>
        <option value="counter">Counter Arguments</option>
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
          
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [{
                role: "user",
                content: `${promptText}: "${text}"`
              }]
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          const formattedContent = await formatContent(selectedPrompt, data.choices[0].message.content, text);
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
      
      header.appendChild(promptSelector);
      header.appendChild(copyButton); // Add copy button to header
      
      content = document.createElement('div');
      content.className = 'modern-popout-body';
      
      annotationDiv.appendChild(header);
      annotationDiv.appendChild(content);
      document.body.appendChild(annotationDiv);
      
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(content.textContent);
        copyButton.innerHTML = '✓ Copied!';
        setTimeout(() => {
          copyButton.innerHTML = '📋 Copy';
        }, 2000);
      });
      
      promptSelector.value = settings.defaultPrompt;
    } else {
      copyButton = annotationDiv.querySelector('.copy-button');
      content = annotationDiv.querySelector('.modern-popout-body');
    }

    // Calculate vertical position
    const viewportHeight = window.innerHeight;
    const boxHeight = Math.min(400, viewportHeight - 80);
    let top = rect.top + window.scrollY - boxHeight/2; // Center align with selection

    // Keep the box within viewport bounds
    if (top < window.scrollY + 20) {
      top = window.scrollY + 20;
    } else if (top + boxHeight > window.scrollY + viewportHeight - 20) {
      top = window.scrollY + viewportHeight - boxHeight - 20;
    }

    // Apply the positioning
    annotationDiv.style.top = `${top}px`;
    annotationDiv.style.maxHeight = `${boxHeight}px`;

    // Calculate horizontal position
    const viewportWidth = window.innerWidth;
    const spaceOnRight = viewportWidth - rect.right - 40;
    const spaceOnLeft = rect.left - 40;

    if (spaceOnRight >= 380) {
      annotationDiv.style.left = 'auto';
      annotationDiv.style.right = '2rem';
    } else if (spaceOnLeft >= 380) {
      annotationDiv.style.right = 'auto';
      annotationDiv.style.left = '2rem';
    } else {
      annotationDiv.style.left = 'auto';
      annotationDiv.style.right = '2rem';
      annotationDiv.style.maxWidth = `${Math.max(spaceOnRight - 20, 280)}px`;
    }

    content.textContent = "Loading explanation...";
    annotationDiv.classList.add('loading');

    try {
      console.log('Sending request to OpenAI...');
      const selectedPrompt = annotationDiv.querySelector('.prompt-selector').value;
      const promptText = promptTypes[selectedPrompt];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: `${promptText}: "${text}"`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const formattedContent = await formatContent(selectedPrompt, data.choices[0].message.content, text);
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
    // Don't close if clicking the popup, drag handle, or during dragging
    if (annotationDiv && 
        !annotationDiv.contains(e.target) && 
        !e.target.closest('.drag-handle') &&
        !window.isDragging) { // Add check for dragging state
      annotationDiv.remove();
      annotationDiv = null;
    }
  });

  // Add this function to create/show the floating action button
  function showFabButton(rect, text) {
    if (!fabButton) {
      fabButton = document.createElement('button');
      fabButton.className = 'quick-explain-fab';
      
      // Create img element for the icon
      const icon = document.createElement('img');
      icon.src = chrome.runtime.getURL('icon.png');
      icon.className = 'bobby-icon';
      
      // Add icon and text
      fabButton.appendChild(icon);
      fabButton.appendChild(document.createTextNode('Explain'));
      
      document.body.appendChild(fabButton);
    }

    // Position the button near the selection
    const buttonHeight = 32;
    const spacing = 8;
    
    // Calculate position
    let top = rect.top + window.scrollY - buttonHeight - spacing;
    let left = rect.left + window.scrollX;
    
    // Adjust if would go off screen
    if (top < window.scrollY + spacing) {
      top = rect.bottom + window.scrollY + spacing;
    }
    
    // Keep button within viewport horizontally
    const viewportWidth = window.innerWidth;
    const buttonWidth = 100; // Approximate width
    if (left + buttonWidth > viewportWidth - spacing) {
      left = viewportWidth - buttonWidth - spacing;
    }
    
    fabButton.style.top = `${top}px`;
    fabButton.style.left = `${left}px`;
    
    // Store the selected text and rect in the button's data attributes
    fabButton.dataset.selectedText = text;
    
    // Show the button with animation
    requestAnimationFrame(() => {
      fabButton.classList.add('visible');
    });
    
    // Remove any existing click handlers
    fabButton.onclick = null;
    
    // Add click handler
    fabButton.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      showAnnotation(range.getBoundingClientRect(), text);
      hideFabButton();
    };
  }

  // Add function to hide the floating button
  function hideFabButton() {
    if (fabButton) {
      fabButton.classList.remove('visible');
      setTimeout(() => {
        if (fabButton && fabButton.parentNode) {
          fabButton.parentNode.removeChild(fabButton);
        }
        fabButton = null;
      }, 200);
    }
  }

  // Add mouseup event listener to show the button when text is selected
  document.addEventListener('mouseup', (e) => {
    // Hide existing fab button
    hideFabButton();
    
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

  // Hide fab button when clicking outside
  document.addEventListener('mousedown', (e) => {
    if (fabButton && !fabButton.contains(e.target)) {
      hideFabButton();
    }
  });

  // Hide fab button when scrolling
  document.addEventListener('scroll', () => {
    hideFabButton();
  });

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
      
      case 'counter':
        return `
          <div class="bobby-response counter">
            <div class="bobby-header">Counter Arguments</div>
            <ul class="bobby-list">
              ${createBulletPoints(content)}
            </ul>
          </div>
        `;
      
      case 'summarize':
        return `
          <div class="bobby-response summary">
            <div class="bobby-header">Summary</div>
            <p class="bobby-text">
              ${sanitizeText(content)}
            </p>
          </div>
        `;
      
      case 'pros-cons':
        const [pros, cons] = content.split(/pros:|cons:/i)
          .filter(section => section.trim())
          .map(createBulletPoints);
        
        return `
          <div class="bobby-response pros-cons">
            <div class="bobby-section">
              <div class="bobby-header">Pros</div>
              <ul class="bobby-list pros">${pros}</ul>
            </div>
            <div class="bobby-section">
              <div class="bobby-header">Cons</div>
              <ul class="bobby-list cons">${cons}</ul>
            </div>
          </div>
        `;
      
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
      
      case 'debate':
        try {
          // Split content into "For" and "Against" sections more reliably
          const sections = content.split(/(?:arguments?\s*)?for:|(?:arguments?\s*)?against:/i)
            .filter(section => section.trim());
          
          // Ensure we have both sections
          const forPoints = sections[0] ? createBulletPoints(sections[0]) : '<li>No arguments provided</li>';
          const againstPoints = sections[1] ? createBulletPoints(sections[1]) : '<li>No arguments provided</li>';
          
          return `
            <div class="bobby-response debate">
              <div class="bobby-section for-section">
                <div class="bobby-header">Arguments For</div>
                <ul class="bobby-list for">${forPoints}</ul>
              </div>
              <div class="bobby-section against-section">
                <div class="bobby-header">Arguments Against</div>
                <ul class="bobby-list against">${againstPoints}</ul>
              </div>
            </div>
          `;
        } catch (error) {
          console.error('Error formatting debate:', error);
          return `
            <div class="bobby-response error">
              <div class="bobby-header">Error</div>
              <p class="bobby-text">Failed to format debate points.</p>
            </div>
          `;
        }
      
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
    const promptMap = {
      'simplify': `Make this explanation even simpler and clearer: "${originalResponse}"`,
      'technical': `Provide a detailed technical explanation of this topic, including specific terminology and concepts: "${originalText}"`,
      'examples': `Provide 3-4 clear, concrete real-world examples that illustrate this concept. Format each example as a separate point with a brief explanation: "${originalText}"`,
      'analogy': `Explain this concept using 2-3 clear analogies. Make each analogy relatable and explain why it fits: "${originalText}"`
    };

    content.textContent = "Loading explanation...";
    annotationDiv.classList.add('loading');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: promptMap[action]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI');
      }

      // Format the response based on the action type
      let formattedContent;
      switch (action) {
        case 'examples':
          formattedContent = await formatContent('examples', data.choices[0].message.content, originalText);
          break;
        case 'technical':
          formattedContent = `
            <div class="bobby-response technical">
              <div class="bobby-header">Technical Explanation</div>
              <div class="bobby-text">
                ${data.choices[0].message.content.split('\n\n').map(p => `<p>${p}</p>`).join('')}
              </div>
            </div>
          `;
          break;
        case 'analogy':
          formattedContent = `
            <div class="bobby-response analogies">
              <div class="bobby-header">Analogies</div>
              <div class="bobby-analogies">
                ${data.choices[0].message.content.split(/\d+\.|\n\n/)
                  .filter(text => text.trim())
                  .map(analogy => `
                    <div class="bobby-analogy">
                      <p>${analogy.trim()}</p>
                    </div>
                  `).join('')}
              </div>
            </div>
          `;
          break;
        default:
          formattedContent = await formatContent('explain', data.choices[0].message.content, originalText);
      }

      content.innerHTML = formattedContent;
      
      // Add to history
      await window.HistoryManager.addToHistory(
        originalText,
        formattedContent,
        `${action} (follow-up)`
      );
    } catch (error) {
      console.error('API Error:', error);
      content.textContent = `Error: ${error.message}`;
    } finally {
      annotationDiv.classList.remove('loading');
    }
  }

  // Update the showAnnotation function to add contextual buttons
  function addContextualButtons(container, text, response) {
    // Remove existing buttons container if it exists
    const existingButtons = container.querySelector('.context-buttons');
    if (existingButtons) {
      existingButtons.remove();
    }

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'context-buttons';

    const buttons = [
      { action: 'simplify', text: '🔄 Simplify Further' },
      { action: 'technical', text: '🔬 More Technical' },
      { action: 'examples', text: '💡 Show Examples' },
      { action: 'analogy', text: '🎯 Use Analogy' }
    ];

    buttons.forEach(({ action, text: buttonText }) => {
      const button = document.createElement('button');
      button.className = 'context-button';
      button.textContent = buttonText;
      button.onclick = () => handleContextualAction(action, text, response);
      buttonsContainer.appendChild(button);
    });

    container.appendChild(buttonsContainer);
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
} 