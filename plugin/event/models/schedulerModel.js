define([
    'underscore',
    'backbone',
], function (_, Backbone) {

    var avablitySingleModel = Backbone.Model.extend({
        idAttribute: "schedule_detail_id",
        defaults: {
            schedule_detail_id: null,
            schedule: null,
            event_id: null,
            event_scheduler: null,
            override_dates:null,
            created_by: null,
            modified_by: null,
            created_date: null,
            modified_date: null,
        },
        urlRoot: function () {
            return APIPATH + 'eventschedulerdetails/'
        },
        parse: function (response) {
            return response.data[0];
        }
    });
    return avablitySingleModel;
});
