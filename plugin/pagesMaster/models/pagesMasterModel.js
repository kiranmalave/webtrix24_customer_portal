define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var pagesMasterModel = Backbone.Model.extend({
    idAttribute: "pageID"
  });
  return pagesMasterModel;
});

