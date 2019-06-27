(function(){
  function getComputed(el,style){ var s; if( style=='width' ){ s=el.getBoundingClientRect().right-el.getBoundingClientRect().left; }else if( style=='height' ){ s=el.getBoundingClientRect().bottom-el.getBoundingClientRect().top }else if(window.getComputedStyle){ s=document.defaultView.getComputedStyle(el,null).getPropertyValue(style); }else if(el.currentStyle){ s=el.currentStyle[style] } return parseFloat(s); }
  function getPgOffset(el){ var o=[0,0]; if( el.offsetParent ){ do{ o=[o[0]+el.offsetLeft,o[1]+el.offsetTop]; }while( el=el.offsetParent ) } return [o[0]+document.body.scrollLeft,o[1]+document.body.scrollTop]; } 
  function getXY(e){ var xy=[]; if( e.touches && e.touches.length ){ if( e.touches.length>1 ){ xy[0] = (e.touches[0].pageX+e.touches[0].pageX)/2; xy[1] = (e.touches[0].pageY+e.touches[0].pageY)/2;}else{ xy[0] = e.touches[0].pageX; xy[1] = e.touches[0].pageY; } }else{ xy[0] = e.pageX; xy[1] = e.pageY; } return xy; }

  var compariscope = document.getElementById('cs-editor'),
    viewer = document.getElementById('cs-viewer'),
    wrapper = document.getElementById('cs-wrapper'),
    css = document.getElementById('cs-css'),
    fader = document.getElementById('cs-fader'),
    range = document.getElementById('cs-range'),
    imgSrc = document.getElementById('cs-iiif-src'),
    imgAdd = document.getElementById('cs-img-add'),
    imgRemove = document.getElementById('cs-img-remove'),
    imgShift = document.getElementById('cs-img-shift'),
    imgLock = document.getElementById('cs-img-lock'),
    imgSnap = document.getElementById('cs-img-snap'),
    mode = document.getElementById('cs-mode'),
    mixer = document.getElementById('cs-mixer'),
    opURL = document.getElementById('cs-op-url');
  compariscope.imgs = [];
  compariscope.css = css;
  compariscope.style.height = 'calc(100vh - 160px)'; 
  compariscope.style.width = getComputed(compariscope,'height')+'px';  

  compariscope.reSize = function(){
    var img, i,
      xyP = getPgOffset(this);
    for( i=0; i<this.imgs.length; ++i ){
      img = this.imgs[i];
      dragZoom.size(img);
      img.xyP = xyP;
    }
  }

  compariscope.fade = function(x){
    var arcs = this.imgs.length,
      vis = Math.ceil(x*arcs),
      opacity = (x%(1/arcs))*arcs;
    this.index = vis-1;
    if( (opacity===0 && x>0) || (x===1 && opacity!==1) ) opacity = 1;
    this.css.innerHTML = ' \
      #'+this.id+' :nth-child(-n+'+vis+'){ opacity:1 } \
      #'+this.id+' :nth-child(n+'+(vis+1)+'){ opacity:0; z-index:-999 } \
      #'+this.id+' :nth-child('+vis+'){ opacity:'+opacity+' } \
      ';
    if(vis>0) imgSrc.value = this.imgs[vis-1].src;
    fader.value = x;
  }

  compariscope.range = function(){
    var arcs = this.imgs.length,
      rangeHTML = '';
    for( i=1; i<=arcs; ++i ){
      rangeHTML += '<div style="width:'+(100/arcs)+'%">'+i+'</div>';
    }
    range.innerHTML = rangeHTML;
  }

  compariscope.onmousedown = function(e){ 
    if( e.target === this ) this.rsReset = 1;
  };

  compariscope.onmousemove = function(e){ 
    if( e.target === this ){
      if( this.rsReset ){
        this.rsReset = 0;
        setTimeout(function(){ compariscope.style.width = '400px'; compariscope.style.height = '400px'; }, 0);
      }
      window.requestAnimationFrame(function(){ compariscope.reSize() });
    }
  };

  /* utility for shrinking viewer to fixed size set by CSS, e.g. height: 60vw; */
  viewer.size = function(){
    const img = viewer.getElementsByTagName('img')[0];
    if (img.naturalHeight) {
      clearTimeout(img.timer);
      viewer.style.height = '';
      const cH = Math.ceil(img.naturalHeight * img.width / img.naturalWidth) + 'px';
      viewer.style.height = cH;
    } else {
      img.timer = setTimeout(function(){ viewer.size(); }, 50);
    }
  };

  window.onload = function(e){ imgSrc.focus(); }

  imgAdd.onclick = function(e){ 
    if( imgSrc.value.indexOf('/full/full/') < 0 ){
      alert('Expects a IIIF API URL for the full size & full region of an image.');
      return false;
    }
    var img = document.createElement('img');
    img.src = imgSrc.value;
    compariscope.appendChild(img);
    img.onload = function() {
      if( compariscope.imgs.length===1 ){ 
        compariscope.style.width = Math.round(getComputed(compariscope,'height') * this.naturalWidth/this.naturalHeight)+'px';  
      }
      if( this.naturalWidth > this.naturalHeight ){
        this.style.width = '100%'; this.style.height = 'auto';
      }else{
        this.style.width = 'auto'; this.style.height = '100%';
      }
      setTimeout(function(){ dragZoom.init(img, {'zoom':1, 'siblings':compariscope.imgs}) }, 0);
      compariscope.fade(1);
    }
    compariscope.imgs.push(img);
    compariscope.range();
  };

  imgShift.onclick = function(e){
    var i = compariscope.index,
      img = compariscope.imgs[i];
    if( i===compariscope.imgs.length-1 ) return;
    compariscope.imgs[i] = img.nextSibling;
    compariscope.imgs[i+1] = img;
    compariscope.insertBefore(img.nextSibling, img);
    compariscope.fade(parseFloat(fader.value) + (1/compariscope.imgs.length));
  };

  imgRemove.onclick = function(e){
    var i = compariscope.index;
    compariscope.removeChild(compariscope.imgs[i]);
    compariscope.fade(1);
    compariscope.imgs.splice(i, 1);
    compariscope.range();
  };

  imgLock.onclick = function(e){
    this.classList.toggle('active');
    for( i=0; i<compariscope.imgs.length; ++i ){
      compariscope.imgs[i].lock = this.classList.contains('active') ? true : false;
    }
  };

  imgSnap.onclick = function(e){
    var i = compariscope.index,
      img = compariscope.imgs[i],
      lock0 = img.lock;
    compariscope.style.width = img.wh[0]+'px'; compariscope.style.height = img.wh[1]+'px';
    for( i=0; i<compariscope.imgs.length; ++i ){
      dragZoom.size(compariscope.imgs[i]);
    }
    img.lock = 1;
    img.move([0,0]);
    if( !lock0 ) img.lock = 0;
  };

  fader.oninput = function(e){ 
    window.requestAnimationFrame(function(){
      compariscope.fade(e.target.value);
    });
  };

  mode.onclick = function(e){
    var img, i,
      html = sizes = logs = '', srcset, src,
      duo = compariscope.imgs.length===2,
      variants = [320, 640, 960, 1280, 1920], v,
      variant1 = duo? '960' : '1920';
    viewer.opURLs = [];
    if( compariscope.imgs.length===2 ) sizes = 'calc(50vw)';
    for( i=0; i<compariscope.imgs.length; ++i ){
      srcset = '';
      img = compariscope.imgs[i];
      if( img.xy[0]>0 || img.xy[1]>0 || img.xy[0]+img.wh[0]<img.whP[0] || img.xy[1]+img.wh[1]<img.whP[1] ) {
        alert('Layer '+ (i+1) +' is under-cropped!');
        return;
      }
      src = img.src.replace('/full/full/', '/pct:'+Number(Math.round((-100*img.xy[0]/img.wh[0])+"e+3")+"e-3")+','+Number(Math.round((-100*img.xy[1]/img.wh[1])+"e+3")+"e-3")+','+Number(Math.round((100*img.whP[0]/img.wh[0])+"e+3")+"e-3")+','+Number(Math.round((100*img.whP[1]/img.wh[1])+"e+3")+"e-3")+'/full/');
      logs += src + '\n';
      for( v=0; v<variants.length; ++v ){
        if( v>0 ) srcset += ', ';
        srcset += (src.replace('full', variants[v]+',') + ' '+variants[v]+'w');
      }
      viewer.opURLs.push(src);
      src = src.replace('full', variant1+',');
      html += '<img src="'+src+'" srcset="'+srcset+'" sizes="'+sizes+'">';
    }
    console.log(logs);
    viewer.innerHTML = html;
    viewer.classList.remove('cs-split');
    viewer.classList.remove('cs-unsplit');
    mixer.classList.add('display-none');
    mixer.classList.remove('cs-splitter');
    wrapper.classList.toggle('cs-preview');
    if( wrapper.classList.contains('cs-preview') ){
      if( duo ){
        viewer.classList.add('cs-split');
        mixer.classList.remove('display-none');
      }else{
        iFader.init(viewer);
      }
    }else{
      iFader.uninit(viewer);
    }
  };

  mixer.onclick = function(e){
    var mixing = viewer.classList.contains('cs-split')
    this.classList.toggle('cs-splitter');
    viewer.classList.toggle('cs-split');
    viewer.classList.toggle('cs-unsplit');
    if( mixing ){ setTimeout(function(){ iFader.init(viewer) }, 1500) }
    else{ iFader.uninit(viewer) }
  };

  var iFader = {
    id:0,
    size: function(el){
      el.w = Math.ceil(el.childNodes[0].width);
      el.x = Math.ceil((getComputed(document.body,'width')-el.w)/2);
    },
    init: function(el){
      el.arcs = el.getElementsByTagName('img').length-1;
      if( !el.fade ){
        el.id = el.id || el.className+(++iFader.id);
        el.css = el.appendChild(document.createElement('style'));
        el.onmousemove = iFader.touch;
        el.ontouchmove = iFader.touch;
        el.fade = function(x){
          x = 1-x;
          var vis = Math.ceil(x*this.arcs)+1,
            opacity = (x%(1/this.arcs))*this.arcs;
          if( x===0 || (opacity===0 && x>0) || (x===1 && opacity!==1) ){ opacity = 1; }
          this.css.innerHTML = ' \
            #'+el.id+' :nth-child(-n+'+vis+'){ opacity:1 } \
            #'+el.id+' :nth-child(n+'+(vis+1)+'){ opacity:0; z-index:-999 } \
            #'+el.id+' :nth-child('+vis+'){ opacity:'+opacity+' } \
            ';
          opURL.innerHTML = viewer.opURLs[Math.round(x*this.arcs+1)-1];
        }
      }
    },
    touch: function(e){
      e = e || window.event;
      if( !this.w ){ iFader.size(this); }
      var xyE = getXY(e);
      if( xyE[0]>this.x && xyE[0]<this.x+this.w){
        this.fade((xyE[0]-this.x)/this.w);
      }
    },
    uninit: function(el){
      el.fade = null;
      el.onmousemove = null;
      el.ontouchmove = null;
      el.css.remove();
    }
  }

  var dragZoom = {
    el:null, xy0:null, v0:null, xyT:null, xyE:null, d0:null, 
    size: function(el){
      el.wh = [Math.ceil(getComputed(el,'width')), Math.ceil(getComputed(el,'height'))];
      el.whP = [Math.round(getComputed(el.P,'width')), Math.round(getComputed(el.P,'height'))];
      el.xyP = getPgOffset(el.P);
      el.style.width = el.wh[0]+'px'; el.style.height = el.wh[1]+'px';
    },
    init: function(el, opt){
      if( typeof el==='string' ){ el = document.querySelector(el); } if( !el ){ return; }
      if( !opt ) var opt = {};
      el.zoomer = opt.zoom || 0;
      el.siblings = opt.siblings || el.parentNode.getElementsByTagName(el.tagName);
      el.P = el.parentNode;
      dragZoom.size(el);
      el.xy = [getComputed(el,'left'), getComputed(el,'top')];
      if( !el.move ){
        el.onmousedown = dragZoom.touch;
        el.ontouchstart = dragZoom.touch;
        if( window.addEventListener ){
          el.addEventListener('DOMMouseScroll', dragZoom.touch, false); 
          el.addEventListener('mousewheel', dragZoom.touch, false); 
        }else if( window.attachEvent ){
          el.attachEvent('onmousewheel', dragZoom.touch);
        }
        el.move = function(xy){
          var x=xy[0], y=xy[1];
          if( this.lock ){
            var xy2 = [xy[0]-this.xy[0], xy[1]-this.xy[1]]; 
            for( i=0; i<this.siblings.length; ++i ){
              this.siblings[i].moveBy(xy2);
            }
          }else{
            this.style.left = x+'px';
            this.style.top = y+'px';
            this.xy = [x,y];
          }
        };
        el.moveBy = function(xy){
          var x=xy[0], y=xy[1];
          this.xy = [this.xy[0]+x, this.xy[1]+y];
          this.style.left = this.xy[0]+'px';
          this.style.top = this.xy[1]+'px';
        };
        if( el.zoomer ){
          el.zoom = function(z){
            var xy0 = [dragZoom.xyT[0]-this.xyP[0],dragZoom.xyT[1]-this.xyP[1]],
              sib, 
              lock0;
            for( i=0; i<this.siblings.length; ++i ){
              sib = this.siblings[i];
              if( !this.lock && sib!==this ) continue;
              lock0 = sib.lock;
              sib.wh = [sib.wh[0]*z,sib.wh[1]*z];
              sib.style.width = sib.wh[0]+'px';
              sib.style.height = sib.wh[1]+'px';
              sib.lock = 0;
              sib.move([xy0[0]-((xy0[0]-sib.xy[0])*z),xy0[1]-((xy0[1]-sib.xy[1])*z)]);
              if( lock0 ) sib.lock = 1;
            }
          };
        }
      }
    },
    touch: function(e){
      e = e || window.event;
      if( e.type==='touchstart' && e.touches && e.touches.length>2 ){ return; }
      dragZoom.el = this;
      dragZoom.xy0 = dragZoom.el.xy;
      dragZoom.xyT = getXY(e);
      if( e.type==='touchstart' ){
        if( dragZoom.el.zoomer && e.touches && e.touches.length===2 ){
          dragZoom.d0 = Math.sqrt(Math.pow(e.touches[0].pageX-e.touches[1].pageX,2)+Math.pow(e.touches[0].pageY-e.touches[1].pageY,2));
          dragZoom.el.ontouchmove = dragZoom.zoom;
        }else{
          dragZoom.el.ontouchmove = dragZoom.drag;
        }
        dragZoom.el.onmousedown = null;
        dragZoom.el.ontouchend = function(){
          dragZoom.el.ontouchmove = null;
          dragZoom.el.ontouchend = null;
          dragZoom.release();
        };
      }else{
        if( e.type==='DOMMouseScroll' || e.type==='mousewheel' ){
          if( dragZoom.el.zoomer ){ dragZoom.zoom(e); }
        }else{
          document.onmousemove = dragZoom.drag;
          document.onmouseup = function(){
            document.onmousemove = null;
            document.onmouseup = null;
            dragZoom.release();
          };
        }
      }
      return false;
    },
    drag: function(e){
      e = e || window.event;
      dragZoom.xyE = getXY(e);
      var xy = [dragZoom.xy0[0]+dragZoom.xyE[0]-dragZoom.xyT[0], dragZoom.xy0[1]+dragZoom.xyE[1]-dragZoom.xyT[1]];
      dragZoom.el.move(xy);
      return false;
    },
    release: function(){
      dragZoom.el = dragZoom.xyE = dragZoom.d0 = null;
    },
    zoom: function(e){
      e = e || window.event;
      if( e.preventDefault ){ e.preventDefault(); }else{ e.returnValue=false; }
      var z, d1, tD = e.timeStamp-dragZoom.el.zT;
      zZ = tD<10 ? 25 : 1;
      if( e.touches ){
        d1 = Math.sqrt(Math.pow(e.touches[0].pageX-e.touches[1].pageX,2)+Math.pow(e.touches[0].pageY-e.touches[1].pageY,2));
        z = 1+((d1-dragZoom.d0>0?(d1/dragZoom.el.whP[0]):-0.5)*0.1);
        dragZoom.d0 = d1;
      }else{
        z = (e.detail? e.detail*-1 : e.wheelDelta/40); 
        z = 1+((z>0?1:-1)*0.005*zZ);
      }
      dragZoom.el.zT = e.timeStamp;
      dragZoom.el.zoom(z);
      return false;
    }
  };
})();
