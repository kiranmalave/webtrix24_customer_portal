define([
    'underscore',
    'backbone',
    '../models/cityModel'
], function (_, Backbone, cityModel) {

    var countryCollection = Backbone.Collection.extend({
        city_id: null,
        model: cityModel,
        initialize: function () {

        },
        url: function () {
            return APIPATH + 'getCityList';
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