/*
 *  main.js
 *  -------
 *  Handles utility functions and single-run functions.
 *
 */

// rpg namespace
(function() {
    var rpg = {
        // rpg.models contains all our models, added as they are created
        models: [],
        // rpg.views contains all our views, added as they are created
        views: [],
        // rpg.collections contains all our collections, added as they are created
        collections: [],
        /* rpg.save_field:
         *  Saves a particular field with it's new value to the relevant model.
         */
        save_field: function(modelname,modelid,attribute,value) {
            console.log("modelname: "+modelname);
            console.log("modelid: "+modelid);
            console.log("attribute: "+attribute);
            console.log("value: "+value);
            rpg.models[modelname][modelid].set(attribute,value);
            rpg.models[modelname][modelid].save();
        },
        /* rpg.delete_field:
         *  Deletes a particular field on the server side. Triggers removal from DOM.
         */
        delete_field: function(modelname,modelid,attribute) {
            ppg.models[modelname][modelid].destroy();
        },
        /* rpg.string_to_model:
         *  Takes a string name of a model (lowercase). Returns the model
         *  class ready to instantiate.
         */
        string_to_model: function(modelname) {
            switch(modelname) {
                case 'player':
                    return Player;
                break;
                case 'character':
                    return Character;
                break;
                case 'statgroup':
                    return StatGroup;
                break;
                case 'stat':
                    return Stat;
                break;
                case 'characterstat':
                    return CharacterStat;
                break;
                case 'gamestat':
                    return GameStat;
                break;
                case 'event':
                    return Event;
                break;
                case 'place':
                    return Place;
                break;
                case 'faction':
                    return Faction;
                break;
                case 'session':
                    return Session;
                break;
                case 'sessionpoint':
                    return SessionPoint;
                break;
                case 'plotline':
                    return Plotline;
                break;
                case 'note':
                    return Note;
                break;
            }
        },
        /* rpg.backbone:
         *  Sets up backbone.js by running through the page and creating
         *  Models, Views and Collections.
         */
        backbone: function () {
            // Iterate through our Views
            $(".model-view").each(function() {
                rpg.backbone_view($(this));
            });

            // Iterate through our Collections
            $(".model-collection").each(function() {
                var collection_element = $(this);
                var collection_name = $(this).attr('data-collection');
                var label = $(this).attr('data-label');
                var parent_id = $(this).attr('data-parentid');
                var parent_modelname = $(this).attr('data-parentmodel');
                var item_modelname = $(this).attr('data-itemmodel');
                var modelClass = rpg.string_to_model(item_modelname);

                // Create unique identifier
                var unique = parent_modelname + '-' + parent_id + '-' + item_modelname;

                if(typeof rpg.collections[unique] == "undefined") {
                    var collection = new collections.Collection({model: modelClass, id: parent_id, modelname: parent_modelname});

                    // Note: This might be dodgy as I've hade no success with this kind of jQuery before. Currently collections don't do anything, so that's fine.
                    $(this).find(".model-view").not(".model-collection .model-model-collection .model-view").each(function() {
                        var modelname = $(this).attr('data-model');
                        var id = $(this).attr('data-id');
                        if(modelname == item_modelname) {
                            collection.add(rpg.models[modelname][id]);
                        }
                    });
                    rpg.collections[unique] = collection;
                }
            });

            // Views are created as silent to reduce re-render initially, make them live again
            for(var viewname in rpg.views) {
                for(var i in rpg.views[viewname]) {
                    rpg.views[viewname][i].silent=false;
                }
            }
        },
        backbone_view: function(view) {
            var view_element = view;
            var modelname = view.attr('data-model');
            var viewname = view.attr('data-view');
            var id = view.attr('data-id');
            var modelClass = rpg.string_to_model(modelname);
            var viewClass = window.views[viewname];
 
            // If rpg.models[modelname] does not exist, create it
            if(typeof rpg.models[modelname] == "undefined") {
                rpg.models[modelname] = {};
            }
            // If rpg.views[viewname] does not exist, create it
            if(typeof rpg.views[viewname] == "undefined") {
                rpg.views[viewname] = [];
            }
            // If rpg.models[modelname][id] does not exist, create it
            // Creation of the actual model happens here
            if(typeof rpg.models[modelname][id] === "undefined") {
                var model = new modelClass({id: id});
                rpg.models[modelname][id] = model;
 
                // Fill the model with proper data, this means a bit of nasty   processing at the start of a page but it's not so bad.
                model.fetch();
            } else {
                // Model already exists, use that, we keep only one copy
                model = rpg.models[modelname][id];
            }
 
            // Create the view and throw it on our view-stack (rpg.views)
            var view = new viewClass({el: view_element, model: model});
            rpg.views[viewname].push(view);
            return view;
        },

        /* rpg.init:
         *  Initializes a bunch of enhancements. One time thing.
         */
        init: function() { // Run only once
            // Bind event for closing popovers
            rpg.events.global.close_popups();
            // Bind event for submitting fields
            rpg.events.global.submit_field();
            // Bind events for hovers and clicks on local items
            // Possibly replaceable with delegate style events
            rpg.bind_local_events();

            // Improve tables by adding quicksort filtering
            $(".filter-table").each(function() {
                rpg.table_filter($(this));
            });

            rpg.enhance_datefields();

            rpg.enhance_timefields();

            // Add JQuery Multi-Select to multiselect fields
            $("select").each(function() {
                if($(this).attr('multiple') == 'multiple') {
                    var id = $(this).attr('id');
                    $(this).multiSelect({
                        selectableHeader: 'Options<br /><input id="ms-filter-'+id+'" type="text" class="filter-multi span2" autocomplete="off" placeholder="Filter options">',
                        selectedHeader: 'Selected<br /><input id="ms-filter2-'+id+'" type="text" class="filter-multi-selected span2" autocomplete="off" placeholder="Filter selected">',
                        keepOrder: true
                    });

                    var selectelement = $(this);
                    selectelement.siblings().find(".ms-selectable .filter-multi").quicksearch(selectelement.siblings().find(".ms-selectable .ms-list  li"));
                    selectelement.siblings().find(".ms-selection .filter-multi-selected").quicksearch(selectelement.siblings().find(".ms-selection .ms-list  li"));
                    $(this).siblings(".helptext").hide();

                    // Covers two different layouts output by Django as default
                    if(selectelement.parent().hasClass('controls')) {
                        parentelement = selectelement.parent().parent();
                    } else {
                        parentelement = selectelement.parent();
                    }

                    parentelement.addClass("relation-set");
//.addClass("span6");

                    var container = parentelement.find('.ms-container');
//                    container.addClass('accordion-body').addClass('collapse');
                    var label = parentelement.find('label');
//                    label.addClass('accordion-toggle').attr('data-toggle','collapse').attr('data-target','ms-'+selectelement.attr('id'));
//                    label.append('<span class=""></span>');
                    label.text(label.text().replace(':',' relations'));
//                    label.click(function() {
//                        container.collapse('toggle');
//                    });


                }
            });
            $("#item-form .relation-set").wrapAll('<div class="relations-wrapper well"><div class="collapsible collapse"></div></div>');
            console.log("Ran!");
            relwrapper = $("#item-form .relations-wrapper");
            relwrapper.prepend('<div class="btn accordion-toggle" data-toggle="collapse" data-title="Click to manage relations"><strong>Relations</strong> <span class="caret"></span></div>');
            relheader = relwrapper.find(".accordion-toggle");
            relheader.tooltip();
            relcollapse = relwrapper.find(".collapsible");
            console.log(relheader);
            console.log(relcollapse);
            relheader.click(function () {
                relcollapse.collapse('toggle');
            });

            rpg.timeline();
        },
        /* rpg.bind_local_event:
         *  Can be extended to support more than mode-field elements.
         */
        bind_local_event: function(element) {
            if($(element).is('.model-field')) { 
                var field = $(element);
                var type = field.attr('data-type');
                var attribute = field.attr('data-attribute');
                var view_element = field.closest('.model-view');
                var modelname = view_element.attr('data-model');
                var modelid = view_element.attr('data-id');
                var model = rpg.models[modelname][modelid];

                // Initialize field element, check backbone/fields.js for implementations
                console.log('rpg.fields.field_'+type+'.init:');
                console.log(typeof(rpg.fields['field_'+type].init));
                if(typeof(rpg.fields['field_'+type].init) == "function") {
                    rpg.fields['field_'+type].init(field, modelname, modelid);
                } else { // If not defined, go with default behavior
                    rpg.fields.field_default.init(field, modelname, modelid);
                }
            }
        },
        // Binds local events for each field
        bind_local_events: function() {
            $(".model-field").each(function () {
                rpg.bind_local_event(this);
            });
        },
        // Runs through views and render fields
        render_all: function() {
            for(var i in rpg.views) {
                for(var j in rpg.views[i]) {
                    rpg.render(rpg.views[i][j]);
                }
            }
        },
        /* rpg.render:
         *  Render a particular view.
         */
        render: function(view) {
            var modelname = $(view.el).attr('data-model');
            if(modelname == 'event' && $("#timeline").length > 0) {
                rpg.timeline_refresh();
            }
            var id = $(view.el).attr('data-id');
            $(view.el).find(".model-field[data-view-model="+modelname+"][data-view-id="+id+"]").each(function() {
                var field = $(this);
                var type = field.attr('data-type');
                var attribute = field.attr('data-attribute');
                // Types with special display requirements are added here.
                if(typeof(rpg.fields['field_'+type].render) == 'function') {
                    rpg.fields['field_'+type].render(view, attribute, field);
                } else {
                    rpg.fields.field_default.render(view, attribute, field);
                }
            });
        },
        enhance_datefields: function () {
            // Improve datefields for events (or any named date)
            $("input#id_date, input.datepicker").each(function() {
                var field = $(this);
                if(field.attr("type") == 'text' && field.attr('name') == 'date') {
                    rpg.datepicker(field);
                }
            });
        },
        enhance_timefields: function () {
            // Add placeholder for timefields
            $("input#id_time, input.time").each(function() {
                var field = $(this);
                if(field.attr("type") == 'text' && field.attr('name') == 'time') {
                    rpg.timefield(field);
                }
            });
        },
        datepicker: function(field) {
            var today = new Date();
            day = today.getDate();
            month = today.getMonth()+1;
            year = today.getFullYear();
            if(day < 10) {
                day = '0'+day;
            }
            if(month < 10) {
                month = '0'+month;
            }

            // Might act wonky if year is below 999, no idea if the datepicker will work for that either way
            if(!field.val()) {
                field.val(year+'-'+month+'-'+day);
            }

            field.datepicker({
                format: 'yyyy-mm-dd',
                weekStart: 1,
            });
        },
        timefield: function(field) {
            field.attr('placeholder','23:59 (example)');
        },
        table_filter: function(table) {
            table.before('<input type="text" class="table-filter input-small search-query" placeholder="Filter" value="" />');
            table.parent().find('.table-filter').quicksearch(table.find('tbody tr'));
        },
        timeline: function() {
            $("#timeline-filter .datepicker").each(function() {
                rpg.datepicker($(this));
            });
            $("#timeline-filter").submit(function(e) {
                e.preventDefault();
                var data = $(this).serialize();
                $.post($(this).attr('action'),data,function (response) {
                    $("#timeline").html(response);
                });
            });
        },
        timeline_refresh: function() {
        // Not working
/*            rpg.views = {};
            $("#timeline-filter").submit();
            $("#timeline .model-view").each(function () {
                var view = rpg.backbone_view($(this));
                view.silent = false;
                $(this).find(".model-field").each(function () {
                    rpg.bind_local_event($(this));
                });
            });
            rpg.enhance_datefields();*/
        }
    }; // Our namespace variable

    window.rpg = rpg; // Make it global
})();

$(document).ready(function () {
   rpg.backbone();
   rpg.init();
});

Aloha.ready(function() {
    console.log("Triggering Aloha!");
    /*Aloha.settings = {
        editables: '#id_description',
        sidebar: {
            disabled: true
        },
    };*/
    var editables = Aloha.jQuery('#id_description');
    //Aloha.settings.sidebar = {disabled: true};
    if(editables.length > 0) {
        Aloha.jQuery(editables).aloha();
    }
    $(".aloha-sidebar-bar").remove();
    Aloha.bind('aloha-smart-content-changed', function() {
        rpg.events.alohaeditor_change(Aloha.getActiveEditable().obj);
    });
});
