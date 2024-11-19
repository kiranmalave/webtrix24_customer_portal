define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var categorySingleModel = Backbone.Model.extend({
    idAttribute: "category_id",
    defaults:{
      category_id: null,
      categoryName: null,
      cover_image:null,
      slug:null,
      is_parent:"no",
      description:null,
      modified_by:null,
      created_date:null,
      modified_date:null,
      cat_color: null,
      status: 'active',
    },
    urlRoot: function () {
      return APIPATH + 'categoryMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return categorySingleModel;
});
