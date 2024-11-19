define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var accGroupFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "accGroupID",
  	 defaults:{
        textSearch:'accGroupName',
        textval: null,
        status:null,
        orderBy:'created_date',
        order:'DESC',
    }
  });
  return accGroupFilterOptionModel;
});

