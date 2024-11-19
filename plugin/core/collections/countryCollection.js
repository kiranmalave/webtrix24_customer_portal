define([
    'underscore',
    'backbone',
    '../models/countryModel'
], function (_, Backbone, countryModel) {

    var countryCollection = Backbone.Collection.extend({
        country_id: null,
        model: countryModel,
        initialize: function () {

        },
        url: function () {
            return APIPATH + 'getCountryList';
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