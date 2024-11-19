define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var formMasterSingleModel = Backbone.Model.extend({
    idAttribute: "questionID",
     defaults: {
        questionID:null,
        formID:null,
        question:null,
        fieldName:null,
        fieldType:null,
        questionFieldsValues:null,
        formQuestionImage:null,
        uploadFormQuestionImage:null,
        createdBy:null,
        modifiedBy:null, 
        createdDate:null,
        modifiedDate:null,
        status:'active',
    },
  	urlRoot:function(){
      return APIPATH+'formQuestionMaster/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return formMasterSingleModel;
});
