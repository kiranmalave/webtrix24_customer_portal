define([
    'underscore',
    'backbone',
    '../models/readFilesModel'
], function (_, Backbone, readFilesModel) {

    var adminMediaCollection = Backbone.Collection.extend({
        menuID: null,
        //model: adminMediaFilesModel,
        initialize: function () {

        },
        url: function () {
            return APIPATH + 'adminMediaCollection';
        },
        parse: function (response) {
            this.pageinfo = response.paginginfo;
            this.totalRecords = response.totalRecords;
            this.endRecords = response.end;
            this.flag = response.flag;
            this.msg = response.msg;
            this.loadstate = response.loadstate;
            return response.data;
        }
    });
    return adminMediaCollection;

});