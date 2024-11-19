define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var userRoleModel = Backbone.Model.extend({
    idAttribute: "roleID"
  });
  return userRoleModel;
});

