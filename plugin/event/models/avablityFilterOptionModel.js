define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var avablityFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "schedule_id",
  	 defaults:{
        // textSearch:'name',
        // textval: null,
        // status:'Active',
        // orderBy:'createdDate',
        // order:'DESC',
        status:'active',
        textSearch: '',
        textval: null,
        orderBy:'created_date' ,
        order:'DESC' ,
    }
  });
  return avablityFilterOptionModel;
});

