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
    console.log('chatTOC: 채팅 요소 초기화 시작');
    
    // 더 안정적인 선택자 패턴들을 시도 (ChatGPT 구조 변경에 대응)
    let chatElements = document.querySelectorAll(
      'div.mx-auto.flex.flex-1.text-base.gap-4.md\\:gap-5.lg\\:gap-6',
    );
    console.log('chatTOC: 기본 선택자로 찾은 요소 수:', chatElements.length);
    
    // 기본 선택자가 작동하지 않으면 fallback 선택자들 시도
    if (chatElements.length === 0) {
      // 대안 선택자 1: data-message-author-role 속성이 있는 요소들
      chatElements = document.querySelectorAll('div[data-message-author-role]');
      console.log('chatTOC: data-message-author-role로 찾은 요소 수:', chatElements.length);
    }
    
    if (chatElements.length === 0) {
      // 대안 선택자 2: 일반적인 메시지 컨테이너 패턴
      chatElements = document.querySelectorAll('div[class*="mx-auto"][class*="flex"][class*="text-base"]');
      console.log('chatTOC: 일반 패턴으로 찾은 요소 수:', chatElements.length);
    }
    
    if (chatElements.length === 0) {
      // 대안 선택자 3: article 태그 사용
      chatElements = document.querySelectorAll('article div[class*="mx-auto"]');
      console.log('chatTOC: article 패턴으로 찾은 요소 수:', chatElements.length);
    }
    
    if (chatElements.length === 0) {
      console.warn('chatTOC: 채팅 요소를 찾을 수 없습니다. DOM 구조가 변경되었을 수 있습니다.');
    }

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
