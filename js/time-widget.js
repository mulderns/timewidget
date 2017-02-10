(function( timewidget, $,  undefined ) {

/**
  // Private Properties
  var pripro = [];

  // Public Property
  timewidget.public = "Public!";

  // Private Method
  function prime(item) { console.log(item); }

  // Public Method
  timewidget.pubme = function(){ alert("yeah!"); };
**/

  var _options = {
    snap: 30,
    color1: "cyan",
    color2: "orange",
    color3: "gray"
  };

  var ctx;
  var widgets = {};
  var widget_cache;

  function createWidget() {
    var that = {
      wid: generate_widget_id(),
      geom: geom(),
      angle: 0,
      ctx: undefined,
      down: false,
      cache: undefined

    };

    return that;
  }

  function geom() {
    var that = {
      centerx: 0,
      centery: 0,
      width: 0,
      height: 0,
      line_strong: 2,
      line_normal: 1
    };
    return that;
  }

  var minuteAngle = Math.PI/(6*60);

  function getClosestSnap(snap, deg) {
    if(deg < 0){
      deg += Math.PI * 2;
    }
    var minutes = Math.round((deg - Math.PI/2 )/ minuteAngle);
    var remain = minutes % snap;
    if(remain > Math.ceil(snap/2)){
      minutes = minutes - remain + snap;
    } else {
      minutes = minutes - remain;
    }
    return minutes * minuteAngle + Math.PI/2;
  }

  function getAngle(widget, event) {
    // atan2(y2 - y1, x2 - x1);
    var angle = Math.atan2(event.layerY - widget.geom.centery, event.layerX - widget.geom.centerx);

    angle = getClosestSnap(_options.snap, angle);

    return angle;
  }

  function generate_widget_id() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + s4();
  }

  function drawWidget(wid) {
    //console.debug(widgets.hasOwnProperty(wid));
    var widget = widgets[wid];
    var canvas = $('#'+wid).children('canvas')[0];
    widget.ctx = canvas.getContext("2d");
    console.debug(widget);

    // canvas width
    var styles = window.getComputedStyle(canvas);
    var mwidth = styles.getPropertyValue('width');
    var mheight = styles.getPropertyValue('height');
    mwidth = parseInt(mwidth, 10);
    mheight = parseInt(mheight, 10);
    canvas.width = mwidth;
    canvas.height = mwidth;

    widget.geom.width = canvas.width;
    widget.geom.height = canvas.height;

    widget.geom.line_strong = Math.max(2, Math.min(widget.geom.width, widget.geom.height) * 0.02);
    widget.geom.line_normal = Math.max(1, Math.min(widget.geom.width, widget.geom.height) * 0.01);

    widget.geom.centerx = (widget.geom.width % 2 === 0 ?
      Math.floor(widget.geom.width / 2) : Math.floor(widget.geom.width / 2) + 1);
    widget.geom.centery = (widget.geom.height % 2 === 0 ?
      Math.floor(widget.geom.height / 2) : Math.floor(widget.geom.height / 2) + 1);
    widget.geom.radius = (Math.min(widget.geom.width, widget.geom.height) % 2 === 0 ?
      Math.min(widget.geom.width, widget.geom.height) / 2 :
      Math.floor(Math.min(widget.geom.width, widget.geom.height) / 2));

    widget.geom.radius -= 5;

    widget.geom.inner_radius = Math.floor(widget.geom.radius * 0.7);

    console.debug("w: "+ widget.geom.width + " h:" + widget.geom.height);

    // clear cached background
    widget.cache = undefined;

    drawBackground(widget);
    drawHands(widget);

    //var time_deg1 = Math.random() * Math.PI*2;
    //var time_deg2 = Math.random() * Math.PI*2;
    //drawHand(time_deg1);
    //drawHand(time_deg2);
    //shadeSector(time_deg1, time_deg2);
  }

  function updateWidget(wid) {
    var widget = widgets[wid];
    widget.ctx.clearRect(0,0,widget.geom.width,widget.geom.height);
    drawBackground(widget);
    drawHands(widget);
  }

  // shade clock sector
  function shadeSector(widget, deg1, deg2) {
    var ctx = widget.ctx;
    var geom = widget.geom;
    ctx.fillStyle = _options.color3;
    //ctx.fillStyle = "rgba(200,200,200,0.5)";
    ctx.beginPath();
    ctx.arc(
      geom.centerx,
      geom.centery,
      geom.inner_radius * 1.1,
      deg1, deg2
    );
    ctx.lineTo(geom.centerx, geom.centery);
    ctx.fill();
  }

  function drawHands(widget) {
    if(widget.angle2 !== -1){
      shadeSector(widget, widget.angle1, widget.angle2);
      drawHandle(widget, widget.angle2);
    }
    drawHandle(widget, widget.angle1);
  }

  // draw handle
  function drawHandle(widget, angle) {
    var ctx = widget.ctx;
    var geom = widget.geom;

    var handle_radius = Math.max(1, geom.radius * 0.12);

    var handle_x1 = Math.cos(angle);
    var handle_y1 = Math.sin(angle);

    ctx.strokeStyle = _options.color2;

    // hand
    ctx.beginPath();
    ctx.moveTo(
      geom.centerx + handle_x1 * (geom.radius - handle_radius) ,
      geom.centery + handle_y1 * (geom.radius - handle_radius)
    );
    ctx.lineTo(geom.centerx,geom.centery);
    ctx.stroke();

    // end
    ctx.beginPath();
    ctx.arc(
      geom.centerx + handle_x1 * (geom.radius - handle_radius*0.5),
      geom.centery + handle_y1 * (geom.radius - handle_radius*0.5),
      handle_radius/2, 0, Math.PI*2
    );
    ctx.stroke();
  }

  function drawBackground(widget) {
    var ctx = widget.ctx;
    var geom = widget.geom;

    if(widget.cache){
      //console.debug("wc",widget,":",widget.cache);
      ctx.putImageData(widget.cache, 0, 0);
      //console.debug("using cached background");
      return;
    }

/*
    // frame
    ctx.lineWidth=1;
    ctx.strokeStyle = "green";
    ctx.strokeRect(0,0, geom.width, geom.height);

    // center
    ctx.fillStyle = "yellow";
    ctx.fillRect(geom.centerx,geom.centery,1,1);

    // bounding circle
    ctx.strokeStyle = "red";
    ctx.beginPath();
    //arc(x, y, r, start, stop [, counterclockwise]);
    ctx.arc(geom.centerx, geom.centery, geom.radius, 0, Math.PI * 2);
    ctx.stroke();
*/

    // inner circle
    ctx.strokeStyle = _options.color1;
    ctx.lineWidth = geom.line_normal;
    ctx.beginPath();
    ctx.arc(geom.centerx, geom.centery, geom.inner_radius, 0, Math.PI * 2);
    ctx.stroke();

    // clock center
    ctx.fillStyle = "dark" + _options.color1;
    ctx.beginPath();
    ctx.arc(geom.centerx, geom.centery, Math.max(1, geom.inner_radius*0.05), 0, Math.PI * 2);
    ctx.fill();

    // hours
    ctx.strokeStyle = _options.color1;
    ctx.lineCap="round";

    var quart = 0;
    for(var deg = 0; deg < Math.PI * 2; deg = deg + Math.PI * 2 / 12){
      var x1 = geom.centerx + Math.cos(deg) * geom.inner_radius;
      var y1 = geom.centery + Math.sin(deg) * geom.inner_radius;
      var x2 = geom.centerx + Math.cos(deg) * geom.inner_radius/1.2;
      var y2 = geom.centery + Math.sin(deg) * geom.inner_radius/1.2;

      if(quart++ % 3 === 0){
        ctx.lineWidth = geom.line_strong;
        x1 = geom.centerx + Math.cos(deg) * geom.inner_radius*1.2;
        y1 = geom.centery + Math.sin(deg) * geom.inner_radius*1.2;
        x2 = geom.centerx + Math.cos(deg) * geom.inner_radius/1.2;
        y2 = geom.centery + Math.sin(deg) * geom.inner_radius/1.2;

      } else {
        ctx.lineWidth = geom.line_normal;
      }

      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.stroke();

      //console.debug("line: (" +x1 + ", " +y1 + ") -> (" +x2 + ", " +y2 +")");

    }
    ctx.lineCap="butt";

    // outer ring dots
    ctx.fillStyle= "dark" + _options.color1;
    for(deg = 0; deg < Math.PI * 2; deg = deg + Math.PI * 2 / 12) {
      var handle_radius = Math.max(1, geom.radius * 0.12);
      var rx1 = geom.centerx + Math.cos(deg) * (geom.radius - handle_radius*0.5);
      var ry1 = geom.centery + Math.sin(deg) * (geom.radius - handle_radius*0.5);
      ctx.beginPath();
      ctx.arc(rx1,ry1,geom.inner_radius*0.03,0,Math.PI*2);
      ctx.fill();
    }

    // store to cache
    widget.cache = ctx.getImageData(0,0, geom.width, geom.height);
  }

  timewidget.activate = function() {
    console.debug("activating");
    $("x-timewidget").forEach(function (elem, indx, arra) {
      var wid = fillTagContents(elem);
      drawWidget(wid);
    });
  };

  timewidget.setup = function(options){
    for (var opt in options) {
      if (options.hasOwnProperty(opt) && _options.hasOwnProperty(opt)) {
        _options[opt] = options[opt];

      }
    }
    console.debug(_options);
  };


  //var hourangle = Math.PI / 6;

  function getTime(angle) {
    //
    if(angle < 0){
      angle += Math.PI*2;
    }
    angle = angle + Math.PI / 2;

    var minutes = Math.round(angle / minuteAngle);
    var minute = minutes % 60;
    var hour = (minutes - minute)/60;



    // TODO : fix to get accurate

/*
    var hour = Math.floor(angle/hourangle);
    var minute = Math.floor((angle - hourangle*hour*1.0) * 120.0);
    var minutes = Math.round(angle / minuteAngle);
    console.debug(minutes);
    console.debug(angle, '/', hourangle, '->', hour, ':', minute, angle-hourangle*hour);
*/
    hour = (hour < 10 ? "0" + hour : hour);
    minute = (minute < 10 ? "0" + minute : minute);

    return hour+":"+minute;

  }

  function updateValue(wid){
    var input = $("#" + wid).last();
    var widget = widgets[wid];
    console.debug(input);
    input.val(getTime(widget.angle1));
    console.debug(getTime(widget.angle1));

  }

  function fillTagContents(elem) {
    var widget = createWidget();
    widgets[widget.wid] = widget;

    $(elem).append($("<div id='" + widget.wid + "'><canvas></canvas><input type='hidden' value='00:00' name='timewidget-" + widget.wid + "'/></div> "));

    $(elem).mousedown(function(event) {
      timewidget.mousedown(widget.wid, event);
    });

    $(elem).mousemove(function(event) {
      timewidget.mousemove(widget.wid, event);
    });

    $(elem).mouseup(function(event) {
      timewidget.mouseup(widget.wid, event);
    });

    return widget.wid;
  }

  timewidget.mousedown = function(wid, event) {
    console.log("down");
    var widget = widgets[wid];
    widget.angle1 = getAngle(widget, event);
    widget.angle2 = -1;
    widget.down = true;
    updateWidget(wid);
  };

  timewidget.mousemove = function(wid, event) {
    if(widgets[wid].down){
      console.log("move");
      widgets[wid].angle2 = getAngle(widgets[wid], event);
      updateWidget(wid);
    }
  };

  timewidget.mouseup = function(wid, event) {
    console.log("up");
    widgets[wid].angle2 = getAngle(widgets[wid], event);
    widgets[wid].down = false;
    updateWidget(wid);
    updateValue(wid);
  };


}(window.timewidget = window.timewidget || {}, $));
