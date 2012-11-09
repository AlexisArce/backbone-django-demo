(function () {
    var views = {
    };

    window.views = views;
})();

function urlBase() {
    return location.protocol + '//' + location.host + '/';
}

views.ModelView = Backbone.View.extend({
    // Needs to be bound to #page
    render: function() {
        console.log('Render called');
        //console.log(this);
        if(this.silent) {
            console.log("Render surpressed");
        } else {
            console.log("Rendered");
            rpg.render(this);
        }
    },

    initialize: function(options) {
        this.silent = true;
        this.model.bind('change',this.render,this);
        this.model.bind('destroy',this.remove,this);
    }
});
