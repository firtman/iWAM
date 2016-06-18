/**
 * iWAM - Web App Manifest for iOS (experimental)
 * Created originally by @firt, still working on it
 * https://github.com/firtman/iWAM
 */
__iWAM = {
    sessionTime: 5, // minutes
    init: function() {
        if (navigator.standalone) {
            // todo: recover URL if within the same sessionTime after navigating out
            // todo: scope - replace <a href> with location.href within scope
        } else {
            if (document.readyState == "complete" 
                || document.readyState == "loaded" 
                || document.readyState == "interactive") {
                __iWAM.fetch();
            } else {
                document.addEventListener("DOMContentLoaded", this.init);
            }
        }   
    },
    parse: function(manifest) {
        if (manifest.display=="standalone" || manifest.display=="fullscreen") {
            this.addHeader("meta", "apple-mobile-web-app-capable", "yes");
            this.addHeader("meta", "apple-mobile-web-app-status-bar-style",
                manifest.display=="fullscreen"?"black-translucent":"black");
        } else {
            console.log("No fullscreen or standalone defined.")
        }
        if (manifest.name || manifest.short_name) {
            var name = manifest.name.length<13 ? manifest.name : manifest.short_name?manifest.short_name:manifest.name;
            this.addHeader("meta", "apple-mobile-web-app-title", name);
        }
        if (manifest.icons && Array.isArray(manifest.icons)) {
            this.parseIcons(manifest.icons);
        }
        if (manifest.start_url) {
            this.parseStartURL(manifest);
        }
        if (manifest.orientation && manifest.orientation != "any") {
            // todo: force orientation change on non-supported orientations?
        }      
        if (manifest.related_applications && Array.isArray(manifest.related_applications)) {
            manifest.related_applications.forEach(function(ra) {
                if (ra.platform=="itunes") {
                    __iWAM.addHeader("meta", "apple-itunes-app", "app-id=" + ra.id + "; app-argument=" + location.href);
                }
            });
        }
        if (manifest.background_color) {
            // Waiting to see if launch images are restored in iOS 10
            // they don't work on iOS 9.2 / iOS 9.3 :(
            
            // var dpr = devicePixelRatio;
            // var canvas = document.createElement("canvas");
            // canvas.width = window.innerWidth*dpr;
            // canvas.height = window.innerHeight*dpr;
            // var context = canvas.getContext("2d");
            // context.beginPath();
            // context.rect(0, 0, canvas.width*dpr, canvas.height*dpr);
            // context.fillStyle = manifest.background_color;
            // context.fill();
            // var dataURL = canvas.toDataURL("image/png");
            // this.addHeader("link", "apple-touch-startup-image", dataURL);
        }
    },
    parseStartURL: function(manifest) {
        var url = new URL(manifest.start_url, document.URL);
        var current = new URL(document.URL);
        var newURL = "";
        if (url.host!=current.host) {
            console.error("Ignoring start_url: it should be on the same host as this page");
            return;
        }
        if (url.pathname!=current.pathname) {
            newURL = url.pathname + url.hash;
        }
        newURL += url.search;
        // We attach the start_url as a hash
        if (newURL.length>1) {
            if (location.hash=="") {
                location.hash = "#_s_u=" + encodeURIComponent(newURL);
                console.log("Saving start_url to " + newURL);
            } else {
                console.log("You are using the hash in this webapp, we can't use it to honor start_url")
            }
        }
        
        // This was a failure idea; visibilitychanged is fired
        // after Safari gets the URL for saving the Web App
        
        // localStorage.setItem("_iWAM_start_url", encodeURIComponent(newURL));
        // document.addEventListener("visibilitychange", function(e) {
        //     if (navigator.standalone) return;
        //     if (document.hidden) {
        //         localStorage.setItem("_iWAM_saved_hash", location.hash?location.hash:"");
        //         location.hash = "#_s_u=" + localStorage.getItem("_iWAM_start_url");
        //         console.log("Changing URL for start_url");
        //     } else {
        //         location.hash = localStorage.getItem("_iWAM_saved_hash");
        //         console.log("Restoring original URL");
        //     }
        // });
    },
    parseIcons: function(icons) {
        var list = [];
        // Parse icon list
        icons.forEach(function(icon, i) {
            if (icon.type==undefined || icon.type=="image/png") {
                var size = "96";
                try {
                    size = icon.sizes.substring(0, icon.sizes.indexOf("x"));
                } catch (e) {}
                list.push({
                    href: icon.src,
                    size: size
                })
            }
        });
        // Find the best icon for current device
        var bestSize = (navigator.platform=="iPhone" || navigator.platform=="iPod") ?
                            (devicePixelRatio==3 ? 180 : 120) : 
                       (navigator.platform=="iPad") ?
                            (devicePixelRatio==1 ? 76 : 
                             matchMedia("device-width: 1024px").matches ? 167 /* Pro */ : 152) : 96 /* Other */;
        var candidate = {
            distance: 1000,
            icon: null
        };
        list.forEach(function(icon) {
            if (icon.size>bestSize) {
                if (icon.size-bestSize<candidate.distance) {
                    candidate.distance = icon.size-bestSize;
                    candidate.icon = icon;
                }
            }
        });
        // If empty, there is no bigger file, just choose the maximum
        if (candidate.icon==null) {
            candidate.distance = 1000;
            list.forEach(function(icon) {
                if (bestSize-icon.size<candidate.distance) {
                    candidate.distance = bestSize-icon.size;
                    candidate.icon = icon;
                }
            });  
        }
        console.log("Icon picked:", candidate.icon.href);
        this.addHeader("link", "apple-touch-icon-precomposed", candidate.icon.href);
    },
    fetch: function() {
        if (navigator.platform=="iPhone" || navigator.platform=="iPad") {
            var link = document.querySelector("link[rel=manifest]");
            if (link) {
                var href = link.href;
                console.log("Manifest found at " + href + ". Downloading.");
                //todo origin check
                var request = new XMLHttpRequest();
                request.open("GET", href);
                request.responseType = "json";
                request.addEventListener("load", function() {
                    console.log("Manifest downloaded.");
                    __iWAM.parse(request.response);
                });
                request.addEventListener("error", function() {
                    console.log("Manifest download error");
                });
                request.send();
            } else {
                console.log("No manifest is present. Nothing else to do here.");
            }
        }

    },
    addHeader: function(type, key, value) {
        var header = document.getElementsByTagName("head")[0];
        var element = document.createElement(type);
        var alreadyPresent = false;
        if (type=="meta") {
            element.name = key;
            element.content = value;
            alreadyPresent = document.querySelector("meta[name=" + key + "]")!=undefined;
        } else  if (type=="link") {
            element.rel = key;
            element.href = value;
            alreadyPresent = document.querySelector("link[rel=" + key + "]")!=undefined;            
        }
        if (!alreadyPresent) header.appendChild(element);
    }
}
__iWAM.init();