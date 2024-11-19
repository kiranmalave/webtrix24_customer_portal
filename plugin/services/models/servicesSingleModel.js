define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var ServicesSingleModel = Backbone.Model.extend({
    idAttribute: "service_id",
    defaults: {
      service_id: null,
      serviceTitle: null,
      serviceDescription: null,
      category_id: null,
      parent_id: null,
      serviceImage: null,
      service_type:null,
      pageCode: null,
      pageContent: null,
      pageCss: null,
      serviceLink: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      cover_image:null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'serviceMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return ServicesSingleModel;
});
