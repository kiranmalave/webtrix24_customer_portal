define([
  'underscore',
  'backbone',
  '../models/regionModel'
], function(_, Backbone,regionModel){

  var regionCollection = Backbone.Collection.extend({
      regionID:null,
      model: regionModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'regionList';
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

  return regionCollection;

});