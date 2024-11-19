define([
  'underscore',
  'backbone',
  '../models/testimonialsModel'
], function (_, Backbone, testimonialsModel) {

  var testimonialsCollection = Backbone.Collection.extend({
    testimonial_id: null,
    model: testimonialsModel,
    initialize: function () {

    },
    url: function () {
      return APIPATH + 'testimonialsList';
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

  return testimonialsCollection;

});