$.fn.digits = function () {
  return this.each(function () {
    $(this).text($(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
  })
}

try {
  $.validator.addMethod("passwordtxt", function (value, element) {
    return this.optional(element) || /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
  }, "Invalid password format.");
  $.validator.addMethod("onlyalpha", function (value, element) {
    // allow any non-whitespace characters as the host part
    return this.optional(element) || /^[a-zA-Z0-9_]*$/.test(value);
  }, 'Please enter valid text.Only charactors and underscore allowed.');

  $.validator.addMethod("alpha", function(value, element) {
    return this.optional(element) || /^[a-zA-Z0-9\s]+$/.test(value);
  },'Please enter valid text.Only charactors,numbers and space allowed.');

} catch (error) {
  console.log("error menu active class" + error.message);
}
$(document).ready(function () {

  try{
    // use this to hide sub menu whne click out side the list.
    $(document).on('click', function(event) {
      if (!$(event.target).closest('.ml-menu').length && !$(event.target).closest('.menu').length) {
        $('.ml-menu').css("display","none");
      }
    });
    $("body").on('click','.arrageCol', function(event){
        event.stopPropagation();
    });
    $("body").on('change',"#selectDefCompany",function(e){
      var C_id = $(e.currentTarget).val();
      setDefaultCompany(C_id);
    });
    // lookup drop down position
    $.validator.addMethod("onlyalpha", function(value, element) {
      // allow any non-whitespace characters as the host part
      return this.optional( element ) || /^[a-zA-Z0-9_]*$/.test( value );
    }, 'Please enter valid text.Only charactors and underscore allowed.');
    $.validator.addMethod("alpha", function(value, element) {
      return this.optional(element) || /^[a-zA-Z0-9\s]+$/.test(value);
  },'Please enter valid text.Only charactors,numbers and space allowed.');
  
  
  }catch(error){
    console.log("error menu active class"+error.message);
  }
  setToolTip();
  setInterval(updateDateTime, 60000);

  $("body").on("focus", ".form-control", function () {
    $(this).parent().addClass("focused")
  })
  $("body").on("click", ".form-float .form-line .form-label", function () {
    $(this).parent().find("input").focus()
    $(this).parent().find("select").focus()
    $(this).parent().find("textarea").focus()
  });
  $("body").on("focusout", ".form-control", function () {
    var e = $(this);
    if (e.hasClass("bootstrap-select")) {
      if (e.find("select").val() !== "" && e.find("select").val() !== null) {
        e.parents(".form-group").find(".form-label").show();
        e.parents(".form-group").find(".form-line").addClass("focused");
        // add clear buttons
        e.parents(".form-group").find(".ws_clear").remove();
        e.parents(".form-group").find(".form-label").after("<span class='ws_clear material-icons'>close</span>");
      } else {
        e.parents(".form-group").find(".dropdown-toggle").addClass("bs-placeholder");
        e.parents(".form-group").find(".form-line").removeClass("focused");
        e.find("select").val(null).trigger('change');
      }
      return;
    }
  });
  $("body").on("click", ".ws_clear", function () {
    $(this).parents(".form-group").find("select").val(null).trigger('change');
    $(this).parents(".form-group").find(".filter-option-inner-inner").html("");
    $(this).parents(".form-group").find(".dropdown-toggle").addClass("bs-placeholder");
    $(this).remove();
  });
  $("body").on("click", ".ws-freetxt", function () {
    setTimeout(() => {
      let el = $(this).parents(".form-group").find(".freeSerachList");
      if(!el.is(':empty')){
        el.show();
      }
    }, 100);
  });
  $(window).click(function() {
    $(".freeSerachList").hide();
  });
  $("body").on("input", ".ws-freetxt", function () {
    setTimeout(() => {
      let el = $(this).parents(".form-group").find(".freeSerachList");
      if(!el.is(':empty')){
        el.show();
      }
    }, 100);
   
  });


  $("body").on("click", ".checkall", function (e) {
    var isSingleCheck = false;
    var id = $(e.currentTarget).attr("data-tocheck");
    if ($(this).is(":checked")) {
      $('body #' + id + ' input:checkbox').each(function () {

        $(this).prop("checked", true);
        $(this).closest("div").addClass("active");
        $('.action-icons-div').show();

      });
      $(".checkall").closest("div").addClass("active");// checkall
    } else {
      $('body #' + id + ' input:checkbox').each(function () {

        $(this).prop("checked", false);
        $(this).closest("div").removeClass("active");
        $('.action-icons-div').hide();
      });
      $(".checkall").prop("checked", false);
      $(".checkall").closest("div").removeClass("active");// checkall
    }
  });
  

  $(document).on('change', '#cAll', function (e) {

    if (!$(this).hasClass("checkall")) {

      if ($(this).is(":checked")) {
        $(this).closest("div").addClass("active");
      } else {
        $(this).closest("div").removeClass("active");
      }
    }
    var oneClick = false;
    $('body .tableList .listCheckbox input[type="checkbox"]').each(function () {
      if (!$(this).hasClass("checkall")) {
        if (!$(this).is(":checked")) {
          oneClick = true;
        }
      }

    });
    if (oneClick) {
      $(".checkall").prop("checked", false);
      $(".checkall").closest("div").removeClass("active");// checkall
    } else {
      $(".checkall").prop("checked", true);
      $(".checkall").closest("div").addClass("active");// checkall
    }
  });

  $(document).on('change', '.tableList .listCheckbox input[type="checkbox"]', function (e) {
    var isChecked = false;
    $('.tableList input:checkbox').each(function () {
      if ($(this).parent().hasClass('listCheckbox')){
        if ($(this).is(":checked")) {
          $(".deleteAll").show();
          $(".addAll").show();
          $(".editAll").show();
          isChecked = true;
          return '';
        }
      }
    });
    if (!isChecked) {
      $(".deleteAll").hide();
      $(".addAll").hide();
      $(".editAll").hide();
    } else {
      $(".deleteAll").show();
      $(".addAll").show();
      $(".editAll").show();
    }
  });


  $("body").on("click", ".item-container li", function () {

    var isSingle = $(this).attr("data-single");
    var validFor = $(this).parent().attr("data-valid");
    if (isSingle == "Y") {
      console.log(validFor);
      $(".item-container li." + validFor).removeClass("active");
      $(this).addClass("active");
    }
    else {
      $(this).toggleClass("active");
    }

  });
  // handel all application tooltip setting
  //$('[data-toggle="tooltip"]').tooltip();

  // handel all close overlays
  $("body").on("click", ".overlay-close", function (e) {
    e.stopImmediatePropagation()
    var toClose = $(this).attr("data-to-close");
    $("." + toClose).remove();
    //rearrageOverlays();
  });

  // handel all close overlays
  $("body").on("click", ".ws-overlay", function (e) {
    e.stopImmediatePropagation();
    var iscurrent = $(e.currentTarget).attr('data-current');
    if (iscurrent == "yes") { return; }
    // alert(iscurrent);
    $(".ws-overlay").attr('data-current', 'no');
    if (iscurrent != "yes") {
      $(e.currentTarget).attr('data-current', 'yes');
      $(this).appendTo(".overlay-main-container");
      //rearrageOverlays();
    }
  });
  // application color picker code
  COLORS = ["#fce7f6","#f8d6e7","#d6f8e7","#e7d7fd","#f1f9dd","#d6e6ff","#d3f8fd","#e8b8b8","#ecc975"];
  CAT_COLORS = ["#fce7f6","#f8d6e7","#d6f8e7","#e7d7fd","#f1f9dd","#d6e6ff","#d3f8fd","#e8b8b8","#ecc975","#ddec75","#bcec75","#75eca3","#2fb33d","#75e6ec","#75dbec","#75c5ec","#53a9d2","#759eec","#a447bf","#d54c86","#ec71a5","#fd5e5e","#939393","#c8c8c8"];
  getColorByInitials = function (initials) {
  let sum = 0;
    if (initials) {
      for (let i = 0; i < initials.length; i++) {
        sum += initials.charCodeAt(i);
      }
      const index = sum % COLORS.length;
      return COLORS[index];
    }
  }
  getFontColor = function (bgColor) {
    if (bgColor) {
      const rgb = hexToRgb(bgColor);
      const darkerRgb = {
        r: Math.max(0, rgb.r - 130),
        g: Math.max(0, rgb.g - 130),
        b: Math.max(0, rgb.b - 130)
      };
      const darkerHex = rgbToHex(darkerRgb.r, darkerRgb.g, darkerRgb.b);
      return `rgba(${darkerRgb.r}, ${darkerRgb.g}, ${darkerRgb.b}, 1)`;
    }
  }
  hexToRgb = function (hex) {
    if (hex) {
      hex = hex.replace(/^#/, '');
      const bigint = parseInt(hex, 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
      };
    }
  }
  rgbToHex = function (r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  // use this function to prevent the multiple same overlay windows
  checkisoverlay = function (overlayName) {
    var tt = $("#" + overlayName).length;
    if (tt > 0) {
      // $("#"+overlayName).attr('data-current','yes');
      // $("#"+overlayName).appendTo(".overlay-main-container");
      // rearrageOverlays(overlayName);
      return true;
    } else {
      // $(".ws-overlay").attr('data-current','no');
      // $("#"+overlayName).attr('data-current','yes');
      // $("#"+overlayName).appendTo(".overlay-main-container");
      //rearrageOverlays();
      return false;
    }
  }

  // side bar open and close setting
  $("body").on("click", ".sidebar-overlay", function () {
    alert("bar");
    $(".sidebar-overlay").removeClass("open");
    $(".sidebar-left-secondary").removeClass("open");
    $(".side-menu li").removeClass("active");
    $('.side-menu li[data-current="yes"]').addClass("active");
  });

  $("body").on("mouseover", ".side-menu li.subMenu", function () {
    $(".side-menu li").removeClass("active");
    var data = $(this).attr("data-nav");
    if (data != '' && typeof data !== "undefined") {
      $(this).addClass("active");
      $(".sidebar-overlay").addClass("open");
      $(".sidebar-left-secondary").addClass("open");
      $(".sub-nav").each(function (index) {
        if ($(this).attr("data-nav") == data) {
          $(this).addClass("open");
        } else {
          $(this).removeClass("open");
        }
      });
    } else {
      $(".sidebar-overlay").removeClass("open");
      $(".sidebar-left-secondary").removeClass("open");
    }
  });

  $("body").on("click", ".closeTab", function (e) {
    e.preventDefault();
    var toClose = $(e.currentTarget).attr("data-toclose");
    handelClose(toClose);
    $(".app_playground").removeClass("blur-background");
    $(".overlay-main-container").removeClass("settings-overlays");

    var $tabList = $("#subNavs");
    var $nextTab = $tabList.find('.nav-item:not([data-item="' + toClose + '"])').first();
    if ($nextTab.length > 0) {
      $nextTab.addClass('active');
      $nextTab.find('.nav-link').addClass('active');
      var tabId = $nextTab.find('a').attr('href');
      $(tabId).addClass('active');
    }
  });

  $("body").on("click", ".closeTabRight", function (e) {
    e.preventDefault();
    $("#subNavs li").remove();
    $(".overlay-main-container").removeClass("open");
    $(".app_playground").removeClass("blur-background");
    $(".overlay-main-container").removeClass("settings-overlays");
    $(".side-menu li").each(function () {
      $(this).removeClass("active");
    });
  });
  $(document).on(
    'keydown', function (event) {
      if (event.key == "Escape") {
        $(".ws_filterOptions").removeClass("open");
        $(".overlay-main-container").removeClass("open");
        $(".overlay-main-container").removeClass("settings-overlays");
      }
    });

});

setupLookup = function(){
  $('.ws-lookup-select').each(function() {
    console.log("found element");
    var $child = $(this);
    var $input = $child.find('input');
    var $dropdownMenu = $child.find('.dropdown-menu');
    $input.on('focus', function() {
        // Attach scroll event listener to all scrollable parents
        var $scrollableParents = $child.parents().filter(function() {
            return $(this).css('overflow') === 'auto' || $(this).css('overflow') === 'scroll';
        });
        //.panel_overflow
        $scrollableParents.on('scroll', function() {
          var $dropdownMenu = $child.find('.dropdown-menu');
            adjustDropdownPosition($input, $dropdownMenu);
        });
        $dropdownMenu.addClass('show');
        adjustDropdownPosition($input, $dropdownMenu);
    });

    $input.on('blur', function() {
        setTimeout(function() {
            $child.parents().off('scroll');
        }, 200); // Timeout to allow click on dropdown items
    });

    function adjustDropdownPosition($input, $dropdownMenu) {
        var inputOffset = $input.offset();
        var inputHeight = $input.outerHeight();
        var dropdownHeight = $dropdownMenu.outerHeight();
        //var dropdownOffset = $dropdownMenu.offset();
        var windowHeight = $(window).height();
        var scrollTop = $(window).scrollTop();
        var inputBottom = inputOffset.top + inputHeight;
        var spaceBelow = windowHeight - (inputBottom - scrollTop);
        //var spaceAbove = inputOffset.top - scrollTop;
        var movetoTOp = dropdownHeight - spaceBelow;
        $dropdownMenu.css({
          "max-height":windowHeight - scrollTop - inputOffset.top,
        });
        if(spaceBelow > dropdownHeight){
          $dropdownMenu.css({
            top:"0px",
            left:0,
            transform: 'translate3d(0px,'+(inputHeight) + 'px,0px)'
          });
        }
        if(spaceBelow < dropdownHeight){
          $dropdownMenu.css({
            top:"0px",
            left:0,
            transform: 'translate3d(0px,-'+(movetoTOp) + 'px,0px)'
          });
        }
    }
});

}
setToolTip = function () {
  setTimeout(() => {
    $('body [data-toggle="tooltip"]').popover(
      { trigger: "hover",
        template:'<div class="popover ws-popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div style="background:#ccc" class="popover-body"></div></div>'

       }
    );
    // $('body [data-toggle="tooltip"]').tooltip({
    //   position: {
    //     my: "center bottom-20",
    //     at: "center top",
    //     using: function (position, feedback) {
    //       $(this).css(position);
    //       $("<div>")
    //         .addClass("arrow")
    //         .addClass(feedback.vertical)
    //         .addClass(feedback.horizontal)
    //         .appendTo(this);
    //     }
    //   }
    // });
  }, 500);
}
inputTextActive = function () {
  $("body .form-control").each(function () {
    var e = $(this);
    if (e.is("input:text")) {
      if (e.val() !== "") {
        e.parents(".form-line").addClass("focused");
      }
    }
    // if (e.is("select")) {
    //   if (e.val() !== "") {
    //     e.parents(".form-line").addClass("focused");
    //     e.parents(".form-line").find(".form-label").show();
    //   } else {
    //     e.parents(".form-line").find(".form-label").hide();
    //   }
    // }
  });

}
setDefaultCompany = function(C_id)
  {
    var user_id = $.cookie('authid');
    var res = $.ajax({
      url: APIPATH + 'setDefualtCompany',
      method: 'GET',
      async: false,
      datatype: 'JSON',
      data : {user_id : user_id , company_id : C_id },
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
        if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
        if (res.flag == "S") {
          var expDate = new Date();
          expDate.setTime(expDate.getTime() + (120 * 60 * 12000)); // add 15 minutes
          $.cookie('company_id', C_id, { path: COKI, expires: expDate });
          console.log('comapany updated...!');
          console.log('Default company : ',DEFAULTCOMPANY);
          location.reload();  
        }
      }
    });
  }
rearrageOverlays = function (name, ID, type = "large") {
  inputTextActive();
  $(".overlay-main-container").removeClass("open");
  $(".ws_filterOptions").removeClass("open");
  $(".side-menu li").each(function () {
    $(this).removeClass("active");
    var item = $(this).attr("data-item");
    if (item == ID) {
      $(this).addClass("active");
    }
  });
  if (type == "large") {
    $(".overlay-main-container").addClass("open");
    var isactive = $("#sublink_" + ID).length;
    if (isactive <= 0) {

      //$(".tab-pane").removeClass("active");
      $(".nav-link").removeClass("active");
      $(".panel_overflow").removeClass("active");
      $("#" + ID).addClass("active");
      //<span class="closeTabRight" data-toClose="'+ID+'"><span class="material-icons">close</span></span>
      $("#subNavs").append('<li class="nav-item" data-item="' + ID + '"><a id="sublink_' + ID + '" class="nav-link in active" data-toggle="tab" href="#' + ID + '">' + name + '</a><span class="closeTab" data-toClose="' + ID + '"><span class="material-icons">close</span></span></li>');
    } else {
      // console.log("sdfsd");
      $(".nav-link").removeClass("active");
      $(".panel_overflow").removeClass("active");
      $("#sublink_" + ID).addClass("active");
      $("#" + ID).addClass("active");
    }
  } else if (type == "small") {
    $(".ws_filterOptions").addClass("open");
  }

}

  //use this fucntion to set background for Lead/Customer Kanban View
  setColor = function(color){
    var amount = 100;
    var col =  '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    // console.log(color);  
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(col)){
        c= col.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',0.1)';
    }
  }

function handelClose(toClose) {
  $("#sublink_" + toClose).closest(".nav-item").remove();
  var len = $("#subNavs").find(".nav-item").length;
  $("#" + toClose).remove();
  //$('#subNavs li:first a').addClass('active');
  if (len <= 0) {
    $(".overlay-main-container").removeClass("open");
  } else {
    $("#subNavs").first(".nav-item").addClass("active");
    // $("#subNavs").first(".nav-item").find(".nav-link").addClass("active");
    // $('.tab-pane').css('display', 'block');
  }
  var ID = $("#subNavs .nav-item.active").attr("data-item");
  $(".side-menu li").each(function () {
    $(this).removeClass("active");
    var item = $(this).attr("data-item");
    if (item == ID) {
      $(this).addClass("active");
    }
  });
}
function showResponse(e, res, btnTxt) {
  let rr = false;
  if (res.flag == "F") {
    showNotification("alert-danger", res.msg);
    $(e.currentTarget).html("<span>Error</span>");
    $(e.currentTarget).removeAttr("disabled");
    
  } else {
    showNotification("alert-success", "Saved..", null, null, null, null);
    $(e.currentTarget).html("<span>Saved</span>");
    rr = true;
  }
  setTimeout(function () {
    $(e.currentTarget).html("<span>" + btnTxt + "</span>");
    $(e.currentTarget).removeAttr("disabled");
  }, 500);
  return rr;
}
//   if ($("input.flat")[0]) {
//     $(document).ready(function () {
//         $('input.flat').iCheck({
//             checkboxClass: 'icheckbox_flat-green',
//             radioClass: 'iradio_flat-green'
//         });
//     });
// }

function showNotification(colorName, text, placementFrom, placementAlign, animateEnter, animateExit) {
  if (colorName === null || colorName === '') { colorName = 'alert-info'; }
  if (text === null || text === '') { text = ''; }
  if (animateEnter === null || animateEnter === '') { animateEnter = 'animated fadeInDown'; }
  if (animateExit === null || animateExit === '') { animateExit = 'animated fadeOutUp'; }
  if (placementFrom === null || placementFrom === '') { placementFrom = 'top'; }
  if (placementAlign === null || placementAlign === '') { placementAlign = 'right'; }
  var allowDismiss = true;

  $.notify({
    message: text
  },
    {
      type: colorName,
      allow_dismiss: allowDismiss,
      newest_on_top: true,
      timer: 100,
      placement: {
        from: placementFrom,
        align: placementAlign
      },
      animate: {
        enter: animateEnter,
        exit: animateExit
      },
      template: '<div data-notify="container" class="bootstrap-notify-container alert alert-dismissible {0} ' + (allowDismiss ? "p-r-30" : "") + '" role="alert">' +
        '<button type="button" aria-hidden="true" class="close notifyClose" data-notify="dismiss">×</button>' +
        '<span data-notify="icon"></span> ' +
        '<span data-notify="title">{1}</span> ' +
        '<span data-notify="message">{2}</span>' +
        '<div class="progress" data-notify="progressbar">' +
        '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
        '</div>' +
        '<a href="{3}" target="{4}" data-notify="url"></a>' +
        '</div>'
    });
}

getLocalData = function (refresh = false) {

  //console.log("sdfsfsfdsdfsdffsd");
  if (typeof (Storage) == "undefined") {
    alert("Sorry! Your browser not support web storage. Some functionality may not work.Please Update your browser with latest version.");
  } else {
    console.log("OK local storage");
  }
  localStorage.removeItem("roleDetails");

  if (typeof (localStorage.roleDetails) == "undefined" || refresh== true) {
    $.ajax({
      url: APIPATH + 'getUserPermission/',
      method: 'GET',
      async: false,
      data: {},
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
          app_router.navigate("logout", { trigger: true });
        }
        console.log(res.data);
        localStorage.setItem("roleDetails", JSON.stringify(res.data));
        ROLE = JSON.parse(localStorage.roleDetails);

      }
    });
  }
}
setPagging = function (paginginfo, loadstate, msg) {
  $(".showPageDetails .pagination").empty();
  var showlink = true;
  if (paginginfo.end > paginginfo.totalRecords) {
    var recset = "Showing " + (paginginfo.start + 1) + " to " + paginginfo.totalRecords + " of " + paginginfo.totalRecords + " entries";
  }
  else {
    var recset = "Showing " + (paginginfo.start + 1) + " to " + paginginfo.end + " of " + paginginfo.totalRecords + " entries";
  }

  $(".page-info").html(recset);
  // check total page
  var className = "";
  var pageSet = 6;
  if (showlink) {
    var lik = '<li class="paginate_button page-item previous showpage" id="datatable-checkbox_previous" data-dt-idx="' + paginginfo.prevPage + '"><a class="page-link" href="javascript:;"><i class="material-icons"> chevron_left</i></a></li>';
    $(".showPageDetails .pagination").append(lik);
    var totpage = Math.ceil(paginginfo.totalRecords / paginginfo.pageLimit);
    if (totpage == 1) {
      totpage = 0;
    }

    var cpa = (paginginfo.curPage);
    let loadedFrom ="";
    if(paginginfo.loadFrom != undefined){
      loadedFrom = paginginfo.loadFrom;
    }
    if (paginginfo.prevPage != 0) {
      var startto = (cpa - (pageSet / 2));
      if (startto < 0) {
        startto = 0;
      }
    } else {
      var startto = 0;
    }
    for (var i = startto; i <= (parseInt(cpa) + (pageSet / 2)); i++) {
      if (i < totpage) {
        if (i == cpa) {
          className = "active";
        } else {
          className = "";
        }
        var lik = '<li data-loadFrom="'+loadedFrom+'" class="paginate_button page-item showpage ' + className + '" data-dt-idx="' + (i) + '"><a href="javascript:;" class="page-link" aria-controls="datatable-checkbox">' + (i + 1) + '</a></li>';
        $(".showPageDetails .pagination").append(lik);
      }
    }
    var lik = '<li data-loadFrom="'+loadedFrom+'" class="paginate_button page-item next showpage" id="datatable-checkbox_next" data-dt-idx="' + (paginginfo.nextpage) + '"><a href="javascript:;" class="page-link" aria-controls="datatable-checkbox" tabindex="0"><i class="material-icons">chevron_right</i></a></li>';
    $(".showPageDetails .pagination").append(lik);

  }
  if (cpa == 0) {
    $(".showPageDetails .pagination .previous").addClass("disabled");
  }
  if (loadstate === false) {
    $(".showPageDetails .pagination .next").addClass("disabled");
    $(".profile-loader-msg").html(msg);
    $(".profile-loader-msg").show();
  } else {
    $(".profile-loader-msg").hide();
    //$(".showPageDetails .pagination .next").show(); 

  }
},

