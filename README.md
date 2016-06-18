# iWAM (iWeb App Manifest)
An experiment to polyfill Web App Manifest (WAM) for Safari on iOS, useful for Progressive Web Apps (PWA).

## Overview

Progressive Web Apps are getting lot of attention, but they are working with their full potential on mobile devices only on Android-based browsers: 
Google Chrome, Opera, Samsung Internet and Firefox. Microsoft is announcing jumping into [PWAs for Windows 10](https://medium.com/web-on-the-edge/progressive-web-apps-on-windows-8d8eb68d524e) as well 
and on iOS we don't have any public positive statement from the WebKit team yeat. 

Safari on iOS -up to iOS 10 beta 1 at least- doesn't support the two main specs to make PWAs work: Service Workers and Web App Manifest.

While Safari has supported Home Screen Web apps for years now,  the web app definition is declared through meta tags and links, not the [W3C Web App Manifest](https://www.w3.org/TR/appmanifest/) spec.

This project started as an experiment to see how much of the WAM can we polyfill on iOS to figure out what we need from Apple to get WAM supported on iOS.

I hope this experiment will end quickly with Apple taking WAM as all the other vendors.

## Basic Usage

You just add the script into your PWA's HTML (2Kb gzipped) and the WAM manifest file, and it will get your WAM manifest file and polyfill it for iOS for you..

```html
<script async src="iwam.min.js"></script>
<link rel="manifest" href="manifest.json">
```

### Supporting start_url

WAM supports the *start_url* feature that lets you define a different URL to be used when the users installs the PWA. If you want to try an experimental solution for iOS, you should add this code at the top of your HTML

```html
<script>if (location.hash.indexOf("#_s_u=")>=0) location.href=decodeURIComponent(location.hash.substring(6));</script> 
```

You should not use hashes (#) for your current SPA's navigation for this experiment.

** This code is very experimental, and it needs more testing (3 hours of coding only on current version) ;) **

## Supported features

- *name* and *short_name*
- *start_url* (within the same origin; other restrictions apply)
- *icons* (it will take the best one for that device; creating iOS-specific icons
 recommended with sizes: iPhone/iPod (120, 180), iPad (76, 96, 162, 167)
- *related_applications* (use itunes as platform, and id for App's id)
- *background_color*: creates a valid launch screen dynamically - it's now disables because from iOS 9.2 - 10 beta 1 launch images are broken :(

## Limitations

- The *display* media query is not available (you should use navigator.standalone to check status)
- You must understand the challenges when you opt-in for full screen on iOS. Check [Don't use iOS Meta Tags irresponsibly](https://medium.com/@firt/dont-use-ios-web-app-meta-tag-irresponsibly-in-your-progressive-web-apps-85d70f4438cb) being the most important ones: there is no back button and OAuth logins may not work.
- Service Workers can't be simulated without a big architecture change. I've been trying to use AppCache at least to cache the start_url with no luck because the AppCache's manifest must be declared in the HTML at the initial parsing, so nothing happens if you inject an AppCache's manifest dynamically. If you want offline support, use AppCache manually. 

## Next steps

- Optmize the code
- Test, test and test
- Analyze the usage of theme_color to inject a 20px fixed top bar
- iOS will deprecate status-bar=black (display: standalone) so in the future only status-bar=black-translucent will be supported (display: fullscreen) which creates a challenge for app design because your app is being rendered behind the status bar.
- Scope: Evaluate the analysis of external URLs to replace them with navigation.href when it's part of the PWA's scope
- Orientation: Add support for orientation, forcing modal dialogs on non-compatible orientations 
- Security: origin checks, https only?
- Restore internal URL session when the user goes back from background
- Web App Banners: analyze the optional addition of an App Banner using a library such as [ATH](http://cubiq.org/add-to-home-screen), making a polyfill for beforeinstallprompt event

## The Author

Maximiliano Firtman
[@firt](http://www.twitter.com/firt)
Author of [High Performance Mobile Web](http://firt.mobi/hpmw) and [Programming the Mobile Web](http://firt.mobi/pmw)
www.firt.mobi 
