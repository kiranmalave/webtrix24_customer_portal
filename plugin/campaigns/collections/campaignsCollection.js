define([
  'underscore',
  'backbone',
  '../models/campaignsModel'
], function(_, Backbone,campaignsModel){

  var campaignsCollection = Backbone.Collection.extend({
      campaignsID:null,
      model: campaignsModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'campaignsMasterList';
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

  return campaignsCollection;

});