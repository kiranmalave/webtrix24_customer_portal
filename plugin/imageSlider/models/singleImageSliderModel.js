define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var singleImageSliderModel = Backbone.Model.extend({
      idAttribute: "slider_id",
       defaults: {
          slider_id:null,
          title:null,
          // created_by:null,
          // modified_by:null,
          // created_date:null,
          // modified_date:null,
          status:'active',
      },
        urlRoot:function(){
        return APIPATH+'imageSlider/'
      },
      parse : function(response) {
          return response.data[0];
      }
    });
    return singleImageSliderModel;
  });