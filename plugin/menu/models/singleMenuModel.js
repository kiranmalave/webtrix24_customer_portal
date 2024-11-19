define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var singleMenuModel = Backbone.Model.extend({
    idAttribute: "menuID",
     defaults: {
        menuID:null,
        menuName:null,
        module_name:null,
        menuLink:null,
        mobile_screen:'no',
        isParent:"yes",
        isClick:"yes",
        linked:"n",
        is_custom:"n",
        menuIndex:999,
        parentID:null,
        created_by:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        modified_by:null,
        created_date:null,
        modified_date:null,
        label:null,
        plural_label:null,
        custom_module:'no',
        status:'active',
        show_on_website:"no",
    },
    urlRoot: function () {
      return APIPATH + 'menuMaster/'
    },
    parse: function (response) {
      return response.data[0];
    }
  });
  return singleMenuModel;
});
