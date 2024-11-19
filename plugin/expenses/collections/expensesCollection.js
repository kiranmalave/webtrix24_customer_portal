define([
  'underscore',
  'backbone',
  '../models/expensesModel'
], function (_, Backbone, expensesModel) {

  var expensesCollection = Backbone.Collection.extend({
    clients_id: null,
    model: expensesModel,
    initialize: function () {

    },
    url: function () {
      return APIPATH + 'expenseList';
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

  return expensesCollection;

});