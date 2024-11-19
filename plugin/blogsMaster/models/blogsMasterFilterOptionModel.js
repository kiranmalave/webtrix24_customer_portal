define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var blogsMasterFilterOptionModel = Backbone.Model.extend({
    idAttribute: "blogID",
    defaults: {
      textSearch: 'blogTitle',
      category: null,
      textval: null,
      status: 'active,inactive',
      orderBy: 'blogTitle',
      order: 'ASC',
    }
  });
  return blogsMasterFilterOptionModel;
});

