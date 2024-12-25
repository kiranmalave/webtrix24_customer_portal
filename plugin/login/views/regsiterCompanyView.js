define([
    'jquery',
    'underscore',
    'backbone',
    'owlcarousal',
    'RealTimeUpload',
    '../../core/views/multiselectOptions',
    '../models/customerSetupModel',
    "../../loginTemplate/collections/loginTemplateCollection",
    'text!../templates/registerCompany_temp.html',
    'Swal'
  
  ], function ($, _, Backbone, owlcarousal,RealTimeUpload,multiselectOptions,customerSetupModel,loginTemplateCollection, registerCompany_temp,Swal) {
    var regsiterCompanyView = Backbone.View.extend({
      model: customerSetupModel,
      fireworks:[],
      initialize: function (option) {
        var selfobj = this;
        this.userID = option.userID;
        this.model = new customerSetupModel();
        
        this.multiselectOptions = new multiselectOptions();
        this.slideList = [];
        this.model.set("vcode",option.userID);
        this.slideList = new loginTemplateCollection();
        this.slideList.fetch({
          headers: {
            'contentType': 'application/x-www-form-urlencoded', 'SadminID': $.cookie('authid'), 'token': $.cookie('_bb_key'), 'Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: 'post', data: { status: 'active', getAll: 'Y'}
        }).done(function (res) {
          if (res.flag == "F") {showResponse('',res,'');};
          if (res.statusCode == 994) { app_router.navigate("logout", { trigger: true }); }
          $(".popupLoader").hide();
          selfobj.render();
        });
      },
      events:
      {
        "click .loadSubView": "loadSubView",
        "click .showHidePassword": "showHidePassword",
        "click .btnNext": "btnNext",
        "click .previous": "previous",
        "blur .txtchange": "updateOtherDetails",
        "click .multiSel": "setValues",
        "click .preSubmit": "companySetup",        
      },
      updateOtherDetails: function (e) {
        var valuetxt = $(e.currentTarget).val();
        var toID = $(e.currentTarget).attr("id");
        var newdetails = [];
        newdetails["" + toID] = valuetxt;
        this.model.set(newdetails);
      },
      setValues: function (e) {
        var selfobj = this;
        var da = selfobj.multiselectOptions.setCheckedValue(e);
        selfobj.model.set(da);
      },
      companySetup:function(e){
        e.preventDefault();
        this.progressContainer.css("display","block");
        this.progressBar.css("width","0%");
        $(".login_content").css("display","none");
        let selfobj = this;
        this.simulateProgress();
        this.model.save({}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded','Accept': 'application/json'
          }, error: selfobj.onErrorHandler, type: "POST"
        }).done(function (res) {
          if (res.flag == "F") {
            showNotification("alert-danger",res.msg);
          }else{
            if (res.flag == "F") {showResponse('',res,'');return;};
            selfobj.progressBar.css("width","100%");
            selfobj.progressContainer.css("display","none");
            $(".congratulations").css("display","block");
            //showNotification("alert-sucess","Your setup has been completed successfully.");
            selfobj.triggerFireworksForDuration();
            if(res.flag == "S"){
              setTimeout(() => {
                window.location.href = "https://"+res.account_name+".webtrix24.com/#login?&token="+res.token;
              },6000);
            }
            // setTimeout(() => {
            //   window.location.href = "https://"+res.account_name+".webtrix24.com/#login?&ps="+res.data.pass+"&us="+res.data.uname;
            // },6000);
          }
        });
      },
      simulateProgress:function() {
        let progress = 0;

        const interval = setInterval(() => {
            if (progress < 90) { // Progress until 90% (you can set your logic here)
                progress += 5;
                progressBar.style.width = `${progress}%`;
            } else {
                clearInterval(interval); // Stop interval once it's near 100%
            }
        }, 300); // Interval for progress update (you can adjust timing)
    },
      previous: function () {
        var activeTab = document.querySelector('.active-tab');
        var previousTab;
        $(".preSubmit").hide();
        $('.btnNext').show();
        if (activeTab) {
          previousTab = activeTab.previousElementSibling;
          if (previousTab && previousTab.classList.contains('form-contents')) {
            activeTab.classList.remove('active-tab');
            previousTab.classList.add('active-tab');
            if (previousTab.getAttribute('id') == 'form1') {
              $('.previous').attr('disabled', true);
            }
          } else {
            //console.log("No next tab available");
          }
        } else {
          // If no tab is currently active, add active-tab to the first tab
          var firstTab = document.querySelector('.form-contents');
          if (firstTab) {
            firstTab.classList.add('active-tabPre');
          } else {
            //console.log("No form is currently available");
          }
        }
        let ctab = $(previousTab).attr('data-item');
        $(".progress-step").removeClass("green");
        for (let index = 1; index < ctab; index++) {
          $(".progress-step.form"+index).addClass("green");
        }
        if(ctab == 1){
          $(".progress-step.form"+1).addClass("green");
        }
        $(".progress-text").html(ctab+"/6");
      },
      btnNext: function () {
        var activeTab = document.querySelector('.active-tab');
        var nextTab;
        if(this.model.get("comapnyName") == "" || this.model.get("comapnyName")== null){
          showNotification("alert-danger","Comapny name Required");
          return;
        }
        if (activeTab) {
          $(".previous").show();
          nextTab = activeTab.nextElementSibling;
          if (nextTab && nextTab.classList.contains('form-contents')) {
  
            activeTab.classList.remove('active-tab');
            nextTab.classList.add('active-tab');
            if ($(nextTab).attr('id') == 'form6') {
              $('.btnNext').hide();
              $(".preSubmit").show();
            }
            if ($(activeTab).attr('id') == 'form1') {
              $('.previous').removeAttr('disabled');
            }
            let ctab = $(activeTab).attr('data-item');
            $(".progress-step").removeClass("green");
            ctab = parseInt(ctab)  +1;
            for (let index = 1; index <= ctab; index++) {
              $(".progress-step.form"+index).addClass("green");
            }
            $(".progress-text").html(ctab+"/6")
            //$(".progress-step."+ctab).addClass("green");
  
          } else {
            //console.log("No next tab available");
          }
  
        } else {
          // If no tab is currently active, add active-tab to the first tab
          var firstTab = document.querySelector('.form-contents');
          if (firstTab) {
            firstTab.classList.add('active-tab');
          } else {
            //console.log("No form is currently available");
          }
        }
      },
      onErrorHandler: function (collection, response, options) {
        Swal.fire({title: 'Failed !',text: "Something was wrong ! Try to refresh the page or contact administer. :(",timer: 2000,icon: 'error',showConfirmButton: false});      
        $(".profile-loader").hide();
      },
      initializeValidate: function () {
        var selfobj = this;
        this.progressBar = $("#progressBar");
        this.progressContainer = $("#progressContainer");
        this.startRequestButton = $("#startRequest");
        this.canvas = this.$("#fireworksCanvas")[0];
        console.log(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        console.log(this.ctx);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.isAnimating = false;
        // Start the animation loop
        this.animate();
      },
      loadSubView: function (e) {
        var show = $(e.currentTarget).attr("data-show");
        switch (show) {
          case "verification": {
            var userVerification = new regsiterCompanyView();
            break;
          }
        }
      },
      Particle: function (x, y, color, velocity) {
        return {
            x: x,
            y: y,
            color: color,
            velocity: velocity,
            alpha: 1,
            friction: 0.98,
            gravity: 0.03,
            update: function () {
                this.velocity.x *= this.friction;
                this.velocity.y *= this.friction;
                this.velocity.y += this.gravity;
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                this.alpha -= 0.015;
            },
            draw: function (ctx) {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(
                    this.x - this.velocity.x * 2,
                    this.y - this.velocity.y * 2
                );
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
            },
        };
    },

    Firework: function (x, y) {
        const particles = [];
        const particleCount = 60;
        const colors = ['#3243a2', '#2599ff', '#754fdd', '#4f3b84', '#f9a335'];

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed,
            };
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(this.Particle(x, y, color, velocity));
        }

        return {
            particles: particles,
            update: function () {
                this.particles.forEach((particle, index) => {
                    particle.update();
                    if (particle.alpha <= 0) {
                        this.particles.splice(index, 1);
                    }
                });
            },
            draw: function (ctx) {
                this.particles.forEach(particle => particle.draw(ctx));
            },
            isDone: function () {
                return this.particles.length === 0;
            },
        };
    },

    triggerFireworksForDuration: function () {
      var selfobj = this;
        if (selfobj.isAnimating) return; // Prevent re-triggering during animation
        selfobj.isAnimating = true;

        const interval = setInterval(() => {
            for (let i = 0; i < 4; i++) {
                const x = Math.random() * selfobj.canvas.width;
                const y = Math.random() * selfobj.canvas.height * 0.4;
                selfobj.fireworks.push(this.Firework(x, y));
            }
        }, 500);

        setTimeout(() => {
            clearInterval(interval);
            selfobj.isAnimating = false;
        },4000);
    },

    animate: function () {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.fireworks.forEach((firework, index) => {
            firework.update();
            firework.draw(this.ctx);
            if (firework.isDone()) {
                this.fireworks.splice(index, 1);
            }
        });

        requestAnimationFrame(this.animate.bind(this));
    },
      render: function () {
        var selfobj = this;
        var logintemp = registerCompany_temp;
        var template = _.template(logintemp);
        // this.$el.html(template());
        this.$el.html(template({"slideList": this.slideList ? this.slideList.models : []}));
        $(".main_container").empty().append(this.$el);
        $('#owl-carousel').owlCarousel({
          loop: true,
          margin: 30,
          dots: true,
          nav: false,
          items: 1,
          autoplay: true,
          autoplayTimeout: 2500,
          autoplayHoverPause: true
        });
        $("#companyLogo").RealTimeUpload({
          text: 'Drag and Drop or Select a File to Upload.',
          maxFiles: 1,
          maxFileSize: 4194304,
          uploadButton: false,
          notification: true,
          autoUpload: true,
          extension: ['png', 'jpg', 'jpeg'],
          // extension: ['png', 'jpg', 'jpeg', 'gif', 'pdf','docx', 'doc', 'xls', 'xlsx'],
          thumbnails: true,
          action: APIPATH + 'companyLogo/'+btoa(selfobj.userID).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
          element: "companyLogo", // Use a unique identifier for each element
          onSucess: function () {
            $(".preSubmit").trigger("click");
          }
        });
        this.initializeValidate();
        return this;
      },
  
    });
  
    return regsiterCompanyView;
  
  });