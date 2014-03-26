var modal_background = "<div class='div-modal' style='position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);'></div>";

$('body' )
    .append(modal_background)
    .jsPanel({
        title: 'modal testpanel',
        position: { top: 'center', left: 'center' },
        content: '<p style="padding:30px;color:#000;text-align:center;">Could be a form or something else ...</p>'
    },
    function(panel){
        $('.jsPanel-hdr-r-btn-min', panel ).remove();
        $('.jsPanel-hdr-r-btn-max', panel ).remove();
        panel
            .draggable('disable' )
            .resizable('disable')
            .css('opacity', 1.0);
        $('.jsPanel-hdr-r-btn-close', panel ).removeClass('jsPanel-hdr-r-btn-close' ).addClass('jsPanel-hdr-r-btn-close-modal').text('X');

        $('.jsPanel-hdr-r-btn-close-modal' ).click(function(){
            $('.div-modal' ).remove();
        });

    });
