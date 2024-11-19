define([
  'underscore',
  'backbone',
  '../models/opportunityModel'
], function(_, Backbone,opportunityModel){

  var opportunityCollection = Backbone.Collection.extend({
    opportunity_id:null,
      model: opportunityModel,
      loadstate: true,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'opportunityMasterList';
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

  return opportunityCollection;

});