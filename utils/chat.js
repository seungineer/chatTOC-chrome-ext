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

    const getByteLength = (str) => {
      return new TextEncoder().encode(str).length;
    };

    titleInput.addEventListener('input', (e) => {
      const byteLength = getByteLength(e.target.value);
      if (byteLength > 100) {
        e.target.value = e.target.value.slice(0, -1);
      }
    });

    const pageData = await window.utils.chrome.getChromeStorage(
      window.utils.url.getCurrentPageKey(),
    );
    if (pageData[chatId]) {
      titleInput.value = pageData[chatId];
      form.updateVisibility();
    }

    form.addEventListener('submit', (e) => {
      const byteLength = getByteLength(titleInput.value);
      if (byteLength > 100) {
        titleInput.value = titleInput.value.slice(0, Math.floor(100 / 2));
      }
      window.utils.events.handleTitleSubmit(e, {
        titleInput,
        chatId,
        chatElement,
      });
    });

    titleInput.addEventListener('blur', async () => {
      if (!titleInput.value.trim()) {
        const tocEntry = document.querySelector(`[data-toc-id="${chatId}"]`);
        if (tocEntry) {
          tocEntry.querySelector('.toc-delete-button').click();
        }
      }
    });

    return true;
  };

  const processInputElement = async (inputElement, index) => {
    if (inputElement.hasAttribute('data-input-id')) {
      return false;
    }

    const inputId = `input-${index}`;
    inputElement.setAttribute('data-input-id', inputId);

    return true;
  };

  const initializeChatElements = async () => {
    const chatElements = document.querySelectorAll(
      'div.mx-auto.flex.flex-1.text-base.gap-4.md\\:gap-5.lg\\:gap-6',
    );

    const results = await Promise.all(
      Array.from(chatElements).map((element, index) => {
        if (index % 2 === 1) {
          // 답변 요소에 입력창 추가
          return processChatElement(element, Math.floor(index / 2));
        }
        // 입력 요소에 'data-input-id' 추가
        return processInputElement(element, Math.floor(index / 2));
      }),
    );

    return results.some((result) => result);
  };

  window.utils.chat = {
    initializeChatElements,
  };
}
