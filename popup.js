/* global chrome */
document.addEventListener('DOMContentLoaded', () => {
  const extensionToggle = document.getElementById('extension-toggle');
  const autoTitleToggle = document.getElementById('auto-title-toggle');

  chrome.storage.local.get(['enabled', 'autoTitleEnabled'], (result) => {
    const enabled = result.enabled !== undefined ? result.enabled : true;
    const autoTitleEnabled
      = result.autoTitleEnabled !== undefined ? result.autoTitleEnabled : true;
    extensionToggle.checked = enabled;
    autoTitleToggle.checked = autoTitleEnabled;
  });

  extensionToggle.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    const autoTitleEnabled = autoTitleToggle.checked;
    chrome.storage.local.set({ enabled });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'TOGGLE_EXTENSION',
        enabled,
        autoTitleEnabled,
      });
    });
  });

  autoTitleToggle.addEventListener('change', (e) => {
    const autoTitleEnabled = e.target.checked;
    const enabled = extensionToggle.checked;
    chrome.storage.local.set({ autoTitleEnabled });
    if (!enabled) {
      autoTitleToggle.checked = false;
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'TOGGLE_AUTO_TITLE',
        enabled,
        autoTitleEnabled,
      });
    });
  });
});
