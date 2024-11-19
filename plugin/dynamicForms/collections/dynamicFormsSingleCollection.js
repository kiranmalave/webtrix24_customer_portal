define([
    'underscore',
    'backbone',
    '../models/dynamicFormsSingleModel'
  ], function (_, Backbone, dynamicFormsSingleModel) {
  
    var dynamicFormsSingleCollection = Backbone.Collection.extend({
      form_id: null,
      model: dynamicFormsSingleModel,
      initialize: function () {
  
      },
      url: function () {
        return APIPATH + 'dynamicFormsData';
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
  
    return dynamicFormsSingleCollection;
  
  });