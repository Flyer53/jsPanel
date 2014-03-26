$( document ).ready( function(){

    $('#jspanelversion' ).append( jsPanelversion );

    $('button').button();

    $( document ).on( 'click', '#nav-download', function(e){
        e.preventDefault();
        $('#content').jsPanel({
            title: 'jsPanel download',
            size: { width: 520, height: 'auto' },
            position: { top: 50, left: 'center' },
            overflow: { horizontal: 'hidden', vertical: 'hidden' },
            load: { url: 'files/downloadpanel.html' }
        });
    });

    $('#try-1').click( function(){
        $( '#content' ).jsPanel();
    });

    $('#try-2').click( function(){
        $( '#options-id' ).jsPanel({
            id: 'testpanel',
            position: { top: 110, left: 240 }
        });
    });

    $('#try-3').click( function(){
        $('#options-id').jsPanel({
            id: function(){ return 'jsPanel_' + ( $('.jsPanel').length + 1 ) },
            position: { top: 240, left: 390 }
        });
    });

    $('#try-4').click( function(){
        $( '#options-title' ).jsPanel({
            title: 'Title of the jsPanel',
            position: { top: 130, left: 250 }
        });
    });

    $('#try-5').click( function(){
        $('#options-title').jsPanel({
            title: function(){ return 'jsPanel No ' + ( $('.jsPanel').length + 1 ) },
            position: { top: 190, left: 420 }
        });
    });

    $('#try-6').click( function(){
        $( '#options-size' ).jsPanel({
            size: { width: 500, height: 300 },
            position: { top: 260, left: 300 }
        });
    });

    $('#try-7').click( function(){
        $('#options-size').jsPanel({
            size: { width: '600px', height: 'auto' },
            position: { top: 360, left: 300 }
        });
    });

    $('#try-7a').click( function(){
        $('#options-size').jsPanel({
            size: 'auto',
            position: 'center',
            content: "<p style='padding:30px 50px;'>Some text content for demo ...</p>"
        });
    });

    $('#try-8').click( function(){
        $( '#options-size' ).jsPanel({
            size: {
                width: function(){ return $(window).width()/3 },
                height: 350
            },
            position: { top: 460, left: 400 }
        });
    });

    $('#try-9').click( function(){
        $( '#options-position' ).jsPanel({
            position: { top: 550, left: 300 }
        });
    });

    $('#try-10').click( function(){
        $( '#options-position' ).jsPanel({
            position: 'auto'
        });
    });

    $('#try-11').click( function(){
        $( '#options-position' ).jsPanel({
            position: { top: 860, left: 'auto' }
        });
        $( '#options-position' ).jsPanel({
            position: { top: 860, left: 'auto' }
        });
        $( '#options-position' ).jsPanel({
            position: { top: 860, left: 'auto' }
        });
    });

    $('#try-12').click( function(){
        $( '#options-position' ).jsPanel({
            position: { top: 915, left: 'center' }
        });
    });

    $('#try-13').click( function(){
        $( '#options-position' ).jsPanel({
            size: { width: 'auto', height: 'auto' },
            position: { top: 'center', left: 'center' }
        });
    });

    $('#try-13a').click( function(){
        $( '#options-position' ).jsPanel({
            size: 'auto',
            position: 'center',
            content: "<p style='padding:40px 50px;'>Some text content ...</p>"
        });
    });

    $('#try-13b').click( function(){
        $( '#options-position' ).jsPanel({
            size: 'auto',
            position: { bottom: 0, right: 0 },
            content: "<p style='padding:40px 50px;'>Some text content ...</p>"
        });
    });

    $('#try-13c').click( function(){
        $( '#options-position' ).jsPanel({
            size: 'auto',
            position: 'bottom right'
        });
    });

    $('#try-14').click( function(){
        $( '#options-overflow' ).jsPanel({
            overflow: { vertical: 'scroll', horizontal: 'hidden' },
            position: { top: 135, left: 340 }
        });
    });

    $('#try-14a').click( function(){
        $( '#options-overflow' ).jsPanel({
            overflow: 'scroll',
            position: 'center',
            size: { width: 440, height: 300 },
            load: {
                url: 'files/loremipsum.html'
            }
        });
    });

    $('#try-15').click( function(){
        $('#options-content').jsPanel({
            content: "<div class='preloader'><img src='js/jsPanel/images/pl.gif'></div>",
            position: { top: 150, left: 400 }
        });
    });

    $('#try-16').click( function(){
        $('#options-content').jsPanel({
            content: function(){ return "<div class='preloader'><img src='js/jsPanel/images/pl.gif'></div>"; },
            position: { top: 250, left: 400 }
        });
    });

    $('#try-17').click( function(){
        var func = function(){ return "<div class='preloader'><img src='js/jsPanel/images/pl.gif'></div>"; }

        $('#options-content').jsPanel({
            content: func,
            position: { top: 350, left: 400 }
        });
    });

    $('#try-19').click( function(){
        $('#options-content').jsPanel({
            content: $( '<p>Lorem ipsum ...</p>' ).css( {padding:'20px', 'text-align':'center'} ),
            position: { top: 450, left: 400 }
        });
    });

    $('#try-19b').click( function(){
        $('#options-load').jsPanel({
            position: { top: 255, left: 350 },
            load: {
                url: 'files/example-load.html',
                complete: function( responseText, textStatus, XMLHttpRequest, jsPanel ){
                    console.log( textStatus );
                    $('.jsPanel-content', jsPanel).append( XMLHttpRequest.statusText );
                }
            }
        });
    });

    $('#try-19a').click( function(){
        $( '#options-ajax' ).jsPanel({
            position: { top: 155, left: 300 },
            ajax: {
                url: 'files/example-ajax.html'
            }
        });
    });

    $('#try-19c').click( function(){
        $( '#options-ajax' ).jsPanel({
            position: { top: 475, left: 380 },
            size: { width: 650, height: 'auto' },
            ajax: {
                url: 'files/example-ajax-2.html',
                done: function(data, textStatus, jqXHR, jsPanel){
                    console.log( 'jqXHR status: ' + jqXHR.status + ' ' + jqXHR.statusText + ' ' + textStatus  );
                },
                fail: function( jqXHR, textStatus, errorThrown, jsPanel ){
                    $('.jsPanel-content', jsPanel).append( jqXHR.responseText );
                },
                always: function( arg1, textStatus, arg3, jsPanel ){
                    console.log( textStatus );
                }
            }
        });
    });

    $('#try-19d').click( function(){
        $( '#options-ajax' ).jsPanel({
            position: { top: 990, left: 450 },
            size: { width: 650, height: 'auto' },
            ajax: {
                url: 'files/example-ajax-3.html',
                then: [
                    function( data, textStatus, jqXHR, jsPanel ){
                        jsPanel.title( 'Example for option.ajax.then' );
                        console.log( textStatus )
                    },
                    function( jqXHR, textStatus, errorThrown, jsPanel ){
                        $('.jsPanel-content', jsPanel).append( jqXHR.responseText );
                        console.log( errorThrown )
                    }
                ]
            }
        });
    });

    $('#try-20').click( function(){
        $('#options-contentbg').jsPanel({
            contentBG: '#234567',
            position: { top: 170, left: 360 }
        });
    });

    $('#try-21').click( function(){
        $('#options-contentbg').jsPanel({
            contentBG: 'url("background.png") repeat scroll 0 0 #567890',
            position: { top: 260, left: 460 }
        });
    });

    $('#try-22').click( function(){
        $('#options-contentbg').jsPanel({
            contentBG: {
                color:'#FFFFFF',
                background:'#234567'
            },
            position: { top: 440, left: 380 },
            content: $( '<p>Lorem ipsum ...</p>' ).css( {padding:'20px', 'text-align':'center'} )
        });
    });

    $('#try-23').click( function(){
        $('#options-resizable').jsPanel({
            resizable: {
                maxWidth: 800,
                maxHeight: 600
            },
            position: { top: 260, left: 260 }
        });
    });

    $('#try-24').click( function(){
        $('#options-draggable').jsPanel({
            draggable: {
                stop: function( event, ui ) {
                    ui.helper.css( 'background', '#235849' );
                }
            },
            position: { top: 250, left: 300 }
        });
    });

    $('#try-25').click( function(){
        $('#options-toolbarcontent').jsPanel({
            toolbarContent: '<p>Toolbar content goes here ...</p>',
            position: { top: 120, left: 380 }
        });
    });

    $('#try-25a').click( function(){
        $('#options-autoclose').jsPanel({
            autoclose: 4000
        });
    });

    $('#try-25b').click( function(){
        $('#options-controls').jsPanel({
            size: { width: 250, height: 130 },
            overflow: 'hidden',
            position: 'top right',
            controls: 'closeonly'
        });
    });

    $('#try-26').click( function(){
        var jspanel = $('#method-title').jsPanel({
            title: 'Title of jspanel',
            position: { top: 120, left: 350 }
        });
        console.log( jspanel.title() );
    });

    $('#try-27').click( function(){
        var jspanel = $('#method-title').jsPanel({
            title: 'Title of jspanel',
            position: { top: 220, left: 350 }
        });
        console.log( jspanel.title( true ) );
    });

    $('#try-28').click( function(){
        var jspanel = $('#method-title').jsPanel({
            title: 'Title of jspanel',
            position: { top: 320, left: 350 }
        });
        console.log( jspanel.title( 'And this is a new title!' ) );
    });

    $('#try-29').click( function(){
        var jspanel = $('#method-addtoolbar').jsPanel({
            title: 'Title of jspanel',
            position: { top: 70, left: 370 }
        });
        console.log( jspanel.addToolbar( '<p><img src="js/jsPanel/images/printer.png"> more toolbar content ...</p>' ) );
    });

    $('#try-30').click( function(){
        var jspanel = $('#method-close').jsPanel({
            position: { top: 70, left: 300 }
        });
        window.setTimeout( function(){
            console.log( jspanel.close() );
        }, 3000 );
    });

    $('#try-31').click( function(){
        // generate a parent panel and store it in a variable
        var testpanel = $( "#method-closechildpanels" ).jsPanel({
            id: 'jspanel',
            position: { top: 70, left: 320 }
        });
        // generate a childpanel within the content area of testpanel
        $( ".jsPanel-content", testpanel ).jsPanel({
            position: { top: 'center', left: 'center' },
            size: { width: 250, height: 150 }
        });
        // remove the childpanel
        window.setTimeout( function(){
            console.log( testpanel.closeChildpanels() );
        }, 3000 );
    });

    $('#try-32').click( function(){
        // generate a few jsPanels
        var testpanel1 = $( "#method-movetofront" ).jsPanel( { position: { top:70, left:360 } } ),
            testpanel2 = $( "#method-movetofront" ).jsPanel( { position: { top:95, left:385 } } ),
            testpanel3 = $( "#method-movetofront" ).jsPanel( { position: { top:120, left:410 } } );
        // move testpanel1 to the front
        window.setTimeout( function(){
            console.log( testpanel1.movetoFront() );
        }, 3000 );
    });

    $('#try-33').click( function(){
        // generate a few jsPanels
        var testpanel1 = $( "#method-minimize" ).jsPanel( { position: { top:70, left:360 } } ),
            testpanel2 = $( "#method-minimize" ).jsPanel( { position: { top:95, left:385 } } ),
            testpanel3 = $( "#method-minimize" ).jsPanel( { position: { top:120, left:410 } } );
        // minimize testpanel1
        window.setTimeout( function(){
            console.log( testpanel1.minimize() );
        }, 3000 );
        window.setTimeout( function(){
            testpanel2.minimize();
        }, 4000 );
        window.setTimeout( function(){
            testpanel3.minimize();
        }, 5000 );
    });

    $('#try-34').click( function(){
        // generate a jsPanel
        var parentpanel = $( "#method-maximize" ).jsPanel( { position: { top: 100, left: 360 } } ),
            childpanel = $( ".jsPanel-content", parentpanel ).jsPanel( { size: { width: 250, height: 175 } } );
        // repeat the maximize method several times
        window.setTimeout( function(){ console.log( childpanel.maximize() ); }, 2000 );
        window.setTimeout( function(){ console.log( childpanel.maximize() ); }, 4000 );
        window.setTimeout( function(){ console.log( childpanel.minimize() ); }, 6000 );
        window.setTimeout( function(){ console.log( childpanel.maximize() ); }, 8000 );
    });

    $('#try-35').click( function(){
        $( '#callback' ).jsPanel( {
            position: { top: 60, left: 300 }
        },function( panel ){
            console.log( panel.attr( 'id' ) )
        });
    });

    $('#try-36').click( function(){
        $( '#callback' ).jsPanel( function( panel ){
            $( '.jsPanel-content', panel ).load( 'files/callback-2.html' );
        });
    });

    $('#try-37').click( function(){
        $( '#callback' ).jsPanel( {}, function( panel ){
            panel
            .title( 'Welcome Panel' )
            .find( '.jsPanel-content' )
            .load( 'files/callback-3.html' );
        });
    });

    $('#try-38').click( function(){
        $( '#callback' ).jsPanel( function( panel ){
            $.ajax({
                url: 'files/callback-4.html'
            })
            .done( function(  data, textStatus, jqXHR  ){
                $( '.jsPanel-content', panel ).empty().append( data );
                console.log( textStatus );
            });
        });
    });



})