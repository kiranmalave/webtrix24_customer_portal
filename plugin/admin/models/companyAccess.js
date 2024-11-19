define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var companyAccess = Backbone.Model.extend({
    idAttribute: "adminID",
     defaults: {
        adminID:null,
        menuName:null,
        add:'no',
        edit:'no',
        view:'no',
        delete:'no',
    },
    urlRoot:function(){
      return APIPATH+'accessCompanyList/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return companyAccess;
});
