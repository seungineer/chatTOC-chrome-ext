/* global chrome */
document.addEventListener('DOMContentLoaded', async () => {
  const toggleSwitch = document.getElementById('extension-toggle');

  const { enabled = true } = await chrome.storage.local.get('enabled');
  toggleSwitch.checked = enabled;

  toggleSwitch.addEventListener('change', async () => {
    const isEnabled = toggleSwitch.checked;

    await chrome.storage.local.set({ enabled: isEnabled });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'TOGGLE_EXTENSION',
        enabled: isEnabled,
      });
    });
  });
});
