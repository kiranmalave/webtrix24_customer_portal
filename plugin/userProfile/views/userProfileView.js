define([
  'jquery',
  'underscore',
  'backbone',
  'validate',
  'inputmask',
  'moment',
  'slim',
  'Swal',
  'locationpicker',
  '../../readFiles/views/readFilesView',
  '../views/changePasswordView',
  '../models/userProfileModel',
  '../../core/views/countryExtList',
  'text!../templates/userProfileTemp.html',
  '../../userRole/collections/userRoleCollection',
  '../../companyMaster/collections/companyCollection',
], function ($, _, Backbone, validate, inputmask, moment, slim, Swal, locationpicker, readFilesView, changePasswordView, userProfileModel, countryExtList, userProfileTemp ,userRoleCollection, companyCollection) {

  var infoSingleView = Backbone.View.extend({
    model: userProfileModel,
    initialize: function (options) {
      var selfobj = this;
      $(".modelbox").hide();
      $(".popupLoader").show();

      permission = ROLE["usersList"];
      if (permission.view == "no") {
        app_router.navigate("dashboard", { trigger: true });
      }
      this.menuId = permission.menuID;
      this.storedAppInfo = null;
      this.defaultColumns = ['name', 'email', 'company_id', 'created_by', 'created_date', 'modified_by'];
      this.model = new userProfileModel();
      this.countryListView = new countryExtList();
      this.countryExtList = this.countryListView.countryExtList;
      this.companyCollection = new companyCollection();
      this.userRoleList = new userRoleCollection();
      this.userRoleList.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.model.set("userRoleList", res.data);
        selfobj.render();
      });

      this.companyCollection.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, error: selfobj.onErrorHandler, type: 'POST', data: { getAll: 'Y', status: "active" }
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();
      });

      this.model.set({ adminID: $.cookie('authid') });
      this.model.fetch({
        headers: {
          'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
        }, data:{menuId:selfobj.menuId}, error: selfobj.onErrorHandler
      }).done(function (res) {
        if (res.flag == "F") {
          showResponse('',res,'');
        }
        var bDate = selfobj.model.get("dateOfBirth");
        if (bDate !== undefined && bDate !== "0000-00-00") {
          selfobj.model.set({ "dateOfBirth": moment(bDate).format("DD/MM/YYYY") });
          selfobj.render();
          selfobj.setValues();
        }
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        $(".popupLoader").hide();
        selfobj.render();

      });
    },
    events:
    {
      "click .saveUserDetails": "saveUserDetails",
      "click .item-container li": "setValues",
      "blur .txtchange": "updateOtherDetails",
      "change .multiSel": "setValues",
      "change .bDate": "updateOtherDetails",
      "change .dropval": "updateOtherDetails",
      "click  .chageIcon": "chageIcon",
      "change .fileAdded": "updateImage",
      "click #address": "showlocation",
      "click .loadMedia": "loadMedia",
      "click .signInToOneDrive":"signInToOneDrive",
      "click .changePassword":"changePassword",
    },
    onErrorHandler: function (collection, response, options) {
      Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
      $(".profile-loader").hide();
    },

    updateImage: function (e) {
      var ob = this;
      var toID = $(e.currentTarget).attr("id");
      var value = $(e.currentTarget).attr("value");
      var newdetails = [];
      var reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("output").src = e.target.result;
        $("#output").show();
        newdetails["" + toID] = reader.result;
        ob.model.set(newdetails);
        console.log(newdetails);
      };
      // read the image file as a data URL.
      reader.readAsDataURL(e.currentTarget.files[0]);
    },

    chageIcon: function (e) {
      var currentval = $("#password").attr("type");
      if (currentval == "password") {
        this.model.set({ eyeIcon: "fa fa-eye", inputType: "text" })
      }
      if (currentval == "text") {
        this.model.set({ eyeIcon: "fa fa-eye-slash", inputType: "password" })
      }
      this.render();
    },

    changePassword: function(e){
      $('#changePasswordModal').modal('toggle');
      new changePasswordView();
    },

    getSelectedFile: function (url) {
      $('.' + this.elm).val(url);
      $('.' + this.elm).change();
      $("#profile_pic_view").attr("src", url);
      $("#profile_pic_view").css({ "max-width": "100%" });
      $('#largeModal').modal('toggle');
      this.model.set({ "photo": url });
      console.log(this.model);
    },
    loadMedia: function (e) {
      e.stopPropagation();
      $('#largeModal').modal('toggle');
      this.elm = "profile_pic";
      var menusingleview = new readFilesView({ loadFrom: "addpage", loadController: this });
    },
    updateOtherDetails: function (e) {

      var valuetxt = $(e.currentTarget).val();
      var toID = $(e.currentTarget).attr("id");
      var newdetails = [];
      newdetails["" + toID] = valuetxt;
      this.model.set(newdetails);
      console.log(this.model);
    },
    setValues: function (e) {
      setvalues = ["status"];
      var selfobj = this;
      $.each(setvalues, function (key, value) {
        var modval = selfobj.model.get(value);
        if (modval != null) {
          console.log(setvalues);

          var modeVal = modval.split(",");

        } else { var modeVal = {}; }

        $(".item-container li." + value).each(function () {
          var currentval = $(this).attr("data-value");
          var selecterobj = $(this);
          $.each(modeVal, function (key, dbvalue) {
            if (dbvalue.trim().toLowerCase() == currentval.toLowerCase()) {
              $(selecterobj).addClass("active");
            }
          });
        });
      });
      setTimeout(function () {
        if (e != undefined && e.type == "click") {
          var newsetval = [];
          var objectDetails = [];
          var classname = $(e.currentTarget).attr("class").split(" ");
          $(".item-container li." + classname[0]).each(function () {
            var isclass = $(this).hasClass("active");
            if (isclass) {
              var vv = $(this).attr("data-value");
              newsetval.push(vv);
            }

          });

          if (0 < newsetval.length) {
            var newsetvalue = newsetval.toString();
          }
          else { var newsetvalue = ""; }

          objectDetails["" + classname[0]] = newsetvalue;
          $("#valset__" + classname[0]).html(newsetvalue);
          selfobj.model.set(objectDetails);
          console.log(classname[0]);
          console.log(selfobj.model);
        }
      }, 500);
    },
    ////LocationMap ////
    showlocation: function () {
      var selfobj = this;
      $(".memberLocation").show();
      // ------locationpicker-----------
      $('#memberLocation').locationpicker({
        location: {
          latitude: selfobj.model.attributes.latitude,
          longitude: selfobj.model.attributes.longitude
        },
        center: {
          latitude: 21.7679,
          longitude: 78.8718
        },
        addressFormat: 'postal_code',
        radius: 500,
        zoom: 5,
        inputBinding: {
          locationNameInput: $('#address'),
        },
        enableAutocomplete: true,
        markerIcon: 'images/map-marker-2-xl.png',
        markerDraggable: true,
        markerVisible: true,
        onchanged: function (currentLocation, radius, isMarkerDropped) {
          var addressComponents = $(this).locationpicker('map').location.addressComponents;
          var loc = addressComponents.addressLine1 + " " + addressComponents.city + " " + addressComponents.stateOrProvince + " " + addressComponents.country;
          selfobj.model.set({ latitude: $(this).locationpicker('map').location.latitude });
          selfobj.model.set({ longitude: $(this).locationpicker('map').location.longitude });
          selfobj.model.set({ address: loc });
          $('#address').val(loc);
          $(".memberLocation").hide();
        }
      });
      // --------------------------------------
    },
    ///////////////////
    saveUserDetails: function (e) {
      e.preventDefault();
      var bid = this.model.get("adminID");
      console.log(bid)
      if (bid != "0" || bid == "") {
        var methodt = "POST";
      } else {
        console.log("here")
        var methodt = "PUT";
      }
      var oldPass = $('#oldPassword').val();
      var newPass = $('#newPassword').val();
      var confirmPass = $('#confirmNewPassword').val();
    
      if (oldPass != '') {
        if(newPass == ''){
          alert('New Password is Empty..!');
          return;
        } 
        if(confirmPass == ''){
          alert('Confirm Password is Empty..!'); 
          return;
        } 
        if (newPass !== confirmPass) {
          alert('New password and confirm password do not match.');
          return;
        }
      }
      (oldPass != '')? this.model.set({'isUpdatePassword': 'yes'}):this.model.set({'isUpdatePassword': 'no'});
      if ($("#userProfileDetails").valid()) {
        var selfobj = this;
        $(e.currentTarget).html("<span>Saving..</span>");
        $(e.currentTarget).attr("disabled", "disabled");
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: methodt
        }).done(function (res) {
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          if (res.flag == "F") {
            showResponse(e,res,'');
          } else {
            $(e.currentTarget).html("<span>Saved</span>");
            //scanDetails.filterSearch();
          }
          setTimeout(function () {
            $(e.currentTarget).html("<span>Save</span>");
            $(e.currentTarget).removeAttr("disabled");
          }, 3000);
        });
      }
    },
    initializeValidate: function () {
      var selfobj = this;
      $("#userProfileDetails").validate({
        rules: {
          photo: {
            required: true,
          },
          contactNo: {
            required: true,
            minlength: 10,
            maxlength: 10,
          },
          whatsappNo: {
            minlength: 10,
            maxlength: 10,
          }
        },
        messages: {
          photo: "Require photo size should be less than 1MB",
          contactNo: "Please enter atleast 10 characters",
          whatsappNo: "Please enter at least 10 characters",
        }
      });
      $("#contactNo").inputmask("Regex", { regex: "^[0-9](\\d{1,9})?$" });
      $("#whatsappNo").inputmask("Regex", { regex: "^[0-9](\\d{1,9})?$" });
      $('#dateOfBirth').datepickerBT({
        format: "dd-mm-yyyy",
        todayBtn: "linked",
        clearBtn: true,
        todayHighlight: true,
        endDate: new Date(),
        numberOfMonths: 1,
        autoclose: true,
      }).on('changeDate', function (ev) {
        var valuetxt = $("#dateOfBirth").val();
        selfobj.model.set({ "dateOfBirth": valuetxt });
        //alert(selfobj.model.get("dateOfBirth"));
      });
      // Initialize Slim image cropper
      var slim = $('.slim').slim();

      // Listen for the Slim's onUpload event
      slim.on('slim.upload', function (e, data) {
        // Handle onUpload event here
        console.log('Image has been uploaded.');
        console.log('Uploaded data:', data); // Data contains information about the uploaded image
      });

      var input = document.getElementById('google_location');
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        if (place == "") {
          selfobj.model.set({ "google_location": input.value() });
        } else {
          selfobj.model.set({ "google_location": place.formatted_address });
          selfobj.model.set({ "latitude": place.geometry['location'].lat() });
          selfobj.model.set({ "longitude": place.geometry['location'].lng() });
          selfobj.model.set({ "address_url": place.url });
          selfobj.initializeMap();
        }
      });
    },

    signInToOneDrive: function() {
      // Register your own application at https://apps.dev.microsoft.com
      // and set the "clientId" and "redirectUri" variables accordingly.
      
      var appInfo = {
        "clientId": "ab6ef5a7-1db5-4fcc-8aff-3b2da5f9790c",
        "redirectUri": APPPATH,
        "scopes": "user.read files.read files.read.all sites.read.all",
        "authServiceUri": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
      };
      console.log(appInfo);
      this.provideAppInfo(appInfo);

      // use Microsoft Graph v1.0
      var baseUrl = ""
      msGraphApiRoot = (baseUrl) ? baseUrl : "https://graph.microsoft.com/v1.0/me";
      
      this.challengeForAuth();

      this.saveToCookie( { "apiRoot": msGraphApiRoot, "signedin": true } );
      return false;
    },

    provideAppInfo: function(obj)
    {
      this.storedAppInfo  = obj;
    },

    challengeForAuth: function() {
      var appInfo = this.getAppInfo();
      var url =
        appInfo.authServiceUri +
        "?client_id=" + appInfo.clientId +
        "&response_type=token" +
        "&redirect_uri=" + encodeURIComponent(appInfo.redirectUri);
    
        if (appInfo.scopes)
          url = url + "&scope=" + encodeURIComponent(appInfo.scopes);
        if (appInfo.resourceUri)
          url = url + "&resource=" + encodeURIComponent(appInfo.resourceUri);
    
      this.popup(url);
    },

    getAppInfo: function() {

      if (this.storedAppInfo)
        return this.storedAppInfo;
    
      var scriptTag = document.getElementById("odauth");
      if (!scriptTag) {
        alert("the script tag for odauth.js should have its id set to 'odauth'");
      }
    
      var clientId = scriptTag.getAttribute("clientId");
      if (!clientId) {
        alert("the odauth script tag needs a clientId attribute set to your application id");
      }
    
      var scopes = scriptTag.getAttribute("scopes");
      // scopes aren't always required, so we don't warn here.
    
      var redirectUri = scriptTag.getAttribute("redirectUri");
      if (!redirectUri) {
        alert("the odauth script tag needs a redirectUri attribute set to your redirect landing url");
      }
    
      var resourceUri = scriptTag.getAttribute("resourceUri");
    
      var authServiceUri = scriptTag.getAttribute("authServiceUri");
      if (!authServiceUri) {
        alert("the odauth script tag needs an authServiceUri attribtue set to the oauth authentication service url");
      }
    
      var appInfo = {
        "clientId": clientId,
        "scopes": scopes,
        "redirectUri": redirectUri,
        "resourceUri": resourceUri,
        "authServiceUri": authServiceUri
      };
    
      this.storedAppInfo = appinfo;
    
      return appInfo;
    },

    saveToCookie: function(obj)
    {
      var expiration = new Date();
      expiration.setTime(expiration.getTime() + 3600 * 1000);
      var data = JSON.stringify(obj);
      var cookie = "odexplorer=" + data +"; path=/; expires=" + expiration.toUTCString();

      if (document.location.protocol.toLowerCase() == "https") {
        cookie = cookie + ";secure";
      }
      document.cookie = cookie;
    },

    popup: function(url) {
      var width = 525,
          height = 525,
          screenX = window.screenX,
          screenY = window.screenY,
          outerWidth = window.outerWidth,
          outerHeight = window.outerHeight;
    
      var left = screenX + Math.max(outerWidth - width, 0) / 2;
      var top = screenY + Math.max(outerHeight - height, 0) / 2;
    
      var features = [
                  "width=" + width,
                  "height=" + height,
                  "top=" + top,
                  "left=" + left,
                  "status=no",
                  "resizable=yes",
                  "toolbar=no",
                  "menubar=no",
                  "scrollbars=yes"];
      var popup = window.open(url, "oauth", features.join(","));
      if (!popup) {
        alert("failed to pop up auth window");
      }
    
      popup.focus();
    },

    onAuthCallback: function() {
      var authInfo = this.getAuthInfoFromUrl();
      var token = authInfo["access_token"];
      var expiry = parseInt(authInfo["expires_in"]);
      if (token)
      {
        setCookie(token, expiry);
        window.opener.onAuthenticated(token, window);
      }
    },

    getAuthInfoFromUrl: function() {
      if (window.location.hash) {
        var authResponse = window.location.hash.substring(1);
        var authInfo = JSON.parse(
          '{' + authResponse.replace(/([^=]+)=([^&]+)&?/g, '"$1":"$2",').slice(0,-1) + '}',
          function(key, value) { return key === "" ? value : decodeURIComponent(value); });
        return authInfo;
      }
      else {
        alert("failed to receive auth token");
      }
    },

    setCountryCode: function () {
      var value = this.model.get('country_code');
      $(".countrySelect .filter-option-inner-inner").text(value);
      var whatsAppCountry = this.model.get('whatsappCountryCodeNumber');
      $(".whatsappCountrySelect .filter-option-inner-inner").text(whatsAppCountry);
    },

    onAuthenticated: function(token, authWindow) {
      if (token) {
        if (authWindow) {
          removeLoginButton();
          authWindow.close();
        }

        (function($){
          // we extract the onedrive path from the url fragment and we
          // flank it with colons to use the api's path-based addressing scheme
          var path = "";
          var beforePath = "";
          var afterPath = "";
          if (window.location.hash.length > 1) {
            path = window.location.hash.substr(1);
            beforePath =":";
            afterPath = ":";
          }

          var odurl = msGraphApiRoot + "/drive/root" + beforePath + path + afterPath;

          // the expand and select parameters mean:
          //  "for the item i'm addressing, include its thumbnails and children,
          //   and for each of the children, include its thumbnails. for those
          //   thumbnails, return the 'large' size"
          var thumbnailSize = "large"
          var odquery = "?expand=thumbnails,children(expand=thumbnails(select=" + thumbnailSize + "))";
          console.log("token: " + token)
          $.ajax({
            url: odurl + odquery,
            dataType: 'json',
            headers: { "Authorization": "Bearer " + token },
            accept: "application/json;odata.metadata=none",
            success: function(data) {
              if (data) {
                // clear out the old content
                $('#od-items').empty();
                $('#od-json').empty();

                // add the syntax-highlighted json response
                $("<pre>").html(syntaxHighlight(data)).appendTo("#od-json");

                // process the response data. if we get back children (data.children)
                // then render the tile view. otherwise, render the "one-up" view
                // for the item's individual data. we also look for children in
                // 'data.value' because if this app is ever configured to reqeust
                // '/children' directly instead of '/parent?expand=children', then
                // they'll be in an array called 'data'
                var decodedPath = decodeURIComponent(path);
                document.title = "OneDrive Explorer" + ((decodedPath.length > 0) ? " - " + decodedPath : "");
                  
                updateBreadcrumb(decodedPath);
                var children = data.children || data.value;
                if (children && children.length > 0) {
                  $.each(children, function(i,item) {
                    var tile = $("<div>").
                      attr("href", "#" + path + "/" + encodeURIComponent(item.name)).
                      addClass("item").
                      click(function() {
                        // when the page changes in response to a user click,
                        // we set loadedForHash to the new value and call
                        // odauth ourselves in user-click mode. this causes
                        // the catch-all hashchange event handler not to
                        // process the page again. see comment at the top.
                        loadedForHash = $(this).attr('href');
                        window.location = loadedForHash;
                        odauth(true);
                      }).
                      appendTo("#od-items");

                    // look for various facets on the items and style them accordingly
                    if (item.folder) {
                      tile.addClass("folder");
                    }
                    if (item.file) {
                      tile.addClass("file");
                    }

                    if (item.thumbnails && item.thumbnails.length > 0) {
                      var container = $("<div>").attr("class", "img-container").appendTo(tile)
                      $("<img>").
                        attr("src", item.thumbnails[0][thumbnailSize].url).
                        appendTo(container);
                    }

                    $("<div>").
                      addClass("nameplate").
                      text(item.name).
                      appendTo(tile);
                  });
                }
                else if (data.file) {
                  // 1-up view
                  var tile = $("<div>").
                    addClass("item").
                    addClass("oneup").
                    appendTo("#od-items");

                  var downloadUrl = data['@microsoft.graph.downloadUrl'];
                  if (downloadUrl) {
                    tile.click(function(){window.open(downloadUrl, "Download");});
                  }

                  if (data.folder) {
                    tile.addClass("folder");
                  }

                  if (data.thumbnails && data.thumbnails.length > 0) {
                    $("<img>").
                      attr("src", data.thumbnails[0].large.url).
                      appendTo(tile);
                  }
                }
                else {
                  $('<p>No items in this folder.</p>').appendTo('#od-items');  
                }
              } else {
                $('#od-items').empty();
                $('<p>error.</p>').appendTo('#od-items');
                $('#od-json').empty();
              }
            }
          });
        })(jQuery);
      }
      else {
        alert("Error signing in");
      }
    },

    removeLoginButton: function() {
      if (typeof showCustomLoginButton === "function") {
        showCustomLoginButton(false);
        return;
      }
    
      var loginText = document.getElementById("loginText");
      if (loginText) {
        document.body.removeChild(loginText);
      }
    },

    initializeMap : function(){
      var selfobj = this;
      let lat = selfobj.model.attributes.latitude;
      let long = selfobj.model.attributes.longitude
      if ( lat != null && long != null){
        $('#memberLocation').locationpicker({
          location: {
              latitude: lat, 
              longitude: long,
          },
          radius:0,
          inputBinding: {
            locationNameInput: $('#google_location'),
          },
          enableAutocomplete: true,
          markerIcon: 'images/map-marker-2-xl.png',
          markerDraggable: true,
          markerInCenter: true,
          markerVisible : true,
           onchanged: function (currentLocation, radius, isMarkerDropped) {
              var addressComponents = $(this).locationpicker('map').location.addressComponents;
              selfobj.model.set({latitude:$(this).locationpicker('map').location.latitude});
              selfobj.model.set({longitude:$(this).locationpicker('map').location.longitude});
              selfobj.model.set({city:addressComponents.city});
              selfobj.model.set({state:addressComponents.stateOrProvince});
              selfobj.model.set({country:addressComponents.country});
              selfobj.model.set({cityShort:addressComponents.cityShort});
              selfobj.model.set({stateShort:addressComponents.stateOrProvinceShort});
              selfobj.model.set({countryShort:addressComponents.countryShort});
              selfobj.model.set({pincode:addressComponents.streetNumber});
          }
        });
      } 
    },

    render: function () {
      var source = userProfileTemp;
      var template = _.template(source);
      console.log(this.model.attributes);

      this.$el.html(template({ "model": this.model.attributes ,"userRoleList": this.userRoleList.models ,"companyCollection" : this.companyCollection.models,countryExtList: this.countryExtList }));
      $(".main_container").append(this.$el);
      $('#profilepic').slim({
        ratio: '1:1',
        minSize: {
          width: 100,
          height: 100,
        },
        size: {
          width: 100,
          height: 100,
        },
        push: true,
        rotateButton: true,
        service: APIPATH + 'changeProfilePic/' + $.cookie('authid'),
        download: false,
        willSave: function (data, ready) {
          //alert('saving!');
          ready(data);
        },
        
        didUpload: function (error, data, response) {
          var expDate = new Date();
          $(".overlap").css("display", "block");
          var newimage = $("#profilepic").find('img').attr("src");
          var fileName = response.newFileName
          $.cookie('photo', fileName);
          $.cookie('avtar', newimage, { path: COKI, expires: expDate });
          $("#myAccountRight").css("background-image", "url('" + newimage + "')");
        },
        willTransform: function (data, ready) {
          if ($("#profilepic").hasClass("pending")) {
            $(".overlap").css("display", "block");
          } else {
            var expDate = new Date();
            var newimage = $("#profilepic").find('img').attr("src");
            $.cookie('avtar', newimage, { path: COKI, expires: expDate });
            $("#myAccountRight").css("background-image", "url('" + newimage + "')");
          }
          ready(data);
        },
        willRemove: function (data, remove) {
          remove();
          var memberID = $.cookie('authid');
          console.log(data);
          $.ajax({
            url: APIPATH + 'delProfilePic/' + memberID,
            datatype: 'JSON',
            beforeSend: function (request) {
              request.setRequestHeader("token", $.cookie('_bb_key'));
              request.setRequestHeader("SadminID", $.cookie('authid'));
              request.setRequestHeader("contentType", 'application/x-www-form-urlencoded');
              request.setRequestHeader("Accept", 'application/json');
            },
            success: function (res) {
              if (res.flag == "F")
                showResponse(e,res,'');

              if (res.statusCode == 994) { app_router.navigate("bareback-logout", { trigger: true }); }
            }
          });
          remove();
        },
        label: 'Click here to add new image or Drop your image here.',
        buttonConfirmLabel: 'Ok',
        meta: {
          memberID: $.cookie('authid')
        }
      });
      
      $(".memberLocation").hide();
      $(".ws-select").selectpicker();
      
      if(this.model.get('adminID') != null)
      {
        $('.form-line').addClass('focused');
      }
      this.initializeValidate();
      this.setValues();
      this.initializeMap();
      this.setCountryCode();
      return this;
    },
  });

  return infoSingleView;

});
