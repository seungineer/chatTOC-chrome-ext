const { getChromeStorage } = window.utils.chrome;
const { getCurrentPageKey } = window.utils.url;
const { addStyles } = window.utils.style;
const { initializeTOC } = window.utils.toc;

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

    const form = document.createElement('form');
    form.classList.add('chat-title-form');

    let parentMaxWidth = '100%';

    if (window.matchMedia('(min-width: 1280px)').matches) {
      parentMaxWidth = '48rem';
    } else if (window.matchMedia('(min-width: 1024px)').matches) {
      parentMaxWidth = '40rem';
    } else if (window.matchMedia('(min-width: 768px)').matches) {
      parentMaxWidth = '48rem';
    }

    form.style.width = '100%';
    form.style.maxWidth = parentMaxWidth;
    form.style.margin = '0 auto';
    form.style.boxSizing = 'border-box';
    form.style.padding = '0 1rem';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = '대화 제목을 입력하세요';
    titleInput.classList.add('chat-title-input');
    titleInput.style.width = '100%';
    titleInput.style.padding = '5px';
    titleInput.style.marginBottom = '10px';
    titleInput.style.border = '1px solid #ccc';
    titleInput.style.borderRadius = '4px';

    titleInput.style.color = 'black';
    titleInput.addEventListener('focus', () => {
      titleInput.placeholder = '';
    });

    titleInput.addEventListener('blur', () => {
      if (!titleInput.value) {
        titleInput.placeholder = '대화 제목을 입력하세요';
      }
    });

    form.appendChild(titleInput);
    form.setAttribute('data-input', 'true');
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

  // TOC 초기화 부분 수정
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
