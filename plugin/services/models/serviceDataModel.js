define([
    'underscore',
    'backbone',
], function (_, Backbone) {

    var serviceDataModel = Backbone.Model.extend({
        idAttribute: "service_id",
        defaults: {
            service_id: null,
        },
        urlRoot: function () {
            return APIPATH + 'serviceGallery/'
        },
        parse: function (response) {
            return response.data[0];
        }
    });
    return serviceDataModel;
});  