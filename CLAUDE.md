# AI Reader Browser Extension Guidelines

## Development
- **Setup**: Copy `config.example.js` to `config.js` and add your API keys
- **Testing**: Load unpacked extension in Chrome (chrome://extensions → Load unpacked)
- **Debugging**: Use Chrome DevTools (inspect background page or content scripts)

## Code Style
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Formatting**: 2-space indentation, semicolons required
- **Pattern**: Content script creates UI, background script handles API calls
- **Error Handling**: Use try/catch with descriptive messages and UI feedback
- **Components**: Place reusable components in `/components` folder
- **State**: Use Chrome storage API for persistent settings

## Project Organization
- **manifest.json**: Extension configuration (permissions, scripts)
- **background.js**: API requests, message handling
- **content.js**: DOM manipulation, user interface
- **components/**: Reusable UI components and functionality
- **config.js**: API keys (excluded from git)