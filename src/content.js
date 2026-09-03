(function () {
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'publish_tweet' && message.text) {
      return Promise.resolve(publishTweet(message.text));
    }
    return Promise.resolve({ success: false, error: 'Unknown action' });
  });

  function publishTweet(text) {
    const composeBtn = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
    if (composeBtn && !document.querySelector('[aria-label="Post text"][contenteditable="true"], [data-testid="tweetTextarea_0"]')) {
      composeBtn.click();
      return new Promise((resolve) => {
        setTimeout(() => resolve(injectAndSubmit(text)), 2500);
      });
    }
    return Promise.resolve(injectAndSubmit(text));
  }

  function injectAndSubmit(text) {
    const textarea = document.querySelector('[aria-label="Post text"][contenteditable="true"], [data-testid="tweetTextarea_0"]');
    if (!textarea) {
      return { success: false, error: 'Textarea not found' };
    }

    textarea.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(textarea);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('insertText', false, text);

    const submitBtn = document.querySelector('[data-testid="tweetButton"]');
    if (!submitBtn) {
      return { success: false, error: 'Submit button not found' };
    }

    return new Promise((resolve) => {
      let checks = 0;
      const maxChecks = 10;
      const interval = setInterval(() => {
        checks++;
        const disabled = submitBtn.getAttribute('aria-disabled') === 'true' || submitBtn.disabled;
        if (!disabled || checks >= maxChecks) {
          clearInterval(interval);
          submitBtn.click();
          resolve({ success: true });
        }
      }, 300);
    });
  }
})();
