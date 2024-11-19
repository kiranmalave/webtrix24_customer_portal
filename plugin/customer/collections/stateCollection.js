define([
    'underscore',
    'backbone',
    '../models/stateModel'
], function (_, Backbone, stateModel) {

    var countryCollection = Backbone.Collection.extend({
        country_id: null,
        model: stateModel,
        initialize: function () {

        },
        url: function () {
            return APIPATH + 'getStateList';
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

    return countryCollection;

});