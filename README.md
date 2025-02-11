<p align="center">
  <img src="icon.png" width="128" height="128" alt="Bobby Icon">
</p>

# Bobby - Your AI Browsing Assistant

## New Feature: Fact Checking 🔍

Bobby now includes a powerful fact-checking feature that helps verify claims in selected text using AI and reliable sources.

### How to Use Fact Checking

1. Select any text on a webpage
2. Click the Bobby extension icon or use the keyboard shortcut
3. Click the "🔍 Fact Check" button in the popup
4. Bobby will:
   - Extract verifiable claims from the text
   - Search for relevant sources using Exa API
   - Verify each claim against the sources
   - Provide confidence scores and corrections if needed

### Fact Check Results

Results are color-coded for easy understanding:
- 🟢 Green: High confidence (>75%) verification
- 🟡 Yellow: Medium confidence (50-75%)
- 🔴 Red: Low confidence (<50%) or false claim

Each fact check includes:
- Confidence score
- Original claim
- Verification summary
- Source links
- Corrections (if claim is false)

### Example

```text
Selected text: "The global temperature has risen by 2°C in the last decade"

Fact Check Result:
❌ False (95% confident)
The claim is incorrect. According to NASA and NOAA data, global temperatures 
have risen by approximately 0.18°C per decade over the past 40 years, 
not 2°C in a single decade.

Sources:
- nasa.gov/global-temperature-data
- noaa.gov/climate-reports
```

### Configuration

To use the fact-checking feature:
1. Add your OpenAI API key for claim analysis
2. Add your Exa API key for source verification
3. Configure in the extension settings

The fact checker uses GPT-4 for claim extraction and verification, combined with Exa's search API for finding reliable sources.

## ✨ What Bobby Can Do

- 🧠 **Makes Complex Things Simple**: Gets straight to the point with that "aha!" moment clarity
- 📚 **Knows the Good Stuff**: Finds related gems from 40+ top intellectual blogs and publications
- 🎯 **Reads the Room**: Adapts explanations to your needs (from ELI5 to "let's get technical")
- 💡 **Wears Many Hats**: 
  - Hosts mini-debates (with actual good points on both sides!)
  - Bullet-points like a pro
  - Drops real-world examples that click
  - Suggests reading that's actually worth your time
- 🎨 **Looks Sharp**: Clean, modern interface that's easy on the eyes (dark mode included, because we're not savages)
- ⌨️ **Quick on the Draw**: Just hit Ctrl+Shift+X (Cmd+Shift+X for the Mac folks) and Bobby's there

## 🚀 Quick Start

1. Clone this repository (Bobby needs a home!)
2. Get your API keys:
   - OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Exa API key from [Exa.ai](https://exa.ai/docs/api)
3. Copy `config.example.js` to `config.js` and add your keys
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode" (top right)
6. Click "Load unpacked" and point it to Bobby's folder

## 💡 How to Use Bobby

1. Find some text that makes you go "huh?"
2. Select it, then either:
   - Click the Bobby icon that pops up (he's friendly!)
   - Right-click and pick "Explain with Bobby"
   - Use the keyboard shortcut (Bobby's always ready)
3. Pick how you want it explained
4. Watch Bobby work his magic! ✨

## 🔧 Under Bobby's Hood

Bobby's built with:
- Pure JavaScript (no framework bloat here!)
- Chrome Extensions API (for that native feel)
- OpenAI GPT API (the smart bits)
- Exa API (for finding the good stuff)

## 🤝 Make Bobby Smarter

Got ideas to make Bobby even better? PRs welcome! 

1. Fork the repo
2. Create your feature branch
3. Make your magic happen
4. Submit a PR

Got big plans? Open an issue first - Bobby loves a good brainstorm!

## 📜 License

MIT - Go wild! Just keep Bobby friendly and helpful. 

## 🙏 Credits

Bobby stands on the shoulders of giants - check out the amazing blogs and publications he learns from in `background.js`. These are some of the web's best thinkers and writers!

---

*Remember: Bobby's here to help, not to judge. Unless you're using Comic Sans. Then he might judge a little.* 😉 

## 🔒 Security Note

Never commit your `config.js` with real API keys! Always use `config.example.js` as a template.

## 📦 Installation from GitHub

1. Click the green "Code" button above and download ZIP
2. Extract the ZIP file
3. Follow the Quick Start instructions above to set up your API keys and load the extension 

# Recent Updates (2024-03-XX)

## 1. Follow-Up Question Improvements
- Added Perplexity Sonar API integration for real-time information in follow-up answers
- Implemented multi-level back navigation for follow-up questions
- Added state management to preserve context between follow-up questions
- Fixed issues with sequential back button clicks

## 2. API Integration Updates
- Added secure storage for Perplexity API key
- Moved API calls to background script to avoid CORS issues
- Improved error handling for API responses
- Added API key validation and format checking

## 3. UI/UX Improvements
- Fixed emoji rendering in context buttons
- Added better error messages for API failures
- Improved state management when closing popup
- Enhanced event handler reattachment for restored views

## 4. Technical Improvements
- Added extension context invalidation handling
- Improved script loading order in manifest
- Added recovery mechanisms for extension context errors
- Enhanced error logging for debugging

## Configuration
To use the extension, you'll need to set up the following API keys in `config.js`:

```javascript
window.BOBBY_CONFIG = {
  OPENAI_API_KEY: 'your-openai-api-key',
  EXA_API_KEY: 'your-exa-api-key',
  PPLX_API_KEY: 'your-perplexity-api-key'
};
```