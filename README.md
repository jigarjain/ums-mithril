# A mini User Management System on Mithril

The idea of this application was to simply try a different UI framework. I chose to experiment with Mithril.


## Database
Again for the sake of POC, I chose to go with IndexedDB instead of writing any backend service. Wrote a simple & minimal Promise based wrapper for the low level IndexedDB api.


## Build
![alt text](http://i.imgur.com/iuwr2ou.jpg "")

No `webpack` or `browserify` or `grunt/gulp`. This is standard single file js & css which I think is a decent idea for a simple POC. Just serve the `index.html` file from any web server.


## Code Style
Code follows ES2015 syntax. It is not transpiled using Babel & hence expected to work only on all latest browsers.


## Thoughts
Mithril as a framework looks very intersting with its smaller footprint size. Liked the features available in `m.request` like converting the response to specific Data model & unwrapping your data from the response. Still exploring the `m.component` API though. Worth using on a smaller side projects. Not completely convinced for larger applications.


Demo - https://jigarjain.github.io/ums-mithril