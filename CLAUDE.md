# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a Chrome extension (Manifest V3) that adds a Table of Contents (TOC) to ChatGPT conversations, allowing users to bookmark and navigate between different parts of long conversations.

### Core Components

- **manifest.json**: Extension configuration targeting `https://chatgpt.com/*`
- **content.js**: Main entry point that coordinates initialization and page monitoring
- **background.js**: Service worker handling extension lifecycle events
- **popup.html/js**: Extension popup UI for toggling features
- **utils/**: Modular utility functions organized by domain

### Key Architecture Patterns

#### Modular Utils Pattern
All utility functions are namespaced under `window.utils` with domain-specific modules:
- `window.utils.toc`: TOC creation and management
- `window.utils.chat`: Chat element processing and initialization  
- `window.utils.form`: Title form creation and management
- `window.utils.events`: Event handling for title submission
- `window.utils.chrome`: Chrome storage operations
- `window.utils.url`: URL-based page identification

#### Chat Element Identification
Uses a two-part identification system:
- **Chat Elements**: Alternating elements where odd indices (1, 3, 5...) are AI responses that get title input forms
- **Input Elements**: Even indices (0, 2, 4...) are user prompts that get `data-input-id` attributes
- **Chat IDs**: Format `chat-${index}` where index is `Math.floor(domIndex / 2)`

#### Storage Strategy
- **Chrome Storage Sync**: Persistent title storage using page-based keys
- **Chrome Storage Local**: Extension settings (enabled, autoTitleEnabled)
- **Page Keys**: Generated from current URL for conversation-specific data

#### DOM Monitoring
Uses MutationObserver to detect new chat elements and re-initialize functionality when ChatGPT's dynamic content changes.

## Development Commands

Since this is a Chrome extension without build tools, development involves:

### Loading the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" 
3. Click "Load unpacked" and select this directory
4. The extension will appear in your extensions list

### Testing Changes
1. Make code changes
2. Go to `chrome://extensions/`
3. Click the refresh button on the extension
4. Navigate to `https://chatgpt.com` to test

### Debugging
- Use Chrome DevTools on ChatGPT pages to debug content scripts
- Use Chrome DevTools on the extension popup to debug popup.js
- Check `chrome://extensions/` for background script errors

## Key Implementation Details

### Element Selection Strategy
The extension targets specific ChatGPT DOM structure:
- Chat containers: `'div.mx-auto.flex.flex-1.text-base.gap-4.md\\:gap-5.lg\\:gap-6'`
- Scroll container: `'div.flex.h-full.flex-col.overflow-y-auto'`

### Auto-Title Feature
When enabled, automatically generates titles for conversations. Can be toggled via the extension popup.

### TOC Interaction
- Click TOC entries to scroll to corresponding chat sections
- Resizable TOC panel with drag handle
- Delete functionality with × button for each entry

### Character Limits
Title inputs are limited to 100 bytes (not characters) to handle Unicode properly using `TextEncoder`.

## Storage Data Structure

```javascript
// Page-specific data structure
{
  "[pageKey]": {
    "chat-0": "Custom title for first chat",
    "chat-1": "Custom title for second chat"
    // ...
  }
}

// Extension settings
{
  "enabled": true,
  "autoTitleEnabled": true,
  "showUpdatePopup": false
}
```

## Extension Permissions

- `storage`: For saving titles and settings
- Content script injection on `https://chatgpt.com/*`
- Web accessible resources for bookmark icon