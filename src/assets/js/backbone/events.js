/*
 *  events.js
 *  ---------
 *  Handles events of all sorts except internal backbone.js bindings.
 *
 */

rpg.events = {}

rpg.events.global = {};

/*
 * rpg.events.global.submit_field:
 *  Binds all model-field submit buttons to trigger submission of data to the server.
 */
rpg.events.global.submit_field = function() {
    $("body").on("submit", ".popover form", save);
    $("body").on("click", ".popover .save-field", save);

    function save(e) {
        e.preventDefault();
        var popover = $(this).closest(".popover");
        var meta = popover.find(".meta");
        var value_element = popover.find(".value");
        var modelname = meta.attr('data-model');
        var modelid = meta.attr('data-id');
        var attribute = meta.attr('data-attribute');
        switch(value_element.attr('type')) {
            case 'submit':
                var val = $(this).attr('data-current');
                if(val !== "false") {
                    var value = false;
                } else {
                    var value = true;
                }
            break;
            default:
                var value = value_element.val();
        }

        rpg.save_field(modelname,modelid,attribute,value);
        $(".popover").fadeOut();
    }
}

/*
 * rpg.events.global.close_popups:
 *  Bind all close-buttons to kill all the popups.
 *  Might be extended towards modals as well.
 */
rpg.events.global.close_popups = function() {
    $("body").on("click", ".popover .close-popover", function() {
        $(".popover").hide();
    });
    $(document).keyup(function(e) {
      if (e.keyCode == 27) { $('.popover').hide(); }   // esc
    });
}

/*
 * rpg.events.field_hover_edit:
 *  Bind all model-fields for the hover-edit-functionality.
 */
rpg.events.field_hover_edit = function(field) {
    field.hoverIntent({
        over: function() {
            field.addClass('outline');
            if(typeof field.attr('data-deletable') != "undefined") {
                field.append('<span class="edit-delete-button icon icon-remove"></span>');
                var title = 'Click to edit / X to delete';
            } else {
                var title= 'Click to edit';
            }

            if(field.attr('data-type') == 'textarea') {
                var position = 'bottom';
            } else {
                var position = 'top';
            }

            field.tooltip({
                trigger: 'manual',
                title: title,
                placement: position
            });

            field.tooltip('show');

        },
        timeout: 150,
        out: function() {
            field.removeClass('outline');
            field.tooltip('hide');
            if(field.attr('data-deletable') !== 'undefined') {
                field.find('.edit-delete-button').remove();
            }
        }
    });
    field.click(function () {
        field.tooltip('hide');
    });
}

/*
 * rpg.events.field_click_popover:
 *  Binds model-field to open popover with fancy widgets on click.
 */
rpg.events.field_click_popover = function(field,modelname,modelid) {
    console.log("Triggered...");
    var attribute = field.attr('data-attribute');
    var model = rpg.models[modelname][modelid];
    var value = function () { return rpg.models[modelname][modelid].get(attribute); }
    var type = field.attr('data-type');
    
    if(typeof(rpg.fields['field_'+type].editor) == 'function') {
        rpg.fields['field_'+type].editor(field, modelname, modelid, attribute, value);
    } else {
        rpg.fields.field_default.editor(field, modelname, modelid, attribute, value);
    }
}

rpg.events.alohaeditor = function (field, modelname, modelid) {
    Aloha.jQuery(field).aloha();
}

rpg.events.alohaeditor_change = function(field) {
    console.log("Change");
    console.log(field);
    console.log("HTML: " + field.html());
    var modelname = field.attr('data-view-model');
    var modelid = field.attr('data-view-id');
    var attribute = field.attr('data-attribute');
    rpg.save_field(modelname,modelid,attribute,field.html());
}
