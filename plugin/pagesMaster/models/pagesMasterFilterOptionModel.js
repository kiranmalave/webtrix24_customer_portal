define([
  'underscore',
  'backbone',
], function (_, Backbone) {

  var pagesMasterFilterOptionModel = Backbone.Model.extend({
    idAttribute: "pageID",
    defaults: {
      textSearch: 'pageTitle',
      textval: null,
      page_type : null,
      status: 'active,inactive,delete',
      orderBy:'t.created_date' ,
      order:'DESC' ,
      created_by: null,
    }
  });
  return pagesMasterFilterOptionModel;
});

