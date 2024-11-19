define([
  'underscore',
  'backbone',
  '../models/pushServiceModel'
], function(_, Backbone,pushServiceModel){

  var pushServiceCollection = Backbone.Collection.extend({
    push_service_id:null,
      model: pushServiceModel,
      initialize : function(){
      },
      url : function() {
        return APIPATH+'pushServiceMasterList';
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

  return pushServiceCollection;

});