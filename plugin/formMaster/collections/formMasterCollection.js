define([
  'underscore',
  'backbone',
  '../models/formMasterModel'
], function(_, Backbone,formMasterModel){

  var formMasterCollection = Backbone.Collection.extend({
      formID:null,
      model: formMasterModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'formMasterList';
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

  return formMasterCollection;

});