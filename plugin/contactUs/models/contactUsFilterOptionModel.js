define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var contactUsFilterOptionModel = Backbone.Model.extend({
    idAttribute: "contactUsID",
    defaults: {
      textSearch: 'fullName',
      textval: null,
      status: 'active',
      orderBy: 'createdDate',
      order:'DESC' ,
    }
  });
  return contactUsFilterOptionModel;
});

