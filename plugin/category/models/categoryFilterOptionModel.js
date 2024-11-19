define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var categoryFilterOptionModel = Backbone.Model.extend({
    idAttribute: "category_id",
    defaults: {
      textSearch: 'categoryName',
      textval: null,
      status: null,
      orderBy: 't.created_date',
      order: 'DESC',
    }
  });
  return categoryFilterOptionModel;
});

