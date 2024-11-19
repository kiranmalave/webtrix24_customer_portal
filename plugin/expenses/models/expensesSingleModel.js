define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var expensesSingleModel = Backbone.Model.extend({
    idAttribute: "expenses_id",
    defaults: {
      expenses_id: null,
      expense_title:null,
      expense_type: null,
      loadFrom: null,
      revenueType: 'general',
      record_type: 'expense', 
      category: null,
      expense_by: null,
      related_to: null,
      project_id: null,
      expense_date: null,
      bank_account: null,
      merchant: null,
      amount: null,
      claim_reimbursement: null,
      paid_by: null,
      transaction_id: null,
      payee_name: null,
      comment: null,
      attachment: null,
      status: 'draft',
      approver_id: null,
    },
    urlRoot: function () {
      return APIPATH + 'expense/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return expensesSingleModel;
});