numberFormat = function (num, tonm) {
  var isn = $.isNumeric(num);
  if (isn) {
    // console.log(num);
    return Number.parseFloat(num).toFixed(tonm);
  } else {
    return 0.00;
  }
};
formatDate = function (date, disTime) {

  if (date != "0000-00-00 00:00:00" && date != "0000-00-00" && date != null && date != "") {
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var timezone = "AM";
    var hour = "", minutes = "";
    var d = new Date(date),
      fragments = [
        d.getHours(),
        d.getMinutes(),
        d.getDate(),
        d.getMonth(),
        d.getFullYear()
      ];
    if (fragments[0] > 12) {
      timezone = "PM";
      hour = ((fragments[0]) - 12);
    } else {
      if (fragments[0] > 9) { hour = fragments[0] } else { hour = "0" + fragments[0] };
    }
    if (fragments[1] < 9) { minutes = "0" + fragments[1]; } else { minutes = fragments[1]; }
    if (hour != null && minutes != null) {
      if (disTime == 'yes') {
        return monthNames[fragments[3]] + " " + fragments[2] + ", " + fragments[4] + " " + hour + ":" + minutes + " " + timezone;
      } else {
        return monthNames[fragments[3]] + " " + fragments[2] + ", " + fragments[4];
      }
    }
    else {
      return monthNames[fragments[3]] + " " + fragments[2] + ", " + fragments[4];
    }
  } else {
    return "--";
  }
};

