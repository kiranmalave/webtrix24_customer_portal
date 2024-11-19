define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var campaignsModel = Backbone.Model.extend({
    idAttribute: "campaign_id"
  });
  return campaignsModel;
});

