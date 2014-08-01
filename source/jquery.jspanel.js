/* global console */
/* jQuery Plugin jsPanel
 Version: 2 beta build112 2014-07-31 08:38
 Dependencies:
     jQuery library ( > 1.7.0 incl. 2.1.1 )
     jQuery.UI library ( > 1.9.0 ) - (at least UI Core, Mouse, Widget, Draggable, Resizable)
     bootstrap (required only when using the bootstrap features)
     HTML5/CSS3 compatible browser

 Copyright (c) 2014 Stefan Sträßer, <http://stefanstraesser.eu/>

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 You should have received a copy of the MIT License along with this program.  If not, see <http://opensource.org/licenses/MIT>.
 */

var jsPanel = {};
jsPanel.version = '2 beta build112 2014-07-31 08:38';
// global arrays that log hints for option.position 'top center', 'top left' and 'top right'
jsPanel.hintsTc = [];
jsPanel.hintsTl = [];
jsPanel.hintsTr = [];
jsPanel.ID = 0;

(function ($) {
    "use strict";

    $.jsPanel = function (config) {

        var jsP = $('<div class="jsPanel jsPanel-theme-default">' +
                        '<div class="jsPanel-hdr jsPanel-theme-default">' +
                            '<h3 class="jsPanel-title"></h3>' +
                            '<div class="jsPanel-hdr-r">' +
                                '<div class="jsPanel-btn-close"></div>' +
                                '<div class="jsPanel-btn-max"></div>' +
                                '<div class="jsPanel-btn-norm"></div>' +
                                '<div class="jsPanel-btn-min"></div>' +
                                '<div class="jsPanel-btn-small"></div>' +
                                '<div class="jsPanel-btn-smallrev"></div>' +
                            '</div>' +
                            '<div class="jsPanel-hdr-toolbar jsPanel-clearfix"></div>' +
                        '</div>' +
                        '<div class="jsPanel-content jsPanel-theme-default"></div>' +
                        '<div class="jsPanel-ftr jsPanel-theme-default jsPanel-clearfix"></div>' +
                    '</div>'),

            // Extend our default config with those provided.
            // Note that the first arg to extend is an empty object - this is to keep from overriding our "defaults" object.
            option = $.extend(true, {}, $.jsPanel.defaults, config),
            jsPparent = $(option.selector).first(),
            jsPparentTagname = jsPparent[0].tagName.toLowerCase(),
            count = jsPparent.children('.jsPanel').length,
            widthMinimized = 150,
            anim = option.show,
            verticalOffset = 0;

        jsP.status = "initialized";
        jsP.header = $('.jsPanel-hdr', jsP);
        jsP.header.title = $('.jsPanel-title', jsP.header);
        jsP.header.controls = $('.jsPanel-hdr-r', jsP.header);
        jsP.header.toolbar = $('.jsPanel-hdr-toolbar', jsP.header);
        jsP.content = $('.jsPanel-content', jsP);
        jsP.footer = $('.jsPanel-ftr', jsP);

        // rebuild option.paneltype strings to objects and set defaults for option.paneltype
        (function(){
            if (option.paneltype === 'modal') {
                option.paneltype = {
                    type: 'modal'
                };
            } else if (option.paneltype === 'tooltip') {
                option.paneltype = {
                    type: 'tooltip'
                };
            } else if (option.paneltype === 'hint') {
                option.paneltype = {
                    type: 'hint'
                };
            }
            if (option.paneltype.type === 'modal') {
                option.paneltype.mode = option.paneltype.mode || 'default';
                return;
            }
            if (option.paneltype.type === 'tooltip') {
                option.paneltype.mode = option.paneltype.mode || false;
                option.paneltype.position = option.paneltype.position || 'top';
                return;
            }
        }());

        function winscrollTop() { return $(window).scrollTop(); }
        function winscrollLeft() { return $(window).scrollLeft(); }
        function winouterHeight() { return $(window).outerHeight(); }
        function winouterWidth() { return $(window).outerWidth(); }
        function docouterHeight() { return $(document).outerHeight(); }

        // maintains panel position relative to window on scroll of page
        function fixPosition() {
            var jspaneldiff = jsP.offset().top - winscrollTop();
            jsP.jsPanelfixPos = function () {
                jsP.css('top', winscrollTop() + jspaneldiff + 'px');
            };
            $(window).on('scroll', jsP.jsPanelfixPos);
        }

        function calcOffsetV() {
            return jsP.offset().top - winscrollTop();
        }

        // hide controls specified by param "sel"
        function hideControls(sel) {
            var controls = ".jsPanel-btn-close, .jsPanel-btn-norm, .jsPanel-btn-min, .jsPanel-btn-max, .jsPanel-btn-small, .jsPanel-btn-smallrev";
            $(controls, jsP).css('display', 'block');
            $(sel, jsP).css('display', 'none');
        }

        // replace bottom/right values with corresponding top/left values if necessary
        function replaceCSSBottomRight(panel) {
            var panelPosition = panel.position();
            if (panel.css('bottom')) {
                panel.css({
                    'top': parseInt(panelPosition.top, 10) + 'px',
                    'bottom': ''
                });
            }
            if (panel.css('right')) {
                panel.css({
                    'left': parseInt(panelPosition.left, 10) + 'px',
                    'right': ''
                });
            }
        }

        // calculates css z-index
        function setZi() {
            var zi = 0;
            $('.jsPanel').each(function () {
                if ($(this).zIndex() > zi) {
                    zi = $(this).zIndex();
                }
            });
            return zi + 1;
        }

        // used in option.autoclose and checks prior use of .close() whether the panel is still there
        function autoclose(panel, id) {
            var elmt = $('#' + id);
            if (elmt.length > 0) {
                elmt.fadeOut('slow', function () {
                    panel.close(); // elmt geht hier nicht weil .close() nicht für elmt definiert ist
                });
            }
        }

        // converts option.position string to object
        function rewriteOPosition() {
            var op = option.position;
            if (op === 'center') {
                return {top: 'center', left: 'center'};
            }
            if (op === 'auto') {
                return {top: 'auto', left: 'auto'};
            }
            if (op === 'top left') {
                return {top: '0', left: '0'};
            }
            if (op === 'top center') {
                return {top: '0', left: 'center'};
            }
            if (op === 'top right') {
                return {top: '0', right: '0'};
            }
            if (op === 'center right') {
                return {top: 'center', right: '0'};
            }
            if (op === 'bottom right') {
                return { bottom: '0', right: '0'};
            }
            if (op === 'bottom center') {
                return {bottom: '0', left: 'center'};
            }
            if (op === 'bottom left') {
                return {bottom: '0', left: '0'};
            }
            if (op === 'center left') {
                return {top: 'center', left: '0'};
            }
            return option.position;
        }
        option.position = rewriteOPosition();

        // builds toolbar
        function configToolbar(optionToolbar, toolbar) {
            var i,
                el,
                type,
                max = optionToolbar.length;
            for (i = 0; i < max; i += 1) {
                if (typeof optionToolbar[i] === 'object') {
                    el = $(optionToolbar[i].item);
                    type = el.prop('tagName').toLowerCase();
                    if (type === 'button') {
                        // set text of button
                        el.append(optionToolbar[i].btntext);
                        // add class to button
                        if (typeof optionToolbar[i].btnclass === 'string') {
                            el.addClass(optionToolbar[i].btnclass);
                        }
                    }
                    toolbar.append(el);
                    // bind handler to the item
                    el.on(optionToolbar[i].event, jsP, optionToolbar[i].callback);
                }
            }
        }

        // calculates option.position for hints using 'top left', 'top center' or 'top right'
        function hintTop(hintGroup) {
            var i,
                hintH = 0,
                max = hintGroup.length;
            for (i = 0; i < max; i += 1) {
                hintH += $('#' + hintGroup[i]).outerHeight(true);
            }
            if (hintGroup === jsPanel.hintsTr) {
                return {top: hintH, right: 0};
            }
            if (hintGroup === jsPanel.hintsTl) {
                return {top: hintH, left: 0};
            }
            if (hintGroup === jsPanel.hintsTc) {
                return {top: hintH, left: 'center'};
            }
            return {top: 0, left: 0};
        }

        // reposition hint upon closing
        function reposHints(hintGroup) {
            var hintH,
                el,
                i,
                max = hintGroup.length;
            if (jsPparentTagname === 'body') {
                hintH = winscrollTop();
            } else {
                hintH = 0;
            }
            for (i = 0; i < max; i += 1) {
                el = $('#' + hintGroup[i]);
                el.animate({
                    top: hintH + 'px'
                });
                hintH += el.outerHeight(true);
            }
        }

        // calculates css left for tooltips
        function calcPosTooltipLeft(pos) {
            // width of element serving as trigger for the tooltip
            var parW = jsPparent.outerWidth(),
                // check whether offset is set
                oX = option.offset.left || 0;
            if (pos === 'top' || pos === 'bottom') {
                return (parW - option.size.width) / 2 + oX + 'px';
            }
            if (pos === 'left') {
                return -(option.size.width) + oX + 'px';
            }
            if (pos === 'right') {
                return parW + oX + 'px';
            }
            return false;
        }

        // calculates css top for tooltips
        function calcPosTooltipTop(pos) {
            var parH = jsPparent.innerHeight(),
                oY = option.offset.top || 0;
            if (pos === 'left' || pos === 'right') {
                return -(option.size.height / 2) + (parH / 2) + oY + 'px';
            }
            if (pos === 'top') {
                return -(option.size.height + oY) + 'px';
            }
            if (pos === 'bottom') {
                return parH + oY + 'px';
            }
            return false;
        }

        // calculate position center for option.position == 'center'
        function posCenter(selector, size) {
            var posL = ($(selector).outerWidth() / 2) - ((parseInt(size.width, 10) / 2)),
                posT;
            if (selector === 'body') {
                posT = ($(window).outerHeight() / 2) - ((parseInt(size.height, 10) / 2) - winscrollTop());
            } else {
                posT = ($(selector).outerHeight() / 2) - ((parseInt(size.height, 10) / 2));
            }
            return {top: posT + 'px', left: posL + 'px'};
        }

        // restores minimized panels to their initial container, reenables resizable and draggable, repositions minimized panels
        function restoreFromMinimized() {
            var minimizedCount = $('.jsPanel', $('#jsPanel-min-container')).length,
                i,
                left;
            // restore minimized panel to initial container
            if (jsP.status === "minimized") {
                // hier kein fadeOut() einbauen, funktioniert nicht mit fixPosition()
                jsP.animate({opacity: 0}, {duration: 50});
                jsP.appendTo(option.selector );
            }
            jsP.resizable("enable").draggable("enable");
            // reposition minimized panels
            for (i = 0; i < minimizedCount; i += 1) {
                left = (i * widthMinimized) + 'px';
                $('.jsPanel', $('#jsPanel-min-container')).eq(i).animate({
                    left: left
                });
            }
        }

        // maximizes a panel within the body element
        function maxWithinBody() {
            if (jsP.status !== "maximized" && jsPparentTagname === 'body' && option.paneltype.mode !== 'default') {
                // remove window.scroll handler, is added again later in this function
                $(window).off('scroll', jsP.jsPanelfixPos);
                // restore minimized panel to initial container
                restoreFromMinimized();
                jsP.animate({
                    top: winscrollTop() + 5 + 'px',
                    left: winscrollLeft() + 5 + 'px',
                    width: winouterWidth() - 10 + 'px',
                    height: winouterHeight() - 10 + 'px'
                }, {
                    done: function () {
                        jsP.resizeContent();
                        jsP.animate({opacity: 1}, {duration: 150});
                        // hier kein fadeIn() einbauen, funktioniert nicht mit fixPosition()
                        hideControls(".jsPanel-btn-max, .jsPanel-btn-smallrev");
                        jsP.status = "maximized";
                        $(jsP).trigger('jspanelmaximized', jsP.attr('id'));
                        $(jsP).trigger('jspanelstatechange', jsP.attr('id'));
                        fixPosition();
                    }
                });
            }
        }

        // maximizes a panel within an element other than body
        function maxWithinElement() {
            if (jsP.status !== "maximized" && jsPparentTagname !== 'body' && option.paneltype.mode !== 'default') {
                var width,
                    height;
                // restore minimized panel to initial container
                restoreFromMinimized();
                width = parseInt(jsP.parent().outerWidth(), 10) - 10 + 'px';
                height = parseInt(jsP.parent().outerHeight(), 10) - 10 + 'px';
                jsP.animate({
                    top: '5px',
                    left: '5px',
                    width: width,
                    height: height
                }, {
                    done: function () {
                        jsP.resizeContent();
                        jsP.animate({opacity: 1}, {duration: 150});
                        hideControls(".jsPanel-btn-max, .jsPanel-btn-smallrev");
                        jsP.status = "maximized";
                        $(jsP).trigger('jspanelmaximized', jsP.attr('id'));
                        $(jsP).trigger('jspanelstatechange', jsP.attr('id'));
                    }
                });
            }
        }

        // moves a panel to the minimized container
        function movetoMinified() {
            var mincount,
                left;
            // wenn der Container für die minimierten jsPanels noch nicht existiert -> erstellen
            if ($('#jsPanel-min-container').length === 0) {
                $('body').append('<div id="jsPanel-min-container"></div>');
            }
            if (jsP.status !== "minimized") {
                mincount = $('.jsPanel', $('#jsPanel-min-container')).length;
                left = (mincount * widthMinimized) + 'px';
                // jsPanel in vorgesehenen Container verschieben
                jsP.css({
                    left: left,
                    top: 0,
                    opacity: 1
                })
                    .appendTo('#jsPanel-min-container')
                    .resizable({disabled: true})
                    .draggable({disabled: true});
                jsP.content.css('min-width', '');
                // buttons show or hide
                hideControls(".jsPanel-btn-min, .jsPanel-btn-small, .jsPanel-btn-smallrev");
                $(jsP).trigger('jspanelminimized', jsP.attr('id'));
                $(jsP).trigger('jspanelstatechange', jsP.attr('id'));
                jsP.status = "minimized";
                $(window).off('scroll', jsP.jsPanelfixPos);
            }
        }

        function calcPos(prop, selector) {
            if (option.position[prop] === 'auto') {
                option.position[prop] = count * 26 + 'px';
            } else if ($.isFunction(option.position[prop])) {
                option.position[prop] = option.position[prop](jsP);
            } else if (option.position[prop] === 0) {
                option.position[prop] = '0';
            } else {
                option.position[prop] = parseInt(option.position[prop], 10) + 'px';
            }
            // corrections if jsPanel is appended to the body element
            if (selector === 'body') {
                if (prop === 'top') {
                    option.position[prop] = parseInt(option.position[prop], 10) + winscrollTop() + 'px';
                }
                if (prop === 'bottom') {
                    option.position[prop] = parseInt(option.position[prop], 10) - winscrollTop() + 'px';
                }
                if (prop === 'left') {
                    option.position[prop] = parseInt(option.position[prop], 10) + winscrollLeft() + 'px';
                }
                if (prop === 'right') {
                    option.position[prop] = parseInt(option.position[prop], 10) - winscrollLeft() + 'px';
                }
            }
            return option.position[prop];
        }

        /* option.id | default: false */
        // wenn option.id -> string oder function?
        if (typeof option.id === 'string') {
            // id doesn't exist yet -> use it
            if ($('#' + option.id).length < 1) {
                jsP.attr('id', option.id);
            } else {
                jsPanel.ID += 1;
                jsP.attr('id', 'jsPanel-' + jsPanel.ID);
                // write new id as notification in title
                $('.jsPanel-title', jsP).html($('.jsPanel-title', jsP).text() + ' AUTO-ID: ' + jsP.attr('id'));
            }
        } else if ($.isFunction(option.id)) {
            jsP.attr('id', option.id);
        }

        /* option.paneltype - override or set various settings depending on option.paneltype */
        if (option.paneltype.type === 'modal') {
            option.selector = 'body';
            option.show = 'fadeIn';
            if (option.paneltype.mode === 'default') {
                option.resizable = false;
                option.draggable = false;
                option.removeHeader = false;
                option.position = {top: 'center', left: 'center'};
                option.controls.buttons = 'closeonly'; //do not delete else "modal" with no close button possible
                $(".jsPanel-btn-min, .jsPanel-btn-norm, .jsPanel-btn-max, .jsPanel-btn-small, .jsPanel-btn-smallrev", jsP).remove();
                $(jsP.header, jsP.header.title, jsP.footer).css('cursor', 'default');
                $('.jsPanel-title', jsP).css('cursor', 'inherit');
            }
            // backdrop einfügen
            if ($('.jsPanel-backdrop').length < 1) {
                (function () {
                    var backdrop = '<div class="jsPanel-backdrop" style="height:' + docouterHeight() + 'px;"></div>';
                    $('body').append(backdrop);
                }()); // IIFE is only to prevent backdrop as global variable
            }
        } else if (option.paneltype.type === 'tooltip') {
            option.position = {};
            option.resizable = false;
            option.draggable = false;
            option.show = 'fadeIn';
            option.controls.buttons = 'closeonly';
            // calc top & left for the various positions
            if (option.paneltype.position === 'top') {
                option.position = {
                    top: calcPosTooltipTop('top'),
                    left: calcPosTooltipLeft('top')
                };
            } else if (option.paneltype.position === 'bottom') {
                option.position = {
                    top: calcPosTooltipTop('bottom'),
                    left: calcPosTooltipLeft('bottom')
                };
            } else if (option.paneltype.position === 'left') {
                option.position = {
                    top: calcPosTooltipTop('left'),
                    left: calcPosTooltipLeft('left')
                };
            } else if (option.paneltype.position === 'right') {
                option.position = {
                    top: calcPosTooltipTop('right'),
                    left: calcPosTooltipLeft('right')
                };
            }
            // position the tooltip
            jsP.css({
                top: option.position.top,
                left: option.position.left
            });
            if (!jsPparent.parent().hasClass('jsPanel-tooltip-wrapper')) {
                // wrap element serving as trigger in a div - will take the tooltip
                jsPparent.wrap('<div class="jsPanel-tooltip-wrapper">');
                // append tooltip (jsPanel) to the wrapper div
                jsPparent.parent().append(jsP);

                if (option.paneltype.mode === 'semisticky') {
                    jsP.hover(
                        function () {
                            $.noop();
                        },
                        function () {
                            jsP.close();
                        }
                    );
                } else if (option.paneltype.mode === 'sticky') {
                    $.noop();
                } else {
                    option.controls.buttons = 'none';
                    // tooltip will be removed whenever mouse leaves trigger
                    jsPparent.off('mouseout'); // to prevent mouseout from firing several times
                    jsPparent.mouseout(function () {
                        jsP.close();
                    });
                }
            }
        } else if (option.paneltype.type === 'hint') {
            option.resizable = false;
            option.draggable = false;
            option.removeHeader = true;
            option.toolbarFooter = false;
            option.show = 'fadeIn';
            jsP.addClass('jsPanel-hint');
            jsP.content.addClass('jsPanel-hint-content');
            // autoclose default 8 sec | or -1 to deactivate
            if (!option.autoclose) {
                option.autoclose = 8000;
            } else if (option.autoclose < 0) {
                option.autoclose = false;
            }
            // add class according option.theme to color the hint background
            jsP.content.addClass('jsPanel-hint-' + option.theme);
            // add close button to the hint
            if (option.theme === 'default' || option.theme === 'light') {
                jsP.content.append('<img class="jsPanel-hint-close" src="jspanel/images/close-20-333.png" alt="">');
            } else {
                jsP.content.append('<img class="jsPanel-hint-close" src="jspanel/images/close-20.png" alt="">');
            }
            // bind callback for close button
            $('.jsPanel-hint-close', jsP).on('click', jsP, function (event) {
                event.data.close();
            });
            // set option.position for hints using 'top left', 'top center' or 'top right'
            if (option.position.top === '0' && option.position.left === 'center') {
                // Schleife über alle hints in jsPanel.hintsTc, Höhen aufsummieren und als top für option.position verwenden
                if (jsPanel.hintsTc.length > 0) {
                    option.position = hintTop(jsPanel.hintsTc);
                }
                // populate array with hints
                jsPanel.hintsTc.push(jsP.attr('id'));
            } else if (option.position.top === '0' && option.position.left === '0') {
                if (jsPanel.hintsTl.length > 0) {
                    option.position = hintTop(jsPanel.hintsTl);
                }
                jsPanel.hintsTl.push(jsP.attr('id'));
            } else if (option.position.top === '0' && option.position.right === '0') {
                if (jsPanel.hintsTr.length > 0) {
                    option.position = hintTop(jsPanel.hintsTr);
                }
                jsPanel.hintsTr.push(jsP.attr('id'));
            }
        }

        /* option.selector - append jsPanel only to the first object in selector */
        if (option.paneltype.type !== 'tooltip') {
            jsP.appendTo(jsPparent);
        }
        if (option.paneltype.type === 'modal') {
            jsP.css('zIndex', '1100');
            if (option.paneltype.mode === 'extended') {
                $('.jsPanel-backdrop').css('z-index', '999');
            }
        } else {
            jsP.css('z-index', setZi());
        }

        /* option.bootstrap & option.theme */
        if (option.bootstrap) {
            // check whether a bootstrap compatible theme is used
            (function () {
                var arr = ["default", "primary", "info", "success", "warning", "danger"];
                if ($.inArray(option.bootstrap, arr) > -1) {
                    option.theme = option.bootstrap;
                } else {
                    option.theme = "default";
                }
            }());
            option.controls.iconfont = 'bootstrap';
            jsP.alterClass('jsPanel-theme-*', 'panel panel-' + option.theme);
            jsP.header.alterClass('jsPanel-theme-*', 'panel-heading');
            jsP.header.title.addClass('panel-title');
            jsP.content.alterClass('jsPanel-theme-*', 'panel-body');
            jsP.footer.addClass('panel-footer');
            // fix css problems for panels nested in other bootstrap panels
            jsP.header.title.css('color', function () {
                return jsP.header.css('color');
            });
            jsP.content.css('border-top-color', function () {
                return jsP.header.css('border-top-color');
            });
        } else {
            // activate normal non bootstrap themes
            jsP.alterClass('jsPanel-theme-*', 'jsPanel-theme-' + option.theme);
            jsP.header.alterClass('jsPanel-theme-*', 'jsPanel-theme-' + option.theme);
            jsP.content.alterClass('jsPanel-theme-*', 'jsPanel-theme-' + option.theme);
            jsP.footer.alterClass('jsPanel-theme-*', 'jsPanel-theme-' + option.theme);
        }

        /* option.title | default: function - (Überschrift) des Panels */
        jsP.header.title.prepend(option.title);

        /* option.removeHeader */
        if (option.removeHeader) {
            jsP.header.remove();
        }

        /* option.controls (buttons in header right) | default: object */
        if (!option.removeHeader) {
            if (option.controls.buttons === 'closeonly') {
                hideControls(".jsPanel-btn-min, .jsPanel-btn-norm, .jsPanel-btn-max, .jsPanel-btn-small, .jsPanel-btn-smallrev");
            } else if (option.controls.buttons === 'none') {
                $('*', jsP.header.controls).css('display', 'none');
            }
        }

        /* bootstrap iconfonts einfügen wenn option.iconfont gesetzt */
        if (option.controls.iconfont) {
            if (option.controls.iconfont === 'bootstrap') {
                $('.jsPanel-btn-close', jsP.header.controls).append('<span class="glyphicon glyphicon-remove"></span>');
                $('.jsPanel-btn-max', jsP.header.controls).append('<span class="glyphicon glyphicon-fullscreen"></span>');
                $('.jsPanel-btn-norm', jsP.header.controls).append('<span class="glyphicon glyphicon-resize-full"></span>');
                $('.jsPanel-btn-min', jsP.header.controls).append('<span class="glyphicon glyphicon-minus"></span>');
                $('.jsPanel-btn-small', jsP.header.controls).append('<span class="glyphicon glyphicon-chevron-up"></span>');
                $('.jsPanel-btn-smallrev', jsP.header.controls).append('<span class="glyphicon glyphicon-chevron-down"></span>');
            } else if (option.controls.iconfont === 'font-awesome') {
                $('.jsPanel-btn-close', jsP.header.controls).append('<i class="fa fa-times"></i>');
                $('.jsPanel-btn-max', jsP.header.controls).append('<i class="fa fa-arrows-alt"></i>');
                $('.jsPanel-btn-norm', jsP.header.controls).append('<i class="fa fa-expand"></i>');
                $('.jsPanel-btn-min', jsP.header.controls).append('<i class="fa fa-minus"></i>');
                $('.jsPanel-btn-small', jsP.header.controls).append('<i class="fa fa-chevron-up"></i>');
                $('.jsPanel-btn-smallrev', jsP.header.controls).append('<i class="fa fa-chevron-down"></i>');
            }
            // icon sprites entfernen
            $('*', jsP.header.controls).css('background-image', 'none');
        }

        /* option.toolbarHeader | default: false */
        if (option.toolbarHeader && option.removeHeader === false) {
            if (typeof option.toolbarHeader === 'string') {
                jsP.header.toolbar.append(option.toolbarHeader);
            } else if ($.isFunction(option.toolbarHeader)) {
                jsP.header.toolbar.append(option.toolbarHeader(jsP.header));
            } else if ($.isArray(option.toolbarHeader)) {
                configToolbar(option.toolbarHeader, jsP.header.toolbar);
            }
        }

        /* option.toolbarFooter | default: false */
        if (option.toolbarFooter) {
            jsP.footer.css({
                display: 'block',
                padding: '0 25px 0 5px'
            });
            if (typeof option.toolbarFooter === 'string') {
                jsP.footer.append(option.toolbarFooter);
            } else if ($.isFunction(option.toolbarFooter)) {
                jsP.footer.append(option.toolbarFooter(jsP.footer));
            } else if ($.isArray(option.toolbarFooter)) {
                configToolbar(option.toolbarFooter, jsP.footer);
            }
        }

        /* option.rtl | default: false */
        if (option.rtl.rtl === true) {
            (function () {
                var elmts = [ jsP.header.title, jsP.content, jsP.header.toolbar, jsP.footer ],
                    i,
                    max = elmts.length;
                for (i = 0; i < max; i += 1) {
                    elmts[i].prop('dir', 'rtl');
                    if (option.rtl.lang) {
                        elmts[i].prop('lang', option.rtl.lang);
                    }
                }
            }()); // IIFE only to prevent global variable
            jsP.header.title.css('text-align', 'right');
            $('.jsPanel-btn-close', jsP.header.controls).insertAfter($('.jsPanel-btn-min', jsP.header.controls));
            $('.jsPanel-btn-max', jsP.header.controls).insertAfter($('.jsPanel-btn-min', jsP.header.controls));
            $('.jsPanel-btn-small', jsP.header.controls).insertBefore($('.jsPanel-btn-min', jsP.header.controls));
            $('.jsPanel-btn-smallrev', jsP.header.controls).insertBefore($('.jsPanel-btn-min', jsP.header.controls));
            $('.jsPanel-hdr-r, .jsPanel-hint-close', jsP).css('float', 'left');
            $('.jsPanel-title', jsP).css('float', 'right');
            $('.jsPanel-ftr').append('<div style="clear:both;height:0;"></div>');
            $('button', jsP.footer).css('float', 'left');
        }

        /* option.overflow  | default: 'hidden' */
        if (typeof option.overflow === 'string') {
            jsP.content.css('overflow', option.overflow);
        } else if ($.isPlainObject(option.overflow)) {
            jsP.content.css({
                'overflow-y': option.overflow.vertical,
                'overflow-x': option.overflow.horizontal
            });
        }

        /* option.draggable */
        if ($.isPlainObject(option.draggable)) {
            // if jsPanel is childpanel
            if (jsP.parent().hasClass('jsPanel-content')) {
                option.draggable.containment = 'parent';
            }
            // merge draggable settings and apply
            option.customdraggable = $.extend(true, {}, $.jsPanel.defaults.draggable, option.draggable);
            jsP.draggable(option.customdraggable);
        } else if (option.draggable === 'disabled') {
            // reset cursor, draggable deactivated
            $('.jsPanel-title', jsP).css('cursor', 'inherit');
            // jquery ui draggable initialize disabled to allow to query status
            jsP.draggable({ disabled: true });
        }

        /* option.resizable */
        if ($.isPlainObject(option.resizable)) {
            option.customresizable = $.extend(true, {}, $.jsPanel.defaults.resizable, option.resizable);
            jsP.resizable(option.customresizable);
        } else if (option.resizable === 'disabled') {
            // jquery ui resizable initialize disabled to allow to query status
            jsP.resizable({ disabled: true });
            $('.ui-icon-gripsmall-diagonal-se', jsP).css('background-image', 'none');
        }

        /* option.content */
        // option.content can be any valid argument for jQuery.append()
        if (option.content) {
            jsP.content.append(option.content);
        }

        /* option.load */
        if ($.isPlainObject(option.load) && option.load.url) {
            if (!option.load.data) {
                option.load.data = undefined;
            }
            jsP.content.load(option.load.url, option.load.data, function (responseText, textStatus, XMLHttpRequest) {
                if (option.load.complete) {
                    option.load.complete(responseText, textStatus, XMLHttpRequest, jsP);
                }
                // fix for a bug in jQuery-UI draggable? that causes the jsPanel to reduce width when dragged beyond boundary of containing element and option.size.width is 'auto'
                jsP.content.css('width', function () {
                    return jsP.content.outerWidth() + 'px';
                });
            });
        }

        /* option.ajax */
        if ($.isPlainObject(option.ajax)) {
            $.ajax(option.ajax)
                .done(function (data, textStatus, jqXHR) {
                    jsP.content.empty().append(data);
                    if (option.ajax.done && $.isFunction(option.ajax.done)) {
                        option.ajax.done(data, textStatus, jqXHR, jsP);
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    if (option.ajax.fail && $.isFunction(option.ajax.fail)) {
                        option.ajax.fail(jqXHR, textStatus, errorThrown, jsP);
                    }
                })
                .always(function (arg1, textStatus, arg3) {
                    //In response to a successful request, the function's arguments are the same as those of .done(): data(hier: arg1), textStatus, and the jqXHR object(hier: arg3)
                    //For failed requests the arguments are the same as those of .fail(): the jqXHR object(hier: arg1), textStatus, and errorThrown(hier: arg3)
                    // fix for a bug in jQuery-UI draggable? that causes the jsPanel to reduce width when dragged beyond boundary of containing element and option.size.width is 'auto'
                    jsP.content.css('width', function () {
                        return jsP.content.outerWidth() + 'px';
                    });
                    if (option.ajax.always && $.isFunction(option.ajax.always)) {
                        option.ajax.always(arg1, textStatus, arg3, jsP);
                    }
                })
                .then(function (data, textStatus, jqXHR) {
                    if (option.ajax.then && $.isArray(option.ajax.then)) {
                        if (option.ajax.then[0] && $.isFunction(option.ajax.then[0])) {
                            option.ajax.then[0](data, textStatus, jqXHR, jsP);
                        }
                    }
                }, function (jqXHR, textStatus, errorThrown) {
                    if (option.ajax.then && $.isArray(option.ajax.then)) {
                        if (option.ajax.then[1] && $.isFunction(option.ajax.then[1])) {
                            option.ajax.then[1](jqXHR, textStatus, errorThrown, jsP);
                        }
                    }
                });
        }

        /* option.size */
        if (typeof option.size === 'string' && option.size === 'auto') {
            option.size = {
                width: 'auto',
                height: 'auto'
            };
        } else if ($.isPlainObject(option.size)) {
            if ($.isNumeric(option.size.width)) {
                option.size.width = option.size.width + 'px';
            } else if (typeof option.size.width === 'string') {
                if (option.size.width !== 'auto') {
                    option.size.width = $.jsPanel.defaults.size.width + 'px';
                }
            } else if ($.isFunction(option.size.width)) {
                option.size.width = parseInt(option.size.width(), 10) + 'px';
            }

            if ($.isNumeric(option.size.height)) {
                option.size.height = option.size.height + 'px';
            } else if (typeof option.size.height === 'string') {
                if (option.size.height !== 'auto') {
                    option.size.height = $.jsPanel.defaults.size.height + 'px';
                }
            } else if ($.isFunction(option.size.height)) {
                option.size.height = parseInt(option.size.height(), 10) + 'px';
            }
        }
        jsP.content.css({
            width: option.size.width,
            height: option.size.height
        });

        /* option.position */
        if (option.paneltype.type !== 'tooltip') {
            // when using option.size = 'auto' and option.position = 'center' consider use of option.ajax with
            // async: false -> size will be known when position is calculated
            // value "center" not allowed for option.position.bottom & option.position.right -> use top and/or left

            jsP.calcPanelposition = function (jsP, selector) {
                var panelpos = {};
                // get px values for panel size in case option.size is 'auto' - results will be incorrect whenever content
                // is not loaded yet ( e.g. option.load, option.ajax ) -> centering can't work correctly
                option.size.width = $(jsP).outerWidth();
                option.size.height = $(jsP).innerHeight();
                // delete op.top and/or left if option.position.bottom and/or right
                if (option.position.bottom) {
                    delete option.position.top;
                }
                if (option.position.right) {
                    delete option.position.left;
                }
                // calculate top | bottom values != center
                // if not checked for 0 as well code would not be executed!
                if (option.position.bottom || option.position.bottom === 0) {
                    delete option.position.top;
                    calcPos('bottom', selector);
                } else if (option.position.top || option.position.top === 0) {
                    if (option.position.top === 'center') {
                        option.position.top = posCenter(option.selector, option.size).top;
                    } else {
                        calcPos('top', selector);
                    }
                }
                // calculate left | right values != center
                if (option.position.right || option.position.right === 0) {
                    delete option.position.left;
                    calcPos('right', selector);
                } else if (option.position.left || option.position.left === 0) {
                    if (option.position.left === 'center') {
                        option.position.left = posCenter(option.selector, option.size).left;
                    } else {
                        calcPos('left', selector);
                    }
                }
                if (option.position.top) {
                    panelpos.top = parseInt(option.position.top, 10) + option.offset.top +'px';
                } else {
                    panelpos.bottom = parseInt(option.position.bottom, 10) + option.offset.top + 'px';
                }
                if (option.position.left) {
                    panelpos.left = parseInt(option.position.left, 10) + option.offset.left + 'px';
                } else {
                    panelpos.right = parseInt(option.position.right, 10) + option.offset.left + 'px';
                }

                jsP.css(panelpos);
                option.position = {
                    top: jsP.css('top'),
                    left: jsP.css('left')
                };
            };
            // finally calculate & position the jsPanel
            jsP.calcPanelposition(jsP, option.selector);
        }

        /* option.addClass */
        if (typeof option.addClass.header === 'string') {
            jsP.header.addClass(option.addClass.header);
        }
        if (typeof option.addClass.content === 'string') {
            jsP.content.addClass(option.addClass.content);
        }
        if (typeof option.addClass.footer === 'string') {
            jsP.footer.addClass(option.addClass.footer);
        }

        /*
         * handlers for the controls
         */
        // Handler um Panel in den Vordergrund zu holen
        jsP.on('click', function () {
            jsP.css('z-index', setZi());
        });
        // jsPanel close
        $('.jsPanel-btn-close', jsP).on('click', function (e) {
            e.preventDefault();
            jsP.close();
        });
        // jsPanel minimize
        $('.jsPanel-btn-min', jsP).on('click', function (e) {
            e.preventDefault();
            jsP.minimize();
        });
        // jsPanel maximize
        $('.jsPanel-btn-max', jsP).on('click', function (e) {
            e.preventDefault();
            jsP.maximize();
        });
        // jsPanel normalize
        $('.jsPanel-btn-norm', jsP).on('click', function (e) {
            e.preventDefault();
            jsP.normalize();
        });
        // jsPanel smallify
        $('.jsPanel-btn-small, .jsPanel-btn-smallrev', jsP).on('click', function (e) {
            e.preventDefault();
            jsP.smallify();
        });

        /*
         * methods
         */

        // restores a panel to its "normalized" (not minimized, maximized or smallified) position & size
        jsP.normalize = function () {
            var panelTop;
            // remove window.scroll handler, is added again later in this function
            $(window).off('scroll', jsP.jsPanelfixPos);
            // restore minimized panel to initial container
            restoreFromMinimized();
            // correction for panels maximized in body after page was scrolled
            if (jsPparentTagname === 'body') {
                panelTop = winscrollTop() + verticalOffset + 'px';
            } else {
                panelTop = option.position.top;
            }
            jsP.animate({
                width:  option.size.width,
                height: option.size.height,
                top:    panelTop,
                left:   option.position.left
            }, {
                done: function () {
                    // hier kein fadeIn() einbauen, funktioniert nicht mit fixPosition()
                    jsP.animate({opacity: 1}, {duration: 150});
                    hideControls(".jsPanel-btn-norm, .jsPanel-btn-smallrev");
                    jsP.resizable("enable").draggable("enable");
                    jsP.status = "normalized";
                    $(jsP).trigger('jspanelnormalized', jsP.attr('id'));
                    $(jsP).trigger('jspanelstatechange', jsP.attr('id'));
                    if (jsPparentTagname === 'body') {
                        fixPosition();
                    }
                }
            });
            return jsP;
        };

        jsP.close = function () {
            // get parent-element of jsPanel
            var context = jsP.parent(),
                panelID = jsP.attr('id'),
                panelcount = context.children('.jsPanel').length, // count of panels in context
                i,
                ind;
            // delete childpanels ...
            jsP.closeChildpanels();
            // if present remove tooltip wrapper
            if (context.hasClass('jsPanel-tooltip-wrapper')) {
                jsP.unwrap();
            }
            // remove the jsPanel itself
            jsP.remove();
            $('body').trigger('jspanelclosed', panelID);

            // remove backdrop only when modal jsPanel is closed
            if (option.paneltype.type === 'modal') {
                $('.jsPanel-backdrop').remove();
            }

            // reposition minimized panels
            for (i = 0; i < panelcount - 1; i += 1) {
                context.children('.minimized').eq(i).animate({
                    left: (i * widthMinimized) + 'px'
                });
            }
            // update arrays with hints
            if (option.paneltype.type === 'hint') {
                ind = jsPanel.hintsTc.indexOf(panelID);
                if (ind !== -1) {
                    jsPanel.hintsTc.splice(ind, 1);
                    // reposition hints
                    reposHints(jsPanel.hintsTc);
                }
                ind = jsPanel.hintsTl.indexOf(panelID);
                if (ind !== -1) {
                    jsPanel.hintsTl.splice(ind, 1);
                    reposHints(jsPanel.hintsTl);
                }
                ind = jsPanel.hintsTr.indexOf(panelID);
                if (ind !== -1) {
                    jsPanel.hintsTr.splice(ind, 1);
                    reposHints(jsPanel.hintsTr);
                }
            }
            return context;
        };

        jsP.closeChildpanels = function () {
            var pID;
            $('.jsPanel', this).each(function () {
                pID = $(this).attr('id');
                $('.jsPanel-btn-close', '#' + pID).trigger('click');
            });
            return jsP;
        };

        jsP.minimize = function () {
            // update panel size to have correct values when normalizing again
            if (jsP.status === "normalized") {
                option.size.width = jsP.outerWidth() + 'px';
                option.size.height = jsP.outerHeight() + 'px';
            }
            jsP.animate({
                opacity: 0
            }, {
                duration: 400, // fade out speed when minimizing
                complete: function () {
                    jsP.animate({
                        width: '150px',
                        height: '25px'
                    }, {
                        duration: 100,
                        complete: function () {
                            movetoMinified();
                            jsP.css('opacity', 1);
                        }
                    });
                }
            });
            return jsP;
        };

        jsP.maximize = function () {
            if (jsPparentTagname === 'body') {
                maxWithinBody();
            } else {
                maxWithinElement();
            }
            return jsP;
        };

        jsP.smallify = function () {
            if (jsP.status !== "smallified" && jsP.status !== "smallifiedMax") {
                var statusNew;
                if (jsP.status === "maximized") {
                    statusNew = "smallifiedMax";
                } else {
                    statusNew = "smallified";
                }
                // store panel height in function property
                jsP.smallify.height = jsP.outerHeight() + 'px';
                jsP.panelheaderheight = jsP.header.outerHeight() - 2;
                jsP.panelfooterheight = jsP.footer.outerHeight();
                jsP.panelcontentheight = jsP.content.outerHeight();
                jsP.content.css('min-width', jsP.content.outerWidth() + 'px');
                jsP.animate({
                    height: this.panelheaderheight + 'px'
                },
                    {
                        done: function () {
                            if (jsP.status === 'maximized') {
                                hideControls(".jsPanel-btn-max, .jsPanel-btn-small");
                            } else {
                                hideControls(".jsPanel-btn-norm, .jsPanel-btn-small");
                            }
                            jsP.status = statusNew;
                            $(jsP).trigger('jspanelsmallified', jsP.attr('id'));
                            $(jsP).trigger('jspanelstatechange', jsP.attr('id'));
                        }
                    });
            } else {
                jsP.animate({
                    height: jsP.smallify.height
                },
                    {
                        done: function () {
                            if (jsP.status === 'smallified') {
                                hideControls(".jsPanel-btn-norm, .jsPanel-btn-smallrev");
                                jsP.status = "normalized";
                                $(jsP).trigger('jspanelnormalized', jsP.attr('id'));
                                $(jsP).trigger('jspanelstatechange', jsP.attr('id'));
                            } else {
                                hideControls(".jsPanel-btn-max, .jsPanel-btn-smallrev");
                                jsP.status = "maximized";
                                $(jsP).trigger('jspanelmaximized', jsP.attr('id'));
                                $(jsP).trigger('jspanelstatechange', jsP.attr('id'));
                            }
                        }
                    });
            }
            return this;
        };

        // resizes the .jsPanel-content to match desired panel size
        jsP.resizeContent = function () {
            var hdrftr;
            if (jsP.footer.css('display') === 'none') {
                hdrftr = jsP.header.outerHeight() + 'px';
            } else {
                hdrftr = jsP.header.outerHeight() + jsP.footer.outerHeight() + 'px';
            }
            jsP.content.css({
                height: 'calc(100% - ' + hdrftr + ')',
                width: '100%'
            });
            return jsP;
        };

        jsP.front = function () {
            this.css('z-index', setZi());
            return jsP;
        };

        jsP.addToolbar = function (place, items) {
            if (place === 'header') {
                configToolbar(items, jsP.header.toolbar);
            } else if (place === 'footer') {
                jsP.footer.css({
                    display: 'block',
                    padding: '5px 25px 5px 5px'
                });
                configToolbar(items, jsP.footer);
            }
            return jsP;
        };

        jsP.title = function (text) {
            if (arguments.length === 0) {
                return jsP.header.title.html();
            }
            if (arguments.length === 1 && typeof text === 'string') {
                jsP.header.title.html(text);
                return jsP;
            }
            return jsP;
        };


        /* option.show */
        if (anim.indexOf(" ") === -1) {
            // wenn in anim kein Leerzeichen zu finden ist -> function anwenden
            jsP[anim]({
                done: function () {
                    jsP.status = "normalized";
                    // trigger custom event
                    $(jsP).trigger('jspanelloaded', jsP.attr('id'));
                    $(jsP).trigger('jspanelstatechange', jsP.attr('id'));
                    option.size = {
                        width: jsP.outerWidth() + 'px',
                        height: jsP.outerHeight() + 'px'
                    };
                }
            });
        } else {
            jsP.status = "normalized";
            // sonst wird es als css animation interpretiert und die class gesetzt
            // does not work with certain combinations of type of animation and positioning
            jsP.css({
                display: 'block',
                opacity: 1
            })
                .addClass(option.show)
                .trigger('jspanelloaded', jsP.attr('id'))
                .trigger('jspanelstatechange', jsP.attr('id'));
            option.size = {
                width: jsP.outerWidth() + 'px',
                height: jsP.outerHeight() + 'px'
            };
        }
        // needed if a maximized panel in body is normalized again
        // don't put this under $('body').on('jspanelloaded', function () { ... }
        verticalOffset = calcOffsetV();

        /* replace bottom/right values with corresponding top/left values if necessary */
        replaceCSSBottomRight(jsP);

        /* reposition hints while scrolling window, must be after normalization of position */
        if (option.paneltype.type === 'hint') {
            (function () {
                var dif = jsP.offset().top - winscrollTop();
                // with window.onscroll only the last added hint would stay in position
                $(window).scroll(function () {
                    jsP.css('top', winscrollTop() + dif + 'px');
                });
            }());
        }
        /* reposition jsPanel appended to body while scrolling window */
        if (jsPparentTagname === 'body' && (option.paneltype.type !== 'tooltip' || option.paneltype.type !== 'hint')) {
            fixPosition();
        }

        /* option.callback & option.autoclose started on 'jspanelloaded' and a jQuery-UI draggable bugfix */
        $('body').on('jspanelloaded', function () {
            var j,
                max;
            /* option.callback */
            if (option.callback && $.isFunction(option.callback)) {
                option.callback(jsP);
            } else if ($.isArray(option.callback)) {
                max = option.callback.length;
                for (j = 0; j < max; j += 1) {
                    if ($.isFunction(option.callback[j])) {
                        option.callback[j](jsP);
                    }
                }
            }
            /* option.autoclose | default: false */
            if (typeof option.autoclose === 'number' && option.autoclose > 0) {
                window.setTimeout(function () {
                    // function autoclose prüft erst ob es das el noch gibt
                    autoclose(jsP, jsP.attr('id'));
                }, option.autoclose);
            }
        });

        /* resizestart & resizestop & dragstop callbacks */
        // features activated for modals only for @genachka
        if (option.paneltype === false || option.paneltype.mode === 'extended') {
            // not needed for modals, hints and tooltips
            $(jsP).on("resizestart", function () {
                jsP.resizeContent();
                jsP.content.css('min-width', '');
            });
            $(jsP).on("resizestop", function () {
                option.size = {
                    width: jsP.outerWidth() + 'px',
                    height: jsP.outerHeight() + 'px'
                };
                $(jsP).trigger('jspanelnormalized', jsP.attr('id'));
                $(jsP).trigger('jspanelstatechange', jsP.attr('id'));
                jsP.status = "normalized";
            });
            $(jsP).on("dragstart", function () {
                // remove window.scroll handler, is added again on dragstop
                $(window).off('scroll', jsP.jsPanelfixPos);
                if (option.paneltype.mode === 'extended') {
                    jsP.css('z-index', '1100');
                }
            });
            $(jsP).on("dragstop", function () {
                option.position = {
                    top: jsP.css('top'),
                    left: jsP.css('left')
                };
                verticalOffset = calcOffsetV();
                if (jsPparentTagname === 'body') {
                    fixPosition();
                }
            });
        }
        return jsP;
    };

    /* jsPanel.defaults */
    $.jsPanel.defaults = {
        "addClass": {
            header: false,
            content: false,
            footer: false
        },
        "ajax": false,
        "autoclose": false,
        "bootstrap": false,
        "callback": undefined,
        "content": false,
        "controls": {
            buttons: true,
            iconfont: false
        },
        "draggable": {
            handle: 'div.jsPanel-hdr, div.jsPanel-ftr',
            stack: '.jsPanel',
            opacity: 0.7
        },
        "id": function () {
            jsPanel.ID += 1;
            return 'jsPanel-' + jsPanel.ID;
        },
        "load": false,
        "offset": {
            top: 0,
            left: 0
        },
        "paneltype": false,
        "overflow": 'hidden',
        "position": 'auto',
        "removeHeader": false,
        "resizable": {
            handles: 'e, s, w, se, sw',
            autoHide: false,
            minWidth: 150,
            minHeight: 93
        },
        "rtl": false,
        "selector": 'body',
        "show": 'fadeIn',
        "size": {
            width: 400,
            height: 222
        },
        "theme": 'default',
        "title": 'jsPanel',
        "toolbarFooter": false,
        "toolbarHeader": false
    };

    /*
     * jQuery alterClass plugin
     * Remove element classes with wildcard matching. Optionally add classes:
     * $( '#foo' ).alterClass( 'foo-* bar-*', 'foobar' )
     * Copyright (c) 2011 Pete Boere (the-echoplex.net)
     * Free under terms of the MIT license: http://www.opensource.org/licenses/mit-license.php
     */
    $.fn.alterClass = function (removals, additions) {
        var self = this,
            patt;
        if (removals.indexOf('*') === -1) {
            // Use native jQuery methods if there is no wildcard matching
            self.removeClass(removals);
            return !additions ? self : self.addClass(additions);
        }
        patt = new RegExp('\\s' +
            removals.replace(/\*/g, '[A-Za-z0-9-_]+').split(' ').join('\\s|\\s') +
            '\\s', 'g');

        self.each(function (i, it) {
            var cn = ' ' + it.className + ' ';
            while (patt.test(cn)) {
                cn = cn.replace(patt, ' ');
            }
            it.className = $.trim(cn);
        });
        return !additions ? self : self.addClass(additions);
    };

}(jQuery));
