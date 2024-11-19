define([
  'underscore',
  'backbone',
  '../models/categoryModel'
], function(_, Backbone,categoryModel){

  var categoryCollection = Backbone.Collection.extend({
    category_id:null,
      model: categoryModel,
      comparator: 'categories_index',
      initialize : function(){
      },
      url : function() {
        return APIPATH+'categoryMasterList';
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

  return categoryCollection;

});