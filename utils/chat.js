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
    // Helper function to check if bottommost p tag has ::after pseudo-element
    const hasBottommostPAfter = (element) => {
      const pTags = element.querySelectorAll('p');
      if (pTags.length === 0) return false;
      
      const bottomP = pTags[pTags.length - 1];
      const afterStyles = getComputedStyle(bottomP, '::after');
      return afterStyles.content !== 'none' && afterStyles.content !== '""' && afterStyles.content !== '';
    };

    // 더 안정적인 선택자 패턴들을 시도 (ChatGPT 구조 변경에 대응)
    let chatElements = document.querySelectorAll('div[data-message-author-role="assistant"]');
    
    // 기본 선택자가 작동하지 않으면 fallback 선택자들 시도
    if (chatElements.length === 0) {
      // 대안 선택자 2: 일반적인 메시지 컨테이너 패턴
      chatElements = document.querySelectorAll('div[class*="mx-auto"][class*="flex"][class*="text-base"]');
    }
    
    if (chatElements.length === 0) {
      // 대안 선택자 3: article 태그 사용
      chatElements = document.querySelectorAll('article div[class*="mx-auto"]');
    }

    // Filter out elements where bottommost p tag has ::after content
    chatElements = Array.from(chatElements).filter(element => !hasBottommostPAfter(element));

    const results = await Promise.all(
      Array.from(chatElements).map((element, index) => {
        // 답변 요소에 입력창 추가
        return processChatElement(element, index);
      }),
    );

    return results.some((result) => result);
  };

  window.utils.chat = {
    initializeChatElements,
  };
}
