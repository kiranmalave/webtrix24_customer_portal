define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var deliveryFilterOptionModel = Backbone.Model.extend({
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
        record_type: 'delivery',
        orderBy: 'created_date' ,
        order:'DESC' ,
    }
  });
  return deliveryFilterOptionModel;
});

