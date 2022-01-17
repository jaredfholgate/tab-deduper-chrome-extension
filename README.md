# Chrome Duplicate Tab Closer

## What is it?

This is a Chrome extension that closes duplicate tabs and shifts focus to the previously opened tab.


## How does it work?

It has an options section that allows you to specify strings to match on separated by a carriage return.

E.g. 'mail.google.com' and 'calendar.google.com'

If it finds a match for any of the strings in the url of a new tab (opened via a link) or an existing tab with a manully updated url, it will check for duplicates. If it finds a duplicate in any open Chrome window, it will switch focus to that tab and then close the tab that was just created or modified.


## Why does it exist?

I was trying to find an extension that did this and couldn't really find one that met my exacting requirments, so I thoight I'd have a go at writing one myself.
