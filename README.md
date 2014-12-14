##[jsPanel 2.2.3 released 2014-12-14](#)##

**A jQuery plugin to create multifunctional floating panels.**

A **jsPanel** can be used as a floating, **draggable and resizable panel**, as **modal**, as **tooltip** and even as a **hint**.
Configuration options include **additional toolbars** for header and/or footer sections, **support for right-to-left text direction**,
built in **bootstrap support**, 13 **themes** and much more.

Various options allow for a flexible way to add content to a jsPanel, including AJAX support.

Existing jsPanel sections and contents are easily accessed via various properties. Methods and events offer interaction with it.

![jsPanel jQuery Plugin](https://github.com/Flyer53/jsPanel/raw/master/jsPanel-comp.png)

**Current version 2.2.3**

###jsPanel homepage: [http://jspanel.de](http://jspanel.de/)###

#### API and examples: [http://jspanel.de/api.html](http://jspanel.de/api.html)####

#### more documentation: [http://jspanel.de/documentation](http://jspanel.de/documentation/)####

Copyright &copy; 2014 Stefan Sträßer | [stefanstraesser.eu](http://stefanstraesser.eu)

---

###NOTES:###

####Bower####
Using bower don't use the camelcase spelling of jsPanel. Use only lower case **jspanel**

<code>bower install jspanel</code>

####Angular####
Since I didn't work with Angular so far, I can't say very much about using jsPanel with Angular. Nevertheless I can say that:

+ merely loading Angular doesn't affect jsPanel in a negative way
+ Angular uses only a subset of jQuery by default and that's not enough. You need to load the full jQuery library prior loading Angular. See [https://docs.angularjs.org/api/ng/function/angular.element](docs.angularjs.org/api/ng/function/angular.element)
+ don't forget to load jQuery-UI (js and css) with at least UI Core, Mouse, Widget, Draggable, Resizable
+ use HTML5 doctype
