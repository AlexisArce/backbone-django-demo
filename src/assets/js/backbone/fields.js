rpg.fields = {};

// Defaults
// Called if the field does not define it's own function
rpg.fields.field_default = {
    init: function (field, modelname, modelid) {
        rpg.events.field_hover_edit(field);
        rpg.events.field_click_popover(field,modelname,modelid);
    },
    editor: function (field, modelname, modelid, attribute, value) {
        field.popover({
            html: true,
            content: function() {
                if(typeof field.attr('data-widget') === "undefined") {
                    return rpg.templates.popover[field.attr('data-type')]({
                        value: value(),
                        model: modelname,
                        model_id: modelid,
                        attribute: attribute
                    });
                } else {
                    return rpg.templates.popover[field.attr('data-type')+'_'+field.attr('data-widget')]({
                        value: value(),
                        model: modelname,
                        model_id: modelid,
                        attribute: attribute
                    });
                }
            },
            placement: 'bottom',
            trigger: 'manual'
        });

        field.click(function() {
            field.popover('show');
            $(".popover:visible").addClass('popover-field');
            $(".popover:visible .value").focus();
        });
    },
    render: function (view, attribute, field) {
        rpg.render.defaultvalue(view,attribute,field);
    }
}

// Text
// A simple text field. Pure defaults
rpg.fields.field_text = {};

// Textarea
// A text-area edited with Aloha-editor
rpg.fields.field_textarea = {
    init: function (field, modelname, modelid) {
        rpg.events.field_hover_edit(field);
        rpg.events.alohaeditor(field,modelname,modelid);
    },
    render: function (view, attribute, field) {
        if(field.is('.aloha-editable-active')) {
            if($("#save-notify").length == 0) {
                $("body").append('<div id="save-notify" class="alert alert-success">Saved</div>');
                setTimeout(function(){
                    $("#save-notify").remove();
                },1500);
            }
        } else {
            rpg.render.defaultvalue(view,attribute,field);
        }
    }
}

