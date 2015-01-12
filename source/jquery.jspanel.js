/* global console, MobileDetect */
/* jQuery Plugin jsPanel
 Version: 2.3.0 2015-01-12 09:10
 Dependencies:
     jQuery library ( > 1.7.0 incl. 2.1.1 )
     jQuery.UI library ( > 1.9.0 ) - (at least UI Core, Mouse, Widget, Draggable, Resizable)
     mobile-detect.js for the responsive features <https://github.com/hgoebl/mobile-detect.js>
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

/*
 ### changes in 2.3.0 ###
 + new method .resize(width, height) to resize an exsisting jsPanel by code
 + new jsPanel property "device" return NULL if device is not a mobile
 + new jsPanel.getMargins() to calculate panel margins either relative to browser viewport or panel.parent
 + functions to shift tooltips horizontally or vertically depending on position used
 + rewriteOPaneltype slightly adjusted
 + Tooltips: option.paneltype NEW property "shiftwithin" to set the element witin a tooltip is to be repositioned; default "body"
 + jsPanel function calcPosTooltipLeft und calcPosTooltipTop improved to consider possible margins of tooltrip trigger
*/

var jsPanel;

(function($){
    "use strict";
    jsPanel = {
        version: '2.3.0 2015-01-12 09:10',
        device: (function(){
            try {
                // requires "mobile-detect.js" to be loaded
                var md = new MobileDetect(window.navigator.userAgent),
                    mobile = md.mobile(),
                    phone = md.phone(),
                    tablet = md.tablet(),
                    os = md.os(),
                    userAgent = md.userAgent();
                return {mobile: mobile, tablet: tablet, phone: phone, os: os, userAgent: userAgent};
            } catch (e) {
                console.log(e + "; Seems like mobile-detect.js is not loaded");
                return false;
            }
        })(),
        ID: 0,                  // kind of a counter to add to automatically generated id attribute
        widthForMinimized: 150, // default width of minimized panels
        hintsTc: [],            // arrays that log hints for option.position 'top center', 'top left' and 'top right'
        hintsTl: [],
        hintsTr: [],

        template: '<div class="jsPanel jsPanel-theme-default">' +
                    '<div class="jsPanel-hdr jsPanel-theme-default">' +
                        '<h3 class="jsPanel-title"></h3>' +
                        '<div class="jsPanel-hdr-r">' +
                            '<div class="jsPanel-btn-close"><span class="jsglyph jsglyph-remove"></span></div>' +
                            '<div class="jsPanel-btn-max"><span class="jsglyph jsglyph-maximize"></span></div>' +
                            '<div class="jsPanel-btn-norm"><span class="jsglyph jsglyph-normalize"></span></div>' +
                            '<div class="jsPanel-btn-min"><span class="jsglyph jsglyph-minimize"></span></div>' +
                            '<div class="jsPanel-btn-small"><span class="jsglyph jsglyph-chevron-up"></span></div>' +
                            '<div class="jsPanel-btn-smallrev"><span class="jsglyph jsglyph-chevron-down"></span></div>' +
                        '</div>' +
                        '<div class="jsPanel-hdr-toolbar jsPanel-clearfix"></div>' +
                    '</div>' +
                    '<div class="jsPanel-content jsPanel-theme-default"></div>' +
                    '<div class="jsPanel-ftr jsPanel-theme-default jsPanel-clearfix"></div>' +
                  '</div>',

        // add toolbar
        addToolbar: function (panel, place, items) {

            if (place === 'header') {

                jsPanel.configToolbar(items, panel.header.toolbar, panel);

            } else if (place === 'footer') {

                panel.footer.css({
                    display: 'block',
                    padding: '5px 20px 5px 5px'
                });

                jsPanel.configToolbar(items, panel.footer, panel);

            }

            return panel;

        },

        // used in option.autoclose and checks prior use of .close() whether the panel is still there
        autoclose: function (panel, id, optionAutoclose) {

                window.setTimeout(function () {

                    var elmt = $('#' + id);

                        if (elmt.length > 0) {

                            elmt.fadeOut('slow', function () {

                                panel.close(); // elmt geht hier nicht weil .close() nicht für elmt definiert ist

                            });

                        }

                }, optionAutoclose);

        },

        calcPos: function (prop, option, count, panel) {

            if (option.position[prop] === 'auto') {

                option.position[prop] = count * 30 + 'px';

            } else if ($.isFunction(option.position[prop])) {

                option.position[prop] = option.position[prop](panel);

            } else if (option.position[prop] === 0) {

                option.position[prop] = '0';

            } else {

                option.position[prop] = parseInt(option.position[prop], 10) + 'px';

            }

            // corrections if jsPanel is appended to the body element
            if (option.selector === 'body') {

                if (prop === 'top') {

                    option.position.top = parseInt(option.position.top, 10) + jsPanel.winscrollTop() + 'px';

                }

                if (prop === 'bottom') {

                    option.position.bottom = parseInt(option.position.bottom, 10) - jsPanel.winscrollTop() + 'px';

                }

                if (prop === 'left') {

                    option.position.left = parseInt(option.position.left, 10) + jsPanel.winscrollLeft() + 'px';

                }

                if (prop === 'right') {

                    option.position.right = parseInt(option.position.right, 10) - jsPanel.winscrollLeft() + 'px';

                }
            }

            return option.position[prop];

        },

        // calculate position center for option.position == 'center'
        calcPosCenter: function (option) {

            var posL = ($(option.selector).outerWidth() / 2) - ((parseInt(option.size.width, 10) / 2)),
                posT;

            if (option.selector === 'body') {

                posT = ($(window).outerHeight() / 2) - ((parseInt(option.size.height, 10) / 2) - jsPanel.winscrollTop());

            } else {

                posT = ($(option.selector).outerHeight() / 2) - ((parseInt(option.size.height, 10) / 2));

            }

            return {top: posT + 'px', left: posL + 'px'};

        },

        // calculate position for maximized panels using option.controls.maxtoScreen (for devmondo)
        calcPosmaxtoScreen: function(panel) {

            var offset = panel.offset(),
                newPos = {
                    top: parseInt(panel.css('top')) - (offset.top - $(document).scrollTop()) + 5 + 'px',
                    left: parseInt(panel.css('left')) - (offset.left - $(document).scrollLeft()) + 5 + 'px'
                };

            return newPos;

        },

        // calculates css left for tooltips
        calcPosTooltipLeft: function (pos, jsPparent, option) {

            // width of element serving as trigger for the tooltip
            var parW = jsPparent.outerWidth(),
                // check possible margins of  trigger
                mL = parseInt(jsPparent.css('margin-left')),
                // check whether offset is set
                oX = option.offset.left || 0;

            if (pos === 'top' || pos === 'bottom') {

                return (parW - option.size.width) / 2 + mL + oX + 'px';

            }

            if (pos === 'left') {

                return -(option.size.width) + mL + oX + 'px';

            }

            if (pos === 'right') {

                return parW + mL + oX + 'px';

            }

            return false;

        },

        // calculates css top for tooltips
        calcPosTooltipTop: function (pos, jsPparent, option) {

            var parH = jsPparent.innerHeight(),
                mT = parseInt(jsPparent.css('margin-top')),
                oY = option.offset.top || 0;

            if (pos === 'left' || pos === 'right') {

                return -(option.size.height / 2) + (parH / 2) + mT + oY + 'px';

            }

            if (pos === 'top') {

                return -(option.size.height + oY) + mT + 'px';

            }

            if (pos === 'bottom') {

                return parH + mT + oY + 'px';

            }

            return false;

        },

        // calculate final tooltip position
        calcToooltipPosition: function(jsPparent, option) {

            if (option.paneltype.position === 'top') {

                option.position = {
                    top: jsPanel.calcPosTooltipTop('top', jsPparent, option),
                    left: jsPanel.calcPosTooltipLeft('top', jsPparent, option)
                };

            } else if (option.paneltype.position === 'bottom') {

                option.position = {
                    top: jsPanel.calcPosTooltipTop('bottom', jsPparent, option),
                    left: jsPanel.calcPosTooltipLeft('bottom', jsPparent, option)
                };

            } else if (option.paneltype.position === 'left') {

                option.position = {
                    top: jsPanel.calcPosTooltipTop('left', jsPparent, option),
                    left: jsPanel.calcPosTooltipLeft('left', jsPparent, option)
                };

            } else if (option.paneltype.position === 'right') {

                option.position = {
                    top: jsPanel.calcPosTooltipTop('right', jsPparent, option),
                    left: jsPanel.calcPosTooltipLeft('right', jsPparent, option)
                };

            }

            return option.position;

        },

        calcVerticalOffset: function (panel) {

            return panel.offset().top - jsPanel.winscrollTop();

        },

        // closes a jsPanel and removes it from the DOM
        close: function (panel, optionPaneltypeType, jsPparentTagname) {

            // get parent-element of jsPanel
            var context = panel.parent(),
                panelID = panel.attr('id'),
                ind;

            // delete childpanels ...
            jsPanel.closeChildpanels(panel);

            // if present remove tooltip wrapper
            if (context.hasClass('jsPanel-tooltip-wrapper')) {

                panel.unwrap();

            }

            // remove the jsPanel itself
            panel.remove();

            $('body').trigger('jspanelclosed', panelID);

            // remove backdrop only when modal jsPanel is closed
            if (optionPaneltypeType === 'modal') {

                $('.jsPanel-backdrop').remove();

            }
            // reposition minimized panels
            jsPanel.reposMinimized(jsPanel.widthForMinimized);

            // update arrays with hints
            if (optionPaneltypeType === 'hint') {

                ind = jsPanel.hintsTc.indexOf(panelID);

                if (ind !== -1) {

                    jsPanel.hintsTc.splice(ind, 1);
                    // reposition hints
                    jsPanel.reposHints(jsPanel.hintsTc, jsPparentTagname);

                }

                ind = jsPanel.hintsTl.indexOf(panelID);

                if (ind !== -1) {

                    jsPanel.hintsTl.splice(ind, 1);
                    jsPanel.reposHints(jsPanel.hintsTl, jsPparentTagname);

                }

                ind = jsPanel.hintsTr.indexOf(panelID);

                if (ind !== -1) {

                    jsPanel.hintsTr.splice(ind, 1);
                    jsPanel.reposHints(jsPanel.hintsTr, jsPparentTagname);

                }

            }

            return context;

        },

        // close all tooltips
        closeallTooltips: function () {

            var pID;

            $('.jsPanel-tt').each(function () {

                pID = $(this).attr('id');
                // if present remove tooltip wrapper and than remove tooltip
                $('#' + pID).unwrap().remove();
                $('body').trigger('jspanelclosed', pID);

            });

        },

        // closes/removes all childpanels within the parent jsPanel
        closeChildpanels: function (panel) {

            var pID;

            $('.jsPanel', panel).each(function () {

                pID = $(this).attr('id');
                $('#' + pID).remove();
                $('body').trigger('jspanelclosed', pID);

            });

            return panel;

        },

        // configure controls
        configControls: function(optionControls, panel) {

            if (optionControls.buttons === 'closeonly') {

                $(".jsPanel-btn-min, .jsPanel-btn-norm, .jsPanel-btn-max, .jsPanel-btn-small, .jsPanel-btn-smallrev", panel.header.controls).remove();
                panel.header.title.css("width", "calc(100% - 30px)");

            } else if (optionControls.buttons === 'none') {

                $('*', panel.header.controls).remove();
                panel.header.title.css("width", "100%");

            }
            // disable controls individually
            if (optionControls.close) {panel.control('disable', 'close');}
            if (optionControls.maximize) {panel.control('disable', 'maximize');}
            if (optionControls.minimize) {panel.control('disable', 'minimize');}
            if (optionControls.normalize) {panel.control('disable', 'normalize');}
            if (optionControls.smallify) {panel.control('disable', 'smallify');}

        },

        // configure iconfonts
        configIconfont: function(optionControlsIconfont, panel) {

            // remove icon sprites
            $('*', panel.header.controls).css('background-image', 'none');

            if (optionControlsIconfont === 'bootstrap') {

                $('.jsPanel-btn-close', panel.header.controls).empty().append('<span class="glyphicon glyphicon-remove"></span>');
                $('.jsPanel-btn-max', panel.header.controls).empty().append('<span class="glyphicon glyphicon-fullscreen"></span>');
                $('.jsPanel-btn-norm', panel.header.controls).empty().append('<span class="glyphicon glyphicon-resize-full"></span>');
                $('.jsPanel-btn-min', panel.header.controls).empty().append('<span class="glyphicon glyphicon-minus"></span>');
                $('.jsPanel-btn-small', panel.header.controls).empty().append('<span class="glyphicon glyphicon-chevron-up"></span>');
                $('.jsPanel-btn-smallrev', panel.header.controls).empty().append('<span class="glyphicon glyphicon-chevron-down"></span>');

            } else if (optionControlsIconfont === 'font-awesome') {

                $('.jsPanel-btn-close', panel.header.controls).empty().append('<i class="fa fa-times"></i>');
                $('.jsPanel-btn-max', panel.header.controls).empty().append('<i class="fa fa-arrows-alt"></i>');
                $('.jsPanel-btn-norm', panel.header.controls).empty().append('<i class="fa fa-expand"></i>');
                $('.jsPanel-btn-min', panel.header.controls).empty().append('<i class="fa fa-minus"></i>');
                $('.jsPanel-btn-small', panel.header.controls).empty().append('<i class="fa fa-chevron-up"></i>');
                $('.jsPanel-btn-smallrev', panel.header.controls).empty().append('<i class="fa fa-chevron-down"></i>');

            }

        },

        // builds toolbar
        configToolbar: function (toolbaritems, toolbarplace, panel) {

            var i,
                el,
                type,
                max = toolbaritems.length;

            for (i = 0; i < max; i += 1) {

                if (typeof toolbaritems[i] === 'object') {

                    el = $(toolbaritems[i].item);
                    type = el.prop('tagName').toLowerCase();

                    if (type === 'button') {

                        // set text of button
                        el.append(toolbaritems[i].btntext);

                        // add class to button
                        if (typeof toolbaritems[i].btnclass === 'string') {

                            el.addClass(toolbaritems[i].btnclass);

                        }

                    }

                    toolbarplace.append(el);

                    // bind handler to the item
                    if ($.isFunction(toolbaritems[i].callback)) {

                        el.on(toolbaritems[i].event, panel, toolbaritems[i].callback);
                        // jsP is accessible in the handler as "event.data"

                    }

                }

            }

        },

        // disable/enable individual controls
        control: function (panel, action, btn) {

            if (arguments.length === 3) {

                if (arguments[1] === 'disable') {

                    if (btn === 'close') {

                        btn = $('.jsPanel-btn-close', panel.header.controls);

                    }

                    if (btn === 'maximize') {

                        btn = $('.jsPanel-btn-max', panel.header.controls);

                    }

                    if (btn === 'minimize') {


                        btn = $('.jsPanel-btn-min', panel.header.controls);
                    }

                    if (btn === 'normalize') {

                        btn = $('.jsPanel-btn-norm', panel.header.controls);

                    }

                    if (btn === 'smallify') {

                        btn = $('.jsPanel-btn-small', panel.header.controls);

                    }

                    // unbind handler and set styles
                    btn.off().css({opacity:0.5, cursor: 'default'});

                } else if (arguments[1] === 'enable') {

                    var controlbtn;

                    if (btn === 'close') {

                        controlbtn = $('.jsPanel-btn-close', panel.header.controls);

                    }

                    if (btn === 'maximize') {

                        controlbtn = $('.jsPanel-btn-max', panel.header.controls);

                    }

                    if (btn === 'minimize') {

                        controlbtn = $('.jsPanel-btn-min', panel.header.controls);

                    }

                    if (btn === 'normalize') {

                        controlbtn = $('.jsPanel-btn-norm', panel.header.controls);

                    }

                    if (btn === 'smallify') {

                        controlbtn = $('.jsPanel-btn-small', panel.header.controls);

                    }

                    // enable control and reset styles
                    controlbtn.on('click', function (e) {

                        e.preventDefault();
                        panel[btn]();

                    }).css({opacity: 1, cursor: 'pointer'});
                }

            }

            return panel;

        },

        // helper function for the doubleclick handlers (title, content, footer)
        dblclickhelper: function (odcs, panel) {

            if (typeof odcs === 'string') {

                if (odcs === "maximize" || odcs === "normalize") {

                    if (panel.status !== "maximized") {

                        panel.maximize();

                    } else {

                        panel.normalize();

                    }

                } else if (odcs === "minimize" || odcs === "smallify" || odcs === "close") {

                    panel[odcs]();

                }

            }

        },

        docOuterHeight: function () {

            return $(document).outerHeight();

        },

        // maintains panel position relative to window on scroll of page
        fixPosition: function (panel) {

            var jspaneldiff = panel.offset().top - jsPanel.winscrollTop();

            panel.jsPanelfixPos = function () {

                panel.css('top', jsPanel.winscrollTop() + jspaneldiff + 'px');

            };

            $(window).on('scroll', panel.jsPanelfixPos);

        },

        // calculate panel margins
        getMargins: function(panel, selector) {

            var off, elmtOff, mR, mL, mB, mT;

            if(!selector || selector === "body") {

                // panel margins relative to browser viewport
                off = panel.offset();
                mR = jsPanel.winouterWidth() - off.left - panel.outerWidth() + jsPanel.winscrollLeft();
                mL = jsPanel.winouterWidth() - panel.outerWidth() - mR;
                mB = jsPanel.winouterHeight() - off.top - panel.outerHeight() + jsPanel.winscrollTop();
                mT = jsPanel.winouterHeight() - panel.outerHeight() - mB;

            } else {

                // panel margins relative to element matching selector "selector"
                elmtOff = $(selector).offset();
                off = panel.offset();
                mR = $(selector).outerWidth() - parseInt(panel.css('width')) - (off.left - elmtOff.left);
                mL = off.left - elmtOff.left;
                mB = $(selector).outerHeight() - (off.top - elmtOff.top) - parseInt(panel.css('height'));
                mT = off.top - elmtOff.top;

            }

            return {marginTop: parseInt(mT), marginRight: parseInt(mR), marginBottom: parseInt(mB), marginLeft: parseInt(mL)};

        },

        // calculate max horizontal and vertical tooltip shift
        getMaxpanelshift: function(panel) {

            var horiz = parseInt( panel.outerWidth()/2 ) + parseInt( panel.parent().outerWidth()/2 ) - 20,
                vert = parseInt( panel.outerHeight()/2 ) + parseInt( panel.parent().outerHeight()/2 ) - 20,
                cornerHoriz = parseInt( panel.outerWidth()/2 ) - 16,
                cornerVert = parseInt( panel.outerHeight()/2 ) - 16;

            return {maxshiftH: horiz, maxshiftV: vert, maxCornerH: cornerHoriz, maxCornerV: cornerVert};

        },

        // shift tooltip left/right if it overflows window
        // when using horizontal offsets of panel and/or corner result might be not as expected
        shiftTooltipHorizontal: function(panel, optionPaneltypeshiftwithin){

            var margins = jsPanel.getMargins(panel, optionPaneltypeshiftwithin),
                leftShiftRequired = 0,
                maxShift = jsPanel.getMaxpanelshift(panel),
                maxLeftShift = maxShift.maxshiftH,
                shift = 0,
                maxCornerLeft = maxShift.maxCornerH,
                cornerShift = 0,
                newPanelLeft = 0,
                newCornerLeft = 0;

            if (margins.marginLeft < 0 && margins.marginRight > 0) {
                // if panel overflows left window border
                leftShiftRequired = Math.abs(margins.marginLeft) + 5;
                shift = Math.min(leftShiftRequired, maxLeftShift);
                cornerShift = Math.min(maxCornerLeft, shift);
                newPanelLeft = parseInt(panel.css('left')) + shift + "px";
                newCornerLeft = parseInt($('.jsPanel-corner', panel).css('left')) - cornerShift + "px";

            } else if (margins.marginRight < 0 && margins.marginLeft > 0) {
                // if panel overflows right window border
                leftShiftRequired = Math.abs(margins.marginRight) + 5;
                shift = Math.min(leftShiftRequired, maxLeftShift);
                cornerShift = Math.min(maxCornerLeft, shift);
                newPanelLeft = parseInt(panel.css('left')) - shift + "px";
                newCornerLeft = parseInt($('.jsPanel-corner', panel).css('left')) + cornerShift + "px";

            }

            if ((margins.marginLeft < 0 && margins.marginRight > 0) || (margins.marginRight < 0 && margins.marginLeft > 0)) {
                // shift panel
                panel.animate({
                    "left": newPanelLeft
                },{ queue: false /* to have both animation run simultaneously */ });

                // shift corner if present
                if ($('.jsPanel-corner', panel)) {
                    $('.jsPanel-corner', panel).animate({
                        "left": newCornerLeft
                    },{ queue: false /* to have both animation run simultaneously */ });
                }
            }

        },

        // shift tooltip up/down if it overflows window
        // when using vertical offsets of panel and/or corner result might be not as expected
        shiftTooltipVertical: function(panel, optionPaneltypeshiftwithin){

            //console.log( parseInt($('*:first-child', panel.parent()).css('margin-left')) );

            var margins = jsPanel.getMargins(panel, optionPaneltypeshiftwithin),
                topShiftRequired = 0,
                maxShift = jsPanel.getMaxpanelshift(panel),
                maxTopShift = maxShift.maxshiftV,
                shift = 0,
                maxCornerTop = maxShift.maxCornerV,
                cornerShift = 0,
                newPanelTop = 0,
                newCornerTop = 0;

            if (margins.marginTop < 0 && margins.marginBottom > 0) {
                // if panel overflows top window border
                topShiftRequired = Math.abs(margins.marginTop) + 5;
                shift = Math.min(topShiftRequired, maxTopShift);
                cornerShift = Math.min(maxCornerTop, shift);
                newPanelTop = parseInt(panel.css('top')) + shift + "px";
                newCornerTop = parseInt($('.jsPanel-corner', panel).css('top')) - cornerShift + "px";

            } else if (margins.marginBottom < 0 && margins.marginTop > 0) {
                // if panel overflows bottom window border
                topShiftRequired = Math.abs(margins.marginBottom) + 5;
                shift = Math.min(topShiftRequired, maxTopShift);
                cornerShift = Math.min(maxCornerTop, shift);
                newPanelTop = parseInt(panel.css('top')) - shift + "px";
                newCornerTop = parseInt($('.jsPanel-corner', panel).css('top')) + cornerShift + "px";

            }

            if ((margins.marginTop < 0 && margins.marginBottom > 0) || (margins.marginBottom < 0 && margins.marginTop > 0)) {
                // shift panel
                panel.animate({
                    "top": newPanelTop
                },{ queue: false /* to have both animation run simultaneously */ });

                // shift corner if present
                if ($('.jsPanel-corner', panel)) {
                    $('.jsPanel-corner', panel).animate({
                        "top": newCornerTop
                    },{ queue: false /* to have both animation run simultaneously */ });
                }
            }

        },

        // get title text
        getTitle: function (panel) {

            return panel.header.title.html();

        },

        // hide controls specified by param "sel" of the jsPanel "panel"
        hideControls: function (sel, panel) {

            var controls = ".jsPanel-btn-close, .jsPanel-btn-norm, .jsPanel-btn-min, .jsPanel-btn-max, .jsPanel-btn-small, .jsPanel-btn-smallrev";

            $(controls, panel.header.controls).css('display', 'block');

            $(sel, panel.header.controls).css('display', 'none');

        },

        // calculates option.position for hints using 'top left', 'top center' or 'top right'
        hintTop: function (hintGroup) {

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

        },

        // append modal backdrop
        insertModalBackdrop: function () {

            var backdrop = '<div class="jsPanel-backdrop" style="height:' + jsPanel.docOuterHeight() + 'px;"></div>';

            $('body').append(backdrop);

        },

        // check whether a bootstrap compatible theme is used
        isBootstrapTheme: function(optionBootstrap) {

            var arr = ["default", "primary", "info", "success", "warning", "danger"];

            if ($.inArray(optionBootstrap, arr) > -1) {

                return optionBootstrap;

            } else {

                return "default";

            }

        },

        // check for positive integer
        isPosInt: function(arg) {

            var regex = /^\+?[1-9]\d*$/;

            if (arg.toString().match(regex) !== null) {

                return true;

            } else {

                return false;

            }
        },

        // maximizes a panel within the body element
        maxWithinBody: function (panel, option) {

            if (panel.status !== "maximized" && option.paneltype.mode !== 'default') {

                var newPos, newTop, newLeft;

                // remove window.scroll handler, is added again later in this function
                $(window).off('scroll', panel.jsPanelfixPos);

                // restore minimized panel to initial container
                jsPanel.restoreFromMinimized(panel, option);

                // test to enable fullscreen maximize for panels in a parent other than body
                if (option.controls.maxtoScreen === true) {

                    newPos = jsPanel.calcPosmaxtoScreen(panel);
                    newTop = newPos.top;
                    newLeft = newPos.left;

                } else {

                    newTop = jsPanel.winscrollTop() + 5 + 'px';
                    newLeft = jsPanel.winscrollLeft() + 5 + 'px';

                }
                panel.animate({

                    top: newTop,
                    left: newLeft,
                    width: jsPanel.winouterWidth() - 10 + 'px',
                    height: jsPanel.winouterHeight() - 10 + 'px'

                }, {
                    done: function () {

                        jsPanel.resizeContent(panel);
                        panel.animate({opacity: 1}, {duration: 150});

                        // hier kein fadeIn() einbauen, funktioniert nicht mit jsPanel.fixPosition(jsP)
                        jsPanel.hideControls(".jsPanel-btn-max, .jsPanel-btn-smallrev", panel);
                        panel.status = "maximized";
                        $(panel).trigger('jspanelmaximized', panel.attr('id'));
                        $(panel).trigger('jspanelstatechange', panel.attr('id'));

                        if (!option.controls.maxtoScreen || (option.controls.maxtoScreen && option.selector === 'body')) {

                            // test to enable fullscreen maximize for panels in a parent other than body
                            jsPanel.fixPosition(panel, option);

                        }

                        //jsPanel.fixPosition(panel);
                        jsPanel.resizeTitle(panel);

                    }
                });

            }

        },

        // maximizes a panel within an element other than body
        maxWithinElement: function (panel, option) {

            if (panel.status !== "maximized" && option.paneltype.mode !== 'default') {

                var width,
                    height;

                // restore minimized panel to initial container
                jsPanel.restoreFromMinimized(panel, option);

                width = parseInt(panel.parent().outerWidth(), 10) - 10 + 'px';
                height = parseInt(panel.parent().outerHeight(), 10) - 10 + 'px';

                panel.animate({

                    top: '5px',
                    left: '5px',
                    width: width,
                    height: height

                }, {
                    done: function () {

                        jsPanel.resizeContent(panel);
                        panel.animate({opacity: 1}, {duration: 150});
                        jsPanel.hideControls(".jsPanel-btn-max, .jsPanel-btn-smallrev", panel);
                        panel.status = "maximized";

                        $(panel).trigger('jspanelmaximized', panel.attr('id'));
                        $(panel).trigger('jspanelstatechange', panel.attr('id'));

                        jsPanel.resizeTitle(panel);

                    }

                });

            }

        },

        // calls functions to maximize a jsPanel
        maximize: function (panel, jsPparentTagname, option) {

            //  || option.controls.maxtoScreen === true - test to enable fullscreen maximize for panels in a parent other than body
            if (jsPparentTagname === 'body' || option.controls.maxtoScreen === true) {

                jsPanel.maxWithinBody(panel, option);

            } else {

                jsPanel.maxWithinElement(panel, option);

            }

            return panel;

        },

        // minimizes a jsPanel to the lower left corner of the browser viewport
        minimize: function (panel, optionSize) {

            // update panel size to have correct values when normalizing again
            if (panel.status === "normalized") {

                optionSize.width = panel.outerWidth() + 'px';
                optionSize.height = panel.outerHeight() + 'px';

            }
            panel.animate({

                opacity: 0

            }, {
                duration: 400, // fade out speed when minimizing
                complete: function () {

                    panel.animate({

                        width: '150px',
                        height: '28px'

                    }, {
                        duration: 100,
                        complete: function () {

                            jsPanel.movetoMinified(panel);
                            jsPanel.resizeTitle(panel);
                            panel.css('opacity', 1);

                        }
                    });

                }

            });

            return panel;

        },

        // moves a panel to the minimized container
        movetoMinified: function (panel) {

            var mincount = $('#jsPanel-min-container > .jsPanel').length;

            // wenn der Container für die minimierten jsPanels noch nicht existiert -> erstellen
            if ($('#jsPanel-min-container').length === 0) {

                $('body').append('<div id="jsPanel-min-container"></div>');

            }
            if (panel.status !== "minimized") {

                // jsPanel in vorgesehenen Container verschieben
                panel.css({

                    left: (mincount * jsPanel.widthForMinimized) + 'px',
                    top: 0,
                    opacity: 1

                })
                    .appendTo('#jsPanel-min-container')
                    .resizable({disabled: true})
                    .draggable({disabled: true});

                // buttons show or hide
                jsPanel.hideControls(".jsPanel-btn-min, .jsPanel-btn-small, .jsPanel-btn-smallrev", panel);

                $(panel).trigger('jspanelminimized', panel.attr('id'));
                $(panel).trigger('jspanelstatechange', panel.attr('id'));

                panel.status = "minimized";

                $(window).off('scroll', panel.jsPanelfixPos);

            }

        },

        // restores a panel to its "normalized" (not minimized, maximized or smallified) position & size
        normalize: function (panel, option, jsPparentTagname, verticalOffset) {

            var panelTop;

            // remove window.scroll handler, is added again later in this function
            $(window).off('scroll', panel.jsPanelfixPos);

            // restore minimized panel to initial container
            jsPanel.restoreFromMinimized(panel, option);

            // correction for panels maximized in body after page was scrolled
            if (jsPparentTagname === 'body') {

                panelTop = jsPanel.winscrollTop() + verticalOffset + 'px';

            } else {

                panelTop = option.position.top;

            }

            panel.animate({

                width: option.size.width,
                height: option.size.height,
                top: panelTop,
                left: option.position.left

            }, {
                done: function () {

                    // hier kein fadeIn() einbauen, funktioniert nicht mit jsPanel.fixPosition(jsP);
                    panel.animate({opacity: 1}, {duration: 150});

                    jsPanel.hideControls(".jsPanel-btn-norm, .jsPanel-btn-smallrev", panel);
                    jsPanel.resizeTitle(panel);

                    if (option.resizable !== 'disabled') {

                        panel.resizable("enable");

                    }

                    if (option.draggable !== 'disabled') {

                        panel.draggable("enable");

                    }

                    panel.status = "normalized";

                    $(panel).trigger('jspanelnormalized', panel.attr('id'));
                    $(panel).trigger('jspanelstatechange', panel.attr('id'));

                    if (jsPparentTagname === 'body') {

                        jsPanel.fixPosition(panel);

                    }

                    jsPanel.resizeContent(panel); // to get the scrollbars back

                }

            });

            return panel;

        },

        // replace bottom/right values with corresponding top/left values if necessary and update option.position
        replaceCSSBottomRight: function (panel, optionPosition) {

            var panelPosition = panel.position(),
                panelPosTop = parseInt(panelPosition.top, 10),
                panelPosLeft = parseInt(panelPosition.left, 10);

            if (panel.css('bottom')) {

                panel.css({

                    'top': parseInt(panelPosition.top, 10) + 'px',
                    'bottom': ''

                });

                optionPosition.top = panelPosTop;

            }
            if (panel.css('right')) {

                panel.css({

                    'left': parseInt(panelPosition.left, 10) + 'px',
                    'right': ''

                });

                optionPosition.left = panelPosLeft;

            }

        },

        // reposition hint upon closing
        reposHints: function (hintGroup, jsPtagname) {

            var hintH,
                el,
                i,
                max = hintGroup.length;

            if (jsPtagname === 'body') {

                hintH = jsPanel.winscrollTop();

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

        },

        // reposition hints on window scroll
        reposHintsScroll: function(panel) {

            var dif = panel.offset().top - jsPanel.winscrollTop();

            // with window.onscroll only the last added hint would stay in position
            $(window).scroll(function () {

                panel.css('top', jsPanel.winscrollTop() + dif + 'px');

            });

        },

        // repositions minimized jsPanels
        reposMinimized: function () {

            var minimized = $('#jsPanel-min-container > .jsPanel'),
                minimizedCount = minimized.length,
                i;

            for (i = 0; i < minimizedCount; i += 1) {

                minimized.eq(i).animate({

                    left: (i * jsPanel.widthForMinimized) + 'px'

                });

            }

        },

        // reset dimensions of content section after resize and so on
        resizeContent: function (panel) {

            var hdrftr,
                poh = panel.outerHeight();

            if (panel.footer.css('display') === 'none') {

                hdrftr = panel.header.outerHeight();

            } else {

                hdrftr = panel.header.outerHeight() + panel.footer.outerHeight();

            }

            panel.content.css({

                height: (poh - hdrftr) + 'px',
                width: '100%'

            });

            return panel;

        },

        // resize the title h3 to use full width minus controls width (and prevent being longer than panel)
        resizeTitle: function(panel) {

            var contWidth = $(panel.header.controls).outerWidth(),
                panelWidth = $(panel).outerWidth(),
                titleWidth = (panelWidth - contWidth - 15) + 'px';

            panel.header.title.css('width', titleWidth);

        },

        // restores minimized panels to their initial container, reenables resizable and draggable, repositions minimized panels
        restoreFromMinimized: function (panel, option) {

            // restore minimized panel to initial container
            if (panel.status === "minimized") {

                // hier kein fadeOut() einbauen, funktioniert nicht mit jsPanel.fixPosition(jsP)
                panel.animate({opacity: 0}, {duration: 50});
                panel.appendTo(option.selector);

            }

            if (option.resizable !== 'disabled') {

                panel.resizable("enable");

            }

            if (option.draggable !== 'disabled') {

                panel.draggable("enable");

            }

            // reposition minimized panels
            jsPanel.reposMinimized(jsPanel.widthForMinimized);

        },

        // rewrite option.paneltype strings to objects and set defaults for option.paneltype
        rewriteOPaneltype: function (optionPaneltype) {

            var op = optionPaneltype;

            if (op === 'modal') {

                return {type: 'modal', mode: 'default'};

            } else if (op === 'tooltip') {

                return {type: 'tooltip', position: 'top'};

            } else if (op === 'hint') {

                return {type: 'hint'};

            } else if (op.type === 'modal') {

                op.mode = op.mode || 'default';
                return {type: 'modal', mode: op.mode};

            } else if (op.type === 'tooltip') {

                op.mode = op.mode || false;
                op.position = op.position || false;
                op.shiftwithin = op.shiftwithin || "body";
                op.solo = op.solo || false;
                op.cornerBG = op.cornerBG || false;
                op.cornerOX = op.cornerOX || false;
                op.cornerOY = op.cornerOY || false;

                return {
                    type: 'tooltip',
                    mode: op.mode,
                    position: op.position,
                    shiftwithin: op.shiftwithin,
                    solo: op.solo,
                    cornerBG: op.cornerBG,
                    cornerOX: op.cornerOX,
                    cornerOY: op.cornerOY
                };

            } else {

                return {paneltype: false};

            }

        },

        // converts option.position string to object
        rewriteOPosition: function (optionPosition) {

            var op = optionPosition;

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

                return {bottom: '0', right: '0'};

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

            return optionPosition;

        },

        // set default options for hints and add necessary classes
        setHintDefaults: function(option, panel) {

            option.resizable = false;
            option.draggable = false;
            option.removeHeader = true;
            option.toolbarFooter = false;
            option.show = 'fadeIn';

            panel.addClass('jsPanel-hint');
            panel.content.addClass('jsPanel-hint-content');

            // autoclose default 8 sec | or -1 to deactivate
            if (!option.autoclose) {

                option.autoclose = 8000;

            } else if (option.autoclose < 0) {

                option.autoclose = false;

            }
            // add class according option.theme to color the hint background
            panel.content.addClass('jsPanel-hint-' + option.theme);

            // add class according option.theme to color the hint background
            if (option.theme === 'default' || option.theme === 'light') {

                panel.content.append('<div class="jsPanel-hint-close-dark"></div>');

            } else {

                panel.content.append('<div class="jsPanel-hint-close-white"></div>');

            }

        },

        // set default options for standard modal
        setModalDefaults: function (option, panel) {

            option.selector = 'body';
            option.show = 'fadeIn';

            if (option.paneltype.mode === 'default') {

                option.resizable = false;
                option.draggable = false;
                option.removeHeader = false;
                option.position = {top: 'center', left: 'center'};
                option.offset = {top: 0, left: 0};
                option.controls.buttons = 'closeonly'; //do not delete else "modal" with no close button possible

                $(".jsPanel-btn-min, .jsPanel-btn-norm, .jsPanel-btn-max, .jsPanel-btn-small, .jsPanel-btn-smallrev", panel).remove();
                $(panel.header, panel.header.title, panel.footer).css('cursor', 'default');
                $('.jsPanel-title', panel).css('cursor', 'inherit');

            }

        },

        // set panel id
        setPanelId: function (panel, optionID) {

            if (typeof optionID === 'string') {

                // id doesn't exist yet -> use it
                if ($('#' + optionID).length < 1) {

                    panel.attr('id', optionID);

                } else {

                    jsPanel.ID += 1;
                    panel.attr('id', 'jsPanel-' + jsPanel.ID);

                    // write new id as notification in title
                    $('.jsPanel-title', panel).html($('.jsPanel-title', panel).text() + ' AUTO-ID: ' + panel.attr('id'));

                }

            } else if ($.isFunction(optionID)) {

                panel.attr('id', optionID);

            }

        },

        // set right-to-left text direction and language; set styles and reoorder controls for rtl
        setRTL: function(panel, optionRtlLang) {

            var elmts = [ panel.header.title, panel.content, panel.header.toolbar, panel.footer ],
                i,
                max = elmts.length;

            for (i = 0; i < max; i += 1) {

                elmts[i].prop('dir', 'rtl');

                if (optionRtlLang) {

                    elmts[i].prop('lang', optionRtlLang);

                }

            }

            panel.header.title.css('text-align', 'right');
            $('.jsPanel-btn-close', panel.header.controls).insertAfter($('.jsPanel-btn-min', panel.header.controls));
            $('.jsPanel-btn-max', panel.header.controls).insertAfter($('.jsPanel-btn-min', panel.header.controls));
            $('.jsPanel-btn-small', panel.header.controls).insertBefore($('.jsPanel-btn-min', panel.header.controls));
            $('.jsPanel-btn-smallrev', panel.header.controls).insertBefore($('.jsPanel-btn-min', panel.header.controls));
            $('.jsPanel-hdr-r', panel).css({left: '0px', right: '', position: 'relative', 'float': 'left'});
            $('.jsPanel-hint-close-dark, .jsPanel-hint-close-white', panel).css('float', 'left');
            $('.jsPanel-title', panel).css('float', 'right');
            $('.jsPanel-ftr', panel).append('<div style="clear:both;height:0;"></div>');
            $('button', panel.footer).css('float', 'left');

        },

        // set title text
        setTitle: function (panel, text) {

            if (text && typeof text === "string") {

                panel.header.title.html(text);

                return panel;

            }

            return panel;

        },

        // set default options for tooltips
        setTooltipDefaults: function(option) {

            option.position = {};
            option.resizable = false;
            option.draggable = false;
            option.show = 'fadeIn';
            option.controls.buttons = 'closeonly';

        },

        setZi: function () {

            var zi = 100;

            $('.jsPanel').each(function () {

                if ($(this).zIndex() > zi) {

                    zi += $(this).zIndex();

                }

            });

            return zi + 1;

        },

        // toggles jsPanel height between header height and normalized/maximized height
        smallify: function (panel) {

            if (panel.status !== "smallified" && panel.status !== "smallifiedMax") {

                var statusNew;

                if (panel.status === "maximized") {

                    statusNew = "smallifiedMax";

                } else {

                    statusNew = "smallified";

                }

                // store panel height in function property
                panel.smallify.height = panel.outerHeight() + 'px';
                panel.panelheaderheight = panel.header.outerHeight() - 2;
                panel.panelfooterheight = panel.footer.outerHeight();
                panel.panelcontentheight = panel.content.outerHeight();
                panel.animate({

                        height: panel.panelheaderheight + 'px'

                    },
                    {
                        done: function () {

                            if (panel.status === 'maximized') {

                                jsPanel.hideControls(".jsPanel-btn-max, .jsPanel-btn-small", panel);

                            } else {

                                jsPanel.hideControls(".jsPanel-btn-norm, .jsPanel-btn-small", panel);

                            }

                            panel.status = statusNew;

                            $(panel).trigger('jspanelsmallified', panel.attr('id'));
                            $(panel).trigger('jspanelstatechange', panel.attr('id'));

                        }

                    });

            } else {
                panel.animate({

                        height: panel.smallify.height

                    },
                    {
                        done: function () {

                            if (panel.status === 'smallified') {

                                jsPanel.hideControls(".jsPanel-btn-norm, .jsPanel-btn-smallrev", panel);
                                panel.status = "normalized";
                                $(panel).trigger('jspanelnormalized', panel.attr('id'));
                                $(panel).trigger('jspanelstatechange', panel.attr('id'));

                            } else {

                                jsPanel.hideControls(".jsPanel-btn-max, .jsPanel-btn-smallrev", panel);
                                panel.status = "maximized";
                                $(panel).trigger('jspanelmaximized', panel.attr('id'));
                                $(panel).trigger('jspanelstatechange', panel.attr('id'));

                            }

                        }

                    }

                );

            }

            return panel;

        },

        // updates option.position to hold actual values
        updateOptionPosition: function(panel, optionPosition) {

            optionPosition.top = panel.css('top');
            optionPosition.left = panel.css('left');

        },

        // updates option.size to hold actual values
        updateOptionSize: function(panel, optionSize) {

            optionSize.width = panel.css('width');
            optionSize.height = panel.css('height');

        },

        winouterHeight: function () {

            return $(window).outerHeight();

        },

        winouterWidth: function () {

            return $(window).outerWidth();

        },

        winscrollLeft: function () {

            return $(window).scrollLeft();

        },

        winscrollTop: function () {

            return $(window).scrollTop();

        }

    };

}(jQuery));

(function ($) {
    "use strict";

    $.jsPanel = function (config) {

        var jsP = $(jsPanel.template),
            // Extend our default config with those provided.
            // Note that the first arg to extend is an empty object - this is to keep from overriding our "defaults" object.
            option = $.extend(true, {}, $.jsPanel.defaults, config),
            anim = option.show,
            verticalOffset = 0,
            jsPparent,
            jsPparentTagname,
            count;

        try {

            jsPparent = $(option.selector).first();
            jsPparentTagname = jsPparent[0].tagName.toLowerCase();
            count = jsPparent.children('.jsPanel').length;

        } catch (e) {

            console.log(e);
            console.log('The element you want to append the jsPanel to does not exist!');
            option.selector = 'body';
            jsPparent = $('body');
            jsPparentTagname = 'body';
            count = jsPparent.children('.jsPanel').length;

        }

        jsP.status = "initialized";

        jsP.header = $('.jsPanel-hdr', jsP);

        jsP.header.title = $('.jsPanel-title', jsP.header);

        jsP.header.controls = $('.jsPanel-hdr-r', jsP.header);

        jsP.header.toolbar = $('.jsPanel-hdr-toolbar', jsP.header);

        jsP.content = $('.jsPanel-content', jsP);

        jsP.footer = $('.jsPanel-ftr', jsP);

        jsP.normalize = function() {

            jsPanel.normalize(jsP, option, jsPparentTagname, verticalOffset);
            return jsP;

        };

        jsP.close = function () {

            jsPanel.close(jsP, option.paneltype.type, jsPparentTagname);
            // no need to return something

        };

        jsP.closeChildpanels = function () {

            jsPanel.closeChildpanels(jsP);
            return jsP;

        };

        jsP.minimize = function () {

            jsPanel.minimize(jsP, option.size);
            return jsP;

        };

        jsP.maximize = function () {

            jsPanel.maximize(jsP, jsPparentTagname, option);
            return jsP;

        };

        jsP.smallify = function () {

            jsPanel.smallify(jsP);
            return jsP;

        };

        jsP.front = function () {

            jsP.css('z-index', jsPanel.setZi());
            return jsP;

        };

        jsP.title = function (text) {

            if (text && typeof text === "string") {

                jsPanel.setTitle(jsP, text);
                return jsP;

            } else if (arguments.length === 0) {

                return jsPanel.getTitle(jsP);

            }

        };

        jsP.addToolbar = function (place, items) {

            jsPanel.addToolbar(jsP, place, items);
            return jsP;

        };
        
        jsP.control = function (action, btn) {

            jsPanel.control(jsP, action, btn);
            return jsP;

        };

        jsP.resize = function (width, height) {
            // method resizes the full panel (not content section only)

            if(width && width !== null) {
                jsP.css("width", width);
            } else {
                jsP.css("width", jsP.content.css("width"));
            }
            if(height && height !== null) {
                jsP.css("height", height);
            }
            jsPanel.resizeContent(jsP);
            jsPanel.resizeTitle(jsP);
            return jsP;

        };

        /*
         * handlers for the controls -----------------------------------------------------------------------------------
         */
        // handler to move panel to foreground on
        jsP.on('click', function () {

            jsP.css('z-index', jsPanel.setZi());

        });

        // jsPanel close
        $('.jsPanel-btn-close', jsP).on('click', function (e) {

            e.preventDefault();
            jsPanel.close(jsP, option.paneltype.type, jsPparentTagname);

        });

        // jsPanel minimize
        $('.jsPanel-btn-min', jsP).on('click', function (e) {

            e.preventDefault();
            jsPanel.minimize(jsP, option.size);

        });

        // jsPanel maximize
        $('.jsPanel-btn-max', jsP).on('click', function (e) {

            e.preventDefault();
            jsPanel.maximize(jsP, jsPparentTagname, option);

        });

        // jsPanel normalize
        $('.jsPanel-btn-norm', jsP).on('click', function (e) {

            e.preventDefault();
            jsPanel.normalize(jsP, option, jsPparentTagname, verticalOffset);

        });

        // jsPanel smallify
        $('.jsPanel-btn-small, .jsPanel-btn-smallrev', jsP).on('click', function (e) {

            e.preventDefault();
            jsPanel.smallify(jsP);

        });

        // rewrite option.paneltype strings to objects and set defaults for option.paneltype
        option.paneltype = jsPanel.rewriteOPaneltype(option.paneltype);

        // converts option.position string to object
        option.position = jsPanel.rewriteOPosition(option.position);

        /* option.id ------------------------------------------------------------------------------------------------ */
        // wenn option.id -> string oder function?
        jsPanel.setPanelId(jsP, option.id);

        /* option.paneltype - override or set various settings depending on option.paneltype ------------------------ */
        if (option.paneltype.type === 'modal') {

            // set defaults for standard modal
            jsPanel.setModalDefaults(option, jsP);

            // insert backdrop
            if ($('.jsPanel-backdrop').length < 1) {

                jsPanel.insertModalBackdrop();

            }

        } else if (option.paneltype.type === 'tooltip') {

            jsPanel.setTooltipDefaults(option);

            // optionally remove all other tooltips
            if (option.paneltype.solo) {

                jsPanel.closeallTooltips();

            }

            // calc top & left for the various tooltip positions
            option.position = jsPanel.calcToooltipPosition(jsPparent, option);

            // position the tooltip & add tooltip class
            jsP.css({
                top: option.position.top,
                left: option.position.left
            }).addClass('jsPanel-tt');

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
                            jsPanel.close(jsP, option.paneltype.type, jsPparentTagname);
                        }
                    );

                } else if (option.paneltype.mode === 'sticky') {

                    $.noop();

                } else {

                    option.controls.buttons = 'none';

                    // tooltip will be removed whenever mouse leaves trigger
                    jsPparent.off('mouseout'); // to prevent mouseout from firing several times
                    jsPparent.mouseout(function () {

                        jsPanel.close(jsP, option.paneltype.type, jsPparentTagname);

                    });

                }
            }

            // corners
            jsP.css('overflow', 'visible');

            if (option.paneltype.cornerBG) {

                var corner = $("<div></div>"),
                    cornerLoc = "jsPanel-corner-" + option.paneltype.position,
                    cornerPos,
                    cornerOX = parseInt(option.paneltype.cornerOX) || 0,
                    cornerOY = parseInt(option.paneltype.cornerOY) || 0,
                    cornerBG = option.paneltype.cornerBG;

                if (option.paneltype.position !== "bottom") {

                    corner.addClass("jsPanel-corner " + cornerLoc).appendTo(jsP);

                } else {

                    corner.addClass("jsPanel-corner " + cornerLoc).prependTo(jsP);

                }

                if (option.paneltype.position === "top") {

                    cornerPos = parseInt(option.size.width)/2 - 12 + (cornerOX) + "px";
                    corner.css({borderTopColor: cornerBG, left: cornerPos});

                } else if (option.paneltype.position === "right") {

                    cornerPos = parseInt(option.size.height)/2 - 12 + (cornerOY) + "px";
                    corner.css({borderRightColor: cornerBG, left: "-22px", top: cornerPos});

                } else if (option.paneltype.position === "bottom") {

                    cornerPos = parseInt(option.size.width)/2 - 12 + (cornerOX) + "px";
                    corner.css({borderBottomColor: cornerBG, left: cornerPos, top: "-22px"});

                } else if (option.paneltype.position === "left") {

                    cornerPos = parseInt(option.size.height)/2 - 12 + (cornerOY) + "px";
                    corner.css({borderLeftColor: cornerBG, left: option.size.width, top: cornerPos});

                }

            }
        } else if (option.paneltype.type === 'hint') {

            jsPanel.setHintDefaults(option, jsP);

            // bind callback for close button
            $('.jsPanel-hint-close-dark, .jsPanel-hint-close-white', jsP).on('click', jsP, function (event) {

                event.data.close(jsP, option.paneltype.type, jsPparentTagname);

            });

            // set option.position for hints using 'top left', 'top center' or 'top right'
            if (option.position.top === '0' && option.position.left === 'center') {
                // Schleife über alle hints in jsPanel.hintsTc, Höhen aufsummieren und als top für option.position verwenden
                if (jsPanel.hintsTc.length > 0) {

                    option.position = jsPanel.hintTop(jsPanel.hintsTc);

                }
                // populate array with hints
                jsPanel.hintsTc.push(jsP.attr('id'));

            } else if (option.position.top === '0' && option.position.left === '0') {

                if (jsPanel.hintsTl.length > 0) {

                    option.position = jsPanel.hintTop(jsPanel.hintsTl);

                }
                jsPanel.hintsTl.push(jsP.attr('id'));

            } else if (option.position.top === '0' && option.position.right === '0') {

                if (jsPanel.hintsTr.length > 0) {

                    option.position = jsPanel.hintTop(jsPanel.hintsTr);

                }
                jsPanel.hintsTr.push(jsP.attr('id'));

            }
        }

        /* option.selector - append jsPanel only to the first object in selector ------------------------------------ */
        if (option.paneltype.type !== 'tooltip') {

            jsP.appendTo(jsPparent);

        }
        if (option.paneltype.type === 'modal') {

            jsP.css('zIndex', '1100');

            if (option.paneltype.mode === 'extended') {

                $('.jsPanel-backdrop').css('z-index', '999');

            }

        } else {

            jsP.css('z-index', jsPanel.setZi());

        }

        /* option.bootstrap & option.theme -------------------------------------------------------------------------- */
        if (option.bootstrap) {

            // check whether a bootstrap compatible theme is used and set option.theme accordingly
            option.theme = jsPanel.isBootstrapTheme(option.bootstrap);
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

        /* option.removeHeader -------------------------------------------------------------------------------------- */
        if (option.removeHeader) {

            jsP.header.remove();

        }

        /* option.controls (buttons in header right) | default: object ---------------------------------------------- */
        if (!option.removeHeader) {

            jsPanel.configControls(option.controls, jsP);

        }

        /* insert iconfonts if option.iconfont set (default is "jsglyph") */
        if (option.controls.iconfont) {

            jsPanel.configIconfont(option.controls.iconfont, jsP);

        }

        // if option.controls.iconfont === false restore old icon sprite
        if (!option.controls.iconfont) {

            $('.jsPanel-btn-close, .jsPanel-btn-max, .jsPanel-btn-norm, .jsPanel-btn-min, .jsPanel-btn-small, .jsPanel-btn-smallrev', jsP.header.controls).empty();

        }

        /* option.toolbarHeader | default: false -------------------------------------------------------------------- */
        if (option.toolbarHeader && option.removeHeader === false) {

            if (typeof option.toolbarHeader === 'string') {

                jsP.header.toolbar.append(option.toolbarHeader);

            } else if ($.isFunction(option.toolbarHeader)) {

                jsP.header.toolbar.append(option.toolbarHeader(jsP.header));

            } else if ($.isArray(option.toolbarHeader)) {

                jsPanel.configToolbar(option.toolbarHeader, jsP.header.toolbar, jsP);

            }
        }

        /* option.toolbarFooter | default: false -------------------------------------------------------------------- */
        if (option.toolbarFooter) {

            jsP.footer.css({

                display: 'block',
                padding: '0 20px 0 5px'

            });

            if (typeof option.toolbarFooter === 'string') {

                jsP.footer.append(option.toolbarFooter);

            } else if ($.isFunction(option.toolbarFooter)) {

                jsP.footer.append(option.toolbarFooter(jsP.footer));

            } else if ($.isArray(option.toolbarFooter)) {

                jsPanel.configToolbar(option.toolbarFooter, jsP.footer, jsP);

            }
        }

        /* option.rtl | default: false ------------------------------------------------------------------------------ */
        if (option.rtl.rtl === true) {

            jsPanel.setRTL(jsP, option.rtl.lang);

        }

        /* option.overflow  | default: 'hidden' --------------------------------------------------------------------- */
        if (typeof option.overflow === 'string') {

            jsP.content.css('overflow', option.overflow);

        } else if ($.isPlainObject(option.overflow)) {

            jsP.content.css({

                'overflow-y': option.overflow.vertical,
                'overflow-x': option.overflow.horizontal

            });

        }

        /* option.draggable ----------------------------------------------------------------------------------------- */
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

        /* option.resizable ----------------------------------------------------------------------------------------- */
        if ($.isPlainObject(option.resizable)) {

            option.customresizable = $.extend(true, {}, $.jsPanel.defaults.resizable, option.resizable);
            jsP.resizable(option.customresizable);

        } else if (option.resizable === 'disabled') {

            // jquery ui resizable initialize disabled to allow to query status
            jsP.resizable({ disabled: true });
            $('.ui-icon-gripsmall-diagonal-se', jsP).css('background-image', 'none');

        }

        /* option.content ------------------------------------------------------------------------------------------- */
        // option.content can be any valid argument for jQuery.append()
        if (option.content) {

            jsP.content.append(option.content);


        }

        /* option.load ---------------------------------------------------------------------------------------------- */
        if ($.isPlainObject(option.load) && option.load.url) {

            if (!option.load.data) {

                option.load.data = undefined;

            }

            jsP.content.load(option.load.url, option.load.data, function (responseText, textStatus, jqXHR) {

                if (option.load.complete) {
                    option.load.complete(responseText, textStatus, jqXHR, jsP);
                }

                // title h3 might be to small: load() is async!
                jsPanel.resizeTitle(jsP);

                // update option.size (content might come delayed)
                jsPanel.updateOptionSize(jsP, option.size);

                // fix for a bug in jQuery-UI draggable? that causes the jsPanel to reduce width when dragged beyond boundary of containing element and option.size.width is 'auto'
                jsP.content.css('width', function () {

                    return jsP.content.outerWidth() + 'px';

                });

            });

        }

        /* option.ajax ---------------------------------------------------------------------------------------------- */
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

                    // title h3 might be to small: load() is async!
                    jsPanel.resizeTitle(jsP);

                    // update option.size (content might come delayed)
                    jsPanel.updateOptionSize(jsP, option.size);

                })

                .then(function (data, textStatus, jqXHR) {

                    if (option.ajax.then && $.isArray(option.ajax.then)) {

                        if (option.ajax.then[0] && $.isFunction(option.ajax.then[0])) {

                            option.ajax.then[0](data, textStatus, jqXHR, jsP);

                        }

                        // title h3 might be to small: load() is async!
                        jsPanel.resizeTitle(jsP);

                        // update option.size (content might come delayed)
                        jsPanel.updateOptionSize(jsP, option.size);

                    }
                }, function (jqXHR, textStatus, errorThrown) {

                    if (option.ajax.then && $.isArray(option.ajax.then)) {

                        if (option.ajax.then[1] && $.isFunction(option.ajax.then[1])) {

                            option.ajax.then[1](jqXHR, textStatus, errorThrown, jsP);

                        }

                        // title h3 might be to small: load() is async!
                        jsPanel.resizeTitle(jsP);

                    }

                }

            );

        }

        /* option.size ---------------------------------------------------------------------------------------------- */
        if (typeof option.size === 'string' && option.size === 'auto') {

            option.size = {

                width: 'auto',
                height: 'auto'

            };

        } else if ($.isPlainObject(option.size)) {

            if (!jsPanel.isPosInt(option.size.width)) {

                if (typeof option.size.width === 'string' && option.size.width !== 'auto') {

                    option.size.width = parseInt(option.size.width, 10);

                    if (option.size.width < 1 || !$.isNumeric(option.size.width)) {

                        option.size.width = $.jsPanel.defaults.size.width;

                    }

                } else if ($.isFunction(option.size.width)) {

                    option.size.width = parseInt(option.size.width(), 10);

                } else if (option.size.width !== 'auto') {

                    option.size.width = $.jsPanel.defaults.size.width;

                }

            }

            if (!jsPanel.isPosInt(option.size.height)) {

                if (typeof option.size.height === 'string' && option.size.height !== 'auto') {

                    option.size.height = parseInt(option.size.height, 10);

                    if (option.size.height < 1 || !$.isNumeric(option.size.height)) {

                        option.size.height = $.jsPanel.defaults.size.height;

                    }

                } else if ($.isFunction(option.size.height)) {

                    option.size.height = parseInt(option.size.height(), 10);

                } else if (option.size.height !== 'auto') {

                    option.size.height = $.jsPanel.defaults.size.height;

                }

            }

        }

        jsP.content.css({

            width: option.size.width + 'px',
            height: option.size.height + 'px'

        });

        // Important! limit title width; final adjustment follows later; otherwise title might be longer than panel width
        jsP.header.title.css('width', jsP.content.width()-90);

        /* option.iframe -------------------------------------------------------------------------------------------- */
        // implemented after option.size because option.size.width/height are either "auto" or pixel values already
        if ($.isPlainObject(option.iframe) && (option.iframe.src || option.iframe.srcdoc)) {

            var iFrame = $("<iframe></iframe>");

            // iframe content
            if (option.iframe.srcdoc) {

                iFrame.prop("srcdoc", option.iframe.srcdoc);

            }

            if (option.iframe.src) {

                iFrame.prop("src", option.iframe.src);

            }

            //iframe size
            if (option.size.width !== "auto" && !option.iframe.width) {

                iFrame.prop("width", option.size.width);

            } else if (typeof option.iframe.width === 'string' && option.iframe.width.slice(-1) === '%') {

                iFrame.prop("width", option.iframe.width);

            } else {

                iFrame.prop("width", parseInt(option.iframe.width) + 'px');

            }

            if (option.size.height !== "auto" && !option.iframe.height) {

                iFrame.prop("height", option.size.height);

            } else if (typeof option.iframe.height === 'string' && option.iframe.height.slice(-1) === '%') {

                iFrame.prop("height", option.iframe.height);

            } else {

                iFrame.prop("height", parseInt(option.iframe.height) + 'px');

            }

            //iframe name
            if (typeof option.iframe.name === 'string') {

                iFrame.prop("name", option.iframe.name);

            }

            //iframe id
            if (typeof option.iframe.id === 'string') {

                iFrame.prop("id", option.iframe.id);

            }

            //iframe seamless (not yet supported by any browser)
            if (option.iframe.seamless) {

                iFrame.prop("seamless", "seamless");

            }

            //iframe sandbox
            if (typeof option.iframe.sandbox === 'string') {

                iFrame.prop("sandox", option.iframe.sandbox);

            }

            //iframe style
            if ($.isPlainObject(option.iframe.style)) {

                iFrame.css(option.iframe.style);

            }

            //iframe css classes
            if (typeof option.iframe.classname === 'string') {

                iFrame.addClass(option.iframe.classname);

            } else if ($.isFunction(option.iframe.classname)) {

                iFrame.addClass(option.iframe.classname());

            }

            jsP.content.append(iFrame);
        }

        /* option.position ------------------------------------------------------------------------------------------ */
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
                    jsPanel.calcPos('bottom', option, count, jsP);

                } else if (option.position.top || option.position.top === 0) {

                    if (option.position.top === 'center') {

                        option.position.top = jsPanel.calcPosCenter(option).top;

                    } else {

                        jsPanel.calcPos('top', option, count, jsP);

                    }
                }

                // calculate left | right values != center
                if (option.position.right || option.position.right === 0) {

                    delete option.position.left;
                    jsPanel.calcPos('right', option, count, jsP);

                } else if (option.position.left || option.position.left === 0) {

                    if (option.position.left === 'center') {

                        option.position.left = jsPanel.calcPosCenter(option).left;

                    } else {

                        jsPanel.calcPos('left', option, count, jsP);

                    }

                }
                if (option.position.top) {

                    panelpos.top = parseInt(option.position.top, 10) + option.offset.top + 'px';

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

        /* option.addClass ------------------------------------------------------------------------------------------ */
        if (typeof option.addClass.header === 'string') {

            jsP.header.addClass(option.addClass.header);

        }

        if (typeof option.addClass.content === 'string') {

            jsP.content.addClass(option.addClass.content);

        }

        if (typeof option.addClass.footer === 'string') {

            jsP.footer.addClass(option.addClass.footer);

        }

        // handlers for doubleclicks -------------------------------------------------------------------------------- */
        // dblclicks disabled for normal modals, hints and tooltips
        if (option.paneltype.mode !== "default") {

            if (option.dblclicks) {

                if (option.dblclicks.title) {

                    jsP.header.title.on('dblclick', function (e) {

                        e.preventDefault();
                        jsPanel.dblclickhelper(option.dblclicks.title, jsP);

                    });

                }

                if (option.dblclicks.content) {

                    jsP.content.on('dblclick', function (e) {

                        e.preventDefault();
                        jsPanel.dblclickhelper(option.dblclicks.content, jsP);

                    });

                }

                if (option.dblclicks.footer) {

                    jsP.footer.on('dblclick', function (e) {

                        e.preventDefault();
                        jsPanel.dblclickhelper(option.dblclicks.footer, jsP);

                    });

                }

            }

        }

        /* option.show ---------------------------------------------------------------------------------------------- */
        if (anim.indexOf(" ") === -1) {

            // if no space is found in "anim" -> function anwenden
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

        /* needed if a maximized panel in body is normalized again -------------------------------------------------- */
        // don't put this under $('body').on('jspanelloaded', function () { ... }
        verticalOffset = jsPanel.calcVerticalOffset(jsP);

        /* replace bottom/right values with corresponding top/left values if necessary ------------------------------ */
        jsPanel.replaceCSSBottomRight(jsP, option.position);

        /* option.title | needs to be late in the file! ------------------------------------------------------------- */
        jsP.header.title.prepend(option.title);
        jsPanel.resizeTitle(jsP);

        /* reposition hints while scrolling window, must be after normalization of position ------------------------- */
        if (option.paneltype.type === 'hint') {

            jsPanel.reposHintsScroll(jsP);

        }

        /* reposition jsPanel appended to body while scrolling window ----------------------------------------------- */
        if (jsPparentTagname === 'body' && (option.paneltype.type !== 'tooltip' || option.paneltype.type !== 'hint')) {

            jsPanel.fixPosition(jsP);

        }

        /* option.callback & option.autoclose and a jQuery-UI draggable bugfix -------------------------------------- */
        /* resizestart & resizestop & dragstop callbacks ------------------------------------------------------------ */
        // features activated for extended modals only for @genachka
        if (!option.paneltype || option.paneltype.mode !== 'default') {
            // not needed for modals, hints and tooltips

            $(jsP).on("resize", function () {

                jsPanel.resizeContent(jsP);
                jsPanel.resizeTitle(jsP);

            });

            $(jsP).on("resizestop", function () {

                option.size = {

                    width: jsP.outerWidth() + 'px',
                    height: jsP.outerHeight() + 'px'

                };

                jsP.status = "normalized";
                $(jsP).trigger('jspanelnormalized', jsP.attr('id'));
                $(jsP).trigger('jspanelstatechange', jsP.attr('id'));

                // controls und title zurücksetzen
                jsPanel.hideControls(".jsPanel-btn-norm, .jsPanel-btn-smallrev", jsP);

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

                verticalOffset = jsPanel.calcVerticalOffset(jsP);

                if (jsPparentTagname === 'body') {

                    jsPanel.fixPosition(jsP);

                }

            });
        }

        /* option.autoclose | default: false --------------------------------------- */
        if (typeof option.autoclose === 'number' && option.autoclose > 0) {

            jsPanel.autoclose(jsP, jsP.attr('id'), option.autoclose);

        }

        /* tooltip corrections ----------------------------------------------------- */
        if (option.paneltype.type === "tooltip" && (option.paneltype.position === "top" || option.paneltype.position === "bottom")) {

            jsPanel.shiftTooltipHorizontal(jsP, option.paneltype.shiftwithin);

        } else if (option.paneltype.position === "left" || option.paneltype.position === "right") {

            jsPanel.shiftTooltipVertical(jsP, option.paneltype.shiftwithin);

        }

        /* option.callback --------------------------------------------------------- */
        if (option.callback && $.isFunction(option.callback)) {

            option.callback(jsP);

        } else if ($.isArray(option.callback)) {
            var j,
                max = option.callback.length;

            for (j = 0; j < max; j += 1) {

                if ($.isFunction(option.callback[j])) {

                    option.callback[j](jsP);

                }
            }

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
            iconfont: 'jsglyph',
            close: false,
            maximize: false,
            minimize: false,
            normalize: false,
            smallify: false,
            maxtoScreen: false
        },
        "dblclicks": false,
        "draggable": {
            handle: 'div.jsPanel-hdr, div.jsPanel-ftr',
            stack: '.jsPanel',
            opacity: 0.7
        },
        "id": function () {
            jsPanel.ID += 1;
            return 'jsPanel-' + jsPanel.ID;
        },
        "iframe": false,
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

    /* body click handler: remove all tooltips on click in body except click is inside tooltip */
    $('body').click(function (e) {
        var pID,
            isTT = $(e.target).closest('.jsPanel-tt' ).length;

        if (isTT < 1) {

            $('.jsPanel-tt').each(function () {

                pID = $(this).attr('id');

                // if present remove tooltip wrapper and than remove tooltip
                $('#' + pID).unwrap().remove();
                $('body').trigger('jspanelclosed', pID);

            });

        }

    });

}(jQuery));
