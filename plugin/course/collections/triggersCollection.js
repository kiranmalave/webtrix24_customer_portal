define([
  'underscore',
  'backbone',
  '../models/courseSingleTrigger'
], function(_, Backbone,courseSingleTrigger){

  var triggersCollection = Backbone.Collection.extend({
      course_id:null,
      model: courseSingleTrigger,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'triggersList';
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

  return triggersCollection;

});