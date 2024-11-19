define([
    'underscore',
    'backbone',
    '../models/registrationModel'
  ], function(_, Backbone,registrationModel){
  
    var registrationCollection = Backbone.Collection.extend({
        registration_id:null,
        model: registrationModel,
        initialize : function(){
  
        },
        url : function() {
          return APIPATH+'registrationMasterList';
        },
        parse : function(response){
          this.pageinfo = response.paginginfo;
          this.totalRecords = response.totalRecords;
          this.endRecords = response.end;
          this.flag = response.flag;
          this.msg = response.msg;
          this.loadstate = response.loadstate;
          return response.data;
        }
    });
  
    return registrationCollection;
  
  });