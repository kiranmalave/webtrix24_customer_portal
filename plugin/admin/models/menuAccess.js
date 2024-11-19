define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var menuAccess = Backbone.Model.extend({
    idAttribute: "menuID",
     defaults: {
        menuID:null,
        menuName:null,
        add:'no',
        edit:'no',
        view:'no',
        delete:'no',
    },
    urlRoot:function(){
      return APIPATH+'accessMenuList/'
    },
  });
  return menuAccess;
});
