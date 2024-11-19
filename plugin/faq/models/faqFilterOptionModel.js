define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var faqFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "faq_id",
  	 defaults:{
      // textSearch:'title',
      // textval: null,
      // status:'Active',
      // orderBy:'created_date',
      // order:'DESC',
      status:'active',
      textSearch: '',
      textval: null,
      orderBy:'created_date' ,
      order:'DESC' ,
    }
  });
  return faqFilterOptionModel;
});

