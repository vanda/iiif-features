export const dragnZoom = {
  el: null,
  xy0: null,
  xyT: null,
  xyE: null,
  d0: null,
  size: (el) => {
    el.wh = [
      Math.ceil(el.getBoundingClientRect().width),
      Math.ceil(el.getBoundingClientRect().height)
    ];
    el.whP = [
      Math.round(el.parentNode.getBoundingClientRect().width),
      Math.round(el.parentNode.getBoundingClientRect().height)
    ];
    el.style.width = `${el.wh[0]}px`;
    el.style.height = `${el.wh[1]}px`;
  },
  init: (el, opt) => {
    el.zoomer = (opt && opt.zoom) ? opt.zoom : true;
    dragnZoom.size(el);
    el.xy = [el.getBoundingClientRect().left, el.getBoundingClientRect().top];
    if (!el.move) {
      el.onmousedown = dragnZoom.touch;
      el.ontouchstart = dragnZoom.touch;
      el.addEventListener('DOMMouseScroll', dragnZoom.touch, false);
      el.addEventListener('mousewheel', dragnZoom.touch, false);
      el.move = (xy) => {
        if (el.wh[0] >= el.whP[0]) {
          if (xy[0] > 0) {
            xy[0] = 0;
          } else if (xy[0] < el.whP[0] - el.wh[0]) {
            xy[0] = el.whP[0] - el.wh[0];
          }
        }
        if (el.wh[1] >= el.whP[1]) {
          if (xy[1] > 0) {
            xy[1] = 0;
          } else if (xy[1] < el.whP[1] - el.wh[1]) {
            xy[1] = el.whP[1] - el.wh[1];
          }
        }
        el.style.left = `${xy[0]}px`;
        el.style.top = `${xy[1]}px`;
        el.xy = xy;
      };
      if (el.zoomer) {
        el.zoom = (z) => {
          if (el.wh[0] * z > el.whP[0] && el.wh[1] * z > el.whP[1]) {
            const xy0 = [dragnZoom.xyT[0] + el.xy[0], dragnZoom.xyT[1] + el.xy[1]];
            el.move([xy0[0] - ((xy0[0] - el.xy[0]) * z), xy0[1] - ((xy0[1] - el.xy[1]) * z)]);
            el.wh = [el.wh[0] * z, el.wh[1] * z];
            el.style.width = `${el.wh[0]}px`;
            el.style.height = `${el.wh[1]}px`;
          } else {
            if ((el.whP[0] / el.wh[0]) * el.wh[1] > el.whP[1]) {
              el.style.width = '100%';
              el.style.height = 'auto';
              el.move([0, el.xy[1]]);
            } else {
              el.style.width = 'auto';
              el.style.height = '100%';
              el.move([el.xy[0], 0]);
            }
            el.wh = [el.getBoundingClientRect().width, el.getBoundingClientRect().height];
          }
        };
      }
    }
  },
  touch: (e) => {
    e.preventDefault();
    if (e.type === 'touchstart' && e.touches && e.touches.length > 2) return;
    dragnZoom.el = e.currentTarget;
    dragnZoom.el.dataset.dragnZoomActive = true;
    dragnZoom.xy0 = dragnZoom.el.xy;
    if (e.type === 'touchstart') {
      if (dragnZoom.el.zoomer && e.touches && e.touches.length === 2) {
        dragnZoom.xyT = [e.offsetX, e.offsetY];
        dragnZoom.d0 = Math.sqrt(
          ((e.touches[0].pageX - e.touches[1].pageX) ** 2)
          + ((e.touches[0].pageY - e.touches[1].pageY) ** 2)
        );
        dragnZoom.el.ontouchmove = dragnZoom.zoom;
      } else {
        dragnZoom.xyT = [e.pageX, e.pageY];
        dragnZoom.el.ontouchmove = dragnZoom.drag;
      }
      dragnZoom.el.onmousedown = null;
      dragnZoom.el.ontouchend = () => {
        dragnZoom.el.ontouchmove = null;
        dragnZoom.el.ontouchend = null;
        dragnZoom.release();
      };
    } else {
      if (e.type === 'DOMMouseScroll' || e.type === 'mousewheel') { // eslint-disable-line no-lonely-if
        dragnZoom.xyT = [e.offsetX, e.offsetY];
        if (dragnZoom.el.zoomer) dragnZoom.zoom(e);
      } else {
        dragnZoom.xyT = [e.pageX, e.pageY];
        document.onmousemove = dragnZoom.drag;
        document.onmouseup = () => {
          document.onmousemove = null;
          document.onmouseup = null;
          dragnZoom.release();
        };
      }
    }
    return false;
  },
  drag: (e) => {
    dragnZoom.xyE = [e.pageX, e.pageY];
    const xy = [
      dragnZoom.xy0[0] + dragnZoom.xyE[0] - dragnZoom.xyT[0],
      dragnZoom.xy0[1] + dragnZoom.xyE[1] - dragnZoom.xyT[1]
    ];
    dragnZoom.el.move(xy);
  },
  release: () => {
    dragnZoom.el.dataset.dragnZoomActive = false;
    dragnZoom.el = dragnZoom.xyE = dragnZoom.d0 = null;
  },
  zoom: (e) => {
    const tD = e.timeStamp - dragnZoom.el.zT;
    const zZ = tD < 10 ? 23 : 3;
    let z = 1;
    if (e.touches) {
      const d1 = Math.sqrt(
        ((e.touches[0].pageX - e.touches[1].pageX) ** 2)
        + ((e.touches[0].pageY - e.touches[1].pageY) ** 2)
      );
      z = 1 + ((d1 - dragnZoom.d0 > 0 ? (d1 / dragnZoom.el.whP[0]) : -0.5) * 0.1);
      dragnZoom.d0 = d1;
    } else {
      z = (e.detail ? e.detail * -1 : e.wheelDelta / 40);
      z = 1 + ((z > 0 ? 1 : -1) * 0.005 * zZ);
    }
    dragnZoom.el.zT = e.timeStamp;
    dragnZoom.el.zoom(z);
  }
};
