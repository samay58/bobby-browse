# Plumage: Elevate Your Reading

A powerful browser extension that enhances your online reading experience with AI-powered insights. Highlight any text to receive instant explanations, summaries, and analysis - making complex content accessible with just a click.

## Features

- **Smart Analysis**: Highlight any text for immediate AI-powered insights
- **Multiple Analysis Modes**:
  - Clear Explanation
  - Simplified Breakdown
  - Key Points
  - Practical Examples
  - Pros & Cons
  - Further Exploration
  - Related Topics
  - Quick Summary
- **Fact Verification**: Cross-check claims with reliable sources
- **Follow-up Questions**: Ask questions about your highlighted content
- **Flexible Interface**: Draggable and resizable explanation window
- **Dark Mode**: Automatic theme switching based on system preferences
- **History**: Track and revisit your past explanations

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/ai-reader-browser-extension.git
```

2. Create a `config.js` file in the root directory with your API keys:
```javascript
window.PLUMAGE_CONFIG = {
  OPENAI_API_KEY: 'your-openai-api-key',
  EXA_API_KEY: 'your-exa-api-key',
  PPLX_API_KEY: 'your-perplexity-api-key'
};
```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory

## Usage

1. Highlight text on any webpage
2. Click the Plumage button that appears
3. Select your preferred analysis mode
4. Review the AI-generated insights
5. Use follow-up questions or verification as needed

## Technical Architecture

- Modular JavaScript architecture for maintainability
- Modern CSS with responsive design
- Integration with multiple AI APIs:
  - OpenAI GPT for content analysis
  - Exa for source verification
  - Perplexity for enhanced responses

### Core Modules

- `PromptManager.js`: Template and context management
- `ButtonManager.js`: UI interaction elements
- `UIComponents.js`: Consistent interface components
- `APIClient.js`: Unified API communication layer
- `ModuleInitializer.js`: System initialization and compatibility

## Security

- API keys are securely stored locally
- All API requests use encrypted connections
- No user data collection beyond local storage requirements

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for their GPT technology
- Exa for their research and verification capabilities
- Perplexity for advanced response generation

## Privacy Policy

Plumage respects your privacy:
- Minimal data collection, limited to functional requirements
- No tracking or analytics
- Local processing whenever possible
- API requests only made with explicit user action

---

Developed by Samay Dhawan