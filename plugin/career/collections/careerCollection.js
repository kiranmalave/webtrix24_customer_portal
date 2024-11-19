define([
  'underscore',
  'backbone',
  '../models/careerModel'
], function(_, Backbone,careerModel){

  var careerCollection = Backbone.Collection.extend({
    job_id :null,
      model: careerModel,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'careerMasterList';
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

  return careerCollection;

});