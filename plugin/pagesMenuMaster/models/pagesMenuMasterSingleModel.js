define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var pagesMenuMasterSingleModel = Backbone.Model.extend({
    idAttribute: "menuID",
     defaults: {
        menuID:null,
        menuName:null,
        isPrimary:null,
        isFooter:null,
        isSecondary:null,
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        status:'active',
    },
  	urlRoot:function(){
      return APIPATH+'pagesMenuMaster/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return pagesMenuMasterSingleModel;
});
