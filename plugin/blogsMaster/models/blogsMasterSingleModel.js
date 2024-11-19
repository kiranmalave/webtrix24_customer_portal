define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var blogsMasterSingleModel = Backbone.Model.extend({
    idAttribute: "blogID",
    defaults: {
      blogID: null,
      blogTitle: null,
      description: null,
      category: null,
      blogImage: null,
      blogTemplate: null,
      pageCode: null,
      pageCss: null,
      pageContent: null,
      blogLink: null,
      blogSubTitle: null,
      metaKeywords: null,
      metaDesc: null,
      created_by: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      status: 'active',
    },  
    urlRoot: function () {
      return APIPATH + 'blogsMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return blogsMasterSingleModel;
});
