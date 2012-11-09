rpg.render.defaultvalue = function(view,attribute,field) {
    var value = view.model.get(attribute);
    if(typeof value === "undefined" || value == null || value.length == 0) {
        field.html(rpg.templates.empty());
    } else {
        field.html(view.model.get(attribute));
    }
}

