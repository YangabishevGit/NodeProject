define(['views/index'], function(indexView){
    const initialize = function(){
        indexView.render()
    }
    return {
        initialize:initialize
    }
})

define(['router'], function(router) {
    const initialize = function(){
        checkLogin(runApplication);
    };

    const checkLogin = function(callback) {
        $.ajax("/account/authenticated", {
            method: "GET",
            success: function() {
                return callback(true);
            },
            error: function(data) {
                return callback(false);
            }
        });
    };
    
    const runApplication = function(authenticated) {
        if (!authenticated) {
            window.location.hash = 'login';
        } else {
            window.location.hash = 'index';
        }
        Backbone.history.start();
    };
    
    return {
        initialize: initialize
}

})