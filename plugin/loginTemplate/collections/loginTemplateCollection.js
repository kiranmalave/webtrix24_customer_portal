define([
    'underscore',
    'backbone',
    '../models/loginTemplateModel'
], function(_, Backbone, loginTemplateModel) {
    var loginTemplateCollection = Backbone.Collection.extend({
        slide_id: null,
        model: loginTemplateModel,
        initialize: function() {
           
        },
        url: function() {
            return APIPATH + 'templateMasterList';
        },
        parse: function(response) {
            this.pageinfo = response.paginginfo;
            this.totalRecords = response.totalRecords;
            this.endRecords = response.end;
            this.flag = response.flag;
            this.msg = response.msg;
            this.loadstate = response.loadstate;
            return response.data;
        }
    });

    return loginTemplateCollection;
});
