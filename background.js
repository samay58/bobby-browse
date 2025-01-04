chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "searchExa") {
    fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'x-api-key': request.exaKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: request.query,
        numResults: 3,
        useAutoprompt: true,
        type: "auto",
        contents: {
          text: {
            maxCharacters: 1000,
            includeHtmlTags: false
          },
          highlights: {
            numSentences: 2,
            highlightsPerUrl: 1
          }
        },
        livecrawl: "always"
      })
    })
    .then(async response => {
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key or unauthorized access');
        } else if (response.status === 404) {
          throw new Error('Invalid API endpoint');
        }
        const text = await response.text();
        throw new Error(`API Error: ${response.status} - ${text}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data || !Array.isArray(data.results)) {
        throw new Error('Invalid response format from Exa API');
      }
      sendResponse({ success: true, data });
    })
    .catch(error => {
      console.error('Exa API Error:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true;
  }
}); 