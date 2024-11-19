define([
    'underscore',
    'backbone',
  ], function(_, Backbone) {
  
    var templateSingleModel = Backbone.Model.extend({
        idAttribute: "temp_id",
        defaults: {
            temp_id: null,
            temp_name: null,
            module_name: null,
            temp_image: null,
            modified_by: null,
            created_date: null,
            modified_date: null,
            temp_code: null,
            temp_content: null,
            temp_css: null,
            css_for_temp: null,
            clickable_template:'n',
            status: "active",
        },
        urlRoot:function(){
        return APIPATH+'template/'
      },
      parse : function(response) {
          return response.data[0];
      }
    });
    return templateSingleModel;
  });
  