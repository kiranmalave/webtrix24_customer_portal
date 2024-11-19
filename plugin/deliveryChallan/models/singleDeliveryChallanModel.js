define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var singleDeliveryChallanModel = Backbone.Model.extend({
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
      infoCGST: null,
      customerList: null,
    },
    urlRoot: function () {
      return APIPATH + 'deliveryChallan/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return singleDeliveryChallanModel;
});
