define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var pagesMasterSingleModel = Backbone.Model.extend({
    idAttribute: "pageID",
    defaults: {
      pageID: null,
      pageTitle: null,
      pageSubTitle: null,
      pageLink: null,
      keywords: null,
      metaDesc: null,
      isParent: null,
      isHome: null,
      description: null,
      pageCode: null,
      page_type: null,
      pageContent: null,
      pageCss: null,
      scriptForPage: null,
      cssForPage: null,
      created_by: null,
      modified_by: null,
      created_date: null,
      modified_date: null,
      feture_image: null,
      category_id: null,
      tempType: 'default',
      status: 'active',
      editfor: null,
      is_external_link: "no",
      show_banner_image: null,
      show_description_on_website: "no",
    },
    urlRoot: function () {
      return APIPATH + 'pagesMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return pagesMasterSingleModel;
});
