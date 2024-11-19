define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var formMasterSingleModel = Backbone.Model.extend({
    idAttribute: "formID",
     defaults: {
        formID:null,
        formTitle:null,
        description:null,
        createdBy:null,
        modified_by:null,
        createdDate:null,
        modified_date:null,
        status:'active',
    },
  	urlRoot:function(){
      return APIPATH+'formMaster/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return formMasterSingleModel;
});
