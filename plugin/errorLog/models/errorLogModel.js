define([
    'underscore',
    'backbone',
], function(_, Backbone) {
    var errorLogModels = Backbone.Model.extend({
        idAttribute: "errorID",
    });
    return errorLogModels;
});