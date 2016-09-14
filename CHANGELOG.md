## CHANGELOG

### Version 2.6.3

This is only an update of the README.md that I wanted to be updated on npm as well.

Otherwise this is exactly the same as version 2.6.2

---

### Version 2.6.2

+ **fix in jsPanel.exportPanels()** when exporting minimized jsPanels

---

### Version 2.6.1

+ **bugfix in option.position** when using the number **0** as value for either left or top

---

### Version 2.6.0

+ **new option.onbeforeclose** takes a function to execute before the jsPanel closes. If function returns *false* panel will not close.
+ **new option.onbeforemaximize** takes a function to execute before the jsPanel maximizes. If function returns *false* panel will not maximize.
+ **new option.onbeforeminimize** takes a function to execute before the jsPanel minimizes. If function returns *false* panel will not minimize.
+ **new option.onbeforenormalize** takes a function to execute before the jsPanel normalizes. If function returns *false* panel will not normalize.
+ **new option.onclosed** takes a function to execute after the jsPanel closed.
+ **new option.onmaximized** takes a function to execute after the jsPanel maximized.
+ **new option.onminimized** takes a function to execute after the jsPanel minimized.
+ **new option.onnormalized** takes a function to execute after the jsPanel normalized.

---

### Version 2.5.5

+ bugfix **option.ajax** (causing unnecesary get requests whenever a jsPanel is created)

---

### Version 2.5.4

+ bugfix **option.position** when using **{ top: 'auto', left: 'auto' }**

---

### Version 2.5.3

+ **toolbars** now get the same font-family as the title
+ css/styling for **hints** changed
+ **option.load:** inside the complete callback **this** refers to the content property of the panel
+ **option.ajax:** inside the callback functions **this** refers to the content property of the panel
+ **option.ajax:** new parameter **autoload** (if set to *false* returned data is NOT appended to content section by default)
+ **option.callback:** inside the callback functions **this** refers to the jsPanel
+ **tooltips** don't have a drag cursor anymore
+ various internal changes/improvements

---

### Version 2.5.2

+ **fix** of positioning issue with IE

---

### Version 2.5.1

+ correction of a minor css issue with footer toolbars
+ draggable cursor removed from footer toolbar when option.draggable is "disabled"
+ **option.toolbarFooter** modified

---

### Version 2.5.0

+ new **option.controls.confirmClose**. If set to a text value this text will be used for a **window.confirm()** and panel will only be closed if true is returned (only for close button of panel)

---

### Version 2.4.1

+ **fix** issue with some links/events not working properly inside a jsPanel

---

### Version 2.4.0

+ **new option.maximizedMargin** allows to maximize panels with a configurable "margin" on each side
+ **new method reposition(position)** to reposition an already exsisting jsPanel. Accepts the same parameters as option.position
+ **new method reloadContent()** to reload content that was loaded with either option.load, option.ajax or option.iframe
+ **new option.panelstatus** to create a panel in minimized, maximized or smallified status
+ **new option.config** allows to preconfigure panel configurations for later use
+ **new option.template** supports custom templates for the jsPanel to a certain degree
+ **new events** *jspanelbeforeclose, jspanelbeforenormalize, jspanelbeforeminimize, jspanelbeforemaximize*
+ **new property option** gives access to the complete options object
+ **new methods jsPanel.exportPanels()/importPanels()** to export/save/import panel layout
+ a lot of internal code modifications/improvements

