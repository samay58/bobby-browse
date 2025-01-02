async function fetchRelatedReading(text) {
  try {
    // Get API key from storage
    const { EXA_API_KEY } = await chrome.storage.local.get('EXA_API_KEY');
    
    if (!EXA_API_KEY) {
      throw new Error('Please add your Exa API key to config.js');
    }

    console.log('Fetching related reading for:', text);
    
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'x-api-key': EXA_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: text,
        type: "auto",
        numResults: 5,
        includeDomains: [
          "astralcodexten.substack.com",
          "paulgraham.com",
          "lesswrong.com",
          "gwern.net",
          "aeon.co",
          "nautil.us",
          "theatlantic.com",
          "harpers.org",
          "brainpickings.org",
          "fs.blog",
          "marginalrevolution.com",
          "overcomingbias.com",
          "scholars-stage.org",
          "worksinprogress.co",
          "experimental-history.com",
          "rootsofprogress.org",
          "diff.substack.com",
          "stratechery.com",
          "danluu.com",
          "ribbonfarm.com",
          "moretothat.com",
          "waitbutwhy.com",
          "neilkakkar.com",
          "commoncog.com",
          "patrickcollison.com",
          "julian.digital",
          "simonsarris.substack.com",
          "interconnected.org",
          "benkuhn.net",
          "meltingasphalt.com",
          "thezvi.substack.com",
          "vitalik.ca",
          "darkblueheaven.com",
          "thepointmag.com",
          "palladiummag.com",
          "americanaffairsjournal.org",
          "hedgehogreview.com",
          "newatlantis.com",
          "thenewatlantis.com",
          "quillette.com"
        ],
        highlights: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Exa API response:', data);

    return data.results.map(result => ({
      title: result.title || 'Untitled',
      url: result.url,
      date: result.publishedDate ? new Date(result.publishedDate).getFullYear() : '',
      author: result.author || '',
      highlight: result.highlights?.[0]?.text || ''
    }));
  } catch (error) {
    console.error('Error in fetchRelatedReading:', error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getRelatedReading") {
    console.log('Received getRelatedReading request:', request.text);
    fetchRelatedReading(request.text)
      .then(data => {
        console.log('Fetch successful:', data);
        sendResponse({ success: true, data });
      })
      .catch(error => {
        console.error('Fetch failed:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open
  }
}); 