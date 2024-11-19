define([
  'underscore',
  'backbone',
  '../models/formMasterQuestionsSections'
], function(_, Backbone,formMasterQuestionsSections){

  var formMaterSectionCollection = Backbone.Collection.extend({
      formID:null,
      model: formMasterQuestionsSections,
      initialize : function(){

      },
      url : function() {
        return APIPATH+'formMasterQuestionSectionsList';
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

  return formMaterSectionCollection;

});