if (!window.utils) window.utils = {};
if (!window.utils.form) {
  const createTitleForm = (chatId) => {
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

    form.style.cssText = `
      width: 100%;
      max-width: ${parentMaxWidth};
      margin: 0 auto;
      box-sizing: border-box;
      padding: 0 1rem;
    `;

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = '대화 제목을 입력하세요';
    titleInput.classList.add('chat-title-input');
    titleInput.style.cssText = `
      display: block;
    `;

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

    return { form, titleInput };
  };

  window.utils.form = {
    createTitleForm,
  };
}
