define([
    'underscore',
    'backbone',
], function (_, Backbone) {

    var projectNoteSingleModel = Backbone.Model.extend({
        idAttribute: "note_id",
        defaults: {
            note_id: null,
            project_id: null,
            record_type: null,
            note_desc: null,
            title: null,
            reminder_date: null,
            reminder_time: null,
        },
        urlRoot: function () {
            return APIPATH + 'projectMaster/Note'
        },
        parse: function (response) {
            return response.data[0];
        }
    });
    return projectNoteSingleModel;
});
