define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var vendorFilterOptionModel = Backbone.Model.extend({
    idAttribute: "vendor_id",
    defaults: {
      textSearch: null,
      textval: null,
      status: 'active',
      orderBy: 't.created_date',
      order:'DESC' ,
    }
  });
  return vendorFilterOptionModel;
});

