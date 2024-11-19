define([
  'underscore',
  'backbone',
  '../models/ticketModel'
], function (_, Backbone, ticketModel) {

  var ticketCollection = Backbone.Collection.extend({
    clients_id: null,
    model: ticketModel,
    initialize: function () {

    },
    url: function () {
      return APIPATH + 'ticketList';
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

  return ticketCollection;

});