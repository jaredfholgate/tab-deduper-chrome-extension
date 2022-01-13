const options = {};

// Initialize the form with the user's option settings
chrome.storage.sync.get('options', (data) => {
  Object.assign(options, data.options);
  if(options.domains == undefined)
  {
    options.domains = "calendar.google.com\r\nmail.google.com";
    chrome.storage.sync.set({options});
  }
  optionsForm.domains.value = options.domains;
});

// Immediately persist options changes
optionsForm.domains.addEventListener('change', (event) => {
  options.domains = event.target.value;
  chrome.storage.sync.set({options});
});