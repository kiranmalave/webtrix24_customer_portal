define([
    'underscore',
    'backbone',
], function (_, Backbone) {

    var countryModel = Backbone.Model.extend({
        idAttribute: "city_id",
    });
    return countryModel;
});
