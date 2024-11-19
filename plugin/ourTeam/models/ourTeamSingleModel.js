define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var ourTeamSingleModel = Backbone.Model.extend({
    idAttribute: "team_id",
    defaults: {
      team_id: null,
      name: null,
      position: null,
      description: null,
      member_image: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      instagram: null,
      facebook: null,
      linkedin: null,
      website: null,
      whatsapp: null,
      team_order: null,
      show_on_website: 'no',
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'ourTeam/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return ourTeamSingleModel;
});
