define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var accountSingleModel = Backbone.Model.extend({
    idAttribute: "account_id",
    defaults: {
      account_id: null,
      name: null,
      account_id: null,
      account_type: null,
      currency: 0,
      record_acc_balance: 'no',
      opening_bal: '0.00',
      opening_balance_date: null,
      created_by: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'accountMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return accountSingleModel;
});
