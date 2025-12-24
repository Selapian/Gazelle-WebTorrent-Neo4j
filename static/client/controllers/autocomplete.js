function htmlSearch(){
    $(document).keyup(function(e) {
        if (e.key === "Escape") { // escape key maps to keycode `27`
            $(".autosuggestBox").hide();
        }
    });
    $(document).mouseup(function(e) 
    {
        var container = $(".autosuggestBox");
        clearTimeout(timeoutId);
        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0) 
        {
            container.hide();
        }
    })


    $(".searchField").on('click', function(e){
        if(search && records && records[$(this).parent().attr("class")]){
            $(this).next().show();
        }
    })

    var search;
    var records;
    var timeoutId;
    var classes;

    $(".search_dialectic_classes_input").autocomplete({
        scroll : true,
        source: function( request, response ) {
            $.ajax({
                /* Snip */
                data : { 
                    term : request.term.split(",")[request.term.split(",").length - 1]
                },
                url: '/search?field=search_classes',
                type: "get", //send it through get method
                success: function(data) {
                    response($.map(data, function(item) {
                        return {label : decodeEntities(decodeEntities((item.label))), value : item.value};
                    }))
                 }
            });
        },
        select : function(event, ui){
            
            $(".search_dialectic_classes_input").val($(this).val().substring(0, $(this).val().lastIndexOf(",")) + 
                                            ($(this).val().indexOf(",") > -1 ? ", " : "") +
                                         ui.item.label)      
            return false;         
        }
    })

    $(".src_search_dialectic_classes_input").autocomplete({
        scroll : true,
        source: function( request, response ) {
            $.ajax({
                /* Snip */
                data : { 
                    term : request.term.split(",")[request.term.split(",").length - 1]
                },
                url: '/search?field=search_classes',
                type: "get", //send it through get method
                success: function(data) {
                    response($.map(data, function(item) {
                        return {label : decodeEntities(decodeEntities((item.label))), value : item.value};
                    }))
                 }
            });
        },
        select : function(event, ui){
            
            $(".src_search_dialectic_classes_input").val($(this).val().substring(0, $(this).val().lastIndexOf(",")) + 
                                            ($(this).val().indexOf(",") > -1 ? ", " : "") +
                                         ui.item.label)      
            return false;         
        }
    })

    $(".search_publishers_input").autocomplete({
        scroll : true,
        source: function( request, response ) {
            $.ajax({
                /* Snip */
                data : { 
                    term : request.term
                },
                url: '/search?field=search_publishers',
                type: "get", //send it through get method
                success: function(data) {
                    response($.map(data, function(item) {
                        return {label : toTitleCase(decodeEntities(decodeEntities((item.label)))), value : item.value};
                    }))
                 }
            });
        },
        select : function(event, ui){
            $(".search_publishers_input").val("")
            $(".mobile_menu").hide();
            TEMPLAR.route("#node?label=publisher&uuid=" + encodeURIComponent(ui.item.value))  
            return false;
        }
    })
  
      $("#edition_publisher").autocomplete({
        scroll : true,
        source: function( request, response ) {
            $.ajax({
                /* Snip */
                data : { 
                    term : request.term
                },
                url: '/search?field=search_publishers',
                type: "get", //send it through get method
                success: function(data) {
                    response($.map(data, function(item) {
                        return {label : toTitleCase(decodeEntities(decodeEntities((item.label)))), value : item.value};
                    }))
                 }
            });
        },
        select : function(event, ui){
            $(".mobile_menu").hide();
            $("#edition_publisher").val(ui.item.label);
            return false;
        }
    })

     $(".search_sources_input").autocomplete({
        scroll : true,
        source: function( request, response ) {
            $.ajax({
                /* Snip */
                data : { 
                    term : request.term
                },
                url: '/search?field=search_sources',
                type: "get", //send it through get method
                success: function(data) {
                    response($.map(data, function(item) {
                        return {label : decodeEntities(decodeEntities((item.label))), value : item.value};
                    }))
                 }
            });
        },
        select : function(event, ui){
            $(".search_sources_input").val("")
            $(".mobile_menu").hide();
            TEMPLAR.route("#node?label=source&uuid=" + ui.item.value)     
            return false;
        }
    })

     $(".search_upload_sources_input").autocomplete({
        scroll : true,
        source: function( request, response ) {
            $.ajax({
                /* Snip */
                data : { 
                    term : request.term
                },
                url: '/search?field=search_sources',
                type: "get", //send it through get method
                success: function(data) {
                    response($.map(data, function(item) {
                        return {label : decodeEntities(decodeEntities((item.label))), value : item.value};
                    }))
                 }
            });
        },
        select : function(event, ui){
            $(".mobile_menu").hide()
            TEMPLAR.route("#upload?uuid=" + ui.item.value)               
        }
    })

     $(".search_authors_input").autocomplete({
        scroll : true,
        source: function( request, response ) {
            $.ajax({
                /* Snip */
                data : { 
                    term : request.term.split(",")[0]
                },
                url: '/search?field=search_authors',
                type: "get", //send it through get method
                success: function(data) {
                    response($.map(data, function(item) {
                        return {label : decodeEntities(decodeEntities((item.label))), value : item.value};
                    }))
                 }
            });
        },
        select : function(event, ui){
            $(".search_authors_input").val("")
            TEMPLAR.route("#node?label=author&uuid=" + ui.item.value)  
            return false;
        }
    })


     $(".search_upload_authors_input").autocomplete({
        scroll : true,
        source: function( request, response ) {
            $.ajax({
                /* Snip */
                data : { 
                    term : request.term.split(",")[0]
                },
                url: '/search?field=search_authors',
                type: "get", //send it through get method
                success: function(data) {
                    response($.map(data, function(item) {
                        return {label : decodeEntities(decodeEntities((item.label))), value : item.value};
                    }))
                 }
            });
        },
        select : function(event, ui){
            $(".mobile_menu").hide()
            $(".search_upload_authors_input").val("")
            addAuthor({uuid : ui.item.value, author : ui.item.label}) 
            return false;             
        }
    })

     $(".search_classes_input").autocomplete({
        scroll : true,
        source: function( request, response ) {
            $.ajax({
                /* Snip */
                data : { 
                    term : request.term.split(",")[request.term.split(",").length - 1]
                },
                url: '/search?field=search_classes',
                type: "get", //send it through get method
                success: function(data) {
                    response($.map(data, function(item) {
                        return {label : decodeEntities(decodeEntities((item.label))), value : item.value};
                    }))
                 }
            });
        },
        select : function(event, ui){
            $(".mobile_menu").hide()
            $(".search_classes_input").val("")
            TEMPLAR.route("#node?label=class&uuid=" + ui.item.value)    
            return false;
        }
    })
  
  
  
  

    $("#adv_title").autocomplete({
        scroll:true,
        source: function(request, response){
            $.ajax({
                data : {
                    term : request.term.split(",")[request.term.split(",").length - 1]
                },
                url: "/search?field=search_sources",
                type: "get",
                success: function(data){
                    response($.map(data, function(item){
                        return {label : decodeEntities(decodeEntities((item.label))), value: item.value}
                    }))
                }
            })
        },
        select: function(event,ui){
            $(".mobile_menu").hide();
            $("#adv_title").val($(this).val().substring(0, $(this).val().lastIndexOf(",")) + 
                ($(this).val().indexOf(",") > 1 ? ", " : "") + ui.item.label);
            return false;
        }
    })
  
  

    $("#adv_author").autocomplete({
        scroll:true,
        source: function(request, response){
            $.ajax({
                data : {
                    term : request.term.split(",")[request.term.split(",").length - 1]
                },
                url: "/search?field=search_authors",
                type: "get",
                success: function(data){
                    response($.map(data, function(item){
                        return {label : decodeEntities(decodeEntities((item.label))), value: item.value}
                    }))
                }
            })
        },
        select: function(event,ui){
            $(".mobile_menu").hide();
            $("#adv_author").val($(this).val().substring(0, $(this).val().lastIndexOf(",")) + 
                ($(this).val().indexOf(",") > 1 ? ", " : "") + ui.item.label);
            return false;
        }
    })


    $("#adv_classes").autocomplete({
        scroll:true,
        source: function(request, response){
            $.ajax({
                data : {
                    term : getCommaSplice("#adv_classes", request.term)
                },
                url: "/search?field=search_classes",
                type: "get",
                success: function(data){
                    response($.map(data, function(item){
                        return {label : decodeEntities(decodeEntities((item.label))), value: item.value}
                    }))
                }
            })
        },
        select: function(event,ui){
             $(".mobile_menu").hide()
            var arr = $("#adv_classes").val().split(",");
            arr[j] = ui.item.label;
            var value = arr.toString()
            $("#adv_classes").val(value)     
           return false;     
        }
    })
  
  

    $("#adv_publisher").autocomplete({
        scroll:true,
        source: function(request, response){
            $.ajax({
                data : {
                    term : request.term.split(",")[request.term.split(",").length - 1]
                },
                url: "/search?field=search_publishers",
                type: "get",
                success: function(data){
                    response($.map(data, function(item){
                        return {label : toTitleCase(decodeEntities(decodeEntities((item.label)))), value: item.value}
                    }))
                }
            })
        },
        select: function(event,ui){
            $(".mobile_menu").hide();
            $("#adv_publisher").val($(this).val().substring(0, $(this).val().lastIndexOf(",")) + 
                ($(this).val().indexOf(",") > 1 ? ", " : "") + ui.item.label);
            return false;
        }
    })

    $(".search_upload_classes_input").autocomplete({
        scroll : true,
        source: function( request, response ) {
            $.ajax({
                /* Snip */
                data : { 
                    term : getCommaSplice(".search_upload_classes_input", request.term)//request.term.split(",")[request.term.split(",").length - 1]
                },
                url: '/search?field=search_classes',
                type: "get", //send it through get method
                success: function(data) {
                    response($.map(data, function(item) {
                        return {label : decodeEntities(decodeEntities((item.label))), value : item.value};
                    }))
                 }
            });
        },
        select : function(event, ui){
            $(".mobile_menu").hide()
            var arr = $(".search_upload_classes_input").val().split(",");
            arr[j] = ui.item.label;
            var value = arr.toString()
            $(".search_upload_classes_input").val(value)     
           return false;         
        }
    })
}