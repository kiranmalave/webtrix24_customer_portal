define([
  'underscore',
  'backbone',
  '../models/filterModel'
], function(_, Backbone,filterModel){

  var filterCollection = Backbone.Collection.extend({
      filter_id:null,
      model: filterModel,
      initialize : function(){
      },
      url : function() {
        return APIPATH+'filterMasterList';
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

  return filterCollection;

});