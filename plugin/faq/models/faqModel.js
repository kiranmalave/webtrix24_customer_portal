define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var faqModel = Backbone.Model.extend({
    idAttribute: "faq_id"
  });
  return faqModel;
});

