define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var taxInvoiceModel = Backbone.Model.extend({
    idAttribute: "invoiceID",
    defaults: {
      invoiceID: null,
      invoiceNumber: null,
      processingMonth: null,
      processingYear: null,
      reportMonth: null,
      reportYear: null,
      traineeCount: null,
      companyID: null,
      invoiceDate: null,
      customer_id: null,
      paymentTerms: null,
      invoiceTotal: null,
      stateGstPercent: null,
      interGstPercent: null,
      centralGstPercent: null,
      isconvertToInvoice:'no',
      stateGstAmount: null,
      interGstAmount: null,
      centralGstAmount: null,
      roundOff: null,
      grossAmount: null,
      narrList: null,
      isEdit: 'yes',
      companyList: null,
      invoiceLine: null,
      infoSGST: null,
      infoIGST: null,
      pending_amount:null,
      infoCGST: null,
      customerList: null,
      ship_to: 'no',
      isGstBilling: 'no',
      is_shipping: 'no',
      project_id : null,
      related_to : null,
      shipping_address: null,
      status:'draft',
    },
    urlRoot: function () {
      return APIPATH + 'taxInvoice/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return taxInvoiceModel;
});
