define([
  'underscore',
  'backbone',
  '../models/occasionModel'
], function (_, Backbone, occasionModel) {

  var occasionCollection = Backbone.Collection.extend({
    occasionID: null,
    model: occasionModel,
    initialize: function () {

    },
    url: function () {
      return APIPATH + 'OccasionMasterList';
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

  return occasionCollection;

});