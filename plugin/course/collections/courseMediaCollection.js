define([
  'underscore',
  'backbone',
  '../models/readCourseMediaModel'
], function(_, Backbone,readCourseMediaModel){

  var courseMediaCollection = Backbone.Collection.extend({
      model: readCourseMediaModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'courseMediaCollection';
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

  return courseMediaCollection;

});