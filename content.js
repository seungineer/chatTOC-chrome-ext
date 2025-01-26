/* global chrome */
const { initializeTOC } = window.utils.toc;
const { initializeChatElements } = window.utils.chat;
const { showUpdateNotification } = window.utils.updateNotification;
const { toggleAutoTitle } = window.utils.autoTitle;
let observer = null;

const initializePage = async (autoTitleEnabled) => {
  const hasNewElements = await initializeChatElements();
  if (hasNewElements) {
    await toggleAutoTitle(autoTitleEnabled).then(async () => {
      await initializeTOC(autoTitleEnabled);
    });
  }
};

const setupObserver = async () => {
  if (observer) {
    observer.disconnect();
  }

  observer = new MutationObserver(async (mutations) => {
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
      try {
        const { autoTitleEnabled: enabler } = await chrome.storage.local.get([
          'autoTitleEnabled',
        ]);
        await initializePage(enabler);
      } catch (error) {
        console.error(
          '로컬 스토리지에서 autoTitleEnabled 값을 가져오는데 실패했습니다:',
          error,
        );
      }
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

const toggleExtension = async (enabled, autoTitleEnabled) => {
  const tocContainer = document.getElementById('toc-container');

  if (!enabled) {
    document.body.classList.add('extension-disabled');
    if (tocContainer) {
      tocContainer.style.display = 'none';
    }
    updateAllForms(!enabled);
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  } else {
    document.body.classList.remove('extension-disabled');
    if (tocContainer) {
      tocContainer.style.display = 'block';
    }
    updateAllForms(enabled);
    setupObserver();
    await initializePage(autoTitleEnabled).then(() => {
      initializeTOC(autoTitleEnabled);
    });
  }
};

(async () => {
  try {
    const { enabled = true, autoTitleEnabled = true }
      = await chrome.storage.local.get(['enabled', 'autoTitleEnabled']);

    toggleExtension(enabled, autoTitleEnabled);

    await new Promise((resolve) => {
      const observer = new MutationObserver((mutations, obs) => {
        // 어떤 프롬프트든 렌더링된 후에 resolve
        const forms = document.querySelectorAll('.whitespace-pre-wrap');
        if (forms.length > 0) {
          obs.disconnect();
          resolve();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }).then(async () => {
      const { enabled: enabler, autoTitleEnabled: autoTitle }
        = await chrome.storage.local.get(['enabled', 'autoTitleEnabled']);
      if (!enabler) {
        return;
      }
      await toggleAutoTitle(autoTitle).then(async () => {
        await initializeTOC(autoTitle);
      });
    });
  } catch (error) {
    console.error('Initialization error:', error);
  }
})();

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'TOGGLE_EXTENSION') {
    toggleExtension(message.enabled, message.autoTitleEnabled);
    return;
  }
  if (message.type === 'TOGGLE_AUTO_TITLE') {
    await toggleAutoTitle(message.autoTitleEnabled).then(async () => {
      await initializeTOC(message.autoTitleEnabled);
    });
  }
});

// showUpdateNotification();
