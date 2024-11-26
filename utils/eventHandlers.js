/* global chrome */
if (!window.utils) window.utils = {};
if (!window.utils.events) {
  const updateTocEntry = (chatId, newTitle, chatElement) => {
    const tocEntry = document.querySelector(`[data-toc-id="${chatId}"]`);
    if (tocEntry) {
      tocEntry.innerText = newTitle;
    }
  };

  const handleTitleSubmit = async (e, { titleInput, chatId, chatElement }) => {
    e.preventDefault();
    const newTitle = titleInput.value;
    if (!newTitle.trim()) return;

    const pageData = await window.utils.chrome.getChromeStorage(
      window.utils.url.getCurrentPageKey(),
    );
    pageData[chatId] = newTitle;

    try {
      await new Promise((resolve) => {
        chrome.storage.sync.set(
          { [window.utils.url.getCurrentPageKey()]: pageData },
          resolve,
        );
      });
      updateTocEntry(chatId, newTitle, chatElement);
    } catch (error) {
      console.warn('Failed to save to chrome storage:', error);
    }
  };

  const handleTitleBlur = async ({ titleInput, chatId, chatElement }) => {
    const newTitle = titleInput.value;
    if (!newTitle.trim()) return;

    const pageData = await window.utils.chrome.getChromeStorage(
      window.utils.url.getCurrentPageKey(),
    );
    pageData[chatId] = newTitle;

    try {
      await new Promise((resolve) => {
        chrome.storage.sync.set(
          { [window.utils.url.getCurrentPageKey()]: pageData },
          resolve,
        );
      });
      updateTocEntry(chatId, newTitle, chatElement);
    } catch (error) {
      console.warn('Failed to save to chrome storage:', error);
    }
  };

  window.utils.events = {
    handleTitleSubmit,
    handleTitleBlur,
  };
}
