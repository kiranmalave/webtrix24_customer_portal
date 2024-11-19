define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var currencySingleModel = Backbone.Model.extend({
    idAttribute: "currency_id",
    defaults: {
      currency_id: null,
      name: null,
      created_by: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'currencyMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return currencySingleModel;
});
