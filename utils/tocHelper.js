if (!window.utils) window.utils = {};
if (!window.utils.toc) {
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

    return tocContainer;
  };

  const handleTocEntryClick = (chatElement) => {
    const scrollContainer = document.querySelector(
      '[class*="react-scroll-to-bottom"]',
    );
    if (!scrollContainer) return;

    const innerScrollContainer = scrollContainer.querySelector(
      '[class*="react-scroll-to-bottom--css-"]',
    );
    if (!innerScrollContainer) {
      console.log('내부 스크롤 컨테이너를 찾을 수 없습니다');
      return;
    }

    let targetElement = chatElement;
    let offsetTop = 0;

    while (targetElement && targetElement !== innerScrollContainer) {
      offsetTop += targetElement.offsetTop - 20; // Header 높이 20px
      targetElement = targetElement.offsetParent;
    }

    innerScrollContainer.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    });
  };

  const createTocEntry = (chatId, title) => {
    const tocEntry = document.createElement('div');
    tocEntry.innerText = title;
    tocEntry.classList.add('toc-entry');
    tocEntry.setAttribute('data-toc-id', chatId);
    return tocEntry;
  };

  const findInsertPosition = (tocContainer, currentNumber) => {
    const existingEntries = Array.from(tocContainer.children).filter((child) =>
      child.classList.contains('toc-entry'),
    );

    return existingEntries.find((entry) => {
      const entryId = entry.getAttribute('data-toc-id');
      const entryNumber = parseInt(entryId.split('-')[1], 10);
      return entryNumber > currentNumber;
    });
  };

  const addTocEntry = (chatId, title, chatElement) => {
    const tocContainer = document.getElementById('toc-container');
    if (!tocContainer) return;

    const existingEntry = document.querySelector(`[data-toc-id="${chatId}"]`);
    if (existingEntry) {
      existingEntry.innerText = title;
      return;
    }

    const tocEntry = createTocEntry(chatId, title);
    tocEntry.addEventListener('click', () => handleTocEntryClick(chatElement));

    const currentNumber = parseInt(chatId.split('-')[1], 10);
    const insertPosition = findInsertPosition(tocContainer, currentNumber);

    if (insertPosition) {
      tocContainer.insertBefore(tocEntry, insertPosition);
    } else {
      tocContainer.appendChild(tocEntry);
    }
  };

  // TOC 초기화 함수 추가
  const initializeTOC = async () => {
    const tocContainer = createTOC();
    const pageData = await window.utils.chrome.getChromeStorage(
      window.utils.url.getCurrentPageKey(),
    );

    const chatElements = document.querySelectorAll(
      'div.mx-auto.flex.flex-1.gap-4.text-base.md\\:gap-5.lg\\:gap-6.md\\:max-w-3xl.lg\\:max-w-\\[40rem\\].xl\\:max-w-\\[48rem\\]',
    );

    chatElements.forEach((chatElement, index) => {
      const chatId = `chat-${index}`;
      if (pageData[chatId]) {
        addTocEntry(chatId, pageData[chatId], chatElement);
      }
    });

    return tocContainer;
  };

  window.utils.toc = {
    createTOC,
    addTocEntry,
    initializeTOC,
  };
}
