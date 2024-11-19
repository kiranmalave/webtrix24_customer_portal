define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var expensesFilterOptionModel = Backbone.Model.extend({
    idAttribute: "expenses_id",
    defaults: {
      textSearch: '',
      textval: null,
      category: null,
      expense_by: null,
      fromDate: null,
      toDate: null,
      status: null,
      orderBy: 't.created_date',
      order:'DESC' ,
    }
  });
  return expensesFilterOptionModel;
});