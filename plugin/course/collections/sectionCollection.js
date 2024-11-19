define([
  'underscore',
  'backbone',
  '../models/sectionModel'
], function(_, Backbone,sectionModel){

  var sectionCollection = Backbone.Collection.extend({
      section_id:null,
      course_id:null,
      model: sectionModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'sectionMasterList/'+this.course_id;
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

  return sectionCollection;

});