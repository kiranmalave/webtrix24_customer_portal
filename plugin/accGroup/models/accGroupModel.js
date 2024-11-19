define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var accGroupModel = Backbone.Model.extend({
    idAttribute: "accGroupID"
  });
  return accGroupModel;
});

