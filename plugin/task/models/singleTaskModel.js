define([
  'underscore',
  'backbone',
], function (_, Backbone) {
  var singleTaskModel = Backbone.Model.extend({
    idAttribute: "task_id",
    defaults: {
      task_id: null,
      subject: null,
      description: null,
      customer_id: null,
      customerName: null,
      assignee: null,
      related_to:null,
      task_status: null,
      task_type: null,
      task_priority: null,
      task_repeat: "no",
      start_date: null,
      completed_date: null,
      created_by: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      tasksWatchers: null,
      tasks_watchersID: null,
      week_numb: null,
      repeat_on: "daily",
      monthly: null,
      days: null,
      ends: null,
      end_on_date: null,
      end_after_date: null,
      record_type: "task",
      attachment_file: null,
      product: null,
      related_to:null,
      project_id:null,
      title:null,
      day:null,
      hours:null,
      minute:null,
      estimate_time:null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'taskMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return singleTaskModel;
});
