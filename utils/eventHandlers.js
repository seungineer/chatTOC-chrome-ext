/* global chrome */
if (!window.utils) window.utils = {};
if (!window.utils.events) {
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

      // TOC 모듈을 통해 항목 추가/업데이트
      if (window.utils.toc && window.utils.toc.addTocEntry) {
        window.utils.toc.addTocEntry(chatId, newTitle, chatElement);
      }
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

      // TOC 모듈을 통해 항목 추가/업데이트
      if (window.utils.toc && window.utils.toc.addTocEntry) {
        window.utils.toc.addTocEntry(chatId, newTitle, chatElement);
      }
    } catch (error) {
      console.warn('Failed to save to chrome storage:', error);
    }
  };

  window.utils.events = {
    handleTitleSubmit,
    handleTitleBlur,
  };
}
