/* global chrome */
chrome.runtime.onInstalled.addListener(async (details) => {
  await chrome.storage.local.set({ details });
  if (details.reason === 'install' || details.reason === 'update') {
    chrome.storage.local.set({ showUpdatePopup: true });
  }
});
