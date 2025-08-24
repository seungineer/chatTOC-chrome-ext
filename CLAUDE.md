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
- `window.utils.autoTitle`: Automatic title generation toggle
- `window.utils.updateNotification`: Update notification display

**Namespace Registration**: Each util file checks and creates its namespace using a consistent pattern:
```javascript
if (!window.utils) window.utils = {};
if (!window.utils.moduleName) {
  // Module implementation
  window.utils.moduleName = { /* exports */ };
}
```

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

#### CSS Selector Resilience System
The extension uses a multi-layered fallback system to handle ChatGPT's frequent UI changes:

**Chat Element Selection (Primary → Fallbacks)**:
1. `div.mx-auto.flex.flex-1.text-base.gap-4.md\\:gap-5.lg\\:gap-6` (primary)
2. `div[data-message-author-role]` (attribute-based)
3. `div[class*="mx-auto"][class*="flex"][class*="text-base"]` (partial class matching)
4. `article div[class*="mx-auto"]` (structural fallback)

**Scroll Container Selection**:
1. `div.flex.h-full.flex-col.overflow-y-auto` (primary)
2. `div[class*="overflow-y-auto"][class*="h-full"]` (partial matching)
3. `main` (semantic fallback)
4. `div[role="main"]` (accessibility fallback)

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
- Monitor console logs for CSS selector fallback chain execution
- Use Network tab to track Chrome storage operations

## Development Patterns

### ChatGPT UI Change Resilience
The extension is designed to withstand ChatGPT's frequent UI updates through several strategies:

**Progressive Selector Degradation**: When primary selectors fail, the code automatically attempts fallback selectors without throwing errors, ensuring continued functionality even with partial UI changes.

**Defensive Element Processing**: Functions check for element existence and attributes before processing, preventing runtime errors when DOM structure changes.

**Graceful Failure Handling**: If critical elements cannot be found, functionality degrades gracefully rather than breaking completely.

### Version Management
- **manifest.json**: Contains the actual extension version for Chrome store
- **package.json**: Used for development tooling (currently minimal)
- Version bumps should be done in manifest.json as the source of truth

### Extension-Specific Debugging
- **Storage Inspection**: Use Chrome DevTools > Application > Storage to inspect both sync and local storage
- **Content Script Debugging**: Set breakpoints in DevTools on ChatGPT pages, not the extension popup
- **Background Script Monitoring**: View service worker logs in `chrome://extensions/`

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

### Recent Robustness Improvements

**Byte-Length Validation**: International character support using `TextEncoder` for accurate byte counting instead of character counting, preventing storage issues with Unicode characters.

**Enhanced Scroll Positioning**: Uses `getBoundingClientRect()` for precise element positioning when navigating via TOC, with fallback handling for dynamic content.

**Improved Element Detection**: Multiple fallback strategies ensure the extension works even when ChatGPT updates its DOM structure or CSS classes.

**Auto-Title Intelligence**: Automatically truncates and formats chat content for optimal title display, with configurable length limits based on content type.

## Storage Architecture

### Dual Storage System
The extension uses Chrome's two storage APIs strategically:

**Chrome Storage Sync** (`chrome.storage.sync`):
- **Purpose**: User data that should sync across devices
- **Content**: Title mappings, user-created bookmarks
- **Capacity**: 100KB total, 8KB per item
- **Key Pattern**: `[pageKey]` → `{ "chat-0": "title", "chat-1": "title" }`

**Chrome Storage Local** (`chrome.storage.local`):
- **Purpose**: Device-specific settings and temporary data
- **Content**: Extension state, feature toggles, update notifications
- **Capacity**: 5MB (much larger than sync)
- **Keys**: `enabled`, `autoTitleEnabled`, `showUpdatePopup`, `details`

### Page Key Generation
Page keys are generated from URLs to create conversation-specific storage:
```javascript
// Example: https://chatgpt.com/c/abc123 → "c_abc123"
const pageKey = window.utils.url.getCurrentPageKey();
```

### Data Structure Examples
```javascript
// Sync Storage (per-conversation titles)
{
  "c_abc123": {
    "chat-0": "Custom title for first chat",
    "chat-1": "Custom title for second chat"
  }
}

// Local Storage (extension settings)
{
  "enabled": true,
  "autoTitleEnabled": true,
  "showUpdatePopup": false,
  "details": { "reason": "update", "previousVersion": "1.1.1" }
}
```

## Extension Permissions

- `storage`: For saving titles and settings
- Content script injection on `https://chatgpt.com/*`
- Web accessible resources for bookmark icon