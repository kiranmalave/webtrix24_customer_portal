define([
    'underscore',
    'backbone',
], function (_, Backbone) {

    var countryModel = Backbone.Model.extend({
        idAttribute: "state_id",
    });
    return countryModel;
});
