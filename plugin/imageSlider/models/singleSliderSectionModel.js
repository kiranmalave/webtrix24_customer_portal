define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var singleSliderSectionModel = Backbone.Model.extend({
      idAttribute: "item_id",
      defaults: {
        item_id:null,
        slider_id:null,
        title:null,
        description:null,
        position:null,
        slider_data : {
          "titlePosition": null,
          "bgColor": null,
          "titleFontSize": null,
          "descFontSize": null,
          "titleColor": null,
          "descColor": null,
          "titleFontFamily": null,
          "titleFontWeight": null,
          "descFontFamily": null,
          "descFontWeight": null,
        },
        cover_image:null,
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        status:'active',
    },
    urlRoot:function(){
      return APIPATH+'sliderSections/'
    },     
    parse : function(response) {
      if(response){
        return response.data[0];
      } 
    } 
    });
    return singleSliderSectionModel;
  });
  
  