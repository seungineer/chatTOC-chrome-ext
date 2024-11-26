const { addStyles } = window.utils.style;
const { initializeTOC } = window.utils.toc;
const { initializeChatElements } = window.utils.chat;

const initializePage = async () => {
  addStyles();

  const hasNewElements = await initializeChatElements();

  if (hasNewElements) {
    await initializeTOC();
  }
};

// 초기 실행
(async () => {
  await initializePage();
})();

const observer = new MutationObserver((mutations) => {
  const hasRelevantChanges = mutations.some((mutation) => {
    return Array.from(mutation.addedNodes).some((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node;
        return (
          !element.hasAttribute('data-toc')
          && !element.hasAttribute('data-input')
        );
      }
      return false;
    });
  });

  if (hasRelevantChanges) {
    initializePage();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
