define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var opportunityModel = Backbone.Model.extend({
    idAttribute: "opportunity_id"
  });
  return opportunityModel;
});

