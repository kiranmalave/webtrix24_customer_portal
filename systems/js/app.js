// Filename: app.js
define([
  'jquery', 
  'underscore', 
  'backbone',
  'router',
  'coreModules',
  'subscribeModule',
  'customModules'
], function($,_, Backbone,Router,coreModules,subscribeModule,customModules){
  var initialize = function(){
    // Pass in our Router module and call it's initialize function
    require(["coreModules",'subscribeModule','customModules','router'], function (coreModules,subscribeModule,customModules) {
      Router.initialize({coreModules:coreModules,subscribeModules:subscribeModule,customModules:customModules});
    });
  };
  return { 
    initialize: initialize
  };
});
