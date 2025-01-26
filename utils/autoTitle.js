/* global chrome */
if (!window.utils) window.utils = {};
if (!window.utils.toc) {
  const toggleAutoTitle = async (autoTitleEnabled) => {
    const forms = document.querySelectorAll('form.chat-title-form');

    if (autoTitleEnabled) {
      const titleInputDivs = document.querySelectorAll('.whitespace-pre-wrap');

      const textContents = [];
      titleInputDivs.forEach((titleInputDiv) => {
        textContents.push(titleInputDiv.textContent.trim());
      });
      forms.forEach((form, index) => {
        const bookmarkImg = form.querySelector('.chat-bookmark');
        const titleInput = form.querySelector('.chat-title-input');

        if (bookmarkImg) {
          bookmarkImg.click();
        }
        if (titleInput && !titleInput.value) {
          const inputId = form.getAttribute('data-chat-id');
          const text = textContents[index];
          if (inputId && text) {
            // 60 Byte 이하로 입력 제한
            const truncatedText =
              text.length > 30 ? `${text.substring(0, 27)}..` : text;
            titleInput.value = truncatedText;
          }
        }

        if (titleInput) {
          titleInput.blur();
        }
      });
      return;
    }
    // autoTitle 비활성화 시 사용자 정의 타이틀만 반영
    const pageData = await window.utils.chrome.getChromeStorage(
      window.utils.url.getCurrentPageKey(),
    );
    forms.forEach((form) => {
      const titleInput = form.querySelector('.chat-title-input');
      const inputId = form.getAttribute('data-chat-id');
      if (inputId && pageData[inputId]) {
        titleInput.value = pageData[inputId];
        return;
      }
      titleInput.value = null;
      titleInput.dispatchEvent(new Event('blur'));
    });
  };

  window.utils.autoTitle = {
    toggleAutoTitle,
  };
}
