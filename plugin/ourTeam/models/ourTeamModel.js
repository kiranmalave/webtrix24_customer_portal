define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var ourTeamModel = Backbone.Model.extend({
    idAttribute: "team_id"
  });
  return ourTeamModel;
});

