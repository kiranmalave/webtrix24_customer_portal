define([
  'jquery',
  'underscore',
  'backbone',
  'custom',
  'text!templates/temp_loginRequired.html'
], function($, _, Backbone,custom,loginRequired){
  
var loginRequiredView = Backbone.View.extend({
    el:"#templateRender",
    className:"right-container",
     initialize: function(){
      $(".right-box").hide();
      if($('#login-req').length){
        $('#login-req').remove();
      }
      this.render();
    },
    events: 
    {
      "click #showlog":"showLogin"
    },
    render: function() {
        
        var source = loginRequired;
        var template = _.template(source);
        $("#right__container__section").append(template());
        $('#login-req').css("display","flex");  
        return this;
    },
    showLogin: function(){
          app_router.navigate("bareback-login", {trigger: true, replace: true});
    }
});
return loginRequiredView;
  
});
