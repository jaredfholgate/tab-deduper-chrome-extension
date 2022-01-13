const options = {};

chrome.tabs.onCreated.addListener((newTab) => 
{
  //Get the settings
  chrome.storage.sync.get('options', (data) => 
  {
    Object.assign(options, data.options);
    if(options.domains == undefined)
    {
      options.domains = "calendar.google.com,mail.google.com";
      chrome.storage.sync.set({options});
    }

    var domains = options.domains.toLowerCase().split(/\r?\n/);
    var newTabUrl = newTab.pendingUrl.toLowerCase();
  
    var matchesDomain = false;
  
    for(var domainIndex = 0; domainIndex < domains.length; domainIndex++)
    {
      if(newTabUrl.includes(domains[domainIndex]))
      {
        matchesDomain = true;
        break;
      }
    }
  
    //Get and iterate the tabs
    if(matchesDomain)
    {
      chrome.windows.getAll({populate:true},function(windows) 
      {
        var foundMatch = false;
  
        for(var windowIndex = 0; windowIndex < windows.length; windowIndex++) 
        {
          var window = windows[windowIndex];
  
          for(var tabIndex = 0; tabIndex < window.tabs.length; tabIndex++) 
          {
              var tab = window.tabs[tabIndex];
              var openUrl = new URL(tab.url);
              var newUrl = new URL(newTab.pendingUrl);
  
              if(openUrl.host === newUrl.host)
              {
                if(!foundMatch)
                {
                  foundMatch = true;
                  var tabId = parseInt(newTab.id);
                  chrome.tabs.remove(tabId);
                  chrome.tabs.update(tab.id, {active: true});
                  chrome.windows.update(window.id, {focused: true});
                }
                else
                {
                  chrome.tabs.remove(tab.id);
                }
              }
          }
        }
      });
    }
  });
});  

