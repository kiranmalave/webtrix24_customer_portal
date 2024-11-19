define([
  'underscore',
  'backbone',
  '../models/pagesMasterModel'
], function(_, Backbone,pagesMasterModel){

  var pagesMasterCollection = Backbone.Collection.extend({
      pageID:null,
      model: pagesMasterModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'pagesMasterList';
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

  return pagesMasterCollection;

});