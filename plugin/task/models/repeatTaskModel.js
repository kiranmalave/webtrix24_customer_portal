define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var repeatTaskModel = Backbone.Model.extend({
    idAttribute: "task_id",
    defaults: {
      task_id: null,
    },
    urlRoot: function () {
      return APIPATH + 'repeatTaskMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return repeatTaskModel;
});
