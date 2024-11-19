define([
  'underscore',
  'backbone',
  '../models/formAnswerSingleModel'
], function(_, Backbone,formAnswerSingleModel){

  var formAnsSingleCollection = Backbone.Collection.extend({
      qaID:null,
      model: formAnswerSingleModel,
      initialize : function(){
      },
      url : function() {
        return APIPATH+'formAnsSingleList';
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

  return formAnsSingleCollection;

});