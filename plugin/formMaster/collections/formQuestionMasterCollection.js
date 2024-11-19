define([
  'underscore',
  'backbone',
  '../models/formMasterQuestionModelForCollection'
], function(_, Backbone,formMasterQuestionModelForCollection){

  var formQuestionMasterCollection = Backbone.Collection.extend({
      questionID:null,
      model: formMasterQuestionModelForCollection,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'formQuestionMasterList';
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

  return formQuestionMasterCollection;

});