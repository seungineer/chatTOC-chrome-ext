/* global chrome */
if (!window.utils) window.utils = {};
if (!window.utils.updateNotification) {
  const showUpdateNotification = () => {
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.innerHTML = `
    <div class="notification-content">
      <h1>chatTOC chrome extension updated 🎉</h1>
      <p> ✔️ Check new features</p>
      <p> ✔️ This popup will not show again</p>
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
