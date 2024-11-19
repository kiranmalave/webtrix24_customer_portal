define([
    'underscore',
    'backbone',
], function (_, Backbone) {

    var countryModel = Backbone.Model.extend({
        idAttribute: "country_id",
    });
    return countryModel;
});
