/* global chrome */
const { initializeTOC } = window.utils.toc;
const { initializeChatElements } = window.utils.chat;
const { showUpdateNotification } = window.utils.updateNotification;

let observer = null;

const initializePage = async () => {
  const hasNewElements = await initializeChatElements();

  if (hasNewElements) {
    await initializeTOC();
  }
};

const setupObserver = () => {
  if (observer) {
    observer.disconnect();
  }

  observer = new MutationObserver((mutations) => {
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
};

const updateAllForms = (enabled) => {
  const forms = document.querySelectorAll('form.chat-title-form');
  forms.forEach((form) => {
    form.style.display = enabled ? 'flex' : 'none';

    if (enabled) {
      const input = form.querySelector('input.chat-title-input');
      input.style.display = input.value ? 'inline-block' : 'none';
    }
  });
};

const toggleExtension = (enabled) => {
  const tocContainer = document.getElementById('toc-container');

  if (!enabled) {
    document.body.classList.add('extension-disabled');
    if (tocContainer) {
      tocContainer.style.display = 'none';
    }
    updateAllForms(false);
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  } else {
    document.body.classList.remove('extension-disabled');
    if (tocContainer) {
      tocContainer.style.display = 'block';
    }
    initializePage();
    setupObserver();
    updateAllForms(true);
  }
};

(async () => {
  await initializePage();
})();

chrome.storage.local.get('enabled', ({ enabled = true }) => {
  toggleExtension(enabled);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_EXTENSION') {
    toggleExtension(message.enabled);
  }
});

showUpdateNotification();
