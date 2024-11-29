/* global chrome */
if (!window.utils) window.utils = {};
if (!window.utils.form) {
  const createTitleForm = (chatId) => {
    const form = document.createElement('form');
    form.classList.add('chat-title-form');
    form.setAttribute('data-chat-id', chatId);

    let parentMaxWidth = '100%';
    if (window.matchMedia('(min-width: 1280px)').matches) {
      parentMaxWidth = '48rem';
    } else if (window.matchMedia('(min-width: 1024px)').matches) {
      parentMaxWidth = '40rem';
    } else if (window.matchMedia('(min-width: 768px)').matches) {
      parentMaxWidth = '48rem';
    }

    form.style.cssText = `
      width: 100%;
      max-width: ${parentMaxWidth};
      margin: 0 auto;
      box-sizing: border-box;
      padding: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = '대화 제목을 입력하세요';
    titleInput.classList.add('chat-title-input');
    titleInput.setAttribute('data-chat-id', chatId);
    titleInput.style.cssText = `
      display: none;
      margin: 0;
      vertical-align: middle;
      flex: 1;
    `;

    const bookmarkImg = document.createElement('img');
    bookmarkImg.src = chrome.runtime.getURL('assets/bookmark.png');
    bookmarkImg.classList.add('chat-bookmark');
    bookmarkImg.style.cssText = `
      width: 34px;
      height: 34px;
      cursor: pointer;
      transition: transform 300ms ease;
      vertical-align: middle;
      margin: 0;
      padding: 0;
    `;

    const updateTitleInputVisibility = () => {
      requestAnimationFrame(() => {
        if (titleInput.value) {
          titleInput.style.display = 'inline-block';
          bookmarkImg.style.transform = 'rotate(90deg)';
        }
      });
    };

    form.updateVisibility = updateTitleInputVisibility;

    titleInput.addEventListener('focus', () => {
      titleInput.placeholder = '대화 제목을 입력하세요';
    });

    titleInput.addEventListener('blur', () => {
      if (!titleInput.value) {
        titleInput.style.display = 'none';
        titleInput.placeholder = '대화 제목을 입력하세요';
      }
    });

    bookmarkImg.addEventListener('mouseover', () => {
      if (!titleInput.value && titleInput.style.display === 'none') {
        bookmarkImg.style.transform = 'rotate(90deg)';
      }
    });

    bookmarkImg.addEventListener('mouseout', () => {
      if (!titleInput.value && titleInput.style.display === 'none') {
        bookmarkImg.style.transform = 'rotate(0deg)';
      }
    });

    bookmarkImg.addEventListener('click', () => {
      titleInput.style.display = 'inline-block';
      titleInput.focus();
      bookmarkImg.style.transform = 'rotate(90deg)';
    });

    titleInput.addEventListener('blur', () => {
      if (!titleInput.value) {
        titleInput.style.display = 'none';
        titleInput.placeholder = '대화 제목을 입력하세요';
        bookmarkImg.style.transform = 'rotate(0deg)';
      }
    });

    form.appendChild(bookmarkImg);
    form.appendChild(titleInput);

    return { form, titleInput, bookmarkImg };
  };

  window.utils.form = {
    createTitleForm,
  };
}
