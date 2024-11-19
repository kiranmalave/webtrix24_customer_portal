define([
    'underscore',
    'backbone',
], function(_, Backbone) {
    var loginTemplateSingleModel = Backbone.Model.extend({
        idAttribute: "slide_id",
        defaults: {
            slide_id: null,
            title: null,
            description: null,
            image: null,
            // created_by: null,
            // modified_by: null,
            // created_date: null,
            // modified_date: null,
            status: 'active',
        },
        urlRoot: function() {
            return APIPATH + 'loginTemplate/';
        },
        parse: function(response) {
            return response.data[0];
        }
    });

    return loginTemplateSingleModel;
});
