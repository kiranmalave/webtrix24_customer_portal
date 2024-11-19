define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var careerSingleModel = Backbone.Model.extend({
    idAttribute: "job_id",
     defaults: {
      job_id :null,
      job_title:null,
      description:null,
      modified_by:null,
      created_date:null,
      modified_date:null,
      status:'active',
    },
  	urlRoot:function(){
      return APIPATH+'careerMaster/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return careerSingleModel;
});
