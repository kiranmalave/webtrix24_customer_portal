define([
    'underscore',
    'backbone',
    '../models/templatesModel'
  ], function(_, Backbone,templatesModel){
  
    var templateCollection = Backbone.Collection.extend({
        temp_id:null,
        model: templatesModel,
        initialize : function(){
  
        },
        url : function() {
          return APIPATH+'templateList';
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
  
    return templateCollection;
  
  });