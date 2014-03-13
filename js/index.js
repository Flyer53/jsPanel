$( document ).ready( function(){

    // welcome panel sofort laden ...
    $( '#content' ).jsPanel({
        size: {
            width: 600,
            height: 'auto'
        },
        position: {
            top: 50,
            left: 'center'
        },
        ajax: {
            url: 'files/welcomepanel.html'
        }
    });

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

    $( document ).on( 'click', '#bsp11', function(){
        $('#content').jsPanel();
    });

    $( document ).on( 'click', '#bsp12', function(){
        $('#content').jsPanel({
            position: { top:50, left:475 },
            size: { width:500, height:310 }
        });
    });

    $( document ).on( 'click', '#bsp13', function(){
        $('#content').jsPanel({
            id: 'example13',
            title: 'Example No 1.3',
            position: { top:150, left:475 }
        });
    });

    $( document ).on( 'click', '#bsp14', function(){
        $('#content').jsPanel({
            id: 'example14',
            title: 'Example No 1.4',
            position: { top:300, left:475 },
            overflow: { vertical:'hidden', horizontal:'hidden' }
        });
    });

    $( document ).on( 'click', '#bsp15', function(){
        $('#content').jsPanel({
            id: 'example15',
            title: 'Example No 1.5',
            size: { width: 500, height: 310 },
            position: { top: 'center', left: 'center' }
        });
    });

    $( document ).on( 'click', '#bsp21', function(){
        $('#content').jsPanel({
            id: 'example21',
            title: 'Example No 2.1',
            position: { top:50, left:75 },
            size: { width:'auto', height:'auto' },
            content: '<p style="text-align:center;padding:100px">A simple HTML string as content</p>'
        });
    });

    function bsp22(){ return "<p style='text-align:center;padding:100px;'>Return value of a function</p>"; }
    $( document ).on( 'click', '#bsp22', function(){
        $('#content').jsPanel({
            id: 'example22',
            title: 'Example No 2.2',
            position: { top:150, left:75 },
            size: { width:'auto', height:'auto' },
            content: bsp22()
        });

    });

    $( document ).on( 'click', '#bsp23', function(){
        $('#content').jsPanel({
            id: 'example23',
            title: 'Example No 2.3',
            position: { top:300, left:50 },
            size: { width:'auto', height:'auto' },
            content: (function(){
                return "<p style='text-align:center;padding:50px;'>Content returned from an Immediately Invoked Function Expression.</p><p style='text-align:center;padding:0 10px 50px 0;'>(function(){ /* Code goes here */ }())</p>";
            }())
        });

    });

    $( document ).on( 'click', '#bsp24', function(){
        $('#content').jsPanel({
            id: 'example24',
            title: 'Example No 2.4',
            position: { top:570, left:360 },
            size: { width:700, height:'auto' }
        },
        function(){
            $('.jsPanel-content', '#example24' ).load( 'files/example24.html' );
        });
    });

    $( document ).on( 'click', '#bsp25', function(){
        $( '#content' ).jsPanel({
            id: 'example25',
            title: 'Example No 2.5',
            position: { top: 'center', left: 780 },
            ajax: {
                url: 'files/example25.html'
            }
        });
    });

    $( document ).on( 'click', '#bsp26', function(){
        $( '#content' ).jsPanel({
            id: 'example26',
            title: 'Example No 2.6',
            position: { top: 'center', left: 780 },
            load: {
                url: 'files/example26.html',
                complete: function(){ console.log( "It's done!" ) }
            }
        });
    });

    $( document ).on( 'click', '#bsp31', function(){
        $('#content').jsPanel({
            id: 'example31',
            title: 'Example No 3.1',
            position: { top:50, left:345 },
            toolbarContent: '<img src="js/jsPanel/images/cut.png"> <img src="js/jsPanel/images/copy.gif"> <img src="js/jsPanel/images/paste_plain.png"> <img src="js/jsPanel/images/printer.png">'
        })
    });

    $( document ).on( 'click', '#bsp32', function(){
        $('#content').jsPanel({
            id: 'example32',
            title: 'Example No 3.2',
            position: { top:190, left:345 },
            content: "<div style='width:48px;height:48px;position:absolute;top:0;left:0;bottom:0;right:0;margin:auto;'><img src='js/jsPanel/images/pl.gif' alt=''></div>"
        })
    });

    $( document ).on( 'click', '#bsp33a', function(){
        $('#content').jsPanel({
            id: 'example33a',
            title: 'Example No 3.3a',
            position: { top:315, left:345 },
            contentBG: '#65A5D1'
        });
    });

    $( document ).on( 'click', '#bsp33b', function(){
        $('#content').jsPanel({
            id: 'example33b',
            title: 'Example No 3.3b',
            position: { top:480, left:345 },
            contentBG: { 'background':'#A62D00' }
        });
    });

    $( document ).on( 'click', '#bsp34', function(){
        $('#content').jsPanel({
            id: 'example34',
            title: 'Example No 3.4',
            position: { top:590, left:345 },
            resizable: {
                minWidth:   300,
                minHeight:  150,
                maxWidth:   800,
                maxHeight:  600
            },
            draggable:  {
                stop: function(event, ui) {
                    ui.helper.css( 'background', '#235849' );
                }
            }
        });
    });

    $( document ).on( 'click', '#bsp41', function(){
        $('#content').jsPanel({
            title: 'Example No 4.1',
            position: { top: 'auto', left: 'auto' }
        });
    });

    $( document ).on( 'click', '#bsp41a', function(){
        $('#content').jsPanel({
            title: 'Example No 4.1a',
            position: { top: 'auto', left: 900 }
        });
    });

    $( document ).on( 'click', '#bsp42', function(){
        $('#content').jsPanel({
            id: 'example42',
            title: 'Example No 4.2',
            position: { top: 'center', left: 'center' }
        },function(){
            $( '#example42 .jsPanel-content' ).jsPanel({
                size: {width: 150,height: 100}
            });
        });
    });




})