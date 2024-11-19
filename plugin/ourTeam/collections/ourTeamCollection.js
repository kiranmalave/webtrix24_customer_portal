define([
  'underscore',
  'backbone',
  '../models/ourTeamModel'
], function (_, Backbone, ourTeamModel) {

  var ourTeamCollection = Backbone.Collection.extend({
    team_id: null,
    model: ourTeamModel,
    initialize: function () {

    },
    url: function () {
      return APIPATH + 'ourTeamList';
    },
    parse: function (response) {
      this.pageinfo = response.paginginfo;
      this.totalRecords = response.totalRecords;
      this.endRecords = response.end;
      this.flag = response.flag;
      this.msg = response.msg;
      this.loadstate = response.loadstate;
      return response.data;
    }
  });

  return ourTeamCollection;

});