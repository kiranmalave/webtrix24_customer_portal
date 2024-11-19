define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
    var commentsFilterOptionModel = Backbone.Model.extend({
      idAttribute: "task_id",
      defaults: {
        task_id : null,
        status: 'active',
        orderBy: "t.created_date",
        order: "DESC",
      }
    });
    return commentsFilterOptionModel;
  });
  
  