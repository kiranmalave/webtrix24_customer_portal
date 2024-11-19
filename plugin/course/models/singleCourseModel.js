define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var singleCourseModel = Backbone.Model.extend({
    idAttribute: "course_id",
     defaults: {
        course_id:null,
        title:null,
        description:null,
        cover_image:null,
        category_id:null,
        author_id:null,
        course_paid:null,
        amount:null,
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        status:'active',
    },
  	urlRoot:function(){
      return APIPATH+'courseMaster/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return singleCourseModel;
});
