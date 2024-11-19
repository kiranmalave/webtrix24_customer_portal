define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var taxInvoiceFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "invoiceID",
  	 defaults:{
        // textSearch:'invoiceNumber',
        // textval: null,
        // status:null,
        // orderBy:'invoiceNumber',
        // order:'DESC',
        status:null,
        textSearch: '',
        textval: null,
        record_type: 'invoice',
        orderBy:'t.created_date' ,
        order:'DESC' ,
    }
  });
  return taxInvoiceFilterOptionModel;
});

