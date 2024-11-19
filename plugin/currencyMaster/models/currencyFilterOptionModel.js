define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var currencyFilterOptionModel = Backbone.Model.extend({
    idAttribute: "currency_id",
    defaults: {
      textSearch: null,
      textval: null,
      status: 'active',
      orderBy: 't.created_date',
      order:'DESC' ,
    }
  });
  return currencyFilterOptionModel;
});

