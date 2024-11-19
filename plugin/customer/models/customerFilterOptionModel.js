define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var customerFilterOptionModel = Backbone.Model.extend({
    idAttribute: "customer_id",
    defaults: {
      status:'active',
      assignee: null,
      created_by: null,
      branch_id: null,
      country: null,
      state: null,
      city: null,
      last_activity: null,
      textSearch: '',
      textval: null,
      orderBy: 't.created_date',
      order: "DESC",
      stages: null,
    }
  });
  return customerFilterOptionModel;
});

