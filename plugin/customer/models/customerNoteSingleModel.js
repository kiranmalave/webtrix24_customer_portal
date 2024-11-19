define([
    'underscore',
    'backbone',
], function (_, Backbone) {

    var customerNoteSingleModel = Backbone.Model.extend({
        idAttribute: "note_id",
        defaults: {
            note_id: null,
            customer_id: null,
            note_desc: null,
            title: null,
            reminder_date: null,
            reminder_time: null,
        },
        urlRoot: function () {
            return APIPATH + 'customerMaster/Note'
        },
        parse: function (response) {
            return response.data[0];
        }
    });
    return customerNoteSingleModel;
});
