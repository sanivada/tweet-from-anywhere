browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'publish_tweet') {
    return handlePublish(message.text);
  }
});

function handlePublish(text) {
  return browser.tabs.create({
    url: 'https://twitter.com/compose/tweet',
    active: false
  }).then((tab) => {
    return new Promise((resolve) => {
      function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          browser.tabs.onUpdated.removeListener(listener);
          attemptPublish(tab.id, text, 0, resolve);
        }
      }
      browser.tabs.onUpdated.addListener(listener);
    });
  });
}

function attemptPublish(tabId, text, attempt, resolve) {
  setTimeout(() => {
    browser.tabs.sendMessage(tabId, {
      action: 'publish_tweet',
      text: text
    }).then((response) => {
      if (response && response.success) {
        // Give the submit click time to process before closing
        setTimeout(() => browser.tabs.remove(tabId), 3000);
        resolve({ success: true });
      } else if (attempt < 2) {
        // Retry if elements not ready
        attemptPublish(tabId, text, attempt + 1, resolve);
      } else {
        resolve({ success: false, error: response ? response.error : 'Failed after retries' });
      }
    }).catch((err) => {
      if (attempt < 2) {
        attemptPublish(tabId, text, attempt + 1, resolve);
      } else {
        resolve({ success: false, error: err.message });
      }
    });
  }, 1500 * (attempt + 1));
}