sha1 = function (str) {
  //  discuss at: http://phpjs.org/functions/sha1/
  // original by: Webtoolkit.info (http://www.webtoolkit.info/)
  // improved by: Michael White (http://getsprink.com)
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //    input by: Brett Zamir (http://brett-zamir.me)
  //  depends on: utf8_encode
  //   example 1: sha1('Kevin van Zonneveld');
  //   returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'

  var rotate_left = function (n, s) {
    var t4 = (n << s) | (n >>> (32 - s));
    return t4;
  };

  var cvt_hex = function (val) {
    var str = '';
    var i;
    var v;

    for (i = 7; i >= 0; i--) {
      v = (val >>> (i * 4)) & 0x0f;
      str += v.toString(16);
    }
    return str;
  };

  var blockstart;
  var i, j;
  var W = new Array(80);
  var H0 = 0x67452301;
  var H1 = 0xEFCDAB89;
  var H2 = 0x98BADCFE;
  var H3 = 0x10325476;
  var H4 = 0xC3D2E1F0;
  var A, B, C, D, E;
  var temp;

  // str = this.utf8_encode(str);
  var str_len = str.length;

  var word_array = [];
  for (i = 0; i < str_len - 3; i += 4) {
    j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
    word_array.push(j);
  }

  switch (str_len % 4) {
    case 0:
      i = 0x080000000;
      break;
    case 1:
      i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
      break;
    case 2:
      i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
      break;
    case 3:
      i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) <<
        8 | 0x80;
      break;
  }

  word_array.push(i);

  while ((word_array.length % 16) != 14) {
    word_array.push(0);
  }

  word_array.push(str_len >>> 29);
  word_array.push((str_len << 3) & 0x0ffffffff);

  for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
    for (i = 0; i < 16; i++) {
      W[i] = word_array[blockstart + i];
    }
    for (i = 16; i <= 79; i++) {
      W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
    }

    A = H0;
    B = H1;
    C = H2;
    D = H3;
    E = H4;

    for (i = 0; i <= 19; i++) {
      temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }

    for (i = 20; i <= 39; i++) {
      temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }

    for (i = 40; i <= 59; i++) {
      temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }

    for (i = 60; i <= 79; i++) {
      temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }

    H0 = (H0 + A) & 0x0ffffffff;
    H1 = (H1 + B) & 0x0ffffffff;
    H2 = (H2 + C) & 0x0ffffffff;
    H3 = (H3 + D) & 0x0ffffffff;
    H4 = (H4 + E) & 0x0ffffffff;
  }

  temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
  return temp.toLowerCase();
}
md5 = function (str) {
  var xl;
  var rotateLeft = function (lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  };
  var addUnsigned = function (lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  };

  var _F = function (x, y, z) {
    return (x & y) | ((~x) & z);
  };
  var _G = function (x, y, z) {
    return (x & z) | (y & (~z));
  };
  var _H = function (x, y, z) {
    return (x ^ y ^ z);
  };
  var _I = function (x, y, z) {
    return (y ^ (x | (~z)));
  };

  var _FF = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var _GG = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var _HH = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var _II = function (a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  };

  var convertToWordArray = function (str) {
    var lWordCount;
    var lMessageLength = str.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = new Array(lNumberOfWords - 1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  };

  var wordToHex = function (lValue) {
    var wordToHexValue = "",
      wordToHexValue_temp = "",
      lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = "0" + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  };

  var x = [],
    k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22,
    S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20,
    S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23,
    S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21;

  //str = this.utf8_encode(str);
  x = convertToWordArray(str);
  a = 0x67452301;
  b = 0xEFCDAB89;
  c = 0x98BADCFE;
  d = 0x10325476;

  xl = x.length;
  for (k = 0; k < xl; k += 16) {
    AA = a;
    BB = b;
    CC = c;
    DD = d;
    a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

  return temp.toLowerCase();
}
function updateDateTime() {
  var now = new Date();
    var date = now.getDate();
    var month = now.toLocaleString('default', { month: 'long' });
    var day = now.toLocaleString('default', { weekday: 'short' });
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    var timeDisplay = `${hours}.${minutes} ${ampm}`;

    $('#date').text(date);
    $('#month').text(month + ", ");
    $('#day').text(day);
    $('#time').text(timeDisplay);

  var colors={
    'Mon': '#757797',
    'Tue': '#BA5347',
    'Wed': '#88CB4D',
    'Thu': '#C5CA43',
    'Fri': '#D832AC',
    'Sat': '#5F60AC,',
    'Sun': '#D49138'
};
var dayElement = $('#day');
var color = colors[day];

dayElement.css('color', color);
$('#date').css('color', color);
$('#month').css('color', color);
$('#time').css('color', color);
}