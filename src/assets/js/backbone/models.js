function urlPrototype() {
    var base = location.protocol + '//' + location.host + '/rest/'+this.item_type()+'/';
    if(this.isNew()) {
        return base;
    } else {
        return base + this.id;
    }
}

// this can be used to manipulate responses if your server side
// and client side clash too much
// Better to fix on serverside.
function parsePrototype(response) {
    return response;
}

Note = Backbone.Model.extend({
    url: urlPrototype,
    parse: parsePrototype,
    item_type: function() {
        return 'note';
    }
});

