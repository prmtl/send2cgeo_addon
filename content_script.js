 /* global chrome */
//
// "good" pages - have cache id in url
// http://opencaching.pl/viewcache.php?wp=OP8JW6
// http://www.opencaching.nl/viewcache.php?wp=OB1B2A
// http://www.opencaching.ro/viewcache.php?wp=OR0176
// http://www.opencaching.us/viewcache.php?wp=OU0A36

// "bad" pages - need to look through page content
// http://www.opencaching.de/viewcache.php?cacheid=181654
// http://www.opencaching.cz/viewcache.php?cacheid=629
// http://www.opencachingspain.es/viewcache.php?cacheid=146576
// http://www.opencaching.fr/viewcache.php?cacheid=172368
// http://www.opencaching.it/viewcache.php?cacheid=181653

function getQuery(url) {
  const parsedQuery = {};
  const pairs = url.substring(url.indexOf('?') + 1).split('&');
  const splitted = pairs.map(pair => pair.split('='));
  splitted.forEach(pair => {
    parsedQuery[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  });
  return parsedQuery;
}

function getCacheIdFromUrl(url) {
  return getQuery(url).wp;
}

const cacheIdPattern = /wp=([A-Z0-9]+)/;

function getCacheIdFromText(text) {
  try {
    return text.match(cacheIdPattern)[1];
  } catch (e) {
    return null;
  }
}

function getCacheId() {
  return getCacheIdFromUrl(window.location.href) || getCacheIdFromText(document.body.innerHTML);
}

document.addEventListener('DOMContentLoaded', () => {
  const cacheId = getCacheId();
  if (cacheId) {
    console.log('CACHE FOUND', cacheId);
    chrome.runtime.sendMessage(JSON.stringify({
      action: 'foundCacheId',
      cacheId,
    }));
  }
});

chrome.runtime.onMessage.addListener((rawMessage, sender, sendResponse) => {
  const message = JSON.parse(rawMessage);
  switch (message.action) {
    case 'getCacheId':
      sendResponse(getCacheId());
      break;
    default:
      console.warn('Unknown message', message);
  }
});
