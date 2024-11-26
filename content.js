const { getChromeStorage } = window.utils.chrome;
const { getCurrentPageKey } = window.utils.url;
const { addStyles } = window.utils.style;
const { initializeTOC } = window.utils.toc;
const { createTitleForm } = window.utils.form;

const initializePage = async () => {
  addStyles();

  const chatElements = document.querySelectorAll(
    'div.mx-auto.flex.flex-1.gap-4.text-base.md\\:gap-5.lg\\:gap-6.md\\:max-w-3xl.lg\\:max-w-\\[40rem\\].xl\\:max-w-\\[48rem\\]',
  );

  let hasNewElements = false;

  chatElements.forEach(async (chatElement, index) => {
    if (chatElement.hasAttribute('data-chat-id')) {
      return;
    }

    hasNewElements = true;
    const chatId = `chat-${index}`;
    chatElement.setAttribute('data-chat-id', chatId);

    const { form, titleInput } = createTitleForm(chatId);
    chatElement.insertAdjacentElement('beforebegin', form);

    const pageData = await getChromeStorage(getCurrentPageKey());
    if (pageData[chatId]) {
      titleInput.value = pageData[chatId];
    }

    form.addEventListener('submit', (e) =>
      window.utils.events.handleTitleSubmit(e, {
        titleInput,
        chatId,
        chatElement,
      }),
    );

    titleInput.addEventListener('blur', () =>
      window.utils.events.handleTitleBlur({ titleInput, chatId, chatElement }),
    );
  });

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
