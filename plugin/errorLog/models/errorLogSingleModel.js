define([
    'underscore',
    'backbone',
], function(_, Backbone) {
    var errorLogSingleModel = Backbone.Model.extend({
        idAttribute: "errorID",
        defaults: {
            errorID: null,
            heading: null,
            description: null,
            file: null,
            loginUser: null,
            lineNumber: null,
            function: null,
            deviceCall: null,
            ipAddress: null,
            errorTime: null,
            status: 'active',
        },
        urlRoot: function() {
            return APIPATH + 'errorLogMaster/';
        },
        parse: function(response) {
            return response.data[0];
        }
    });

    return errorLogSingleModel;
});
