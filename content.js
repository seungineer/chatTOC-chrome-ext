/* global chrome */
const createTOC = () => {
  const existingTOC = document.getElementById('toc-container');
  if (existingTOC) {
    existingTOC.remove();
  }

  const tocContainer = document.createElement('div');
  tocContainer.id = 'toc-container';
  tocContainer.setAttribute('data-toc', 'true');

  document.body.appendChild(tocContainer);

  const tocTitle = document.createElement('div');
  tocTitle.innerText = 'Table of Contents';
  tocTitle.classList.add('toc-title');
  tocContainer.appendChild(tocTitle);

  const chatElements = document.querySelectorAll('[data-chat-id]');
  chatElements.forEach((chatElement) => {
    const chatId = chatElement.getAttribute('data-chat-id');
    const prevInput = chatElement.previousElementSibling;
    const title
      = prevInput && prevInput.tagName === 'INPUT' && prevInput.value
        ? prevInput.value
        : `Chat ${chatId.split('-')[1]}`;

    const tocEntry = document.createElement('div');
    tocEntry.innerText = title;
    tocEntry.classList.add('toc-entry');

    tocEntry.addEventListener('click', () => {
      chatElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    tocContainer.appendChild(tocEntry);
  });
};

const initializePage = () => {
  const chatElements = document.querySelectorAll(
    'div.mx-auto.flex.flex-1.gap-4.text-base.md\\:gap-5.lg\\:gap-6.md\\:max-w-3xl.lg\\:max-w-\\[40rem\\].xl\\:max-w-\\[48rem\\]',
  );

  let hasNewElements = false;

  chatElements.forEach((chatElement, index) => {
    if (chatElement.hasAttribute('data-chat-id')) {
      return;
    }

    hasNewElements = true;
    const chatId = `chat-${index}`;
    chatElement.setAttribute('data-chat-id', chatId);

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = '대화 제목을 입력하세요';
    titleInput.classList.add('chat-title-input');
    titleInput.style.width = '100%';
    titleInput.style.padding = '5px';
    titleInput.style.marginBottom = '10px';
    titleInput.style.border = '1px solid #ccc';
    titleInput.style.borderRadius = '4px';

    titleInput.setAttribute('data-input', 'true');
    chatElement.insertAdjacentElement('beforebegin', titleInput);

    chrome.storage.sync.get(chatId, (result) => {
      if (result[chatId]) {
        titleInput.value = result[chatId];
      }
    });

    titleInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const newTitle = titleInput.value;
        chrome.storage.sync.set({ [chatId]: newTitle }, () => {
          createTOC();
        });
      }
    });

    // input 값이 변경되고 포커스를 잃었을 때도 처리
    titleInput.addEventListener('blur', () => {
      const newTitle = titleInput.value;
      chrome.storage.sync.set({ [chatId]: newTitle }, () => {
        createTOC();
      });
    });
  });

  if (hasNewElements) {
    createTOC();
  }
};

initializePage();

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
