define([
  'underscore',
  'backbone',
  '../models/courseModel'
], function(_, Backbone,courseModel){

  var courseCollection = Backbone.Collection.extend({
      course_id:null,
      model: courseModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'courseMasterList';
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

  return courseCollection;

});