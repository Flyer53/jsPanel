###NEWS:###

**jsPanel version 2.1.0 released: [http://jspanel.de/](http://jspanel.de/)**

A jQuery plugin to create highly configurable multifunctional floating panels for use in backend solutions and other web applications.
Also usable as modal panel, tooltip or hint. With built in support for bootstrap, right-to-left text direction and more ...

---

###jsPanel homepage: [http://jspanel.de](http://jspanel.de/)###

For a bunch of examples and the api documentation please visit [http://jspanel.de/api.html](http://jspanel.de/api.html)

Copyright &copy; 2014 Stefan Sträßer | [stefanstraesser.eu](http://stefanstraesser.eu)

![jsPanel jQuery Plugin](https://github.com/Flyer53/jsPanel/raw/master/jsPanel.jpg)

---

###NOTES:###

####Bower####
Using bower don't use the camelcase spelling of jsPanel. Use only lower case **jspanel**

####Angular####
Since I didn't work with Angular so far, I can't say very much about using jsPanel with Angular. Nevertheless I can say that:
+ merely loading Angular and writing the attribute <code>ng-app</code> somewhere doesn't effect jsPanel in a negative way
+ Angular uses only a subset of jQuery by default and that's not enough. You need to load the full jQuery library prior loading Angular
+ don't forget to load jQuery-UI (js and css) with at least UI Core, Mouse, Widget, Draggable, Resizable
+ use the HTML5 doctype
