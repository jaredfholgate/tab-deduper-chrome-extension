const options = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if(changeInfo.url != undefined && changeInfo.url != "chrome://newtab/")
  {
    processTabs(tabId, changeInfo.url);
  }
});

chrome.tabs.onCreated.addListener((newTab) => 
{
  processTabs(newTab.id, newTab.pendingUrl);
});  

function processTabs(newTabId, newTabUrl) 
{
  //Get the settings
  chrome.storage.sync.get('options', (data) => 
  {
    Object.assign(options, data.options);
    if(options.domains == undefined)
    {
      options.domains = "calendar.google.com\r\nmail.google.com";
      chrome.storage.sync.set({options});
    }

    var domains = options.domains.toLowerCase().split(/\r?\n/);
    var newTabUrlLowered = newTabUrl.toLowerCase();
  
    var matchesDomain = false;
  
    for(var domainIndex = 0; domainIndex < domains.length; domainIndex++)
    {
      if(newTabUrlLowered.includes(domains[domainIndex]))
      {
        matchesDomain = true;
        break;
      }
    }
  
    //Get and iterate the tabs
    if(matchesDomain)
    {
      var newUrl = new URL(newTabUrl.replace("_",""));

      chrome.windows.getAll({populate:true},function(windows) 
      {
        var foundMatch = false;
        var tabsToRemove = [];
        for(var windowIndex = 0; windowIndex < windows.length; windowIndex++) 
        {
          var window = windows[windowIndex];
  
          for(var tabIndex = 0; tabIndex < window.tabs.length; tabIndex++) 
          {
              var tab = window.tabs[tabIndex];
              if(newTabId != tab.id)
              {
                var openUrl = new URL(tab.url.replace("_",""));

                if(openUrl.host === newUrl.host)
                {
                  if(!foundMatch)
                  {
                    foundMatch = true;
                    tabsToRemove.push(newTabId);
                    chrome.tabs.update(tab.id, {active: true});
                    chrome.windows.update(window.id, {focused: true});
                  }
                  else
                  {
                    tabsToRemove.push(tab.id);
                  }
                }
              }
          }
        }

        for(var i = 0; i < tabsToRemove.length; i++)
        {
          chrome.tabs.remove(tabsToRemove[i]);
        }
      });
    }
  });
}

