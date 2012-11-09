rpg.templates = {};

rpg.templates.empty = _.template('-- empty --');

rpg.templates.field = {};

rpg.templates.popover = {};

rpg.templates.popover.text = _.template('' +
'<form action="#" method="post">' +
        '<input type="text" class="value span2" value="<%- value %>" />' +
    '<div class="btn-group">' +
    '<button type="submit" class="btn btn-mini btn-warning save-field">' +
    '<i class="icon icon-pencil"></i> Save</button>' +
    '<div class="add-on btn btn-mini close-popover"><i class="icon icon-remove"></i> Close</div>' +
    '</div>' +
'</form>' +

'<span class="meta" style="display: none;" data-model="<%- model %>" data-id="<%- model_id %>" data-attribute="<%- attribute %>"></span>');

rpg.templates.popover.textarea = _.template('' +
'<form action="#" method="post">' +
    '<textarea class="span2 value input-mini" rows="3"><%= value %></textarea>' +
    '<div class="btn-group">' +
    '<button type="submit" class="btn btn-mini btn-warning save-field">' +
    '<i class="icon icon-pencil"></i> Save</button>' +
    '<div class="add-on btn btn-mini close-popover"><i class="icon icon-remove"></i> Close</div>' +
    '</div>' +'</form>' +
'<span class="meta" style="display: none;" data-model="<%- model %>" data-id="<%- model_id %>" data-attribute="<%- attribute %>"></span>');

