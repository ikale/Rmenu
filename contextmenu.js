// 在全局保存,使用右键的dom元素
var BINDCONTAINERS = [];
// 添加remove方法
BINDCONTAINERS.__proto__.remove = function(val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

function setContraierContextmenu() {
  document.removeEventListener("contextmenu", handleEvent);
  document.removeEventListener("click", handleEvent);
  document.addEventListener("contextmenu", handleEvent);
  document.addEventListener("click", handleEvent);
  function handleEvent(e) {
    switch (e.type) {
      case "contextmenu":
        for (const dom of BINDCONTAINERS) {
          const menu = dom.rmenu;
          if (e.path.indexOf(dom) > -1) {
            console.log("右键菜单", e);
            e.preventDefault ? (e.returnValue = false) : "";
            for (const el of e.path) {
              if (el.bid) {
                menu.activeBid = el.bid;
                menu.activeDom = menu.isbind_containers[el.bid];
                break;
              }
            }

            menu.targetEl = e.path[0];
            menu.show(e);
          } else {
            menu.hide();
          }
        }
        break;
      case "click":
        for (const dom of BINDCONTAINERS) {
          const menu = dom.rmenu;
          // rmenuId
          if (e.path.indexOf(document.getElementById(dom.rmenuId)) === -1) {
            menu.hide();
          }
        }
        break;
    }
  }
}

setContraierContextmenu();

/**
 * 获取dom坐标
 * @param obj
 * @return {x,y};
 */
function getXY(obj) {
  var x = 0,
    y = 0;
  if (obj.getBoundingClientRect) {
    var box = obj.getBoundingClientRect();
    var D = document.documentElement;
    x =
      box.left +
      Math.max(D.scrollLeft, document.body.scrollLeft) -
      D.clientLeft;
    y = box.top + Math.max(D.scrollTop, document.body.scrollTop) - D.clientTop;
  }
  return {
    x,
    y,
  };
}

class Contextmenu {
  constructor(nodeConfigs) {
    this._stopRun = false;
    this._inited = false;
    this.id = "Rmeun_" + Math.random() * 100000;
    this._bid = 1;
    this.display = false;
    this.isbind_containers = {};

    this._configs = {};
    let dom = document.createElement("div");
    dom.id = this.id;
    dom.className = "KR-meun";
    dom.style.position = "absolute";
    document.body.appendChild(dom);
    this.dom = document.getElementById(this.id);
    this.hide();

    if (nodeConfigs) {
      this.update(nodeConfigs);
    }
  }

  addMenu(nodeConfigs, position) {
    position = position || "bottom";

    if (nodeConfigs instanceof Array || !typeof nodeConfigs === "object") {
      throw new Error("<Contextmenu :addMenu > This node configs is wrong!!");
    }
    if (position === "bottom") {
      for (const key in nodeConfigs) {
        this._configs[key] = nodeConfigs[key];
      }
    }
    if (position === "top") {
      for (const key in this._configs) {
        nodeConfigs[key] = this._configs[key]
      }
      this._configs = nodeConfigs
    }
    this.update(this._configs);
  }

  update(nodeConfigs) {
    if (!this.isObject(nodeConfigs)) {
      throw new Error("Rmenu创建失败-->dom配置文件错误");
    }
    for (const el of this.dom.childNodes) {
      this.dom.removeChild(el);
    }
    this._inited = false;
    this._configs = nodeConfigs;
    this.__init();
  }
  __init() {
    if (this._inited) {
      return;
    }
    // 初始化创建主节点
    let d = this._creat_dom(this._configs);
    this.dom.appendChild(d, true);
    this._inited = true;
  }
  _creat_dom(val, ismain = false) {
    let dom = document.createElement("ul");
    dom.style.zIndex = 9999999999999;
    // 判断是否为 主层
    ismain
      ? (dom.className = "KR-pane")
      : ((dom.className = "KR-pane subdom"),
        (dom.style.position = "absolute"),
        (dom.style.top = 0));
    for (let key in val) {
      if (this.isObject(val[key])) {
        const menuInfo = val[key];
        const menuTitle = menuInfo.title;
        const menuIcon = menuInfo.icon;

        let d = document.createElement("li");
        d.style.position = "relative";
        d.style.cursor = "default";
        d.style.listStyle = "none";
        this.has_sub_dom(menuInfo)
          ? (d.has_sub_dom = true)
          : (d.has_sub_dom = false);
        d.innerHTML = d.has_sub_dom
          ? `<i style="display:inline-block" class="micon-custoum iconfont ${menuIcon}"></i> <span class="mtitle" style="display:inline-block">${menuTitle ||
              key}</span> <i class="micon iconfont iconmore"></i>`
          : `<i style="display:inline-block" class="micon-custoum iconfont ${menuIcon}"></i> <span style="display:inline-block" class="mtitle">${menuTitle ||
              key}</span>`;

        d.dom_info = menuInfo;
        d.init_sub = false;
        d.onmouseover = (e) => {
          let el = e.srcElement.tagName === "LI" ? e.path[0] : e.path[1];
          el.className = "choose";

          // 鼠标悬停初始化创建节点
          if (!d.init_sub && d.has_sub_dom) {
            let _d = this._creat_dom(el.dom_info);
            _d.style.left = el.clientWidth - 2 + "px";
            el.appendChild(_d);
            d.init_sub = true;
          }
          // 鼠标悬停显示节点
          if (el.has_sub_dom) {
            el.lastChild.style.display = "block";
            // console.log('悬停，子元素',el.clientWidth)
          }

          const targetEl = el.lastChild;
          // console.log("目标", targetEl);
          if (this.ischangeY) {
            // console.log("更改弹出方式，向上弹出");
            targetEl.style.top =
              -targetEl.offsetHeight +
              targetEl.childNodes[0].offsetHeight +
              "px";
          } else {
            targetEl.style.top = 0;
          }

          if (this.ischangeX) {
            // console.log("更改弹出方式，向左弹出");
            targetEl.style.left = -targetEl.offsetWidth + "px";
          } else {
            targetEl.style.left = targetEl.offsetWidth + "px";
          }

          const thisParent = targetEl.parentElement;
          const thisChildUL = targetEl.parentElement.getElementsByClassName(
            "KR-pane"
          )[0];
          const displayY = document.body.offsetHeight;

          if (thisChildUL) {
            // console.log("更改弹出方式，向上弹出");
            const wucha =
              getXY(thisParent).y + thisChildUL.offsetHeight - displayY;
            // console.log("误差",wucha);
            if (wucha > 0) {
              targetEl.style.top = -wucha + "px";
            } else {
              targetEl.style.top = 0;
            }
          }
        };

        d.onmouseleave = (e) => {
          // 鼠标离开隐藏节点
          let el = e.srcElement.tagName === "LI" ? e.path[0] : e.path[1];
          el.className = "";
          el.lastChild.tagName === "UL"
            ? (el.lastChild.style.display = "none")
            : "";
        };

        d.onmousedown = (e) => {
          // 鼠标点击

          let el = e.srcElement.tagName === "LI" ? e.path[0] : e.path[1];
          // console.log(el.dom_info);

          this.do_callback(el.dom_info.target, el) ? this.hide() : "";
        };

        dom.appendChild(d);
      }
    }
    return dom;
  }

  do_callback(target_fn, el) {
    // 执行回调任务

    let that = this;
    if (this._stopRun) {
      return;
    }
    this._stopRun = true;
    let targetEl = this.targetEl;
    let activeDom = this.activeDom;
    let func = function() {
      if (typeof target_fn === "function") {
        return target_fn(targetEl, activeDom, el);
      }

      if (target_fn === undefined || target_fn === "") {
        return false;
      } else {
        console.warn(`<target> 处理函数错误... ${target_fn}`);
        return false;
      }
    };
    setTimeout(() => {
      that._stopRun = false;
    }, 0);

    return func();
  }

  has_sub_dom(val) {
    for (let key in val) {
      if (this.isObject(val[key])) {
        return true;
      }
    }
    return false;
  }

  show(e) {
    // 初始化检查

    !this._inited ? this.__init() : "";
    const x = e.pageX;
    const y = e.pageY;

    this.display = true;
    this.dom.style.display = "block";
    this.dom.style.top = e.pageY + 1 + "px";
    this.dom.style.left = e.pageX + 1 + "px";

    this.ischangeX = false;
    this.ischangeY = false;
    const targetEl = this.dom.lastChild;

    const displayX = document.body.offsetWidth;
    const displayY = document.body.offsetHeight;

    if (x + targetEl.offsetWidth >= displayX) {
      console.log("1111333311更改弹出方式，向左弹出");
      this.ischangeX = true;
      this.dom.style.left = x - this.dom.lastChild.clientWidth + "px";
    }

    console.log(y + targetEl.offsetHeight, displayY);
    if (y + targetEl.offsetHeight >= displayY) {
      console.log("更改弹出方式，向上弹出");
      this.ischangeY = true;
      this.dom.style.top = y - this.dom.lastChild.clientHeight + "px";
    }
  }
  hide() {
    this.display = false;
    this.dom.style.display = "none";
  }
  isObject(value) {
    const type = typeof value;
    if (type === "object" && value !== null && !(value instanceof Array)) {
      return true;
    } else {
      return false;
    }
  }
  _get_container_domnode(ds) {
    //   智能获取容器dom节点实例
    let container = ds;
    const errorMessage = "Root dom is null, can not initialize!";
    if (!container) {
      throw new Error(errorMessage);
    }
    if (typeof container === "string") {
      container =
        document.getElementById(ds) || document.getElementsByClassName(ds);
    }
    if (!container) {
      throw new Error(errorMessage);
    }
    return container;
  }

  bind(ds) {
    //   绑定dom容器
    const container = this._get_container_domnode(ds);
    if (container.rmenu) {
      console.warn(`${ds} 已经绑定过了..`);
      return;
    }

    BINDCONTAINERS.push(container); //添加到全局

    // 标识dom容器已经绑定
    container.rmenu = this;
    container.bid = "bid_" + this._bid;
    container.rmenuId = this.id;
    this.isbind_containers[container.bid] = container;
    this._bid++;
  }

  unbind(ds) {
    // 解除绑定
    const container = this._get_container_domnode(ds);
    BINDCONTAINERS.remove(container); //从全局删除

    if (container.rmenu) {
      container.rmenu = null;
      container.rmenuId = null;
      delete this.isbind_containers[container.bid];
      container.oncontextmenu = function(e) {
        e.preventDefault;
      };
      container.onclick = function() {
        return false;
      };
    }
  }
  dispose() {
    for (const key in this.isbind_containers) {
      const bnode = this.isbind_containers[key];
      this.unbind(bnode);
      delete this.isbind_containers[key];
    }
  }
}
