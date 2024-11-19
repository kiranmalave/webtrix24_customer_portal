define([
    'underscore',
    'backbone',
  ], function (_, Backbone) {
  
    var imageSliderFilterModel = Backbone.Model.extend({
      idAttribute: "slider_id",
      defaults: {
        // textSearch: 'title',
        // textval: null,
        // status: 'Active',
        // orderBy: 'created_date',
        // order: 'DESC',
        // folderID: null,
        // mType: null,
        status:'active',
        textSearch: '',
        textval: null,
        orderBy:'t.created_date' ,
        order:'DESC' ,
      }
    });
    return imageSliderFilterModel;
  });
  
  