define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
  
    var receiptSingleModel = Backbone.Model.extend({
      idAttribute: "receipt_id",
      defaults: {
        receipt_id : null,
        invoice_id : null,
        customer_id : null,
        customer_name : null,
        attachement : null,
        mode_of_payment : null,
        transaction_id : null,
        notes : null,
        show_history : 'no',
        amount : '0.00',
        payment_log_date : null,
        account_id : null,
        related_to : null,
        record_id : null,
        created_by : null,
        expected_income_id : null,
        // revenueType : 'expected',
        // loadFrom : 'project',
        revenueType : null,
        loadFrom : null,
      },
      urlRoot: function () {
        return APIPATH + 'receiptMaster/'
      },
      parse: function (response) {
        return response.data[0];
      }
    });
    return receiptSingleModel;
  });