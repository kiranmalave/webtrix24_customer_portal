define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var faqSingleModel = Backbone.Model.extend({
    idAttribute: "faq_id",
     defaults: {
        faq_id:null,
        faq_question:null,
        faq_answer:null,
        is_publish:'no',
        asked_by_name:null,
        asked_by_email:null,
        is_email_send	:'no',
        modified_by:null,
        created_date:null,
        modified_date:null,
        status:"active",
    },
  	urlRoot:function(){
      return APIPATH+'faq/'
    },
    parse : function(response) {
        return response.data[0];
      }
  });
  return faqSingleModel;
});
