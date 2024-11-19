define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var productFilterOptionModel = Backbone.Model.extend({
    idAttribute: "product_id",
    defaults: {
      textSearch: null,
      textval: null,
      status: null,
      orderBy: 'created_date',
      order:'DESC' ,
    }
  });
  return productFilterOptionModel;
});

