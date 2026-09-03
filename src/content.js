(function () {
  // Listen for injection messages from background script
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'publish_tweet' && message.text) {
      return Promise.resolve(publishTweet(message.text));
    }
    return Promise.resolve({ success: false, error: 'Unknown action' });
  });

  function publishTweet(text) {
    // If compose modal isn't open yet, click the Compose button
    const composeBtn = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
    if (composeBtn && !document.querySelector('[aria-label="Post text"][contenteditable="true"], [data-testid="tweetTextarea_0"]')) {
      composeBtn.click();
      // Give modal time to open
      setTimeout(() => injectAndSubmit(text), 2500);
      return { success: true, note: 'compose button clicked, injecting after delay' };
    }
    return injectAndSubmit(text);
  }

  function injectAndSubmit(text) {
    // Find compose textarea by aria-label
    const textarea = document.querySelector('[aria-label="Post text"][contenteditable="true"], [data-testid="tweetTextarea_0"]');

    if (!textarea) {
      console.error('Tweet compose textarea not found');
      return { success: false, error: 'Textarea not found' };
    }

    // Set text in contenteditable div
    textarea.focus();
    // Create a selection inside the compose box, then insert via execCommand
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(textarea);
    range.collapse(false); // collapse to end
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('insertText', false, text);

    // Find submit button by aria-label
    const submitBtn = document.querySelector('[data-testid="tweetButton"]');

    if (submitBtn) {
      // Twitter enables the button after detecting content; give it time
      setTimeout(() => {
        // If still disabled, try clicking anyway (Twitter may handle it)
        submitBtn.click();
      }, 1200);
      return { success: true };
    }

    return { success: false, error: 'Submit button not found' };
  }
})();
