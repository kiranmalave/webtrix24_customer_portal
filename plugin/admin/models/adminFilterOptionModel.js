define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var adminFilterOptionModel = Backbone.Model.extend({
    idAttribute: "adminID",
    defaults: {
      // textSearch: 'userName',
      // textval: null,
      // status: null,
      // fromDate:null,
      // toDate:null,
      // fromDate2:null,
      // toDate2:null,
      // orderBy: 'name',
      // order: 'ASC',
      status:"active",
      textSearch: '',
      roleName:'',
      textval: null,
      orderBy: 't.created_date' ,
      order:'DESC' ,
    }
  });
  return adminFilterOptionModel;
});

