define([
  'underscore',
  'backbone',
  '../models/ourClientsModel'
], function (_, Backbone, ourClientsModel) {

  var ourClientsCollection = Backbone.Collection.extend({
    clients_id: null,
    model: ourClientsModel,
    initialize: function () {

    },
    url: function () {
      return APIPATH + 'ourClientsList';
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

  return ourClientsCollection;

});