define([
    'underscore',
    'backbone',
], function (_, Backbone) {

    var columnModel = Backbone.Model.extend({
        idAttribute: "column_id",
    });
    return columnModel;
});
