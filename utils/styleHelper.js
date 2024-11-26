if (!window.utils) window.utils = {};
if (!window.utils.style) {
  const addStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      .mx-auto.flex.flex-1.gap-4.text-base.md\\:gap-5.lg\\:gap-6.md\\:max-w-3xl.lg\\:max-w-\\[40rem\\].xl\\:max-w-\\[48rem\\] {
        scroll-margin-top: 120px;
      }
    `;
    document.head.appendChild(style);
  };

  window.utils.style = {
    addStyles,
  };
}
