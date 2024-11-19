define([
  'underscore',
  'backbone',
  '../models/lessonModel'
], function(_, Backbone,lessonModel){

  var lessonsCollection = Backbone.Collection.extend({
      lesson_id:null,
      course_id:null,
      model: lessonModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'lessonsList/'+this.course_id;
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

  return lessonsCollection;

});