For more details please refer to the API [http://jspanel.de/api.html](http://jspanel.de/api.html)
and documentation pages [http://jspanel.de/documentation](http://jspanel.de/documentation/)

---

### Version 2.3.0

+ **new** method **resize(width, height)** to resize an exsisting jsPanel by code
+ this version adds some "responsiveness" to **tooltips**. Tooltips check whether they overflow the boundaries of the browser viewport and will shift either left/right or up/down. Optionally a new tooltip parameter **shiftwithin** sets another container as reference to check against concerning overflow.
+ the global object **jsPanel** has a new property **device**, an object with the keys **mobile**, **tablet**, **phone**, **os** and **userAgent**. **jsPanel.device** is available when [mobile-detect.js](https://github.com/hgoebl/mobile-detect.js) is loaded. 

---

### Version 2.2.2

+ solved issue with z-index values when using zurb foundation
+ improved css for disabled controls
+ slightly changed themes light, medium and dark

---

### Version 2.2.1

+ bugfix: configuration of controls (affected only controls of childpanels)
+ bugfix: handling of jsPanel events

---

### Version 2.2.0

+ new **option.iframe** to ease the use of iframes as content
+ new **option.dblclicks** to add doubleclick handlers for title, content and footer sections
+ new method **jsPanel.control(action, ctrl)** to disable/enable individual controls of existing panel
+ added **jsGlyph iconfont** included to get rid of the icon sprite image
+ **option.controls** extended to disable individual controls on panel creation
+ improved: title width now automatically adjust not to exceed jsPanel width
+ various bugfixes

---

### Version 2.1.0

+ HTML & CSS for hints improved
+ try/catch block added to catch errors when element chosen by option.selector doesn't exsist
+ method **closeChildpanels** improved
+ added class **jsPanel-tt** to tooltips
+ **added option.paneltype.solo** for tooltips (if true will close all other tooltips)
+ added function **closeallTooltips()** (used only internally)
+ body click handler removes all tooltips on click in body except click is inside tooltip
+ **fix:** reset controls of smallified panel on resize with mouse (within resizestop handler)
+ extended **option.paneltype** to add arrowlike corners/pointers to tooltips

---

### Version 2.0

Version 2 is a complete rewrite of the jsPanel jQuery Plugin.

Major changes in version 2 are:

+ Compared to version 1.x version 2.x is a **jQuery function** rather than a jQuery method. So basically a jsPanel is created with <code>$.jsPanel([config]);</code>
+ The seperate bootstrap version is obsolete. Version 2 can be used in both bootstrap and non-bootstrap environments.

All in all, the new features, improvements and changes are too numerous to list them all here. Please refer to the API documentation:

[http://jspanel.de/api.html](http://jspanel.de/api.html)

---

### Version 1.11.0

Version 1.11 implements a number of changes and improvements. Most of them are just internal issues. But there are some other changes as well. See details below:

+ **option.size** has a changed functionality now: **option.size** now sets width and height of the content area of the jsPanel. Not width and height of the jsPanel as a whole!
+ The **header section** now takes only the vertical space needed to accommodate title and controls. It will expand to the formerly used height when a toolbarHeader is set.
+ **New property <code>content</code>** of the jsPanel representing all DOM within the content area of the jsPanel.
+ I removed **option.contentBG**.
+ For **childpanels** (meaning jsPanels that are appended to the content area of another jsPanel) dragging is limited to the containing element by default. This can be overruled using the draggable configuration object.
+ improved functionality of the events **onjspanelloaded** and **onjspanelclosed** including a bugfix: **onjspanelclosed** was fired twice in certain situations.
+ Some more code is now put in functions for better reusability and to avoid code repetitions.
+ internal improvements in the options: **autoclose, id, modal, rtl, size, theme, tooltip**
+ internal improvements in the methods: **addToolbar(), close(), closeChildpanels(), maximize(), storeData()**

---

### Version 1.10.0

+ **New option.rtl** adds support for RTL text direction on individual jsPanels.
+ **Bugfix in option.modal** when a modal jsPanel is appended directly to the <body> element
+ internal improvements in the code base

---

### Version 1.9.1

Maintainance Release with internal code improvements

---

### Version 1.9.0

+ new **option.tooltip** implements a basic tooltip functionality. Tooltips can be positioned either top, right, left or bottom of the element the tooltip is applied to and offers almost all options a normal jsPanel has.
+ **jsPanel.css** integrates some css rules that provide the possibility to generate text only tooltips using only css3

See the [API](http://jspanel.de/api.html) for more details

---

### Version 1.8.1

+ changed **option.toolbarFooter**: footer will be removed when not used instead of display:none
+ some internal adaptions

---

### Version 1.8.0

+ added **option.header** allows to remove the header section of a jsPanel completely

---

### Version 1.7.1

+ primarily a **maintanance release** where I replaced duplicate code with functions
+ **option.position** and **option.size** are modified slightly. Refer to the api for details please

---

### Version 1.7.0

+ added **option.restoreTo** to change default behaviour of minimized jsPanels when maximized again
+ removed option.toolbarContent - use option.toolbarHeader
+ removed method .movetoFront() - use .front()

---

### Version 1.6.2

+ **option.modal:** Added option to add custom css classes to <code>&lt;button&gt;</code> elements in the footer toolbar when using one of the modal presets
+ general improvements in the js-script

---

### Version 1.6.1

+ **Bugfix when using option.toolbarHeader** instead of option.toolbarContent
+ added option in **option.controls**
+ **option.show** extended to add basic support of css animations

For details about the changes please go to http://jspanel.de/api.html

---

### Version 1.6.0

+ most important new feature is an **optional footer toolbar**. Each individual item appended to the toolbar can be configured with its own event type and callback
+ the header toolbar now has the same functionality as the footer toolbar
+ **option.modal** now has a few predefined setups for a few standard situations
+ implementation of events **onjspanelloaded** and **onjspanelclosed**
+ new **option.show** to choose between two animation types when blending in a jsPanel
+ css and themes are refined a bit
+ overall improvements in the code

---

### Version 1.5.0

+ Added option to create a **modal jsPanel**
+ Added basic support for **themes** including various themes
+ Updated **maximize** function. jsPanels appended to the body element will maximize fullscreen within the window
+ Updated **option.id**: No more fallback if jQuery.fn.uniqueId() is missing since jQuery UI >= version 1.9 is a dependency anyhow
+ Updated **option.position** for jsPanels that are appended to the body element
+ API documentation now has a section about the defaults and how to change them

---

### Version 1.4.0

**CSS**

In this version I fixed some css issues and changed the design of the jsPanel to meet a more modern or rather neutral style.

**option.controls**

Added support for icon fonts in the title/header of the jsPanel. Built in is the support for bootstrap glyphicons and font-awesome and can be activated in option.controls.

**Bugfix** in the minimize functionality when resizable and/or draggable is disabled.
**Bugfix** in the maximize functionality..

---

### Version 1.3.1

**Bugfix** in the resize behaviour when using option.position with bottom and/or right

---

### Version 1.3.0

**Bugfix** in option.size.width / option.size.height when using a function returning 0

**Changes:**

+ option.size.width < 150 will result in default width
+ option.size.height < 93 will result in default height

**Added functionality**

+ When using functions to calculate option.size.width/height or option.position.top/left/bottom/right the functions receive the jsPanel as argument
+ Start event of draggable feature has a function attached by default in order to make the draggable feature properly usable when using option.position.bottom/right in combination with option.size.width/height 'auto'
+ New method .front() - will replace .movetoFront() which is deprecated

---

### Version 1.2.0

**Added options**

+ **option.autoclose** allows the jsPanel to close automatically after a specified time
+ **option.controls** allows to configure the buttons in the header

**Improved options:**

+ **size: { width: 'auto', height: 'auto' }** can now be abbreviated with **size: 'auto'**
+ **position: { top: 'auto', left: 'auto' }** can now be abbreviated with **position: 'auto'**
+ **position: { top: 'center', left: 'center' }** can now be abbreviated with **position: 'center'**
+ **position** now additionally accepts values for bottom and right **{ bottom: 0, right: 0 }**
+ **automatic centering** now also works when width and/or height are set to 'auto', unless loading content is delayed because of using an asynchronous ajax request or the callback function to load the content
+ **additional shortcuts for option.position:**<br>
'top left' | 'top center' | 'top right' | 'center right' | 'bottom right' | 'bottom center' | 'bottom left' | 'center left'

+ **overflow** now alternatively accepts a string to set the css property overflow
+ **resizable and draggable** can be disabled

---

### Version 1.1.1

+ **Bugfix** Content area of the jsPanel did not resize when resizing a maximized jsPanel with the jQuery-UI resize handle.
+ **Change** For z-index management the script internally now uses the jQuery-UI method zIndex()
+ **Change** New clearfix css definition in _jsPanel.css_

---

### Version 1.1.0

+ **Improvement:** Removed the settings for **_containment_** in the default settings objects for **_option.resizable_** and **_option.draggable_**.
The default settings are unnecessary and caused problems when the jsPanel was bigger in size than the containing parent element.

+ **Improvement:** Code for **_option.load_** improved. See the documentation for details.
+ **Improvement:** Correction in _jsPanel.css_
+ **Added functionality:** The settings object for **_option.ajax_** now optionally accepts functions that will be passed to _$.ajax().done()_, _$.ajax().fail()_, _$.ajax().always()_ and _$.ajax().then()_.
See the documentation for details on how to use this settings.

---

### Version 1.0.1

+ **Bugfix:** Error when using **_option.id_** with a user defined function to generate an id for the jsPanel.