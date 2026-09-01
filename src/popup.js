document.getElementById('tweetText').focus();

function updateCounter() {
  const len = document.getElementById('tweetText').value.length;
  const counter = document.getElementById('counter');
  if (len > 280) {
    counter.textContent = len + ' / 280 — limit reached';
    counter.style.color = '#f4212e';
    document.getElementById('publishBtn').disabled = true;
    document.getElementById('publishBtn').style.opacity = '0.4';
  } else {
    counter.textContent = len + ' / 280';
    counter.style.color = '#71767b';
    document.getElementById('publishBtn').disabled = false;
    document.getElementById('publishBtn').style.opacity = '1';
  }
}
document.getElementById('tweetText').addEventListener('input', updateCounter);
updateCounter();

document.getElementById('publishBtn').addEventListener('click', () => {
  const text = document.getElementById('tweetText').value.trim();
  const status = document.getElementById('status');

  if (!text) {
    status.textContent = 'Please enter some text.';
    return;
  }
  if (text.length > 280) {
    status.textContent = text.length + '/280 — too long';
    return;
  }

  status.textContent = 'Publishing...';

  browser.runtime.sendMessage({ action: 'publish_tweet', text: text })
    .then((response) => {
      if (response && response.success) {
        status.textContent = 'Published!';
        document.getElementById('tweetText').value = '';
      } else {
        status.textContent = 'Failed. Is Twitter open?';
      }
    })
    .catch((err) => {
      status.textContent = 'Error: ' + err.message;
    });
});
