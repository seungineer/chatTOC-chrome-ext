const { getChromeStorage } = window.utils.chrome;
const { getCurrentPageKey } = window.utils.url;
const { addStyles } = window.utils.style;

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
};

const initializePage = async () => {
  addStyles();

  const chatElements = document.querySelectorAll(
    'div.mx-auto.flex.flex-1.gap-4.text-base.md\\:gap-5.lg\\:gap-6.md\\:max-w-3xl.lg\\:max-w-\\[40rem\\].xl\\:max-w-\\[48rem\\]',
  );

  let hasNewElements = false;

  const addTocEntry = (chatId, title, chatElement) => {
    const tocContainer = document.getElementById('toc-container');
    if (!tocContainer) return;

    const existingEntry = document.querySelector(`[data-toc-id="${chatId}"]`);
    if (existingEntry) {
      existingEntry.innerText = title;
      return;
    }

    const tocEntry = document.createElement('div');
    tocEntry.innerText = title;
    tocEntry.classList.add('toc-entry');
    tocEntry.setAttribute('data-toc-id', chatId);

    tocEntry.addEventListener('click', () => {
      chatElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    const existingEntries = Array.from(tocContainer.children).filter((child) =>
      child.classList.contains('toc-entry'),
    );

    const currentNumber = parseInt(chatId.split('-')[1], 10);

    const insertPosition = existingEntries.find((entry) => {
      const entryId = entry.getAttribute('data-toc-id');
      const entryNumber = parseInt(entryId.split('-')[1], 10);
      return entryNumber > currentNumber;
    });

    if (insertPosition) {
      tocContainer.insertBefore(tocEntry, insertPosition);
    } else {
      tocContainer.appendChild(tocEntry);
    }
  };

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

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newTitle = titleInput.value;
      if (newTitle.trim()) {
        const pageData = await getChromeStorage(getCurrentPageKey());
        pageData[chatId] = newTitle;

        try {
          await new Promise((resolve) => {
            chrome.storage.sync.set(
              { [getCurrentPageKey()]: pageData },
              resolve,
            );
          });
          const tocEntry = document.querySelector(`[data-toc-id="${chatId}"]`);
          if (tocEntry) {
            tocEntry.innerText = newTitle;
          } else {
            addTocEntry(chatId, newTitle, chatElement);
          }
        } catch (error) {
          console.warn('Failed to save to chrome storage:', error);
        }
      }
    });

    // blur 이벤트 핸들러도 동일하게 수정
    titleInput.addEventListener('blur', async () => {
      const newTitle = titleInput.value;
      if (newTitle.trim()) {
        const blurPageData = await getChromeStorage(getCurrentPageKey());
        blurPageData[chatId] = newTitle;

        try {
          await new Promise((resolve) => {
            chrome.storage.sync.set(
              { [getCurrentPageKey()]: blurPageData },
              resolve,
            );
          });
          const tocEntry = document.querySelector(`[data-toc-id="${chatId}"]`);
          if (tocEntry) {
            tocEntry.innerText = newTitle;
          } else {
            addTocEntry(chatId, newTitle, chatElement);
          }
        } catch (error) {
          console.warn('Failed to save to chrome storage:', error);
        }
      }
    });
  });

  // TOC 초기화 부분도 수정
  if (hasNewElements) {
    createTOC();
    const pageData = await getChromeStorage(getCurrentPageKey());

    chatElements.forEach((chatElement, index) => {
      const chatId = `chat-${index}`;
      if (pageData[chatId]) {
        addTocEntry(chatId, pageData[chatId], chatElement);
      }
    });
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
