define([
    'underscore',
    'backbone',
    '../models/customerActivityModel'
], function (_, Backbone, customerActivityModel) {

    var customerActivityCollection = Backbone.Collection.extend({
        history_id: null,
        model: customerActivityModel,
        initialize: function () {

        },
        url: function () {
            return APIPATH + 'customerMasterList/Activity';
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

    return customerActivityCollection;

});