/* global chrome */
if (!window.utils) window.utils = {};
if (!window.utils.chrome) {
  const getChromeStorage = async (key) => {
    try {
      return new Promise((resolve) => {
        chrome.storage.sync.get(key, (result) => {
          resolve(result[key] || {});
        });
      });
    } catch (error) {
      console.warn('Chrome storage access failed:', error);
      return {};
    }
  };

  window.utils.chrome = {
    getChromeStorage,
  };
}
