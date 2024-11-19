define([
  'underscore',
  'backbone',
], function(_, Backbone) {

  var pagesMenuMasterFilterOptionModel = Backbone.Model.extend({
  	idAttribute: "menuID",
  	 defaults:{
        textSearch:'',
        textval: null,
        status:'active,inactive',
        orderBy:'created_date',
        folderID:"",
        folderName:"",
        fPath:UPLOADS,
        order:'DESC' ,
        cmp_type:null,
    }
  });
  return pagesMenuMasterFilterOptionModel;
});

