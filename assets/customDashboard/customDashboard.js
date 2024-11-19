
(function ($, window, document, undefined) {

    $.fn.dashboardDesign = function (options) {
        var __rows = 0;
        var __current_col_edit = "";
        var __elementsfn = [];
        var __columnsSize = { "col-1": { "type": "col-1", "size": "12" }, "col-2": { "type": "col-2", "size": "6,6" }, "col-3": { "type": "col-3", "size": "8,4" }, "col-4": { "type": "col-4", "size": "4,4,4" }, "col-5": { "type": "col-6", "size": "3,9" } };
        var __margintype = { "ws_m_0": "margin-top", "ws_m_1": "margin-right", "ws_m_2": "margin-bottom", "ws_m_3": "margin-left" };
        var __paddingtype = { "ws_p_0": "padding-top", "ws_p_1": "padding-right", "ws_p_2": "padding-bottom", "ws_p_3": "padding-left" };
        var __borderWidth = { "ws_bw_0": "border-top-width", "ws_bw_1": "border-right-width", "ws_bw_2": "border-bottom-width", "ws_bw_3": "border-left-width" };
        var __borderStyle = { "ws_bs_0": "border-top-style", "ws_bs_1": "border-right-style", "ws_bs_2": "border-bottom-style", "ws_bs_3": "border-left-style" };
        var __borderColor = { "ws_bc_0": "border-top-color", "ws_bc_1": "border-right-color", "ws_bc_2": "border-bottom-color", "ws_bc_3": "border-left-color" };
        var __borderRadius = { "ws_br_0": "border-top-left-radius", "ws_br_1": "border-top-right-radius", "ws_br_2": "border-bottom-left-radius", "ws_br_3": "border-bottom-right-radius" };
        var __coltypeMob = { "12/12": "col-xs-12", "11/12": "col-xs-11", "10/12": "col-xs-10", "9/12": "col-xs-9", "8/12": "col-xs-8", "7/12": "col-xs-7", "6/12": "col-xs-6", "5/12": "col-xs-5", "4/12": "col-xs-4", "3/12": "col-xs-3", "2/12": "col-xs-2", "1/12": "col-xs-1" };
        var __coltypTab = { "12/12": "col-sm-12", "11/12": "col-sm-11", "10/12": "col-sm-10", "9/12": "col-sm-9", "8/12": "col-sm-8", "7/12": "col-sm-7", "6/12": "col-sm-6", "5/12": "col-sm-5", "4/12": "col-sm-4", "3/12": "col-sm-3", "2/12": "col-sm-2", "1/12": "col-sm-1" };
        var __toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'font': [] }],
            // [{ 'font': ['arial', 'times new roman', 'verdana'] }],
            [{ 'align': [] }],
            ['link'],
            ['clean']                                         // remove formatting button
        ];

        // SET DEFAULT SETTING
        $.fn.dashboardDesign.defaults = {
            color: "red",
            background: "yellow",
            playground: null,
            nextbtn: null,
            savebtn: null,
            temptemplate: null,
            version: "inline",
            playgroundElements: null,
            mediaModel: null,
            designMode: 'inline',
            categories: [],
            imgSliders: [],
            menuList: [],
            templateList: [],
            elements: {
                // INVOICE
                income: true,
                expenses: true,
                income_and_expenses: true,
                overduePayment: true,
                revenue_by_customer_top_30: true,
                revenue_by_projects_top_30: true,
                revenue_by_product: true,
                top_10_customers: true,
                profit_and_loss: true,
                account_balance: true,
                outstanding: true,
                vendors_payments: true,
                // TASKS
                task_list: true,
                task_completion_ratio: true,
                project_wise_task_statistics: true,
                customer_wise_task_statistics: true,
                assignee_wise_task_statistics: true,
                priority_wise_task_statistics: true,
                task_completion_ratio_assignee_wise: true,
                // PROJECTS
                projects_statistics: true,
                project_status_wise_list: true,
                client_wise_projects_list: true,
                // LEADS
                stages_wise_list: true,
                unattended_leads: true,
                lead_conversion_ratio: true,
                priority_wise_list: true,
                pending_followups: true,
                lead_generation_flow_list: true,
                source_wise_list: true,
                upcoming_followups: true,
                // TICKETS
                status_wise_list: true,
                assignee_wise_list: true,
                priority_wise_list: true,
                customer_wise_list: true,
            },
            layout: {
                row: true,
            },
            setupPlayground: function () { },
            HTMLUpdate: function () { },
        };

        // INITILIZE SETTINGS AT DEFAULTS
        var settings = $.extend({}, $.fn.dashboardDesign.defaults, options);
        var playground = settings.playground;
        var savebtn = settings.savebtn;
        var categories = settings.categories;
        var imgSlidersList = settings.imgSliders;
        var menuList = settings.menuList;
        var temptemplate = settings.temptemplate;
        var playgroundElements = settings.playgroundElements;
        var mediaModel = settings.mediaModel;
        var designMode = settings.designMode;
        var activeElement = null;
        var evt = "";
        var inel_add = $("<div>", { class: "col-action default mt-4 mb-3", "data-action": "add", title: "Add Element" }).append("<span class='material-icons'>add</span><br/>Element");
        setupDropable();

        // INITIAL RENDER WHEN VIEW IS LOADED
        function setupPlayground() {
            if (playground == null) {
                console.log("playground element not found");
                return false;
            } else {
                if (settings.version == "inline") {
                    playground.addClass("designMode");
                } else {
                    playground.removeClass("designMode");
                }
                // IF playground IS EMPTY THEN MESSAGE
                if (playground.is(':empty')) {
                    playground.append("");
                }
                playground.after("<div class='addRow ws_dash_last_row' data-toggle='tooltip'  data-placement='top' title='Add Section'><i class='material-icons'>add</i><br></div>");
                // ADDING INPECT AND PASTE MENU
                playground.after("<ul class='custom-menu'>" +
                    "<li data-action='Paste'>Paste</li>" +
                    "<li data-action='Inspect'>Inspect</li>" + // Add Inspect option with onclick
                    "</ul>");
                playground.addClass("ws-dashboard-playground"); $(document).tooltip();
            }
        }
        // SETUP PLAYGROUND-ELEMENTS
        function setuppPlaygroundElements() {
            if (playgroundElements == null) {
                console.log("playground elements element not found");
                return false;
            } else {
                playgroundElements.empty();
                playgroundElements.addClass("ws-dashboard-playground-elements");
            }
            playgroundElements.append("<div class='ws-dashboard-element ws-right-actions'></div>");
            // ADDING TAB LINKS TO TAB
            $(".ws-dashboard-element").append('<div class="ws-section-header" data-show="element-list"><ul id="subNavs" class="nav nav-tabs justify-content-center"><li class="nav-item navModuleLoad" data-action="Finance" data-item="Finance"><a class="nav-link active" data-toggle="tab" href="#Finance">Finance</a></li><li class="nav-item navModuleLoad" data-action="Tasks" data-item="Tasks"><a class="nav-link" data-toggle="tab" href="#Tasks">Tasks</a></li><li class="nav-item navModuleLoad" data-action="Projects" data-item="Projects"><a class="nav-link" data-toggle="tab" href="#Projects">Projects</a></li><li class="nav-item navModuleLoad" data-action="Leads" data-item="Leads"><a class="nav-link " data-toggle="tab" href="#Leads">Leads</a></li><li class="nav-item navModuleLoad" data-action="Tickets" data-item="Tickets"><a class="nav-link" data-toggle="tab" href="#Tickets">Tickets</a></li><li class="nav-item navModuleLoad" data-action="CustomModules" data-item="CustomModules"><a class="nav-link" data-toggle="tab" href="#CustomModules">Custom Modules</a></li></ul><span class="ws_close_overlay"><i class="material-icons">close</i></span></div><div class="dash-element-list ws-list-view"></div></div>');
            // ADDING TABS TO TAB-CONTENT
            var tabs = '<div class="tab-content container-fluid" >' +
                '<div class="tab-pane fade show active" id="Finance" role="tabpanel" aria-labelledby="home-tab"></div>' +
                '<div class="tab-pane fade show" id="Tasks" role="tabpanel" aria-labelledby="home-tab"></div>' +
                '<div class="tab-pane fade show" id="Projects" role="tabpanel" aria-labelledby="home-tab"></div>' +
                '<div class="tab-pane fade show" id="Leads" role="tabpanel" aria-labelledby="home-tab"></div>' +
                '<div class="tab-pane fade show" id="Tickets" role="tabpanel" aria-labelledby="home-tab"></div>' +
                '<div class="tab-pane fade show" id="CustomModules" role="tabpanel" aria-labelledby="home-tab"><center class="text-center w-100 mt-5"> Coming soon.. </center></div>' +
                '</div>';
            $('.dash-element-list').append(tabs);

            // APPENDING ELEMENTS THAT ARE SET TO VISIBLE
            $.each(settings.elements, function (index, val) {
                if (val) {
                    __elementsfn[index]();
                }
            });
            $("body").on("mouseover", ".ws-data-element", function () {
                let elhe = $(this).height();
                let scroll = $(document).scrollTop();
                let scrollEl = $(this).offset().top;
                // let elw = $(this).width();
                // $(this).find(".elm-action").css("left",((elw/2)-30)); 
                if (scrollEl > scroll) {
                    $(this).find(".elm-action").css("top", 10);
                } else if (scrollEl < scroll) {
                    let m = (scroll - scrollEl + 50);
                    if (m > elhe) {
                        $(this).find(".elm-action").css("top", 10);
                    } else {
                        $(this).find(".elm-action").css("top", m);
                    }
                }
            });
        }
        function editSecSetting(e) {

            let tm = $("<div/>", {
                class: "ws-section-body",
            });

            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });

            var colEl = $(e.currentTarget).closest(".rowData").find(".ws-element-wrapper").first();
            __current_col_edit = colEl;

            if ($('.ws-remove-section').length > 0) {
                $('.ws-remove-section').remove();
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
                class: "column-list ws-list-view"
            });//.append(getMarginpadding());

            var selcf = "";
            var selc = "";
            //__current_col_edit.closest(".rowData").attr("data-row-type","container-with-row");
            var curtype = __current_col_edit.closest(".rowData").attr("data-row-type");
            if (typeof (curtype) != "undefined" && curtype != "") {
                if (curtype == "container-fluid") {
                    selcf = "selected";
                }
                if (curtype == "container") {
                    selc = "selected";
                }
            }

            var curCss = __current_col_edit.attr("data-meta-css");
            if (typeof (curCss) != "undefined") {
                curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
            } else {
                curCss = {};
            }
            var isVisible = $("<input/>", {
                id: "md_checkbox_28",
                type: "checkbox",
                class: "filled-in chk-col-light-blue ws-set-visibility",
            });

            if (typeof (curCss["display"]) != "undefined" && curCss["display"] != "" && curCss["display"] == "block") {
                isVisible.prop("checked", true);
            } else if (curCss["display"] == "none") {
                isVisible.prop("checked", false);
            } else {
                isVisible.prop("checked", true);
            }

            general_hoder.append("<p class='ws-setting-section-heading'><span>Set Visibility</span></p>");
            var holderc = $("<div/>", { class: "ws-section-setting demo-checkbox" }).append(isVisible);
            holderc.append("<label for='md_checkbox_28'>Visibility</label>");
            general_hoder.append(holderc);

            var rowType = "<div class='ws-section-setting'><select class='row-type'><option " + selcf + " value='container-fluid'>Full Screen</option><option " + selc + " value='container'>center Screen</option></select></div>";
            general_hoder.append("<p class='ws-setting-section-heading'><span>Row size</span></p>");
            general_hoder.append(rowType);
            if (curtype == "container-with-row") {
                general_hoder.append("<p class='ws-setting-section-heading'><span>Full container with center content</span>&nbsp;&nbsp;<input type='checkbox' checked=checked class='row-type-check'/></p>");
            } else {
                general_hoder.append("<p class='ws-setting-section-heading'><span>Full container with center content</span>&nbsp;&nbsp;<input type='checkbox' class='row-type-check'/></p>");
            }


            //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
            border_hoder.append(borderSetting());
            border_hoder.append(boxShadowSetting());
            border_hoder.append(getAlignment());
            border_hoder.append(backgroundSetting(true));
            //ee.append(backgroundSetting(true));

            general_hoder.append("<p class='ws-setting-section-heading'><span>Width and Height</span></p>");
            general_hoder.append(whScroll(true));
            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": 'column-list'
            });

            am.append("<h2>Section Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            let navLink = '<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';

            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            //tc.append(editer_hoder);
            tc.append(general_hoder);
            tc.append(getMarginpadding());
            tc.append(border_hoder);
            tc.append(getAnimationSetting());
            // tc.append(getLinkSetting());
            tm.append(tc);

            am.append(ee);
            rr.append(am);
            rr.append(tm);
            //$(".ws-list-view").hide();

            playgroundElements.append(rr);
            //general_hoder.show();
            showElements();
            $(".ws-column-container").addClass("ws_active");
        }
        function editRowSetting(e) {

            let tm = $("<div/>", {
                class: "ws-section-body",
            });

            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });


            var colEl = $(e.currentTarget).closest(".rowData").find(".ws-element-wrapper").first();
            __current_col_edit = colEl;

            if ($('.ws-remove-section').length > 0) {
                $('.ws-remove-section').remove();
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
                class: "column-list ws-list-view"
            });//.append(getMarginpadding());

            var selcf = "";
            var selc = "";
            //__current_col_edit.closest(".rowData").attr("data-row-type","container-with-row");
            var curtype = __current_col_edit.closest(".rowData").attr("data-row-type");
            if (typeof (curtype) != "undefined" && curtype != "") {
                if (curtype == "container-fluid") {
                    selcf = "selected";
                }
                if (curtype == "container") {
                    selc = "selected";
                }
            }

            var curCss = __current_col_edit.attr("data-meta-css");
            if (typeof (curCss) != "undefined") {
                curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
            } else {
                curCss = {};
            }
            var isVisible = $("<input/>", {
                id: "md_checkbox_28",
                type: "checkbox",
                class: "filled-in chk-col-light-blue ws-set-visibility",
            });

            if (typeof (curCss["display"]) != "undefined" && curCss["display"] != "" && curCss["display"] == "block") {
                isVisible.prop("checked", true);
            } else if (curCss["display"] == "none") {
                isVisible.prop("checked", false);
            } else {
                isVisible.prop("checked", true);
            }

            general_hoder.append("<p class='ws-setting-section-heading'><span>Set Visibility</span></p>");
            var holderc = $("<div/>", { class: "ws-section-setting demo-checkbox" }).append(isVisible);
            holderc.append("<label for='md_checkbox_28'>Visibility</label>");
            general_hoder.append(holderc);

            var rowType = "<div class='ws-section-setting'><select class='row-type'><option " + selcf + " value='container-fluid'>Full Screen</option><option " + selc + " value='container'>center Screen</option></select></div>";
            general_hoder.append("<p class='ws-setting-section-heading'><span>Row size</span></p>");
            general_hoder.append(rowType);
            if (curtype == "container-with-row") {
                general_hoder.append("<p class='ws-setting-section-heading'><span>Full container with center content</span>&nbsp;&nbsp;<input type='checkbox' checked=checked class='row-type-check'/></p>");
            } else {
                general_hoder.append("<p class='ws-setting-section-heading'><span>Full container with center content</span>&nbsp;&nbsp;<input type='checkbox' class='row-type-check'/></p>");
            }


            //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
            border_hoder.append(borderSetting());
            border_hoder.append(boxShadowSetting());
            border_hoder.append(getAlignment());
            border_hoder.append(backgroundSetting(true));

            //ee.append(backgroundSetting(true));

            general_hoder.append("<p class='ws-setting-section-heading'><span>Width and Height</span></p>");
            general_hoder.append(whScroll(true));
            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": 'column-list'
            });
            am.append("<h2>Row Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            let navLink = '<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_link">Link</a></li></ul>';

            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            //tc.append(editer_hoder);
            tc.append(general_hoder);
            tc.append(getMarginpadding());
            tc.append(border_hoder);
            tc.append(getAnimationSetting());
            tc.append(getLinkSetting());
            tm.append(tc);

            am.append(ee);
            rr.append(am);
            rr.append(tm);
            //$(".ws-list-view").hide();

            playgroundElements.append(rr);
            //general_hoder.show();
            showElements();
            $(".ws-column-container").addClass("ws_active");
        }
        function editColSetting(e) {

            let tm = $("<div/>", {
                class: "ws-section-body",
            });

            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });

            var colEl = $(e.currentTarget).closest(".ws-row-col").first();
            __current_col_edit = colEl;

            if ($('.ws-remove-section').length > 0) {
                $('.ws-remove-section').remove();
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
                class: "column-list ws-list-view"
            });//.append(getMarginpadding());

            //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
            border_hoder.append(borderSetting());
            border_hoder.append(boxShadowSetting());
            border_hoder.append(getAlignment());
            border_hoder.append(backgroundSetting(true));
            general_hoder.append(getMobileSetting());

            //ee.append(backgroundSetting(true));

            general_hoder.append("<p class='ws-setting-section-heading'><span>Width and Height</span></p>");
            general_hoder.append(whScroll(true));
            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": 'column-list'
            });

            am.append("<h2>Column Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");

            let navLink = '<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_link">Link</a></li></ul>';

            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            //tc.append(editer_hoder);
            tc.append(general_hoder);
            tc.append(getMarginpadding());
            tc.append(border_hoder);
            tc.append(getAnimationSetting());
            tc.append(getLinkSetting());
            tm.append(tc);

            am.append(ee);
            rr.append(am);
            rr.append(tm);
            //$(".ws-list-view").hide();

            playgroundElements.append(rr);
            //general_hoder.show();
            showElements();
            $(".ws-column-container").addClass("ws_active");
        }
        function addColElm(e, type) {
            activeElement = $(e.currentTarget).closest(".ws-row-col");
            var parentCls = $(e.currentTarget).parent();
            var parentId = $(parentCls).parent();
            var parentId2 = $(parentId).parent();
            if ($(e.currentTarget).hasClass("default")) {
                if ($(parentId).hasClass("extraColumns")) {
                    $(".columnsAdded").hide();
                } else {
                    $(".columnsAdded").show();
                }
            } else {
                if ($(parentId2).hasClass("extraColumns")) {
                    $(".columnsAdded").hide();
                } else {
                    $(".columnsAdded").show();
                }
            }
            showElements();
            if (type == "col") {

            } else {

            }
        }

        function editTextSetting(colEl) {

            __current_col_edit = colEl;

            var curCss = __current_col_edit.attr("data-meta-css");
            /*if(typeof(curCss) != "undefined" ){
                curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
            }else{
                curCss = {}
            }*/
            var htmlTxt = __current_col_edit.closest(".paragraph-text").find(".p-txt").html();
            if ($('.ws-remove-section').length > 0) {
                $('.ws-remove-section').remove();
            }
            var rr = $("<div/>", {
                class: "ws-text-container ws-remove-section ws-right-actions",
                "data-setting": $(colEl).attr("id"),
            });

            var editer1 = $("<div/>", {
                id: "text-editor"
            });
            var el = $(editer1).get(0);

            var ee = $("<div/>", {
                class: "text-list ws-list-view"
            });

            let editer_hoder = $("<div/>", {
                class: "tab-pane fade show active",
                id: "ws_editor",
                role: "tabpanel",
            });
            editer_hoder.append($("<div/>", { class: "ws-editer" }).append(editer1));


            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });
            //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
            border_hoder.append(borderSetting());
            border_hoder.append(boxShadowSetting());
            border_hoder.append(getAlignment());
            border_hoder.append(backgroundSetting(false));

            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": 'text-list'
            });
            var tm = $("<div/>", {
                class: "ws-section-body",
            });

            am.append("<h2>Text Box Setting</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            let navLink = '<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_editor">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_link">Link</a></li></ul>';

            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });

            tc.append(editer_hoder);
            tc.append(getMarginpadding());
            tc.append(border_hoder);
            tc.append(getAnimationSetting());
            tc.append(getLinkSetting());

            tm.append(tc);
            rr.append(am);
            rr.append(tm);
            //rr.append(am);

            playgroundElements.append(rr);
            /*var editor = CKEDITOR.replace(el,{
              language: 'en',
              toolbarGroups:[
                { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
                { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
                { name: 'styles', groups: [ 'styles' ] },
                { name: 'colors', groups: [ 'colors' ] },
                { name: 'tools', groups: [ 'tools' ] }
                ]
            }); 
            editor.setData(htmlTxt);
            editor.on('change',function(){
                var delta = editor.getData();
                colEl.find(".p-txt").html(delta);
    
            //         var text = editor.getText();
            });*/
            var editor = new Quill(el, {
                modules: {
                    toolbar: __toolbarOptions
                },
                theme: 'snow'  // or 'bubble'
            });

            const delta = editor.clipboard.convert(htmlTxt);
            editor.setContents(delta, 'silent');
            editor.on('text-change', function (delta, oldDelta, source) {
                if (source == 'api') {
                    console.log("An API call triggered this change.");
                } else if (source == 'user') {
                    var delta = editor.getContents();
                    var text = editor.getText();
                    var justHtml = editor.root.innerHTML;
                    colEl.find(".p-txt").html(justHtml);
                }
            });
            //$(".ws-list-view").hide();
            ee.show();
            showTools();
            showEditer();
            // Tigger first nav item


        }
        function getAnimationSetting() {

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

            let selectValues = ["none", "fade", "fade-up", "fade-down", "fade-left", "fade-right", "fade-up-right", "fade-up-left", "fade-down-right", "fade-down-left", "flip-up", "flip-down", "flip-left", "flip-right", "slide-up", "slide-down", "slide-left", "slide-right", "zoom-in", "zoom-in-up", "zoom-in-down", "zoom-in-left", "zoom-in-right", "zoom-out", "zoom-out-up", "zoom-out-down", "zoom-out-left", "zoom-out-right"];
            let selectEasing = ["none", "linear", "ease", "ease-in", "ease-out", "ease-in-out", "ease-in-back", "ease-out-back", "ease-in-out-back", "ease-in-sine", "ease-out-sine", "ease-in-out-sine", "ease-in-quad", "ease-out-quad", "ease-in-out-quad", "ease-in-cubic", "ease-out-cubic", "ease-in-out-cubic", "ease-in-quart", "ease-out-quart", "ease-in-out-quart"];
            let selectAnchor = ["none", "top-bottom", "top-center", "top-top", "center-bottom", "center-center", "center-top", "bottom-bottom", "bottom-center", "bottom-top"];


            let aniH = $("<div/>", {
                class: "ws-section-setting no-flex ws-grid"
            });
            aniH.append("<p>Animation Type</p>");
            aniH.append(animationType);
            var aos = __current_col_edit.attr("data-aos");
            var aos_delay = __current_col_edit.attr("data-aos-delay");
            var aos_easing = __current_col_edit.attr("data-aos-easing");
            var aos_placement = __current_col_edit.attr("data-aos-anchor-placement");
            var aos_offset = __current_col_edit.attr("data-aos-offset");
            var aos_duration = __current_col_edit.attr("data-aos-duration");
            var aos_mirror = __current_col_edit.attr("data-aos-mirror");
            var aos_once = __current_col_edit.attr("data-aos-once");

            $.each(selectValues, function (key, value) {
                if (aos == value) {
                    animationType.append($("<option></option>", { "selected": "selected" }).attr("value", value).text(value));
                } else {
                    animationType.append($("<option></option>").attr("value", value).text(value));
                }
            });
            $.each(selectEasing, function (key, value) {
                if (aos_easing == value) {
                    animationEasing.append($("<option></option>", { "selected": "selected" }).attr("value", value).text(value));
                } else {
                    animationEasing.append($("<option></option>").attr("value", value).text(value));
                }
            });
            let anie = $("<div/>", {
                class: "ws-section-setting no-flex ws-grid"
            });
            anie.append("<p>Animation Easing</p>");
            anie.append(animationEasing);
            $.each(selectAnchor, function (key, value) {
                if (aos_placement == value) {
                    animationAnchor.append($("<option></option>", { "selected": "selected" }).attr("value", value).text(value));
                } else {
                    animationAnchor.append($("<option></option>").attr("value", value).text(value));
                }
            });
            let aniA = $("<div/>", {
                class: "ws-section-setting no-flex ws-grid"
            });
            aniA.append("<p>Animation Anchor Placement</p>");
            aniA.append(animationAnchor);
            // var aos_delay = __current_col_edit.attr("data-aos-delay");
            // var aos_easing = __current_col_edit.attr("data-aos-easing");
            // var aos_placement = __current_col_edit.attr("data-aos-anchor-placement");
            // var aos_offset = __current_col_edit.attr("data-aos-offset");
            // var aos_duration = __current_col_edit.attr("data-aos-duration");
            // var aos_mirror = __current_col_edit.attr("data-aos-mirror");
            // var aos_once = __current_col_edit.attr("data-aos-once");


            let anoffset = $("<div/>", {
                class: "ws-section-setting no-flex ws-grid"
            }).append($("<p/>", { class: "" }).append("Animation Offset")).append($("<input/>", { type: "text", value: aos_offset, class: "form-control animationSetting", "data-type": "data-aos-offset" })).append($("<span/>", { class: "ws_second-info" }).append("offset (in px) from the original trigger point"));

            let andelay = $("<div/>", {
                class: "ws-section-setting no-flex ws-grid"
            }).append($("<p/>", { class: "" }).append("Animation Delay")).append($("<input/>", { type: "text", value: aos_delay, class: "form-control animationSetting", "data-type": "data-aos-delay" })).append($("<span/>", { class: "ws_second-info" }).append("values from 0 to 3000, with step 50ms"));

            let anduration = $("<div/>", {
                class: "ws-section-setting no-flex ws-grid"
            }).append($("<p/>", { class: "" }).append("Animation Duration")).append($("<input/>", { type: "text", value: aos_duration, class: "form-control animationSetting", "data-type": "data-aos-duration" })).append($("<span/>", { class: "ws_second-info" }).append("values from 0 to 3000, with step 50ms"));
            if (aos_mirror == "yes") {
                var anmirror = $("<div/>", {
                    class: "ws-section-setting no-flex ws-grid"
                }).append($("<p/>", { class: "" }).append("Animation Mirror")).append($("<select/>", { class: "form-control animationSetting", "data-type": "data-aos-mirror" }).append("<option value='no'>No</option><option selected='selected' value='yes'>Yes</option>")).append($("<span/>", { class: "ws_second-info" }).append("whether elements should animate out while scrolling past them"));
            } else if (aos_mirror == "no") {
                var anmirror = $("<div/>", {
                    class: "ws-section-setting no-flex ws-grid"
                }).append($("<p/>", { class: "" }).append("Animation Mirror")).append($("<select/>", { class: "form-control animationSetting", "data-type": "data-aos-mirror" }).append("<option selected='selected' value='no'>No</option><option value='yes'>Yes</option>")).append($("<span/>", { class: "ws_second-info" }).append("whether elements should animate out while scrolling past them"));
            } else {
                var anmirror = $("<div/>", {
                    class: "ws-section-setting no-flex ws-grid"
                }).append($("<p/>", { class: "" }).append("Animation Mirror")).append($("<select/>", { class: "form-control animationSetting", "data-type": "data-aos-mirror" }).append("<option value='no'>No</option><option value='yes'>Yes</option>")).append($("<span/>", { class: "ws_second-info" }).append("whether elements should animate out while scrolling past them"));
            }

            if (aos_once == "yes") {
                var anonce = $("<div/>", {
                    class: "ws-section-setting no-flex ws-grid"
                }).append($("<p/>", { class: "" }).append("Animation Once")).append($("<select/>", { class: "form-control animationSetting", "data-type": "data-aos-once" }).append("<option value='no'>No</option><option selected='selected' value='yes'>Yes</option>")).append($("<span/>", { class: "ws_second-info" }).append("whether animation should happen only once - while scrolling down"));
            } else if (aos_once == "no") {
                var anonce = $("<div/>", {
                    class: "ws-section-setting no-flex ws-grid"
                }).append($("<p/>", { class: "" }).append("Animation Once")).append($("<select/>", { class: "form-control animationSetting", "data-type": "data-aos-once" }).append("<option selected='selected' value='no'>No</option><option value='yes'>Yes</option>")).append($("<span/>", { class: "ws_second-info" }).append("whether animation should happen only once - while scrolling down"));
            } else {
                var anonce = $("<div/>", {
                    class: "ws-section-setting no-flex ws-grid"
                }).append($("<p/>", { class: "" }).append("Animation Once")).append($("<select/>", { class: "form-control animationSetting", "data-type": "data-aos-once" }).append("<option value='no'>No</option><option value='yes'>Yes</option>")).append($("<span/>", { class: "ws_second-info" }).append("whether animation should happen only once - while scrolling down"));
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
        }
        function showTools() {
            $(".nav-link").removeClass("active");
            //$(".tab-pane").removeClass("active");
            $("#ws-tools").addClass("active");
            $("#profile").addClass("active");
        }
        function showElements() {
            $(".ws-dashboard-element").addClass("ws_active");
        }
        function showEditer() {
            $(".ws-text-container").addClass("ws_active");
        }
        function closeOverlay() {
            $(".ws-dashboard-element").removeClass("ws_active");
            $(".ws-text-container").removeClass("ws_active");
            $(".ws-remove-section").removeClass("ws_active");
        }

        function editSocialSetting(colEl) {

            __current_col_edit = colEl;
            let general_hoder = $("<div/>", {
                class: "tab-pane fade show active",
                id: "ws_general",
                role: "tabpanel",
            });
            let tm = $("<div/>", {
                class: "ws-section-body",
            });

            var curCss = __current_col_edit.attr("data-meta-css");
            var fblink = __current_col_edit.attr("data-fb");
            var twlink = __current_col_edit.attr("data-tw");
            var instalink = __current_col_edit.attr("data-insta");
            var linkinlink = __current_col_edit.attr("data-linkin");

            if ($('.ws-remove-section').length > 0) {
                $('.ws-remove-section').remove();
            }
            var rr = $("<div/>", {
                class: "ws-text-container ws-remove-section ws-right-actions",
                "data-setting": $(colEl).attr("id"),
            });

            var ee = $("<div/>", {
                class: "social-list ws-list-view"
            }).append($("<div/>", { class: "ws-social" }));

            var fbCon = $("<div/>", {
                class: "social-link"
            });
            var fb = $("<input>", {
                class: "social-link-txt",
                "data-type": "fb",
                value: fblink,
                type: "text"
            });

            fbCon.append("<p class='ws-setting-section-heading'><span>Facebook Link</span></p>");
            fbCon.append($("<div/>", { class: "ws-section-setting" }).append(fb));

            var twCon = $("<div/>", {
                class: "social-link-txt"
            });
            var tw = $("<input>", {
                class: "social-link-txt",
                value: twlink,
                "data-type": "tw",
                type: "text"
            });

            twCon.append("<p class='ws-setting-section-heading'><span>Twitter Link</span></p>");
            twCon.append($("<div/>", { class: "ws-section-setting" }).append(tw));

            var insCon = $("<div/>", {
                class: "social-link"
            });
            var ins = $("<input>", {
                class: "social-link-txt",
                value: instalink,
                "data-type": "insta",
                type: "text"
            });

            insCon.append("<p class='ws-setting-section-heading'><span>Instagram Link</span></p>");
            insCon.append($("<div/>", { class: "ws-section-setting" }).append(ins));


            var linkinCon = $("<div/>", {
                class: "social-link"
            });
            var linkin = $("<input>", {
                class: "social-link-txt",
                value: linkinlink,
                "data-type": "linkin",
                type: "text"
            });

            linkinCon.append("<p class='ws-setting-section-heading'><span>Linkedin Link</span></p>");
            linkinCon.append($("<div/>", { class: "ws-section-setting" }).append(linkin));

            general_hoder.append(fbCon);
            general_hoder.append(twCon);
            general_hoder.append(insCon);
            general_hoder.append(linkinCon);

            let navLink = '<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';
            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });
            //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
            border_hoder.append(borderSetting());
            border_hoder.append(boxShadowSetting());
            border_hoder.append(getAlignment());
            border_hoder.append(backgroundSetting(false));

            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": 'social-list'
            });

            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });

            tc.append(general_hoder);
            tc.append(getMarginpadding());
            tc.append(border_hoder);
            tc.append(getAnimationSetting());
            // tc.append(getLinkSetting());

            tm.append(tc);

            am.append("<h2>Edit Soical Media Links</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            am.append(ee);
            rr.append(am);
            rr.append(tm);

            playgroundElements.append(rr);
            //$(".ws-list-view").hide();
            ee.show();
            showTools();
            $(".ws-text-container").addClass("ws_active");

        }
        function editHtmlSetting(colEl) {
            __current_col_edit = colEl;
            let general_hoder = $("<div/>", {
                class: "tab-pane fade show active",
                id: "ws_general",
                role: "tabpanel",
            });
            let tm = $("<div/>", {
                class: "ws-section-body",
            });

            var curCss = __current_col_edit.attr("data-meta-css");
            var curHtml = __current_col_edit.closest(".ws-customHtml-link").find(".custom-html-txt").html();

            if ($('.ws-remove-section').length > 0) {
                $('.ws-remove-section').remove();
            }
            var rr = $("<div/>", {
                class: "ws-text-container ws-remove-section ws-right-actions",
                "data-setting": $(colEl).attr("id"),
            });
            var textel = $("<textarea>", {
                class: "custom-html",

            });
            textel.val(curHtml);
            general_hoder.append("<p class='ws-setting-section-heading'><span>HTML</p>");
            general_hoder.append($("<div/>", { class: "ws-section-setting" }).append(textel));
            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": 'html-list'
            });
            let navLink = '<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';
            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });
            //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
            border_hoder.append(borderSetting());
            border_hoder.append(boxShadowSetting());
            border_hoder.append(getAlignment());
            border_hoder.append(backgroundSetting(true));

            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            tc.append(general_hoder);
            tc.append(getMarginpadding());
            tc.append(border_hoder);
            tc.append(getAnimationSetting());
            // tc.append(getLinkSetting());
            tm.append(tc);

            am.append("<h2>Custom HTML Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            rr.append(am);
            rr.append(tm);
            playgroundElements.append(rr);
            showTools();
            $(".ws-text-container").addClass("ws_active");

        }
        function editVideoSetting(colEl) {

            __current_col_edit = colEl;
            let general_hoder = $("<div/>", {
                class: "tab-pane fade show active",
                id: "ws_general",
                role: "tabpanel",
            });
            let tm = $("<div/>", {
                class: "ws-section-body",
            });
            var curCss = __current_col_edit.attr("data-meta-css");
            var url = __current_col_edit.attr("data-url");
            //var htmlTxt = __current_col_edit.closest(".ws-video").find(".p-txt").html();
            if ($('.ws-remove-section').length > 0) {
                $('.ws-remove-section').remove();
            }
            var rr = $("<div/>", {
                class: "ws-text-container ws-remove-section ws-right-actions",
                "data-setting": $(colEl).attr("id"),
            });
            var url = $("<input>", {
                class: "text-list ws-video-url",
                type: "text",
                name: "url",
                value: url,
            });
            var ee = $("<div/>", {
                class: "video-list ws-list-view"
            });

            general_hoder.append("<p class='ws-setting-section-heading'>Video URL<span class='ws_second-info'>Copy and Paste URL(Accept youtube,viemo and dailymotion.)</span></p>");
            general_hoder.append($("<div/>", { class: "ws-section-setting" }).append(url));
            general_hoder.append("<p class='ws-setting-section-heading'><span>Video width X Height. Default is auto responsive.</span></p>");
            general_hoder.append(whScroll(false));
            //ee.append(getMarginpadding());

            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": 'video-list'
            });
            let navLink = '<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';
            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });
            //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
            border_hoder.append(borderSetting());
            border_hoder.append(boxShadowSetting());
            border_hoder.append(getAlignment());
            border_hoder.append(backgroundSetting(true));

            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            tc.append(general_hoder);
            tc.append(getMarginpadding());
            tc.append(border_hoder);
            tc.append(getAnimationSetting());
            // tc.append(getLinkSetting());
            tm.append(tc);

            am.append("<h2>Video Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            am.append(ee);
            rr.append(am);
            rr.append(tm);

            playgroundElements.append(rr);
            $(".ws-list-view").hide();
            ee.show();
            showTools();
            $(".ws-text-container").addClass("ws_active");

        }
        function editImageSetting(colEl) {

            __current_col_edit = colEl;
            let general_hoder = $("<div/>", {
                class: "tab-pane fade show active",
                id: "ws_general",
                role: "tabpanel",
            });
            let tm = $("<div/>", {
                class: "ws-section-body",
            });

            var curCss = __current_col_edit.attr("data-meta-css");
            if ($('.ws-remove-section').length > 0) {
                $('.ws-remove-section').remove();
            }
            var rr = $("<div/>", {
                class: "ws-text-container ws-remove-section ws-right-actions",
                "data-setting": $(colEl).attr("id"),
            });
            var curUrl = __current_col_edit.attr("data-url");
            if (typeof (curUrl) != "undefined" && curUrl != "") {
                var url = curUrl;
            } else {
                var url = "";
            }
            var url = $("<input>", {
                class: "text-list ws-image-url",
                type: "text",
                value: url,
                name: "url"
            });
            var uploadButton = $("<input>", {
                class: "btn loadMedia",
                type: "button",
                value: 'Media',
                name: "Media",
                "data-change": "ws-image-url",
                "data-toggle": "modal",
                "data-target": "#" + mediaModel,
            });

            var curLink = __current_col_edit.attr("data-link");
            if (typeof (curLink) != "undefined" && curLink != "") {
                var link = curLink;
            } else {
                var link = "";
            }
            var curAlt = __current_col_edit.attr("data-alt");
            if (typeof (curAlt) != "undefined" && curAlt != "") {
                var alttxt = curAlt;
            } else {
                var alttxt = "";
            }
            var alt = $("<input>", {
                class: "text-list ws-image-alt",
                type: "text",
                value: alttxt,
                name: "altText"
            });
            var ee = $("<div/>", {
                class: "image-list ws-list-view"
            });

            general_hoder.append("<p class='ws-setting-section-heading'><span>Image URL</p>");
            general_hoder.append($("<div/>", { class: "ws-section-setting" }).append(url));
            general_hoder.append(uploadButton);
            general_hoder.append("<p class='ws-setting-section-heading'><span>Image Width X Height. Default is Auto Responsive</p>");
            general_hoder.append(whScroll(false));
            // ee.append("<p class='ws-setting-section-heading'><span>Image Link</p>");
            // ee.append($("<div/>",{class:"ws-section-setting"}).append(link));
            general_hoder.append("<p class='ws-setting-section-heading'><span>Image Alt</p>");
            general_hoder.append($("<div/>", { class: "ws-section-setting" }).append(alt));
            //ee.append(getAlignment());
            //ee.append(getMarginpadding());

            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });
            //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
            border_hoder.append(borderSetting());
            border_hoder.append(boxShadowSetting());
            border_hoder.append(getAlignment());
            border_hoder.append(backgroundSetting(true));

            let navLink = '<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_link">Link</a></li></ul>';

            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            tc.append(general_hoder);
            tc.append(getMarginpadding());
            tc.append(border_hoder);
            tc.append(getAnimationSetting());
            tc.append(getLinkSetting());
            tm.append(tc);

            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": 'image-list'
            });
            am.append("<h2>Single Image Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            //am.append(ee);
            rr.append(am);
            rr.append(tm);

            playgroundElements.append(rr);
            //$(".ws-list-view").hide();
            ee.show();
            showTools();
            $(".ws-text-container").addClass("ws_active");

        }
        function editButtonSetting(colEl) {
            __current_col_edit = colEl;
            let general_hoder = $("<div/>", {
                class: "tab-pane fade show active",
                id: "ws_general",
                role: "tabpanel",
            });
            let tm = $("<div/>", {
                class: "ws-section-body",
            });
            var curCss = __current_col_edit.attr("data-meta-css");
            if ($('.ws-remove-section').length > 0) {
                $('.ws-remove-section').remove();
            }
            var rr = $("<div/>", {
                class: "ws-text-container ws-remove-section ws-right-actions",
                "data-setting": $(colEl).attr("id"),
            });

            var curLink = __current_col_edit.attr("data-link");
            if (typeof (curLink) != "undefined" && curLink != "") {
                var link = curLink;
            } else {
                var link = "";
            }
            var link = $("<input>", {
                class: "text-list ws-button-link",
                type: "text",
                value: link,
                name: "buttonLink"
            });
            var curAlt = __current_col_edit.attr("data-alt");
            if (typeof (curAlt) != "undefined" && curAlt != "") {
                var alttxt = curAlt;
            } else {
                var alttxt = "";
            }
            var alt = $("<input>", {
                class: "text-list ws-button-title",
                type: "text",
                value: alttxt,
                name: "altTextBtn"
            });
            var ee = $("<div/>", {
                class: "button-list ws-list-view"
            });
            general_hoder.append("<p class='ws-setting-section-heading'><span>Button Link</p>");
            general_hoder.append($("<div/>", { class: "ws-section-setting" }).append(link));
            general_hoder.append("<p class='ws-setting-section-heading'><span>Button Width X Height. Default is Auto Responsive</p>");
            general_hoder.append(whScroll(false));

            general_hoder.append("<p class='ws-setting-section-heading'><span>Button Title and Text</p>");
            general_hoder.append($("<div/>", { class: "ws-section-setting" }).append(alt));
            //ee.append(getAlignment());
            //ee.append(getMarginpadding());
            //ee.append(borderSetting());
            // ee.append(backgroundSetting(false));
            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": 'button-list'
            });

            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });
            //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
            border_hoder.append(borderSetting());
            border_hoder.append(boxShadowSetting());
            border_hoder.append(getAlignment());
            border_hoder.append(backgroundSetting(true));

            let navLink = '<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';

            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            tc.append(general_hoder);
            tc.append(getMarginpadding());
            tc.append(border_hoder);
            tc.append(getAnimationSetting());
            // tc.append(getLinkSetting());
            tm.append(tc);

            am.append("<h2>Button Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            am.append(ee);
            rr.append(am);
            rr.append(tm);
            playgroundElements.append(rr);
            ee.show();
            showTools();
            $(".ws-text-container").addClass("ws_active");

        }
        function editLinkSetting(colEl) {

            let general_hoder = $("<div/>", {
                class: "tab-pane fade show active",
                id: "ws_general",
                role: "tabpanel",
            });
            let tm = $("<div/>", {
                class: "ws-section-body",
            });

            __current_col_edit = colEl;

            var curCss = __current_col_edit.attr("data-meta-css");
            if ($('.ws-remove-section').length > 0) {
                $('.ws-remove-section').remove();
            }
            var rr = $("<div/>", {
                class: "ws-text-container ws-remove-section ws-right-actions",
                "data-setting": $(colEl).attr("id"),
            });

            var curLink = __current_col_edit.attr("data-link");
            if (typeof (curLink) != "undefined" && curLink != "") {
                var link = curLink;
            } else {
                var link = "";
            }
            var link = $("<input>", {
                class: "text-list ws-link-text",
                type: "text",
                value: link,
                name: "LinkText"
            });
            var curAlt = __current_col_edit.attr("data-alt");
            if (typeof (curAlt) != "undefined" && curAlt != "") {
                var alttxt = curAlt;
            } else {
                var alttxt = "";
            }
            var alt = $("<input>", {
                class: "text-list ws-link-title",
                type: "text",
                value: alttxt,
                name: "altTextLink"
            });
            var ee = $("<div/>", {
                class: "link-list ws-list-view"
            });
            general_hoder.append("<p class='ws-setting-section-heading'><span>Link</p>");
            general_hoder.append($("<div/>", { class: "ws-section-setting" }).append(link));
            general_hoder.append("<p class='ws-setting-section-heading'><span>Link Title and Text</p>");
            general_hoder.append($("<div/>", { class: "ws-section-setting" }).append(alt));
            general_hoder.append(getAlignment());
            //ee.append(getMarginpadding());
            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": 'link-list'
            });
            let navLink = '<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li></ul>';
            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });
            //border_hoder.append("<p class='ws-setting-section-heading'><span>Border</span></p>");
            border_hoder.append(borderSetting());
            border_hoder.append(boxShadowSetting());
            border_hoder.append(getAlignment());
            border_hoder.append(backgroundSetting(true));

            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            tc.append(general_hoder);
            tc.append(getMarginpadding());
            tc.append(border_hoder);
            tc.append(getAnimationSetting());
            // tc.append(getLinkSetting());
            tm.append(tc);
            am.append("<h2>Link Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            am.append(ee);
            rr.append(am);
            rr.append(tm);

            playgroundElements.append(rr);
            //$(".ws-list-view").hide();
            ee.show();
            showTools();
            $(".ws-text-container").addClass("ws_active");
        }
        function editHeadingTagSetting(colEl) {
            __current_col_edit = colEl;
            let general_hoder = $("<div/>", {
                class: "tab-pane fade show active",
                id: "ws_general",
                role: "tabpanel",
            });
            let tm = $("<div/>", {
                class: "ws-section-body",
            });

            var curCss = __current_col_edit.attr("data-meta-css");
            if ($('.ws-remove-section').length > 0) {
                $('.ws-remove-section').remove();
            }

            var curTag = __current_col_edit.attr("data-tag");

            var curAlt = __current_col_edit.attr("data-title");
            if (typeof (curAlt) != "undefined" && curAlt != "") {
                var alttxt = curAlt;
            } else {
                var alttxt = "";
            }
            var alt = $("<input>", {
                class: "text-list ws-header-title",
                type: "text",
                value: alttxt,
                name: "headerBtn"
            });

            var alignmentList = ["Select", "H1", "H2", "H3", "H4", "H5", "H6"];
            var sel = $("<select/>", {
                class: "ws-head-tag"
            });
            for (let i = 0; i < alignmentList.length; i++) {
                if (curTag != "undefined" && alignmentList[i] == curTag) {
                    sel.append(new Option(alignmentList[i], alignmentList[i], true, true));
                } else {
                    sel.append(new Option(alignmentList[i], alignmentList[i]));
                }
            }

            var wh = $("<div/>", {
                class: "ws-headingTag"
            });
            var holder = $("<div/>", {
                class: "ws-section-setting"
            });
            holder.append(sel);
            wh.append("<p class='ws-setting-section-heading'><span>Select Heading Tag</span></p>");
            wh.append(holder);
            general_hoder.append(wh);
            general_hoder.append("<p class='ws-setting-section-heading'><span>Title</p>");
            general_hoder.append($("<div/>", { class: "ws-section-setting" }).append(alt));

            var rr = $("<div/>", {
                class: "ws-text-container ws-remove-section ws-right-actions",
                "data-setting": $(colEl).attr("id"),
            });

            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });
            border_hoder.append(borderSetting());
            border_hoder.append(boxShadowSetting());
            border_hoder.append(getAlignment());
            border_hoder.append(backgroundSetting(true));

            let navLink = '<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_animations">Animations</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_link">Link</a></li></ul>';

            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            tc.append(general_hoder);
            tc.append(getMarginpadding());
            tc.append(border_hoder);
            tc.append(getAnimationSetting());
            tc.append(getLinkSetting());
            tm.append(tc);

            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": 'htmlTag-list'
            });
            am.append("<h2>Heading Tag Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            rr.append(am);
            rr.append(tm);

            playgroundElements.append(rr);
            showTools();
            $(".ws-text-container").addClass("ws_active");
        }
        function editCarouselSetting(colEl) {
            __current_col_edit = colEl;
            let general_hoder = $("<div/>", {
                class: "tab-pane fade show active ws-Carousel-Cls",
                id: "ws_general",
                role: "tabpanel",
            });
            let tm = $("<div/>", {
                class: "ws-section-body",
            });
            if ($('.ws-remove-section').length > 0) {
                $('.ws-remove-section').remove();
            }

            //is Carousel
            var collectionType = __current_col_edit.attr("data-collectionType");
            var collectionTypeList = ["Select", "Carousel", "Accordion", "Default"];
            var collectionTypeVal = $("<select/>", {
                class: "ws-type carouselSetting",
                id: 'collectionType',
                "data-type": "data-collectionType"
            });
            for (let i = 0; i < collectionTypeList.length; i++) {
                if (collectionType != "undefined" && collectionTypeList[i] == collectionType) {
                    collectionTypeVal.append(new Option(collectionTypeList[i], collectionTypeList[i], true, true));
                } else {
                    collectionTypeVal.append(new Option(collectionTypeList[i], collectionTypeList[i]));
                }
            }

            var type = $("<div/>", { class: 'ws-type' });
            type.append("<p class='ws-setting-section-heading'><span>Display Type</span></p>");
            var types = $("<div/>", { class: 'ws-section-setting' });
            types.append(collectionTypeVal);
            // if(collectionType == 'Accordion'){
            // Append Accordion GIF
            var accordionImage = $("<img>", {
                src: APPPATH + "assets/templateEditor/images/accordion.gif",
                alt: "Accordion Icon",
                class: 'gifClass accordionCls accordionGif ' + (collectionType == 'Accordion' ? 'display' : '') + '',
            });
            types.append(accordionImage);
            // }
            // if(collectionType == 'Carousel'){
            // Append Carousel GIF
            var carouselImage = $("<img>", {
                src: APPPATH + "assets/templateEditor/images/Carousel.gif",
                alt: "Carousel Icon",
                class: 'gifClass carouselCls carouselGif ' + (collectionType == 'Carousel' ? 'display' : '') + '',
            });
            types.append(carouselImage);
            // }

            type.append(types);
            general_hoder.append(type);
            //is Carousel

            //Select Type
            var curType = __current_col_edit.attr("data-item-type");
            if (__current_col_edit.attr("data-table-name")) {
                var tableName = __current_col_edit.attr("data-table-name");
            } else {
                var tableName = "";
            }
            if (__current_col_edit.attr("data-menuID")) {
                var menuID = __current_col_edit.attr("data-menuID");
            } else {
                var menuID = "";
            }
            if (__current_col_edit.attr("data-custom_module")) {
                var custom_module = __current_col_edit.attr("data-custom_module");
            } else {
                var custom_module = "";
            }
            var typeList = [];
            for (let i = 0; i < menuList.length; i++) {
                var label = menuList[i][2];
                typeList.push(label);
            }
            var typeVal = $("<select/>", {
                class: "ws-type carouselSetting",
                id: 'carousel-type',
                "data-type": "data-item-type",
                "data-table-name": tableName,
                "data-menuID": menuID,
                "data-custom_module": custom_module,
            });
            typeVal.append(new Option("Select", ""));
            for (let i = 0; i < typeList.length; i++) {
                if (curType != "undefined" && typeList[i] == curType) {
                    typeVal.append(new Option(typeList[i], typeList[i], true, true));
                } else {
                    typeVal.append(new Option(typeList[i], typeList[i]));
                }
            }
            var type = $("<div/>", { class: 'ws-type' });
            type.append("<p class='ws-setting-section-heading'><span>Select Type</span></p>");
            var types = $("<div/>", { class: 'ws-section-setting' });
            types.append(typeVal);
            type.append(types);
            general_hoder.append(type);
            //Select Type

            //Select Category
            var curCategory = __current_col_edit.attr("data-category");
            var categoryList = categories;
            var categoryVal = $("<select/>", {
                class: "ws-category carouselSetting",
                id: 'carousel-category',
                "data-type": "data-category"
            });
            // Initialize Select2
            categoryVal.select2({
                placeholder: "Select categories", // Placeholder text
                multiple: true // Allowing multiple selections
            });
            if (typeof curCategory != "undefined" && typeof curCategory == "string") {
                var selectedCategories = curCategory.split(',');
            } else {
                var selectedCategories = [];
            }
            categoryVal.append(new Option("Select", ""));

            for (let i = 0; i < categoryList.length; i++) {
                let value = categoryList[i][0];
                let label = categoryList[i][1];
                if (selectedCategories.includes(value)) {
                    categoryVal.append(new Option(label, value, true, true));
                } else {
                    categoryVal.append(new Option(label, value));
                }
            }
            var category = $("<div/>", {
                class: 'ws-category'
            });
            category.append("<p class='ws-setting-section-heading'><span>Select Category</span></p>");
            var categorys = $("<div/>", {
                class: 'ws-section-setting'
            });
            categorys.append(categoryVal);
            category.append(categorys);
            general_hoder.append(category);
            //Select Category

            //Set Limit 
            var setLimit = __current_col_edit.attr("data-set-limit");
            if (typeof (setLimit) != "undefined" && setLimit != "") {
                var setLimit = setLimit;
            } else {
                var setLimit = "";
            }
            var limits = $("<input>", {
                class: "text-list ws-set-limit carouselSetting",
                type: "number",
                value: setLimit,
                name: "sectionLimit",
                id: "set-limit",
                "data-type": "data-set-limit"
            });
            var setLimits = $("<div/>", { class: 'ws-setLimit' });
            setLimits.append("<p class='ws-setting-section-heading'><span>Set Limit</span></p>");
            var one = $("<div/>", { class: 'ws-section-setting' });
            one.append(limits);
            setLimits.append(one);
            general_hoder.append(setLimits);
            //Set Limit 

            //Set Pagination 
            var pagination = $("<input/>", {
                id: "set-pagination",
                type: "checkbox",
                class: "filled-in chk-col-light-blue ws-set-pagination carouselSetting",
                "data-type": "data-set-pagination"
            });
            var setPagination = __current_col_edit.attr("data-set-pagination");
            if (typeof (setPagination) != "undefined" && setPagination != "" && setPagination == "yes") {
                pagination.prop("checked", true);
            } else {
                pagination.prop("checked", false);
            }
            general_hoder.append("<p class='ws-setting-section-heading'><span>Set Pagination</span></p>");
            var holderc = $("<div/>", { class: "ws-section-setting demo-checkbox" }).append(pagination);
            holderc.append("<label for='set-pagination'></label>");
            general_hoder.append(holderc);
            //Set Pagination 

            //Set Per Page 
            var setPagination = __current_col_edit.attr("data-set-pagination");
            var displayStyle = setPagination === 'yes' ? 'block' : 'none';
            var setPerPage = __current_col_edit.attr("data-set-perPage");
            if (typeof (setPerPage) != "undefined" && setPerPage != "") {
                var setPerPage = setPerPage;
            } else {
                var setPerPage = "";
            }
            var perPages = $("<input>", {
                class: "text-list ws-set-perPage carouselSetting",
                type: "number",
                value: setPerPage,
                name: "sectionPerPage",
                id: "set-perPage",
                "data-type": "data-set-perPage"
            });
            var setPerPages = $("<div/>", { class: 'ws-setPerPage', style: 'display: ' + displayStyle });
            setPerPages.append("<p class='ws-setting-section-heading'><span>Set Per Page</span></p>");
            var one = $("<div/>", { class: 'ws-section-setting' });
            one.append(perPages);
            setPerPages.append(one);
            general_hoder.append(setPerPages);
            //Set Per Page

            //Select Order
            var curOrder = __current_col_edit.attr("data-order");
            var orderList = [
                { displayName: "Select", value: "" },
                { displayName: "Uploaded Last Date", value: "uploaded_last_date" },
                { displayName: "Title A to Z", value: "title_a_to_z" },
                { displayName: "Title Z to A", value: "title_z_to_a" }
            ];
            var orderListVal = $("<select/>", {
                class: "ws-orderList carouselSetting",
                id: 'carousel-order',
                "data-type": "data-order"
            });
            for (let i = 0; i < orderList.length; i++) {
                if (curOrder !== "undefined" && orderList[i].value === curOrder) {
                    orderListVal.append(new Option(orderList[i].displayName, orderList[i].value, true, true));
                } else {
                    orderListVal.append(new Option(orderList[i].displayName, orderList[i].value));
                }
            }
            var orderListContainer = $("<div/>", { class: 'ws-orderList' });
            orderListContainer.append("<p class='ws-setting-section-heading'><span>Select Order</span></p>");
            var orderListSetting = $("<div/>", { class: 'ws-section-setting' });
            orderListSetting.append(orderListVal);
            orderListContainer.append(orderListSetting);
            general_hoder.append(orderListContainer);
            //Select Order

            // Dynamically bind events
            const templateKeys = Object.keys(templateList).map(moduleName => {
                return getModuleSettings(moduleName).containerClass;
            });

            const templatePrefix = Object.keys(templateList).map(moduleName => {
                return getModuleSettings(moduleName).idPrefix;
            });

            // console.log("templateList..........",templateList);
            function createTemplateListContainer(itemType, collectionType, curTemplate, templatesList, containerClass, headingText, idPrefix) {
                if (itemType != "undefined" && itemType != null && itemType != "") {
                    var itemType1 = itemType.replace(/\s+/g, '');
                } else {
                    itemType = '';
                    var itemType1 = itemType.replace(/\s+/g, '');
                }

                // var itemType1 = itemType.replace(/\s+/g, '');
                var templateListContainer = $("<div/>", { class: containerClass + ' ' + (itemType1 === containerClass.split(' ')[1] && collectionType !== 'Accordion' ? 'display' : 'd-none') });
                templateListContainer.append("<p class='ws-setting-section-heading'><span>" + headingText + "</span></p>");
                var templateListSetting = $("<div/>", { class: 'ws-section-setting tempImgSetting' });

                for (let i = 0; i < templatesList.length; i++) {
                    var divWrapper = $("<div/>");
                    var imgOption = $("<img/>", {
                        src: templatesList[i].imagePath ? templatesList[i].imagePath : APPPATH + "assets/templateEditor/images/No_Image_Available.jpg",
                        alt: templatesList[i].value,
                        class: "template-option carouselSetting",
                        id: idPrefix + "-view",
                        value: templatesList[i].value,
                        "data-type": "data-template"
                    });
                    if (curTemplate !== "undefined" && templatesList[i].value === curTemplate) {
                        imgOption.addClass("selected");
                    }
                    var tempName = $("<div/>", {
                        class: "tempName",
                    });
                    tempName.append(templatesList[i].value);
                    divWrapper.append(imgOption);
                    divWrapper.append(tempName);
                    templateListSetting.append(divWrapper);
                }
                templateListContainer.append(templateListSetting);
                general_hoder.append(templateListContainer);
            }

            var itemType = __current_col_edit.attr("data-item-type");
            var collectionType = __current_col_edit.attr("data-collectionType");
            var curTemplate = __current_col_edit.attr("data-template");

            function getModuleSettings(moduleName) {
                const moduleKey = moduleName.replace(/\s+/g, '');
                return {
                    containerClass: `ws-${moduleKey}TemplateList ${moduleKey}`,
                    headingText: `${moduleName} Type View`,
                    idPrefix: moduleKey.toLowerCase()
                };
            }

            // Loop through the templateList object and call createTemplateListContainer for each module
            for (let moduleName in templateList) {
                if (templateList.hasOwnProperty(moduleName)) {
                    const { containerClass, headingText, idPrefix } = getModuleSettings(moduleName);
                    createTemplateListContainer(itemType, collectionType, curTemplate, templateList[moduleName], containerClass, headingText, idPrefix);
                }
            }

            // Bind the propertychange change click event dynamically
            $("body").on("propertychange change click", ".carouselSetting", function (e) {
                e.stopImmediatePropagation();
                __current_col_edit.find(".carousel-html-txt").remove();
                let el = $(this);
                var tochange = el.attr("id");
                var tochangeVal = el.val();
                $(".template-option").removeClass("selected");

                if (tochange === 'set-pagination') {
                    if ($(this).is(":checked")) {
                        __current_col_edit.attr("data-set-pagination", 'yes');
                        $(".ws-setPerPage").show();
                        $("#set-perPage").val(__current_col_edit.attr('data-set-perPage'));
                        __current_col_edit.attr("data-set-perPage", __current_col_edit.attr('data-set-perPage'));
                    } else {
                        __current_col_edit.attr("data-set-pagination", 'no');
                        $(".ws-setPerPage").hide();
                        __current_col_edit.attr("data-set-perPage", '');
                        $("#set-perPage").val("");
                    }
                }

                if (tochange === 'collectionType') {
                    $(".carouselCls").toggleClass("display", tochangeVal === 'Carousel');
                    $(".accordionCls").toggleClass("display", tochangeVal === 'Accordion');

                    // Hide all template lists
                    templateKeys.forEach(key => {
                        let newKey = key.split(' ')[0];
                        $(`.${newKey}`).removeClass("display");
                        $(`.${newKey}`).addClass("d-none");
                    });

                    if (tochangeVal !== 'Accordion') {
                        if (__current_col_edit && __current_col_edit.attr("data-item-type")) {
                            var itemType = __current_col_edit.attr("data-item-type").replace(/\s/g, '');
                            $(`.ws-${itemType}TemplateList`).addClass("display");
                            $(`.ws-${itemType}TemplateList`).removeClass("d-none");
                        } else {
                            console.error("data-item-type attribute is missing or __current_col_edit is undefined.");
                        }
                    }
                }

                if (tochange === 'carousel-type') {
                    // Hide all template lists
                    templateKeys.forEach(key => {
                        let newKey = key.split(' ')[0];
                        $(`.${newKey}`).removeClass("display");
                        $(`.${newKey}`).addClass("d-none");
                    });

                    for (let i = 0; i < menuList.length; i++) {
                        if (menuList[i][2] === tochangeVal) {
                            __current_col_edit.attr("data-table-name", menuList[i][3]);
                            __current_col_edit.attr("data-menuID", menuList[i][0]);
                            __current_col_edit.attr("data-custom_module", menuList[i][4]);
                            break;
                        }
                    }
                    const newCls = tochangeVal.replace(/\s+/g, '');
                    const displayTemplateClass = templateKeys.find(key => key.split(' ')[0] === `ws-${newCls}TemplateList`);
                    if (__current_col_edit.attr("data-collectionType") !== 'Accordion' && displayTemplateClass) {
                        $(`.${displayTemplateClass.split(' ')[0]}`).addClass("display");
                        $(`.${displayTemplateClass.split(' ')[0]}`).removeClass("d-none");
                    }
                }

                if (templatePrefix.map(key => `${key}-view`).includes(tochange)) {
                    $(".template-option").removeClass("selected");
                    $(this).addClass("selected");
                    let type = el.attr("data-type");
                    if (el.attr("value") == "") {
                        __current_col_edit.removeAttr("" + type);
                    } else {
                        __current_col_edit.attr("" + type, el.attr("value"));
                    }
                }

                if (['collectionType', 'carousel-type', 'carousel-category', 'set-limit', 'carousel-order', 'expandType', 'set-perPage', 'set-pagination'].includes(tochange)) {
                    __current_col_edit.attr(el.attr("data-type"), el.val());
                } else {
                    var metaCss = __current_col_edit.attr("data-owl-carousel");
                    var metaCss1 = metaCss ? JSON.parse(metaCss) : {};
                    if (el.val() == "") {
                        delete metaCss1[tochange];
                    } else {
                        metaCss1[tochange] = el.val();
                    }
                    if (settings.version == "inline") {
                        __current_col_edit.css(tochange, el.val());
                    }
                    __current_col_edit.attr("data-owl-carousel", JSON.stringify(metaCss1));
                }

                // Code for creating carousel-html-txt element
                var collectionType = __current_col_edit.attr('data-collectionType') || '';
                var type = __current_col_edit.attr('data-item-type') || '';
                var newType = type.replace(/\s+/g, '_');
                var category = __current_col_edit.attr('data-category') || '';
                var limit = __current_col_edit.attr('data-set-limit') || '';
                var order = __current_col_edit.attr('data-order') || '';
                var pagination = __current_col_edit.attr('data-set-pagination') || '';
                var perPage = __current_col_edit.attr('data-set-perPage') || '';
                var template = __current_col_edit.attr('data-template') || '';
                var expandType = __current_col_edit.attr('data-expandType') || '';
                var json = __current_col_edit.attr('data-owl-carousel') || '';
                json = json.trim().replace(/\s+/g, '');
                json = json.replace(/\\n/g, '');
                json = JSON.stringify(json);
                var carouselCls = __current_col_edit.attr('id') || '';
                var content = `[type=${newType} collectionType=${collectionType} category=${category} limit=${limit} order=${order} pagination=${pagination} perPage=${perPage} isCustomModule=${__current_col_edit.attr("data-custom_module")} expandType=${expandType} template=${template} tableName=${__current_col_edit.attr("data-table-name")} menuID=${__current_col_edit.attr("data-menuID")} carouselCls=${carouselCls} json=${json.replace(/"/g, '')}]`;
                console.log("content", content);
                __current_col_edit.append($("<div/>", { class: "carousel-html-txt" }).text(content));
            });

            // // Blog Templates
            // createTemplateListContainer(itemType, collectionType, curTemplate, blogsTemplates, 'ws-blogsTemplateList Blogs', 'Blog Type View', 'blog');

            // // Pages Templates
            // createTemplateListContainer(itemType, collectionType, curTemplate, listPagesTemplates, 'ws-listPagesTemplateList ListPages', 'Pages Type View', 'page');

            // // Testimonials Templates
            // createTemplateListContainer(itemType, collectionType, curTemplate, testimonialsTemplates, 'ws-testimonialsTemplateList Testimonials', 'Testimonials Type View', 'testimonials');

            // // Services Templates
            // createTemplateListContainer(itemType, collectionType, curTemplate, servicesTemplates, 'ws-servicesTemplateList Services', 'Service Type View', 'service');

            // // Clients Templates
            // createTemplateListContainer(itemType, collectionType, curTemplate, ourClientsTemplates, 'ws-ourClientsTemplateList OurClients', 'Clients Type View', 'client');

            // // Teams Templates
            // createTemplateListContainer(itemType, collectionType, curTemplate, ourTeamTemplates, 'ws-ourTeamTemplateList OurTeam', 'Teams Type View', 'team');

            // // Career Templates
            // createTemplateListContainer(itemType, collectionType, curTemplate, careerTemplates, 'ws-careerTemplateList Career', 'Career Type View', 'career');

            // // FAQ Templates
            // createTemplateListContainer(itemType, collectionType, curTemplate, fAQTemplates, 'ws-fAQTemplateList FAQ', 'FAQ Type View', 'faq');

            // Our Works Templates
            // createTemplateListContainer(itemType, collectionType, curTemplate, ourWorksTemplates, 'ws-ourWorksTemplateList OurWorks', 'Our Works Type View', 'ourWorks');            

            //Accordion Expand Mode
            var expandType = __current_col_edit.attr("data-expandType");
            var expandTypeList = ["Select", "Single", "Multiple"];
            var expandTypeVal = $("<select/>", {
                class: "ws-type carouselSetting",
                id: 'expandType',
                "data-type": "data-expandType"
            });
            for (let i = 0; i < expandTypeList.length; i++) {
                if (expandType != "undefined" && expandTypeList[i] == expandType) {
                    expandTypeVal.append(new Option(expandTypeList[i], expandTypeList[i], true, true));
                } else {
                    expandTypeVal.append(new Option(expandTypeList[i], expandTypeList[i]));
                }
            }
            var collectionType = __current_col_edit.attr("data-collectionType");
            var type = $("<div/>", { class: 'ws-type accordionCls ' + (collectionType == 'Accordion' ? 'display' : '') + '' });
            type.append("<p class='ws-setting-section-heading'><span>Accordion Expand Mode</span></p>");
            var types = $("<div/>", { class: 'ws-section-setting' });
            types.append(expandTypeVal);
            type.append(types);
            general_hoder.append(type);
            //Accordion Expand Mode

            var rr = $("<div/>", {
                class: "ws-text-container ws-remove-section ws-right-actions",
                "data-setting": $(colEl).attr("id"),
            });
            var collectionType = __current_col_edit.attr("data-collectionType");
            let navLink = '<ul class="nav nav-tabs" role="tablist">' +
                '<li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li>' +
                '<li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li>' +
                '<li class="nav-item carouselCls ' + (collectionType == 'Carousel' ? 'display' : '') + '" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_owlCarousel">Carousel Settings</a></li>' +
                '</ul>';
            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            tc.append(general_hoder);
            tc.append(getMarginpadding());
            tc.append(getOwlCarouselSetting());
            tm.append(tc);
            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": 'carousel-list'
            });
            am.append("<h2>Carousel Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            rr.append(am);
            rr.append(tm);
            playgroundElements.append(rr);
            showTools();
            $(".ws-text-container").addClass("ws_active");
        }
        function editImageSliderSetting(colEl) {
            __current_col_edit = colEl;
            let general_hoder = $("<div/>", {
                class: "tab-pane fade show active",
                id: "ws_general",
                role: "tabpanel",
            });
            let tm = $("<div/>", {
                class: "ws-section-body",
            });

            var curCss = __current_col_edit.attr("data-meta-css");
            // var curHtml = __current_col_edit.closest(".ws-customHtml-link").find(".custom-html-txt").html();

            if ($('.ws-remove-section').length > 0) {
                $('.ws-remove-section').remove();
            }
            var rr = $("<div/>", {
                class: "ws-text-container ws-remove-section ws-right-actions",
                "data-setting": $(colEl).attr("id"),
            });

            //Select Slider
            var curSlider = __current_col_edit.attr("data-imgSlider");
            // console.log("imgSlidersList",imgSlidersList);
            var imgSliderList = imgSlidersList;
            var sliderVal = $("<select/>", {
                class: "ws-imgSlider imgSliderSetting",
                "data-slider": "data-imgSlider"
            });
            // Add "Select" option
            sliderVal.append(new Option("Select", ""));
            for (let i = 0; i < imgSliderList.length; i++) {
                let value = imgSliderList[i][0];
                let label = imgSliderList[i][1];
                if (curSlider !== "undefined" && value === curSlider) {
                    sliderVal.append(new Option(label, value, true, true));
                } else {
                    sliderVal.append(new Option(label, value));
                }
            }
            var imgSliders = $("<div/>", { class: 'ws-imgSliders' });
            imgSliders.append("<p class='ws-setting-section-heading'><span>Select Slider</span></p>");
            var sliders = $("<div/>", { class: 'ws-section-setting' });
            sliders.append(sliderVal);
            imgSliders.append(sliders);
            general_hoder.append(imgSliders);
            //Select Slider

            var am = $("<div/>", {
                class: "ws-section-header",
                "data-show": 'imageSlider-list'
            });
            let navLink = '<ul class="nav nav-tabs" role="tablist"><li class="nav-item" role="presentation"><a class="nav-link active" data-toggle="tab" href="#ws_general">General</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_margin">Box Spacing</a></li><li class="nav-item" role="presentation"><a class="nav-link" data-toggle="tab" href="#ws_border">Border & background colors</a></li></ul>';
            let border_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_border",
                role: "tabpanel",
            });

            border_hoder.append(borderSetting());
            border_hoder.append(boxShadowSetting());
            border_hoder.append(getAlignment());
            border_hoder.append(backgroundSetting(true));

            tm.append(navLink);
            let tc = $("<div/>", {
                class: "tab-content",
            });
            tc.append(general_hoder);
            tc.append(getMarginpadding());
            tc.append(border_hoder);
            // tc.append(getAnimationSetting());
            // tc.append(getLinkSetting());
            tm.append(tc);

            am.append("<h2>Image Slider Settings</h2><span class='ws_close_overlay'><i class='material-icons'>close</i></span>");
            rr.append(am);
            rr.append(tm);
            playgroundElements.append(rr);
            showTools();
            $(".ws-text-container").addClass("ws_active");

        }

        function getMarginpadding() {
            let margin_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_margin",
                role: "tabpanel",
            });

            var elMain = $("<div/>", { class: "col-ma" });
            var addCss = __current_col_edit.attr("data-add-css");
            if (typeof (addCss) == "undefined") {
                addCss = "";
            }
            var curCss = __current_col_edit.attr("data-meta-css");
            if (typeof (curCss) != "undefined") {
                curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
            } else {
                curCss = {};
            }
            var addionalCss = $("<div/>", { class: "col-setting" });
            addionalCss.append("<p class='ws-setting-section-heading'><span>Additional Css Class</span></p>");
            var addCssEl = $("<input/>", {
                type: 'text',
                class: 'addCss',
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
            var marAllDiv = $("<div/>", { class: "ws-marAllDiv ws-section-setting no-flex ws-grid", });
            var marSliderVal;
            var slider_m = $("<div/>", { id: "slider_m", class: "sliderCls margin" });
            var sliderHandel_m = $("<div/>", { id: "custom-handle", class: "ui-slider-handle" });
            slider_m.slider({
                max: 500,
                min: 0,
                create: function () {
                    sliderHandel_m.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    sliderHandel_m.text(ui.value);
                    var curCss = __current_col_edit.attr("data-meta-css");
                    if (typeof (curCss) != "undefined") {
                        curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
                    } else {
                        curCss = {};
                    }
                    sliderHandel_m.text(ui.value);
                    marSliderVal = ui.value;
                    marginPx.val(marSliderVal);
                    curCss["margin"] = marSliderVal + "px";
                    if (settings.version == "inline") {
                        __current_col_edit.css("margin", marSliderVal) + "px";
                    }
                    __current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                }
            });

            if (typeof (curCss["margin"]) != 'undefined') {
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

            var allMarDiv = $("<div/>", { class: "ws-allMarDiv", });
            var marLabel = $("<div/>", { class: "labelInput", });
            var marSlider = $("<div/>", { class: "ws-borSlider", });
            var marInput = $("<div/>", { class: "ws-marInput d-flex gap-3", });
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
                var sliderSideHandel = $("<div/>", { id: "custom-handle", class: "ui-slider-handle" });
                var sliderSide = $("<div/>", { id: "ws_m_" + index, class: "sliderCls sliderClsws_m_" + index });
                sliderSide.slider({
                    max: 500,
                    min: 0,
                    create: function () {
                        sliderSideHandel.text($(this).slider("value"));
                    },
                    slide: function (event, ui) {
                        var curCss = __current_col_edit.attr("data-meta-css");
                        if (typeof (curCss) != "undefined") {
                            curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
                        } else {
                            curCss = {};
                        }
                        sliderSideHandel.text(ui.value);
                        val = ui.value;
                        mar_i.val(val);
                        let tochange = __margintype["ws_m_" + index];
                        curCss[__margintype["ws_m_" + index]] = val + "px";
                        if (settings.version == "inline") {
                            __current_col_edit.css(tochange, val) + "px";
                        }
                        __current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                    }
                });
                sliderM = sliderSide.slider();
                if (typeof (curCss) != "undefined") {
                    if (typeof (curCss[__margintype["ws_m_" + index]]) != "undefined") {
                        val = parseInt(curCss[__margintype["ws_m_" + index]], 10);
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    } else {
                        val = 0;
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    }
                }
                let mar_h = $("<div/>", {
                    class: "ws-col-margin ws-section-setting no-flex ws-grid"
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

            var marginToggleOpt = $("<div/>", { id: "marginToggleOpt", class: "toggleOptCls" });
            var marginToggleBtn = $("<div/>", { id: "marginToggleBtn", });
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
            var padAllDiv = $("<div/>", { class: "ws-padAllDiv ws-section-setting no-flex ws-grid", });
            var padSliderVal;
            var slider_p = $("<div/>", { id: "slider_p", class: "sliderCls padding" });
            var sliderHandel_p = $("<div/>", { id: "custom-handle", class: "ui-slider-handle" });
            slider_p.slider({
                max: 500,
                min: 0,
                create: function () {
                    sliderHandel_p.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = __current_col_edit.attr("data-meta-css");
                    if (typeof (curCss) != "undefined") {
                        curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
                    } else {
                        curCss = {};
                    }
                    sliderHandel_p.text(ui.value);
                    padSliderVal = ui.value;
                    paddingPx.val(padSliderVal);
                    curCss["padding"] = padSliderVal + "px";
                    if (settings.version == "inline") {
                        __current_col_edit.css("padding", padSliderVal) + "px";
                    }
                    __current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                }
            });
            if (typeof (curCss["padding"]) != 'undefined') {
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

            var allPadDiv = $("<div/>", { class: "ws-allPadDiv", });
            var padLabel = $("<div/>", { class: "labelInput", });
            var padSlider = $("<div/>", { class: "ws-borSlider", });
            var padInput = $("<div/>", { class: "ws-padInput d-flex gap-3", });
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
                var sliderPHandel = $("<div/>", { id: "custom-handle", class: "ui-slider-handle" });
                var sliderSide = $("<div/>", { id: "ws_p_" + index, class: "sliderCls sliderClsws_p_" + index });
                var sliderP;
                sliderSide.slider({
                    max: 500,
                    min: 0,
                    create: function () {
                        sliderPHandel.text($(this).slider("value"));
                    },
                    slide: function (event, ui) {
                        var curCss = __current_col_edit.attr("data-meta-css");
                        if (typeof (curCss) != "undefined") {
                            curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
                        } else {
                            curCss = {};
                        }
                        sliderPHandel.text(ui.value);
                        val = ui.value;
                        pad_i.val(val);
                        let tochange = __paddingtype["ws_p_" + index];
                        curCss[__paddingtype["ws_p_" + index]] = val + "px";
                        if (settings.version == "inline") {
                            __current_col_edit.css(tochange, val) + "px";
                        }
                        __current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                    }
                });
                sliderP = sliderSide.slider();
                if (typeof (curCss) != "undefined") {
                    if (typeof (curCss[__paddingtype["ws_p_" + index]]) != "undefined") {
                        val = parseInt(curCss[__paddingtype["ws_p_" + index]], 10);
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    } else {
                        val = 0;
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    }
                }
                let pad_h = $("<div/>", {
                    class: "ws-col-padding ws-section-setting no-flex ws-grid"
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

            var paddingToggleOpt = $("<div/>", { id: "paddingToggleOpt", class: "toggleOptCls" });
            var paddingToggleBtn = $("<div/>", { id: "paddingToggleBtn", });
            paddingToggleOpt.append("<span>Target individual padding</span>");
            paddingToggleBtn.append("<button class='ToggleBtn' id='padding-toggle_button'>OFF</button>");
            paddingToggleOpt.append(paddingToggleBtn);
            thirdDiv.append(padAll);
            thirdDiv.append(paddingToggleOpt);
            thirdDiv.append(padCls);
            margin_hoder.append(thirdDiv);

            return margin_hoder;
        }
        function whScroll(isScroll) {

            var curCss = __current_col_edit.attr("data-meta-css");
            if (typeof (curCss) != "undefined") {
                curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
            } else {
                curCss = {};
            }
            var curWidth = __current_col_edit.attr("data-width");
            if (typeof (curWidth) != "undefined" && curWidth != "") {
                var wid = curWidth;
            } else {
                var wid = "";
            }
            var width = $("<input>", {
                id: "ws-element-width",
                class: "ws-input",
                value: wid,
                type: "text"
            });
            var curHeight = __current_col_edit.attr("data-height");
            if (typeof (curHeight) != "undefined" && curHeight != "") {
                var hei = curHeight;
            } else {
                var hei = "";
            }
            var height = $("<input>", {
                id: "ws-element-height",
                class: "ws-input",
                value: hei,
                type: "text"
            });
            if (isScroll) {

                var overList = ["none", "visible", "hidden", "scroll", "auto"];
                var sel = $("<select/>", {
                    class: "ws-scroll-type"
                });
                for (let i = 0; i < overList.length; i++) {
                    if (curCss["overflow"] != "undefined" && overList[i] == curCss["overflow"]) {
                        sel.append(new Option(overList[i], overList[i], true, true));
                    } else {
                        sel.append(new Option(overList[i], overList[i]));
                    }
                }
            }

            var wh = $("<div/>", {
                class: "ws-who"
            });
            var whs = $("<div/>", {
                class: "ws-wh ws-section-setting"
            });
            whs.append(width);
            whs.append("<div class='clearfix'>&nbsp;</div>");
            whs.append(height);
            wh.append(whs);
            if (isScroll) {
                wh.append("<p class='ws-setting-section-heading'><span>Content Overflow</span></p>");
                var holder = $("<div/>", {
                    class: "ws-section-setting"
                }).append(sel);
                wh.append(holder);
            }
            return wh;

        }
        function getMobileSetting() {

            var mobile = __current_col_edit.attr("data-mobile");
            if (typeof (mobile) != "undefined" && mobile != "") {
                var mobileView = mobile;
            } else {
                var mobileView = "";
            }

            var tablet = __current_col_edit.attr("data-tablet");
            if (typeof (tablet) != "undefined" && tablet != "") {
                var tabletView = tablet;
            } else {
                var tabletView = "";
            }

            var mobileFont = __current_col_edit.attr("data-mobile-font");
            if (typeof (mobileFont) != "undefined" && mobileFont != "") {
                var mobileFont = mobileFont;
            } else {
                var mobileFont = "";
            }

            var tabletFont = __current_col_edit.attr("data-tablet-font");
            if (typeof (tabletFont) != "undefined" && tabletFont != "") {
                var tabletFont = tabletFont;
            } else {
                var tabletFont = "";
            }

            var mobileVList = ["select", "none", "12/12", "11/12", "10/12", "9/12", "8/12", "7/12", "6/12", "5/12", "4/12", "3/12", "2/12", "1/12"];
            var selm = $("<select/>", {
                class: "ws-mobile-res"
            });
            for (let i = 0; i < mobileVList.length; i++) {
                if (mobile != "undefined" && mobileVList[i] == mobileView) {
                    selm.append(new Option(mobileVList[i], mobileVList[i], true, true));
                } else {
                    selm.append(new Option(mobileVList[i], mobileVList[i]));
                }
            }
            var selt = $("<select/>", {
                class: "ws-tablet-res"
            });
            for (let i = 0; i < mobileVList.length; i++) {
                if (tabletView != "undefined" && mobileVList[i] == tabletView) {
                    selt.append(new Option(mobileVList[i], mobileVList[i], true, true));
                } else {
                    selt.append(new Option(mobileVList[i], mobileVList[i]));
                }
            }
            var whMob = $("<div/>", {
                class: "ws-mobile-view"
            });
            var mobSize = $("<div/>", {
                class: "ws-mobile-size ws-section-setting no-flex ws-grid"
            });
            var mobFontSize = $("<div/>", {
                class: "ws-mobile-font-size ws-section-setting no-flex ws-grid"
            });
            var mobDisplay = $("<div/>", {
                class: "ws-mobile-display"
            });
            var tab = $("<div/>", {
                class: "ws-tablet-view"
            });
            var tabSize = $("<div/>", {
                class: "ws-tablet-size ws-section-setting no-flex ws-grid"
            });
            var tabFontSize = $("<div/>", {
                class: "ws-tablet-font-size ws-section-setting no-flex ws-grid"
            });
            var tabDisplay = $("<div/>", {
                class: "ws-tablet-display"
            });

            var holder = $("<div/>", {
                class: ""
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
                class: "d-flex d-flex-space"
            });
            mobFontSize.append("<p class=''><span>Font Size</span></p>");
            mobFontHolder.append(mobFontPx);
            mobFontHolder.append("<label class='' for='font-size'>px</label>");
            mobFontSize.append(mobFontHolder);

            var mobShowHide = $("<input/>", {
                id: "md_checkbox_25",
                type: "checkbox",
                class: "filled-in chk-col-light-blue ws-mobile-display ws-set-visibility",
            });

            mobDisplay.append("<p class=''><span>Set Visibility</span></p>");
            var mobDisplayHolder = $("<div/>", { class: "ws-section-setting demo-checkbox" }).append(mobShowHide);
            mobDisplayHolder.append("<label for='md_checkbox_25'>Visibility</label>");
            mobDisplay.append(mobDisplayHolder);

            var holder2 = $("<div/>", {
                class: ""
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
                class: "d-flex d-flex-space"
            });
            tabFontSize.append("<p class=''><span>Font Size</span></p>");
            tabFontHolder.append(tabFontPx);
            tabFontHolder.append("<label class='' for='font-size'>px</label>");
            tabFontSize.append(tabFontHolder);

            var tabShowHide = $("<input/>", {
                id: "md_checkbox_26",
                type: "checkbox",
                class: "filled-in chk-col-light-blue ws-tab-display ws-set-visibility",
            });

            tabDisplay.append("<p class=''><span>Set Visibility</span></p>");
            var tabDisplayHolder = $("<div/>", { class: "ws-section-setting demo-checkbox" }).append(tabShowHide);
            tabDisplayHolder.append("<label for='md_checkbox_26'>Visibility</label>");
            tabDisplay.append(tabDisplayHolder);

            var DisMob = $("<div/>", {
                class: "ws-responsive-view"
            });

            whMob.append(mobSize);
            tab.append(tabSize);
            whMob.append(mobFontSize);
            tab.append(tabFontSize);
            // whMob.append(mobDisplay);
            // tab.append(tabDisplay);
            DisMob.append("<p class='ws-setting-section-heading'><span>Mobile View</span></p>");
            DisMob.append(whMob);
            DisMob.append("<p class='ws-setting-section-heading'><span>Tablet View</span></p>");
            DisMob.append(tab);

            return DisMob;
        }
        function getAlignment() {

            var curCss = __current_col_edit.attr("data-meta-css");
            if (typeof (curCss) != "undefined") {
                curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
            } else {
                curCss = {};
            }
            var alignmentList = ["select", "left", "center", "right", "end", "inherit", "revert", "unset"];
            var sel = $("<select/>", {
                class: "ws-align-text"
            });
            for (let i = 0; i < alignmentList.length; i++) {
                if (curCss["text-align"] != "undefined" && alignmentList[i] == curCss["text-align"]) {
                    sel.append(new Option(alignmentList[i], alignmentList[i], true, true));
                } else {
                    sel.append(new Option(alignmentList[i], alignmentList[i]));
                }
            }

            var wh = $("<div/>", {
                class: "ws-aligment"
            });
            var holder = $("<div/>", {
                class: "ws-section-setting"
            });
            holder.append(sel);
            wh.append("<p class='ws-setting-section-heading'><span>Content Align</span></p>");
            wh.append(holder);
            return wh;

        }
        function borderSetting() {
            var borholder = $("<div/>", {
            });
            var curCss = __current_col_edit.attr("data-meta-css");
            if (typeof (curCss) != "undefined") {
                curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
            } else {
                curCss = {};
            }

            var borList = $("<div/>", {
                class: "ws-border-setting"
            });

            var toggleWidth = $("<div/>", {
                class: "ws-toggleWidth"
            });
            var borderCls = $("<div/>", { class: "ws-borderCls", id: "individualBorder" });
            var firstRows = $("<div/>", { class: "ws-firstRow", id: "" });
            var secRows = $("<div/>", { class: "ws-secRow", id: "" });
            var thirdRows = $("<div/>", { class: "ws-thirdRow", id: "" });
            var fourthRows = $("<div/>", { class: "ws-fourthRow", id: "" });

            /* Border all sides Width */
            var borWidth = $("<div/>", { class: "ws-borWidth ws-section-setting no-flex ws-grid", });
            var slideVal;
            var slider = $("<div/>", { id: "slider", class: "sliderCls border-width" });
            var sliderHandel = $("<div/>", { id: "custom-handle", class: "ui-slider-handle" });
            slider.slider({
                max: 500,
                min: 0,
                create: function () {
                    sliderHandel.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = __current_col_edit.attr("data-meta-css");
                    if (typeof (curCss) != "undefined") {
                        curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
                    } else {
                        curCss = {};
                    }
                    sliderHandel.text(ui.value);
                    slideVal = ui.value;
                    widthPx.val(slideVal);
                    curCss["border-width"] = slideVal + "px";
                    if (settings.version == "inline") {
                        __current_col_edit.css("border-width", slideVal) + "px";
                    }
                    __current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                }
            });
            if (typeof (curCss["border-width"]) != 'undefined') {
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
                // onKeyPress:"if(this.value > 500) return;",
                class: "ws-border-width-set setNumber",
            });

            var allBorDiv = $("<div/>", { class: "ws-allBorDiv", });
            var borLabel = $("<div/>", { class: "ws-borLabel", });
            var borSlider = $("<div/>", { class: "ws-borSlider", });
            var borInput = $("<div/>", { class: "ws-borInput d-flex gap-3", });
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
            var borType = $("<div/>", { class: 'ws-borderStyle ws-section-setting no-flex ws-grid' });
            var bList = ["none", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"];
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
            var borColor = $("<div/>", { class: 'ws-borderColor ws-section-setting no-flex ws-grid' });
            if (typeof (curCss["border-color"]) != 'undefined') {
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
            colorPicker(color);

            /* Border all sides Color */

            //border width
            for (let index = 0; index < 4; index++) {
                let val = "";
                let sliderBW;
                let sliderSideHandel = $("<div/>", { id: "custom-handle", class: "ui-slider-handle" });
                let sliderSide = $("<div/>", { id: "ws_bw_" + index, class: "sliderCls sliderClsws_bw_" + index });
                sliderSide.slider({
                    max: 500,
                    min: 0,
                    create: function () {
                        sliderSideHandel.text($(this).slider("value"));
                    },
                    slide: function (event, ui) {
                        let curCss = __current_col_edit.attr("data-meta-css");
                        if (typeof (curCss) != "undefined") {
                            curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
                        } else {
                            curCss = {};
                        }
                        sliderSideHandel.text(ui.value);
                        val = ui.value;
                        width_i.val(val);
                        let tochange = __borderWidth["ws_bw_" + index];
                        curCss[__borderWidth["ws_bw_" + index]] = val + "px";
                        if (settings.version == "inline") {
                            __current_col_edit.css(tochange, val) + "px";
                        }
                        __current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                    }
                });
                sliderBW = sliderSide.slider();
                if (typeof (curCss) != "undefined") {
                    if (typeof (curCss[__borderWidth["ws_bw_" + index]]) != "undefined") {
                        val = parseInt(curCss[__borderWidth["ws_bw_" + index]], 10);
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    } else {
                        val = 0;
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    }
                }
                let mar_h = $("<div/>", {
                    class: "ws-border-width ws-section-setting no-flex ws-grid"
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
                    class: "ws-border-style ws-section-setting no-flex ws-grid"
                });

                let bList = ["none", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"];
                let sel = $("<select/>", {
                    class: "ws-borderStyle-set",
                    id: "ws_bs_" + index,
                });
                for (let i = 0; i < bList.length; i++) {
                    if (typeof (curCss[__borderStyle["ws_bs_" + index]]) != "undefined" && bList[i] == curCss[__borderStyle["ws_bs_" + index]]) {
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
                    class: "ws-border-color ws-section-setting no-flex ws-grid"
                });

                if (typeof (curCss[__borderColor["ws_bc_" + index]]) != "undefined") {
                    var corTop = curCss[__borderColor["ws_bc_" + index]];
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
                colorPicker(colorTop);
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
            var widthToggleOpt = $("<div/>", { id: "widthToggleOpt", class: "toggleOptCls" });
            var widthToggleBtn = $("<div/>", { id: "widthToggleBtn", });

            widthToggleOpt.append("<span>Target individual border</span>");
            widthToggleBtn.append("<button class='ToggleBtn' id='width-toggle_button'>OFF</button>");

            widthToggleOpt.append(widthToggleBtn);
            toggleWidth.append(widthToggleOpt);

            toggleWidth.append(borderCls);

            var secDiv = $("<div/>", { class: "ws-secDiv" });
            var radCls = $("<div/>", { class: "ws-radCls", id: "individualRadius" });
            var radAll = $("<div/>", { class: "ws-radAll", id: "" });

            /* Border Radius all sides */
            var radAllDiv = $("<div/>", { class: "ws-radAllDiv ws-section-setting no-flex ws-grid", });
            var radSliderVal;
            var slider_r = $("<div/>", { id: "slider_r", class: "sliderCls border-radius" });
            var sliderHandel_r = $("<div/>", { id: "custom-handle", class: "ui-slider-handle" });
            slider_r.slider({
                max: 500,
                min: 0,
                create: function () {
                    sliderHandel_r.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = __current_col_edit.attr("data-meta-css");
                    if (typeof (curCss) != "undefined") {
                        curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
                    } else {
                        curCss = {};
                    }
                    sliderHandel_r.text(ui.value);
                    radSliderVal = ui.value;
                    radiusPx.val(radSliderVal);
                    curCss["border-radius"] = radSliderVal + "px";
                    if (settings.version == "inline") {
                        __current_col_edit.css("border-radius", radSliderVal) + "px";
                    }
                    __current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                }
            });

            if (typeof (curCss["border-radius"]) != 'undefined') {
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

            var allRadDiv = $("<div/>", { class: "ws-allRadDiv", });
            var radLabel = $("<div/>", { class: "labelInput", });
            var radSlider = $("<div/>", { class: "ws-borSlider", });
            var radInput = $("<div/>", { class: "ws-radInput d-flex gap-3", });
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
                let sliderSideHandel = $("<div/>", { id: "custom-handle", class: "ui-slider-handle" });
                let sliderSide = $("<div/>", { id: "ws_br_" + index, class: "sliderCls sliderClsws_br_" + index });
                sliderSide.slider({
                    max: 500,
                    min: 0,
                    create: function () {
                        sliderSideHandel.text($(this).slider("value"));
                    },
                    slide: function (event, ui) {
                        let curCss = __current_col_edit.attr("data-meta-css");
                        if (typeof (curCss) != "undefined") {
                            curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
                        } else {
                            curCss = {};
                        }
                        sliderSideHandel.text(ui.value);
                        val = ui.value;
                        radius_i.val(val);
                        let tochange = __borderRadius["ws_br_" + index];
                        curCss[__borderRadius["ws_br_" + index]] = val + "px";
                        if (settings.version == "inline") {
                            __current_col_edit.css(tochange, val) + "px";
                        }
                        __current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                    }
                });
                sliderR = sliderSide.slider();
                if (typeof (curCss) != "undefined") {
                    if (typeof (curCss[__borderRadius["ws_br_" + index]]) != "undefined") {
                        val = parseInt(curCss[__borderRadius["ws_br_" + index]], 10);
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    } else {
                        val = 0;
                        $(sliderSide).slider("value", val);
                        $(sliderSide).prop("value", val);
                    }
                }
                let mar_h = $("<div/>", {
                    class: "ws-col-radius ws-section-setting no-flex ws-grid"
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

            var radiusToggleOpt = $("<div/>", { id: "radiusToggleOpt", class: "toggleOptCls" });
            var radiusToggleBtn = $("<div/>", { id: "radiusToggleBtn", });
            radiusToggleOpt.append("<span>Target individual radius</span>");
            radiusToggleBtn.append("<button class='ToggleBtn' id='radius-toggle_button'>OFF</button>");
            radiusToggleOpt.append(radiusToggleBtn);
            secDiv.append(radAll);
            secDiv.append(radiusToggleOpt);
            secDiv.append(radCls);
            borholder.append(secDiv);
            return borholder;
        }
        function boxShadowSetting() {
            var boxShadowHolder = $("<div/>", {
            });
            var boxShadowList = $("<div/>", {
                class: "ws-boxShadow-setting"
            });
            var firstRowShadow = $("<div/>", { class: "ws-firstRowShadow", });
            var secRowShadow = $("<div/>", { class: "ws-secRowShadow", });
            var thirdRowShadow = $("<div/>", { class: "ws-thirdRowShadow", });
            var curCss = __current_col_edit.attr("data-meta-css");
            if (typeof (curCss) != "undefined") {
                curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
            } else {
                curCss = {};
            }

            // Horizontal Offset
            var horizShadowList = $("<div/>", {
                class: "ws-horiz-shadow-setting ws-section-setting no-flex ws-grid"
            });

            var horizShadow = $("<div/>", { class: "ws-horizShadow", });
            var slideHorizVal;
            var sliderHoriz = $("<div/>", { id: "radiusBox", class: "sliderCls box-shadow-horizontal" });
            var sliderHorizHandel = $("<div/>", { id: "custom-handle", class: "ui-slider-handle" });
            sliderHoriz.slider({
                max: 500,
                min: -500,
                create: function () {
                    sliderHorizHandel.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = __current_col_edit.attr("data-meta-css");
                    if (typeof (curCss) != "undefined") {
                        curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
                    } else {
                        curCss = {};
                    }
                    sliderHorizHandel.text(ui.value);
                    slideHorizVal = ui.value;
                    HorizOffsetPx.val(slideHorizVal);
                    curCss["box-shadow-horizontal"] = slideHorizVal + "px";
                    var boxShadowValue =
                        (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : '') +
                        (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : '') +
                        (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : '') +
                        (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : '') +
                        color.val();
                    curCss["box-shadow"] = boxShadowValue;
                    if (settings.version == "inline") {
                        __current_col_edit.css("box-shadow-horizontal", slideHorizVal) + "px";
                        __current_col_edit.css("box-shadow", boxShadowValue);
                    }
                    __current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                }
            });
            if (typeof (curCss["box-shadow-horizontal"]) != 'undefined') {
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

            var horizDiv = $("<div/>", { class: "ws-horizDiv", });
            var horizLabel = $("<div/>", { class: "ws-horizLabel", });
            var horizSlider = $("<div/>", { class: "ws-borSlider", });
            var horizInput = $("<div/>", { class: "ws-horizInput d-flex gap-3", });
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
                class: "ws-vert-shadow-setting ws-section-setting no-flex ws-grid"
            });

            var vertShadow = $("<div/>", { class: "ws-vertShadow", });
            var slidevertVal;
            var slidervert = $("<div/>", { id: "radiusBox", class: "sliderCls box-shadow-vertical" });
            var slidervertHandel = $("<div/>", { id: "custom-handle", class: "ui-slider-handle" });
            slidervert.slider({
                max: 500,
                min: -500,
                create: function () {
                    slidervertHandel.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = __current_col_edit.attr("data-meta-css");
                    if (typeof (curCss) != "undefined") {
                        curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
                    } else {
                        curCss = {};
                    }
                    slidervertHandel.text(ui.value);
                    slidevertVal = ui.value;
                    vertOffsetPx.val(slidevertVal);
                    curCss["box-shadow-vertical"] = slidevertVal + "px";
                    var boxShadowValue =
                        (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : '') +
                        (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : '') +
                        (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : '') +
                        (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : '') +
                        color.val();
                    curCss["box-shadow"] = boxShadowValue;
                    if (settings.version == "inline") {
                        __current_col_edit.css("box-shadow-vertical", slidevertVal) + "px";
                        __current_col_edit.css("box-shadow", boxShadowValue);
                    }
                    __current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                }
            });
            if (typeof (curCss["box-shadow-vertical"]) != 'undefined') {
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

            var vertDiv = $("<div/>", { class: "ws-vertDiv", });
            var vertLabel = $("<div/>", { class: "ws-vertLabel", });
            var vertSlider = $("<div/>", { class: "ws-borSlider", });
            var vertInput = $("<div/>", { class: "ws-vertInput d-flex gap-3", });
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
                class: "ws-blur-shadow-setting ws-section-setting no-flex ws-grid"
            });

            var blurShadow = $("<div/>", { class: "ws-blurShadow", });
            var slideblurVal;
            var sliderblur = $("<div/>", { id: "radiusBox", class: "sliderCls box-shadow-blur" });
            var sliderblurHandel = $("<div/>", { id: "custom-handle", class: "ui-slider-handle" });
            sliderblur.slider({
                max: 500,
                min: 0,
                create: function () {
                    sliderblurHandel.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = __current_col_edit.attr("data-meta-css");
                    if (typeof (curCss) != "undefined") {
                        curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
                    } else {
                        curCss = {};
                    }
                    sliderblurHandel.text(ui.value);
                    slideblurVal = ui.value;
                    blurOffsetPx.val(slideblurVal);
                    curCss["box-shadow-blur"] = slideblurVal + "px";
                    var boxShadowValue =
                        (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : '') +
                        (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : '') +
                        (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : '') +
                        (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : '') +
                        color.val();
                    curCss["box-shadow"] = boxShadowValue;
                    if (settings.version == "inline") {
                        __current_col_edit.css("box-shadow-blur", slideblurVal) + "px";
                        __current_col_edit.css("box-shadow", boxShadowValue);
                    }
                    __current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                }
            });
            if (typeof (curCss["box-shadow-blur"]) != 'undefined') {
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

            var blurDiv = $("<div/>", { class: "ws-blurDiv", });
            var blurLabel = $("<div/>", { class: "ws-blurLabel", });
            var blurSlider = $("<div/>", { class: "ws-borSlider", });
            var blurInput = $("<div/>", { class: "ws-blurInput d-flex gap-3", });
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
                class: "ws-spread-shadow-setting ws-section-setting no-flex ws-grid"
            });

            var spreadShadow = $("<div/>", { class: "ws-spreadShadow", });
            var slidespreadVal;
            var sliderspread = $("<div/>", { id: "radiusBox", class: "sliderCls box-shadow-spread" });
            var sliderspreadHandel = $("<div/>", { id: "custom-handle", class: "ui-slider-handle" });
            sliderspread.slider({
                max: 500,
                min: -500,
                create: function () {
                    sliderspreadHandel.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = __current_col_edit.attr("data-meta-css");
                    if (typeof (curCss) != "undefined") {
                        curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
                    } else {
                        curCss = {};
                    }
                    sliderspreadHandel.text(ui.value);
                    slidespreadVal = ui.value;
                    spreadOffsetPx.val(slidespreadVal);
                    curCss["box-shadow-spread"] = slidespreadVal + "px";
                    var boxShadowValue =
                        (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : '') +
                        (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : '') +
                        (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : '') +
                        (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : '') +
                        color.val();
                    curCss["box-shadow"] = boxShadowValue;
                    if (settings.version == "inline") {
                        __current_col_edit.css("box-shadow-spread", slidespreadVal) + "px";
                        __current_col_edit.css("box-shadow", boxShadowValue);
                    }
                    __current_col_edit.attr("data-meta-css", JSON.stringify(curCss));
                }
            });
            if (typeof (curCss["box-shadow-spread"]) != 'undefined') {
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

            var spreadDiv = $("<div/>", { class: "ws-spreadDiv", });
            var spreadLabel = $("<div/>", { class: "ws-spreadLabel", });
            var spreadSlider = $("<div/>", { class: "ws-borSlider", });
            var spreadInput = $("<div/>", { class: "ws-spreadInput d-flex gap-3", });
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
                class: "ws-opac-shadow-setting ws-section-setting no-flex ws-grid"
            });

            var opacShadow = $("<div/>", { class: "ws-opacShadow", });
            var slideopacVal;
            var slideropac = $("<div/>", { id: "radiusBox", class: "sliderCls box-shadow-opacity" });
            var slideropacHandel = $("<div/>", { id: "custom-handle", class: "ui-slider-handle" });
            slideropac.slider({
                max: 1.0,
                min: 0.0,
                step: 0.1,
                create: function () {
                    slideropacHandel.text($(this).slider("value"));
                },
                slide: function (event, ui) {
                    var curCss = __current_col_edit.attr("data-meta-css");
                    if (typeof (curCss) != "undefined") {
                        curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
                    } else {
                        curCss = {};
                    }
                    slideropacHandel.text(ui.value);
                    slideopacVal = ui.value;
                    opacOffsetPx.val(slideopacVal);
                    var rgbaString = curCss["box-shadow-color"];
                    if (rgbaString) {
                        var rgbaArray = rgbaString.slice(5, -1).split(',');
                        rgbaArray[3] = slideopacVal;
                        var updatedRgbaString = 'rgba(' + rgbaArray[0] + ',' + rgbaArray[1] + ',' + rgbaArray[2] + ',' + rgbaArray[3] + ')';
                        curCss["box-shadow-color"] = updatedRgbaString;
                        color.val(updatedRgbaString);
                    }
                    curCss["box-shadow-opacity"] = slideopacVal;
                    var boxShadowValue =
                        (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : '') +
                        (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : '') +
                        (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : '') +
                        (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : '') +
                        color.val();
                    curCss["box-shadow"] = boxShadowValue;
                    if (settings.version == "inline") {
                        __current_col_edit.css("box-shadow-opacity", slideopacVal);
                        __current_col_edit.css("box-shadow", boxShadowValue);
                    }
                    __current_col_edit.attr("data-meta-css", JSON.stringify(curCss))
                }
            });
            if (typeof (curCss["box-shadow-opacity"]) != 'undefined') {
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

            var opacDiv = $("<div/>", { class: "ws-opacDiv", });
            var opacLabel = $("<div/>", { class: "ws-opacLabel", });
            var opacSlider = $("<div/>", { class: "ws-borSlider", });
            var opacInput = $("<div/>", { class: "ws-opacInput d-flex gap-3", });
            opacLabel.append("<p class='ws-setting-border-heading'><span>Shadow Color opacity</span></p>");
            opacInput.append(opacOffsetPx);
            slideropac.append(slideropacHandel);
            opacSlider.append(slideropac);
            opacDiv.append(opacLabel);
            opacLabel.append(opacInput);
            opacDiv.append(opacSlider);
            opacShadow.append(opacDiv);
            opacShadowList.append(opacShadow);

            var shadowColor = $("<div/>", { class: 'ws-borderColor ws-section-setting no-flex ws-grid' });
            if (typeof (curCss["box-shadow-color"]) != 'undefined') {
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
            shadowColor.append("<p class='ws-setting-border-heading'><span>Shadow Color</span></p>");
            shadowColor.append(color);

            var insetShadowList = $("<div/>", {
                class: "ws-inset-shadow-setting ws-section-setting no-flex ws-grid"
            });
            var insetBtn = $("<div/>", {
                class: "ws-insetBtn-setting"
            });
            var switchBtn = $("<div/>", {
                class: "switch"
            });
            switchBtn.append("<label>Outline<input type='checkbox' class='ws-toggleBtn'><span class='lever'></span>Inset</label>");
            insetBtn.append(switchBtn);
            insetShadowList.append(insetBtn);

            // Apply box-shadow on change
            $("body").on("change", ".ws-toggleBtn", function (e) {
                e.stopImmediatePropagation();
                var metaCss = __current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof (metaCss) != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if ($(this).is(':checked')) {
                    var boxShadowValue =
                        "inset" + " " +
                        (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : '') +
                        (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : '') +
                        (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : '') +
                        (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : '') +
                        color.val();
                    metaCss1["box-shadow"] = boxShadowValue;
                } else {
                    var boxShadowValue =
                        (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : '') +
                        (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : '') +
                        (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : '') +
                        (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : '') +
                        color.val();

                    metaCss1["box-shadow"] = boxShadowValue;
                }
                if (settings.version == "inline") {
                    __current_col_edit.css("box-shadow", boxShadowValue);
                }
                __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));
            });
            $("body").on("change", ".ws-boxshadow-set", function (e) {
                e.stopImmediatePropagation();
                let el = $(e.currentTarget);
                var tochange = el.attr("id");
                let slider = $("." + tochange);
                $(slider).slider("value", $(this).val());
                $(slider).prop("value", $(this).val());

                var metaCss = __current_col_edit.attr("data-meta-css");
                if (metaCss != "" && typeof (metaCss) != "undefined") {
                    var metaCss1 = JSON.parse(metaCss);
                } else {
                    var metaCss1 = {};
                }
                if (tochange == 'box-shadow-opacity') {
                    var rgbaString = metaCss1["box-shadow-color"];
                    if (rgbaString) {
                        var rgbaArray = rgbaString.slice(5, -1).split(',');
                        rgbaArray[3] = $(this).val();
                        var updatedRgbaString = 'rgba(' + rgbaArray[0] + ',' + rgbaArray[1] + ',' + rgbaArray[2] + ',' + rgbaArray[3] + ')';
                        metaCss1["box-shadow-color"] = updatedRgbaString;
                        color.val(updatedRgbaString);
                    }
                }
                if (tochange == 'box-shadow-color') {
                    var boxOpac = metaCss1["box-shadow-opacity"];
                    var rgbaString = el.val();
                    if (rgbaString) {
                        var rgbaArray = rgbaString.slice(5, -1).split(',');
                        rgbaArray[3] = boxOpac ? boxOpac : ' 1';
                        var updatedRgbaString = 'rgba(' + rgbaArray[0] + ',' + rgbaArray[1] + ',' + rgbaArray[2] + ',' + rgbaArray[3] + ')';
                        metaCss1["box-shadow-color"] = updatedRgbaString;
                        color.val(updatedRgbaString);
                        metaCss1["box-shadow-color"] = updatedRgbaString;
                    }
                }
                if (el.val() == "") {
                    delete metaCss1[tochange];
                } else {
                    if (tochange == 'box-shadow-color' || tochange == 'box-shadow-opacity') {
                        metaCss1[tochange] = el.val();
                    } else {
                        metaCss1[tochange] = el.val() + "px";
                    }
                }
                var boxShadowValue =
                    (HorizOffsetPx.val() ? HorizOffsetPx.val() + "px " : '') +
                    (vertOffsetPx.val() ? vertOffsetPx.val() + "px " : '') +
                    (blurOffsetPx.val() ? blurOffsetPx.val() + "px " : '') +
                    (spreadOffsetPx.val() ? spreadOffsetPx.val() + "px " : '') +
                    color.val();
                metaCss1["box-shadow"] = boxShadowValue;

                if (settings.version == "inline") {
                    if (tochange == 'box-shadow-color' || tochange == 'box-shadow-opacity') {
                        __current_col_edit.css(tochange, el.val());
                    } else {
                        __current_col_edit.css(tochange, el.val() + "px");
                    }
                    __current_col_edit.css("box-shadow", boxShadowValue);
                }
                __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));

            });

            if (typeof (curCss["box-shadow"]) !== 'undefined') {
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
            colorPicker(color);
            return boxShadowHolder;
        }
        function backgroundSetting(isImage) {

            var backList = $("<div/>", {
                class: "ws-background-setting"
            });
            var curCss = __current_col_edit.attr("data-meta-css");
            if (typeof (curCss) != "undefined") {
                curCss = JSON.parse(__current_col_edit.attr("data-meta-css"));
            } else {
                curCss = {};
            }
            if (typeof (curCss["color"]) != 'undefined') {
                var corr = curCss["color"];
            } else {
                var corr = "#000000";
            }
            if (typeof (curCss["background-image"]) != 'undefined') {
                var bgimg = curCss["background-image"];
                var result = bgimg.replace(/^url\((.*?)\)$/, '$1');
                bgimg = result;
            } else {
                var bgimg = "";
            }

            var iscolor = $("<input/>", {
                id: "md_checkbox_27",
                type: "checkbox",
                class: "filled-in chk-col-light-blue ws-picker-bgcheck",
            });

            if (typeof (curCss["background"]) != 'undefined') {
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
                    class: "btn loadMedia",
                    type: "button",
                    value: 'Media',
                    name: "Media",
                    "data-change": "ws-bg-image",
                    "data-toggle": "modal",
                    "data-target": "#" + mediaModel,
                });

                var bgPosList = ["select", "center", "inherit", "initial", "left", "revert", "revert-layer", "right", "unset"];
                var selx = $("<select/>", {
                    class: "ws-bg-x"
                });
                for (let i = 0; i < bgPosList.length; i++) {
                    if (typeof (curCss["background-position-x"]) != "undefined" && bgPosList[i] == curCss["background-position-x"]) {
                        selx.append(new Option(bgPosList[i], bgPosList[i], true, true));
                    } else {
                        selx.append(new Option(bgPosList[i], bgPosList[i]));
                    }
                }
                var bgPosListY = ["select", "center", "inherit", "initial", "top", "revert", "revert-layer", "bottom", "unset"];
                var sely = $("<select/>", {
                    class: "ws-bg-y"
                });
                for (let i = 0; i < bgPosListY.length; i++) {
                    if (typeof (curCss["background-position-y"]) != "undefined" && bgPosListY[i] == curCss["background-position-y"]) {
                        sely.append(new Option(bgPosListY[i], bgPosListY[i], true, true));
                    } else {
                        sely.append(new Option(bgPosListY[i], bgPosListY[i]));
                    }
                }

                var bgsize = ["select", "auto", "contain", "cover", "inherit", "initial", "revert", "unset"];
                var selsize = $("<select/>", {
                    class: "ws-bg-size"
                });
                for (let i = 0; i < bgsize.length; i++) {
                    if (typeof (curCss["background-size"]) != "undefined" && bgsize[i] == curCss["background-size"]) {
                        selsize.append(new Option(bgsize[i], bgsize[i], true, true));
                    } else {
                        selsize.append(new Option(bgsize[i], bgsize[i]));
                    }
                }

                var bgAttach = ["select", "fixed", "local", "scroll", "inherit", "initial", "revert", "revert-layer", "unset"];
                var selAttach = $("<select/>", {
                    class: "ws-bg-attach"
                });
                for (let i = 0; i < bgAttach.length; i++) {
                    if (typeof (curCss["background-attachment"]) != "undefined" && bgAttach[i] == curCss["background-attachment"]) {
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
                if (typeof (curCss["background-repeat"]) != "undefined" && curCss["background-repeat"] != "" && curCss["background-repeat"] == "repeat") {
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
            var holderc = $("<div/>", { class: "ws-section-setting demo-checkbox" }).append(iscolor);
            holderc.append("<label for='md_checkbox_27'>None background</label>");
            backList.append(holderc);

            if (isImage == true) {
                backList.append("<br/><p class='ws-setting-section-heading'><span>Background image</span></p>");
                var holder = $("<div/>", { class: "ws-section-setting" }).append(img);
                backList.append(holder);

                var bgMedia = $("<div/>", { class: "ws-section-setting" }).append(uploadButton);
                backList.append(bgMedia);

                backList.append("<br/><p class='ws-setting-section-heading'><span>Background poition x</span></p>");
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
                var holder5 = $("<div/>", { class: "ws-section-setting demo-checkbox" }).append(selrepeat);
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
            colorPicker(color);
            colorPicker(txtcolor);

            if (curCss["background"] == 'none') {
                var bgcheck = holderc.find(".ws-picker-bgcheck");
                bgcheck.prop("checked", true);
            } else {
                var bgcheck = holderc.find(".ws-picker-bgcheck");
                bgcheck.prop("checked", false);
            }
            return backList;
        }
        function colorPicker(obj) {

            obj.minicolors({
                format: "rgb",
                opacity: true,
                change: function (value, opacity) {
                    if (!value) return;
                    if (opacity) value += ', ' + opacity;
                    if (typeof console === 'object') {
                    }
                },
                theme: 'bootstrap'
            });
        }

        settings.nextbtn.on("click", showNextImage);
        // ADD SELECTED ELEMENT
        $("body").on("click", ".ws-dash-element-list", function (e) {
            var doDrag = $(e.currentTarget).attr("data-act");
            if (typeof (doDrag) == "undefined") {
                if ($(e.currentTarget).attr("data-type") != "row") {
                    // THE PREVIEW IS DEFINED IN setItemPreview() FUNCTION
                    let ht = setItemPreview($(e.currentTarget).attr("data-type"));
                    if (!$(activeElement).is(":empty")) {
                        $(activeElement).find(".col-action.default").remove();
                    }
                    $(activeElement).append(ht);
                    setupDropable();
                    closeOverlay();
                }
            }
        });

        $("body").on("mousedown mouseup", '.ws-plus', function (e) {
            var tl = $(e.currentTarget).parent();
            if (e.type == "mousedown") {
                evt = setInterval(function () {
                    let s = 0;
                    let t = tl.find("input");
                    if (t.val() != "") {
                        s = parseInt(t.val());
                    }
                    t.val(s + 1);
                }, 50);
            }
            if (e.type != "mousedown") {
                clearInterval(evt);
            }
        });

        $("body").on("mousedown mouseup", '.ws-minus', function (e) {
            var tl = $(e.currentTarget).parent();
            if (e.type == "mousedown") {
                evt = setInterval(function () {
                    let s = 0;
                    let t = tl.find("input");
                    if (t.val() != "") {
                        s = parseInt(t.val());
                    }
                    t.val(s - 1);
                }, 50);
            }
            if (e.type != "mousedown") {
                clearInterval(evt);
            }
        });

        $("body").on("click", 'a[data-toggle="tab"]', function (e) {
            e.preventDefault()
            $(this).tab('show');
        });
        // ADD NEW BLANK ROW
        $("body").on("click", ".addRow", function (e) {
            e.stopImmediatePropagation();
            $(".ws-dashboard-playground").append(setItemPreview("row"));
            // $( ".ws-dashboard-playground" ).sortable({
            //     items: '.rowData',
            // });
            setupDropable();
        });
        // CLOSE OVERLAY 
        $("body").on("click", ".ws_close_overlay", function (e) {
            closeOverlay();
        });
        // COLUMNS HEADER ACTIONS 
        $("body").on("click", ".col-action", function (e) {
            e.stopImmediatePropagation();
            var act = $(this).attr("data-action");
            switch (act) {
                case "edit": {
                    editColSetting(e);
                    break;
                }
                case "add": {
                    addColElm(e, "col");
                    break;
                }
                case "minimize": {
                    minimizeCol(e);
                }
                default:
                    break;
            }

        });
        // ROW HEADER ACTIONS 
        $("body").on("click", ".row-action", function (e) {
            e.stopImmediatePropagation();
            var act = $(this).attr("data-action");
            switch (act) {
                case "edit": {
                    if ($(this).attr("data-type") == 'row') {
                        editRowSetting(e);
                    } else {
                        editSecSetting(e);
                    }
                    break;
                }
                case "delete": {
                    deleteRow(e);
                    break;
                }
                case "minimize": {
                    minimize(e);
                    break;
                }
                case "copy": {
                    copyRow(e);
                    break;
                }
                case "clipboardCopy": {
                    clipboardCopy(e);
                    break;
                }
                default:
                    break;
            }

        });
        // arrange the columns
        $("body").on("click", ".col-type-select", function (e) {
            e.stopImmediatePropagation();
            var columntype = $(this).data("column");
            if (typeof (columntype) != "undefined") {
                var rowSection = $(this).closest(".rowData");
                var innerwrapper = rowSection.find(".ws-element-wrapper");
                performColumnsArrgements(innerwrapper, columntype);
                // $(".ws-row-col").droppable( {
                //     hoverClass: "ws-hovered",
                //     drop: handleDropEvent
                // });
                setupDropable();
                // $( ".ws-element-wrapper" ).sortable({
                //     items: '.ws-row-col',
                // });
            }
        });
        $("body").on("click", ".columnsAdded", function (e) {
            e.stopImmediatePropagation();
            var doDrag = $(e.currentTarget).attr("data-act");
            if (typeof (doDrag) == "undefined") {
                if ($(e.currentTarget).attr("data-type") != "row") {
                    // let ht = setItemPreview($(e.currentTarget).attr("data-type"));
                    if (!$(activeElement).is(":empty")) {
                        $(activeElement).find(".col-action.default").remove();
                    }
                    closeOverlay();
                }
            }
            var columntype = $(this).data("column");
            if (typeof (columntype) != "undefined") {
                var rowName = "ws-row-data-" + new Date().valueOf();
                let rnl = $("<div>", {
                    id: rowName,
                    class: "ws-element-wrapper ws-dropable-items extraColumns"
                })
                performColumnsArrgements(rnl, columntype);
                $(activeElement).append(rnl);
                setupDropable();
            }
        });
        $("body").on("click", ".first-column-add", function (e) {
            e.stopImmediatePropagation();

            var rowSection = $(this).closest(".rowData");
            //var rowNo = rowSection.attr("data-count");
            var innerwrapper = rowSection.find(">div.ws-element-wrapper");
            //performColumnsArrgements(innerwrapper,columntype);
            innerwrapper.append(setItemPreview("row", true));
            rowSection.find(".first-column-add.default").remove();


            // $( ".ws-element-wrapper" ).sortable({
            //     items: '.rowDataInner',
            // });

            setupDropable();

        });

        // adjust controlls on screen to edit elements
        $("body").on("mouseover", ".ws-data-element", function (e) {
            // e.stopImmediatePropagation();
            // var rect = e.target.getBoundingClientRect();
            // var x = e.clientX - rect.left;
            // var y = e.clientY - rect.top;
            // console.log("Left? : " + x + " ; Top? : " + y + ".");
            // var eTop = $(e.currentTarget).offset().top; //get the offset top of the element
            // var newy = $(window).scrollTop() - eTop;

            // var yy = $(window).scrollTop();
            // console.log(" ; Top? : " + eTop + ".   "+yy);
            // $(e.currentTarget).find(".elm-action").css("top",eTop);

        });


        function showNextImage() {
            settings.setupPlayground.call();
        }
        /*
            income
            overduePayment
            revenue_by_product
            account_balance
            expenses
            revenue_by_customer_top_30
            top_10_customers
            outstanding
            income_and_expenses
            revenue_by_projects_top_30
            profit_and_loss
            vendors_payments
        */
        // ELEMENTS [FINANCE]
        __elementsfn['income'] = function () {
            playgroundElements.find(".dash-element-list #Finance").append("<span class='ws-dash-element-list' data-type='income'><div class='text'><div class='title'>Income</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['overduePayment'] = function () {
            playgroundElements.find(".dash-element-list #Finance ").append("<span class='ws-dash-element-list' data-type='overduePayment'><div class='text'><div class='title'>Overdue Payments</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['revenue_by_product'] = function () {
            playgroundElements.find(".dash-element-list #Finance").append("<span class='ws-dash-element-list' data-type='revenue_by_product'><div class='text'><div class='title'>Revenue By Product</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['account_balance'] = function () {
            playgroundElements.find(".dash-element-list #Finance").append("<span class='ws-dash-element-list' data-type='account_balance'><div class='text'><div class='title'>Account Balance</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['expenses'] = function () {
            playgroundElements.find(".dash-element-list #Finance").append("<span class='ws-dash-element-list' data-type='expenses'><div class='text'><div class='title'>Expenses</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['revenue_by_customer_top_30'] = function () {
            playgroundElements.find(".dash-element-list #Finance").append("<span class='ws-dash-element-list' data-type='revenue_by_customer_top_30'><div class='text'><div class='title'>Revenue By Customer s Top 30</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['top_10_customers'] = function () {
            playgroundElements.find(".dash-element-list #Finance").append("<span class='ws-dash-element-list' data-type='top_10_customers'><div class='text'><div class='title'>Top 10 Customers</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['outstanding'] = function () {
            playgroundElements.find(".dash-element-list #Finance").append("<span class='ws-dash-element-list' data-type='outstanding'><div class='text'><div class='title'>Outstandings</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['income_and_expenses'] = function () {
            playgroundElements.find(".dash-element-list #Finance").append("<span class='ws-dash-element-list' data-type='income_and_expenses'><div class='text'><div class='title'>Income And Expenses</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['revenue_by_projects_top_30'] = function () {
            playgroundElements.find(".dash-element-list #Finance").append("<span class='ws-dash-element-list' data-type='revenue_by_projects_top_30'><div class='text'><div class='title'>Revenue By Projects Top 30</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['profit_and_loss'] = function () {
            playgroundElements.find(".dash-element-list #Finance").append("<span class='ws-dash-element-list' data-type='profit_and_loss'><div class='text'><div class='title'>Profit And Loss</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['vendors_payments'] = function () {
            playgroundElements.find(".dash-element-list #Finance").append("<span class='ws-dash-element-list' data-type='vendors_payments'><div class='text'><div class='title'>Vendors Payments</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        /*
           task_list
           task_completion_ratio
           project_wise_task_statistics
           customer_wise_task_statistics
           assignee_wise_task_statistics
           priority_wise_task_statistics
           task_completion_ratio_assignee_wise
       */
        // ELEMENTS [TASKS]
        __elementsfn['task_list'] = function () {
            playgroundElements.find(".dash-element-list #Tasks").append("<span class='ws-dash-element-list' data-type='task_list'><div class='text'><div class='title'>Task List</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['task_completion_ratio'] = function () {
            playgroundElements.find(".dash-element-list #Tasks").append("<span class='ws-dash-element-list' data-type='task_completion_ratio'><div class='text'><div class='title'>Task Completion Ratio</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['project_wise_task_statistics'] = function () {
            playgroundElements.find(".dash-element-list #Tasks").append("<span class='ws-dash-element-list' data-type='project_wise_task_statistics'><div class='text'><div class='title'>Project Wise Task Statistics</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['customer_wise_task_statistics'] = function () {
            playgroundElements.find(".dash-element-list #Tasks").append("<span class='ws-dash-element-list' data-type='customer_wise_task_statistics'><div class='text'><div class='title'>Customer Wise Task Statistic</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['assignee_wise_task_statistics'] = function () {
            playgroundElements.find(".dash-element-list #Tasks").append("<span class='ws-dash-element-list' data-type='assignee_wise_task_statistics'><div class='text'><div class='title'>Assignee Wise Task Statistics</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['priority_wise_task_statistics'] = function () {
            playgroundElements.find(".dash-element-list #Tasks").append("<span class='ws-dash-element-list' data-type='priority_wise_task_statistics'><div class='text'><div class='title'>Priority Wise Task Statistics</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['task_completion_ratio_assignee_wise'] = function () {
            playgroundElements.find(".dash-element-list #Tasks").append("<span class='ws-dash-element-list' data-type='task_completion_ratio_assignee_wise'><div class='text'><div class='title'>Task Completion Ratio Assignee Wise</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        /*
            projects_statistics
            project_status_wise_list
            client_wise_projects_list
        */
        // ELEMENTS [PROJECTS]
        __elementsfn['projects_statistics'] = function () {
            playgroundElements.find(".dash-element-list #Projects").append("<span class='ws-dash-element-list' data-type='projects_statistics'><div class='text'><div class='title'>Projects Statistics</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['project_status_wise_list'] = function () {
            playgroundElements.find(".dash-element-list #Projects").append("<span class='ws-dash-element-list' data-type='project_status_wise_list'><div class='text'><div class='title'>Project Status Wise List</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['client_wise_projects_list'] = function () {
            playgroundElements.find(".dash-element-list #Projects").append("<span class='ws-dash-element-list' data-type='client_wise_projects_list'><div class='text'><div class='title'>Client Wise Projects List</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        /*
             stages_wise_list
             unattended_leads
             lead_conversion_ratio
             priority_wise_list
             pending_followups
             lead_generation_flow_list
             source_wise_list
             upcoming_followups
         */
        // ELEMENTS [LEADS]
        __elementsfn['stages_wise_list'] = function () {
            playgroundElements.find(".dash-element-list #Leads").append("<span class='ws-dash-element-list' data-type='stages_wise_list'><div class='text'><div class='title'>Stages Wise List</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['unattended_leads'] = function () {
            playgroundElements.find(".dash-element-list #Leads").append("<span class='ws-dash-element-list' data-type='unattended_leads'><div class='text'><div class='title'>Unattended Leads</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['lead_conversion_ratio'] = function () {
            playgroundElements.find(".dash-element-list #Leads").append("<span class='ws-dash-element-list' data-type='lead_conversion_ratio'><div class='text'><div class='title'>Lead Conversion Ratio</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['priority_wise_list'] = function () {
            playgroundElements.find(".dash-element-list #Leads").append("<span class='ws-dash-element-list' data-type='priority_wise_list'><div class='text'><div class='title'>Priority Wise List</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['pending_followups'] = function () {
            playgroundElements.find(".dash-element-list #Leads").append("<span class='ws-dash-element-list' data-type='pending_followups'><div class='text'><div class='title'>Pending Followups</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['lead_generation_flow_list'] = function () {
            playgroundElements.find(".dash-element-list #Leads").append("<span class='ws-dash-element-list' data-type='lead_generation_flow_list'><div class='text'><div class='title'>Lead Generation Flow List</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['source_wise_list'] = function () {
            playgroundElements.find(".dash-element-list #Leads").append("<span class='ws-dash-element-list' data-type='source_wise_list'><div class='text'><div class='title'>Source Wise List</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['upcoming_followups'] = function () {
            playgroundElements.find(".dash-element-list #Leads").append("<span class='ws-dash-element-list' data-type='upcoming_followups'><div class='text'><div class='title'>Upcoming Followups</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        /*
           status_wise_list
           assignee_wise_list
           priority_wise_list
           customer_wise_list
       */
        // ELEMENTS [TICKETS] 
        __elementsfn['status_wise_list'] = function () {
            playgroundElements.find(".dash-element-list #Tickets").append("<span class='ws-dash-element-list' data-type='status_wise_list'><div class='text'><div class='title'>Status Wise List</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['assignee_wise_list'] = function () {
            playgroundElements.find(".dash-element-list #Tickets").append("<span class='ws-dash-element-list' data-type='assignee_wise_list'><div class='text'><div class='title'>Assignee Wise List</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['priority_wise_list'] = function () {
            playgroundElements.find(".dash-element-list #Tickets").append("<span class='ws-dash-element-list' data-type='priority_wise_list'><div class='text'><div class='title'>Priority Wise List</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        __elementsfn['customer_wise_list'] = function () {
            playgroundElements.find(".dash-element-list #Tickets").append("<span class='ws-dash-element-list' data-type='customer_wise_list'><div class='text'><div class='title'>Customer Wise List</div><div class='ws_second-info'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s standard dummy text ever since the 1500s</div></div></span>");
            // setupDragable();
        };
        // ELEMENTS [CUSTOM MODULE]
        __elementsfn['heading'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='heading'><div class='icon'><span class='material-icons'>h_mobiledata</span></div><div class='text'>Heading</div></span>");
            setupDragable();
        };
        __elementsfn['paragraph'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='paragraph'><div class='icon text'><span class='material-icons'>title</span></div><div class='text'><div class='title'>Text Block</div><div class='ws_second-info'>A block of text with WYSIWYG editor</div></div></span>");
            // setupDragable();
        };
        __elementsfn['image'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='image'><div class='icon'><span class='insert_photo'></span></div><div class='text'><div class='title'>Single Image</div><div class='ws_second-info'>Single image with Animation</div></div></span>");
            // setupDragable();
        };
        __elementsfn['button'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='button'><div class='icon'><span class='insert_button'></span></div><div class='text'><div class='title'>Button</div><div class='ws_second-info'>Add Custom Button</div></div></span>");
            // setupDragable();
        };
        __elementsfn['link'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='link'><div class='icon'><span class='insert_link'></span></div><div class='text'><div class='title'>Link</div><div class='ws_second-info'>Add Custom Link</div></div></span>");
            // setupDragable();
        };
        __elementsfn['video'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='video'><div class='icon'><span class='insert_video'></span></div><div class='text'><div class='title'>Single Video</div><div class='ws_second-info'>Single Video with Animation</div></div></span>");
            // setupDragable();
        };
        __elementsfn['social'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='social'><div class='icon'><span class='insert_soical'></span></div><div class='text'><div class='title'>Social Handels</div><div class='ws_second-info'>Add soical handels</div></div></span>");
            // setupDragable();
        };
        __elementsfn['customHtml'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='customHtml'><div class='icon'><span class='insert_html'></span></div><div class='text'><div class='title'>Custom HTML</div><div class='ws_second-info'>Add Custom HTML</div></div></span>");
            // setupDragable();
        };
        __elementsfn['headingTag'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='headingTag'><div class='icon'><span class='insert_tag'></span></div><div class='text'><div class='title'>Heading Tag</div><div class='ws_second-info'>Add Heading Tag</div></div></span>");
            // setupDragable();
        };
        __elementsfn['carousel'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='carousel'><div class='icon'><span class='insert_carousel'></span></div><div class='text'><div class='title'>Display Item</div><div class='ws_second-info'>Add Carousel/Accordion</div></div></span>");
            // setupDragable();
        };
        __elementsfn['twoColumns'] = function () {
            playgroundElements.find(".element-list").append("<span class='columnsAdded col-type col-type-2' data-type='twoColumns' data-column='col-2'><div class='icon'><span class='insert_twoColumns'></span></div><div class='text'><div class='title'>Two Columns</div><div class='ws_second-info'>Add Two Columns</div></div></span>");
            // setupDragable();
        };
        __elementsfn['threeColumns'] = function () {
            playgroundElements.find(".element-list").append("<span class='columnsAdded col-type col-type-4' data-type='threeColumns' data-column='col-4'><div class='icon'><span class='insert_threeColumns'></span></div><div class='text'><div class='title'>Three Columns</div><div class='ws_second-info'>Add Three Columns</div></div></span>");
            // setupDragable();
        };

        __elementsfn['imageSlider'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list col-type col-type-4' data-type='imageSlider' data-column='col-4'><div class='icon'><span class='insert_imageSlider'></span></div><div class='text'><div class='title'>Image Slider</div><div class='ws_second-info'>Add Image Slider</div></div></span>");
            // setupDragable();
        };
        __elementsfn['row'] = function () {
            playgroundElements.find(".layout-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
            setupDragable();
        };
        __elementsfn['icons'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
            setupDragable();
        };
        __elementsfn['separators'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
            setupDragable();
        };
        __elementsfn['hover_box'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
            setupDragable();
        };
        __elementsfn['tabs'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
            setupDragable();
        };
        __elementsfn['accordion'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
            setupDragable();
        };
        __elementsfn['tour'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
            setupDragable();
        };
        __elementsfn['google_map'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
            setupDragable();
        };
        __elementsfn['charts'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
            setupDragable();
        };
        __elementsfn['post_grid'] = function () {
            playgroundElements.find(".element-list").append("<span class='ws-element-list addRow' data-type='row'><div class='icon'><span class='material-icons'>link</span></div><div class='text'>Row</div></span>");
            setupDragable();
        };


        function setupDragable() {
            $("body").find(".ws-element-list").draggable({
                cursor: 'move',
                containment: 'document',
                helper: addElement,
                stop: handleDragStop,
            });
            $("body").find(".rowDataInner").draggable({
                cursor: 'move',
                containment: 'document',
                helper: addElement,
                stop: handleDragStop,
            });
            // for moveable sections
            $("body").find(".ws-right-actions").draggable();
        }
        function setupDropable(e) {
            // $("body").find(".ws-row-col").droppable({
            //     hoverClass: "ws-hovered",
            //     drop: handleDropEvent
            // });

            // $("body").find(".rowDataInner").droppable({
            // $("body").find(".ws-data-element.ui-droppable").droppable({
            // $( ".ws-data-element").droppable({
            //     hoverClass: "ws-hovered",
            //     drop: handleDropEvent
            // });

            // $(".ws-row-col").droppable( {
            //     hoverClass: "ws-hovered",
            //     drop: handleDropEvent
            // });

            // $( ".ws-row-col").sortable({
            //     placeholder:"ui-state-highlight",
            //     connectWith: ".ws-row-col",
            //     forcePlaceholderSize:true,
            //     cancel: ".ws-col-header",
            //     change: function(event, ui) {
            //         console.log("sortable"); 
            //         var newCls = $( ".ws-row-col").find(".ws-data-element");
            //         console.log("newCls",newCls); 
            //         if(!$(newCls).is(":empty")){
            //             console.log("not empty"); 
            //             $(newCls).droppable({
            //                 hoverClass: "ws-hovered",
            //                 drop: handleDropEvent
            //             });
            //         }
            //     }
            // });

            $(".ws-row-col").sortable({
                placeholder: "ui-state-highlight",
                connectWith: ".ws-row-col",
                forcePlaceholderSize: true,
                cancel: ".ws-col-header",
                change: function (event, ui) {
                    try {
                        var newCls = $(".ws-row-col .ws-data-element");
                        if (!$(newCls).is(":empty")) {
                            $(newCls).droppable({
                                hoverClass: "ws-hovered",
                                drop: handleDropEvent
                            });
                        }
                    } catch (error) {
                        console.error("An error occurred in handleDropEvent:", error);
                    }
                },
                stop: function (event, ui) {
                    handleDropEvent(event, ui);
                }
            });

            $(".ws-element-wrapper").sortable({
                placeholder: "ui-state-highlight",
                forcePlaceholderSize: true,
                items: '>.ws-row-col',
            });
            $(".ws-dashboard-playground").sortable({
                placeholder: "ui-state-highlight",
                forcePlaceholderSize: true,
                items: '>.rowData',
            });
            $(".ws-element-wrapper").sortable({
                placeholder: "ui-state-highlight",
                forcePlaceholderSize: true,
                items: '>.rowDataInner',
            });

        }
        function addElement(e) {
            $(".ws-page-builder").css({ overflow: "unset" });
            return getItemPreview($(e.currentTarget).attr("data-type"));
        }

        function handleDragStop() {
            $(".ws-page-builder").css({ overflow: "auto" });
        }
        function handleDropEvent(event, ui) {
            var parentCls = ui.item.parent();
            if (!$(parentCls).is(":empty")) {
                $(parentCls).find(".col-action.default").remove();
            }
            var doDrag = $(ui.draggable).attr("data-act");
            if (typeof (doDrag) == "undefined") {
                if (ui.draggable) {
                    if ((ui.draggable).attr("data-type") != "row") {
                        //var ht = setItemPreview($(ui.draggable).attr("data-type"))
                        $(this).append($(ui.draggable));
                        setupDropable();
                    }
                }
            }
        }
        function deleteRow(e) {
            e.stopImmediatePropagation();
            let el = $(e.currentTarget).closest(".rowData").parent(".ws-element-wrapper");
            //rowDataInner
            $(e.currentTarget).closest(".rowData").remove();
            if (settings.version == "inline") {
                if (el.find(".rowDataInner").length <= 0) {
                    let inel = $("<div>", { class: "col-type first-column-add default" }).append("<span class='material-icons'>add</span><br/>Row");
                    el.append(inel);
                }
            }
            // deleteRow
        }
        function minimize(e) {
            //$(e.currentTarget).closest(".rowData").remove();

            var state = $(e.currentTarget).attr("data-state");
            if (state == "minimize") {
                $(e.currentTarget).html("expand_less");
                $(e.currentTarget).closest('.rowData').find('.ws-element-wrapper').addClass("hide");
                $(e.currentTarget).attr("data-state", "max");
            } else {
                $(e.currentTarget).html("expand_more");
                $(e.currentTarget).attr("data-state", "minimize");
                $(e.currentTarget).closest('.rowData').find('.ws-element-wrapper').removeClass("hide");
            }
        }
        function copyRow(e) {

            var le = parseInt($(".rowData").length);
            if (__rows != 0) {
                __rows = __rows + 1;
            } else if (le <= 0) {
                __rows = __rows + 1;
            } else {
                __rows = parseInt(le) + 1;
            }

            var rowEl = $(e.currentTarget).closest(".rowData");
            var klon = rowEl.clone().attr('data-count', __rows);
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
            setupDropable();
            /* if(__rows !=0){
                 __rows = __rows + 1;
             }else if(parseInt($(".rowData").length) <=0){
                 __rows = __rows + 1;
             }else{
                 __rows = parseInt($(".rowData").length);
             }
             var newEl = rowEl.clone().prop('data-count',__rows).empty();
             newEl.append(rowEl.find('.rowHeaders').clone());
             rowEl.find(".ws-row-col").each(function() {
                 
                 if(__rows !=0){
                     __rows = __rows + 1;
                 }else if(parseInt($(".rowData").length) <=0){
                     __rows = __rows + 1;
                 }else{
                     __rows = parseInt($(".rowData").length);
                 }
                 var rowName = "ws-row-data-"+__rows;
                 var klon = $(this).clone().prop('id',rowName);
                 newEl.append(klon);
                 
                 rowEl.find(".ws-data-element").each(function() {
     
                     var rm = Math.floor(Math.random()* 100);
                     var id = "ws-"+new Date().valueOf()+"_"+rm;
                     var klon1 = $(this).clone().prop('id',id);
                     klon.append(klon1);
                 })
             });
             rowEl.after(newEl);*/
        }
        function minimizeCol(e) {
            //$(e.currentTarget).closest(".rowData").remove();

            var state = $(e.currentTarget).attr("data-state");
            if (state == "minimize") {
                $(e.currentTarget).html("expand_less");
                $(e.currentTarget).closest('.ws-row-col').find('.ws-data-element').addClass("hide");
                $(e.currentTarget).attr("data-state", "max");
            } else {
                $(e.currentTarget).html("expand_more");
                $(e.currentTarget).attr("data-state", "minimize");
                $(e.currentTarget).closest('.ws-row-col').find('.ws-data-element').removeClass("hide");
            }
        }
        // create dragable item preview
        function getItemPreview(type) {

            switch (type) {
                case 'heading': {
                    return "<div class='ws-preview-items' data-type='heading'><h1>Heading</h1></div>";
                    break;
                }
                case 'paragraph': {
                    return "<div class='ws-preview-items' data-type='paragraph'><strong>What is Lorem Ipsum?</strong>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</div>";
                    break;
                }
                case 'image': {
                    return "<div class='ws-preview-items' data-type='image'><h1>Image</h1></div>";
                    break;
                }
                case 'button': {
                    return "<div class='ws-preview-items' data-type='button'><h1>Button</h1></div>";
                    break;
                }
                case 'link': {
                    return "<div class='ws-preview-items' data-type='link'><h1>Link</h1></div>";
                    break;
                }
                case 'video': {

                    return "<div class='ws-preview-items' data-type='video'><span class='material-icons'>videocam</span></div>";
                    break;
                }
                case 'social': {

                    return "<div class='ws-preview-items' data-type='social'><span class='material-icons'>share</span></div>";
                    break;
                }
                case 'customHtml': {

                    return "<div class='ws-preview-items' data-type='customHtml'><span class='material-icons'>code</span></div>";
                    break;
                }
                case 'icons': {
                    return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                    break;
                }
                case 'separators': {
                    return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                    break;
                }
                case 'hover_box': {
                    return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                    break;
                }
                case 'tabs': {
                    return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                    break;
                }
                case 'accordion': {
                    return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                    break;
                }
                case 'tour': {
                    return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                    break;
                }
                case 'google_map': {
                    return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                    break;
                }
                case 'charts': {
                    return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                    break;
                }
                case 'post_grid': {
                    return "<div class='ws-preview-items' data-type='row'><h1>row</h1></div>";
                    break;
                }
            }
        }
        // create dragable item
        function setItemPreview(type, noRow = false) {
            var d = new Date();
            var n = d.getTime();
            var newId = "ws_" + n;
            var ediDetails = '<div class="row-action-header"><span data-action="delete" data-type="row" title="Delete Row" class="row-action material-icons">close</span></div>'; // <span data-action="edit" data-type="row" title="Row Setting" class="row-action material-icons">edit</span><span data-action="minimize" data-type="row" title="Minimize Row" data-state="minimize" class="row-action material-icons">expand_more</span><span data-action="copy" data-type="row" title="Duplicate" class="row-action material-icons">content_copy</span> 
            var ediDetailsSection = '<div class="row-action-header"><span data-action="delete" data-type="section" title="Delete Section" class="row-action material-icons">close</span></div>'; // <span data-action="clipboardCopy" data-type="section" title="Copy to clipboard Section" class="row-action material-icons">content_paste</span><span data-action="edit" data-type="section" title="Section Setting" class="row-action material-icons">edit</span><span data-action="minimize" data-type="section" title="Minimize Section" data-state="minimize" class="row-action material-icons">expand_more</span><span data-action="copy" data-type="section" title="Duplicate" class="row-action material-icons">content_copy</span>
            switch (type) {
                case 'heading': {
                    return "<div class='ui-state-default' data-type='heading'><h1>Heading</h1></div>";
                    break;
                }
                case 'paragraph': {

                    return "<div id='" + newId + "' class='paragraph-text ws-data-element ui-state-default' data-act='no-drag' data-type='paragraph'><span class='elm-action'><div class='icon'><span class='insert_text'></span></div><span class='wc_control-btn-move' title='Move Block'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Block'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Block'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Block'><i class='material-icons'>close</i></span></span><span class='p-txt'><strong>What is Lorem Ipsum?</strong>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</span></div>";
                    break;
                }
                case 'image': {
                    return "<div id='" + newId + "' class='ws-image-link ws-data-element' data-act='no-drag' data-type='image'><div class='icon'><span class='insert_photo'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Image'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Image'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Image'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Image'><i class='material-icons'>close</i></span></a></span></div>";
                    break;
                }
                case 'button': {
                    return "<div id='" + newId + "' class='ws-button-link ws-data-element' data-act='no-drag' data-type='button'><div class='icon'><span class='insert_button'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Button'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Button'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Button'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Button'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'link': {
                    return "<div id='" + newId + "' class='ws-link-text ws-data-element' data-act='no-drag' data-type='link'><div class='icon'><span class='insert_link'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Link'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Link'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Link'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Link'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'video': {
                    return "<div id='" + newId + "' class='ws-video-link ws-data-element' data-act='no-drag' data-type='video'><div class='icon'><span class='insert_video'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Video'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Video'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Video'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Video'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'social': {
                    return "<div id='" + newId + "' class='ws-social-link ws-data-element' data-act='no-drag' data-type='social'><div class='icon'><span class='insert_soical'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Social'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Social'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Social'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Social'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'customHtml': {
                    return "<div id='" + newId + "' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><div class='icon'><span class='insert_html'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Custom Html'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Custom Html'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Custom Html'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Custom Html'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'headingTag': {
                    return "<div id='" + newId + "' class='ws-headingTag-link ws-data-element' data-act='no-drag' data-type='headingTag'><div class='icon'><span class='insert_tag'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Html Tag'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Html Tag'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Html Tag'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Html Tag'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'carousel': {
                    return "<div id='" + newId + "' class='ws-carousel-link ws-data-element' data-act='no-drag' data-type='carousel'><div class='icon'><span class='insert_carousel'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Carousel'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Carousel'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Carousel'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Carousel'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'imageSlider': {
                    return "<div id='" + newId + "' class='ws-imageSlider-link ws-data-element' data-act='no-drag' data-type='imageSlider'><div class='icon'><span class='insert_imageSlider'></span></div><span class='elm-action'><span class='wc_control-btn-move' title='Move Image Slider'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Image Slider'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Image Slider'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Image Slider'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'icons': {
                    return "<div id='" + newId + "' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move icon'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy icon'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit icon'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove icon'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'separators': {
                    return "<div id='" + newId + "' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Separators'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Separators'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Separators'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Separators'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'hover_box': {
                    return "<div id='" + newId + "' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Hover'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Hover'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Hover'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Hover'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'tabs': {
                    return "<div id='" + newId + "' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Tabs'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Tabs'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Tabs'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Tabs'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'accordion': {
                    return "<div id='" + newId + "' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Accordion'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Accordion'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Accordion'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Accordion'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'tour': {
                    return "<div id='" + newId + "' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Tour'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Tour'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Tour'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Tour'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'google_map': {
                    return "<div id='" + newId + "' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Google Map'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Google Map'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Google Map'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Google Map'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'charts': {
                    return "<div id='" + newId + "' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Charts'><i class='material-icons'>open_with</i></span>   <span class='wc_control-btn-del' title='Remove Charts'><i class='material-icons'>close</i></span></span></div>"; // <span class='wc_control-btn-copy' title='Copy Charts'><i class='material-icons'>content_copy</i></span><span class='wc_control-btn-edit' title='Edit Charts'><i class='material-icons'>edit</i></span>
                    break;
                }
                case 'post_grid': {
                    return "<div id='" + newId + "' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Post Grid'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-copy' title='Copy Post Grid'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Post Grid'><i class='material-icons'>edit</i></span><span class='wc_control-btn-del' title='Remove Post Grid'><i class='material-icons'>close</i></span></span></div>";
                    break;
                }
                case 'income': {
                    return "<div id='" + newId + "' class='ws-customHtml-link ws-data-element' data-act='no-drag' data-type='customHtml'><span class='material-icons'>code</span><span class='elm-action'><span class='wc_control-btn-move' title='Move Charts'><i class='material-icons'>open_with</i></span> <span class='wc_control-btn-del' title='Remove Charts'><i class='material-icons'>close</i></span></span></div>"; // <span class='wc_control-btn-copy' title='Copy Charts'><i class='material-icons'>content_copy</i></span>  <span class='wc_control-btn-edit' title='Edit Charts'><i class='material-icons'>edit</i></span>
                    break;
                }
                case 'row': {
                    if (__rows != 0) {
                        __rows = __rows + 1;
                    } else if (parseInt($(".rowData").length) <= 0) {
                        __rows = __rows + 1;
                    } else {
                        __rows = parseInt($(".rowData").length);
                    }
                    var rowName = "ws-row-data-" + new Date().valueOf();
                    var _col = createColumnSection();
                    $(".defaultView").remove();
                    let rowl = $("<div>", {
                        class: 'rowData',
                        "data-count": __rows,
                        "data-type": 'row',
                    });
                    let rnl = $("<div>", {
                        id: rowName,
                        class: "ws-element-wrapper ws-dropable-items"
                    })
                    let rowel = $("<div>", { class: 'rowHeaders', }).append($("<ul>", { class: 'act-headers' }).append("<li class='col-type move-row'><span class='material-icons'>open_with</span></li><li class='col-type first-column-add'><span class='material-icons'>add</span> </li><li class='col-type column-selected'>" + _col + "</li><li class='first-column-add'><span class='material-icons'>save</span></li>"));//.append(ediDetails);
                    if (noRow) {
                        rowel.find(".first-column-add").remove();
                        rowel.append(ediDetails);
                        rowl.addClass("rowDataInner");
                        // rowl.attr("data-act",'no-drag');
                        rowl.append(rowel);
                        rowl.append(rnl);
                        if (settings.version == "inline") {
                            //rnl.append(inel);
                            performColumnsArrgements(rnl, "col-1");
                            // $(".ws-row-col").droppable( {
                            //     hoverClass: "ws-hovered",
                            //     drop: handleDropEvent
                            // });
                            setupDropable();
                            // $( ".ws-element-wrapper" ).sortable({
                            //     items: '.ws-row-col',
                            // });
                        }
                        return rowl;

                    } else {
                        if (settings.version == "inline") {
                            rowel.append(ediDetailsSection);
                            rowel.find(".column-selected").remove();
                            let inel = $("<div>", { class: "col-type first-column-add default" }).append("<span class='material-icons'>add</span><br/>Row");
                            rnl.append(inel);
                            rowl.append(rowel);
                            rowl.append(rnl);
                            rowl.append(inel.clone().removeClass("default").addClass("bt"));
                            return rowl;
                        } else {
                            rowel.append(ediDetailsSection);
                            //return "<div class='rowData' data-count='"+__rows+"' data-type='row'><div class='rowHeaders'><ul class='act-headers'><li class='col-type move-row'><span class='material-icons'>open_with</span></li><li class='col-type first-column-add'><span class='material-icons'>add</span></li><li class='col-type column-selected'>"+_col+"</li></ul>"+ediDetails+"</div><div id='"+rowName+"' class='ws-element-wrapper ws-dropable-items'></div></div>";
                            rowl.append(rowel);
                            rowl.append(rnl);
                            return rowl;
                        }
                    }
                    break;
                }
            }
        }
        function createColumnSection() {
            var col = "<span class='moreoption'><ul>";
            for (let index = 1; index <= 5; index++) {
                col = col + "<li data-column='col-" + index + "' class='col-type col-type-select col-type-" + index + "'></li>";
            }
            col = col + "</ul></span>";
            return col;
        }
        function performColumnsArrgements(element, type) {
            var tempDiv = $("<div/>", { id: "tempTxt" });
            element.find(".ws-row-col").each(function () {
                $(this).find(".ws-col-header").remove();
                $(this).find(".col-action").remove();
                if ($(this).is(':empty')) {
                    //
                } else {
                    var ht = $(this).html();
                    tempDiv.append(ht);
                }
            });
            $(element).html("");
            var sizes = __columnsSize[type].size;
            var tcol = sizes.split(",");
            // let inel ;
            let inel = $("<div>", { class: "col-action default mt-4 mb-3", "data-action": "add", title: "Add Element" }).append("<span class='material-icons'>add</span><br/>Element");
            jQuery.each(tcol, function (index, value) {
                var rm = Math.floor(Math.random() * 100);
                var id = "ws-" + new Date().valueOf() + "_" + rm;
                var cls = 'ws-row-col ws-col-size-' + value + ' ' + settings.version;
                var edit = $("<div/>", {
                    class: "ws-col-header text-right"
                });

                // edit.html('<span data-action="add" title="Add Element" class="col-action material-icons">add</span><span data-action="edit" title="Column Settings" class="col-action material-icons">edit</span><span data-action="minimize" title="Minimze" data-state="minimize" class="col-action material-icons hideShow">expand_more</span>');//<span data-action="delete" class="col-action material-icons">close</span>

                if (index == 0) {
                    if (tempDiv.is(':empty')) {
                        $('<div />', {
                            id: id,
                            class: cls,
                        }).append(edit).append(inel.clone()).appendTo(element);
                    } else {
                        $('<div />', {
                            id: id,
                            class: cls,
                        }).append(edit).append(tempDiv.html()).appendTo(element);
                    }
                } else {
                    $('<div />', {
                        id: id,
                        class: cls,
                    }).append(edit).append(inel.clone()).appendTo(element);

                }
            });
        }
        function getLinkSetting() {
            let link_hoder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_link",
                role: "tabpanel",
            });

            var curLink = __current_col_edit.attr("data-block-link");
            if (typeof (curLink) != "undefined" && curLink != "") {
                var link = curLink;
            } else {
                var link = "";
            }
            var link = $("<input>", {
                class: "text-list ws-block-link",
                type: "text",
                value: link,
                name: "sectionLink"
            });

            link_hoder.append("<p class='ws-setting-section-heading'><span>Block Link</p>");
            link_hoder.append($("<div/>", { class: "ws-section-setting" }).append(link));

            return link_hoder;
        }
        function getOwlCarouselSetting() {
            let carousel_holder = $("<div/>", {
                class: "tab-pane fade",
                id: "ws_owlCarousel",
                role: "tabpanel",
            });
            carousel_holder.append("<p class='ws-setting-row-heading'><span>List including all options from built-in plugins video, lazyload, autoheight and animate.</p>");
            var optList = $("<div/>", {
                class: "ws-option-setting"
            });
            var responsiveCarousel = __current_col_edit.attr("data-responsiveCarousel");
            var curCarousel = __current_col_edit.attr("data-owl-carousel");
            if (typeof (curCarousel) != "undefined") {
                curCarousel = JSON.parse(__current_col_edit.attr("data-owl-carousel"));
            } else {
                curCarousel = {};
            }

            //Display items
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['items']) != "undefined") {
                    var item = curCarousel['items'];
                } else {
                    var item = "0";
                }
            }
            var items = $("<input>", {
                class: "text-list ws-display-items carouselSetting",
                type: "number",
                value: item,
                name: "sectionItems",
                id: "items",
                "data-type": "data-items"
            });
            var displayItems = $("<div/>", { class: 'ws-displayItems ws-section-setting no-flex ws-grid' });
            displayItems.append("<p class='ws-setting-carousel-heading'><span>Display items</span></p>");
            displayItems.append(items);
            optList.append(displayItems);
            //Display items

            //Add Margin Right
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['margin']) != "undefined") {
                    var margin = curCarousel['margin'];
                } else {
                    var margin = "0";
                }
            }
            var margins = $("<input>", {
                class: "text-list ws-margin-right carouselSetting",
                type: "number",
                value: margin,
                name: "sectionMargin",
                id: "margin",
                "data-type": "data-margin"
            });
            var addMargin = $("<div/>", { class: 'ws-addMargin ws-section-setting no-flex ws-grid' });
            addMargin.append("<p class='ws-setting-carousel-heading'><span>Add Margin Right</span></p>");
            addMargin.append(margins);
            optList.append(addMargin);
            //Add Margin Right

            //Padding left and right 
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['stagePadding']) != "undefined") {
                    var stagePadding = curCarousel['stagePadding'];
                } else {
                    var stagePadding = "0";
                }
            }
            var stagePaddings = $("<input>", {
                class: "text-list ws-stagePadding carouselSetting",
                type: "number",
                value: stagePadding,
                name: "sectionStagePadding",
                id: "stagePadding",
                "data-type": "data-stagePadding"
            });
            var addStagePadding = $("<div/>", { class: 'ws-stagePadding ws-section-setting no-flex ws-grid' });
            addStagePadding.append("<p class='ws-setting-carousel-heading'><span>Padding left and right</span></p>");
            addStagePadding.append(stagePaddings);
            optList.append(addStagePadding);
            //Padding left and right 

            //Start position or URL Hash string like '#id' 
            // if(typeof(curCarousel) != "undefined" ){
            //     if(typeof(curCarousel['startPosition']) != "undefined"){
            //         var startPosition = curCarousel['startPosition'];
            //     }else{
            //         var startPosition = "";
            //     }
            // }
            // var startPositions = $("<input>",{
            //     class:"text-list ws-startPosition carouselSetting",
            //     type:"number",
            //     value:startPosition,
            //     name:"sectionstartPosition",
            //     id:"startPosition",
            //     "data-type":"data-startPosition"
            // });
            // var addStartPosition = $("<div/>",{class:'ws-startPosition ws-section-setting no-flex ws-grid'});
            // addStartPosition.append("<p class='ws-setting-carousel-heading'><span>Start position or URL Hash string like '#id'</span></p>");
            // addStartPosition.append(startPositions);
            // optList.append(addStartPosition);
            //Start position or URL Hash string like '#id' 

            //Navigation slide by x 
            // if(typeof(curCarousel) != "undefined" ){
            //     if(typeof(curCarousel['slideBy']) != "undefined"){
            //         var slideBy = curCarousel['slideBy'];
            //     }else{
            //         var slideBy = "";
            //     }
            // }
            // var slideBys = $("<input>",{
            //     class:"text-list ws-slideBy carouselSetting",
            //     type:"number",
            //     value:slideBy,
            //     name:"sectionSlideBy",
            //     id:"slideBy",
            //     "data-type":"data-slideBy"
            // });
            // var addSlideBy = $("<div/>",{class:'ws-slideBy ws-section-setting no-flex ws-grid'});
            // addSlideBy.append("<p class='ws-setting-carousel-heading'><span>Navigation slide by x</span></p>");
            // addSlideBy.append(slideBys);
            // optList.append(addSlideBy);
            //Navigation slide by x 

            //Autoplay Timeout 
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['autoplayTimeout']) != "undefined") {
                    var autoplayTimeout = curCarousel['autoplayTimeout'];
                } else {
                    var autoplayTimeout = "0";
                }
            }
            var autoplayTimeouts = $("<input>", {
                class: "text-list ws-autoplayTimeout carouselSetting",
                type: "number",
                value: autoplayTimeout,
                name: "sectionautoplayTimeout",
                id: "autoplayTimeout",
                "data-type": "data-autoplayTimeout"
            });
            var addAutoplayTimeout = $("<div/>", { class: 'ws-autoplayTimeout ws-section-setting no-flex ws-grid' });
            addAutoplayTimeout.append("<p class='ws-setting-carousel-heading'><span>Autoplay Timeout(in miliseconds)</span></p>");
            addAutoplayTimeout.append(autoplayTimeouts);
            optList.append(addAutoplayTimeout);
            //Autoplay Timeout 

            //Speed Calculate 
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['smartSpeed']) != "undefined") {
                    var smartSpeed = curCarousel['smartSpeed'];
                } else {
                    var smartSpeed = "0";
                }
            }
            var smartSpeeds = $("<input>", {
                class: "text-list ws-smartSpeed carouselSetting",
                type: "number",
                value: smartSpeed,
                name: "sectionsmartSpeed",
                id: "smartSpeed",
                "data-type": "data-smartSpeed"
            });
            var addSmartSpeed = $("<div/>", { class: 'ws-smartSpeed ws-section-setting no-flex ws-grid' });
            addSmartSpeed.append("<p class='ws-setting-carousel-heading'><span>Speed Calculate</span></p>");
            addSmartSpeed.append(smartSpeeds);
            optList.append(addSmartSpeed);
            //Speed Calculate 

            //Infinity loop
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['loop']) != "undefined") {
                    var loop = curCarousel['loop'];
                } else {
                    var loop = "";
                }
            }
            var loopList = ["true", "false"];
            var loopVal = $("<select/>", {
                class: "ws-loop-select carouselSetting",
                id: "loop",
                "data-type": "data-loop"
            });
            for (let i = 0; i < loopList.length; i++) {
                if (loop != "undefined" && loopList[i] == loop) {
                    loopVal.append(new Option(loopList[i], loopList[i], true, true));
                } else {
                    loopVal.append(new Option(loopList[i], loopList[i]));
                }
            }
            var looping = $("<div/>", { class: 'ws-looping ws-section-setting no-flex ws-grid' });
            looping.append("<p class='ws-setting-carousel-heading'><span>Infinity loop</span></p>");
            looping.append(loopVal);
            optList.append(looping);
            //Infinity loop

            //Center Align
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['center']) != "undefined") {
                    var center = curCarousel['center'];
                } else {
                    var center = "";
                }
            }
            var alignList = ["true", "false"];
            var alignVal = $("<select/>", {
                class: "ws-center-align carouselSetting",
                id: "center",
                "data-type": "data-center"
            });
            for (let i = 0; i < alignList.length; i++) {
                if (center != "undefined" && alignList[i] == center) {
                    alignVal.append(new Option(alignList[i], alignList[i], true, true));
                } else {
                    alignVal.append(new Option(alignList[i], alignList[i]));
                }
            }
            var alignment = $("<div/>", { class: 'ws-alignment ws-section-setting no-flex ws-grid' });
            alignment.append("<p class='ws-setting-carousel-heading'><span>Center Align</span></p>");
            alignment.append(alignVal);
            optList.append(alignment);
            //Center Align

            //Mouse Drag
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['mouseDrag']) != "undefined") {
                    var mouseDrag = curCarousel['mouseDrag'];
                } else {
                    var mouseDrag = "";
                }
            }
            var mouseDragList = ["true", "false"];
            var mouseDragVal = $("<select/>", {
                class: "ws-mouseDrag carouselSetting",
                id: "mouseDrag",
                "data-type": "data-mouseDrag"
            });
            for (let i = 0; i < mouseDragList.length; i++) {
                if (mouseDrag != "undefined" && mouseDragList[i] == mouseDrag) {
                    mouseDragVal.append(new Option(mouseDragList[i], mouseDragList[i], true, true));
                } else {
                    mouseDragVal.append(new Option(mouseDragList[i], mouseDragList[i]));
                }
            }
            var mouseDrag = $("<div/>", { class: 'ws-mouseDrag ws-section-setting no-flex ws-grid' });
            mouseDrag.append("<p class='ws-setting-carousel-heading'><span>Mouse Drag</span></p>");
            mouseDrag.append(mouseDragVal);
            optList.append(mouseDrag);
            //Mouse Drag

            //Touch Drag
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['touchDrag']) != "undefined") {
                    var touchDrag = curCarousel['touchDrag'];
                } else {
                    var touchDrag = "";
                }
            }
            var touchDragList = ["true", "false"];
            var touchDragVal = $("<select/>", {
                class: "ws-touchDrag carouselSetting",
                id: "touchDrag",
                "data-type": "data-touchDrag"
            });
            for (let i = 0; i < touchDragList.length; i++) {
                if (touchDrag != "undefined" && touchDragList[i] == touchDrag) {
                    touchDragVal.append(new Option(touchDragList[i], touchDragList[i], true, true));
                } else {
                    touchDragVal.append(new Option(touchDragList[i], touchDragList[i]));
                }
            }
            var touchDrag = $("<div/>", { class: 'ws-touchDrag ws-section-setting no-flex ws-grid' });
            touchDrag.append("<p class='ws-setting-carousel-heading'><span>Touch Drag</span></p>");
            touchDrag.append(touchDragVal);
            optList.append(touchDrag);
            //Touch Drag

            //Pull Drag
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['pullDrag']) != "undefined") {
                    var pullDrag = curCarousel['pullDrag'];
                } else {
                    var pullDrag = "";
                }
            }
            var pullDragList = ["true", "false"];
            var pullDragVal = $("<select/>", {
                class: "ws-pullDrag carouselSetting",
                id: "pullDrag",
                "data-type": "data-pullDrag"
            });
            for (let i = 0; i < pullDragList.length; i++) {
                if (pullDrag != "undefined" && pullDragList[i] == pullDrag) {
                    pullDragVal.append(new Option(pullDragList[i], pullDragList[i], true, true));
                } else {
                    pullDragVal.append(new Option(pullDragList[i], pullDragList[i]));
                }
            }
            var pullDrag = $("<div/>", { class: 'ws-pullDrag ws-section-setting no-flex ws-grid' });
            pullDrag.append("<p class='ws-setting-carousel-heading'><span>Pull Drag</span></p>");
            pullDrag.append(pullDragVal);
            optList.append(pullDrag);
            //Pull Drag

            //Free Drag
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['freeDrag']) != "undefined") {
                    var freeDrag = curCarousel['freeDrag'];
                } else {
                    var freeDrag = "";
                }
            }
            var freeDragList = ["true", "false"];
            var freeDragVal = $("<select/>", {
                class: "ws-freeDrag carouselSetting",
                id: "freeDrag",
                "data-type": "data-freeDrag"
            });
            for (let i = 0; i < freeDragList.length; i++) {
                if (freeDrag != "undefined" && freeDragList[i] == freeDrag) {
                    freeDragVal.append(new Option(freeDragList[i], freeDragList[i], true, true));
                } else {
                    freeDragVal.append(new Option(freeDragList[i], freeDragList[i]));
                }
            }
            var freeDrag = $("<div/>", { class: 'ws-freeDrag ws-section-setting no-flex ws-grid' });
            freeDrag.append("<p class='ws-setting-carousel-heading'><span>Free Drag</span></p>");
            freeDrag.append(freeDragVal);
            optList.append(freeDrag);
            //Free Drag

            //Set non grid content
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['autoWidth']) != "undefined") {
                    var autoWidth = curCarousel['autoWidth'];
                } else {
                    var autoWidth = "";
                }
            }
            var autoWidthList = ["true", "false"];
            var autoWidthVal = $("<select/>", {
                class: "ws-autoWidth carouselSetting",
                id: "autoWidth",
                "data-type": "data-autoWidth"
            });
            for (let i = 0; i < autoWidthList.length; i++) {
                if (autoWidth != "undefined" && autoWidthList[i] == autoWidth) {
                    autoWidthVal.append(new Option(autoWidthList[i], autoWidthList[i], true, true));
                } else {
                    autoWidthVal.append(new Option(autoWidthList[i], autoWidthList[i]));
                }
            }
            var autoWidth = $("<div/>", { class: 'ws-autoWidth ws-section-setting no-flex ws-grid' });
            autoWidth.append("<p class='ws-setting-carousel-heading'><span>Set non grid content</span></p>");
            autoWidth.append(autoWidthVal);
            optList.append(autoWidth);
            //Set non grid content

            //Show next/prev buttons
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['nav']) != "undefined") {
                    var nav = curCarousel['nav'];
                } else {
                    var nav = "";
                }
            }
            var navList = ["true", "false"];
            var navVal = $("<select/>", {
                class: "ws-nav carouselSetting",
                id: "nav",
                "data-type": "data-nav"
            });
            for (let i = 0; i < navList.length; i++) {
                if (nav != "undefined" && navList[i] == nav) {
                    navVal.append(new Option(navList[i], navList[i], true, true));
                } else {
                    navVal.append(new Option(navList[i], navList[i]));
                }
            }
            var nav = $("<div/>", { class: 'ws-nav ws-section-setting no-flex ws-grid' });
            nav.append("<p class='ws-setting-carousel-heading'><span>Show next/prev buttons</span></p>");
            nav.append(navVal);
            optList.append(nav);
            //Show next/prev buttons

            //Go backwards when the boundary has reached
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['rewind']) != "undefined") {
                    var rewind = curCarousel['rewind'];
                } else {
                    var rewind = "";
                }
            }
            var rewindList = ["true", "false"];
            var rewindVal = $("<select/>", {
                class: "ws-rewind carouselSetting",
                id: "rewind",
                "data-type": "data-rewind"
            });
            for (let i = 0; i < rewindList.length; i++) {
                if (rewind != "undefined" && rewindList[i] == rewind) {
                    rewindVal.append(new Option(rewindList[i], rewindList[i], true, true));
                } else {
                    rewindVal.append(new Option(rewindList[i], rewindList[i]));
                }
            }
            var rewind = $("<div/>", { class: 'ws-rewind ws-section-setting no-flex ws-grid' });
            rewind.append("<p class='ws-setting-carousel-heading'><span>Rewind</span></p>");
            rewind.append(rewindVal);
            optList.append(rewind);
            //Go backwards when the boundary has reached

            //Lazy load images
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['lazyLoad']) != "undefined") {
                    var lazyLoad = curCarousel['lazyLoad'];
                } else {
                    var lazyLoad = "";
                }
            }
            var lazyLoadList = ["true", "false"];
            var lazyLoadVal = $("<select/>", {
                class: "ws-lazyLoad carouselSetting",
                id: "lazyLoad",
                "data-type": "data-lazyLoad"
            });
            for (let i = 0; i < lazyLoadList.length; i++) {
                if (lazyLoad != "undefined" && lazyLoadList[i] == lazyLoad) {
                    lazyLoadVal.append(new Option(lazyLoadList[i], lazyLoadList[i], true, true));
                } else {
                    lazyLoadVal.append(new Option(lazyLoadList[i], lazyLoadList[i]));
                }
            }
            var lazyLoad = $("<div/>", { class: 'ws-lazyLoad ws-section-setting no-flex ws-grid' });
            lazyLoad.append("<p class='ws-setting-carousel-heading'><span>Lazy load images</span></p>");
            lazyLoad.append(lazyLoadVal);
            optList.append(lazyLoad);
            //Lazy load images

            //Autoplay
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['autoplay']) != "undefined") {
                    var autoplay = curCarousel['autoplay'];
                } else {
                    var autoplay = "";
                }
            }
            var autoplayList = ["true", "false"];
            var autoplayVal = $("<select/>", {
                class: "ws-autoplay carouselSetting",
                id: "autoplay",
                "data-type": "data-autoplay"
            });
            for (let i = 0; i < autoplayList.length; i++) {
                if (autoplay != "undefined" && autoplayList[i] == autoplay) {
                    autoplayVal.append(new Option(autoplayList[i], autoplayList[i], true, true));
                } else {
                    autoplayVal.append(new Option(autoplayList[i], autoplayList[i]));
                }
            }
            var autoplay = $("<div/>", { class: 'ws-autoplay ws-section-setting no-flex ws-grid' });
            autoplay.append("<p class='ws-setting-carousel-heading'><span>Autoplay</span></p>");
            autoplay.append(autoplayVal);
            optList.append(autoplay);
            //Autoplay

            //Autoplay Hover Pause
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['autoplayHoverPause']) != "undefined") {
                    var autoplayHoverPause = curCarousel['autoplayHoverPause'];
                } else {
                    var autoplayHoverPause = "";
                }
            }
            var autoplayHoverPauseList = ["true", "false"];
            var autoplayHoverPauseVal = $("<select/>", {
                class: "ws-autoplayHoverPause carouselSetting",
                id: "autoplayHoverPause",
                "data-type": "data-autoplayHoverPause"
            });
            for (let i = 0; i < autoplayHoverPauseList.length; i++) {
                if (autoplayHoverPause != "undefined" && autoplayHoverPauseList[i] == autoplayHoverPause) {
                    autoplayHoverPauseVal.append(new Option(autoplayHoverPauseList[i], autoplayHoverPauseList[i], true, true));
                } else {
                    autoplayHoverPauseVal.append(new Option(autoplayHoverPauseList[i], autoplayHoverPauseList[i]));
                }
            }
            var autoplayHoverPause = $("<div/>", { class: 'ws-autoplayHoverPause ws-section-setting no-flex ws-grid' });
            autoplayHoverPause.append("<p class='ws-setting-carousel-heading'><span>Autoplay Hover Pause</span></p>");
            autoplayHoverPause.append(autoplayHoverPauseVal);
            optList.append(autoplayHoverPause);
            //Autoplay Hover Pause

            //video
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['video']) != "undefined") {
                    var video = curCarousel['video'];
                } else {
                    var video = "false";
                }
            }
            var videoList = ["true", "false"];
            var videoVal = $("<select/>", {
                class: "ws-video carouselSetting",
                id: "video",
                "data-type": "data-video"
            });
            for (let i = 0; i < videoList.length; i++) {
                if (video != "undefined" && videoList[i] == video) {
                    videoVal.append(new Option(videoList[i], videoList[i], true, true));
                } else {
                    videoVal.append(new Option(videoList[i], videoList[i]));
                }
            }
            var video = $("<div/>", { class: 'ws-video ws-section-setting no-flex ws-grid' });
            video.append("<p class='ws-setting-carousel-heading'><span>Video</span></p>");
            video.append(videoVal);
            optList.append(video);
            //video

            //Video Height 
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['videoHeight']) != "undefined") {
                    var videoHeight = curCarousel['videoHeight'];
                } else {
                    var videoHeight = "0";
                }
            }
            var videoHeights = $("<input>", {
                class: "text-list ws-videoHeight carouselSetting",
                type: "text",
                value: videoHeight,
                name: "sectionVideoHeight",
                id: "videoHeight",
                "data-type": "data-videoHeight"
            });
            var addVideoHeight = $("<div/>", { class: 'ws-videoHeight ws-section-setting no-flex ws-grid' });
            addVideoHeight.append("<p class='ws-setting-carousel-heading'><span>Video Height</span></p>");
            addVideoHeight.append(videoHeights);
            optList.append(addVideoHeight);
            //Video Height 

            //Video Width 
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['videoWidth']) != "undefined") {
                    var videoWidth = curCarousel['videoWidth'];
                } else {
                    var videoWidth = "";
                }
            }
            var videoWidths = $("<input>", {
                class: "text-list ws-videoWidth carouselSetting",
                type: "text",
                value: videoWidth,
                name: "sectionVideoWidth",
                id: "videoWidth",
                "data-type": "data-videoWidth"
            });
            var addVideoWidth = $("<div/>", { class: 'ws-videoWidth ws-section-setting no-flex ws-grid' });
            addVideoWidth.append("<p class='ws-setting-carousel-heading'><span>Video Width</span></p>");
            addVideoWidth.append(videoWidths);
            optList.append(addVideoWidth);
            //Video Width 

            //Animate In 

            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['animateIn']) != "undefined") {
                    var animateIn = curCarousel['animateIn'];
                } else {
                    var animateIn = "false";
                }
            }
            var animateInList = ["true", "false"];
            var animateInVal = $("<select/>", {
                class: "ws-animateIn carouselSetting",
                id: "animateIn",
                "data-type": "data-animateIn"
            });
            for (let i = 0; i < animateInList.length; i++) {
                if (animateIn != "undefined" && animateInList[i] == animateIn) {
                    animateInVal.append(new Option(animateInList[i], animateInList[i], true, true));
                } else {
                    animateInVal.append(new Option(animateInList[i], animateInList[i]));
                }
            }
            var addAnimateIn = $("<div/>", { class: 'ws-animateIn ws-section-setting no-flex ws-grid' });
            addAnimateIn.append("<p class='ws-setting-carousel-heading'><span>Animate In</span></p>");
            addAnimateIn.append(animateInVal);
            optList.append(addAnimateIn);

            //Animate In 

            //Animate Out 

            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['animateOut']) != "undefined") {
                    var animateOut = curCarousel['animateOut'];
                } else {
                    var animateOut = "false";
                }
            }
            var animateOutList = ["true", "false"];
            var animateOutVal = $("<select/>", {
                class: "ws-animateOut carouselSetting",
                id: "animateOut",
                "data-type": "data-animateOut"
            });
            for (let i = 0; i < animateOutList.length; i++) {
                if (animateOut != "undefined" && animateOutList[i] == animateOut) {
                    animateOutVal.append(new Option(animateOutList[i], animateOutList[i], true, true));
                } else {
                    animateOutVal.append(new Option(animateOutList[i], animateOutList[i]));
                }
            }
            var addanimateOut = $("<div/>", { class: 'ws-animateOut ws-section-setting no-flex ws-grid' });
            addanimateOut.append("<p class='ws-setting-carousel-heading'><span>Animate In</span></p>");
            addanimateOut.append(animateOutVal);
            optList.append(addanimateOut);
            //Animate Out 

            //Slide Transition 
            if (typeof (curCarousel) != "undefined") {
                if (typeof (curCarousel['slideTransition']) != "undefined") {
                    var slideTransition = curCarousel['slideTransition'];
                } else {
                    var slideTransition = "";
                }
            }
            var slideTransitions = $("<input>", {
                class: "text-list ws-slideTransition carouselSetting",
                type: "text",
                value: slideTransition,
                name: "sectionslideTransition",
                id: "slideTransition",
                "data-type": "data-slideTransition"
            });
            var addSlideTransition = $("<div/>", { class: 'ws-slideTransition ws-section-setting no-flex ws-grid' });
            addSlideTransition.append("<p class='ws-setting-carousel-heading'><span>Slide Transition</span></p>");
            addSlideTransition.append(slideTransitions);
            optList.append(addSlideTransition);
            //Slide Transition 

            //Base Class 
            // __current_col_edit.attr("data-baseClass","owl-carousel");
            // if(typeof(curCarousel) != "undefined" ){
            //     if(typeof(curCarousel['baseClass']) != "undefined"){
            //         var baseClass = curCarousel['baseClass'];
            //     }else{
            //         var baseClass = "";
            //     }
            // }
            // var baseClasss = $("<input>",{
            //     class:"text-list ws-baseClass carouselSetting",
            //     type:"text",
            //     value:baseClass,
            //     name:"sectionBaseClass",
            //     // readOnly:true,
            //     id:"baseClass",
            //     "data-type":"data-baseClass"
            // });
            // var addBaseClass = $("<div/>",{class:'ws-baseClass ws-section-setting no-flex ws-grid'});
            // addBaseClass.append("<p class='ws-setting-carousel-heading'><span>Base Class</span></p>");
            // addBaseClass.append(baseClasss);
            // optList.append(addBaseClass);
            //Base Class 

            //Theme 
            // __current_col_edit.attr("data-theme","owl-theme");
            // if(typeof(curCarousel) != "undefined" ){
            //     if(typeof(curCarousel['theme']) != "undefined"){
            //         var theme = curCarousel['theme'];
            //     }else{
            //         var theme = "";
            //     }
            // }
            // var themes = $("<input>",{
            //     class:"text-list ws-theme carouselSetting",
            //     type:"text",
            //     value:theme,
            //     name:"sectionTheme",
            //     // readOnly:true,
            //     id:"theme",
            //     "data-type":"data-theme"
            // });
            // var addTheme = $("<div/>",{class:'ws-theme ws-section-setting no-flex ws-grid'});
            // addTheme.append("<p class='ws-setting-carousel-heading'><span>Theme</span></p>");
            // addTheme.append(themes);
            // optList.append(addTheme);
            //Theme 

            // Responsive settings
            if (typeof curCarousel !== "undefined" && typeof curCarousel['responsive'] !== "undefined") {
                var responsiveOption = curCarousel['responsive'];
            } else {
                var responsiveOption = '';
            }
            var responsiveOptions = $("<textarea>", {
                placeholder: '{ 0:{items:1, nav:true, loop:false}, 600:{items:3, nav:true, loop:false}, 1000:{items:5, nav:true, loop:false}}',
                class: "text-list ws-responsiveOptions carouselSetting",
                name: "sectionResponsiveOption",
                id: "responsive",
                "data-type": "data-responsive"
            });
            responsiveOptions.val(responsiveOption);
            var addResponsive = $("<div/>", { class: 'ws-responsive ws-section-setting no-flex ws-grid' });
            addResponsive.append("<p class='ws-setting-carousel-heading'><span>Responsive</span></p>");
            addResponsive.append(responsiveOptions);
            optList.append(addResponsive);
            // Responsive settings
            carousel_holder.append(optList);
            // carousel_holder.append("<p class='ws-setting-row-heading'><span>Responsive Settings</p>");

            //Select Breakpoints
            //  if(typeof(responsiveCarousel) != "undefined" ){
            //     if(typeof(responsiveCarousel['breakpoints']) != "undefined"){
            //         var item = responsiveCarousel['breakpoints'];
            //     }else{
            //         var item = "0";
            //     }
            // }
            // var breakpoints = $("<input>",{
            //     class:"text-list ws-display-breakpoints carouselSetting",
            //     type:"number",
            //     value:item,
            //     name:"sectionBreakpoints",
            //     id:"breakpoints",
            //     "data-type":"data-breakpoints"
            // });
            // var displayBreakpoints = $("<div/>",{class:'ws-displayBreakpoints ws-section-setting no-flex ws-grid'});
            // displayBreakpoints.append("<p class='ws-setting-carousel-heading'><span>Display breakpoints</span></p>");
            // displayBreakpoints.append(breakpoints);
            // optList.append(displayBreakpoints);
            //Select Breakpoints

            //Display items
            // if(typeof(responsiveCarousel) != "undefined" ){
            //     if(typeof(responsiveCarousel['items']) != "undefined"){
            //         var item = responsiveCarousel['items'];
            //     }else{
            //         var item = "0";
            //     }
            // }
            // var items = $("<input>",{
            //     class:"text-list ws-display-items carouselSetting",
            //     type:"number",
            //     value:item,
            //     name:"sectionItems",
            //     id:"items",
            //     "data-type":"data-items"
            // });
            // var displayItems = $("<div/>",{class:'ws-displayItems ws-section-setting no-flex ws-grid'});
            // displayItems.append("<p class='ws-setting-carousel-heading'><span>Display items</span></p>");
            // displayItems.append(items);
            // optList.append(displayItems);
            //Display items

            //Show next/prev buttons
            //  if(typeof(responsiveCarousel) != "undefined" ){
            //     if(typeof(responsiveCarousel['nav']) != "undefined"){
            //         var nav = responsiveCarousel['nav'];
            //     }else{
            //         var nav = "";
            //     }
            // }
            // var navList = ["true","false"];
            // var navVal = $("<select/>",{
            //     class:"ws-nav carouselSetting",
            //     id:"nav",
            //     "data-type":"data-nav"
            // });
            // for (let i = 0; i < navList.length; i++) {
            //     if(nav != "undefined" && navList[i] == nav){
            //         navVal.append(new Option(navList[i],navList[i],true,true));
            //     }else{
            //         navVal.append(new Option(navList[i],navList[i]));
            //     }
            // }
            // var nav = $("<div/>",{class:'ws-nav ws-section-setting no-flex ws-grid'});
            // nav.append("<p class='ws-setting-carousel-heading'><span>Show next/prev buttons</span></p>");
            // nav.append(navVal);
            // optList.append(nav);
            //Show next/prev buttons

            //Infinity loop
            // if(typeof(responsiveCarousel) != "undefined" ){
            //     if(typeof(responsiveCarousel['loop']) != "undefined"){
            //         var loop = responsiveCarousel['loop'];
            //     }else{
            //         var loop = "";
            //     }
            // }
            // var loopList = ["true","false"];
            // var loopVal = $("<select/>",{
            //     class:"ws-loop-select carouselSetting",
            //     id:"loop",
            //     "data-type":"data-loop"
            // });
            // for (let i = 0; i < loopList.length; i++) {
            //     if(loop != "undefined" && loopList[i] == loop){
            //         loopVal.append(new Option(loopList[i],loopList[i],true,true));
            //     }else{
            //         loopVal.append(new Option(loopList[i],loopList[i]));
            //     }
            // }
            // var looping = $("<div/>",{class:'ws-looping ws-section-setting no-flex ws-grid'});
            // looping.append("<p class='ws-setting-carousel-heading'><span>Infinity loop</span></p>");
            // looping.append(loopVal);
            // optList.append(looping);
            //Infinity loop

            return carousel_holder;
        }
        // show row column optons
        // make playground drop able to create new events
        /*$(playground).droppable( {
        hoverClass: "ws-hovered",
        drop: handleDropEvent
        });*/

        // setup all playground elements
        setuppPlaygroundElements();
        setupPlayground();
        const styleToString = (style) => {
            return Object.keys(style).reduce((acc, key) => (
                acc + key.split(/(?=[A-Z])/).join('-').toLowerCase() + ':' + style[key] + ';'
            ), '');
        };
        // show and hide right side sections
        $("body").on("click", ".ws-section-header", function (e) {
            e.stopImmediatePropagation();
            var show = $(e.currentTarget).data("show");
            //$(".ws-list-view").hide();
            $("." + show).show();
        });
        $("body").on("click", "#margin-toggle_button", function (e) {
            e.stopImmediatePropagation();
            $(this).toggleClass('active');
            if ($(this).hasClass('active')) {
                $(this).text('ON');
                $('#individualMargin').addClass('active');
                $('.ws-marAll').addClass('d-none');
            } else {
                $(this).text('OFF');
                $('#individualMargin').removeClass('active');
                $('.ws-marAll').removeClass('d-none');
            }
        });
        $("body").on("click", "#padding-toggle_button", function (e) {
            e.stopImmediatePropagation();
            $(this).toggleClass('active');
            if ($(this).hasClass('active')) {
                $(this).text('ON');
                $('#individualPadding').addClass('active');
                $('.ws-padAll').addClass('d-none');
            } else {
                $(this).text('OFF');
                $('#individualPadding').removeClass('active');
                $('.ws-padAll').removeClass('d-none');
            }
        });
        $("body").on("click", "#width-toggle_button", function (e) {
            e.stopImmediatePropagation();
            $(this).toggleClass('active');
            if ($(this).hasClass('active')) {
                $(this).text('ON');
                $('#individualBorder').addClass('active');
                $('.ws-border-setting').addClass('d-none');
            } else {
                $(this).text('OFF');
                $('#individualBorder').removeClass('active');
                $('.ws-border-setting').removeClass('d-none');
            }
        });
        $("body").on("click", "#radius-toggle_button", function (e) {
            e.stopImmediatePropagation();
            $(this).toggleClass('active');
            if ($(this).hasClass('active')) {
                $(this).text('ON');
                $('#individualRadius').addClass('active');
                $('.ws-radAll').addClass('d-none');
            } else {
                $(this).text('OFF');
                $('#individualRadius').removeClass('active');
                $('.ws-radAll').removeClass('d-none');
            }
        });
        // make text as editable
        $("body").on("click", ".wc_control-btn-edit", function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var colEl = $(e.currentTarget).closest(".ws-data-element");
            var checkType = colEl.attr("data-type");

            switch (checkType) {
                case "paragraph": {
                    editTextSetting(colEl);
                    break;
                }
                case "video": {
                    editVideoSetting(colEl);
                    break;
                }
                case "image": {
                    editImageSetting(colEl);
                    break;
                }
                case "button": {
                    editButtonSetting(colEl);
                    break;
                }
                case "link": {
                    editLinkSetting(colEl);
                    break;
                }
                case "social": {
                    editSocialSetting(colEl);
                    break;
                }
                case "customHtml": {
                    editHtmlSetting(colEl);
                    break;
                }
                case "headingTag": {
                    editHeadingTagSetting(colEl);
                    break;
                }
                case "carousel": {
                    editCarouselSetting(colEl);
                    break;
                }
                case "imageSlider": {
                    editImageSliderSetting(colEl);
                    break;
                }

            }

        });
        $("body").on("click", ".wc_control-btn-del", function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            let col = $(e.currentTarget).closest(".ws-row-col");
            $(e.currentTarget).closest(".ws-data-element").remove();
            if (settings.version == "inline") {
                //alert($(e.currentTarget).closest(".ws-row-col").find(".ws-data-element").length);
                if (col.find(".ws-data-element").length <= 0) {
                    col.append(inel_add);
                }
            }
        });
        $("body").on("click", ".wc_control-btn-copy", function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var rowEl = $(e.currentTarget).closest(".ws-data-element");
            var rm = Math.floor(Math.random() * 100);
            var rowName = "ws_" + new Date().valueOf() + "_" + rm;
            var klon = rowEl.clone();
            klon.prop("id", rowName);
            rowEl.after(klon);
            klon.find(".ws-data-element").each(function () {
            });
        });

        // Appying css changes
        $("body").on("keyup", ".ws-col-mar,.ws-col-pad,.ws-padding-set,.ws-margin-set,.ws-radius-set,.ws-borRadius-set,.ws-border-width-set,.ws-borderWidth-set", function (e) {
            e.stopImmediatePropagation();
            let el = $(e.currentTarget);

            if ($(this).hasClass("ws-col-mar")) {
                var tochange = __margintype[el.attr("id")];
                let slider = $(".sliderCls" + el.attr("id"));
                $(slider).slider("value", $(this).val());
                $(slider).prop("value", $(this).val());

            } else if ($(this).hasClass("ws-col-pad")) {
                var tochange = __paddingtype[el.attr("id")];
                let slider = $(".sliderCls" + el.attr("id"));
                $(slider).slider("value", $(this).val());
                $(slider).prop("value", $(this).val());

            } else if ($(this).hasClass("ws-borRadius-set")) {
                var tochange = __borderRadius[el.attr("id")];
                let slider = $(".sliderCls" + el.attr("id"));
                $(slider).slider("value", $(this).val());
                $(slider).prop("value", $(this).val());

            } else if ($(this).hasClass("ws-borderWidth-set")) {
                var tochange = __borderWidth[el.attr("id")];
                let slider = $(".sliderCls" + el.attr("id"));
                $(slider).slider("value", $(this).val());
                $(slider).prop("value", $(this).val());

            } else {
                var tochange = el.attr("id");
                let slider = $("." + tochange);
                $(slider).slider("value", $(this).val());
                $(slider).prop("value", $(this).val());
            }

            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
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
            if (settings.version == "inline") {
                __current_col_edit.css(tochange, el.val() + "px");
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));
        });

        $("body").on("change", ".ws-borderStyle-set,.ws-borderColor-set,.ws-border-color-set,.ws-border-style-set", function (e) {
            e.stopImmediatePropagation();
            let el = $(e.currentTarget);

            if ($(this).hasClass("ws-borderStyle-set")) {
                var tochange = __borderStyle[el.attr("id")];

            } else if ($(this).hasClass("ws-borderColor-set")) {
                var tochange = __borderColor[el.attr("id")];

            } else {
                var tochange = el.attr("id");
            }

            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            if ($(this).val() == "") {
                delete metaCss1[tochange];
            } else {
                metaCss1[tochange] = $(this).val();
            }
            if (settings.version == "inline") {
                __current_col_edit.css(tochange, $(this).val());
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));

        });

        $("body").on("keyup", ".social-link-txt", function (e) {
            e.stopImmediatePropagation();

            var type = $(this).attr("data-type");
            if ($(this).val() == "") {
                __current_col_edit.attr(dtype, "");
            } else {
                var dtype = "data-" + type;
                __current_col_edit.attr(dtype, $(this).val());
            }
        });
        $("body").on("propertychange change keyup paste input", ".custom-html", function (e) {
            e.stopImmediatePropagation();
            __current_col_edit.find(".custom-html-txt").remove();
            __current_col_edit.find(".icon").show();
            var txt = $(this).val();
            if ($(this).val() != "") {
                var tt = $("<div/>", {
                    class: "custom-html-txt"
                });
                tt.append(txt);
                __current_col_edit.append(tt);

            }
            if (settings.version == "inline") {
                __current_col_edit.find(".icon").hide();
            }
        });
        $("body").on("propertychange change keyup paste input", ".row-type", function (e) {
            e.stopImmediatePropagation();
            __current_col_edit.closest(".rowData").attr("data-row-type", $(this).val());
        });
        $("body").on("propertychange change keyup paste input", ".row-type-check", function (e) {
            e.stopImmediatePropagation();
            if (this.checked) {
                __current_col_edit.closest(".rowData").attr("data-row-type", "container-with-row");
            } else {
                __current_col_edit.closest(".rowData").attr("data-row-type", $(".row-type").val());
            }

        });

        $("body").on("propertychange change keyup paste input", ".ws-scroll-type", function (e) {
            e.stopImmediatePropagation();
            if (settings.version == "inline") {
                __current_col_edit.css("overflow", $(this).val());
            }
            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            if ($(this).val() == "none") {
                delete metaCss1["overflow"];
            } else {
                metaCss1["overflow"] = $(this).val();
            }

            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));
        });

        $("body").on("propertychange change keyup paste input", ".ws-bg-x", function (e) {
            e.stopImmediatePropagation();
            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            if ($(this).val() == "none") {
                delete metaCss1["background-position-x"];
            } else {
                metaCss1["background-position-x"] = $(this).val();
            }
            if (settings.version == "inline") {
                __current_col_edit.css("background-position-x", $(this).val());
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));

        });

        $("body").on("propertychange change keyup paste input", ".ws-bg-y", function (e) {
            e.stopImmediatePropagation();
            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            if ($(this).val() == "none") {
                delete metaCss1["background-position-y"];
            } else {
                metaCss1["background-position-y"] = $(this).val();
            }
            if (settings.version == "inline") {
                __current_col_edit.css("background-position-y", $(this).val());
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));

        });
        $("body").on("propertychange change keyup paste input", ".ws-bg-size", function (e) {
            e.stopImmediatePropagation();
            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            if ($(this).val() == "") {
                delete metaCss1["background-size"];
            } else {
                metaCss1["background-size"] = $(this).val();
            }
            if (settings.version == "inline") {
                __current_col_edit.css("background-size", $(this).val());
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));

        });

        $("body").on("propertychange change keyup paste input", ".ws-bg-attach", function (e) {
            e.stopImmediatePropagation();
            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            if ($(this).val() == "") {
                delete metaCss1["background-attachment"];
            } else {
                metaCss1["background-attachment"] = $(this).val();
            }
            if (settings.version == "inline") {
                __current_col_edit.css("background-attachment", $(this).val());
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));

        });

        $("body").on("propertychange change keyup paste input", ".ws-align-text", function (e) {
            e.stopImmediatePropagation();
            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            if ($(this).val() == "none") {
                delete metaCss1["text-align"];
            } else {
                metaCss1["text-align"] = $(this).val();
            }
            if (settings.version == "inline") {
                __current_col_edit.css("text-align", $(this).val());
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));

        });

        $("body").on("propertychange change keyup paste input", ".ws-mobile-res", function (e) {
            e.stopImmediatePropagation();
            __current_col_edit.attr("data-mobile", $(this).val());

        });

        $("body").on("propertychange change keyup paste input", ".ws-tablet-res", function (e) {
            e.stopImmediatePropagation();
            __current_col_edit.attr("data-tablet", $(this).val());

        });

        $("body").on("propertychange change keyup paste input", ".ws-mobFont-set", function (e) {
            e.stopImmediatePropagation();
            __current_col_edit.attr("data-mobile-font", $(this).val());

        });

        $("body").on("propertychange change keyup paste input", ".ws-tabFont-set", function (e) {
            e.stopImmediatePropagation();
            __current_col_edit.attr("data-tablet-font", $(this).val());

        });

        $("body").on("change", ".ws-picker-bg", function () {
            var metaCss = __current_col_edit.attr("data-meta-css");
            if (settings.version == "inline") {
                __current_col_edit.css("background", $(this).val());
            }
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            if ($(".ws-picker-bgcheck").is(":checked")) {
                metaCss1["background"] = "none";
            } else {
                metaCss1["background"] = $(this).val();
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));
        });

        $("body").on("change", ".ws-picker-bgcheck", function () {
            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            if ($(this).is(":checked")) {
                metaCss1["background"] = "none";
            } else {
                metaCss1["background"] = "#000000";
            }
            if (settings.version == "inline") {
                __current_col_edit.css("background", 'none');
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));

        });

        $("body").on("change", ".ws-picker-text", function () {
            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            metaCss1["color"] = $(this).val();

            if (settings.version == "inline") {
                __current_col_edit.css("color", $(this).val());
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));

        });

        $("body").on("propertychange change keyup paste input", ".ws-bg-image", function () {
            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            if ($(this).val().indexOf("url")) {
                metaCss1["background-image"] = "url('" + $(this).val() + "')";
            } else {
                metaCss1["background-image"] = '';
            }

            if (settings.version == "inline") {
                __current_col_edit.css(metaCss1);
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));

        });

        $("body").on("propertychange change keyup paste input", ".ws_animation_type", function (e) {
            e.stopImmediatePropagation();
            if ($(this).val() == "none") {
                __current_col_edit.removeAttr("data-aos");
            } else {
                __current_col_edit.attr("data-aos", $(this).val());
            }
        });

        $("body").on("propertychange change keyup paste input", ".ws_animation_easing", function (e) {
            e.stopImmediatePropagation();
            if ($(this).val() == "none") {
                __current_col_edit.removeAttr("data-aos-easing");
            } else {
                __current_col_edit.attr("data-aos-easing", $(this).val());
            }
        });

        $("body").on("propertychange change keyup paste input", ".ws_animation_anchor", function (e) {
            e.stopImmediatePropagation();
            if ($(this).val() == "none") {
                __current_col_edit.removeAttr("data-aos-anchor-placement");
            } else {
                __current_col_edit.attr("data-aos-anchor-placement", $(this).val());
            }
        });
        $("body").on("propertychange change keyup paste input", ".animationSetting", function (e) {
            e.stopImmediatePropagation();
            let type = $(this).attr("data-type");
            if ($(this).val() == "") {
                __current_col_edit.removeAttr("" + type);
            } else {
                __current_col_edit.attr("" + type, $(this).val());
            }
        });

        $("body").on("propertychange change keyup paste input", ".ws-video-url", function () {
            //render video here
            __current_col_edit.attr("data-url", $(this).val());
            __current_col_edit.find(".icon").show();
            if (settings.version == "inline") {
                if ($(this).val() == "") {
                    __current_col_edit.append('<div class="icon"><span class="insert_video"></span></div>');
                } else {
                    var vLink = __current_col_edit.attr('data-url');
                    if (vLink.indexOf("youtube") != -1) {
                        var vlink = vLink.replace("watch?v=", "embed/");
                    }
                    if (vLink.indexOf("vimeo") != -1) {
                        var vlink = vLink.replace("vimeo.com", "player.vimeo.com/video");
                    }
                    if (vLink.indexOf("dailymotion") != -1) {
                        var vlink = vLink.replace("video", "embed/video");
                    }

                    var ifm = $("<iframe>", {
                        width: __current_col_edit.attr('data-width'),
                        height: __current_col_edit.attr('data-height'),
                        src: vlink,
                        "frameborder": "0",
                        "allow": "accelerometer;clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                        "allowfullscreen": "allowfullscreen"
                    });
                    __current_col_edit.find(".icon").hide();
                    __current_col_edit.find("iframe").remove();
                    __current_col_edit.append(ifm);
                }
            }
        });

        $("body").on("propertychange change keyup paste input", ".ws-image-url", function () {

            __current_col_edit.attr("data-url", $(this).val());
            __current_col_edit.find(".icon").show();
            __current_col_edit.find("a").hide();
            if (settings.version == "inline") {
                var img = $("<img>", {
                    width: __current_col_edit.attr('data-width'),
                    height: __current_col_edit.attr('data-height'),
                    src: __current_col_edit.attr('data-url'),
                    alt: __current_col_edit.attr('data-alt'),
                });
                __current_col_edit.find(".icon").hide();
                __current_col_edit.append(img);

            }
        });

        $("body").on("propertychange change keyup paste input", ".ws-image-link", function () {
            __current_col_edit.find(".icon").show();
            __current_col_edit.find("img").hide();
            if (settings.version == "inline") {
                var img = $("<img>", {
                    width: $(this).attr('data-width'),
                    height: $(this).attr('data-height'),
                    src: $(this).attr('data-url'),
                    alt: $(this).attr('data-alt'),
                });
                var islink = $(this).attr('data-link');
                if (islink != "" && islink != undefined) {
                    var link = $("<a>", {
                        href: $(this).attr('data-link'),
                        title: $(this).attr('data-alt'),
                    });
                    link.append(img);
                    __current_col_edit.find(".icon").hide();
                    __current_col_edit.append(link);
                } else {
                    __current_col_edit.find(".icon").hide();
                    __current_col_edit.append(img);
                }
            }
            __current_col_edit.attr("data-link", $(this).val());
        });

        $("body").on("propertychange change keyup paste input", ".ws-image-alt", function () {
            if (settings.version == "inline") {
                __current_col_edit.find("img").attr("alt", $(this).val());
            }
            __current_col_edit.attr("data-alt", $(this).val());
        });

        $("body").on("propertychange change keyup paste input", ".ws-button-link", function () {
            __current_col_edit.attr("data-link", $(this).val());
            __current_col_edit.find(".icon").show();
            __current_col_edit.find("button").hide();
            if (settings.version == "inline") {
                var btn = $("<button>", {
                    width: (__current_col_edit.attr('data-width') ? "" : 20),
                    height: (__current_col_edit.attr('data-height') ? "" : 20),
                    onclick: "location.href='" + __current_col_edit.attr('data-link') + "';",
                    title: __current_col_edit.attr('data-alt'),
                });
                btn.html(__current_col_edit.attr('data-alt'));
                __current_col_edit.find(".icon").hide();
                __current_col_edit.find("button").remove();//.attr("link",$(this).val());
                __current_col_edit.append(btn);
            }
        });

        $("body").on("propertychange change keyup paste input", ".ws-block-link", function () {
            __current_col_edit.attr("data-block-link", $(this).val());
            __current_col_edit.find(".icon").show();
            __current_col_edit.find("a").hide();
            if (settings.version == "inline") {
                let ln = $("<a>", {
                    href: "'" + __current_col_edit.attr('data-block-link') + "'",
                });
                __current_col_edit.find(".icon").hide();
                __current_col_edit.find("a").remove();
                __current_col_edit.append(ln);
            }
        });

        $("body").on("propertychange change keyup paste input", ".ws-button-title", function () {
            if (settings.version == "inline") {
                __current_col_edit.find("button").html($(this).val());
            }
            __current_col_edit.attr("data-alt", $(this).val());
        });

        $("body").on("propertychange change keyup paste input", ".ws-link-text", function () {
            // if(settings.version == "inline"){
            //     __current_col_edit.find("a").attr("href",$(this).val());
            // }
            __current_col_edit.attr("data-link", $(this).val());
            __current_col_edit.find(".icon").show();
            __current_col_edit.find("a").hide();
            if (settings.version == "inline") {
                let ln = $("<a>", {
                    href: "'" + __current_col_edit.attr('data-link') + "'",
                    title: __current_col_edit.attr('data-alt'),
                });
                ln.html(__current_col_edit.attr('data-alt'));
                __current_col_edit.find(".icon").hide();
                __current_col_edit.find("a").remove();//.attr("link",$(this).val());
                __current_col_edit.append(ln);
            }
        });

        $("body").on("propertychange change keyup paste input", ".ws-link-title", function () {
            if (settings.version == "inline") {
                __current_col_edit.find("a").html($(this).val());
            }
            __current_col_edit.attr("data-alt", $(this).val());
        });

        $("body").on("propertychange change keyup paste input", "#ws-element-width", function () {
            __current_col_edit.attr("data-width", $(this).val());

            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            metaCss1["width"] = $(this).val();
            if (settings.version == "inline") {
                __current_col_edit.find("img").css(metaCss1);
                __current_col_edit.find("iframe").css(metaCss1);
                __current_col_edit.find("button").css(metaCss1);
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));

        });

        $("body").on("propertychange change keyup paste input", "#ws-element-height", function () {
            __current_col_edit.attr("data-height", $(this).val());

            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            metaCss1["height"] = $(this).val();
            if (settings.version == "inline") {
                __current_col_edit.find("img").css(metaCss1);
                __current_col_edit.find("iframe").css(metaCss1);
                __current_col_edit.find("button").css(metaCss1);
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));

        });

        $("body").on("change", ".ws-bg-repeat", function () {
            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            metaCss1["background-repeat"] = $(this).val();
            if (settings.version == "inline") {
                __current_col_edit.css(metaCss1);
            }
            if ($(this).is(":checked")) {
                metaCss1["background-repeat"] = "repeat";
            } else {
                metaCss1["background-repeat"] = "no-repeat";
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));

        });

        $("body").on("change", ".ws-set-visibility", function () {
            var metaCss = __current_col_edit.attr("data-meta-css");
            if (metaCss != "" && typeof (metaCss) != "undefined") {
                var metaCss1 = JSON.parse(metaCss);
            } else {
                var metaCss1 = {};
            }
            metaCss1["display"] = $(this).val();
            if (settings.version == "inline") {
                __current_col_edit.css(metaCss1);
            }
            if ($(this).is(":checked")) {
                metaCss1["display"] = "block";
            } else {
                metaCss1["display"] = "none";
            }
            __current_col_edit.attr("data-meta-css", JSON.stringify(metaCss1));

        });

        $("body").on("propertychange change keyup paste input", ".addCss", function () {
            __current_col_edit.attr("data-add-css", $(this).val());
            if (settings.version == "inline") {
                __current_col_edit.addClass($(this).val());
            }
        });

        $("body").on("propertychange change keyup paste input", ".ws-header-title", function () {
            if (settings.version == "inline") {
                __current_col_edit.find("button").html($(this).val());
            }
            __current_col_edit.attr("data-title", $(this).val());
        })

        $("body").on("propertychange change keyup paste input", ".ws-head-tag", function () {
            if (settings.version == "inline") {
                __current_col_edit.find("button").html($(this).val());
            }
            __current_col_edit.attr("data-tag", $(this).val());
        })
        // Copy-Paste Sections

        // Trigger action when the contexmenu is about to be shown
        $(document).bind("contextmenu", function (event) {
            // Avoid the real one
            event.preventDefault();
            // Show contextmenu
            $(".custom-menu").finish().toggle(100).
                // In the right position (the mouse)
                css({
                    top: event.pageY + "px",
                    left: event.pageX + "px"
                });
        });

        // If the document is clicked somewhere
        $(document).bind("mousedown", function (e) {
            // If the clicked element is not the menu
            if (!$(e.target).parents(".custom-menu").length > 0) {
                // Hide it
                $(".custom-menu").hide(100);
            }
        });

        // Variable to store copied content
        var copiedContentKey = "copiedContent";

        function clipboardCopy(e) {
            e.preventDefault();
            var le = parseInt($(".rowData").length);
            if (__rows != 0) {
                __rows = __rows + 1;
            } else if (le <= 0) {
                __rows = __rows + 1;
            } else {
                __rows = parseInt(le) + 1;
            }

            var rowEl = $(e.currentTarget).closest(".rowData").clone();
            var klon = rowEl.clone().attr('data-count', __rows);

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

            var copiedContent = klon[0].outerHTML;
            localStorage.setItem(copiedContentKey, copiedContent);
            alert("Content copied to clipboard!");
        }

        // Function to paste the copied content
        function clipboardPaste() {
            var storedContent = localStorage.getItem(copiedContentKey);
            if (storedContent) {
                $(".ws-dashboard-playground").append(storedContent);
                $(".defaultView").remove();
                alert("Content pasted from clipboard!");
                setupDropable();
            } else {
                alert("Clipboard is empty. Copy content first.");
            }
        }

        function openInspector() {
            alert("To inspect elements, right-click on the page and choose 'Inspect' or use the keyboard shortcut Ctrl+Shift+I (Cmd+Opt+I on Mac).");
        }

        $(".custom-menu li").click(function () {
            switch ($(this).attr("data-action")) {
                case "Paste": clipboardPaste(); break;
                case "Inspect": openInspector(); break;
            }
            $(".custom-menu").hide(100);
        });

        // Copy-Paste Sections

        // $("body").on("propertychange change click", ".carouselSetting", function (e) {
        //     e.stopImmediatePropagation();
        //     __current_col_edit.find(".carousel-html-txt").remove();
        //     let el = $(this);
        //     var tochange = el.attr("id");
        //     var tochangeVal = el.val();
        //     $(".template-option").removeClass("selected");
        //     if (tochange === 'set-pagination') {
        //         if ($(this).is(":checked")) {
        //             __current_col_edit.attr("data-set-pagination",'yes');
        //             $(".ws-setPerPage").show(); 
        //             $("#set-perPage").val(__current_col_edit.attr('data-set-perPage'));
        //             __current_col_edit.attr("data-set-perPage",__current_col_edit.attr('data-set-perPage'));
        //         }else{
        //             __current_col_edit.attr("data-set-pagination",'no');
        //             $(".ws-setPerPage").hide(); 
        //             __current_col_edit.attr("data-set-perPage",'');
        //             $("#set-perPage").val("");
        //         }
        //     }
        //     if (tochange === 'collectionType') {
        //         $(".carouselCls").toggleClass("display", tochangeVal === 'Carousel');
        //         $(".accordionCls").toggleClass("display", tochangeVal === 'Accordion');

        //         $(".ws-blogsTemplateList, .ws-listPagesTemplateList, .ws-testimonialsTemplateList, .ws-servicesTemplateList, .ws-ourClientsTemplateList, .ws-ourTeamTemplateList, .ws-careerTemplateList, .ws-fAQTemplateList, .ws-ourWorksTemplateList").removeClass("display");
        //         if (tochangeVal !== 'Accordion') {
        //             if (__current_col_edit && __current_col_edit.attr("data-item-type")) {
        //                 var itemType = __current_col_edit.attr("data-item-type").replace(/\s/g, ''); // Remove spaces
        //                 itemType = itemType.charAt(0).toLowerCase() + itemType.slice(1); // Lowercase first letter
        //                 $(`.ws-${itemType}TemplateList`).addClass("display");
        //             } else {
        //                 console.error("data-item-type attribute is missing or __current_col_edit is undefined.");
        //             }
        //         }            
        //     }
        //     if (tochange === 'carousel-type') {
        //         $(".ws-fAQTemplateList, .ws-ourWorksTemplateList, .ws-blogsTemplateList, .ws-listPagesTemplateList, .ws-testimonialsTemplateList, .ws-servicesTemplateList, .ws-ourClientsTemplateList, .ws-ourTeamTemplateList, .ws-careerTemplateList").removeClass("display");
        //         for (let i = 0; i < menuList.length; i++) {
        //             if (menuList[i][2] === tochangeVal) {
        //                 __current_col_edit.attr("data-table-name", menuList[i][3]);
        //                 __current_col_edit.attr("data-menuID", menuList[i][0]);
        //                 __current_col_edit.attr("data-custom_module", menuList[i][4]);
        //                 break;
        //             }
        //         }
        //         var displayTemplate = {
        //             'Blogs': 'ws-blogsTemplateList',
        //             'List Pages': 'ws-listPagesTemplateList',
        //             'Testimonials': 'ws-testimonialsTemplateList',
        //             'Services': 'ws-servicesTemplateList',
        //             'Our Clients': 'ws-ourClientsTemplateList',
        //             'Our Team': 'ws-ourTeamTemplateList',
        //             'Career': 'ws-careerTemplateList',
        //             'FAQ': 'ws-fAQTemplateList',
        //             'Our Works': 'ws-ourWorksTemplateList'
        //         };
        //         if (__current_col_edit.attr("data-collectionType") !== 'Accordion' && displayTemplate[tochangeVal]) {
        //             $(`.${displayTemplate[tochangeVal]}`).addClass("display");
        //         }
        //     }

        //     if (tochange === 'blog-view' || tochange === 'page-view' || tochange === 'testimonials-view' || tochange === 'service-view' || tochange === 'client-view' || tochange === 'team-view' || tochange === 'career-view' || tochange === 'faq-view' || tochange === 'ourWorks-view') {
        //         $(".template-option").removeClass("selected");
        //         $(this).addClass("selected");
        //         let type = el.attr("data-type");
        //         if (el.attr("value") == "") {
        //             __current_col_edit.removeAttr("" + type);
        //         } else {
        //             __current_col_edit.attr("" + type, el.attr("value"));
        //         }
        //     }

        //     if (['collectionType', 'carousel-type', 'carousel-category', 'set-limit', 'carousel-order', 'expandType', 'set-perPage'].includes(tochange)) {
        //         __current_col_edit.attr(el.attr("data-type"), el.val());
        //     } else {
        //         var metaCss = __current_col_edit.attr("data-owl-carousel");
        //         var metaCss1 = metaCss ? JSON.parse(metaCss) : {};
        //         if (el.val() == "") {
        //             delete metaCss1[tochange];
        //         } else {
        //             metaCss1[tochange] = el.val();
        //         }
        //         if (settings.version == "inline") {
        //             __current_col_edit.css(tochange, el.val());
        //         }
        //         __current_col_edit.attr("data-owl-carousel", JSON.stringify(metaCss1));
        //     }

        //     // Code for creating carousel-html-txt element
        //     var collectionType = __current_col_edit.attr('data-collectionType') || '';
        //     var type = __current_col_edit.attr('data-item-type') || '';
        //     var newType = type.replace(/\s+/g, '_');
        //     var category = __current_col_edit.attr('data-category') || '';
        //     var limit = __current_col_edit.attr('data-set-limit') || '';
        //     var order = __current_col_edit.attr('data-order') || '';
        //     var pagination = __current_col_edit.attr('data-set-pagination') || '';
        //     var perPage = __current_col_edit.attr('data-set-perPage') || '';
        //     var template = __current_col_edit.attr('data-template') || '';
        //     var expandType = __current_col_edit.attr('data-expandType') || '';
        //     var json = __current_col_edit.attr('data-owl-carousel') || '';
        //     json = json.trim().replace(/\s+/g, '');
        //     json = json.replace(/\\n/g, '');
        //     json = JSON.stringify(json);
        //     var carouselCls = __current_col_edit.attr('id') || '';
        //     // var isCustomModule = ['Blogs', 'List Pages', 'Testimonials', 'Services', 'Our Clients', 'Our Team', 'Career', 'FAQ', 'Our Works','Gallery'].includes(type) ? 'no' : 'yes';
        //     // var content = `[type=${newType} collectionType=${collectionType} category=${category} limit=${limit} order=${order} pagination=${pagination} perPage=${perPage} isCustomModule=${isCustomModule} expandType=${expandType} template=${template} tableName=${__current_col_edit.attr("data-table-name")} menuID=${__current_col_edit.attr("data-menuID")} carouselCls=${carouselCls} json=${json.replace(/"/g, '')}]`;
        //     var content = `[type=${newType} collectionType=${collectionType} category=${category} limit=${limit} order=${order} pagination=${pagination} perPage=${perPage} isCustomModule=${__current_col_edit.attr("data-custom_module")} expandType=${expandType} template=${template} tableName=${__current_col_edit.attr("data-table-name")} menuID=${__current_col_edit.attr("data-menuID")} carouselCls=${carouselCls} json=${json.replace(/"/g, '')}]`;
        //     console.log("content",content);
        //     __current_col_edit.append($("<div/>", { class: "carousel-html-txt" }).text(content));
        // });

        $("body").on("change", ".imgSliderSetting", function (e) {
            e.stopImmediatePropagation();
            __current_col_edit.find(".imgSlider-html-txt").remove();
            var tt = $("<div/>", {
                class: "imgSlider-html-txt"
            });

            let el = $(e.currentTarget);
            let type = el.attr("data-slider");
            if (el.val() == "") {
                __current_col_edit.removeAttr("" + type);
            } else {
                __current_col_edit.attr("" + type, el.val());
            }
            var slider = __current_col_edit.attr("data-imgSlider");
            var sliderSectionID = __current_col_edit.attr('id') || '';
            var content = '[' + 'imgSlider=' + slider + ' sliderSectionID=' + sliderSectionID + ']';
            console.log("content", content);
            tt.text(content);
            __current_col_edit.append(tt);
        });

        /***************************** Save Page Function ************************************************/

        $('.save_temp').on("click", function (els) {
            var allCss = "";
            // console.log("temptemplate...",temptemplate);
            temptemplate.html($(".playgrounddiv").html());
            temptemplate.find(".rowHeaders").remove();
            temptemplate.find(".elm-action").remove();
            temptemplate.find(".ws-col-header").remove();
            //temptemplate.find(".rowData").addClass("container");
            temptemplate.find(".ws-element-wrapper").addClass("row");
            //temptemplate.find(".rowData").addClass("container");
            temptemplate.find(".rowData").removeClass("row");
            // remove all default add things
            temptemplate.find(".col-action.default").remove();
            temptemplate.find(".first-column-add.default").remove();
            temptemplate.find(".first-column-add.bt").remove();
            // remove all default icons
            temptemplate.find(".icon").remove();
            // rowData extract
            temptemplate.find(".rowData").each(function (e) {
                var tt = $(this).attr("data-row-type");
                $(this).removeClass("container-fluid");
                $(this).removeClass("container");
                var acss = $(this).attr("data-add-css");
                if (typeof (acss) != "undefined" && acss != "") {
                    $(this).addClass(acss);
                }
                if (typeof (tt) == "undefined" || tt == "") {
                    $(this).addClass("container-fluid");
                } else {
                    if (tt == "container-with-row") {
                        var rels = $("<div/>", {
                            class: "container"
                        });
                        rels.append($(this).html());
                        $(this).empty();
                        $(this).addClass("container-fluid");
                        $(this).append(rels);
                    } else {
                        $(this).addClass(tt);
                    }
                }
            });

            // ws-row-col extract
            temptemplate.find(".ws-row-col").each(function (e) {
                // console.log("ws-row-col....",temptemplate.find(".ws-row-col"));
                // console.log("$(this)...",$(this));
                //$(this).addClass("row");
                // check mobile and tablet view
                var mobileView = $(this).attr("data-mobile");
                var tabletView = $(this).attr("data-tablet");
                var mobileFont = $(this).attr("data-mobile-font");
                var tabletFont = $(this).attr("data-tablet-font");

                var csfull = $(this).attr("data-meta-css");
                var css = "";
                if (typeof (csfull) != "undefined") {
                    var css = "." + $(this).attr("id") + " {" + styleToString(JSON.parse($(this).attr("data-meta-css"))) + "} ";
                }
                var btClass = "";
                for (let index = 1; index <= 12; index++) {
                    var cc = "ws-col-size-" + index;
                    if ($(this).hasClass(cc)) {
                        btClass = "col-lg-" + index;
                    } else {

                    }
                }

                if (typeof (mobileView) != "undefined" && mobileView != "select") {
                    if (mobileView == "none") {
                        btClass = btClass + " d-none d-sm-block d-md-block";
                    } else {
                        btClass = btClass + " " + __coltypeMob["" + mobileView];
                    }

                }
                if (typeof (tabletView) != "undefined" && tabletView != "select") {
                    if (tabletView == "none") {
                        btClass = btClass + " d-none d-md-block d-lg-block";
                    } else {
                        btClass = btClass + " " + __coltypTab["" + tabletView];
                    }
                }
                $(this).removeClass();
                $(this).addClass(btClass);
                // console.log("$(this)...2",$(this));
                // Set font size for mobile view
                if (typeof (mobileFont) !== "undefined" && mobileFont !== "") {
                    css += "@media (max-width: 767px) { ." + $(this).attr("id") + " { font-size: " + mobileFont + "px; } } ";
                }
                // Set font size for tablet view
                if (typeof (tabletFont) !== "undefined" && tabletFont !== "") {
                    css += "@media (min-width: 768px) and (max-width: 991px) { ." + $(this).attr("id") + " { font-size: " + tabletFont + "px; } } ";
                }

                //$(this).addClass($(this).attr("id"));
                allCss = allCss + css;
                var acss = $(this).attr("data-add-css");
                // if(typeof(acss) != "undefined"  && acss != ""){
                //     $(this).addClass(acss);
                // }
                let parentDiv = $("<div/>");
                if (typeof (acss) != "undefined" && acss != "") {
                    parentDiv.addClass(acss);
                }
                // console.log("acss",acss);
                // parentDiv.append($(this).html());
                parentDiv.append($(this).children());
                parentDiv.addClass($(this).attr("id"));
                // console.log("parentDiv",parentDiv);

                var islink = $(this).attr('data-block-link');
                if (islink != "" && islink != undefined) {
                    var link = $("<div>", {
                        class: "clickable-block",
                        style: "cursor: pointer",
                        onclick: "location.href='" + $(this).attr('data-block-link') + "';",
                    });
                    link.append(parentDiv);
                    $(this).empty();
                    $(this).append(link);
                } else {
                    $(this).empty();
                    $(this).append(parentDiv);
                }
                $(this).removeAttr("data-add-css");
                $(this).removeAttr("data-meta-css");
                // console.log("$(this)...3",$(this));
            });

            // console.log("temptemplate html 1",temptemplate.html())
            // ws-element-wrapper extract
            temptemplate.find(".ws-element-wrapper").each(function (e) {
                var csfull = $(this).attr("data-meta-css");
                var css = "";
                if (typeof (csfull) != "undefined") {
                    var css = "." + $(this).attr("id") + " { " + styleToString(JSON.parse($(this).attr("data-meta-css"))) + " } ";
                }
                $(this).removeClass();
                var rlccss = $(this).attr("id") + " row";
                $(this).closest(".rowData").addClass(rlccss);
                $(this).closest(".rowData").removeClass("row");
                $(this).addClass("row");
                allCss = allCss + css;
                var acss = $(this).attr("data-add-css");
                if (typeof (acss) != "undefined" && acss != "") {
                    //$(this).addClass(acss);
                    $(this).closest(".rowData").addClass(acss);
                }
                $(this).removeAttr("data-add-css");
                $(this).removeAttr("data-meta-css");

                var islink = $(this).attr('data-block-link');
                if (islink != "" && islink != undefined) {
                    $(this).removeClass("row");
                    var link = $("<div>", {
                        class: "clickable-row",
                        style: "cursor: pointer",
                        onclick: "location.href='" + $(this).attr('data-block-link') + "';",
                    });
                    link.append($(this).html());
                    $(this).empty();
                    $(this).append(link);
                }
            });
            // paragraph-text extract
            temptemplate.find(".paragraph-text").each(function (e) {
                var csfull = $(this).attr("data-meta-css");
                var css = "";
                if (typeof (csfull) != "undefined") {
                    var css = "." + $(this).attr("id") + " { " + styleToString(JSON.parse($(this).attr("data-meta-css"))) + " } ";
                }
                $(this).removeClass();
                $(this).addClass($(this).attr("id"));
                allCss = allCss + css;
                var acss = $(this).attr("data-add-css");
                if (typeof (acss) != "undefined" && acss != "") {
                    $(this).addClass(acss);
                    //$(this).addClass("row");
                }
                $(this).removeAttr("data-add-css");
                $(this).removeAttr("data-meta-css");

                var islink = $(this).attr('data-block-link');
                if (islink != "" && islink != undefined) {
                    var link = $("<a>", {
                        href: $(this).attr('data-block-link'),
                        title: $(this).attr('data-alt'),
                    });
                    link.append($(this).find(".p-txt"));
                    $(this).empty();
                    $(this).append(link);
                }
            });
            // video extract
            temptemplate.find(".ws-video-link").each(function (e) {
                var csfull = $(this).attr("data-meta-css");
                var css = "";

                if (typeof (csfull) != "undefined") {

                    var ss = JSON.parse($(this).attr("data-meta-css"));
                    delete ss["width"];
                    delete ss["height"];
                    var css = "." + $(this).attr("id") + " { " + styleToString(ss) + " } ";
                }
                $(this).removeClass();
                $(this).addClass($(this).attr("id"));
                allCss = allCss + css;
                $(this).removeAttr("data-meta-css");
                var acss = $(this).attr("data-add-css");
                if (typeof (acss) != "undefined" && acss != "") {
                    $(this).addClass(acss);
                }
                $(this).removeAttr("data-add-css");
                var vLink = $(this).attr('data-url');
                if (typeof (vLink) != "undefined") {
                    if (vLink.indexOf("youtube") != -1) {
                        var vlink = vLink.replace("watch?v=", "embed/");
                    }
                    if (vLink.indexOf("vimeo") != -1) {
                        var vlink = vLink.replace("vimeo.com", "player.vimeo.com/video");
                    }
                    if (vLink.indexOf("dailymotion") != -1) {
                        var vlink = vLink.replace("video", "embed/video");
                    }
                }

                var ifm = $("<iframe>", {
                    width: $(this).attr('data-width'),
                    height: $(this).attr('data-height'),
                    src: vlink,
                    "frameborder": "0",
                    "allow": "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                    "allowfullscreen": "allowfullscreen"
                });

                $(this).empty();
                $(this).append(ifm);

            });
            // image  extract
            temptemplate.find(".ws-image-link").each(function (e) {
                var csfull = $(this).attr("data-meta-css");
                var css = "";
                if (typeof (csfull) != "undefined") {
                    var css = "." + $(this).attr("id") + " { " + styleToString(JSON.parse($(this).attr("data-meta-css"))) + " } ";
                }

                $(this).removeClass();
                $(this).addClass($(this).attr("id"));
                allCss = allCss + css;
                $(this).removeAttr("data-meta-css");
                var acss = $(this).attr("data-add-css");
                if (typeof (acss) != "undefined" && acss != "") {
                    $(this).addClass(acss);
                }
                $(this).removeAttr("data-add-css");

                if ($(this).attr('data-width') == undefined || $(this).attr('data-width') == null || $(this).attr('data-width') == '') {
                    $(this).attr('data-width', 'auto');
                } else {
                    $(this).attr('data-width', $(this).attr('data-width'));
                }
                if ($(this).attr('data-height') == undefined || $(this).attr('data-height') == null || $(this).attr('data-height') == '') {
                    $(this).attr('data-height', 'auto');
                } else {
                    $(this).attr('data-height', $(this).attr('data-height'));
                }
                if ($(this).attr('data-alt') == undefined || $(this).attr('data-alt') == null || $(this).attr('data-alt') == '') {
                    $(this).attr('data-alt', 'No image found');
                } else {
                    $(this).attr('data-alt', $(this).attr('data-alt'));
                }
                var img = $("<image>", {
                    width: $(this).attr('data-width'),
                    height: $(this).attr('data-height'),
                    src: $(this).attr('data-url'),
                    alt: $(this).attr('data-alt'),
                });
                var islink = $(this).attr('data-block-link');
                if (islink != "" && islink != undefined) {
                    var link = $("<a>", {
                        href: $(this).attr('data-block-link'),
                        title: $(this).attr('data-alt'),
                    });
                    link.append(img);
                    $(this).empty();
                    $(this).append(link);
                } else {
                    $(this).empty();
                    $(this).append(img);
                }
            });
            // button  extract
            temptemplate.find(".ws-button-link").each(function (e) {
                var csfull = $(this).attr("data-meta-css");
                var css = "";
                if (typeof (csfull) != "undefined") {
                    var css = "." + $(this).attr("id") + " { " + styleToString(JSON.parse($(this).attr("data-meta-css"))) + " } ";
                }
                $(this).removeClass();
                allCss = allCss + css;
                $(this).removeAttr("data-meta-css");
                var acss = $(this).attr("data-add-css");
                if (typeof (acss) != "undefined" && acss != "") {
                    //$(this).addClass(acss);
                }
                $(this).removeAttr("data-add-css");
                var btn = $("<button>", {
                    width: $(this).attr('data-width'),
                    height: $(this).attr('data-height'),
                    onclick: "location.href='" + $(this).attr('data-link') + "';",
                    title: $(this).attr('data-alt'),
                });
                btn.addClass(acss);
                btn.append($(this).attr('data-alt'));
                btn.addClass($(this).attr("id"));
                $(this).empty();
                $(this).append(btn);

            });
            // link-text  extract
            temptemplate.find(".ws-link-text").each(function (e) {
                var csfull = $(this).attr("data-meta-css");
                var css = "";
                if (typeof (csfull) != "undefined") {
                    var css = "." + $(this).attr("id") + " { " + styleToString(JSON.parse($(this).attr("data-meta-css"))) + " } ";
                }
                $(this).removeClass();
                $(this).addClass($(this).attr("id"));
                allCss = allCss + css;
                $(this).removeAttr("data-meta-css");
                var acss = $(this).attr("data-add-css");
                if (typeof (acss) != "undefined" && acss != "") {
                    $(this).addClass(acss);
                }
                $(this).removeAttr("data-add-css");
                var link = $("<a>", {
                    href: $(this).attr('data-link'),
                    title: $(this).attr('data-alt'),
                });
                link.append($(this).attr('data-alt'));
                $(this).empty();
                $(this).append(link);
            });
            // customHtml  extract
            temptemplate.find(".ws-customHtml-link").each(function (e) {
                $(this).find(".material-icons").remove();
                var acss = $(this).attr("data-add-css");
                if (typeof (acss) != "undefined" && acss != "") {
                    $(this).addClass(acss);
                }
                $(this).removeAttr("data-add-css");
            });
            // social  extract
            temptemplate.find(".ws-social-link").each(function (e) {
                var csfull = $(this).attr("data-meta-css");
                var css = "";
                if (typeof (csfull) != "undefined") {
                    var css = "." + $(this).attr("id") + " { " + styleToString(JSON.parse($(this).attr("data-meta-css"))) + " } ";
                }
                $(this).removeClass();
                $(this).addClass($(this).attr("id"));
                allCss = allCss + css;
                $(this).removeAttr("data-meta-css");

                var allLink = $("<div/>", {
                    class: "social-link"
                });

                var acss = $(this).attr("data-add-css");
                if (typeof (acss) != "undefined" && acss != "") {
                    $(this).addClass(acss);
                }
                $(this).removeAttr("data-add-css");
                //check for FB
                var fblink = $(this).attr("data-fb");
                if (typeof (fblink) != "undefined" && fblink != "") {
                    var link = $("<a>", {
                        href: fblink,
                        title: "FaceBook",
                    });
                    link.append('<i class="fab fa-2x fa-facebook"></i>');
                    allLink.append(link);
                }
                //check for Twiiter
                var twlink = $(this).attr("data-tw");
                if (typeof (twlink) != "undefined" && twlink != "") {
                    var link = $("<a>", {
                        href: twlink,
                        title: "Twiiter",
                    });
                    link.append('<i class="fab fa-2x fa-twitter"></i>');
                    allLink.append(link);
                }
                //check for Instagram
                var insta = $(this).attr("data-insta");
                if (typeof (insta) != "undefined" && insta != "") {
                    var link = $("<a>", {
                        href: insta,
                        title: "Twiiter",
                    });
                    link.append('<i class="fab fa-2x fa-instagram"></i>');
                    allLink.append(link);
                }
                //Check for Linkedin
                var linkin = $(this).attr("data-linkin");
                if (typeof (linkin) != "undefined" && linkin != "") {
                    var link = $("<a>", {
                        href: linkin,
                        title: "Linked In",
                    });
                    link.append('<i class="fab fa-2x fa-linkedin"></i>');
                    allLink.append(link);
                }

                $(this).empty();
                $(this).append(allLink);
            });
            // Heading Tag extract
            temptemplate.find(".ws-headingTag-link").each(function (e) {
                var csfull = $(this).attr("data-meta-css");
                var css = "";
                if (typeof (csfull) != "undefined") {
                    var css = "." + $(this).attr("id") + " { " + styleToString(JSON.parse($(this).attr("data-meta-css"))) + " } ";
                }
                $(this).removeClass();
                $(this).addClass($(this).attr("id"));
                allCss = allCss + css;
                var acss = $(this).attr("data-add-css");
                if (typeof (acss) != "undefined" && acss != "") {
                    $(this).addClass(acss);
                    //$(this).addClass("row");
                }
                $(this).removeAttr("data-add-css");
                $(this).removeAttr("data-meta-css");
                if ($(this).attr('data-tag') && $(this).attr('data-tag') != 'Select') {
                    var tag = $("<" + $(this).attr('data-tag') + ">", {
                        // any additional attributes or properties you want to set
                    });
                } else {
                    var tag = $("<h1>", {
                        // any additional attributes or properties you want to set
                    });
                }

                var islink = $(this).attr('data-block-link');
                if (islink != "" && islink != undefined) {
                    var link = $("<a>", {
                        href: $(this).attr('data-block-link'),
                        title: $(this).attr('data-alt'),
                    });
                    tag.append($(this).attr('data-title'));
                    link.append(tag);
                    $(this).empty();
                    $(this).append(link);
                } else {
                    tag.append($(this).attr('data-title'));
                    $(this).empty();
                    $(this).append(tag);
                }
            });

            temptemplate.find(".ws-carousel-link").each(function (e) {
                var csfull = $(this).attr("data-meta-css");
                var css = "";
                if (typeof (csfull) != "undefined") {
                    var css = "." + $(this).attr("id") + " { " + styleToString(JSON.parse($(this).attr("data-meta-css"))) + " } ";
                }
                $(this).removeClass();
                $(this).addClass($(this).attr("id"));
                allCss = allCss + css;
                var acss = $(this).attr("data-add-css");
                if (typeof (acss) != "undefined" && acss != "") {
                    $(this).addClass(acss);
                    //$(this).addClass("row");
                }
                $(this).removeAttr("data-add-css");
                $(this).removeAttr("data-meta-css");

            });

            temptemplate.find(".ws-imageSlider-link").each(function (e) {
                var csfull = $(this).attr("data-meta-css");
                var css = "";
                if (typeof (csfull) != "undefined") {
                    var css = "." + $(this).attr("id") + " { " + styleToString(JSON.parse($(this).attr("data-meta-css"))) + " } ";
                }
                $(this).removeClass();
                $(this).addClass($(this).attr("id"));
                allCss = allCss + css;
                var acss = $(this).attr("data-add-css");
                if (typeof (acss) != "undefined" && acss != "") {
                    $(this).addClass(acss);
                    //$(this).addClass("row");
                }
                $(this).removeAttr("data-add-css");
                $(this).removeAttr("data-meta-css");

            });
            // console.log("temptemplate html 2",temptemplate.html());
            var ob = [];
            ob["els"] = els;
            ob["css"] = allCss;
            // console.log("ob",ob);
            settings.HTMLUpdate.call(this, ob);
        });

        /***************************** Save Page Function ************************************************/
    };

})(window.jQuery || window.Zepto, window, document);