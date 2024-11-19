define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var questionmodel = Backbone.Model.extend({
    idAttribute: "question_id",
    defaults: {
      question_id: null,
      form_id: null,
      question: null,
      question_type: 'choice',
      question_options: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      from_description: null,
      status: 'active',
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return questionmodel;
});
