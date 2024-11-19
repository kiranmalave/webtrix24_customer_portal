define([
    'underscore',
    'backbone',
    '../models/errorLogModel'
], function(_, Backbone, errorLogModel) {
    var errorLogCollection = Backbone.Collection.extend({
        slide_id: null,
        model: errorLogModel,
        initialize: function() {
           
        },
        url: function() {
            return APIPATH + 'errorLogMasterList';
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
    return errorLogCollection;
});
