# AI Reader Browser Extension Guidelines

## Development
- **Setup**: Copy `config.example.js` to `config.js` and add your API keys
- **Testing**: Load unpacked extension in Chrome (chrome://extensions → Load unpacked)
- **Debugging**: Use Chrome DevTools (inspect background page or content scripts)
- **Installation**: Run `npm install` before first use (if dependencies added)

## Code Style
- **Naming**: camelCase for variables/functions, PascalCase for classes/components
- **Formatting**: 2-space indentation, semicolons required
- **Imports**: Organize imports by type (core, third-party, local)
- **Error Handling**: Use try/catch with descriptive messages, always log errors
- **API Calls**: All external API calls should go through background.js
- **Types**: Use JSDoc comments for type documentation when appropriate
- **Components**: Reusable code in `/components` folder, following class pattern

## Project Organization
- **manifest.json**: Extension configuration (permissions, scripts)
- **background.js**: API requests, message handling (service worker)
- **content.js**: DOM manipulation, user interface
- **components/**: Reusable UI components and functionality
- **config.js**: API keys (excluded from git)
- **State Management**: Use Chrome storage API for persistent settings