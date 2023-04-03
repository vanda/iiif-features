export const dragnZoom = {
  el: null,
  xy0: null,
  xyT: null,
  xyE: null,
  d0: null,
  size: (el) => {
    el._props.wh = [
      Math.ceil(el.getBoundingClientRect().width),
      Math.ceil(el.getBoundingClientRect().height)
    ];
    el._props.whP = [
      Math.round(el.parentNode.getBoundingClientRect().width),
      Math.round(el.parentNode.getBoundingClientRect().height)
    ];
    el.style.width = `${el._props.wh[0]}px`;
    el.style.height = `${el._props.wh[1]}px`;
  },
  init: (el, opt = {}) => {
    el._props = {
      zoomer: opt.zoom || true
    };
    dragnZoom.size(el);
    el._props.xy = [
      el.getBoundingClientRect().left - el.parentNode.getBoundingClientRect().left,
      el.getBoundingClientRect().top - el.parentNode.getBoundingClientRect().top
    ];
    el.dataset.dragnZoomElement = 'true';
    if (!el._props.move) {
      el.onmousedown = dragnZoom.touch;
      el.ontouchstart = dragnZoom.touch;
      el.addEventListener('DOMMouseScroll', dragnZoom.touch);
      el.addEventListener('mousewheel', dragnZoom.touch);
      el._props.move = (xy) => {
        if (el._props.wh[0] >= el._props.whP[0]) {
          if (xy[0] > 0) {
            xy[0] = 0;
          } else if (xy[0] < el._props.whP[0] - el._props.wh[0]) {
            xy[0] = el._props.whP[0] - el._props.wh[0];
          }
        }
        if (el._props.wh[1] >= el._props.whP[1]) {
          if (xy[1] > 0) {
            xy[1] = 0;
          } else if (xy[1] < el._props.whP[1] - el._props.wh[1]) {
            xy[1] = el._props.whP[1] - el._props.wh[1];
          }
        }
        if (el._props.siblingLock) {
          const dXY = [
            xy[0] - el._props.xy[0],
            xy[1] - el._props.xy[1]
          ]; 
          Array.from(el.parentNode.querySelectorAll('[data-dragn-zoom-element]'), (sibling) => {
            if (sibling._props.siblingLock) {
              sibling._props.moveBy(dXY);
            }
          });
        } else {
          el.style.left = `${xy[0]}px`;
          el.style.top = `${xy[1]}px`;
          el._props.xy = xy;
        }
      };
      el._props.moveBy = (xy) => {
        el._props.xy = [
          el._props.xy[0] + xy[0],
          el._props.xy[1] + xy[1]
        ];
        el.style.left = `${el._props.xy[0]}px`;
        el.style.top = `${el._props.xy[1]}px`;
      };
      if (el._props.zoomer) {
        el._props.zoom = (z) => {
          if (el._props.wh[0] * z > el._props.whP[0] && el._props.wh[1] * z > el._props.whP[1]) {
            const xy0 = [dragnZoom.xyT[0] + el._props.xy[0], dragnZoom.xyT[1] + el._props.xy[1]];
            el._props.move([xy0[0] - ((xy0[0] - el._props.xy[0]) * z), xy0[1] - ((xy0[1] - el._props.xy[1]) * z)]);
            el._props.wh = [el._props.wh[0] * z, el._props.wh[1] * z];
            el.style.width = `${el._props.wh[0]}px`;
            el.style.height = `${el._props.wh[1]}px`;
          } else {
            if ((el._props.whP[0] / el._props.wh[0]) * el._props.wh[1] > el._props.whP[1]) {
              el.style.width = '100%';
              el.style.height = 'auto';
              el._props.move([0, el._props.xy[1]]);
            } else {
              el.style.width = 'auto';
              el.style.height = '100%';
              el._props.move([el._props.xy[0], 0]);
            }
            el._props.wh = [el.getBoundingClientRect().width, el.getBoundingClientRect().height];
          }
        };
      }
    }
  },
  touch: (e) => {
    e.preventDefault();
    if (e.type === 'touchstart' && e.touches && e.touches.length > 2) return;
    dragnZoom.el = e.currentTarget;
    dragnZoom.el.dataset.dragnZoomActive = 'true';
    dragnZoom.xy0 = dragnZoom.el._props.xy;
    if (e.type === 'touchstart') {
      if (dragnZoom.el._props.zoomer && e.touches && e.touches.length === 2) {
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
        if (dragnZoom.el._props.zoomer) dragnZoom.zoom(e);
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
    dragnZoom.el._props.move(xy);
  },
  release: () => {
    dragnZoom.el.dataset.dragnZoomActive = false;
    dragnZoom.el = dragnZoom.xyE = dragnZoom.d0 = null;
  },
  zoom: (e) => {
    const tD = e.timeStamp - dragnZoom.el._props.zT;
    const zZ = tD < 10 ? 23 : 3;
    let z = 1;
    if (e.touches) {
      const d1 = Math.sqrt(
        ((e.touches[0].pageX - e.touches[1].pageX) ** 2)
        + ((e.touches[0].pageY - e.touches[1].pageY) ** 2)
      );
      z = 1 + ((d1 - dragnZoom.d0 > 0 ? (d1 / dragnZoom.el._props.whP[0]) : -0.5) * 0.1);
      dragnZoom.d0 = d1;
    } else {
      z = (e.detail ? e.detail * -1 : e.wheelDelta / 40);
      z = 1 + ((z > 0 ? 1 : -1) * 0.005 * zZ);
    }
    dragnZoom.el._props.zT = e.timeStamp;
    dragnZoom.el._props.zoom(z);
  }
};
