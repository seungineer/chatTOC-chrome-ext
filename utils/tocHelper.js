/* global chrome */
if (!window.utils) window.utils = {};
if (!window.utils.toc) {
  const setupResizeHandler = (tocContainer, resizeHandle) => {
    let isResizing = false;
    let startX;
    let startY;
    let startWidth;
    let startHeight;

    function handleMouseMove(e) {
      if (!isResizing) return;

      const newWidth = startWidth + (startX - e.clientX);
      const newHeight = startHeight + (e.clientY - startY);

      tocContainer.style.width = `${Math.max(200, newWidth)}px`;
      tocContainer.style.height = `${Math.max(100, newHeight)}px`;

      e.preventDefault();
      document.body.style.userSelect = 'none';
    }

    function handleMouseUp() {
      isResizing = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';

      tocWidth = tocContainer.style.width;
      tocHeight = tocContainer.style.height;
    }

    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = tocContainer.offsetWidth;
      startHeight = tocContainer.offsetHeight;

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
  };

  let tocWidth = '200px';
  let tocHeight = 'auto';

  const createTOC = () => {
    const existingTOC = document.getElementById('toc-container');
    if (existingTOC) {
      existingTOC.remove();
    }

    const tocContainer = document.createElement('div');
    tocContainer.id = 'toc-container';
    tocContainer.setAttribute('data-toc', 'true');

    // 전역 변수에서 크기 불러오기
    tocContainer.style.width = tocWidth;
    tocContainer.style.height = tocHeight;

    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('toc-resize-handle');
    tocContainer.appendChild(resizeHandle);

    document.body.appendChild(tocContainer);

    const tocTitle = document.createElement('div');
    tocTitle.innerText = 'Table of Contents';
    tocTitle.classList.add('toc-title');
    tocContainer.appendChild(tocTitle);

    setupResizeHandler(tocContainer, resizeHandle);

    return tocContainer;
  };

  const handleTocEntryClick = (chatId) => {
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

    const chatElement = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (!chatElement) return;

    let targetElement = chatElement;
    let offsetTop = 0;

    while (targetElement && targetElement !== innerScrollContainer) {
      offsetTop += targetElement.offsetTop - 10; // Header 높이 10px
      targetElement = targetElement.offsetParent;
    }

    innerScrollContainer.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    });
  };

  const createTocEntry = (chatId, title) => {
    const tocEntry = document.createElement('div');
    tocEntry.classList.add('toc-entry-container');

    const titleSpan = document.createElement('span');
    titleSpan.innerText = title;
    titleSpan.classList.add('toc-entry');

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '×';
    deleteButton.classList.add('toc-delete-button');

    deleteButton.addEventListener('click', async (e) => {
      e.stopPropagation();

      const pageData = await window.utils.chrome.getChromeStorage(
        window.utils.url.getCurrentPageKey(),
      );
      delete pageData[chatId];

      try {
        await new Promise((resolve) => {
          chrome.storage.sync.set(
            { [window.utils.url.getCurrentPageKey()]: pageData },
            resolve,
          );
        });

        const titleInput = document.querySelector(
          `input[data-chat-id="${chatId}"]`,
        );
        if (titleInput) {
          titleInput.value = '';
          titleInput.blur();
          titleInput.dispatchEvent(new Event('blur'));
        }

        tocEntry.remove();
      } catch (error) {
        console.warn('Failed to delete title:', error);
      }
    });

    tocEntry.appendChild(titleSpan);
    tocEntry.appendChild(deleteButton);
    tocEntry.setAttribute('data-toc-id', chatId);

    return tocEntry;
  };

  const findInsertPosition = (tocContainer, currentNumber) => {
    const existingEntries = Array.from(tocContainer.children).filter((child) =>
      child.classList.contains('toc-entry-container'),
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
      existingEntry.remove();
    }

    const tocEntry = createTocEntry(chatId, title);
    tocEntry.addEventListener('click', () => handleTocEntryClick(chatId));

    const currentNumber = parseInt(chatId.split('-')[1], 10);
    const insertPosition = findInsertPosition(tocContainer, currentNumber);

    if (insertPosition) {
      tocContainer.insertBefore(tocEntry, insertPosition);
    } else {
      tocContainer.appendChild(tocEntry);
    }
  };

  // TOC 초기화 함수 추가
  const initializeTOC = async (autoTitleEnabled) => {
    const tocContainer = createTOC();
    const pageData = await window.utils.chrome.getChromeStorage(
      window.utils.url.getCurrentPageKey(),
    );

    const chatElements = document.querySelectorAll('[data-chat-id]');
    chatElements.forEach((chatElement, index) => {
      const chatId = `chat-${index}`;
      if (pageData[chatId]) {
        // 페이지 데이터에 사용자 정의 타이틀이 있으면 추가
        addTocEntry(chatId, pageData[chatId], chatElement);
        return;
      }

      if (!autoTitleEnabled) return;
      const titleInput = document.querySelector(
        `[data-chat-id="${chatId}"] input`,
      );
      if (titleInput) {
        addTocEntry(chatId, titleInput.value, chatElement);
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
