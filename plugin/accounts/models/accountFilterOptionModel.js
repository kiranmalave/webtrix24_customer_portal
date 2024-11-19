define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var accountFilterOptionModel = Backbone.Model.extend({
    idAttribute: "account_id",
    defaults: {
      textSearch: null,
      textval: null,
      status: 'active',
      orderBy: 't.created_date',
      order:'DESC' ,
    }
  });
  return accountFilterOptionModel;
});

