class Contextmenu {
  constructor(dom_config) {
    if(dom_config){
      this.initial(dom_config)
    }
  }
  initial(dom_config){
    if (!this.isObject(dom_config)) {
      throw new Error("Rmenu创建失败-->dom配置文件错误");
    }
    this._stopRun = false;
    this._inited = false;
    this.id = "Rmeun_" + Math.random() * 100000;
    this._bid = 1;

    this._config = dom_config;
    let dom = document.createElement("div");
    dom.id = this.id;
    dom.className = "KR-meun";
    dom.style.position = "absolute";
    document.body.appendChild(dom);
    this.dom = document.getElementById(this.id);

    this.x = 0;
    this.y = 0;
    this.display = false;
    this.hide()
    this.isbind_containers = {};
  }
  update(dom_config) {
    for (const el of this.dom.childNodes) {
      this.dom.removeChild(el);
    }
    this._inited = false;
    this._config = dom_config;
    this.__init();
  }
  __init() {
    if (this._inited) {
      return;
    }
    // 初始化创建主节点
    let d = this._creat_dom(this._config);
    this.dom.appendChild(d, true);
    this._inited = true;
  }
  _creat_dom(val, ismain = false) {
    let dom = document.createElement("ul");
    // 判断是否为 主层
    ismain
      ? (dom.className = "KR-pane")
      : ((dom.className = "KR-pane subdom"),
        (dom.style.position = "absolute"),
        (dom.style.top = 0));
    for (let key in val) {
      if (this.isObject(val[key])) {
        let d = document.createElement("li");
        d.style.position = "relative";
        d.style.cursor = "default";
        d.style.listStyle = "none";
        this.has_sub_dom(val[key])
          ? (d.has_sub_dom = true)
          : (d.has_sub_dom = false);
        d.innerHTML = d.has_sub_dom
          ? `<i style="display:inline-block" class="micon-custoum iconfont ${
              val[key].icon
            }"></i> <span class="mtitle" style="display:inline-block">${
              val[key].title || key
            }</span> <i class="micon iconfont iconmore"></i>`
          : `<i style="display:inline-block" class="micon-custoum iconfont ${
              val[key].icon
            }"></i> <span style="display:inline-block" class="mtitle">${val[key].title || key}</span>`;

        d.dom_info = val[key];
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
    let parent = this.activeDom;

    let func = function () {
      if (typeof target_fn === "function") {
        return target_fn(el, parent);
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

  show(x, y) {
    // 初始化检查
    !this._inited ? this.__init() : "";
    this.x = x;
    this.y = y;
    this.display = true;

    this.dom.style.display = "block";
    this.dom.style.top = y + "px";
    this.dom.style.left = x + "px";
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
    let container = this._get_container_domnode(ds);
    if (container.rmenu) {
      console.warn(`${ds} 已经绑定过了..`);
      return;
    }

    let menu = this;
    container.oncontextmenu = function (e) {
      // 阻止默认事件
      // console.log(e.path[0].bid);
      e.preventDefault ? (e.returnValue = false) : "";
      menu.activeBid = e.path[0].bid;
      menu.activeDom = menu.isbind_containers[e.path[0].bid];
      menu.show(e.pageX+2, e.pageY+2);
    };

    container.onclick = function (e) {
      if (
        menu.display === true &&
        (e.clientX < menu.x ||
          e.clientX > menu.x + menu.dom.offsetWidth ||
          e.clientY < menu.y ||
          e.clientY > menu.y + menu.dom.offsetHeight)
      ) {
        console.log("菜单关闭");
        menu.hide();
      }
    };
    // 标识dom容器已经绑定
    container.rmenu = this;
    container.bid = "bid_" + this._bid;
    this.isbind_containers[container.bid] = container;
    this._bid++;
  }

  unbind(ds) {
    // 解除绑定
    let container = this._get_container_domnode(ds);
    if (container.rmenu) {
      container.rmenu = null;
      container.oncontextmenu = function (e) {
        e.preventDefault;
      };
      container.onclick = function () {
        return false;
      };
    }
  }
}
