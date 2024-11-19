
define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'jqueryCookie',
  'Waves',
  'adminjs',
  'bootstrapSelect',
  'notify',
  'custom',
  'Swal',
], function ($, _, Backbone, bootstrap, jqueryCookie, Waves, adminjs, bootstrapSelect, notify, custom, Swal) {
    ADMINNAME = $.cookie('name');
    PROFILEIMG = $.cookie('photo');
    ADMINID = $.cookie('authid');
    DEFAULTCOMPANY ="";
    TIMEFORMAT = $.cookie('time_format');
    ISMENUSET = false;
    INITIALS ="";
    ROLE = '';
    ROLESLUG = $.cookie('role_slug');
    SIDEBAR ="";
    COMPANYLIST = '';
    USERSETTINGS =  $.cookie('user_setting');
    var AppRouter = Backbone.Router.extend({
    routes: {
      '*actions':"defaultAction"
    },
    historyStack:[],
    initialize:function(modules){
      const combinedRoutes = Object.assign({}, modules.coreModules.routes, modules.subscribeModules.routes,modules.customModules.routes);
      const m1 = this.deepMerge(modules.coreModules,modules.subscribeModules); //modules;
      this.modules = this.deepMerge(m1,modules.customModules);
      const skipobj = ["routes","modules"];
      for (const [name, fn] of Object.entries(this.modules)) {
        if (typeof fn === 'function' && !skipobj.includes(name)) {
        this[name] =fn.bind(this);//fn;
        }
      }
      this.applyRoutes(combinedRoutes);
      Backbone.history.start();
      INITIALS = this.getInitials(ADMINNAME);
      var bbauth = $.cookie('bbauth');
      var authResponse;  
    },
    deepMerge:function(target, source) {
      for (const key in source) {
        if (source[key] instanceof Object && key in target) {
          Object.assign(source[key], this.deepMerge(target[key], source[key]));
        }
      }
      Object.assign(target || {}, source);
      return target;
    },
    applyRoutes: function(routes) {
      for (const [route, methodName] of Object.entries(routes)) {
        if (typeof this[methodName] === 'function') {
          //console.warn(`Route name ${route}  Method ${methodName} is not defined in the router.`);
          this.route(route, methodName);
        } else {
          console.warn(`Method ${methodName} is not defined in the router.`);
        }
      }
    },
    preTemp:function() {
      var selfobj = this;
      // setup toggle and other function for menu
      if (typeof ($.cookie('authid')) == "undefined") {
        this.navigate("login", { trigger: true });
        return false;
      } else {
        if( COMPANYLIST == "" || DEFAULTCOMPANY == ""){
          this.getCompanyList();
        }
        var template = _.template(selfobj.modules.templates.appMain_temp);
        $("#master__load").addClass("nav-md");
        $("#master__load").empty().append(template());
        SIDEBAR = selfobj.modules.templates.sidebar;
        var sidebarTemplate = _.template(SIDEBAR);
        var topNavTemplate = _.template(selfobj.modules.templates.topNav);
        $(".main_container").append(sidebarTemplate({ menuDetails: ISMENUSET }));
        $(".main_container").append(topNavTemplate());
        //setsidbar();
        var mname = Backbone.history.getFragment();
        if (!ISMENUSET) {
          if (typeof (localStorage.roleDetails) == "undefined" || localStorage.roleDetails == "[]") {
            this.navigate("logout", { trigger: true });
          }
          ROLE = JSON.parse(localStorage.roleDetails);
          var res = $.ajax({
            url: APIPATH + 'getMenuList',
            method: 'GET',
            async: false,
            datatype: 'JSON',
            beforeSend: function (request) {
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F") {
                alert(res.msg);
                return false;
              }
              if (res.statusCode == 994) { this.navigate("logout", { trigger: true }); }
              if (res.flag == "S") {
                ISMENUSET = res.data;
                var template = _.template(selfobj.modules.templates.appMain_temp);
                $("#master__load").addClass("nav-md");
                $("#master__load").empty().append(template());
                var sidebarTemplate = _.template(SIDEBAR);
                var topNavTemplate = _.template(selfobj.modules.templates.topNav);
                $(".main_container").append(sidebarTemplate({ menuDetails: ISMENUSET }));
                $(".main_container").append(topNavTemplate());
                //setsidbar();
                updateDateTime();
              }
            }
          });
        
          this.highlightMenu(mname);

          if (res.promise()) {
            selfobj.historyStack[0]=Backbone.history.fragment;
            return true;
          }
        } else {
          // var template = _.template(selfobj.modules.templates.appMain_temp);
          // $("#master__load").addClass("nav-md");
          // $("#master__load").empty().append(template());
          // var sidebarTemplate = _.template(selfobj.modules.templates.sidebar);
          // var topNavTemplate = _.template(selfobj.modules.templates.topNav);
          // $(".main_container").append(sidebarTemplate({ menuDetails: ISMENUSET }));
          // $(".main_container").append(topNavTemplate({ menuDetails: ISMENUSET }));
          //setsidbar();
          this.highlightMenu(mname);
          selfobj.historyStack[0]=Backbone.history.fragment;
          return true;
        }
      }
    },
    highlightMenu:function(mname) {
      try {

        $(".menu .list").find("li").removeClass("kdark");
        $(".menu .list").find(".menu-toggle").removeClass("menu-dark");
        let mname = Backbone.history.getFragment();

        $(".menu li").each(function (index) {
          if (mname == $(this).attr("data-link")) {
            $(this).closest(".parentItem").first("a").addClass("kdark");
          }
        });
      } catch (error) {
        console.log("error menu active class" + error.message);
      }
    },
    getCompanyList:function() {
      var res = $.ajax({
        url: APIPATH + 'getCompanyList',
        method: 'GET',
        async: false,
        datatype: 'JSON',
        beforeSend: function (request) {
          request.setRequestHeader("token", $.cookie('_bb_key'));
          request.setRequestHeader("SadminID", $.cookie('authid'));
          request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
          request.setRequestHeader("Accept", 'application/json');
        },
        success: function (res) {
          if (res.flag == "F") {
            showResponse('',res,'');
            return false;
          }
          if (res.statusCode == 994) { this.navigate("logout", { trigger: true }); }
          if (res.flag == "S") {
            COMPANYLIST =res.data;
            DEFAULTCOMPANY =res.default_company;
          }
        }
      });
    },
    getInitials:function(name) {
      const words = name ? name.split(' ') : '';
      const initials = words ? words.map(word => word.charAt(0)) : '';
      return initials ? initials.join('').toUpperCase() : '';
    },
    defaultAction:function (actions) {
      if (typeof ($.cookie('authid')) == "undefined" || $.cookie('authid') == "") {
        this.navigate("login", { trigger: true });
      } else {
        this.navigate("dashboard", { trigger: true });        
      }
    },
  });
  return {
    initialize: function (modules) {
      app_router = new AppRouter(modules);
    }
  };
});