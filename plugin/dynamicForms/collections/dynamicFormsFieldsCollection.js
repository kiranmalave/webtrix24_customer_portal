define([
    'underscore',
    'backbone',
    '../models/dynamicFormsModel'
  ], function (_, Backbone, dynamicFormsModel) {
  
    var dynamicFormsCollection = Backbone.Collection.extend({
      form_id: null,
      model: dynamicFormsModel,
      initialize: function () {
  
      },
      url: function () {
        return APIPATH + 'dynamicFormsFieldsList';
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
  
    return dynamicFormsCollection;
  
  });