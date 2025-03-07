# Bobby - Your Reading Buddy 🤖

A browser extension that makes reading and understanding content easier. Like Clippy, but actually helpful! Bobby sits quietly in your browser until you need help understanding something - just highlight text to get instant explanations and insights.

## Features 🌟

- **Quick Explanations**: Highlight any text to get instant, AI-powered explanations
- **Multiple Explanation Modes**:
  - Simple Explanation
  - ELI5 (Explain Like I'm 5)
  - Key Points
  - Real-World Examples
  - Pros & Cons
  - Next Steps
  - Related Reading
  - Summarize
- **Fact Checking**: Verify claims with reliable sources
- **Follow-up Questions**: Ask questions about the explanations
- **Dark Mode Support**: Automatic theme switching based on system preferences
- **Draggable & Resizable**: Position the explanation window wherever you want
- **History**: Keep track of your past explanations

## Installation 🔧

1. Clone this repository:
```bash
git clone https://github.com/yourusername/ai-reader-browser-extension.git
```

2. Create a `config.js` file in the root directory with your API keys:
```javascript
window.BOBBY_CONFIG = {
  OPENAI_API_KEY: 'your-openai-api-key',
  EXA_API_KEY: 'your-exa-api-key',
  PPLX_API_KEY: 'your-perplexity-api-key'
};
```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory

## Usage 💡

1. Highlight any text on a webpage
2. Click the "Explain" button that appears
3. Choose your preferred explanation mode
4. Read the AI-generated explanation
5. Use follow-up questions or fact-checking as needed

## Tech Stack 🛠️

- Vanilla JavaScript
- CSS3 with modern features
- OpenAI GPT API
- Exa API for fact-checking and research
- Perplexity API for enhanced responses

## Security 🔒

- API keys are stored securely and never exposed
- All API requests are made through secure channels
- No user data is collected or stored externally

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 👏

- OpenAI for their powerful GPT API
- Exa for their research and fact-checking capabilities
- Perplexity for enhanced response generation

## Privacy Policy 🔐

Bobby respects your privacy:
- No data collection beyond what's necessary for functionality
- No tracking or analytics
- All processing happens locally where possible
- API calls are made only when explicitly requested

---

Made with ❤️ by [Your Name]
