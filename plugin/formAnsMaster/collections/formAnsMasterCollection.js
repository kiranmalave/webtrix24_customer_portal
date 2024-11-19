define([
  'underscore',
  'backbone',
  '../models/formAnsMasterModel'
], function(_, Backbone,formAnsMasterModel){

  var formAnsMasterCollection = Backbone.Collection.extend({
      qaID:null,
      model: formAnsMasterModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'formAnsMasterList';
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

  return formAnsMasterCollection;

});