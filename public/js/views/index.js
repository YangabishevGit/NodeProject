define(['text!templates/index.html'], function(indexTemplate){
    const indexVIew = Backbone.View.extend({
        el: $('#content'),

        render: function(){
            this.$el.html(indexTemplate);
        }
    });

    return new indexVIew;
});