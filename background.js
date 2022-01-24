const options = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => 
{
  if(changeInfo.url != undefined && changeInfo.url != "chrome://newtab/")
  {
    processTabs(tabId, changeInfo.url);
  }
});

chrome.tabs.onCreated.addListener((newTab) => 
{
  if(newTab.pendingUrl != undefined && newTab.pendingUrl != "chrome://newtab/")
  {
    processTabs(newTab.id, newTab.pendingUrl);
  }
});  

function processTabs(newTabId, newTabUrl) 
{
  //Get the settings
  chrome.storage.sync.get('options', (data) => 
  {
    GetOptions(data);

    var domains = options.domains.toLowerCase().split(/\r?\n/);
    var newTabUrlLowered = newTabUrl.toLowerCase();
  
    var matchesUrl = false;
    var matchesOn = "";

    for(var domainIndex = 0; domainIndex < domains.length; domainIndex++)
    {
      var urlMatch = domains[domainIndex];
      var urlMatchSplit = urlMatch.split("[", 2);
      var excludes = [];
      if(urlMatchSplit.length == 2)
      {
        urlMatch = urlMatchSplit[0];
        excludes = urlMatchSplit[1].replace("]", "").split(",");
      }

      if(newTabUrlLowered.includes(urlMatch))
      {
        var matchesExclude = false;

        for(var excludeIndex = 0; excludeIndex < excludes.length; excludeIndex++)
        {
          if(newTabUrlLowered.includes(excludes[excludeIndex]))
          {
            matchesExclude = true;
            break;
          }
        }
        if(!matchesExclude)
        {
          matchesUrl = true;
          matchesOn = urlMatch;
          break;
        }
      }
    }
  
    //Get and iterate the tabs
    if(matchesUrl)
    {
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
                var newUrlLowered = tab.url.toLowerCase();

                if(newUrlLowered.includes(matchesOn))
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

function GetOptions(data) {
  Object.assign(options, data.options);
  if(options.domains == undefined)
  {
    options.domains = "calendar.google.com\r\nmail.google.com[&view=pt&,&view=btop&]";
    chrome.storage.sync.set({options});
  }
}

