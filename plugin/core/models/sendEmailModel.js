define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var sendEmailModel = Backbone.Model.extend({

  	urlRoot:function(){
      return APIPATH+'emailSend'
    }
  });
  return sendEmailModel;
});
