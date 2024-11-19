define([
    "jquery",
    "underscore",
    "backbone",
    "validate",
    "inputmask",
    "Quill",
    'Swal',
    "../../core/views/multiselectOptions",
    "../../readFiles/views/readFilesView",
    '../../menu/models/iconListModel',
    "../models/templateSingleModel",
    "text!../templates/templateSingleTemp.html",
],  function ($, _, Backbone, validate, inputmask, Quill,Swal, multiselectOptions, readFilesView, iconListModel, templateSingleModel, templateSingleTemp) {
    var templateSingleView = Backbone.View.extend({
        model: templateSingleModel,
        activeElement:'',
        elements:{
            section_link:true,
            button:true,
            icons:true,
            twoColumns : true,
            threeColumns : false,
        },
        __rows: 0,
        __current_col_edit: "",
        __columnsSize: {
            "col-1": { type: "col-1", size: "12" },
            "col-2": { type: "col-2", size: "6,6" },
            "col-3": { type: "col-3", size: "8,4" },
            "col-4": { type: "col-4", size: "4,8" },
        },
        __margintype: {
            ws_m_0: "margin-top",
            ws_m_1: "margin-right",
            ws_m_2: "margin-bottom",
            ws_m_3: "margin-left",
        },
        __paddingtype: {
            ws_p_0: "padding-top",
            ws_p_1: "padding-right",
            ws_p_2: "padding-bottom",
            ws_p_3: "padding-left",
        },
        __borderWidth: {
            ws_bw_0: "border-top-width",
            ws_bw_1: "border-right-width",
            ws_bw_2: "border-bottom-width",
            ws_bw_3: "border-left-width",
        },
        __borderStyle: {
            ws_bs_0: "border-top-style",
            ws_bs_1: "border-right-style",
            ws_bs_2: "border-bottom-style",
            ws_bs_3: "border-left-style",
        },
        __borderColor: {
            ws_bc_0: "border-top-color",
            ws_bc_1: "border-right-color",
            ws_bc_2: "border-bottom-color",
            ws_bc_3: "border-left-color",
        },
        __borderRadius: {
            ws_br_0: "border-top-left-radius",
            ws_br_1: "border-top-right-radius",
            ws_br_2: "border-bottom-left-radius",
            ws_br_3: "border-bottom-right-radius",
        },
        __coltypeMob: {
            "12/12": "col-12",
            "11/12": "col-11",
            "10/12": "col-10",
            "9/12": "col-9",
            "8/12": "col-8",
            "7/12": "col-7",
            "6/12": "col-6",
            "5/12": "col-5",
            "4/12": "col-4",
            "3/12": "col-3",
            "2/12": "col-2",
            "1/12": "col-1",
        },
        __coltypTab: {
            "12/12": "col-md-12",
            "11/12": "col-md-11",
            "10/12": "col-md-10",
            "9/12": "col-md-9",
            "8/12": "col-md-8",
            "7/12": "col-md-7",
            "6/12": "col-md-6",
            "5/12": "col-md-5",
            "4/12": "col-md-4",
            "3/12": "col-md-3",
            "2/12": "col-md-2",
            "1/12": "col-md-1",
        },
        __coltypDesk: {
            "12/12": "col-lg-12",
            "11/12": "col-lg-11",
            "10/12": "col-lg-10",
            "9/12": "col-lg-9",
            "8/12": "col-lg-8",
            "7/12": "col-lg-7",
            "6/12": "col-lg-6",
            "5/12": "col-lg-5",
            "4/12": "col-lg-4",
            "3/12": "col-lg-3",
            "2/12": "col-lg-2",
            "1/12": "col-lg-1",
        },        
        __toolbarOptions: [
            ["bold", "italic", "underline", "strike"], // toggled buttons
            ["blockquote", "code-block"],
            [{ header: 1 }, { header: 2 }], // custom button values
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }], // superscript/subscript
            [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
            [{ direction: "rtl" }], // text direction
            [{ size: ["small", false, "large", "huge"] }], // custom dropdown
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }], // dropdown with defaults from theme
            [{ font: [] }],
            // [{ 'font': ['arial', 'times new roman', 'verdana'] }],
            [{ align: [] }],
            ["link"],
            ["clean"], // remove formatting button
        ],

        initialize: function (options) {
            var selfobj = this;
            this.multiselectOptions = new multiselectOptions();
            this.toClose = "templateSingleView";
            this.columnlist = [];
            this.menuID = "";
            this.pluginName = Backbone.history.getFragment();
            this.form_label = options.form_label;
            this.iconList = new iconListModel();
            this.model = new templateSingleModel();
            scanDetails = options.searchTemp;
            $(".popupLoader").show();
            this.menuList = options.menuList;
            if (options.temp_id) {
                this.model.set({ temp_id: options.temp_id });
                this.model
                .fetch({
                    headers: {
                    contentType: "application/x-www-form-urlencoded",
                    SadminID: $.cookie("authid"),
                    token: $.cookie("_bb_key"),
                    Accept: "application/json",
                    },
                    data: {}, error: selfobj.onErrorHandler,
                })
                .done(function (res) {
                    if (res.flag == "F") showResponse('',res,'');
                    if (res.statusCode == 994) {
                        app_router.navigate("logout", { trigger: true });
                    }
                    $(".popupLoader").hide();
                    if (res.data[0].module_name != null && res.data[0].module_name != undefined && res.data[0].module_name != "") {
                        selfobj.menuID = res.data[0].module_name;
                        selfobj.getColumnList();
                    } else {
                        selfobj.menuID = "";
                    }
                    selfobj.render();
                });
            } else {
                selfobj.render();
                $(".popupLoader").hide();
            }
        },

        events: {
            "click .saveTempDetails": "saveTempDetails",
            "change .dropval": "updateOtherDetails",
            "blur .txtchange": "updateOtherDetails",
            "click .multiSel": "setValues",
            "blur .multiselectOpt": "updatemultiSelDetails",
            "click .singleSelectOpt": "selectOnlyThis",
            "click .loadMedia": "loadMedia",
            "click .addRow": "addRow",
            "click .first-column-add": "addRowsInSection",
            "click .iconSelection": "setIconValues",
            "input #iconSearch": "searchIcon",
        },

        onErrorHandler: function (collection, response, options) {
            Swal.fire('Something was wrong ! Try to refresh the page or contact administer. :(', '', 'info');
            $(".profile-loader").hide();
        },

        getSelectedFile: function (url) {
            $("." + this.elm).val(url);
            $("." + this.elm).change();
            $("#profile_pic_view").attr("src", url);
            $("#profile_pic_view").css({ "max-width": "100%" });
            $("#largeModal").modal("toggle");
            this.model.set({ temp_image: url });
        },

        loadMedia: function (e) {
            e.stopPropagation();
            $("#largeModal").modal("toggle");
            this.elm = "profile_pic";
            new readFilesView({ loadFrom: "addpage", loadController: this });
        },

        updateOtherDetails: function (e) {
            var selfobj = this;
            var valuetxt = $(e.currentTarget).val();
            var toName = $(e.currentTarget).attr("id");
            var newdetails = [];
            newdetails["" + toName] = valuetxt;
            selfobj.menuID = valuetxt;
            this.model.set(newdetails);
            if (this.model.get(toName) && Array.isArray(this.model.get(toName))) {
                this.model.set(toName, this.model.get(toName).join(","));
            }
            if (toName == "module_name") {
                selfobj.getColumnList();
            }
        },

        updatemultiSelDetails: function (e) {
            var valuetxt = $(e.currentTarget).val();
            var toName = $(e.currentTarget).attr("id");
            var existingValues = this.model.get(toName);
            if (existingValues === null || existingValues === undefined) {
                existingValues = '';
            } else if (typeof existingValues !== 'string') {
                existingValues = existingValues.toString();
            }
            existingValues = existingValues.replace(/NULL/ig, '');
            existingValues = existingValues.replace(/^,|,$/g, '');
            if ($(e.currentTarget).prop('checked')) {
                if (existingValues.indexOf(valuetxt) === -1) {
                    existingValues += (existingValues.length > 0 ? ',' : '') + valuetxt;
                }
            } else {
                existingValues = existingValues.split(',').filter(value => value !== valuetxt).join(',');
            }
            this.model.set({ [toName]: existingValues });
          },

        selectOnlyThis: function (e) {
            var clickedCheckbox = e.currentTarget;
            var valueTxt = $(clickedCheckbox).val();
            var toName = $(clickedCheckbox).attr("id");
            this.$('input[name="' + toName + '"]').not(clickedCheckbox).prop("checked", false);
            var existingData = this.model.get(toName);
            this.model.set(toName,$(clickedCheckbox).prop("checked") ? valueTxt : null);
        },

        setOldValues: function () {
            var selfobj = this;
            setvalues = ["status","clickable_template"];
            selfobj.multiselectOptions.setValues(setvalues, selfobj);
        },

        setValues: function (e) {
            var selfobj = this;
            var da = selfobj.multiselectOptions.setCheckedValue(e);
            selfobj.model.set(da);
        },

        saveTempDetails: function (e) {
            e.preventDefault();
            var selfobj = this;
            selfobj.saveTemplate(e);
            var temp_id = this.model.get("temp_id");
            let isNew = $(e.currentTarget).attr("data-action");
            if (temp_id == "" || temp_id == null) {
                var methodt = "PUT";
            } else {
                var methodt = "POST";
            }
            if ($("#templateDetails").valid()) {
                $(e.currentTarget).html("<span>Saving..</span>");
                $(e.currentTarget).attr("disabled", "disabled");
                this.model.save({},
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            SadminID: $.cookie("authid"),
                            token: $.cookie("_bb_key"),
                            Accept: "application/json",
                        },
                        error: selfobj.onErrorHandler,
                        type: methodt,
                    }
                )
                .done(function (res) {
                    if (res.flag == "F") showResponse('',res,'');
                    if (res.statusCode == 994) {
                        app_router.navigate("logout", { trigger: true });
                    }
                    if (isNew == "new") {
                        showResponse(e, res, "Save & New");
                    } else {
                        showResponse(e, res, "Save");
                    }
                    scanDetails.filterSearch();
                    if (res.flag == "S") {
                        if (isNew == "new") {
                            selfobj.model.clear().set(selfobj.model.defaults);
                            selfobj.render();
                        } else {
                            handelClose(selfobj.toClose);
                        }
                    }
                });
            }
        },

        saveTemplate:function(els){
            var selfobj = this;
            const styleToString = (style) => {
                return Object.keys(style).reduce((acc, key) => (
                    acc + key.split(/(?=[A-Z])/).join('-').toLowerCase() + ':' + style[key] + ';'
                ), '');
            };
            var allCss = "";
            var temptemplate = $(".templateDummy");
            temptemplate.html($("#metadataContainer").html());
            temptemplate.find(".rowHeaders").remove();
            temptemplate.find(".elm-action").remove();
            temptemplate.find(".ws-col-header").remove();
            temptemplate.find(".ws-element-wrapper").addClass("row");
            temptemplate.find(".rowData").removeClass("row");
            // remove all default add things
            temptemplate.find(".first-column-add.default").remove();
            temptemplate.find(".first-column-add.bt").remove();
            // remove all default icons
            temptemplate.find(".icon").remove();
            temptemplate.find(".fieldsDragDrop").remove();
            temptemplate.find(".drag-drop-item").removeClass("ui-draggable ui-draggable-handle ui-sortable-handle");
            temptemplate.find(".rowData").removeClass("ui-sortable-handle");
            // rowData extract
            temptemplate.find(".rowData").each(function(e){
                var tt = $(this).attr("data-row-type");
                $(this).removeClass("container-fluid");
                $(this).removeClass("container");
                var acss = $(this).attr("data-add-css");
                if(typeof(acss) != "undefined"  && acss != ""){
                    $(this).addClass(acss);
                }
                if(typeof(tt) == "undefined"  || tt == ""){
                        $(this).addClass("container-fluid");    
                }else{
                    if(tt == "container-with-row"){
                        var rels = $("<div/>",{
                            class:"container"
                        });
                        rels.append($(this).html());
                        $(this).empty();
                        $(this).addClass("container-fluid");
                        $(this).append(rels);
                    }else{
                        $(this).addClass(tt);
                    }
                }
            });
            // ws-row-col extract
            temptemplate.find(".ws-row-col").each(function(e){
                // check mobile and tablet view
                var mobileView = $(this).attr("data-mobile");
                var tabletView = $(this).attr("data-tablet"); 
                var mobileFont = $(this).attr("data-mobile-font");
                var tabletFont = $(this).attr("data-tablet-font"); 
                var csfull = $(this).attr("data-meta-css");
                var css = "";
                if(typeof(csfull) != "undefined"){
                    var css = "."+$(this).attr("id")+" {" + styleToString(JSON.parse($(this).attr("data-meta-css")))+ "} ";
                }
                var btClass="";
                for (let index = 1; index <= 12; index++) {
                    var cc = "ws-col-size-"+index;
                    if($(this).hasClass(cc)){
                        btClass = "col-lg-"+index;
                    }else{
                    
                    }
                }
                if(typeof(mobileView) != "undefined" && mobileView !="select"){
                    if(mobileView == "none"){
                        btClass = btClass+" d-none d-sm-block d-md-block";
                    }else{
                        btClass = btClass+" "+selfobj.__coltypeMob[""+mobileView];
                    }
    
                }
                if(typeof(tabletView) != "undefined" && tabletView !="select"){
                    if(tabletView == "none"){
                        btClass = btClass+" d-none d-md-block d-lg-block";
                    }else{
                        btClass = btClass+" "+selfobj.__coltypTab[""+tabletView];
                    }
                }
                $(this).removeClass();
                $(this).addClass(btClass);
                // Set font size for mobile view
                if (typeof(mobileFont) !== "undefined" && mobileFont !== "") {
                    css += "@media (max-width: 767px) { ." + $(this).attr("id") + " { font-size: " + mobileFont + "px; } } ";
                }
                // Set font size for tablet view
                if (typeof(tabletFont) !== "undefined" && tabletFont !== "") {
                    css += "@media (min-width: 768px) and (max-width: 991px) { ." + $(this).attr("id") + " { font-size: " + tabletFont + "px; } } ";
                }
                allCss = allCss+css;
                var acss = $(this).attr("data-add-css");
                let parentDiv = $("<div/>");
                if(typeof(acss) != "undefined"  && acss != ""){
                    parentDiv.addClass(acss);
                }
                parentDiv.append($(this).children());
                parentDiv.addClass($(this).attr("id"));
                var islink = $(this).attr('data-block-link');
                if(islink != "" && islink !=undefined){
                    var link = $("<div>",{
                        class:"clickable-block",
                        style: "cursor: pointer",
                        onclick:"location.href='"+$(this).attr('data-block-link')+"';",
                    });
                    link.append(parentDiv);
                    $(this).empty();
                    $(this).append(link);
                }else{
                    $(this).empty();
                    $(this).append(parentDiv);
                }
                $(this).removeAttr("data-add-css");
                $(this).removeAttr("data-meta-css");
            });
            // ws-element-wrapper extract
            temptemplate.find(".ws-element-wrapper").each(function(e){
                var mobileView = $(this).attr("data-mobile");
                var tabletView = $(this).attr("data-tablet"); 
                var desktopView = $(this).attr("data-desktop"); 
                let btClass="";
                // for (let index = 1; index <= 12; index++) {
                //     var cc = "ws-col-size-"+index;
                //     if($(this).hasClass(cc)){
                //         btClass = "col-lg-"+index;
                //     }else{
                    
                //     }
                // }
                if(typeof(mobileView) != "undefined" && mobileView !="select"){
                    if(mobileView == "none"){
                        btClass = btClass+" d-none d-sm-block d-md-block";
                    }else{
                        btClass = btClass+" "+selfobj.__coltypeMob[""+mobileView];
                    }
    
                }
                if(typeof(tabletView) != "undefined" && tabletView !="select"){
                    if(tabletView == "none"){
                        btClass = btClass+" d-none d-md-block d-lg-block";
                    }else{
                        btClass = btClass+" "+selfobj.__coltypTab[""+tabletView];
                    }
                }
                if(typeof(desktopView) != "undefined" && desktopView !="select"){
                    if(desktopView == "none"){
                        btClass = btClass+" d-none d-md-block d-lg-block";
                    }else{
                        btClass = btClass+" "+selfobj.__coltypDesk[""+desktopView];
                    }
                }
                console.log("btClass",btClass);
                $(this).removeClass();
                // $(this).addClass(btClass);
                var csfull = $(this).attr("data-meta-css");
                var css = "";
                if(typeof(csfull) != "undefined"){
                    var css = "."+$(this).attr("id")+" { " + styleToString(JSON.parse($(this).attr("data-meta-css")))+ " } ";
                }
                $(this).removeClass();
                var rlccss = $(this).attr("id") + " row";
                $(this).closest(".rowData").addClass(rlccss);
                $(this).closest(".rowData").removeClass("row");
                $(this).addClass("row");
                allCss = allCss+css;
                var acss = $(this).attr("data-add-css");
                if(typeof(acss) != "undefined"  && acss != ""){
                    $(this).closest(".rowData").addClass(acss);
                }
                if(typeof(btClass) != "undefined"  && btClass != ""){
                    $(this).closest(".rowData").addClass(btClass);
                }
                $(this).removeAttr("data-add-css");
                $(this).removeAttr("data-meta-css");
                var islink = $(this).attr('data-block-link');
                if(islink != "" && islink !=undefined){
                    $(this).removeClass("row");
                    var link = $("<div>",{
                        class:"clickable-row",
                        style: "cursor: pointer",
                        onclick:"location.href='"+$(this).attr('data-block-link')+"';",
                    });
                    link.append($(this).html());
                    $(this).empty();
                    $(this).append(link);
                }
            });
            // ws-button-link extract
            temptemplate.find(".ws-button-link").each(function(e){
                var btn = $("<button>",{
                    width:$(this).attr('data-width'),
                    height:$(this).attr('data-height'),
                    onclick:"location.href='redirectLink'",
                    title:$(this).attr('data-alt'),
                });
                btn.append($(this).attr('data-alt'));
                btn.addClass($(this).attr("id"));
                $(this).empty();
                $(this).append(btn);
            });
            // ws-icon-link extract
            temptemplate.find(".ws-icon-link").each(function(e){
                var icon = $("<i>",{
                    icon:$(this).attr('data-icon'),
                });
                icon.addClass("material-icons");
                icon.addClass($(this).attr("id"));
                icon.append($(this).attr('data-icon'));
                $(this).empty();
                $(this).append(icon);
            });
            temptemplate.find(".ws-link-text").each(function(e){
                var link = $("<a>",{
                    href:"redirectLink"
                });
                link.addClass($(this).attr("id"));
                link.append($(this).attr('data-alt'));
                $(this).empty();
                $(this).append(link);
            });
             // ws-data-element extract
            temptemplate.find(".ws-data-element").each(function(e){
                var csfull = $(this).attr("data-meta-css");
                var css = "";
                if(typeof(csfull) != "undefined"){
                    var css = "."+$(this).attr("id")+" { " + styleToString(JSON.parse($(this).attr("data-meta-css")))+ " } ";
                }
                $(this).removeClass();
                $(this).addClass($(this).attr("id"));
                allCss = allCss+css;
                var acss = $(this).attr("data-add-css");
                if(typeof(acss) != "undefined"  && acss != ""){
                    $(this).addClass(acss);
                }
                $(this).removeAttr("data-meta-css");
                $(this).removeAttr("data-add-css");
                var islink = $(this).attr('data-block-link');
                if(islink != "" && islink !=undefined){
                    $(this).removeClass("row");
                    var link = $("<div>",{
                        class:"clickable-row",
                        style: "cursor: pointer",
                        onclick:"location.href='"+$(this).attr('data-block-link')+"';",
                    });
                    link.append($(this).html());
                    $(this).empty();
                    $(this).append(link);
                }
            });

            var codeD =[];
            codeD["tempCode"]= $("#metadataContainer").html();
            codeD["tempContent"]= $(".templateDummy").html();
            codeD["tempCss"]= allCss;
            selfobj.model.set({ temp_code: codeD["tempCode"]});
            selfobj.model.set({ temp_content: codeD["tempContent"]});
            selfobj.model.set({ temp_css: codeD["tempCss"]});
        },

        initializeValidate: function () {
            var selfobj = this;
            var feilds = {
                temp_name: {
                    required: true,
                },
                module_name: {
                    required: true,
                },
                temp_image: {
                    required: true,
                },
            };
            var feildsrules = feilds;
            var messages = {
                temp_name: "Please Enter Temp Name ",
                module_name: "Please Enter Module Name ",
                temp_image: "Please Select Template Image ",
            };
            $("#templateDetails").validate({
                rules: feildsrules,
                messages: messages,
            });
        },

        getColumnList: function () {
            var selfobj = this;
            $.ajax({
                url: APIPATH + "getDefinations",
                method: "POST",
                data: { menuID: selfobj.menuID, status: "active" },
                datatype: "JSON",
                beforeSend: function (request) {
                    request.setRequestHeader("token", $.cookie("_bb_key"));
                    request.setRequestHeader("SadminID", $.cookie("authid"));
                    request.setRequestHeader(
                        "contentType",
                        "application/x-www-form-urlencoded"
                    );
                    request.setRequestHeader("Accept", "application/json");
                },
                success: function (res) {
                    if (res.flag == "F") showResponse('',res,'');
                    selfobj.columnlist = res.data;
                    var columnNames = [];
                    $(".fieldName").each(function () {
                        columnNames.push($(this).text());
                    });
                    // Filter selfobj.columnlist to remove columns present in columnNames
                    selfobj.columnlist = selfobj.columnlist.filter(function(column) {
                        return !columnNames.includes(column.Field);
                    });
                    selfobj.render();
                },
            });
        },

        addRow: function (e) {
            var selfobj = this;
            e.stopImmediatePropagation();
            $(".ws-playground").append(selfobj.setItemPreview("row", false));
            selfobj.setupDropable();
        },

        setItemPreview: function (type, noRow = false) {
            var selfobj = this;
            var d = new Date();
            var n = d.getTime();
            var newId = "ws_"+n;
            var ediDetails ='<div class="row-action-header"><span data-action="edit" data-type="row" title="Row Setting" class="row-action material-icons">edit</span><span data-action="minimize" data-type="row" title="Minimize Row" data-state="minimize" class="row-action material-icons">expand_more</span><span data-action="copy" data-type="row" title="Duplicate" class="row-action material-icons">content_copy</span><span data-action="delete" data-type="row" title="Delete Row" class="row-action material-icons">close</span></div>';
            var ediDetailsSection ='<div class="row-action-header"><span data-action="edit" data-type="section" title="Section Setting" class="row-action material-icons">edit</span><span data-action="minimize" data-type="section" title="Minimize Section" data-state="minimize" class="row-action material-icons">expand_more</span><span data-action="copy" data-type="section" title="Duplicate" class="row-action material-icons">content_copy</span><span data-action="delete" data-type="section" title="Delete Section" class="row-action material-icons">close</span></div>';
            var __rows = 0;
            switch (type) {
                case 'section_link':{
                    return "<div id='"+newId+"' class='ws-link-text ws-data-element' data-act='no-drag' data-type='section_link'><div class='icon'><span class='insert_link'></span></div></div>";
                    break;
                }
                case 'button':{
                    return "<div id='"+newId+"' class='ws-button-link ws-data-element' data-act='no-drag' data-type='button'><div class='icon'><span class='insert_button'></span></div></div>";
                    break;
                }
                case 'icons':{
                    return "<div id='"+newId+"' class='ws-icon-link ws-data-element' data-act='no-drag' data-type='icons'><div class='icon'><span class='insert_icon'></span></div></div>";
                    break;
                }
                case "row": {
                    if (__rows != 0) {
                        __rows = __rows + 1;
                    } else if (parseInt($(".rowData").length) <= 0) {
                        __rows = __rows + 1;
                    } else {
                        __rows = parseInt($(".rowData").length);
                    }
                    var rowName = "ws-row-data-" + new Date().valueOf();
                    var _col = selfobj.createColumnSection();
                    $(".defaultView").remove();
                    let rowl = $("<div>", {
                        class: "rowData",
                        "data-count": __rows,
                        "data-type": "row",
                    });
                    if (noRow) {
                        var rnl = $("<div>", {
                            id: rowName,
                            class: "ws-element-wrapper ws-dropable-items rowSettings",
                        });
                    }else{
                        var rnl = $("<div>", {
                            id: rowName,
                            class: "ws-element-wrapper ws-dropable-items sectionSettings",
                        });
                    }
                  
                    let rowel = $("<div>", { class: "rowHeaders" }).append($("<ul>", { class: "act-headers" }).append("<li class='col-type move-row'><span class='material-icons'>open_with</span></li><li class='col-type first-column-add'><span class='material-icons'>add</span></li><li class='col-type column-selected'>" +_col + "</li>"));
                    if (noRow) {
                        // rowel.find(".first-column-add").remove();
                        rowel.append(ediDetails);
                        rowl.addClass("rowDataInner");
                        rowl.append(rowel);
                        rowl.append(rnl);
                        return rowl;
                    } else {
                        rowel.append(ediDetailsSection);
                        rowl.append(rowel);
                        rowl.append(rnl);
                        return rowl;
                    }
                }
            }
        },

        createColumnSection: function () {
            var col = "<span class='moreoption'><ul>";
            for (let index = 1; index <= 4; index++) {
                col = col + "<li data-column='col-" + index + "' class='col-type col-type-select col-type-" + index + "'></li>";
            }
            col = col + "</ul></span>";
            return col;
        },

        performColumnsArrgements: function (element, type) {
            var selfobj = this;
            var tempDiv = $("<div/>", { id: "tempTxt" });
            element.find(".ws-row-col").each(function () {
                $(this).find(".ws-col-header").remove();
                // $(this).find(".ws-data-element").remove();
                $(this).find(".col-action").remove();
                if ($(this).is(":empty")) {
                } else {
                    var ht = $(this).html();
                    tempDiv.append(ht);
                }
            });
            $(element).html("");
            var sizes = this.__columnsSize[type].size;
            var tcol = sizes.split(",");
            let inel = $("");
            jQuery.each(tcol, function (index, value) {
                var rm = Math.floor(Math.random() * 100);
                var id = "ws-" + new Date().valueOf() + "_" + rm;
                var cls = "ws-row-col ws-col-size-" + value;
                var colSize = value;
                var edit = $("<div/>", {
                    class: "ws-col-header",
                });
                edit.html('<span data-action="add" title="Add Element" class="col-action material-icons">add</span><span data-action="edit" title="Column Settings" class="col-action material-icons">edit</span><span data-action="minimize" title="Minimze" data-state="minimize" class="col-action material-icons hideShow">expand_more</span>');
                var dataElement = $("<div/>", {
                    class: "ws-data-element",
                });
                $(".ws-data-element").removeClass("ui-state-highlight");
                dataElement.html("");
                if (index == 0) {
                    if (tempDiv.is(":empty")) {
                        $("<div />", {
                            id: id,
                            class: cls,
                            "data-colsize": colSize,
                        }).append(edit).append(inel.clone()).appendTo(element);
                    } else {
                        $("<div />", {
                            id: id,
                            class: cls,
                            "data-colsize": colSize,
                        }).append(edit).append(tempDiv.html()).appendTo(element);
                    }
                } else {
                    $("<div />", {
                        id: id,
                        class: cls,
                        "data-colsize": colSize,
                    }).append(edit).append(inel.clone()).appendTo(element);
                }
            });
            selfobj.setupDropable();
        },

        setupDragable: function () {
            $(".drag-drop-item").draggable({
                revert: "invalid",
                containment: "document",
                helper: "clone",
                cursor: "move",
            });
        },

        setupDropable: function (e) {
            var selfobj = this;
            $(".ws-row-col").sortable({
                placeholder: "ui-state-highlight",
                connectWith: ".ws-row-col",
                forcePlaceholderSize: true,
                cancel: ".ws-col-header",
                change: function (event, ui) {
                },
            });
            $(".ws-element-wrapper").sortable({
                placeholder: "ui-state-highlight",
                forcePlaceholderSize: true,
                items: ">.ws-row-col",
                change: function (event, ui) {
                },
            });
            $(".ws-playground").sortable({
                placeholder: "ui-state-highlight",
                forcePlaceholderSize: true,
                items: ">.rowData",
                change: function (event, ui) {
                },
            });
            $(".ws-element-wrapper").sortable({
                placeholder: "ui-state-highlight",
                forcePlaceholderSize: true,
                items: ">.rowDataInner",
                change: function (event, ui) {
                },
            });
            $("body").find(".ws-row-col").droppable({
                placeholder: "ui-state-highlight",
                forcePlaceholderSize: true,
                accept: ".drag-drop-item, .ws-row-col .drag-drop-item",
                over: function (event, ui) {
                    $(this).addClass("ui-state-highlight");
                },
                out: function (event, ui) {
                    $(this).removeClass("ui-state-highlight");
                },
                drop: function (event, ui) {
                    var d = new Date();
                    var n = d.getTime();
                    var newId = "ws_" + n;
                    $(this).append(ui.draggable);
                    $(this).removeClass("ui-state-highlight");
                    ui.draggable.removeClass("ui-draggable-dragging");
                    ui.draggable.addClass("ws-data-element");
                    ui.draggable.attr("id", newId);
                    selfobj.setupDragable();
                    selfobj.setupHoverEvents(ui.draggable);
                },
            });
        },

        setupHoverEvents: function (element) {
            var selfobj = this;
            element.hover(function () {
                var actionBtns = $('<span class="elmActionBtns">');
                var editBtn = $('<span class="elmEditBtn material-icons" title="Edit Field">edit</span>');
                var copyBtn = $('<span class="elmCopyBtn material-icons" title="Copy Field">content_copy</span>');
                var removeBtn = $('<span class="elmRemoveBtn material-icons" title="Remove Field">close</span>');
                actionBtns.append(editBtn);
                actionBtns.append(copyBtn);
                actionBtns.append(removeBtn);
                $(this).append(actionBtns);
            },
            function () {
                $(this).find(".elmActionBtns").remove();
            });
            // Handle click on remove button
            element.off("click", ".elmRemoveBtn").on("click", ".elmRemoveBtn", function (e) {
                var item = $(this).closest(".ws-data-element");
                var isAlreadyPresent = false;
                var itemId = item.find(".fieldName").text().trim();
                item.remove();
                item.find(".elmActionBtns").remove();
                item.removeClass("ws-data-element");
                item.removeAttr("id");
                $("#sortable .drag-drop-item span").each(function () {
                    if ($(this).text().trim() === itemId) {
                    isAlreadyPresent = true;
                    return false;
                    }
                });
                if (item.hasClass("drag-drop-item")) {
                    if (!isAlreadyPresent) {
                        $("#sortable").append(item);
                    }
                }
                selfobj.setupDragable();          
            });
            element.off("click", ".elmCopyBtn").on("click", ".elmCopyBtn", function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                var rowEl = $(e.currentTarget).closest(".ws-data-element");
                var rm = Math.floor(Math.random() * 100);
                var rowName = "ws_" + new Date().valueOf() + "_" + rm;
                var klon = rowEl.clone();
                klon.prop("id", rowName);
                rowEl.after(klon);
                klon.find(".ws-data-element").each(function () {});
                klon.find(".elmActionBtns").remove();
                selfobj.setupHoverEvents(klon);
            });
            element.off("click", ".elmEditBtn").on("click", ".elmEditBtn", function (e) {
                selfobj.editElementSettings(e);
            });
        },

        editElementSettings: function (e) {
            var selfobj = this;
            let tm = $("<div/>", {
                class: "ws-section-body",
            });
            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });
            var colEl = $(e.currentTarget).closest(".ws-data-element");
            selfobj.__current_col_edit = colEl;
            if ($(".ws-remove-section").length > 0) {
                $(".ws-remove-section").remove();
            }
            var rr = $("<div/>", {
                class: "ws-column-container ws-remove-section ws-right-actions",
                "data-setting": $(colEl).attr("id"),
            });
            let general_hoder = $("<div/>", {
                class: "tab-pane fade show active",
                id: "ws_general",
                role: "tabpanel",
            });
            var ee = $("<div/>", {
                class: "column-list ws-list-view",
            });
            border_hoder.append(selfobj.borderSetting());
            border_hoder.append(selfobj.boxShadowSetting());
            border_hoder.append(selfobj.getAlignment());
            border_hoder.append(selfobj.backgroundSetting(true));
            general_hoder.append("<p class='ws-setting-section-heading'><span>Width and Height</span></p>");
            general_hoder.append(selfobj.whScroll(false));

            var curCss = selfobj.__current_col_edit.attr("data-meta-css");
            if (typeof curCss != "undefined") {
                try {
                    // Replace single quotes with double quotes
                    curCss = curCss.replace(/'/g, '"');
                    curCss = JSON.parse(curCss);
                } catch (e) {
                    console.error("Invalid JSON in data-meta-css attribute:", curCss);
                    curCss = {};
                }
            } else {
                curCss = {};
            }
            var fontList = $("<div/>", {
                class: "ws-font-setting",
            });
    
            /* Font Size */
            var fontSize = $("<div/>", {
                class: "ws-fontSize ws-section-setting no-flex ws-grid",
            });
            var slideVal;
            var slider = $("<div/>", {
                id: "slider",
                class: "sliderCls sliderClsfont-size",
            });
            var sliderHandel = $("<div/>", {
                id: "custom-handle",
                class: "ui-slider-handle",
            });
            slider.slider({
                max: 500,
                min: 0,
                create: function () {
                    sliderHandel.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = selfobj.__current_col_edit.attr("data-meta-css");
                    if (typeof curCss != "undefined") {
                        try {
                            // Replace single quotes with double quotes
                            curCss = curCss.replace(/'/g, '"');
                            curCss = JSON.parse(curCss);
                        } catch (e) {
                            console.error("Invalid JSON in data-meta-css attribute:", curCss);
                            curCss = {};
                        }
                    } else {
                        curCss = {};
                    }
                    
                    sliderHandel.text(ui.value);
                    slideVal = ui.value;
                    widthPx.val(slideVal);
                    curCss["font-size"] = slideVal + "px";
                    selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                },
            });
            if (typeof curCss["font-size"] != "undefined") {
                var widthIntValue = parseInt(curCss["font-size"], 10);
                slideVal = widthIntValue;
                $(slider).slider("value", slideVal);
                $(slider).prop("value", slideVal);
            } else {
                slideVal = "";
                $(slider).slider("value", slideVal);
                $(slider).prop("value", slideVal);
            }
            var widthPx = $("<input/>", {
                type: "number",
                value: slideVal,
                id: "font-size",
                class: "ws-fontSize-set setNumber",
            });
            var allFontDiv = $("<div/>", { class: "ws-allFontDiv" });
            var fontLabel = $("<div/>", { class: "ws-fontLabel" });
            var fontSlider = $("<div/>", { class: "ws-fontSlider" });
            var fontInput = $("<div/>", { class: "ws-fontInput d-flex gap-3" });
            fontLabel.append("<p class='ws-setting-font-heading'><span>Font Size</span></p>");
            fontInput.append(widthPx);
            fontInput.append("<label class='' for='font-size'>px</label>");
            slider.append(sliderHandel);
            fontSlider.append(slider);
            allFontDiv.append(fontLabel);
            fontLabel.append(fontInput);
            allFontDiv.append(fontSlider);
            fontSize.append(allFontDiv);
            fontList.append(fontSize);
            /* Font Size */
            /* Font Weight */
            var fontWeight = $("<div/>", {
                class: "ws-fontWeight ws-section-setting no-flex ws-grid",
            });
            var weightList = [
                "select", "100", "200", "300", "400", "500", "600", "700", "800", "900", "bold", "bolder", "lighter", "normal",
            ];
            var sel = $("<select/>", {
                class: "ws-fontWeight-set",
                id: "font-weight",
            });
            for (let i = 0; i < weightList.length; i++) {
                if (curCss["font-weight"] != "undefined" && weightList[i] == curCss["font-weight"]) {
                    sel.append(new Option(weightList[i], weightList[i], true, true));
                } else {
                    sel.append(new Option(weightList[i], weightList[i]));
                }
            }
            fontWeight.append("<p class='ws-setting-font-heading'><span>Font Weight</span></p>");
            fontWeight.append(sel);
            fontList.append(fontWeight);
            /* Font Weight */
            /* Font Color */
            var fontColor = $("<div/>", {
                class: "ws-fontColor ws-section-setting no-flex ws-grid",
            });
            if (typeof curCss["color"] != "undefined") {
                var cor = curCss["color"];
            } else {
                var cor = "#000000";
            }
            var color = $("<input/>", {
                type: "text",
                value: cor,
                class: "ws-fontColor-set",
                id: "color",
            });
            fontColor.append("<p class='ws-setting-font-heading'><span>Font Color</span></p>");
            fontColor.append(color);
            fontList.append(fontColor);
            selfobj.colorPicker(color);
            /* Font Color */
            general_hoder.append("<p class='ws-setting-section-heading'><span>Font Settings</span></p>");
            general_hoder.append(fontList);

            if($(e.currentTarget).closest(".ws-data-element").hasClass("ws-button-link") || $(e.currentTarget).closest(".ws-data-element").hasClass("ws-link-text")){

                var curAlt = selfobj.__current_col_edit.attr("data-alt");
                if(typeof(curAlt) != "undefined" && curAlt !=""){
                    var alttxt = curAlt;
                }else{
                    var alttxt = "";
                }
                var alt = $("<input>",{
                    class:"text-list ws-button-title",
                    type:"text",
                    value:alttxt,
                    name:"altTextBtn"
                });

                general_hoder.append("<p class='ws-setting-section-heading'><span>Button Title and Text</p>");
                general_hoder.append($("<div/>",{class:"ws-section-setting"}).append(alt));
            }

            if ($(e.currentTarget).closest(".ws-data-element").hasClass("ws-icon-link")) {
                // Create elements
                general_hoder.append("<p class='ws-setting-section-heading'><span>Icon Selection</span></p>");
                var selectIconDiv = $("<div/>", { class: "selectIcon" });
                selectIconDiv.append("<span class='iconHeading'>Select Icon</span>");
                var searchContainer = $("<div/>", { class: "search-container" });
                searchContainer.append("<input type='text' name='search' id='iconSearch' placeholder='Search icon...' class='search-input'>");
                searchContainer.append("<span class='material-icons'>search</span>");
                selectIconDiv.append(searchContainer);
            
                var defaultMessageDiv = $("<div/>", { class: "defaultMessage d-flex-center no-fields-msg", style: "display: none;" });
                var innerDiv = $("<div/>", { class: "m-20" });
                innerDiv.append("<h4 class='d-flex-center'>No Icons Found</h4>");
                innerDiv.append("<p>There are no icons that match your current search.</p>");
                defaultMessageDiv.append(innerDiv);
            
                // Append elements to general_hoder
                general_hoder.append(selectIconDiv);
                general_hoder.append("<div class='clearfix'>&nbsp;</div>");
                general_hoder.append(defaultMessageDiv);

                var iconListContainer = $("<div/>");
                selfobj.iconList.attributes.icons.forEach(function(iconsarray) {
                    var sectionName = $("<div/>", {
                        class: "iconsectioName",
                        "data-valid": "iconName",
                        text: iconsarray.name
                    });

                    var iconSetList = $("<div/>", {
                        class: "setIconList row"
                    });

                    iconsarray.icons.forEach(function(icons) {
                        var iconDiv = $("<div/>", {
                            class: "iconList col-md-3"
                        });

                        var iconSpan = $("<span/>", {
                            class: "material-icons iconSelection",
                            "data-value": icons.ligature,
                            text: icons.ligature
                        });

                        if (selfobj.__current_col_edit.attr("data-icon") == icons.ligature) {
                            iconSpan.addClass("active");
                        }

                        var iconNameDiv = $("<div/>", {
                            class: "iconName",
                            "data-value": icons.name,
                            text: icons.name
                        });

                        iconDiv.append(iconSpan, iconNameDiv);
                        iconSetList.append(iconDiv);
                    });

                    var clearfix = $("<div/>", {
                        class: "iconClearfix clearfix",
                        html: "&nbsp;"
                    });

                    iconListContainer.append(sectionName, iconSetList, clearfix);
                });
                general_hoder.append(iconListContainer);

            }            

            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": "column-list",
            });
            am.append("<h2>Element Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            let navLink ='<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_link">Link</a></li></ul>';
            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            tc.append(general_hoder);
            tc.append(selfobj.getMarginpadding());
            tc.append(border_hoder);
            tc.append(selfobj.getAnimationSetting());
            tc.append(selfobj.getLinkSetting());
            tm.append(tc);
            am.append(ee);
            rr.append(am);
            rr.append(tm);
            $("#templateSingleView").append(rr);
            $(".ws-column-container").addClass("ws_active");
        },

        copyRow: function (e) {
            var selfobj = this;
            var le = parseInt($(".rowData").length);
            if (selfobj.__rows != 0) {
                selfobj.__rows = selfobj.__rows + 1;
            } else if (le <= 0) {
                selfobj.__rows = selfobj.__rows + 1;
            } else {
                selfobj.__rows = parseInt(le) + 1;
            }
            var rowEl = $(e.currentTarget).closest(".rowData");
            var klon = rowEl.clone().attr("data-count", selfobj.__rows);
            rowEl.after(klon);
            klon.find(".ws-element-wrapper").each(function () {
                var rm = Math.floor(Math.random() * 100);
                var rowName = "ws-row-data-" + new Date().valueOf() + "_" + rm;
                $(this).prop("id", rowName);
            });
            klon.find(".ws-row-col").each(function () {
                var rm = Math.floor(Math.random() * 100);
                var rowName = "ws-" + new Date().valueOf() + "_" + rm;
                $(this).prop("id", rowName);
            });
            klon.find(".ws-data-element").each(function () {
                var rm = Math.floor(Math.random() * 100);
                var rowName = "ws_" + new Date().valueOf() + "_" + rm;
                $(this).prop("id", rowName);
            });
            selfobj.setupDropable();
            selfobj.setupHoverEvents(klon.find('.ws-data-element'));
        },

        minimizeRow: function (e) {
            var state = $(e.currentTarget).attr("data-state");
            if (state == "minimize") {
                $(e.currentTarget).html("expand_less");
                $(e.currentTarget)
                .closest(".rowData")
                .find(".ws-element-wrapper")
                .addClass("hide");
                $(e.currentTarget).attr("data-state", "maximize");
            } else {
                $(e.currentTarget).html("expand_more");
                $(e.currentTarget).attr("data-state", "minimize");
                $(e.currentTarget)
                .closest(".rowData")
                .find(".ws-element-wrapper")
                .removeClass("hide");
            }
        },

        deleteRow: function (e) {
            var selfobj = this;
            e.stopImmediatePropagation();
            
            // Select the row to be removed
            let rowToRemove = $(e.currentTarget).closest(".rowData");
            rowToRemove.remove();
            
            // Iterate over each drag-drop-item in the row and handle them individually
            rowToRemove.find(".drag-drop-item").each(function () {
                var item = $(this);
                var itemId = item.find(".fieldName").text().trim();
                var isAlreadyPresent = false;
        
                // Check if the item is already present in the #sortable container
                $("#sortable .drag-drop-item span").each(function () {
                    if ($(this).text().trim() === itemId) {
                        isAlreadyPresent = true;
                        return false; // Break out of the each loop
                    }
                });
        
                // If the item is not present, append it to the #sortable container
                if (!isAlreadyPresent) {
                    item.remove();
                    item.find(".elmActionBtns").remove();
                    item.removeClass("ws-data-element");
                    item.removeAttr("id");
                    $("#sortable").append(item);
                }
            });
        
            // Re-initialize draggable functionality
            selfobj.setupDragable();
        },
        
        addRowsInSection: function (e) {
            e.stopImmediatePropagation();
            var selfobj = this;
            var rowSection = $(e.currentTarget).closest(".rowData");
            var innerwrapper = rowSection.find(">div.ws-element-wrapper");
            innerwrapper.append(selfobj.setItemPreview("row", true));
            selfobj.setupDropable();
        },

        editSectionSetting: function (e) {
            var selfobj = this;
            let tm = $("<div/>", {
                class: "ws-section-body",
            });
            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });
            var colEl = $(e.currentTarget).closest(".rowData").find(".ws-element-wrapper").first();
            selfobj.__current_col_edit = colEl;
            if ($(".ws-remove-section").length > 0) {
                $(".ws-remove-section").remove();
            }
            var rr = $("<div/>", {
                class: "ws-column-container ws-remove-section ws-right-actions",
                "data-setting": $(colEl).attr("id"),
            });
            let general_hoder = $("<div/>", {
                class: "tab-pane fade show active",
                id: "ws_general",
                role: "tabpanel",
            });
            var ee = $("<div/>", {
                class: "column-list ws-list-view",
            });
            var selcf = "";
            var selc = "";
            var curtype = selfobj.__current_col_edit.closest(".rowData").attr("data-row-type");
            if (typeof curtype != "undefined" && curtype != "") {
                if (curtype == "container-fluid") {
                    selcf = "selected";
                }
                if (curtype == "container") {
                    selc = "selected";
                }
            }
            var curCss = selfobj.__current_col_edit.attr("data-meta-css");
            if (typeof curCss != "undefined") {
                try {
                    // Replace single quotes with double quotes
                    curCss = curCss.replace(/'/g, '"');
                    curCss = JSON.parse(curCss);
                } catch (e) {
                    console.error("Invalid JSON in data-meta-css attribute:", curCss);
                    curCss = {};
                }
            } else {
                curCss = {};
            }            
            var isVisible = $("<input/>", {
                id: "md_checkbox_28",
                type: "checkbox",
                class: "filled-in chk-col-light-blue ws-set-visibility",
            });
            if (typeof curCss["display"] != "undefined" && curCss["display"] != "" && curCss["display"] == "block") {
                isVisible.prop("checked", true);
            } else if (curCss["display"] == "none") {
                isVisible.prop("checked", false);
            } else {
                isVisible.prop("checked", true);
            }
            general_hoder.append("<p class='ws-setting-section-heading'><span>Set Visibility</span></p>");
            var holderc = $("<div/>", {
                class: "ws-section-setting demo-checkbox",
            }).append(isVisible);
            holderc.append("<label for='md_checkbox_28'>Visibility</label>");
            general_hoder.append(holderc);
            var rowType = "<div class='ws-section-setting'><select class='row-type'><option " + selcf + " value='container-fluid'>Full Screen</option><option " + selc + " value='container'>center Screen</option></select></div>";
            general_hoder.append("<p class='ws-setting-section-heading'><span>Row size</span></p>");
            general_hoder.append(rowType);
            if (curtype == "container-with-row") {
                general_hoder.append("<p class='ws-setting-section-heading'><span>Full container with center content</span>&nbsp;&nbsp;<input type='checkbox' checked=checked class='row-type-check'/></p>");
            } else {
                general_hoder.append( "<p class='ws-setting-section-heading'><span>Full container with center content</span>&nbsp;&nbsp;<input type='checkbox' class='row-type-check'/></p>");
            }
            border_hoder.append(selfobj.borderSetting());
            border_hoder.append(selfobj.boxShadowSetting());
            border_hoder.append(selfobj.getAlignment());
            border_hoder.append(selfobj.backgroundSetting(true));
            general_hoder.append(selfobj.getMobileSetting(false));
            general_hoder.append("<p class='ws-setting-section-heading'><span>Width and Height</span></p>");
            general_hoder.append(selfobj.whScroll(true));
            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": "column-list",
            });
            am.append("<h2>Section Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            let navLink ='<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';
            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            tc.append(general_hoder);
            tc.append(selfobj.getMarginpadding());
            tc.append(border_hoder);
            tc.append(selfobj.getAnimationSetting());
            tm.append(tc);
            am.append(ee);
            rr.append(am);
            rr.append(tm);
            $("#templateSingleView").append(rr);
            $(".ws-column-container").addClass("ws_active");
        },

        editRowSetting: function (e) {
            var selfobj = this;
            let tm = $("<div/>", {
                class: "ws-section-body",
            });
            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });
            var colEl = $(e.currentTarget).closest(".rowData").find(".ws-element-wrapper").first();
            selfobj.__current_col_edit = colEl;
            if ($(".ws-remove-section").length > 0) {
                $(".ws-remove-section").remove();
            }
            var rr = $("<div/>", {
                class: "ws-column-container ws-remove-section ws-right-actions",
                "data-setting": $(colEl).attr("id"),
            });
            let general_hoder = $("<div/>", {
                class: "tab-pane fade show active",
                id: "ws_general",
                role: "tabpanel",
            });
            var ee = $("<div/>", {
                class: "column-list ws-list-view",
            });
            var selcf = "";
            var selc = "";
            var curtype = selfobj.__current_col_edit.closest(".rowData").attr("data-row-type");
            if (typeof curtype != "undefined" && curtype != "") {
                if (curtype == "container-fluid") {
                    selcf = "selected";
                }
                if (curtype == "container") {
                    selc = "selected";
                }
            }
            var curCss = selfobj.__current_col_edit.attr("data-meta-css");
            if (typeof curCss != "undefined") {
                try {
                    // Replace single quotes with double quotes
                    curCss = curCss.replace(/'/g, '"');
                    curCss = JSON.parse(curCss);
                } catch (e) {
                    console.error("Invalid JSON in data-meta-css attribute:", curCss);
                    curCss = {};
                }
            } else {
                curCss = {};
            }
            
            var isVisible = $("<input/>", {
                id: "md_checkbox_28",
                type: "checkbox",
                class: "filled-in chk-col-light-blue ws-set-visibility",
            });
            if (typeof curCss["display"] != "undefined" && curCss["display"] != "" && curCss["display"] == "block") {
                isVisible.prop("checked", true);
            } else if (curCss["display"] == "none") {
                isVisible.prop("checked", false);
            } else {
                isVisible.prop("checked", true);
            }
            general_hoder.append("<p class='ws-setting-section-heading'><span>Set Visibility</span></p>");
            var holderc = $("<div/>", {
                class: "ws-section-setting demo-checkbox",
            }).append(isVisible);
            holderc.append("<label for='md_checkbox_28'>Visibility</label>");
            general_hoder.append(holderc);

            var isOnHover = $("<input/>", {
                id: "md_checkbox_26",
                type: "checkbox",
                class: "filled-in chk-col-light-blue ws-set-onHover",
            });
            if (typeof curCss["display"] != "undefined" && curCss["display"] != "" && curCss["display"] == "none") {
                isOnHover.prop("checked", true);
            } else if (curCss["display"] == "block") {
                isOnHover.prop("checked", false);
            } else {
                isOnHover.prop("checked", false);
            }
            general_hoder.append("<p class='ws-setting-section-heading'><span>Show On Hover</span></p>");
            var holder = $("<div/>", {
                class: "ws-section-setting demo-checkbox",
            }).append(isOnHover);
            holder.append("<label for='md_checkbox_26'>Show On Hover</label>");
            general_hoder.append(holder);

            var rowType = "<div class='ws-section-setting'><select class='row-type'><option " + selcf + " value='container-fluid'>Full Screen</option><option " + selc + " value='container'>center Screen</option></select></div>";
            general_hoder.append("<p class='ws-setting-section-heading'><span>Row size</span></p>");
            general_hoder.append(rowType);
            if (curtype == "container-with-row") {
                general_hoder.append("<p class='ws-setting-section-heading'><span>Full container with center content</span>&nbsp;&nbsp;<input type='checkbox' checked=checked class='row-type-check'/></p>");
            } else {
                general_hoder.append("<p class='ws-setting-section-heading'><span>Full container with center content</span>&nbsp;&nbsp;<input type='checkbox' class='row-type-check'/></p>");
            }
            border_hoder.append(selfobj.borderSetting());
            border_hoder.append(selfobj.boxShadowSetting());
            border_hoder.append(selfobj.getAlignment());
            border_hoder.append(selfobj.backgroundSetting(true));
            general_hoder.append("<p class='ws-setting-section-heading'><span>Width and Height</span></p>");
            general_hoder.append(selfobj.whScroll(true));
            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": "column-list",
            });
            am.append("<h2>Row Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            let navLink ='<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_link">Link</a></li></ul>';
            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            tc.append(general_hoder);
            tc.append(selfobj.getMarginpadding());
            tc.append(border_hoder);
            tc.append(selfobj.getAnimationSetting());
            tc.append(selfobj.getLinkSetting());
            tm.append(tc);
            am.append(ee);
            rr.append(am);
            rr.append(tm);
            $("#templateSingleView").append(rr);
            $(".ws-column-container").addClass("ws_active");
        },

        editColSetting: function (e) {
            var selfobj = this;
            let tm = $("<div/>", {
                class: "ws-section-body",
            });
            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });
            var colEl = $(e.currentTarget).closest(".ws-row-col").first();
            selfobj.__current_col_edit = colEl;
            if ($(".ws-remove-section").length > 0) {
                $(".ws-remove-section").remove();
            }
            var rr = $("<div/>", {
                class: "ws-column-container ws-remove-section ws-right-actions",
                "data-setting": $(colEl).attr("id"),
            });
            let general_hoder = $("<div/>", {
                class: "tab-pane fade show active",
                id: "ws_general",
                role: "tabpanel",
            });
            var ee = $("<div/>", {
                class: "column-list ws-list-view",
            });
            border_hoder.append(selfobj.borderSetting());
            border_hoder.append(selfobj.boxShadowSetting());
            border_hoder.append(selfobj.getAlignment());
            border_hoder.append(selfobj.backgroundSetting(true));
            general_hoder.append(selfobj.getMobileSetting(true));
            general_hoder.append("<p class='ws-setting-section-heading'><span>Width and Height</span></p>");
            general_hoder.append(selfobj.whScroll(true));
            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": "column-list",
            });
            am.append("<h2>Column Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            let navLink ='<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_link">Link</a></li></ul>';
            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            tc.append(general_hoder);
            tc.append(selfobj.getMarginpadding());
            tc.append(border_hoder);
            tc.append(selfobj.getAnimationSetting());
            tc.append(selfobj.getLinkSetting());
            tm.append(tc);
            am.append(ee);
            rr.append(am);
            rr.append(tm);
            $("#templateSingleView").append(rr);
            $(".ws-column-container").addClass("ws_active");
        },

        whScroll: function (isScroll) {
            var selfobj = this;
            var curCss = selfobj.__current_col_edit.attr("data-meta-css");
            if (typeof curCss != "undefined") {
                try {
                    // Replace single quotes with double quotes
                    curCss = curCss.replace(/'/g, '"');
                    curCss = JSON.parse(curCss);
                } catch (e) {
                    console.error("Invalid JSON in data-meta-css attribute:", curCss);
                    curCss = {};
                }
            } else {
                curCss = {};
            }            
            var curWidth = selfobj.__current_col_edit.attr("data-width");
            if (typeof curWidth != "undefined" && curWidth != "") {
                var wid = curWidth;
            } else {
                var wid = "";
            }
            var width = $("<input>", {
                id: "ws-element-width",
                class: "ws-input",
                value: wid,
                type: "text",
            });
            var curHeight = selfobj.__current_col_edit.attr("data-height");
            if (typeof curHeight != "undefined" && curHeight != "") {
                var hei = curHeight;
            } else {
                var hei = "";
            }
            var height = $("<input>", {
                id: "ws-element-height",
                class: "ws-input",
                value: hei,
                type: "text",
            });
            if (isScroll) {
                var overList = ["none", "visible", "hidden", "scroll", "auto"];
                var sel = $("<select/>", {
                    class: "ws-scroll-type",
                });
                for (let i = 0; i < overList.length; i++) {
                if (
                    curCss["overflow"] != "undefined" &&
                    overList[i] == curCss["overflow"]
                ) {
                    sel.append(new Option(overList[i], overList[i], true, true));
                } else {
                    sel.append(new Option(overList[i], overList[i]));
                }
                }
            }
            var wh = $("<div/>", {
                class: "ws-who",
            });
            var whs = $("<div/>", {
                class: "ws-wh ws-section-setting",
            });
            whs.append(width);
            whs.append("<div class='clearfix'>&nbsp;</div>");
            whs.append(height);
            wh.append(whs);
            if (isScroll) {
                wh.append("<p class='ws-setting-section-heading'><span>Content Overflow</span></p>");
                var holder = $("<div/>", {
                    class: "ws-section-setting",
                }).append(sel);
                wh.append(holder);
            }
            return wh;
        },

        minimizeCol: function (e) {
            var state = $(e.currentTarget).attr("data-state");
            if (state == "minimize") {
                $(e.currentTarget).html("expand_less");
                $(e.currentTarget).closest(".ws-row-col").find(".ws-data-element").addClass("hide");
                $(e.currentTarget).attr("data-state", "max");
            } else {
                $(e.currentTarget).html("expand_more");
                $(e.currentTarget).attr("data-state", "minimize");
                $(e.currentTarget).closest(".ws-row-col").find(".ws-data-element").removeClass("hide");
            }
        },

        addColElm:function(e,type){
            var selfobj = this;
            selfobj.activeElement = $(e.currentTarget).closest(".ws-row-col");
            var parentCls = $(e.currentTarget).parent();
            var parentId = $(parentCls).parent();
            var parentId2 = $(parentId).parent();
            if($(e.currentTarget).hasClass("default")){
                if ($(parentId).hasClass("extraColumns")) {
                    $(".columnsAdded").hide();
                }else{
                    $(".columnsAdded").show();
                }
            }else{
                if ($(parentId2).hasClass("extraColumns")) {
                    $(".columnsAdded").hide();
                }else{
                    $(".columnsAdded").show();
                }
            }
            selfobj.showElements();
            if(type == "col"){
            
            } else {
    
            }
        },

        showElements:function(){
            $(".ws-element-container").addClass("ws_active");
        },

        setuppPlaygroundElements: function() {
            var selfobj = this;
            selfobj.__elementsfn = [];
            selfobj.playgroundElements = $(".playgroundelements");
            if (selfobj.playgroundElements == null) {
                console.log("playground elements element not found");
                return false;
            } else {
                selfobj.playgroundElements.empty();
                selfobj.playgroundElements.addClass("ws-playground-elements");
            }
            selfobj.playgroundElements.append("<div class='ws-element-container ws-right-actions'></div>");
            $(".ws-element-container").append("<div class='ws-section-header' data-show='element-list'><h2>Elements</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span></div><div class='element-list ws-list-view'></div>");
        
            selfobj.__elementsfn['button'] = function() { 
                selfobj.playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='button'><div class='icon'><span class='insert_button'></span></div><div class='text'><div class='title'>Button</div><div class='ws_second-info'>Add Custom Button</div></div></span>");
            };
            selfobj.__elementsfn['section_link'] = function() { 
                selfobj.playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='section_link'><div class='icon'><span class='insert_link'></span></div><div class='text'><div class='title'>Section Link</div><div class='ws_second-info'>Section Link</div></div></span>");
            };
            
            selfobj.__elementsfn['icons'] = function() { 
                selfobj.playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='icons'><div class='icon'><span class='insert_icon'></span></div><div class='text'><div class='title'>Icon</div><div class='ws_second-info'>Add Custom Icon</div></div></span>");
            };

            selfobj.__elementsfn['twoColumns'] = function() { 
                selfobj.playgroundElements.find(".element-list").append("<span class='columnsAdded col-type col-type-2' data-type='twoColumns' data-column='col-2'><div class='icon'><span class='insert_twoColumns'></span></div><div class='text'><div class='title'>Two Columns</div><div class='ws_second-info'>Add Two Columns</div></div></span>");
            };

            selfobj.__elementsfn['threeColumns'] = function() { 
                selfobj.playgroundElements.find(".element-list").append("<span class='columnsAdded col-type col-type-4' data-type='threeColumns' data-column='col-4'><div class='icon'><span class='insert_threeColumns'></span></div><div class='text'><div class='title'>Three Columns</div><div class='ws_second-info'>Add Three Columns</div></div></span>");
            };
        
            $.each(selfobj.elements, function(index, val) {
                if (val && selfobj.__elementsfn[index]) {
                    selfobj.__elementsfn[index]();
                }
            });
        },
        
        closeOverlay: function () {
            $(".ws-element-container").removeClass("ws_active");
            $(".ws-text-container").removeClass("ws_active");
            $(".ws-remove-section").removeClass("ws_active");
        },

        getMarginpadding: function () {
            var selfobj = this;
            let margin_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_margin",
                role: "tabpanel",
            });
            var elMain = $("<div/>", { class: "col-ma" });
            var addCss = selfobj.__current_col_edit.attr("data-add-css");
            if (typeof addCss == "undefined") {
                addCss = "";
            }
            var curCss = selfobj.__current_col_edit.attr("data-meta-css");
            if (typeof curCss != "undefined") {
                try {
                    // Replace single quotes with double quotes
                    curCss = curCss.replace(/'/g, '"');
                    curCss = JSON.parse(curCss);
                } catch (e) {
                    console.error("Invalid JSON in data-meta-css attribute:", curCss);
                    curCss = {};
                }
            } else {
                curCss = {};
            }            
            var addionalCss = $("<div/>", { class: "col-setting" });
            addionalCss.append("<p class='ws-setting-section-heading'><span>Additional Css Class</span></p>");
            var addCssEl = $("<input/>", {
                type: "text",
                class: "addCss",
                value: addCss,
            });
            var holder = $("<div/>", { class: "ws-section-setting" });
            holder.append(addCssEl);
            addionalCss.append(holder);
            addionalCss.append("<div class='ws-section-setting'><span class='ws_second-info'>Style particular content element differently - add a class name and refer to it in custom CSS. e.g. margin-top margin-bottom</span></div>");
            elMain.append(addionalCss);
            margin_hoder.append(elMain);
            var secDiv = $("<div/>", { class: "ws-secDiv" });
            var marCls = $("<div/>", { class: "ws-marCls", id: "individualMargin" });
            var marAll = $("<div/>", { class: "ws-marAll", id: "" });
            /* Margin all sides */
            var marAllDiv = $("<div/>", {
                class: "ws-marAllDiv ws-section-setting no-flex ws-grid",
            });
            var marSliderVal;
            var slider_m = $("<div/>", { id: "slider_m", class: "sliderCls margin" });
            var sliderHandel_m = $("<div/>", {
                id: "custom-handle",
                class: "ui-slider-handle",
            });
            slider_m.slider({
                max: 500,
                min: 0,
                create: function () {
                    sliderHandel_m.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    sliderHandel_m.text(ui.value);
                    var curCss = selfobj.__current_col_edit.attr("data-meta-css");
                    if (typeof curCss != "undefined") {
                        try {
                            // Replace single quotes with double quotes
                            curCss = curCss.replace(/'/g, '"');
                            curCss = JSON.parse(curCss);
                        } catch (e) {
                            console.error("Invalid JSON in data-meta-css attribute:", curCss);
                            curCss = {};
                        }
                    } else {
                        curCss = {};
                    }
                    
                    sliderHandel_m.text(ui.value);
                    marSliderVal = ui.value;
                    marginPx.val(marSliderVal);
                    curCss["margin"] = marSliderVal + "px";
                    selfobj.__current_col_edit.attr("data-meta-css",JSON.stringify(curCss));
                },
            });
            if (typeof curCss["margin"] != "undefined") {
                var marIntValue = parseInt(curCss["margin"], 10);
                marSliderVal = marIntValue;
                $(slider_m).slider("value", marSliderVal);
                $(slider_m).prop("value", marSliderVal);
            } else {
                marSliderVal = 0;
                $(slider_m).slider("value", marSliderVal);
                $(slider_m).prop("value", marSliderVal);
            }
            var marginPx = $("<input/>", {
                type: "number",
                value: marSliderVal,
                min: 0,
                max: 500,
                class: "ws-margin-set setNumber",
                id: "margin",
            });
            var allMarDiv = $("<div/>", { class: "ws-allMarDiv" });
            var marLabel = $("<div/>", { class: "labelInput" });
            var marSlider = $("<div/>", { class: "ws-borSlider" });
            var marInput = $("<div/>", { class: "ws-marInput d-flex gap-3" });
            marLabel.append("<p class='ws-setting-border-heading'><span>Margin(all sides)</span></p>");
            marInput.append(marginPx);
            marInput.append("<label class='' for='margin'>px</label>");
            slider_m.append(sliderHandel_m);
            marSlider.append(slider_m);
            allMarDiv.append(marLabel);
            marLabel.append(marInput);
            allMarDiv.append(marSlider);
            marAllDiv.append(allMarDiv);
            marAll.append(marAllDiv);
            /* Margin all sides */
            var firstRow = $("<div/>", { class: "ws-firstRow", id: "" });
            var secRow = $("<div/>", { class: "ws-secRow", id: "" });
            secDiv.append("<p class='ws-setting-section-heading'><span>Margin (Manage outer spacing)</span></p>");
            for (let index = 0; index < 4; index++) {
                let val = "";
                var sliderM;
                var sliderSideHandel = $("<div/>", {
                    id: "custom-handle",
                    class: "ui-slider-handle",
                });
                var sliderSide = $("<div/>", {
                    id: "ws_m_" + index,
                    class: "sliderCls sliderClsws_m_" + index,
                });
                sliderSide.slider({
                    max: 500,
                    min: 0,
                    create: function () {
                        sliderSideHandel.text($(this).slider("value"));
                    },
                    slide: function (event, ui) {
                        var curCss = selfobj.__current_col_edit.attr("data-meta-css");
                        if (typeof curCss != "undefined") {
                            try {
                                // Replace single quotes with double quotes
                                curCss = curCss.replace(/'/g, '"');
                                curCss = JSON.parse(curCss);
                            } catch (e) {
                                console.error("Invalid JSON in data-meta-css attribute:", curCss);
                                curCss = {};
                            }
                        } else {
                            curCss = {};
                        }
                        
                            sliderSideHandel.text(ui.value);
                            val = ui.value;
                            mar_i.val(val);
                            let tochange = selfobj.__margintype["ws_m_" + index];
                            curCss[selfobj.__margintype["ws_m_" + index]] = val + "px";
                            selfobj.__current_col_edit.attr( "data-meta-css", JSON.stringify(curCss));
                    },
                });
                sliderM = sliderSide.slider();
                if (typeof curCss != "undefined") {
                    if ( typeof curCss[selfobj.__margintype["ws_m_" + index]] != "undefined") {
                        val = parseInt(curCss[selfobj.__margintype["ws_m_" + index]], 10);
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    } else {
                        val = 0;
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    }
                }
                let mar_h = $("<div/>", {
                    class: "ws-col-margin ws-section-setting no-flex ws-grid",
                });
                var marSide = $("<div/>", { class: "labelInput" });
                var marInput = $("<div/>", { class: "ws_m_Input d-flex gap-3" });
                var marSlider = $("<div/>", { class: "ws-borSlider" });
                let mar_i = $("<input/>", {
                    id: "ws_m_" + index,
                    type: "number",
                    class: "ws-col-mar",
                    value: val,
                });
                if (index == 0) {
                    marSide.append("<p class='ws-setting-border-heading'><span>Margin Top</span></p>");
                } else if (index == 1) {
                    marSide.append("<p class='ws-setting-border-heading'><span>Margin Right</span></p>");
                } else if (index == 2) {
                    marSide.append("<p class='ws-setting-border-heading'><span>Margin Bottom</span></p>");
                } else if (index == 3) {
                    marSide.append("<p class='ws-setting-border-heading'><span>Margin Left</span></p>");
                }
                marInput.append(mar_i);
                marInput.append("<span class=''>px</span>");
                marSide.append(marInput);
                mar_h.append(marSide);
                sliderSide.append(sliderSideHandel);
                marSlider.append(sliderSide);
                mar_h.append(marSlider);
                if (index == 0) {
                    firstRow.append(mar_h);
                } else if (index == 1) {
                    firstRow.append(mar_h);
                } else if (index == 2) {
                    secRow.append(mar_h);
                } else if (index == 3) {
                    secRow.append(mar_h);
                }
                marCls.append(firstRow);
                marCls.append(secRow);
            }
            var marginToggleOpt = $("<div/>", {
                id: "marginToggleOpt",
                class: "toggleOptCls",
            });
            var marginToggleBtn = $("<div/>", { id: "marginToggleBtn" });
            marginToggleOpt.append("<span>Target individual margin</span>");
            marginToggleBtn.append("<button class='ToggleBtn' id='margin-toggle_button'>OFF</button>");
            marginToggleOpt.append(marginToggleBtn);
            secDiv.append(marAll);
            secDiv.append(marginToggleOpt);
            secDiv.append(marCls);
            margin_hoder.append(secDiv);
            var thirdDiv = $("<div/>", { class: "ws-thirdDiv" });
            var padCls = $("<div/>", { class: "ws-padCls", id: "individualPadding" });
            var padAll = $("<div/>", { class: "ws-padAll", id: "" });
            /* Padding all sides */
            var padAllDiv = $("<div/>", {
                class: "ws-padAllDiv ws-section-setting no-flex ws-grid",
            });
            var padSliderVal;
            var slider_p = $("<div/>", {
                id: "slider_p",
                class: "sliderCls padding",
            });
            var sliderHandel_p = $("<div/>", {
                id: "custom-handle",
                class: "ui-slider-handle",
            });
            slider_p.slider({
                max: 500,
                min: 0,
                create: function () {
                    sliderHandel_p.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = selfobj.__current_col_edit.attr("data-meta-css");
                    if (typeof curCss != "undefined") {
                        try {
                            // Replace single quotes with double quotes
                            curCss = curCss.replace(/'/g, '"');
                            curCss = JSON.parse(curCss);
                        } catch (e) {
                            console.error("Invalid JSON in data-meta-css attribute:", curCss);
                            curCss = {};
                        }
                    } else {
                        curCss = {};
                    }
                    
                    sliderHandel_p.text(ui.value);
                    padSliderVal = ui.value;
                    paddingPx.val(padSliderVal);
                    curCss["padding"] = padSliderVal + "px";
                    selfobj.__current_col_edit.attr("data-meta-css",JSON.stringify(curCss));
                },
            });
            if (typeof curCss["padding"] != "undefined") {
                var IntValue = parseInt(curCss["padding"], 10);
                padSliderVal = IntValue;
                $(slider_p).slider("value", padSliderVal);
                $(slider_p).prop("value", padSliderVal);
            } else {
                padSliderVal = 0;
                $(slider_p).slider("value", padSliderVal);
                $(slider_p).prop("value", padSliderVal);
            }
            var paddingPx = $("<input/>", {
                type: "number",
                value: padSliderVal,
                min: 0,
                max: 500,
                class: "ws-padding-set setNumber",
                id: "padding",
            });
            var allPadDiv = $("<div/>", { class: "ws-allPadDiv" });
            var padLabel = $("<div/>", { class: "labelInput" });
            var padSlider = $("<div/>", { class: "ws-borSlider" });
            var padInput = $("<div/>", { class: "ws-padInput d-flex gap-3" });
            padLabel.append("<p class='ws-setting-border-heading'><span>Padding(all sides)</span></p>");
            padInput.append(paddingPx);
            padInput.append("<label class='' for='padding'>px</label>");
            slider_p.append(sliderHandel_p);
            padSlider.append(slider_p);
            allPadDiv.append(padLabel);
            padLabel.append(padInput);
            allPadDiv.append(padSlider);
            padAllDiv.append(allPadDiv);
            padAll.append(padAllDiv);
            /* Padding all sides */
            var firstRow = $("<div/>", { class: "ws-firstRow", id: "" });
            var secRow = $("<div/>", { class: "ws-secRow", id: "" });
            thirdDiv.append("<p class='ws-setting-section-heading'><span>Padding (Manage inner spacing)</span></p>");
            for (let index = 0; index < 4; index++) {
                let val = "";
                var sliderPHandel = $("<div/>", {
                    id: "custom-handle",
                    class: "ui-slider-handle",
                });
                var sliderSide = $("<div/>", {
                    id: "ws_p_" + index,
                    class: "sliderCls sliderClsws_p_" + index,
                });
                var sliderP;
                sliderSide.slider({
                    max: 500,
                    min: 0,
                    create: function () {
                        sliderPHandel.text($(this).slider("value"));
                    },
                    slide: function (event, ui) {
                        var curCss = selfobj.__current_col_edit.attr("data-meta-css");
                        if (typeof curCss != "undefined") {
                            try {
                                // Replace single quotes with double quotes
                                curCss = curCss.replace(/'/g, '"');
                                curCss = JSON.parse(curCss);
                            } catch (e) {
                                console.error("Invalid JSON in data-meta-css attribute:", curCss);
                                curCss = {};
                            }
                        } else {
                            curCss = {};
                        }
                        
                        sliderPHandel.text(ui.value);
                        val = ui.value;
                        pad_i.val(val);
                        let tochange = selfobj.__paddingtype["ws_p_" + index];
                        curCss[selfobj.__paddingtype["ws_p_" + index]] = val + "px";
                        selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                    },
                });
                sliderP = sliderSide.slider();
                if (typeof curCss != "undefined") {
                    if ( typeof curCss[selfobj.__paddingtype["ws_p_" + index]] != "undefined") {
                        val = parseInt(curCss[selfobj.__paddingtype["ws_p_" + index]], 10);
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    } else {
                        val = 0;
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    }
                }
                let pad_h = $("<div/>", {
                    class: "ws-col-padding ws-section-setting no-flex ws-grid",
                });
                var padSide = $("<div/>", { class: "labelInput" });
                var padInput = $("<div/>", { class: "ws_p_Input d-flex gap-3" });
                var padSlider = $("<div/>", { class: "ws-borSlider" });
                let pad_i = $("<input/>", {
                    id: "ws_p_" + index,
                    type: "number",
                    class: "ws-col-pad setNumber",
                    value: val,
                });
                if (index == 0) {
                    padSide.append("<p class='ws-setting-border-heading'><span>Padding Top</span></p>");
                } else if (index == 1) {
                    padSide.append("<p class='ws-setting-border-heading'><span>Padding Right</span></p>");
                } else if (index == 2) {
                    padSide.append("<p class='ws-setting-border-heading'><span>Padding Bottom</span></p>");
                } else if (index == 3) {
                    padSide.append("<p class='ws-setting-border-heading'><span>Padding Left</span></p>");
                }
                padInput.append(pad_i);
                padInput.append("<span class=''>px</span>");
                padSide.append(padInput);
                pad_h.append(padSide);
                sliderSide.append(sliderPHandel);
                padSlider.append(sliderSide);
                pad_h.append(padSlider);
                if (index == 0) {
                    firstRow.append(pad_h);
                } else if (index == 1) {
                    firstRow.append(pad_h);
                } else if (index == 2) {
                    secRow.append(pad_h);
                } else if (index == 3) {
                    secRow.append(pad_h);
                }
                padCls.append(firstRow);
                padCls.append(secRow);
            }
            var paddingToggleOpt = $("<div/>", {
                id: "paddingToggleOpt",
                class: "toggleOptCls",
            });
            var paddingToggleBtn = $("<div/>", { id: "paddingToggleBtn" });
            paddingToggleOpt.append("<span>Target individual padding</span>");
            paddingToggleBtn.append("<button class='ToggleBtn' id='padding-toggle_button'>OFF</button>");
            paddingToggleOpt.append(paddingToggleBtn);
            thirdDiv.append(padAll);
            thirdDiv.append(paddingToggleOpt);
            thirdDiv.append(padCls);
            margin_hoder.append(thirdDiv);
            return margin_hoder;
        },

        getAnimationSetting: function () {
            var selfobj = this;
            let animation_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_animations",
                role: "tabpanel",
            });
            let animationType = $("<select/>", {
                class: "form-control ws_animation_type",
            });
            let animationEasing = $("<select/>", {
                class: "form-control ws_animation_easing",
            });
            let animationAnchor = $("<select/>", {
                class: "form-control ws_animation_anchor",
            });
            let selectValues = [
                "none","fade","fade-up","fade-down","fade-left","fade-right","fade-up-right","fade-up-left","fade-down-right","fade-down-left","flip-up","flip-down","flip-left","flip-right","slide-up","slide-down","slide-left","slide-right","zoom-in","zoom-in-up","zoom-in-down","zoom-in-left","zoom-in-right","zoom-out","zoom-out-up","zoom-out-down","zoom-out-left","zoom-out-right"
            ];
            let selectEasing = [
                "none","linear","ease","ease-in","ease-out","ease-in-out","ease-in-back","ease-out-back","ease-in-out-back","ease-in-sine","ease-out-sine","ease-in-out-sine","ease-in-quad","ease-out-quad","ease-in-out-quad","ease-in-cubic","ease-out-cubic","ease-in-out-cubic","ease-in-quart","ease-out-quart","ease-in-out-quart"
            ];
            let selectAnchor = [
                "none", "top-bottom", "top-center", "top-top", "center-bottom", "center-center", "center-top", "bottom-bottom", "bottom-center", "bottom-top",
            ];
            let aniH = $("<div/>", {
                class: "ws-section-setting no-flex ws-grid",
            });
            aniH.append("<p>Animation Type</p>");
            aniH.append(animationType);
            var aos = selfobj.__current_col_edit.attr("data-aos");
            var aos_delay = selfobj.__current_col_edit.attr("data-aos-delay");
            var aos_easing = selfobj.__current_col_edit.attr("data-aos-easing");
            var aos_placement = selfobj.__current_col_edit.attr("data-aos-anchor-placement");
            var aos_offset = selfobj.__current_col_edit.attr("data-aos-offset");
            var aos_duration = selfobj.__current_col_edit.attr("data-aos-duration");
            var aos_mirror = selfobj.__current_col_edit.attr("data-aos-mirror");
            var aos_once = selfobj.__current_col_edit.attr("data-aos-once");
            $.each(selectValues, function (key, value) {
                if (aos == value) {
                    animationType.append($("<option></option>", { selected: "selected" }).attr("value", value).text(value));
                } else {
                    animationType.append($("<option></option>").attr("value", value).text(value));
                }
            });
            $.each(selectEasing, function (key, value) {
                if (aos_easing == value) {
                    animationEasing.append($("<option></option>", { selected: "selected" }).attr("value", value).text(value));
                } else {
                    animationEasing.append($("<option></option>").attr("value", value).text(value));
                }
            });
            let anie = $("<div/>", {
                class: "ws-section-setting no-flex ws-grid",
            });
            anie.append("<p>Animation Easing</p>");
            anie.append(animationEasing);
            $.each(selectAnchor, function (key, value) {
                if (aos_placement == value) {
                    animationAnchor.append($("<option></option>", { selected: "selected" }).attr("value", value).text(value));
                } else {
                    animationAnchor.append($("<option></option>").attr("value", value).text(value));
                }
            });
            let aniA = $("<div/>", {
                class: "ws-section-setting no-flex ws-grid",
            });
            aniA.append("<p>Animation Anchor Placement</p>");
            aniA.append(animationAnchor);
            let anoffset = $("<div/>", {
                class: "ws-section-setting no-flex ws-grid",
            })
            .append($("<p/>", { class: "" }).append("Animation Offset"))
            .append(
                $("<input/>", {
                    type: "text",
                    value: aos_offset,
                    class: "form-control animationSetting",
                    "data-type": "data-aos-offset",
                })
            )
            .append(
                $("<span/>", { class: "ws_second-info" }).append(
                    "offset (in px) from the original trigger point"
                )
            );

            let andelay = $("<div/>", {
                class: "ws-section-setting no-flex ws-grid",
            })
            .append($("<p/>", { class: "" }).append("Animation Delay"))
            .append(
                $("<input/>", {
                    type: "text",
                    value: aos_delay,
                    class: "form-control animationSetting",
                    "data-type": "data-aos-delay",
                })
            )
            .append(
                $("<span/>", { class: "ws_second-info" }).append(
                    "values from 0 to 3000, with step 50ms"
                )
            );

            let anduration = $("<div/>", {
                class: "ws-section-setting no-flex ws-grid",
            })
            .append($("<p/>", { class: "" }).append("Animation Duration"))
            .append(
                $("<input/>", {
                    type: "text",
                    value: aos_duration,
                    class: "form-control animationSetting",
                    "data-type": "data-aos-duration",
                })
            )
            .append(
                $("<span/>", { class: "ws_second-info" }).append(
                    "values from 0 to 3000, with step 50ms"
                )
            );
            if (aos_mirror == "yes") {
                var anmirror = $("<div/>", {
                    class: "ws-section-setting no-flex ws-grid",
                })
                .append($("<p/>", { class: "" }).append("Animation Mirror"))
                .append(
                    $("<select/>", {
                    class: "form-control animationSetting",
                    "data-type": "data-aos-mirror",
                    }).append(
                    "<option value='no'>No</option><option selected='selected' value='yes'>Yes</option>"
                    )
                )
                .append(
                    $("<span/>", { class: "ws_second-info" }).append(
                    "whether elements should animate out while scrolling past them"
                    )
                );
            } else if (aos_mirror == "no") {
                var anmirror = $("<div/>", {
                    class: "ws-section-setting no-flex ws-grid",
                })
                .append($("<p/>", { class: "" }).append("Animation Mirror"))
                .append(
                    $("<select/>", {
                    class: "form-control animationSetting",
                    "data-type": "data-aos-mirror",
                    }).append(
                    "<option selected='selected' value='no'>No</option><option value='yes'>Yes</option>"
                    )
                )
                .append(
                    $("<span/>", { class: "ws_second-info" }).append(
                    "whether elements should animate out while scrolling past them"
                    )
                );
            } else {
                var anmirror = $("<div/>", {
                    class: "ws-section-setting no-flex ws-grid",
                })
                .append($("<p/>", { class: "" }).append("Animation Mirror"))
                .append(
                    $("<select/>", {
                    class: "form-control animationSetting",
                    "data-type": "data-aos-mirror",
                    }).append(
                    "<option value='no'>No</option><option value='yes'>Yes</option>"
                    )
                )
                .append(
                    $("<span/>", { class: "ws_second-info" }).append(
                    "whether elements should animate out while scrolling past them"
                    )
                );
            }

            if (aos_once == "yes") {
                var anonce = $("<div/>", {
                    class: "ws-section-setting no-flex ws-grid",
                })
                .append($("<p/>", { class: "" }).append("Animation Once"))
                .append(
                    $("<select/>", {
                    class: "form-control animationSetting",
                    "data-type": "data-aos-once",
                    }).append(
                    "<option value='no'>No</option><option selected='selected' value='yes'>Yes</option>"
                    )
                )
                .append(
                    $("<span/>", { class: "ws_second-info" }).append(
                    "whether animation should happen only once - while scrolling down"
                    )
                );
            } else if (aos_once == "no") {
                var anonce = $("<div/>", {
                    class: "ws-section-setting no-flex ws-grid",
                })
                .append($("<p/>", { class: "" }).append("Animation Once"))
                .append(
                    $("<select/>", {
                    class: "form-control animationSetting",
                    "data-type": "data-aos-once",
                    }).append(
                    "<option selected='selected' value='no'>No</option><option value='yes'>Yes</option>"
                    )
                )
                .append(
                    $("<span/>", { class: "ws_second-info" }).append(
                    "whether animation should happen only once - while scrolling down"
                    )
                );
            } else {
                var anonce = $("<div/>", {
                    class: "ws-section-setting no-flex ws-grid",
                })
                .append($("<p/>", { class: "" }).append("Animation Once"))
                .append(
                    $("<select/>", {
                    class: "form-control animationSetting",
                    "data-type": "data-aos-once",
                    }).append(
                    "<option value='no'>No</option><option value='yes'>Yes</option>"
                    )
                )
                .append(
                    $("<span/>", { class: "ws_second-info" }).append(
                    "whether animation should happen only once - while scrolling down"
                    )
                );
            }
            animation_hoder.append(aniH);
            animation_hoder.append(anie);
            animation_hoder.append(aniA);
            animation_hoder.append(anoffset);
            animation_hoder.append(andelay);
            animation_hoder.append(anduration);
            animation_hoder.append(anmirror);
            animation_hoder.append(anonce);
            return animation_hoder;
        },

        getAlignment: function () {
            var selfobj = this;
            var curCss = selfobj.__current_col_edit.attr("data-meta-css");
            if (typeof curCss != "undefined") {
                try {
                    // Replace single quotes with double quotes
                    curCss = curCss.replace(/'/g, '"');
                    curCss = JSON.parse(curCss);
                } catch (e) {
                    console.error("Invalid JSON in data-meta-css attribute:", curCss);
                    curCss = {};
                }
            } else {
                curCss = {};
            }

            var alignmentList = [
                "select", "left", "center", "right", "end", "inherit", "revert", "unset",
            ];
            var sel = $("<select/>", {
                class: "ws-align-text",
            });
            for (let i = 0; i < alignmentList.length; i++) {
                if ( curCss["text-align"] != "undefined" && alignmentList[i] == curCss["text-align"]) {
                    sel.append( new Option(alignmentList[i], alignmentList[i], true, true));
                } else {
                    sel.append(new Option(alignmentList[i], alignmentList[i]));
                }
            }
            var wh = $("<div/>", {
                class: "ws-aligment",
            });
            var holder = $("<div/>", {
                class: "ws-section-setting",
            });
            holder.append(sel);
            wh.append("<p class='ws-setting-section-heading'><span>Content Align</span></p>");
            wh.append(holder);
            return wh;
        },

        borderSetting: function () {
            var selfobj = this;
            var borholder = $("<div/>", {});
            var curCss = selfobj.__current_col_edit.attr("data-meta-css");
            if (typeof curCss != "undefined") {
                try {
                    // Replace single quotes with double quotes
                    curCss = curCss.replace(/'/g, '"');
                    curCss = JSON.parse(curCss);
                } catch (e) {
                    console.error("Invalid JSON in data-meta-css attribute:", curCss);
                    curCss = {};
                }
            } else {
                curCss = {};
            }
            
            var borList = $("<div/>", {
                class: "ws-border-setting",
            });
            var toggleWidth = $("<div/>", {
                class: "ws-toggleWidth",
            });
            var borderCls = $("<div/>", {
                class: "ws-borderCls",
                id: "individualBorder",
            });
            var firstRows = $("<div/>", { class: "ws-firstRow", id: "" });
            var secRows = $("<div/>", { class: "ws-secRow", id: "" });
            var thirdRows = $("<div/>", { class: "ws-thirdRow", id: "" });
            var fourthRows = $("<div/>", { class: "ws-fourthRow", id: "" });
            /* Border all sides Width */
            var borWidth = $("<div/>", {
                class: "ws-borWidth ws-section-setting no-flex ws-grid",
            });
            var slideVal;
            var slider = $("<div/>", {
                id: "slider",
                class: "sliderCls border-width",
            });
            var sliderHandel = $("<div/>", {
                id: "custom-handle",
                class: "ui-slider-handle",
            });
            slider.slider({
                max: 500,
                min: 0,
                create: function () {
                    sliderHandel.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = selfobj.__current_col_edit.attr("data-meta-css");
                    if (typeof curCss != "undefined") {
                        try {
                            // Replace single quotes with double quotes
                            curCss = curCss.replace(/'/g, '"');
                            curCss = JSON.parse(curCss);
                        } catch (e) {
                            console.error("Invalid JSON in data-meta-css attribute:", curCss);
                            curCss = {};
                        }
                    } else {
                        curCss = {};
                    }
                    
                    sliderHandel.text(ui.value);
                    slideVal = ui.value;
                    widthPx.val(slideVal);
                    curCss["border-width"] = slideVal + "px";
                    selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                },
            });
            if (typeof curCss["border-width"] != "undefined") {
                var widthIntValue = parseInt(curCss["border-width"], 10);
                slideVal = widthIntValue;
                $(slider).slider("value", slideVal);
                $(slider).prop("value", slideVal);
            } else {
                slideVal = "";
                $(slider).slider("value", slideVal);
                $(slider).prop("value", slideVal);
            }
            var widthPx = $("<input/>", {
                type: "number",
                value: slideVal,
                id: "border-width",
                class: "ws-border-width-set setNumber",
            });
            var allBorDiv = $("<div/>", { class: "ws-allBorDiv" });
            var borLabel = $("<div/>", { class: "ws-borLabel" });
            var borSlider = $("<div/>", { class: "ws-borSlider" });
            var borInput = $("<div/>", { class: "ws-borInput d-flex gap-3" });
            borLabel.append("<p class='ws-setting-border-heading'><span>Border Width(all borders)</span></p>");
            borInput.append(widthPx);
            borInput.append("<label class='' for='border-width'>px</label>");
            slider.append(sliderHandel);
            borSlider.append(slider);
            allBorDiv.append(borLabel);
            borLabel.append(borInput);
            allBorDiv.append(borSlider);
            borWidth.append(allBorDiv);
            borList.append(borWidth);
            /* Border all sides Width */
            /* Border all sides Type */
            var borType = $("<div/>", {
                class: "ws-borderStyle ws-section-setting no-flex ws-grid",
            });
            var bList = [
                "none", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset",
            ];
            var sel = $("<select/>", {
                class: "ws-border-style-set",
                id: "border-style",
            });
            for (let i = 0; i < bList.length; i++) {
                if (curCss["border-style"] != "undefined" && bList[i] == curCss["border-style"]) {
                    sel.append(new Option(bList[i], bList[i], true, true));
                } else {
                    sel.append(new Option(bList[i], bList[i]));
                }
            }
            borType.append("<p class='ws-setting-border-heading'><span>Border Style</span></p>");
            borType.append(sel);
            borList.append(borType);
            /* Border all sides Type */
            /* Border all sides Color */
            var borColor = $("<div/>", {
                class: "ws-borderColor ws-section-setting no-flex ws-grid",
            });
            if (typeof curCss["border-color"] != "undefined") {
                var cor = curCss["border-color"];
            } else {
                var cor = "#000000";
            }
            var color = $("<input/>", {
                type: "text",
                value: cor,
                class: "ws-border-color-set",
                id: "border-color",
            });
            borColor.append("<p class='ws-setting-border-heading'><span>Border Color</span></p>");
            borColor.append(color);
            borList.append(borColor);
            selfobj.colorPicker(color);
            /* Border all sides Color */
            //border width
            for (let index = 0; index < 4; index++) {
                let val = "";
                let sliderBW;
                let sliderSideHandel = $("<div/>", {
                    id: "custom-handle",
                    class: "ui-slider-handle",
                });
                let sliderSide = $("<div/>", {
                    id: "ws_bw_" + index,
                    class: "sliderCls sliderClsws_bw_" + index,
                });
                sliderSide.slider({
                    max: 500,
                    min: 0,
                    create: function () {
                        sliderSideHandel.text($(this).slider("value"));
                    },
                    slide: function (event, ui) {
                        var curCss = selfobj.__current_col_edit.attr("data-meta-css");
                        if (typeof curCss != "undefined") {
                            try {
                                // Replace single quotes with double quotes
                                curCss = curCss.replace(/'/g, '"');
                                curCss = JSON.parse(curCss);
                            } catch (e) {
                                console.error("Invalid JSON in data-meta-css attribute:", curCss);
                                curCss = {};
                            }
                        } else {
                            curCss = {};
                        }
                        
                        sliderSideHandel.text(ui.value);
                        val = ui.value;
                        width_i.val(val);
                        let tochange = selfobj.__borderWidth["ws_bw_" + index];
                        curCss[selfobj.__borderWidth["ws_bw_" + index]] = val + "px";
                        selfobj.__current_col_edit.attr("data-meta-css",JSON.stringify(curCss));
                    },
                });
                sliderBW = sliderSide.slider();
                if (typeof curCss != "undefined") {
                    if (typeof curCss[selfobj.__borderWidth["ws_bw_" + index]] != "undefined") {
                        val = parseInt(curCss[selfobj.__borderWidth["ws_bw_" + index]], 10);
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    } else {
                        val = 0;
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    }
                }
                let mar_h = $("<div/>", {
                    class: "ws-border-width ws-section-setting no-flex ws-grid",
                });
                let widthSide = $("<div/>", { class: "labelInput" });
                let widthInput = $("<div/>", { class: "ws_bw_Input d-flex gap-3" });
                let widthSlider = $("<div/>", { class: "ws-borSlider" });
                let width_i = $("<input/>", {
                    id: "ws_bw_" + index,
                    type: "number",
                    class: "ws-borderWidth-set",
                    value: val,
                });
                if (index == 0) {
                    widthSide.append("<p class='ws-setting-border-heading'><span>Border Top width</span></p>");
                } else if (index == 1) {
                    widthSide.append("<p class='ws-setting-border-heading'><span>Border Right width</span></p>");
                } else if (index == 2) {
                    widthSide.append("<p class='ws-setting-border-heading'><span>Border Bottom width</span></p>");
                } else if (index == 3) {
                    widthSide.append("<p class='ws-setting-border-heading'><span>Border Left width</span></p>");
                }
                widthInput.append(width_i);
                widthInput.append("<span class=''>px</span>");
                widthSide.append(widthInput);
                mar_h.append(widthSide);
                sliderSide.append(sliderSideHandel);
                widthSlider.append(sliderSide);
                mar_h.append(widthSlider);
                if (index == 0) {
                    firstRows.append(mar_h);
                } else if (index == 1) {
                    secRows.append(mar_h);
                } else if (index == 2) {
                    thirdRows.append(mar_h);
                } else if (index == 3) {
                    fourthRows.append(mar_h);
                }
                borderCls.append(firstRows);
                borderCls.append(secRows);
                borderCls.append(thirdRows);
                borderCls.append(fourthRows);
            }
            //border width
            //border style
            for (let index = 0; index < 4; index++) {
                let mar_h = $("<div/>", {
                    class: "ws-border-style ws-section-setting no-flex ws-grid",
                });
                let bList = [
                    "none", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset",
                ];
                let sel = $("<select/>", {
                    class: "ws-borderStyle-set",
                    id: "ws_bs_" + index,
                });
                for (let i = 0; i < bList.length; i++) {
                    if (typeof curCss[selfobj.__borderStyle["ws_bs_" + index]] != "undefined" && bList[i] == curCss[selfobj.__borderStyle["ws_bs_" + index]]) {
                        sel.append(new Option(bList[i], bList[i], true, true));
                    } else {
                        sel.append(new Option(bList[i], bList[i]));
                    }
                }
                if (index == 0) {
                    mar_h.append("<p class='ws-setting-border-heading'><span>Border Top Style</span></p>");
                } else if (index == 1) {
                    mar_h.append("<p class='ws-setting-border-heading'><span>Border Right Style</span></p>");
                } else if (index == 2) {
                    mar_h.append("<p class='ws-setting-border-heading'><span>Border Bottom Style</span></p>");
                } else if (index == 3) {
                    mar_h.append("<p class='ws-setting-border-heading'><span>Border Left Style</span></p>");
                }
                mar_h.append(sel);
                if (index == 0) {
                    firstRows.append(mar_h);
                } else if (index == 1) {
                    secRows.append(mar_h);
                } else if (index == 2) {
                    thirdRows.append(mar_h);
                } else if (index == 3) {
                    fourthRows.append(mar_h);
                }
                borderCls.append(firstRows);
                borderCls.append(secRows);
                borderCls.append(thirdRows);
                borderCls.append(fourthRows);
            }
            //border style
            //border color
            for (let index = 0; index < 4; index++) {
                let mar_h = $("<div/>", {
                    class: "ws-border-color ws-section-setting no-flex ws-grid",
                });
                if (typeof curCss[selfobj.__borderColor["ws_bc_" + index]] != "undefined") {
                    var corTop = curCss[selfobj.__borderColor["ws_bc_" + index]];
                } else {
                    var corTop = "#000000";
                }
                let colorTop = $("<input/>", {
                    type: "text",
                    value: corTop,
                    class: "ws-borderColor-set",
                    id: "ws_bc_" + index,
                });
                if (index == 0) {
                    mar_h.append("<p class='ws-setting-border-heading'><span>Border Top Color</span></p>");
                } else if (index == 1) {
                    mar_h.append("<p class='ws-setting-border-heading'><span>Border Right Color</span></p>");
                } else if (index == 2) {
                    mar_h.append("<p class='ws-setting-border-heading'><span>Border Bottom Color</span></p>");
                } else if (index == 3) {
                    mar_h.append("<p class='ws-setting-border-heading'><span>Border Left Color</span></p>");
                }
                mar_h.append(colorTop);
                selfobj.colorPicker(colorTop);
                if (index == 0) {
                    firstRows.append(mar_h);
                } else if (index == 1) {
                    secRows.append(mar_h);
                } else if (index == 2) {
                    thirdRows.append(mar_h);
                } else if (index == 3) {
                    fourthRows.append(mar_h);
                }
                borderCls.append(firstRows);
                borderCls.append(secRows);
                borderCls.append(thirdRows);
                borderCls.append(fourthRows);
            }
            //border color
            var widthToggleOpt = $("<div/>", {
                id: "widthToggleOpt",
                class: "toggleOptCls",
            });
            var widthToggleBtn = $("<div/>", { id: "widthToggleBtn" });
            widthToggleOpt.append("<span>Target individual border</span>");
            widthToggleBtn.append(
                "<button class='ToggleBtn' id='width-toggle_button'>OFF</button>"
            );
            widthToggleOpt.append(widthToggleBtn);
            toggleWidth.append(widthToggleOpt);
            toggleWidth.append(borderCls);
            var secDiv = $("<div/>", { class: "ws-secDiv" });
            var radCls = $("<div/>", { class: "ws-radCls", id: "individualRadius" });
            var radAll = $("<div/>", { class: "ws-radAll", id: "" });
            /* Border Radius all sides */
            var radAllDiv = $("<div/>", {
                class: "ws-radAllDiv ws-section-setting no-flex ws-grid",
            });
            var radSliderVal;
            var slider_r = $("<div/>", {
                id: "slider_r",
                class: "sliderCls border-radius",
            });
            var sliderHandel_r = $("<div/>", {
                id: "custom-handle",
                class: "ui-slider-handle",
            });
            slider_r.slider({
                max: 500,
                min: 0,
                create: function () {
                    sliderHandel_r.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = selfobj.__current_col_edit.attr("data-meta-css");
                    if (typeof curCss != "undefined") {
                        try {
                            // Replace single quotes with double quotes
                            curCss = curCss.replace(/'/g, '"');
                            curCss = JSON.parse(curCss);
                        } catch (e) {
                            console.error("Invalid JSON in data-meta-css attribute:", curCss);
                            curCss = {};
                        }
                    } else {
                        curCss = {};
                    }
                    
                    sliderHandel_r.text(ui.value);
                    radSliderVal = ui.value;
                    radiusPx.val(radSliderVal);
                    curCss["border-radius"] = radSliderVal + "px";
                    selfobj.__current_col_edit.attr("data-meta-css",JSON.stringify(curCss));
                },
            });
            if (typeof curCss["border-radius"] != "undefined") {
                var radIntValue = parseInt(curCss["border-radius"], 10);
                radSliderVal = radIntValue;
                $(slider_r).slider("value", radSliderVal);
                $(slider_r).prop("value", radSliderVal);
            } else {
                radSliderVal = 0;
                $(slider_r).slider("value", radSliderVal);
                $(slider_r).prop("value", radSliderVal);
            }
            var radiusPx = $("<input/>", {
                type: "number",
                value: radSliderVal,
                min: 0,
                max: 500,
                class: "ws-radius-set setNumber",
                id: "border-radius",
            });
            var allRadDiv = $("<div/>", { class: "ws-allRadDiv" });
            var radLabel = $("<div/>", { class: "labelInput" });
            var radSlider = $("<div/>", { class: "ws-borSlider" });
            var radInput = $("<div/>", { class: "ws-radInput d-flex gap-3" });
            radLabel.append("<p class='ws-setting-border-heading'><span>Border Radius(all corners)</span></p>");
            radInput.append(radiusPx);
            radInput.append("<label class='' for='border-radius'>px</label>");
            slider_r.append(sliderHandel_r);
            radSlider.append(slider_r);
            allRadDiv.append(radLabel);
            radLabel.append(radInput);
            allRadDiv.append(radSlider);
            radAllDiv.append(allRadDiv);
            radAll.append(radAllDiv);
            /* Border Radius all sides */
            var firstRow = $("<div/>", { class: "ws-firstRow", id: "" });
            var secRow = $("<div/>", { class: "ws-secRow", id: "" });
            secDiv.append("<p class='ws-setting-section-heading'><span>Border Radius</span></p>");
            for (let index = 0; index < 4; index++) {
                let val = "";
                let sliderR;
                let sliderSideHandel = $("<div/>", {
                    id: "custom-handle",
                    class: "ui-slider-handle",
                });
                let sliderSide = $("<div/>", {
                    id: "ws_br_" + index,
                    class: "sliderCls sliderClsws_br_" + index,
                });
                sliderSide.slider({
                    max: 500,
                    min: 0,
                    create: function () {
                        sliderSideHandel.text($(this).slider("value"));
                    },
                    slide: function (event, ui) {
                        var curCss = selfobj.__current_col_edit.attr("data-meta-css");
                        if (typeof curCss != "undefined") {
                            try {
                                // Replace single quotes with double quotes
                                curCss = curCss.replace(/'/g, '"');
                                curCss = JSON.parse(curCss);
                            } catch (e) {
                                console.error("Invalid JSON in data-meta-css attribute:", curCss);
                                curCss = {};
                            }
                        } else {
                            curCss = {};
                        }

                        sliderSideHandel.text(ui.value);
                        val = ui.value;
                        radius_i.val(val);
                        let tochange = selfobj.__borderRadius["ws_br_" + index];
                        curCss[selfobj.__borderRadius["ws_br_" + index]] = val + "px";
                        selfobj.__current_col_edit.attr( "data-meta-css",JSON.stringify(curCss));
                    },
                });
                sliderR = sliderSide.slider();
                if (typeof curCss != "undefined") {
                    if ( typeof curCss[selfobj.__borderRadius["ws_br_" + index]] != "undefined") {
                        val = parseInt(curCss[selfobj.__borderRadius["ws_br_" + index]],10);
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    } else {
                        val = 0;
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    }
                }
                let mar_h = $("<div/>", {
                    class: "ws-col-radius ws-section-setting no-flex ws-grid",
                });
                let radSide = $("<div/>", { class: "labelInput" });
                let radInput = $("<div/>", { class: "ws_br_Input d-flex gap-3" });
                let radSlider = $("<div/>", { class: "ws-borSlider" });
                let radius_i = $("<input/>", {
                    id: "ws_br_" + index,
                    type: "number",
                    class: "ws-borRadius-set",
                    value: val,
                });
                if (index == 0) {
                    radSide.append("<p class='ws-setting-border-heading'><span>Border Top Left Radius</span></p>");
                } else if (index == 1) {
                    radSide.append("<p class='ws-setting-border-heading'><span>Border Top Right Radius</span></p>");
                } else if (index == 2) {
                    radSide.append("<p class='ws-setting-border-heading'><span>Border Bottom Left Radius</span></p>");
                } else if (index == 3) {
                    radSide.append("<p class='ws-setting-border-heading'><span>Border Bottom Right Radius</span></p>");
                }
                radInput.append(radius_i);
                radInput.append("<span class=''>px</span>");
                radSide.append(radInput);
                mar_h.append(radSide);
                sliderSide.append(sliderSideHandel);
                radSlider.append(sliderSide);
                mar_h.append(radSlider);
                if (index == 0) {
                    firstRow.append(mar_h);
                } else if (index == 1) {
                    firstRow.append(mar_h);
                } else if (index == 2) {
                    secRow.append(mar_h);
                } else if (index == 3) {
                    secRow.append(mar_h);
                }
                radCls.append(firstRow);
                radCls.append(secRow);
            }
            borholder.append("<p class='ws-setting-section-heading'><span>Border Width</span></p>");
            borholder.append(borList);
            borholder.append(toggleWidth);
            var radiusToggleOpt = $("<div/>", {
                id: "radiusToggleOpt",
                class: "toggleOptCls",
            });
            var radiusToggleBtn = $("<div/>", { id: "radiusToggleBtn" });
            radiusToggleOpt.append("<span>Target individual radius</span>");
            radiusToggleBtn.append("<button class='ToggleBtn' id='radius-toggle_button'>OFF</button>");
            radiusToggleOpt.append(radiusToggleBtn);
            secDiv.append(radAll);
            secDiv.append(radiusToggleOpt);
            secDiv.append(radCls);
            borholder.append(secDiv);
            return borholder;
        },

        boxShadowSetting: function () {
            var selfobj = this;
            var boxShadowHolder = $("<div/>", {});
            var boxShadowList = $("<div/>", {
                class: "ws-boxShadow-setting",
            });
            var firstRowShadow = $("<div/>", { class: "ws-firstRowShadow" });
            var secRowShadow = $("<div/>", { class: "ws-secRowShadow" });
            var thirdRowShadow = $("<div/>", { class: "ws-thirdRowShadow" });
            var curCss = selfobj.__current_col_edit.attr("data-meta-css");
            if (typeof curCss != "undefined") {
                try {
                    // Replace single quotes with double quotes
                    curCss = curCss.replace(/'/g, '"');
                    curCss = JSON.parse(curCss);
                } catch (e) {
                    console.error("Invalid JSON in data-meta-css attribute:", curCss);
                    curCss = {};
                }
            } else {
                curCss = {};
            }
            
            // Horizontal Offset
            var horizShadowList = $("<div/>", {
                class: "ws-horiz-shadow-setting ws-section-setting no-flex ws-grid",
            });
            var horizShadow = $("<div/>", { class: "ws-horizShadow" });
            var slideHorizVal;
            var sliderHoriz = $("<div/>", {
                id: "radiusBox",
                class: "sliderCls box-shadow-horizontal",
            });
            var sliderHorizHandel = $("<div/>", {
                id: "custom-handle",
                class: "ui-slider-handle",
            });
            sliderHoriz.slider({
                max: 500,
                min: -500,
                create: function () {
                    sliderHorizHandel.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = selfobj.__current_col_edit.attr("data-meta-css");
                    if (typeof curCss != "undefined") {
                        try {
                            // Replace single quotes with double quotes
                            curCss = curCss.replace(/'/g, '"');
                            curCss = JSON.parse(curCss);
                        } catch (e) {
                            console.error("Invalid JSON in data-meta-css attribute:", curCss);
                            curCss = {};
                        }
                    } else {
                        curCss = {};
                    }
                    
                    sliderHorizHandel.text(ui.value);
                    slideHorizVal = ui.value;
                    HorizOffsetPx.val(slideHorizVal);
                    curCss["box-shadow-horizontal"] = slideHorizVal + "px";
                    var boxShadowValue =
                        (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : "") +
                        (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : "") +
                        (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : "") +
                        (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : "") +
                        color.val();
                    curCss["box-shadow"] = boxShadowValue;
                    selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                },
            });
            if (typeof curCss["box-shadow-horizontal"] != "undefined") {
                var horizIntValue = parseInt(curCss["box-shadow-horizontal"], 10);
                slideHorizVal = horizIntValue;
                $(sliderHoriz).slider("value", slideHorizVal);
                $(sliderHoriz).prop("value", slideHorizVal);
            } else {
                slideHorizVal = "";
                $(sliderHoriz).slider("value", slideHorizVal);
                $(sliderHoriz).prop("value", slideHorizVal);
            }
            var HorizOffsetPx = $("<input/>", {
                type: "number",
                max: 500,
                min: -500,
                value: slideHorizVal,
                class: "ws-boxshadow-set",
                id: "box-shadow-horizontal",
            });
            var horizDiv = $("<div/>", { class: "ws-horizDiv" });
            var horizLabel = $("<div/>", { class: "ws-horizLabel" });
            var horizSlider = $("<div/>", { class: "ws-borSlider" });
            var horizInput = $("<div/>", { class: "ws-horizInput d-flex gap-3" });
            horizLabel.append("<p class='ws-setting-border-heading'><span>Horizontal Shadow Length</span></p>");
            horizInput.append(HorizOffsetPx);
            horizInput.append("<label class='' for='box-shadow-horizontal'>px</label>");
            sliderHoriz.append(sliderHorizHandel);
            horizSlider.append(sliderHoriz);
            horizDiv.append(horizLabel);
            horizLabel.append(horizInput);
            horizDiv.append(horizSlider);
            horizShadow.append(horizDiv);
            horizShadowList.append(horizShadow);
            // Vertical Offset
            var vertShadowList = $("<div/>", {
                class: "ws-vert-shadow-setting ws-section-setting no-flex ws-grid",
            });
            var vertShadow = $("<div/>", { class: "ws-vertShadow" });
            var slidevertVal;
            var slidervert = $("<div/>", {
                id: "radiusBox",
                class: "sliderCls box-shadow-vertical",
            });
            var slidervertHandel = $("<div/>", {
                id: "custom-handle",
                class: "ui-slider-handle",
            });
            slidervert.slider({
                max: 500,
                min: -500,
                create: function () {
                    slidervertHandel.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = selfobj.__current_col_edit.attr("data-meta-css");
                    if (typeof curCss != "undefined") {
                        try {
                            // Replace single quotes with double quotes
                            curCss = curCss.replace(/'/g, '"');
                            curCss = JSON.parse(curCss);
                        } catch (e) {
                            console.error("Invalid JSON in data-meta-css attribute:", curCss);
                            curCss = {};
                        }
                    } else {
                        curCss = {};
                    }

                    slidervertHandel.text(ui.value);
                    slidevertVal = ui.value;
                    vertOffsetPx.val(slidevertVal);
                    curCss["box-shadow-vertical"] = slidevertVal + "px";
                    var boxShadowValue =
                        (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : "") +
                        (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : "") +
                        (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : "") +
                        (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : "") +
                        color.val();
                    curCss["box-shadow"] = boxShadowValue;
                selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                },
            });
            if (typeof curCss["box-shadow-vertical"] != "undefined") {
                var vertIntValue = parseInt(curCss["box-shadow-vertical"], 10);
                slidevertVal = vertIntValue;
                $(slidervert).slider("value", slidevertVal);
                $(slidervert).prop("value", slidevertVal);
            } else {
                slidevertVal = "";
                $(slidervert).slider("value", slidevertVal);
                $(slidervert).prop("value", slidevertVal);
            }
            var vertOffsetPx = $("<input/>", {
                type: "number",
                max: 500,
                min: -500,
                value: slidevertVal,
                class: "ws-boxshadow-set",
                id: "box-shadow-vertical",
            });
            var vertDiv = $("<div/>", { class: "ws-vertDiv" });
            var vertLabel = $("<div/>", { class: "ws-vertLabel" });
            var vertSlider = $("<div/>", { class: "ws-borSlider" });
            var vertInput = $("<div/>", { class: "ws-vertInput d-flex gap-3" });
            vertLabel.append("<p class='ws-setting-border-heading'><span>Vertical Shadow Length</span></p>");
            vertInput.append(vertOffsetPx);
            vertInput.append("<label class='' for='box-shadow-vertical'>px</label>");
            slidervert.append(slidervertHandel);
            vertSlider.append(slidervert);
            vertDiv.append(vertLabel);
            vertLabel.append(vertInput);
            vertDiv.append(vertSlider);
            vertShadow.append(vertDiv);
            vertShadowList.append(vertShadow);
            // Blur Radius
            var blurShadowList = $("<div/>", {
                class: "ws-blur-shadow-setting ws-section-setting no-flex ws-grid",
            });
            var blurShadow = $("<div/>", { class: "ws-blurShadow" });
            var slideblurVal;
            var sliderblur = $("<div/>", {
                id: "radiusBox",
                class: "sliderCls box-shadow-blur",
            });
            var sliderblurHandel = $("<div/>", {
                id: "custom-handle",
                class: "ui-slider-handle",
            });
            sliderblur.slider({
                max: 500,
                min: 0,
                create: function () {
                    sliderblurHandel.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = selfobj.__current_col_edit.attr("data-meta-css");
                    if (typeof curCss != "undefined") {
                        try {
                            // Replace single quotes with double quotes
                            curCss = curCss.replace(/'/g, '"');
                            curCss = JSON.parse(curCss);
                        } catch (e) {
                            console.error("Invalid JSON in data-meta-css attribute:", curCss);
                            curCss = {};
                        }
                    } else {
                        curCss = {};
                    }
                    
                    sliderblurHandel.text(ui.value);
                    slideblurVal = ui.value;
                    blurOffsetPx.val(slideblurVal);
                    curCss["box-shadow-blur"] = slideblurVal + "px";
                    var boxShadowValue =
                        (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : "") +
                        (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : "") +
                        (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : "") +
                        (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : "") +
                        color.val();
                    curCss["box-shadow"] = boxShadowValue;
                    selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                },
            });
            if (typeof curCss["box-shadow-blur"] != "undefined") {
                var blurIntValue = parseInt(curCss["box-shadow-blur"], 10);
                slideblurVal = blurIntValue;
                $(sliderblur).slider("value", slideblurVal);
                $(sliderblur).prop("value", slideblurVal);
            } else {
                slideblurVal = "";
                $(sliderblur).slider("value", slideblurVal);
                $(sliderblur).prop("value", slideblurVal);
            }
            var blurOffsetPx = $("<input/>", {
                type: "number",
                value: slideblurVal,
                class: "ws-boxshadow-set",
                id: "box-shadow-blur",
            });
            var blurDiv = $("<div/>", { class: "ws-blurDiv" });
            var blurLabel = $("<div/>", { class: "ws-blurLabel" });
            var blurSlider = $("<div/>", { class: "ws-borSlider" });
            var blurInput = $("<div/>", { class: "ws-blurInput d-flex gap-3" });
            blurLabel.append("<p class='ws-setting-border-heading'><span>Blur Radius</span></p>");
            blurInput.append(blurOffsetPx);
            blurInput.append("<label class='' for='box-shadow-blur'>px</label>");
            sliderblur.append(sliderblurHandel);
            blurSlider.append(sliderblur);
            blurDiv.append(blurLabel);
            blurLabel.append(blurInput);
            blurDiv.append(blurSlider);
            blurShadow.append(blurDiv);
            blurShadowList.append(blurShadow);
            // Spread Radius
            var spreadShadowList = $("<div/>", {
                class: "ws-spread-shadow-setting ws-section-setting no-flex ws-grid",
            });
            var spreadShadow = $("<div/>", { class: "ws-spreadShadow" });
            var slidespreadVal;
            var sliderspread = $("<div/>", {
                id: "radiusBox",
                class: "sliderCls box-shadow-spread",
            });
            var sliderspreadHandel = $("<div/>", {
                id: "custom-handle",
                class: "ui-slider-handle",
            });
            sliderspread.slider({
                max: 500,
                min: -500,
                create: function () {
                    sliderspreadHandel.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = selfobj.__current_col_edit.attr("data-meta-css");
                    if (typeof curCss != "undefined") {
                        try {
                            // Replace single quotes with double quotes
                            curCss = curCss.replace(/'/g, '"');
                            curCss = JSON.parse(curCss);
                        } catch (e) {
                            console.error("Invalid JSON in data-meta-css attribute:", curCss);
                            curCss = {};
                        }
                    } else {
                        curCss = {};
                    }
                    
                    sliderspreadHandel.text(ui.value);
                    slidespreadVal = ui.value;
                    spreadOffsetPx.val(slidespreadVal);
                    curCss["box-shadow-spread"] = slidespreadVal + "px";
                    var boxShadowValue =
                        (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : "") +
                        (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : "") +
                        (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : "") +
                        (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : "") +
                        color.val();
                    curCss["box-shadow"] = boxShadowValue;
                    selfobj.__current_col_edit.attr("data-meta-css",JSON.stringify(curCss));
                },
            });
            if (typeof curCss["box-shadow-spread"] != "undefined") {
                var spreadIntValue = parseInt(curCss["box-shadow-spread"], 10);
                slidespreadVal = spreadIntValue;
                $(sliderspread).slider("value", slidespreadVal);
                $(sliderspread).prop("value", slidespreadVal);
            } else {
                slidespreadVal = "";
                $(sliderspread).slider("value", slidespreadVal);
                $(sliderspread).prop("value", slidespreadVal);
            }
            var spreadOffsetPx = $("<input/>", {
                type: "number",
                max: 500,
                min: -500,
                value: slidespreadVal,
                class: "ws-boxshadow-set",
                id: "box-shadow-spread",
            });
            var spreadDiv = $("<div/>", { class: "ws-spreadDiv" });
            var spreadLabel = $("<div/>", { class: "ws-spreadLabel" });
            var spreadSlider = $("<div/>", { class: "ws-borSlider" });
            var spreadInput = $("<div/>", { class: "ws-spreadInput d-flex gap-3" });
            spreadLabel.append("<p class='ws-setting-border-heading'><span>Spread Radius</span></p>");
            spreadInput.append(spreadOffsetPx);
            spreadInput.append("<label class='' for='box-shadow-spread'>px</label>");
            sliderspread.append(sliderspreadHandel);
            spreadSlider.append(sliderspread);
            spreadDiv.append(spreadLabel);
            spreadLabel.append(spreadInput);
            spreadDiv.append(spreadSlider);
            spreadShadow.append(spreadDiv);
            spreadShadowList.append(spreadShadow);
            // Opacity Radius
            var opacShadowList = $("<div/>", {
                class: "ws-opac-shadow-setting ws-section-setting no-flex ws-grid",
            });
            var opacShadow = $("<div/>", { class: "ws-opacShadow" });
            var slideopacVal;
            var slideropac = $("<div/>", {
                id: "radiusBox",
                class: "sliderCls box-shadow-opacity",
            });
            var slideropacHandel = $("<div/>", {
                id: "custom-handle",
                class: "ui-slider-handle",
            });
            slideropac.slider({
                max: 1.0,
                min: 0.0,
                step: 0.1,
                create: function () {
                    slideropacHandel.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = selfobj.__current_col_edit.attr("data-meta-css");
                    if (typeof curCss != "undefined") {
                        try {
                            // Replace single quotes with double quotes
                            curCss = curCss.replace(/'/g, '"');
                            curCss = JSON.parse(curCss);
                        } catch (e) {
                            console.error("Invalid JSON in data-meta-css attribute:", curCss);
                            curCss = {};
                        }
                    } else {
                        curCss = {};
                    }
                    
                    slideropacHandel.text(ui.value);
                    slideopacVal = ui.value;
                    opacOffsetPx.val(slideopacVal);
                    var rgbaString = curCss["box-shadow-color"];
                    if (rgbaString) {
                        var rgbaArray = rgbaString.slice(5, -1).split(",");
                        rgbaArray[3] = slideopacVal;
                        var updatedRgbaString = "rgba(" + rgbaArray[0] + "," + rgbaArray[1] + "," + rgbaArray[2] + "," + rgbaArray[3] + ")";
                        curCss["box-shadow-color"] = updatedRgbaString;
                        color.val(updatedRgbaString);
                    }
                    curCss["box-shadow-opacity"] = slideopacVal;
                    var boxShadowValue =
                        (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : "") +
                        (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : "") +
                        (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : "") +
                        (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : "") +
                        color.val();
                    curCss["box-shadow"] = boxShadowValue;
                    selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                },
            });
            if (typeof curCss["box-shadow-opacity"] != "undefined") {
                var opacIntValue = parseFloat(curCss["box-shadow-opacity"], 10);
                slideopacVal = opacIntValue;
                $(slideropac).slider("value", slideopacVal);
                $(slideropac).prop("value", slideopacVal);
            } else {
                slideopacVal = "";
                $(slideropac).slider("value", slideopacVal);
                $(slideropac).prop("value", slideopacVal);
            }
            var opacOffsetPx = $("<input/>", {
                type: "number",
                value: slideopacVal,
                class: "ws-boxshadow-set",
                id: "box-shadow-opacity",
            });
            var opacDiv = $("<div/>", { class: "ws-opacDiv" });
            var opacLabel = $("<div/>", { class: "ws-opacLabel" });
            var opacSlider = $("<div/>", { class: "ws-borSlider" });
            var opacInput = $("<div/>", { class: "ws-opacInput d-flex gap-3" });
            opacLabel.append("<p class='ws-setting-border-heading'><span>Shadow Color opacity</span></p>");
            opacInput.append(opacOffsetPx);
            slideropac.append(slideropacHandel);
            opacSlider.append(slideropac);
            opacDiv.append(opacLabel);
            opacLabel.append(opacInput);
            opacDiv.append(opacSlider);
            opacShadow.append(opacDiv);
            opacShadowList.append(opacShadow);
            var shadowColor = $("<div/>", {
                class: "ws-borderColor ws-section-setting no-flex ws-grid",
            });
            if (typeof curCss["box-shadow-color"] != "undefined") {
                var cor = curCss["box-shadow-color"];
            } else {
                var cor = "#000000";
            }
            var color = $("<input/>", {
                type: "text",
                value: cor,
                class: "ws-boxshadow-set",
                id: "box-shadow-color",
            });
            shadowColor.append("<p class='ws-setting-border-heading'><span>Shadow Color</span></p>" );
            shadowColor.append(color);
            var insetShadowList = $("<div/>", {
                class: "ws-inset-shadow-setting ws-section-setting no-flex ws-grid",
            });
            var insetBtn = $("<div/>", {
                class: "ws-insetBtn-setting",
            });
            var switchBtn = $("<div/>", {
                class: "switch",
            });
            switchBtn.append("<label>Outline<input type='checkbox' class='ws-toggleBtn'><span class='lever'></span>Inset</label>");
            insetBtn.append(switchBtn);
            insetShadowList.append(insetBtn);
            // Apply box-shadow on change
            $("body").on("change", ".ws-toggleBtn", function (e) {
                e.stopImmediatePropagation();
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if ($(this).is(":checked")) {
                    var boxShadowValue = "inset" + " " +
                    (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : "") +
                    (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : "") +
                    (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : "") +
                    (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : "") +
                    color.val();
                    metaCss1["box-shadow"] = boxShadowValue;
                } else {
                    var boxShadowValue =
                    (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : "") +
                    (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : "") +
                    (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : "") +
                    (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : "") +
                    color.val();
                    metaCss1["box-shadow"] = boxShadowValue;
                }
                selfobj.__current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
            });
            $("body").on("change", ".ws-boxshadow-set", function (e) {
                e.stopImmediatePropagation();
                let el = $(e.currentTarget);
                var tochange = el.attr("id");
                let slider = $("." + tochange);
                $(slider).slider("value", $(this).val());
                $(slider).prop("value", $(this).val());
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if (tochange == "box-shadow-opacity") {
                    var rgbaString = metaCss1["box-shadow-color"];
                    if (rgbaString) {
                        var rgbaArray = rgbaString.slice(5, -1).split(",");
                        rgbaArray[3] = $(this).val();
                        var updatedRgbaString = "rgba(" + rgbaArray[0] + "," + rgbaArray[1] + "," + rgbaArray[2] + "," + rgbaArray[3] + ")";
                        metaCss1["box-shadow-color"] = updatedRgbaString;
                        color.val(updatedRgbaString);
                    }
                }
                if (tochange == "box-shadow-color") {
                    var boxOpac = metaCss1["box-shadow-opacity"];
                    var rgbaString = el.val();
                    if (rgbaString) {
                        var rgbaArray = rgbaString.slice(5, -1).split(",");
                        rgbaArray[3] = boxOpac ? boxOpac : " 1";
                        var updatedRgbaString = "rgba(" + rgbaArray[0] + "," + rgbaArray[1] + "," + rgbaArray[2] + "," + rgbaArray[3] + ")";
                        metaCss1["box-shadow-color"] = updatedRgbaString;
                        color.val(updatedRgbaString);
                        metaCss1["box-shadow-color"] = updatedRgbaString;
                    }
                }
                if (el.val() == "") {
                    delete metaCss1[tochange];
                } else {
                    if (tochange == "box-shadow-color" || tochange == "box-shadow-opacity") {
                        metaCss1[tochange] = el.val();
                    } else {
                        metaCss1[tochange] = el.val() + "px";
                    }
                }
                var boxShadowValue = (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : "") +
                (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : "") +
                (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : "") +
                (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : "") +
                color.val();
                metaCss1["box-shadow"] = boxShadowValue;
                selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));
            });
            if (typeof curCss["box-shadow"] !== "undefined") {
                var switchs = switchBtn.find(".ws-toggleBtn");
                var boxShadow = curCss["box-shadow"];
                var isInset = boxShadow.includes("inset");
                switchs.prop("checked", isInset);
            }
            firstRowShadow.append(horizShadowList);
            firstRowShadow.append(vertShadowList);
            firstRowShadow.append(blurShadowList);
            secRowShadow.append(spreadShadowList);
            secRowShadow.append(opacShadowList);
            secRowShadow.append(shadowColor);
            thirdRowShadow.append(insetShadowList);
            boxShadowList.append("<p class='ws-setting-section-heading'><span>Box Shadow</span></p>");
            boxShadowList.append(firstRowShadow);
            boxShadowList.append(secRowShadow);
            boxShadowList.append(thirdRowShadow);
            boxShadowHolder.append(boxShadowList);
            selfobj.colorPicker(color);
            return boxShadowHolder;
        },

        backgroundSetting: function (isImage) {
            var selfobj = this;
            var backList = $("<div/>", {
                class: "ws-background-setting",
            });
            var curCss = selfobj.__current_col_edit.attr("data-meta-css");
            if (typeof curCss != "undefined") {
                try {
                    // Replace single quotes with double quotes
                    curCss = curCss.replace(/'/g, '"');
                    curCss = JSON.parse(curCss);
                } catch (e) {
                    console.error("Invalid JSON in data-meta-css attribute:", curCss);
                    curCss = {};
                }
            } else {
                curCss = {};
            }

            if (typeof curCss["color"] != "undefined") {
                var corr = curCss["color"];
            } else {
                var corr = "#000000";
            }
            if (typeof curCss["background-image"] != "undefined") {
                var bgimg = curCss["background-image"];
                var result = bgimg.replace(/^url\((.*?)\)$/, "$1");
                bgimg = result;
            } else {
                var bgimg = "";
            }
            var iscolor = $("<input/>", {
                id: "md_checkbox_27",
                type: "checkbox",
                class: "filled-in chk-col-light-blue ws-picker-bgcheck",
            });
            if (typeof curCss["background"] != "undefined") {
                var cor = curCss["background"];
            } else {
                var cor = "#000000";
            }
            var color = $("<input/>", {
                type: "text",
                value: cor,
                class: "ws-picker-bg backgroundColor",
            });
            if (isImage == true) {
                var img = $("<input/>", {
                    type: "text",
                    value: bgimg,
                    class: "ws-bg-image backgroundImage",
                });
                var uploadButton = $("<input>", {
                    class: "btn loadMediaBg",
                    type: "button",
                    value: "Media",
                    name: "Media",
                    "data-change": "ws-bg-image",
                    "data-toggle": "modal",
                    "data-target": "#largeModal",
                });
                var bgPosList = [
                    "select", "center", "inherit", "initial", "left", "revert", "revert-layer", "right", "unset",
                ];
                var selx = $("<select/>", {
                    class: "ws-bg-x",
                });
                for (let i = 0; i < bgPosList.length; i++) {
                    if (typeof curCss["background-position-x"] != "undefined" && bgPosList[i] == curCss["background-position-x"]) {
                        selx.append(new Option(bgPosList[i], bgPosList[i], true, true));
                    } else {
                        selx.append(new Option(bgPosList[i], bgPosList[i]));
                    }
                }
                var bgPosListY = [
                    "select", "center", "inherit", "initial", "top", "revert", "revert-layer", "bottom", "unset",
                ];
                var sely = $("<select/>", {
                    class: "ws-bg-y",
                });
                for (let i = 0; i < bgPosListY.length; i++) {
                    if (typeof curCss["background-position-y"] != "undefined" && bgPosListY[i] == curCss["background-position-y"]) {
                        sely.append(new Option(bgPosListY[i], bgPosListY[i], true, true));
                    } else {
                        sely.append(new Option(bgPosListY[i], bgPosListY[i]));
                    }
                }
                var bgsize = [
                    "select", "auto", "contain", "cover", "inherit", "initial", "revert", "unset",
                ];
                var selsize = $("<select/>", {
                    class: "ws-bg-size",
                });
                for (let i = 0; i < bgsize.length; i++) {
                    if (typeof curCss["background-size"] != "undefined" && bgsize[i] == curCss["background-size"]) {
                        selsize.append(new Option(bgsize[i], bgsize[i], true, true));
                    } else {
                        selsize.append(new Option(bgsize[i], bgsize[i]));
                    }
                }
                var bgAttach = [
                    "select", "fixed",  "local", "scroll", "inherit", "initial", "revert", "revert-layer", "unset",
                ];
                var selAttach = $("<select/>", {
                    class: "ws-bg-attach",
                });
                for (let i = 0; i < bgAttach.length; i++) {
                    if (typeof curCss["background-attachment"] != "undefined" && bgAttach[i] == curCss["background-attachment"]) {
                        selAttach.append(new Option(bgAttach[i], bgAttach[i], true, true));
                    } else {
                        selAttach.append(new Option(bgAttach[i], bgAttach[i]));
                    }
                }
                var selrepeat = $("<input/>", {
                    id: "md_checkbox_29",
                    type: "checkbox",
                    class: "filled-in chk-col-light-blue ws-bg-repeat",
                });
                if (typeof curCss["background-repeat"] != "undefined" && curCss["background-repeat"] != "" && curCss["background-repeat"] == "repeat") {
                    selrepeat.prop("checked", true);
                } else {
                    selrepeat.prop("checked", false);
                }
            }
            var txtcolor = $("<input/>", {
                type: "text",
                value: corr,
                class: "ws-picker-text textColor",
            });
            backList.append("<p class='ws-setting-section-heading'><span>None background</span></p>");
            var holderc = $("<div/>", {
                class: "ws-section-setting demo-checkbox",
            }).append(iscolor);
            holderc.append("<label for='md_checkbox_27'>None background</label>");
            backList.append(holderc);
            if (isImage == true) {
                backList.append("<br/><p class='ws-setting-section-heading'><span>Background image</span></p>");
                var holder = $("<div/>", { class: "ws-section-setting" }).append(img);
                backList.append(holder);
                var bgMedia = $("<div/>", { class: "ws-section-setting" }).append(uploadButton);
                backList.append(bgMedia);
                backList.append( "<br/><p class='ws-setting-section-heading'><span>Background poition x</span></p>");
                var holder2 = $("<div/>", { class: "ws-section-setting" }).append(selx);
                backList.append(holder2);
                backList.append("<br/><p class='ws-setting-section-heading'><span>Background poition y</span></p>");
                var holder3 = $("<div/>", { class: "ws-section-setting" }).append(sely);
                backList.append(holder3);
                backList.append("<br/><p class='ws-setting-section-heading'><span>Background size</span></p>");
                var holder4 = $("<div/>", { class: "ws-section-setting" }).append(selsize);
                backList.append(holder4);
                backList.append("<br/><p class='ws-setting-section-heading'><span>Background attachment</span></p>");
                var holder6 = $("<div/>", { class: "ws-section-setting" }).append(selAttach);
                backList.append(holder6);
                backList.append("<br/><p class='ws-setting-section-heading'><span>Is Background Repeat</span></p>");
                var holder5 = $("<div/>", {
                    class: "ws-section-setting demo-checkbox",
                }).append(selrepeat);
                holder5.append("<label for='md_checkbox_29'>Is Background Repeat</label>");
                backList.append(holder5);
            }
            var holder2 = $("<div/>", { class: "ws-section-setting" });
            holder2.append(color);
            backList.append(holder2);
            backList.append("<p class='ws-setting-section-heading'><span>Text Color</span></p>");
            var holder = $("<div/>", { class: "ws-section-setting" });
            holder.append(txtcolor);
            backList.append(holder);
            selfobj.colorPicker(color);
            selfobj.colorPicker(txtcolor);
            if (curCss["background"] == "none") {
                var bgcheck = holderc.find(".ws-picker-bgcheck");
                bgcheck.prop("checked", true);
            } else {
                var bgcheck = holderc.find(".ws-picker-bgcheck");
                bgcheck.prop("checked", false);
            }
            return backList;
        },

        colorPicker: function (obj) {
            var selfobj = this;
            obj.minicolors({
                format: "rgb",
                opacity: true,
                change: function (value, opacity) {
                    if (!value) return;
                    if (opacity) value += ", " + opacity;
                    if (typeof console === "object") {
                    }
                },
                theme: "bootstrap",
            });
        },

        getMobileSetting: function (isColumnSettings) {
            console.log("isColumnSettings",isColumnSettings);
            var selfobj = this;
            var mobile = selfobj.__current_col_edit.attr("data-mobile");
            if (typeof mobile != "undefined" && mobile != "") {
                var mobileView = mobile;
            } else {
                var mobileView = "";
            }
            var tablet = selfobj.__current_col_edit.attr("data-tablet");
            if (typeof tablet != "undefined" && tablet != "") {
                var tabletView = tablet;
            } else {
                var tabletView = "";
            }
            var desktop = selfobj.__current_col_edit.attr("data-desktop");
            if (typeof desktop != "undefined" && desktop != "") {
                var desktopView = desktop;
            } else {
                var desktopView = "";
            }
            var mobileFont = selfobj.__current_col_edit.attr("data-mobile-font");
            if (typeof mobileFont != "undefined" && mobileFont != "") {
                var mobileFont = mobileFont;
            } else {
                var mobileFont = "";
            }
            var tabletFont = selfobj.__current_col_edit.attr("data-tablet-font");
            if (typeof tabletFont != "undefined" && tabletFont != "") {
                var tabletFont = tabletFont;
            } else {
                var tabletFont = "";
            }
            var mobileVList = [
                "select", "none", "12/12", "11/12", "10/12", "9/12", "8/12", "7/12", "6/12", "5/12", "4/12", "3/12", "2/12", "1/12",
            ];
            var selm = $("<select/>", {
                class: "ws-mobile-res",
            });
            for (let i = 0; i < mobileVList.length; i++) {
                if (mobile != "undefined" && mobileVList[i] == mobileView) {
                    selm.append(new Option(mobileVList[i], mobileVList[i], true, true));
                } else {
                    selm.append(new Option(mobileVList[i], mobileVList[i]));
                }
            }
            var selt = $("<select/>", {
                class: "ws-tablet-res",
            });
            for (let i = 0; i < mobileVList.length; i++) {
                if (tabletView != "undefined" && mobileVList[i] == tabletView) {
                    selt.append(new Option(mobileVList[i], mobileVList[i], true, true));
                } else {
                    selt.append(new Option(mobileVList[i], mobileVList[i]));
                }
            }
            var seld = $("<select/>", {
                class: "ws-desktop-res",
            });
            for (let i = 0; i < mobileVList.length; i++) {
                if (desktopView != "undefined" && mobileVList[i] == desktopView) {
                    seld.append(new Option(mobileVList[i], mobileVList[i], true, true));
                } else {
                    seld.append(new Option(mobileVList[i], mobileVList[i]));
                }
            }
            var whMob = $("<div/>", {
                class: "ws-mobile-view",
            });
            var mobSize = $("<div/>", {
                class: "ws-mobile-size ws-section-setting no-flex ws-grid",
            });
            var mobFontSize = $("<div/>", {
                class: "ws-mobile-font-size ws-section-setting no-flex ws-grid",
            });
            var tab = $("<div/>", {
                class: "ws-tablet-view",
            });
            var tabSize = $("<div/>", {
                class: "ws-tablet-size ws-section-setting no-flex ws-grid",
            });
            var tabFontSize = $("<div/>", {
                class: "ws-tablet-font-size ws-section-setting no-flex ws-grid",
            });

            var whDesktop = $("<div/>", {
                class: "ws-desktop-view",
            });
            var desktopSize = $("<div/>", {
                class: "ws-desktop-size ws-section-setting no-flex ws-grid",
            });
           
            var holder = $("<div/>", {
                class: "",
            });
            mobSize.append("<p class=''><span>Mobile Size</span></p>");
            holder.append(selm);
            mobSize.append(holder);
            var mobFontPx = $("<input/>", {
                type: "number",
                value: mobileFont,
                class: "ws-mobFont-set",
            });
            var mobFontHolder = $("<div/>", {
                class: "d-flex d-flex-space",
            });
            mobFontSize.append("<p class=''><span>Font Size</span></p>");
            mobFontHolder.append(mobFontPx);
            mobFontHolder.append("<label class='' for='font-size'>px</label>");
            mobFontSize.append(mobFontHolder);
            var holder2 = $("<div/>", {
                class: "",
            });
            tabSize.append("<p class=''><span>Tablet Size</span></p>");
            holder2.append(selt);
            tabSize.append(holder2);

            var tabFontPx = $("<input/>", {
                type: "number",
                value: tabletFont,
                class: "ws-tabFont-set",
            });
            var tabFontHolder = $("<div/>", {
                class: "d-flex d-flex-space",
            });
            tabFontSize.append("<p class=''><span>Font Size</span></p>");
            tabFontHolder.append(tabFontPx);
            tabFontHolder.append("<label class='' for='font-size'>px</label>");
            tabFontSize.append(tabFontHolder);
            var DisMob = $("<div/>", {
                class: "ws-responsive-view",
            });

            var holder3 = $("<div/>", {
                class: "",
            });
            desktopSize.append("<p class=''><span>Desktop Size</span></p>");
            holder3.append(seld);
            desktopSize.append(holder3);

            whMob.append(mobSize);
            tab.append(tabSize);
            whDesktop.append(desktopSize);
            if(isColumnSettings){
                whMob.append(mobFontSize);
                tab.append(tabFontSize);
            }
            DisMob.append( "<p class='ws-setting-section-heading'><span>Mobile View</span></p>");
            DisMob.append(whMob);
            DisMob.append("<p class='ws-setting-section-heading'><span>Tablet View</span></p>");
            DisMob.append(tab);
            if(!isColumnSettings){
                DisMob.append("<p class='ws-setting-section-heading'><span>Desktop View</span></p>");
                DisMob.append(whDesktop);
            }
            return DisMob;
        },

        getLinkSetting: function () {
            var selfobj = this;
            let link_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_link",
                role: "tabpanel",
            });
            var curLink = selfobj.__current_col_edit.attr("data-block-link");
            if (typeof curLink != "undefined" && curLink != "") {
                var link = curLink;
            } else {
                var link = "";
            }
            var link = $("<input>", {
                class: "text-list ws-block-link",
                type: "text",
                value: link,
                name: "sectionLink",
            });
            link_hoder.append("<p class='ws-setting-section-heading'><span>Block Link</p>");
            link_hoder.append($("<div/>", { class: "ws-section-setting" }).append(link));
            return link_hoder;
        },

        eventFunctions: function () {
            var selfobj = this;

            $('body').off('click', '.row-action');
            $("body").on("click", ".row-action", function (e) {
                e.stopImmediatePropagation();
                var act = $(this).attr("data-action");
                switch (act) {
                    case "edit": {
                        if ($(this).attr("data-type") == "row") {
                            selfobj.editRowSetting(e);
                        } else {
                            selfobj.editSectionSetting(e);
                        }
                        break;
                    }
                    case "delete": {
                        selfobj.deleteRow(e);
                        break;
                    }
                    case "minimize": {
                        selfobj.minimizeRow(e);
                        break;
                    }
                    case "copy": {
                        selfobj.copyRow(e);
                        break;
                    }
                    default:
                        break;
                }
            });

            $('body').off('click', '.col-type-select');
            $("body").on("click", ".col-type-select", function (e) {
                e.stopImmediatePropagation();
                var rowData = $(this).closest(".rowData");
                var fieldDragElement = rowData.find(".drag-drop-item");
                var columntype = $(this).data("column");
                if (typeof columntype != "undefined") {
                    var rowSection = $(this).closest(".rowData");
                    var rowNo = rowSection.attr("data-count");
                    var innerwrapper = rowSection.find(".ws-element-wrapper");
                    selfobj.performColumnsArrgements(innerwrapper, columntype);
                    selfobj.setupHoverEvents(innerwrapper.find('.ws-data-element'));
                }
            });

            $('body').off('click', '.col-action');
            $("body").on("click", ".col-action", function (e) {
                e.stopImmediatePropagation();
                var act = $(this).attr("data-action");
                switch (act) {
                    case "add":{
                        selfobj.addColElm(e,"col");
                        break;
                    }
                    case "edit": {
                        selfobj.editColSetting(e);
                        break;
                    }
                    case "minimize": {
                        selfobj.minimizeCol(e);
                    }
                    default:
                        break;
                }
            });

            $('body').off('click', '.ws_close_overlay');
            $("body").on("click", ".ws_close_overlay", function (e) {
                selfobj.closeOverlay();
            });

            $('body').off('propertychange change keyup paste input', '.ws_animation_type');
            $("body").on("propertychange change keyup paste input",".ws_animation_type", function (e) {
                e.stopImmediatePropagation();
                if ($(this).val() == "none") {
                    selfobj.__current_col_edit.removeAttr("data-aos");
                } else {
                    selfobj.__current_col_edit.attr("data-aos", $(this).val());
                }
            });

            $('body').off('propertychange change keyup paste input', '.ws_animation_easing');
            $("body").on("propertychange change keyup paste input",".ws_animation_easing",function (e) {
                e.stopImmediatePropagation();
                if ($(this).val() == "none") {
                    selfobj.__current_col_edit.removeAttr("data-aos-easing");
                } else {
                    selfobj.__current_col_edit.attr("data-aos-easing", $(this).val());
                }
            });

            $('body').off('propertychange change keyup paste input', '.ws_animation_anchor');
            $("body").on("propertychange change keyup paste input", ".ws_animation_anchor", function (e) {
                e.stopImmediatePropagation();
                if ($(this).val() == "none") {
                    selfobj.__current_col_edit.removeAttr("data-aos-anchor-placement");
                } else {
                    selfobj.__current_col_edit.attr("data-aos-anchor-placement",$(this).val());
                }
            });

            $('body').off('propertychange change keyup paste input', '.animationSetting');
            $("body").on("propertychange change keyup paste input", ".animationSetting", function (e) {
                e.stopImmediatePropagation();
                let type = $(this).attr("data-type");
                if ($(this).val() == "") {
                    selfobj.__current_col_edit.removeAttr("" + type);
                } else {
                    selfobj.__current_col_edit.attr("" + type, $(this).val());
                }
            });

            $('body').off('keyup', '.ws-col-mar,.ws-col-pad,.ws-padding-set,.ws-margin-set,.ws-radius-set,.ws-borRadius-set,.ws-border-width-set,.ws-borderWidth-set,.ws-fontSize-set');
            $("body").on("keyup", ".ws-col-mar,.ws-col-pad,.ws-padding-set,.ws-margin-set,.ws-radius-set,.ws-borRadius-set,.ws-border-width-set,.ws-borderWidth-set,.ws-fontSize-set",function (e) {
                e.stopImmediatePropagation();
                let el = $(e.currentTarget);
                if ($(this).hasClass("ws-col-mar")) {
                    var tochange = selfobj.__margintype[el.attr("id")];
                    let slider = $(".sliderCls" + el.attr("id"));
                    $(slider).slider("value", $(this).val());
                    $(slider).prop("value", $(this).val());
                } else if ($(this).hasClass("ws-col-pad")) {
                    var tochange = selfobj.__paddingtype[el.attr("id")];
                    let slider = $(".sliderCls" + el.attr("id"));
                    $(slider).slider("value", $(this).val());
                    $(slider).prop("value", $(this).val());
                } else if ($(this).hasClass("ws-borRadius-set")) {
                    var tochange = selfobj.__borderRadius[el.attr("id")];
                    let slider = $(".sliderCls" + el.attr("id"));
                    $(slider).slider("value", $(this).val());
                    $(slider).prop("value", $(this).val());
                } else if ($(this).hasClass("ws-borderWidth-set")) {
                    var tochange = selfobj.__borderWidth[el.attr("id")];
                    let slider = $(".sliderCls" + el.attr("id"));
                    $(slider).slider("value", $(this).val());
                    $(slider).prop("value", $(this).val());
                } else if ($(this).hasClass("ws-fontSize-set")) {
                    var tochange = el.attr("id");
                    let slider = $(".sliderCls" + el.attr("id"));
                    $(slider).slider("value", $(this).val());
                    $(slider).prop("value", $(this).val());
                } else {
                    var tochange = el.attr("id");
                    let slider = $("." + tochange);
                    $(slider).slider("value", $(this).val());
                    $(slider).prop("value", $(this).val());
                }
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                // if(el.val() == "" || el.val() == 0){
                if (el.val() == "") {
                    delete metaCss1[tochange];
                } else {
                    metaCss1[tochange] = el.val() + "px";
                }
                selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));
            });

            $('body').off('change', '.ws-borderStyle-set,.ws-borderColor-set,.ws-border-color-set,.ws-border-style-set,.ws-fontColor-set,.ws-fontWeight-set');
            $("body").on("change", ".ws-borderStyle-set,.ws-borderColor-set,.ws-border-color-set,.ws-border-style-set,.ws-fontColor-set,.ws-fontWeight-set", function (e) {
                e.stopImmediatePropagation();
                let el = $(e.currentTarget);
                if ($(this).hasClass("ws-borderStyle-set")) {
                    var tochange = selfobj.__borderStyle[el.attr("id")];
                } else if ($(this).hasClass("ws-borderColor-set")) {
                    var tochange = selfobj.__borderColor[el.attr("id")];
                } else {
                    var tochange = el.attr("id");
                }
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if ($(this).val() == "") {
                    delete metaCss1[tochange];
                } else {
                    metaCss1[tochange] = $(this).val();
                }
                selfobj.__current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
            });

            $(document).ready(function () {
                function toggleButton(buttonId, targetId, groupClass) {
                    $('body').off('click', buttonId);
                    $("body").on("click", buttonId, function (e) {
                        e.stopImmediatePropagation();
                        const $this = $(this);
                        $this.toggleClass("active");
                        const isActive = $this.hasClass("active");
                        $this.text(isActive ? "ON" : "OFF");
                        $(targetId).toggleClass("active", isActive);
                        $(groupClass).toggleClass("d-none", isActive);
                    });
                }
                toggleButton("#margin-toggle_button", "#individualMargin", ".ws-marAll");
                toggleButton("#padding-toggle_button", "#individualPadding", ".ws-padAll");
                toggleButton("#width-toggle_button", "#individualBorder", ".ws-border-setting");
                toggleButton("#radius-toggle_button", "#individualRadius", ".ws-radAll");
            });

            $('body').off('change', '.ws-bg-repeat');
            $("body").on("change", ".ws-bg-repeat", function () {
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                metaCss1["background-repeat"] = $(this).val();
                if ($(this).is(":checked")) {
                    metaCss1["background-repeat"] = "repeat";
                } else {
                    metaCss1["background-repeat"] = "no-repeat";
                }
                selfobj.__current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
            });

            $('body').off('change', '.ws-set-visibility');
            $("body").on("change", ".ws-set-visibility", function () {
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                metaCss1["display"] = $(this).val();
                if ($(this).is(":checked")) {
                    metaCss1["display"] = "block";
                } else {
                    metaCss1["display"] = "none";
                }
                selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));
            });

            $('body').off('change', '.ws-set-onHover');
            $("body").on("change", ".ws-set-onHover", function () {
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                metaCss1["display"] = $(this).val();
                if ($(this).is(":checked")) {
                    metaCss1["display"] = "none";
                } else {
                    metaCss1["display"] = "block";
                }
                selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));
            });

            $('body').off('propertychange change keyup paste input', '.addCss');
            $("body").on("propertychange change keyup paste input", ".addCss", function () {
                var $currentColEdit = $(selfobj.__current_col_edit);
                if ($currentColEdit.length > 0) {
                    $currentColEdit.attr("data-add-css", $(this).val());
                }
            });
            
            $('body').off('propertychange change keyup paste input', '.ws-scroll-type');
            $("body").on("propertychange change keyup paste input", ".ws-scroll-type", function (e) {
                e.stopImmediatePropagation();
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if ($(this).val() == "none") {
                    delete metaCss1["overflow"];
                } else {
                    metaCss1["overflow"] = $(this).val();
                }
                selfobj.__current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
            });

            $('body').off('propertychange change keyup paste input', '.ws-bg-x');
            $("body").on("propertychange change keyup paste input", ".ws-bg-x", function (e) {
                e.stopImmediatePropagation();
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if ($(this).val() == "none") {
                    delete metaCss1["background-position-x"];
                } else {
                    metaCss1["background-position-x"] = $(this).val();
                }
                selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));
            });

            $('body').off('propertychange change keyup paste input', '.ws-bg-y');
            $("body").on("propertychange change keyup paste input", ".ws-bg-y", function (e) {
                e.stopImmediatePropagation();
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if ($(this).val() == "none") {
                    delete metaCss1["background-position-y"];
                } else {
                    metaCss1["background-position-y"] = $(this).val();
                }
                selfobj.__current_col_edit.attr( "data-meta-css", JSON.stringify(metaCss1));
            });

            $('body').off('propertychange change keyup paste input', '.ws-bg-size');
            $("body").on("propertychange change keyup paste input", ".ws-bg-size", function (e) {
                e.stopImmediatePropagation();
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if ($(this).val() == "") {
                    delete metaCss1["background-size"];
                } else {
                    metaCss1["background-size"] = $(this).val();
                }
                selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));
            });

            $('body').off('propertychange change keyup paste input', '.ws-bg-attach');
            $("body").on("propertychange change keyup paste input", ".ws-bg-attach", function (e) {
                e.stopImmediatePropagation();
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if ($(this).val() == "") {
                    delete metaCss1["background-attachment"];
                } else {
                    metaCss1["background-attachment"] = $(this).val();
                }
                selfobj.__current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
            });

            $('body').off('propertychange change keyup paste input', '.ws-align-text');
            $("body").on("propertychange change keyup paste input", ".ws-align-text", function (e) {
                e.stopImmediatePropagation();
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if ($(this).val() == "none") {
                    delete metaCss1["text-align"];
                } else {
                    metaCss1["text-align"] = $(this).val();
                }
                selfobj.__current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
            });

            $('body').off('propertychange change keyup paste input', '.ws-mobile-res');
            $("body").on("propertychange change keyup paste input", ".ws-mobile-res", function (e) {
                e.stopImmediatePropagation();
                selfobj.__current_col_edit.attr("data-mobile", $(this).val());
            });

            $('body').off('propertychange change keyup paste input', '.ws-tablet-res');
            $("body").on("propertychange change keyup paste input", ".ws-tablet-res", function (e) {
                e.stopImmediatePropagation();
                selfobj.__current_col_edit.attr("data-tablet", $(this).val());
            });

            $('body').off('propertychange change keyup paste input', '.ws-desktop-res');
            $("body").on("propertychange change keyup paste input", ".ws-desktop-res", function (e) {
                e.stopImmediatePropagation();
                selfobj.__current_col_edit.attr("data-desktop", $(this).val());
            });

            $('body').off('propertychange change keyup paste input', '.ws-mobFont-set');
            $("body").on("propertychange change keyup paste input", ".ws-mobFont-set", function (e) {
                e.stopImmediatePropagation();
                selfobj.__current_col_edit.attr("data-mobile-font", $(this).val());
            });

            $('body').off('propertychange change keyup paste input', '.ws-tabFont-set');
            $("body").on("propertychange change keyup paste input", ".ws-tabFont-set", function (e) {
                e.stopImmediatePropagation();
                selfobj.__current_col_edit.attr("data-tablet-font", $(this).val());
            });

            $('body').off('change', '.ws-picker-bg');
            $("body").on("change", ".ws-picker-bg", function () {
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if ($(".ws-picker-bgcheck").is(":checked")) {
                    metaCss1["background"] = "none";
                } else {
                    metaCss1["background"] = $(this).val();
                }
                selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));
            });

            $('body').off('change', '.ws-picker-bgcheck');
            $("body").on("change", ".ws-picker-bgcheck", function () {
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if ($(this).is(":checked")) {
                    metaCss1["background"] = "none";
                } else {
                    metaCss1["background"] = "#000000";
                }
                selfobj.__current_col_edit.attr( "data-meta-css",JSON.stringify(metaCss1));
            });

            $('body').off('change', '.ws-picker-text');
            $("body").on("change", ".ws-picker-text", function () {
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                metaCss1["color"] = $(this).val();
                selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));
            });

            $('body').off('propertychange change keyup paste input', '.ws-bg-image');
            $("body").on("propertychange change keyup paste input", ".ws-bg-image", function () {
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if ($(this).val().indexOf("url")) {
                    metaCss1["background-image"] = "url('" + $(this).val() + "')";
                } else {
                    metaCss1["background-image"] = "";
                }
                selfobj.__current_col_edit.attr("data-meta-css",JSON.stringify(metaCss1));
            });

            $('body').off('propertychange change keyup paste input', '.row-type');
            $("body").on("propertychange change keyup paste input",".row-type",function (e) {
                e.stopImmediatePropagation();
                selfobj.__current_col_edit.closest(".rowData").attr("data-row-type", $(this).val());
            });

            $('body').off('propertychange change keyup paste input', '.row-type-check');
            $("body").on("propertychange change keyup paste input", ".row-type-check", function (e) {
                e.stopImmediatePropagation();
                if (this.checked) {
                    selfobj.__current_col_edit.closest(".rowData").attr("data-row-type", "container-with-row");
                } else {
                    selfobj.__current_col_edit.closest(".rowData").attr("data-row-type", $(".row-type").val());
                }
            });

            $('body').off('propertychange change keyup paste input', '#ws-element-width');
            $("body").on("propertychange change keyup paste input", "#ws-element-width", function () {
                // selfobj.__current_col_edit.attr("data-width", $(this).val());
                var $currentColEdit = $(selfobj.__current_col_edit);
                if ($currentColEdit.length > 0) {
                    $currentColEdit.attr("data-height", $(this).val());
                }
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if ($(this).val() === "") {
                    selfobj.__current_col_edit.removeAttr("data-width");
                    delete metaCss1["width"];
                } else {
                    selfobj.__current_col_edit.attr("data-width", $(this).val());
                    metaCss1["width"] = $(this).val();
                }
                selfobj.__current_col_edit.attr( "data-meta-css", JSON.stringify(metaCss1));
            });

            $('body').off('propertychange change keyup paste input', '#ws-element-height');
            $("body").on("propertychange change keyup paste input", "#ws-element-height", function () {
                // selfobj.__current_col_edit.attr("data-height", $(this).val());
                var $currentColEdit = $(selfobj.__current_col_edit);
                if ($currentColEdit.length > 0) {
                    $currentColEdit.attr("data-height", $(this).val());
                }
                var metaCss = selfobj.__current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof metaCss != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if ($(this).val() === "") {
                    selfobj.__current_col_edit.removeAttr("data-height");
                    delete metaCss1["height"];
                } else {
                    selfobj.__current_col_edit.attr("data-height", $(this).val());
                    metaCss1["height"] = $(this).val();
                }
                selfobj.__current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));
            });

            $('body').off('propertychange change keyup paste input', '.ws-block-link');
            $("body").on("propertychange change keyup paste input", ".ws-block-link", function () {
                selfobj.__current_col_edit.attr("data-block-link", $(this).val());
                selfobj.__current_col_edit.find(".icon").show();
                selfobj.__current_col_edit.find("a").hide();
            });

            $('body').off('click', '.loadMediaBg');
            $("body").on("click",".loadMediaBg",function(e){
                $('#largeModal').modal('toggle');
                selfobj.elm = $(e.currentTarget).attr("data-change");
                new readFilesView({loadFrom:"addpage",loadController:selfobj});
            });

            $('body').off('click', '.ws-element-list');
            $("body").on("click",".ws-element-list",function(e){
                var doDrag = $(e.currentTarget).attr("data-act");
                if(typeof(doDrag) == "undefined"){
                    if($(e.currentTarget).attr("data-type") !="row"){
                        let ht = selfobj.setItemPreview($(e.currentTarget).attr("data-type"));
                        $(selfobj.activeElement).append(ht);
                        selfobj.setupHoverEvents($(selfobj.activeElement).find('.ws-data-element'));
                        selfobj.setupDropable();
                        selfobj.closeOverlay();
                    }
                }
            });

            // $('body').off('propertychange change keyup paste input', '.ws-button-link');
            // $("body").on("propertychange change keyup paste input",".ws-button-link",function(){
            //     selfobj.__current_col_edit.attr("data-link",$(this).val());
            //     selfobj.__current_col_edit.find(".icon").show();
            //     selfobj.__current_col_edit.find("button").hide();
            // });

            $('body').off('propertychange change keyup paste input', '.ws-button-title');
            $("body").on("propertychange change keyup paste input",".ws-button-title",function(){
                selfobj.__current_col_edit.attr("data-alt",$(this).val());
            });

            $('body').off('click', '.columnsAdded');
            $("body").on("click",".columnsAdded",function(e){
                e.stopImmediatePropagation();
                var doDrag = $(e.currentTarget).attr("data-act");
                if(typeof(doDrag) == "undefined"){
                    if($(e.currentTarget).attr("data-type") != "row"){
                        selfobj.closeOverlay();
                    }
                }
                var columntype = $(this).data("column");
                if(typeof(columntype) != "undefined"){
                    var rowName = "ws-row-data-"+new Date().valueOf();
                    let rnl = $("<div>",{
                        id:rowName,
                        class:"ws-element-wrapper ws-dropable-items extraColumns"
                    })
                    selfobj.performColumnsArrgements(rnl,columntype);
                    $(selfobj.activeElement).append(rnl);
                    selfobj.setupDropable();
                }
            });
        },

        setIconValues: function (e) {
            selfobj = this;
            var objectDetails = [];
            if($(e.currentTarget).closest(".iconSelection").hasClass("active")){
              $(e.currentTarget).closest(".iconSelection").removeClass("active"); 
            //   objectDetails["icon_name"] = '';
            //   selfobj.model.set(objectDetails);
                var $currentColEdit = $(selfobj.__current_col_edit);
                if ($currentColEdit.length > 0) {
                    $currentColEdit.attr("data-icon", '');
                }
            }else{
              $(".iconSelection").removeClass("active");
              $(e.currentTarget).closest(".iconSelection").addClass("active");
            //   objectDetails["icon_name"] = $(e.currentTarget).attr("data-value");
            //   selfobj.model.set(objectDetails);
                var $currentColEdit = $(selfobj.__current_col_edit);
                if ($currentColEdit.length > 0) {
                    $currentColEdit.attr("data-icon", $(e.currentTarget).attr("data-value"));
                }
            }
        },
      
        searchIcon: function (e) {
        var searchValue = $(e.currentTarget).val().toLowerCase();
        $('.iconsectioName').each(function () {
            var iconSection = $(this);
            var hasVisibleIcons = false;
            iconSection.next('.setIconList').find('.iconName').each(function () {
                var iconNameElement = $(this);
                var iconName = iconNameElement.text().toLowerCase();
                if (iconName.includes(searchValue)) {
                    hasVisibleIcons = true;
                    return false;
                }
            });
            var clearfix = iconSection.next('.setIconList').next('.iconClearfix');
            if (hasVisibleIcons) {
                iconSection.show();
                clearfix.show();
                $('.defaultMessage').hide();
            } else {
                $('.defaultMessage').show();
                iconSection.hide();
                clearfix.hide();
            }
        });
        $('.iconName').each(function () {
            var iconNameElement = $(this);
            var iconName = iconNameElement.text().toLowerCase();
            var iconContainer = iconNameElement.closest('.iconList');
            if (iconName.includes(searchValue)) {
                iconContainer.show();
                $('.defaultMessage').hide();
            } else {
                iconContainer.hide();
            }
        });
        },

        render: function () {
            var selfobj = this;
            this.undelegateEvents();
            var source = templateSingleTemp;
            var template = _.template(source);
            $("#" + this.toClose).remove();
            temp_code = this.model.attributes.temp_code ? this.model.attributes.temp_code.replace(/data-meta-css="({.*?})"/, function(match, p1) {
                return 'data-meta-css="' + p1.replace(/"/g, "'") + '"';
            }) : '';
            this.$el.html(template({model: this.model.attributes, menuList: selfobj.menuList, columnlist: selfobj.columnlist,temp_code : temp_code}));
            this.$el.addClass("tab-pane in active panel_overflow");
            this.$el.attr("id", this.toClose);
            this.$el.addClass(this.toClose);
            this.$el.data("role", "tabpanel");
            this.$el.data("current", "yes");
            $(".tab-content").append(this.$el);
            $("#" + this.toClose).show();
            this.initializeValidate();
            selfobj.setupDragable();
            selfobj.setupDropable();
            this.setOldValues();
            rearrageOverlays(selfobj.form_label, this.toClose);
            selfobj.eventFunctions();
            selfobj.setuppPlaygroundElements();
            var rowSection = $('body').find(".rowData");
            var innerwrapper = rowSection.find(".ws-element-wrapper");
            selfobj.setupHoverEvents(innerwrapper.find('.ws-data-element'));
            this.delegateEvents();
            return this;
        },

        onDelete: function () {
            this.remove();
        },
    });
    return templateSingleView;
});