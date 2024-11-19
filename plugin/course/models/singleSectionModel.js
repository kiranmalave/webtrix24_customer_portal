define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var singleSectionModel = Backbone.Model.extend({
    idAttribute: "section_id",
     defaults: {
        section_id:null,      
        course_id:null,
        name:null,
        course_id:null,
        description:null,
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        status:'active',
    },
  	urlRoot:function(){
      return APIPATH+'sections/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return singleSectionModel;
});
