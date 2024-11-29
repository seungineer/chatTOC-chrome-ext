if (!window.utils) window.utils = {};
if (!window.utils.chat) {
  const processChatElement = async (chatElement, index) => {
    if (chatElement.hasAttribute('data-chat-id')) {
      return false;
    }

    const chatId = `chat-${index}`;
    chatElement.setAttribute('data-chat-id', chatId);

    const { form, titleInput } = window.utils.form.createTitleForm(chatId);
    chatElement.insertAdjacentElement('beforebegin', form);

    const pageData = await window.utils.chrome.getChromeStorage(
      window.utils.url.getCurrentPageKey(),
    );
    if (pageData[chatId]) {
      titleInput.value = pageData[chatId];
      form.updateVisibility();
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

    return true;
  };

  const initializeChatElements = async () => {
    const chatElements = document.querySelectorAll(
      'div.mx-auto.flex.flex-1.gap-4.text-base.md\\:gap-5.lg\\:gap-6.md\\:max-w-3xl.lg\\:max-w-\\[40rem\\].xl\\:max-w-\\[48rem\\]',
    );

    const results = await Promise.all(
      Array.from(chatElements)
        .slice(0, -1) // 마지막 요소는 prompt 입력창이므로 제외
        .map((element, index) => {
          if (index % 2 === 1) {
            return processChatElement(element, Math.floor(index / 2));
          }
          return false;
        }),
    );

    return results.some((result) => result);
  };

  window.utils.chat = {
    initializeChatElements,
  };
}
