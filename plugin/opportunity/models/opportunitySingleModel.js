define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var opportunitySingleModel = Backbone.Model.extend({
    idAttribute: "opportunity_id",
    defaults: {
      opportunity_id: null,
      company_id: "mr",
      opportunity_title: null,
      source: null,
      opportunity_type: null,
      assignee: null,
      stage: null,
      opportunity_amount: null,
      end_date: null,
      description: "individual",
      opportunity_end: null,
      opportunity_image: null,
      customer_id: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'opportunityMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return opportunitySingleModel;
});
