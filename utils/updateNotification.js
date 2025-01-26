/* global chrome */
if (!window.utils) window.utils = {};
if (!window.utils.updateNotification) {
  const showUpdateNotification = () => {
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.innerHTML = `
    <div class="notification-content">
      <h1>chatTOC updated 🎉</h1>
      <p> ✔️ Automatically add prompts to the TOC</p>
      <p> ✔️ Set custom titles for the TOC</p>
      <p> ❗ Click the extension icon to control the features</p>
      <p> ❗ This message won’t appear again after being closed</p>
      <button id="close-notification">X</button>
    </div>
  `;
    document.body.appendChild(notification);

    document
      .getElementById('close-notification')
      .addEventListener('click', () => {
        chrome.storage.local.set({ showUpdatePopup: false });
        notification.remove();
      });
  };

  window.utils.updateNotification = { showUpdateNotification };
}
