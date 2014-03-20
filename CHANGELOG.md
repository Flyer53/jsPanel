## CHANGELOG ##

---

### Version 1.1.0 ###

+ **Improvement:** Removed the settings for **_containment_** in the default settings objects for **_option.resizable_** and **_option.draggable_**.
The default settings are unnecessary and caused problems when the jsPanel was bigger in size than the containing parent element.

+ **Improvement:** Code for **_option.load_** improved. See the documentation for details.

+ **Improvement:** Correction in _jsPanel.css_

+ **Added functionality:** The settings object for **_option.ajax_** now optionally accepts functions that will be passed to _$.ajax().done()_, _$.ajax().fail()_, _$.ajax().always()_ and _$.ajax().then()_.
See the documentation for details on how to use this settings.

---

### Version 1.0.1 ###

+ **Bugfix:** Error when using **_option.id_** with a user defined function to generate an id for the jsPanel.
