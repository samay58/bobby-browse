// When config.js is loaded, store keys in Chrome storage
if (window.BOBBY_CONFIG) {
  chrome.storage.local.set({
    OPENAI_API_KEY: window.BOBBY_CONFIG.OPENAI_API_KEY,
    EXA_API_KEY: window.BOBBY_CONFIG.EXA_API_KEY
  });
} 