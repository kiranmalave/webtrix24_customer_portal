define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var productStockOption = Backbone.Model.extend({
  	idAttribute: "stockTableID",
  	 defaults:{
        // textSearch:'invoiceNumber',
        // textval: null,
        // status:null,
        // orderBy:'invoiceNumber',
        // order:'DESC',
        status:null,
        textSearch: '',
        textval: null,
        orderBy:'created_date' ,
        order:'DESC' ,
    }
  });
  return productStockOption;
});

