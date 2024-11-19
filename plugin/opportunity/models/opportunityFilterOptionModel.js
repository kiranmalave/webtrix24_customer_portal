define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var opportunityFilterOptionModel = Backbone.Model.extend({
    idAttribute: "opportunity_id",
    defaults: {
      status:'active',
      assignee: null,
      created_by: null,
      branch_id: null,
      country_id: null,
      state_id: null,
      city_id: null,
      last_activity: null,
      textSearch: '',
      textval: null,
      orderBy: 't.created_date',
      order: "DESC",
      stages: null,
    }
  });
  return opportunityFilterOptionModel;
});

