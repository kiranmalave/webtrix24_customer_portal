define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var formMasterSingleModel = Backbone.Model.extend({
    idAttribute: "sectionID",
     defaults: {
        sectionID:null,
        sectionName:null,
        createdBy:null,
        modifiedBy:null, 
        createdDate:null,
        modifiedDate:null,
        status:'active',
    },
  	urlRoot:function(){
      return APIPATH+'formQuestionMasterSection/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return formMasterSingleModel;
});
