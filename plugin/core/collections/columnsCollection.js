define([
    'underscore',
    'backbone',
    '../models/columnModel'
], function (_, Backbone, columnModel) {

    var columnsCollection = Backbone.Collection.extend({
        country_id: null,
        model: columnModel,
        initialize: function () {

        },
        url: function () {
            return APIPATH + 'getDefinations';
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

    return columnsCollection;

});