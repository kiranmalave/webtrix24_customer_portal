define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var formAnswerSingleModel = Backbone.Model.extend({
    idAttribute: "qaID",
    defaults: {
      qaID:null,
      formID:null,
      sectionID:null,
      sectionName:null,
      userID:null,
      sessonID:null,
      questionID:null,
      question:null,
      answer:null,
      questionType:null,
      options:null,
      created_by:null,
      modifiedBy:null,
      created_date:null,
      modifiedDate:null,
      status:'active',
  },
  urlRoot:function(){
    return APIPATH+'formAnsMaster/'
  },
  parse : function(response) {
      return response.data[0];
    }
  });
  return formAnswerSingleModel;
});
