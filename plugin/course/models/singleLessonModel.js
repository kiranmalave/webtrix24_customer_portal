define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var singleLessonModel = Backbone.Model.extend({
    idAttribute: "lesson_id",
     defaults: {
        lesson_id :null,
        section_id:null,
        course_id:null,
        lesson_title:null,
        introduction:null,
        upload_type:null,
        video_type:null,
        live_type:null,
        start_date:null,
        end_date:null,
        start_time:null,
        end_time:null,
        youtube_link:null,
        youtube_title:null,
        custom_link:null,
        custon_link_title:null,
        duration:null,
        password:null,
        cover_image:null,
        course_file:null,
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        status:'active',
    },
  	urlRoot: function () {
      return APIPATH +'lesson/'
    },
    parse : function (response) {
      return response.data[0];
    }
  });
  return singleLessonModel;
});

  