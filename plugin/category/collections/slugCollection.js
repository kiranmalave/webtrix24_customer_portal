define([
  'underscore',
  'backbone',
  '../models/categoryModel'
], function(_, Backbone,categoryModel){

  var slugCollection = Backbone.Collection.extend({
      category_id:null,
      slug:null,
      model: categoryModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'categorySlugList';
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

  return slugCollection;

});