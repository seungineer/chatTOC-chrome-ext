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

const initializePage = () => {
  const chatElements = document.querySelectorAll(
    'div.mx-auto.flex.flex-1.gap-4.text-base.md\\:gap-5.lg\\:gap-6.md\\:max-w-3xl.lg\\:max-w-\\[40rem\\].xl\\:max-w-\\[48rem\\]',
  );

  let hasNewElements = false;

  const addTocEntry = (chatId, title, chatElement) => {
    const tocContainer = document.getElementById('toc-container');
    if (!tocContainer) return;

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

  chatElements.forEach((chatElement, index) => {
    if (chatElement.hasAttribute('data-chat-id')) {
      return;
    }

    hasNewElements = true;
    const chatId = `chat-${index}`;
    chatElement.setAttribute('data-chat-id', chatId);

    const form = document.createElement('form');
    form.classList.add('chat-title-form');

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = '대화 제목을 입력하세요';
    titleInput.classList.add('chat-title-input');
    titleInput.style.width = '100%';
    titleInput.style.padding = '5px';
    titleInput.style.marginBottom = '10px';
    titleInput.style.border = '1px solid #ccc';
    titleInput.style.borderRadius = '4px';

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

    chrome.storage.sync.get(chatId, (result) => {
      if (result[chatId]) {
        titleInput.value = result[chatId];
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newTitle = titleInput.value;
      if (newTitle.trim()) {
        chrome.storage.sync.set({ [chatId]: newTitle }, () => {
          const tocEntry = document.querySelector(`[data-toc-id="${chatId}"]`);
          if (tocEntry) {
            tocEntry.innerText = newTitle;
          } else {
            addTocEntry(chatId, newTitle, chatElement);
          }
        });
      }
    });

    titleInput.addEventListener('blur', () => {
      const newTitle = titleInput.value;
      if (newTitle.trim()) {
        chrome.storage.sync.set({ [chatId]: newTitle }, () => {
          const tocEntry = document.querySelector(`[data-toc-id="${chatId}"]`);
          if (tocEntry) {
            tocEntry.innerText = newTitle;
          } else {
            addTocEntry(chatId, newTitle, chatElement);
          }
        });
      }
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
