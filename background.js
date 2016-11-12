/* global chrome */
function showNotification(title, message) {
  return chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title,
    message,
  });
}

function sendCache(cacheId) {
  return fetch('http://send2.cgeo.org/add.html?cache=' + cacheId, {
    mode: 'no-cors',
    credentials: 'include',
  }).then(() => showNotification('Sended to c:geo', 'Cache ' + cacheId + ' send to send2geo'));
}

chrome.runtime.onMessage.addListener((rawMessage, sender) => {
  const message = JSON.parse(rawMessage);
  const cacheId = message.cacheId;
  switch (message.action) {
    case 'foundCacheId':
      if (cacheId) {
        chrome.pageAction.show(sender.tab.id);
      }
      break;
    default:
      console.error('Uknown message', message);
  }
});

chrome.pageAction.onClicked.addListener(tab => {
  const msg = JSON.stringify({
    action: 'getCacheId',
  });
  chrome.tabs.sendMessage(tab.id, msg, cacheId => {
    if (cacheId) {
      sendCache(cacheId);
    } else {
      showNotification('No cache', 'Cache ID was not found on the page.');
    }
  });
});
