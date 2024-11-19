define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var menuPagesModel = Backbone.Model.extend({
    defaults:{
        dirName:null,
        folderPath:null,
    },
    urlRoot:function(){
      return APIPATH+'addDIR'
    },
    parse : function(response) {
        return response.data;
      }
  });
  return menuPagesModel;
});

