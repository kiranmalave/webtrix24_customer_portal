define([
    'underscore',
    'backbone',
], function (_, Backbone) {

    var customerActivityModel = Backbone.Model.extend({
        idAttribute: "history_id",
    });
    return customerActivityModel;
});
