# AI Reader Browser Extension Guidelines

## Development
- **Setup**: Copy `config.example.js` to `config.js` and add your API keys
- **Testing**: Manual testing - load unpacked extension in Chrome (chrome://extensions → Load unpacked)
- **Debugging**: Use Chrome DevTools (inspect background page or content scripts)
- **Reload**: After code changes, click "Reload" on chrome://extensions page

## Code Style
- **Naming**: camelCase for variables/functions, PascalCase for classes/components
- **Formatting**: 2-space indentation, semicolons required, consistent braces
- **Imports**: Organize imports by type (core, third-party, local)
- **Error Handling**: Use try/catch with descriptive messages, always log errors
- **Documentation**: JSDoc comments for functions and complex logic
- **Types**: Use JSDoc for type annotations (e.g. `@param {string} name`)
- **Exports**: Use ES module format (export/import) for modular code

## Project Organization
- **background.js**: Service worker for API requests and message handling
- **content.js**: DOM manipulation and primary user interface
- **components/**: Reusable UI components and modules
  - **modules/**: Functional modules with single responsibilities
- **State Management**: Use Chrome storage API for persistence
- **API Integration**: All external API calls (OpenAI, Exa, Perplexity) via background.js