define([
  'underscore',
  'backbone',
  '../models/servicesModel'
], function (_, Backbone, servicesModel) {

  var servicesCollection = Backbone.Collection.extend({
    service_id: null,
    model: servicesModel,
    initialize: function () {

    },
    url: function () {
      return APIPATH + 'servicesMasterList';
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

  return servicesCollection;

});