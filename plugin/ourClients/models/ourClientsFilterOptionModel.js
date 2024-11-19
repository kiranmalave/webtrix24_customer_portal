define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var ourClientsFilterOptionModel = Backbone.Model.extend({
    idAttribute: "clients_id",
    defaults: {
      // textSearch: 'client_name',
      // textval: null,
      // status: 'active',
      // orderBy: 'client_name',
      // order: 'ASC',
      status: 'active',
      textSearch: '',
      textval: null,
      orderBy: 'created_date',
      order:'DESC' ,
    }
  });
  return ourClientsFilterOptionModel;
});

