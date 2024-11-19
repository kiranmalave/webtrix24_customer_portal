define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
  
    var loginTemplateFilterModel = Backbone.Model.extend({
      idAttribute: "slide_id",
      defaults: {
        // textSearch: 'title',
        // textval: null,
        // status: 'Active',
        // orderBy: 'created_date',
        // order: 'DESC',
        // folderID: null,
        // mType: null,
        status:null,
        textSearch: '',
        textval: null,
        orderBy:null ,
        order:null ,
      }
    });
    return loginTemplateFilterModel;
  });