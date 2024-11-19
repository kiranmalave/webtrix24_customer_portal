define([
  'underscore',
  'backbone',
  '../models/dynamicFormModel'
], function(_, Backbone,dynamicFormModel){

  var dynamicFormDataCollection = Backbone.Collection.extend({
    fieldID:null,
      model: dynamicFormModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'dynamicFormDataList';
      },
      parse : function(response){
        this.pageinfo = response.paginginfo;
        this.totalRecords = response.totalRecords;
        this.endRecords = response.end;
        this.flag = response.flag;
        this.msg = response.msg;
        this.loadstate = response.loadstate;
        return response.data;
      }
  });

  return dynamicFormDataCollection;

});