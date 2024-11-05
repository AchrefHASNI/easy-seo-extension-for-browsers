chrome.runtime.onInstalled.addListener(() => {
    console.log('SEO Tools extension installed');
  });
  
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['popup.js']
    });
  });
  