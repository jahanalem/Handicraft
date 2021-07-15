(function($){
 $.fn.parallaxSlider=function(o){ 
        
    var options = {
        prevButton: $('.prevButton')
    ,   nextButton: $('.nextButton')
    ,   duration: 1000
    ,   autoSwitcher: true
    ,   autoSwitcherDelay: 7000
    ,   parallaxEffect: true
    ,   slider_navs: true
    ,   slider_pagination: true
    ,   animateLayout: 'zoom-fade-eff' //simple-fade-eff, zoom-fade-eff, slide-top-eff
    }
    $.extend(options, o); 
    
    var 
        _this = $(this)
    ,   _window = $(window)
    ,   _document = $(document)
    ,   currSet = 0
    ,   currImgId = 0
    ,   ImgIdCounter = 0
    ,   itemsLength = 0
    ,   previewArray = []
    ,   isPreviewLoading = false
    ,   isPreviewAnimate = false
    ,   intervalSwitcher
    ,   parsedArray
    ,   _thisOffset =_this.offset()
    ,   _thisOffsetTop = _this.offset().top
    ,   _thisHeight = _this.height()
    ,   _thisHeightBuffer = 0
    ,   _windowWidth = 0
    ,   _windowHeight = 0
    ,   bufferRatio = 0.5
    ,   itemLength = 0
    ;

    var
        mainImageHolder
    ,   primaryImageHolder
    ,   secondaryHolder
    ,   mainCaptionHolder
    ,   primaryCaption
    ,   secondaryCaption
    ,   mainCaptionHolderContainer
    ,   previewSpinner
    ,   parallaxPrevBtn
    ,   parallaxNextBtn
    ,   slidesCounterList
    ,   paralaxSliderPagination
    ;

///////////////////////////// INIT /////////////////////////////////////////////////////////
    init();
    function init(){
        parsedArray = [];
            $('ul li', _this).each(
                function(){
                    parsedArray.push([$(this).attr('data-preview'), $(this).attr('data-img-width'), $(this).attr('data-img-height'), $(this).html()]);
                }
            )
        //  holder erase
        _this.html('');

        _this.addClass(options.animateLayout);

        //  preview holder build
        _this.append("<div id='mainImageHolder'><div class='primaryHolder'><img src='' alt=''></div><div class='secondaryHolder'><img src='' alt=''></div></div>");
        mainImageHolder = $('#mainImageHolder');
        primaryImageHolder = $('#mainImageHolder > .primaryHolder');
        secondarImageHolder = $('#mainImageHolder > .secondaryHolder');

         //  caption holder build
        _this.append("<div id='mainCaptionHolder'><div class='container'><div class='primaryCaption'></div><div class='secondaryCaption'></div></div></div>");
        mainCaptionHolder = $('#mainCaptionHolder');
        primaryCaption = $('.primaryCaption', mainCaptionHolder);
        secondaryCaption = $('.secondaryCaption', mainCaptionHolder);
        mainCaptionHolderContainer = $('>.container', mainCaptionHolder);

        //  controls build
        _this.append("<div class='controlBtn parallaxPrevBtn'><div class='innerBtn icon-chevron-left'></div><div class='slidesCounter'></div></div><div class='controlBtn parallaxNextBtn'><div class='innerBtn icon-chevron-right'></div><div class='slidesCounter'></div></div>");
        parallaxPrevBtn = $('.parallaxPrevBtn', _this);
        parallaxNextBtn = $('.parallaxNextBtn', _this);

        //  fullpreview pagination build
        _this.append("<div id='paralaxSliderPagination'><ul></ul></div>");
        paralaxSliderPagination = $('#paralaxSliderPagination');

        slidesCounterList = $('.slidesCounter', _this);
        
        //  preview loader build
        _this.append("<div id='previewSpinner'><span></span></div>");
        previewSpinner = $('#previewSpinner');

        _this.on("reBuild",
            function(e,d){
                setBuilder(d);
            }
        )

        _this.on("switchNext",
            function(e){
                nextSwither();
            }
        )

        _this.on("switchPrev",
            function(e){
                prevSwither();
            }
        )

        setBuilder({'urlArray':parsedArray});

        if(options.parallaxEffect){
            _thisHeight = _this.height();
            _thisHeightBuffer = _thisHeight*bufferRatio;
        }else{
            mainImageHolder.css({"height":"100%"});
            mainCaptionHolder.css({"height":"100%"});
        }

        if(!options.slider_navs){
            parallaxPrevBtn.remove();
            parallaxNextBtn.remove();
        }
        if(!options.slider_pagination){
            paralaxSliderPagination.remove();
        }


        addEventsFunction();
        autoSwitcher();
    }
    //------------------------- set Builder -----------------------------//
    function setBuilder(dataObj){ 
        currIndex = 0;
        ImgIdCounter = 0;
        previewArray = [];
        previewArray = dataObj.urlArray;
        itemLength = previewArray.length;

        $(">ul", paralaxSliderPagination).empty();
        for (var i = 0; i < itemLength; i++) {
            $(">ul", paralaxSliderPagination).append("<li></li>");
        };

        if(itemLength==1){
            console.log(paralaxSliderPagination);
            paralaxSliderPagination.remove();
            parallaxPrevBtn.remove();
            parallaxNextBtn.remove();
           
        }

        imageSwitcher(0);
        addEventsPagination();
    }

    function autoSwitcher(){
        if(options.autoSwitcher){
            if(itemLength>1){
                intervalSwitcher = setInterval(function(){
                    nextSwither();
                }, options.autoSwitcherDelay);
            }
        }
    }
    //////////////////////////    addEvents    /////////////////////////////////////////////
    function addEventsPagination(){
        $(">ul >li", paralaxSliderPagination).on("click",
            function(){
                if((!isPreviewLoading) && (!isPreviewAnimate) && ($(this).index() !== ImgIdCounter)){
                    ImgIdCounter = $(this).index();
                    imageSwitcher(ImgIdCounter);
                }
            }
        )
    }
    function addEventsFunction(){
        //--------------- controls events ----------------------//
        options.prevButton.on("click",
            function(){
                clearInterval(intervalSwitcher);
                prevSwither();
            }
        )
        options.nextButton.on("click",
            function(){
                clearInterval(intervalSwitcher);
                nextSwither(); 
            }
        )
        parallaxPrevBtn.on("click",
            function(){
                clearInterval(intervalSwitcher);
                prevSwither();
            }
        )
        parallaxNextBtn.on("click",
            function(){
                clearInterval(intervalSwitcher);
                nextSwither();
            }
        )
        //--------------- keyboard events ----------------------//
        _window.on("keydown",
            function(eventObject){
                switch (eventObject.keyCode){
                    case 37:
                        clearInterval(intervalSwitcher);
                        prevSwither();
                    break
                    case 39:
                         clearInterval(intervalSwitcher);
                        nextSwither();
                    break
                }
            }
        )
        //------------------ window scroll event -------------//
        $(window).on('scroll',
            function(){
                mainScrollFunction();
            }
        ).trigger('scroll');
        //------------------ window resize event -------------//
        $(window).on("resize",
            function(){
                mainResizeFunction();
            }
        )
    }
    //-----------------------------------------------------------------
    function prevSwither(){
        if(!isPreviewLoading && !isPreviewAnimate){
            if(ImgIdCounter > 0){
                ImgIdCounter--;
            }else{
                ImgIdCounter = itemLength-1;
            }
                imageSwitcher(ImgIdCounter);
        }
    }
    function nextSwither(){
        if(!isPreviewLoading && !isPreviewAnimate){
            if(ImgIdCounter < itemLength-1){
                ImgIdCounter++;
            }else{
                ImgIdCounter = 0;
            }
            imageSwitcher(ImgIdCounter);
        }
    }
    //------------------------- main Swither ----------------------------//
    function imageSwitcher(currIndex){ 
        slidesCounterList.text((currIndex+1) + '/'+itemLength);
        $(">ul >li", paralaxSliderPagination).removeClass('active').eq(currIndex).addClass('active');

        $('> img', primaryImageHolder).attr('src','').attr('src', previewArray[currIndex][0]);
        $('> img', primaryImageHolder).attr('data-image-width', previewArray[currIndex][1]);
        $('> img', primaryImageHolder).attr('data-image-height', previewArray[currIndex][2]);
        objectCssTransition(primaryImageHolder, 0, 'ease');
        primaryImageHolder.addClass('animateState');

        primaryCaption.html(previewArray[currIndex][3]);
        objectCssTransition(primaryCaption, 0, 'ease');
        primaryCaption.addClass('animateState');

        isPreviewLoading = true;
        isPreviewAnimate = true;
        previewSpinner.css({display:'block'}).stop().fadeTo(300, 1);
        $('> img', primaryImageHolder).on('load', function(){ 
            isPreviewLoading = false;
            previewSpinner.stop().fadeTo(300, 0, function(){ $(this).css({display:'none'}); })
            $(this).off('load');
            objectResize($('> img', primaryImageHolder), mainImageHolder, "fill");

            objectCssTransition(primaryImageHolder, options.duration, 'outCubic');
            primaryImageHolder.removeClass('animateState');
            objectCssTransition(secondarImageHolder, options.duration, 'outCubic');
            secondarImageHolder.addClass('animateState');

            objectCssTransition(primaryCaption, options.duration, 'outCubic');
            primaryCaption.removeClass('animateState');
            objectCssTransition(secondaryCaption, options.duration, 'outCubic');
            secondaryCaption.addClass('animateState');


            mainCaptionHolderContainer.height(primaryCaption.height());

            setTimeout(
                function(){
                    objectCssTransition(secondarImageHolder, 0, 'ease');
                    secondarImageHolder.removeClass('animateState');

                    $('> img', secondarImageHolder).attr('src', "").attr('src', previewArray[currIndex][0]);
                    $('> img', secondarImageHolder).attr('data-image-width', previewArray[currIndex][1]);
                    $('> img', secondarImageHolder).attr('data-image-height', previewArray[currIndex][2]);
                    
                    secondaryCaption.html(previewArray[currIndex][3]);
                    objectCssTransition(secondaryCaption, 0, 'ease');
                    secondaryCaption.removeClass('animateState');

                    objectResize($('> img', secondarImageHolder), mainImageHolder, "fill");
                    isPreviewAnimate = false;
                }, options.duration
            )
        });
    }

    //----------------------------------------------------//
    function objectCssTransition(obj, duration, ease){
        var durationValue;

        if(duration !== 0){
            durationValue = duration/1000;
        }else{
            durationValue = 0
        }

        switch(ease){
            case 'ease':
                    obj.css({"-webkit-transition":"all "+durationValue+"s ease", "-moz-transition":"all "+durationValue+"s ease", "-o-transition":"all "+durationValue+"s ease", "transition":"all "+durationValue+"s ease"});
            break;
            case 'outSine':
                obj.css({"-webkit-transition":"all "+durationValue+"s cubic-bezier(0.470, 0.000, 0.745, 0.715)", "-moz-transition":"all "+durationValue+"s cubic-bezier(0.470, 0.000, 0.745, 0.715)", "-o-transition":"all "+durationValue+"s cubic-bezier(0.470, 0.000, 0.745, 0.715)", "transition":"all "+durationValue+"s cubic-bezier(0.470, 0.000, 0.745, 0.715)"});
            break;
            case 'outCubic':
                obj.css({"-webkit-transition":"all "+durationValue+"s cubic-bezier(0.215, 0.610, 0.355, 1.000)", "-moz-transition":"all "+durationValue+"s cubic-bezier(0.215, 0.610, 0.355, 1.000)", "-o-transition":"all "+durationValue+"s cubic-bezier(0.215, 0.610, 0.355, 1.000)", "transition":"all "+durationValue+"s cubic-bezier(0.215, 0.610, 0.355, 1.000)"});
            break;
            case 'outExpo':
                obj.css({"-webkit-transition":"all "+durationValue+"s cubic-bezier(0.190, 1.000, 0.220, 1.000)", "-moz-transition":"all "+durationValue+"s cubic-bezier(0.190, 1.000, 0.220, 1.000)", "-o-transition":"all "+durationValue+"s cubic-bezier(0.190, 1.000, 0.220, 1.000)", "transition":"all "+durationValue+"s cubic-bezier(0.190, 1.000, 0.220, 1.000)"});
            break;
            case 'outBack':
                obj.css({"-webkit-transition":"all "+durationValue+"s cubic-bezier(0.175, 0.885, 0.320, 1.275)", "-moz-transition":"all "+durationValue+"s cubic-bezier(0.175, 0.885, 0.320, 1.275)", "-o-transition":"all "+durationValue+"s cubic-bezier(0.175, 0.885, 0.320, 1.275)", "transition":"all "+durationValue+"s cubic-bezier(0.175, 0.885, 0.320, 1.275)"});
            break;
        }
    }
    //----------------------------------------------------//
    function objectResize(obj, container, type){
        var 
            prevImgWidth = 0
        ,   prevImgHeight = 0
        ,   imageRatio
        ,   windowRatio
        ,   newImgWidth
        ,   newImgHeight
        ,   newImgTop
        ,   newImgLeft
        ,   alignIMG = 'top'
        ;
        
        prevImgWidth = parseInt(obj.attr('data-image-width'));
        prevImgHeight = parseInt(obj.attr('data-image-height'));


        imageRatio = prevImgHeight/prevImgWidth;
        containerRatio = container.height()/container.width();
        
        switch(type){
            case 'fill':
                if(containerRatio > imageRatio){
                    newImgHeight = container.height();
                    newImgWidth = Math.round( (newImgHeight*prevImgWidth) / prevImgHeight );
                }else{
                    newImgWidth = container.width();
                    newImgHeight = Math.round( (newImgWidth*prevImgHeight) / prevImgWidth );
                }

                obj.css({width: newImgWidth, height: newImgHeight});

                screenWidth = container.width();
                screenHeight = container.height();
                imgWidth = obj.width();
                imgHeight = obj.height();

                switch(alignIMG){
                    case "top":
                        newImgLeft=-(imgWidth-screenWidth)*.5;
                        newImgTop=0;
                    break;
                    case "bottom":
                        newImgLeft=-(imgWidth-screenWidth)*.5;
                        newImgTop=-(imgHeight-screenHeight);
                    break;
                    case "right":
                        newImgLeft=-(imgWidth-screenWidth);
                        newImgTop=-(imgHeight-screenHeight)*.5;
                    break;
                    case "left":
                        newImgLeft=0;
                        newImgTop=-(imgHeight-screenHeight)*.5;
                    break;
                    case "top_left":
                        newImgLeft=0;
                        newImgTop=0;
                    break;
                    case "top_right":
                        newImgLeft=-(imgWidth-screenWidth);
                        newImgTop=0;
                    break;
                    case "bottom_right":
                        newImgLeft=-(imgWidth-screenWidth);
                        newImgTop=-(imgHeight-screenHeight);
                    break;
                    case "bottom_left":
                        newImgLeft=0;
                        newImgTop=-(imgHeight-screenHeight);
                    break;
                    default:
                        newImgLeft=-(imgWidth-screenWidth)*.5;
                        newImgTop= -(imgHeight-screenHeight)*.5;
                    }
            break
            case 'fit':
                if(containerRatio > imageRatio){
                    newImgWidth = container.width();
                    newImgHeight = (prevImgHeight*container.width())/prevImgWidth;
                    newImgTop = container.height()/2 - newImgHeight/2;
                    newImgLeft = 0; 
                }else{
                    newImgWidth = (prevImgWidth*container.height())/prevImgHeight;
                    newImgHeight = container.height();
                    newImgTop = 0;
                    newImgLeft = container.width()/2 - newImgWidth/2;  
                }
                obj.css({width: newImgWidth, height: newImgHeight});
            break
        }

        obj.css({top: newImgTop, left: newImgLeft});
    }
    //------------------- main window scroll function -------------------//
    function mainScrollFunction(){
            var 
                _documentScrollTop
            ,   startScrollTop
            ,   endScrollTop
            ,   visibleScrollValue
            ;

            _windowWidth = _window.width();
            _windowHeight = _window.height();
            _thisOffsetTop = _thisOffset.top;
            _documentScrollTop = _document.scrollTop();

            startScrollTop = _documentScrollTop + _windowHeight;
            endScrollTop = _documentScrollTop - _thisHeight;

            visibleScrollValue = startScrollTop - endScrollTop;

            if( (startScrollTop > _thisOffsetTop) && (endScrollTop < _thisOffsetTop) && (options.parallaxEffect)){
                pixelScrolled = _documentScrollTop - (_thisOffsetTop-_windowHeight);
                percentScrolled = pixelScrolled/visibleScrollValue;
                percentSinScrolled = Math.sin(toRadians(180*percentScrolled));
                thisHidenScrollVal = _thisOffsetTop-_documentScrollTop;
                deltaTopScrollVal = _thisHeightBuffer*percentScrolled;

                mainImageHolder.css({top:-_thisHeightBuffer+(deltaTopScrollVal)});

                mainCaptionHolder.css({top: -_thisHeightBuffer+(deltaTopScrollVal*1.3)});
                mainCaptionHolder.fadeTo(0, percentSinScrolled);
                parallaxPrevBtn.css({top: Math.ceil(percentScrolled*100) +"%"});
                parallaxNextBtn.css({top: Math.ceil(percentScrolled*100) +"%"});
                parallaxPrevBtn.fadeTo(0, percentSinScrolled);
                parallaxNextBtn.fadeTo(0, percentSinScrolled);
                paralaxSliderPagination.fadeTo(0, percentSinScrolled);
            }
    }
    
    //------------------- main window resize function -------------------//
    function mainResizeFunction(){
        _windowWidth = _window.width();
        _windowHeight = _window.height();
        _thisHeight = _this.height();
        _thisHeightBuffer = _thisHeight*bufferRatio;

        objectResize($('> img', primaryImageHolder), mainImageHolder, "fill");
        objectResize($('> img', secondarImageHolder), mainImageHolder, "fill");
    }
    //end window resizefunction
    //--------------------------------------------------------------------//
    function toDegrees (angle) {
      return angle * (180 / Math.PI);
    }
    function toRadians (angle) {
      return angle * (Math.PI / 180);
    }
////////////////////////////////////////////////////////////////////////////////////////////              
    }
})(jQuery)