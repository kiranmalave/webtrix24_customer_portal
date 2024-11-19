define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var dynamicFormsFilterOptionModel = Backbone.Model.extend({
    idAttribute: "form_id",
    defaults: {
      textSearch: 'form_name',
      textval: null,
      status: 'active',
      orderBy: 'form_name',
      order: 'ASC',
    }
  });
  return dynamicFormsFilterOptionModel;
});

