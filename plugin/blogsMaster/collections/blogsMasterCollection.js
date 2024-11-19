define([
  'underscore',
  'backbone',
  '../models/blogsMasterModel'
], function(_, Backbone,blogsMasterModel){

  var blogsMasterCollection = Backbone.Collection.extend({
      pageID:null,
      model: blogsMasterModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'blogsMasterList';
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

  return blogsMasterCollection;

});