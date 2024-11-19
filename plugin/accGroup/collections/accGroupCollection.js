define([
  'underscore',
  'backbone',
  '../models/accGroupModel'
], function(_, Backbone, accGroupModel){

  var accGroupCollection = Backbone.Collection.extend({
      accGroupID:null,
      model: accGroupModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'accGroupMasterList';
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

  return accGroupCollection;

});