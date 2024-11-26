if (!window.utils) window.utils = {};
if (!window.utils.url) {
  const getCurrentPageKey = () => {
    const url = window.location.pathname;
    const match = url.match(/\/c\/([^/]+)/);
    return match ? match[1] : 'default';
  };

  window.utils.url = {
    getCurrentPageKey,
  };
}
