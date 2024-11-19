define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var eventFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "event_id",
  	 defaults:{
        // textSearch:'event_name',
        // textval: null,
        // status:'active',
        // // orderBy:'event_name',
        // order:'ASC',
        status:'active',
        textSearch: '',
        textval: null,
        orderBy:null ,
        order:null ,
    }
  });
  return eventFilterOptionModel;
});

