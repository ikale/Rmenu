/**
 * 判断样式名是否存在
 * @param className
 * @param str
 * @return Bollen;
 */
function hasClassName(className, str) {
  let arr = className.trim().split(/\s+/);
  return arr.indexOf(str) > -1 ? true : false;
}

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

/**
 * 生成控制器
 * @param step_el
 * @param dirction  默认为横向 {1 'row'| 0 'col'}
 */
function genControler(steup_el, dirction, size, line_size, line_color) {
  dirction = typeof dirction === "string" ? dirction.trim() : "row";
  size = typeof size === "number" ? size : 12;
  line_size = typeof line_size === "number" ? line_size : 1;
  line_color = typeof line_color === "string" ? line_color : "#000";

  //   创建控制柄
  let ctrl_el = document.createElement("div");
  ctrl_el.ondragstart = function() {
    return false;
  };
  ctrl_el.className = "draggable";
  ctrl_el.el_size = size;
  ctrl_el.dirction = dirction;

  //   创建分割线
  let line = document.createElement("div");
  line.style.background = line_color;
  line.style.margin = "0 auto";
  line.style.position = "relative";
  //   line.style.Zindex = 90 ;
  line.ondragstart = function() {
    return false;
  };

  if (dirction === "row") {
    ctrl_el.style.height = size + "px";
    ctrl_el.style.cursor = "s-resize";
    line.style.width = "100%";
    line.style.height = line_size + "px";
  }
  if (dirction === "col") {
    ctrl_el.style.width = size + "px";
    ctrl_el.style.cursor = "w-resize";
    line.style.width = line_size + "px";
    line.style.height = "100%";
  }
  ctrl_el.appendChild(line);

  //   ctrl_el.style.background = "#ff0000";
  ctrl_el.style.position = "absolute";
  ctrl_el.style.zIndex = 99;
  ctrl_el.style.display = "flex";
  ctrl_el.style.alignItems = "center";
  ctrl_el.style.justifyContent = "center";
  // 添加被控制的节点
  ctrl_el.ctrlAfterEl = steup_el;
  ctrl_el.ctrlBeforeEl = steup_el.previousElementSibling;
  ctrl_el.ctrlAllChildrenEl = steup_el.parentElement.children;

  // 目标dom指向控制器
  steup_el.ctrlElement = ctrl_el;
  //   steup_el.previousElementSibling

  document.body.appendChild(ctrl_el);
}

/**
 * 设置控制器的位置
 * @param ctrl_el
 */
function set_XY_Controler(ctrl_el) {
  let dirction = ctrl_el.dirction;
  let _ = getXY(ctrl_el.ctrlAfterEl);
  let x = _.x;
  let y = _.y;

  if (dirction === "row") {
    ctrl_el.style.top = y - ctrl_el.el_size / 2 + "px";
    ctrl_el.style.left = x + "px";
    ctrl_el.style.width = ctrl_el.ctrlAfterEl.parentElement.offsetWidth + "px";
  }
  if (dirction === "col") {
    ctrl_el.style.top = y + "px";
    ctrl_el.style.left = x - ctrl_el.el_size / 2 + "px";
    ctrl_el.style.height =
      ctrl_el.ctrlAfterEl.parentElement.offsetHeight + "px";
  }
}

class DragEventMange {
  constructor() {
    this.ondraging = {};
    this.ondragstop = {};
    this._setDragEvent();
    this.minSize = 20;
  }
  on(type, id, fn) {
    if (type === "ondraging") {
      this.ondraging[id] = fn;
    }
    if (type === "ondragstop") {
      this.ondragstop[id] = fn;
    }
  }
  off(type, id) {
    if (type === "ondraging") {
      delete this.ondraging[id];
    }
    if (type === "ondragstop") {
      delete this.ondragstop[id];
    }
  }

  _enableSelect() {
    document.body.style.mozUserSelect = "none";
    document.body.style.WebkitUserSelect = "none";
    document.body.style.msUserSelect = "none";
    document.body.style.KhtmlUserSelect = "none";
    document.body.style.UserSelect = "none";
  }
  _disablSselect() {
    document.body.style.mozUserSelect = "text";
    document.body.style.WebkitUserSelect = "text";
    document.body.style.msUserSelect = "text";
    document.body.style.KhtmlUserSelect = "text";
    document.body.style.UserSelect = "text";
  }

  _setDragEvent() {
    var that = this;
    var drag = null;
    var diffx = 0;
    var diffy = 0;
    var h;
    var w;

    document.removeEventListener("mousedown", handleEvent);
    document.removeEventListener("mousemove", handleEvent);
    document.removeEventListener("mouseup", handleEvent);

    document.addEventListener("mousedown", handleEvent);
    document.addEventListener("mousemove", handleEvent);
    document.addEventListener("mouseup", handleEvent);

    function handleEvent(event) {
      var target = event.target || event.srcElement;
      switch (event.type) {
        case "mousedown":
          if (
            hasClassName(target.className, "draggable") ||
            hasClassName(
              target.parentElement ? target.parentElement.className : "",
              "draggable"
            )
          ) {
            hasClassName(target.parentElement.className, "draggable")
              ? (target = target.parentElement)
              : "";
            drag = target;
            diffx = event.clientX - target.offsetLeft;
            diffy = event.clientY - target.offsetTop;
            h = drag.ctrlBeforeEl.offsetHeight + drag.ctrlAfterEl.offsetHeight;
            w = drag.ctrlBeforeEl.offsetWidth + drag.ctrlAfterEl.offsetWidth;
          }
          break;
        case "mousemove":
          if (drag !== null) {
            that._enableSelect();
            if (drag.dirction === "col") {
              drag.style.left = event.clientX - diffx + "px";
              let diffx_px = event.clientX - drag.ctrlAfterEl.offsetLeft;
              let x = drag.ctrlBeforeEl.offsetWidth + diffx_px;
              let x2 = w - x;

              if (x > that.minSize && x2 > that.minSize) {
                drag.ctrlBeforeEl.style.width = x + "px";
                drag.ctrlAfterEl.style.width = x2 + "px";
              }
            }
            if (drag.dirction === "row") {
              drag.style.top = event.clientY - diffy + "px";
              let diffy_px = event.clientY - drag.ctrlAfterEl.offsetTop;
              let y = drag.ctrlBeforeEl.offsetHeight + diffy_px;
              let y2 = h - y;

              if (y > that.minSize && y2 > that.minSize) {
                drag.ctrlBeforeEl.style.height = y + "px";
                drag.ctrlAfterEl.style.height = y2 + "px";
              }
            }
            if (drag.ctrlAfterEl.style.height.split("px")[1] === "") {
              let h_pe =
                (h / drag.ctrlAfterEl.parentElement.offsetHeight) * 100;
              drag.ctrlAfterEl.style.height =
                h_pe * (drag.ctrlAfterEl.offsetHeight / h) + "%";
              drag.ctrlBeforeEl.style.height =
                h_pe * (drag.ctrlBeforeEl.offsetHeight / h) + "%";
            }
            //   更新 控制器的位置
            for (let elctrl of document.getElementsByClassName("draggable")) {
              set_XY_Controler(elctrl);
            }

            for (let key in that.ondraging) {
              let fn = that.ondraging[key];
              if (typeof fn === "function") {
                let b = {
                  _event: "draging",
                  dom: drag.ctrlAfterEl,
                  width: drag.ctrlAfterEl.offsetWidth,
                  height: drag.ctrlAfterEl.offsetHeight,
                };
                let a = {
                  _event: "draging",
                  dom: drag.ctrlBeforeEl,
                  width: drag.ctrlBeforeEl.offsetWidth,
                  height: drag.ctrlBeforeEl.offsetHeight,
                };
                fn(a, b);
              }
            }
          }
          break;
        case "mouseup":
          that._disablSselect();
          drag = null;
          break;
      }
    }
  }
}
// 创建事件管理器

var dragEvent = new DragEventMange();

/**
 * BaseContainer
 * 基础容器类，可单独使用布局完整的静态页面
 * 事件: onDraging(function(a, b){})
 */
class BaseContainer {
  constructor(row_classname, col_classname, content_classname) {
    this.ROW_CLASS_NAME = row_classname || "r-row";
    this.ClOUMN_CLASS_NAME = col_classname || "r-col";
    this.CONTENT_CLASS_NAME = content_classname || "r-content";
  }
  init(id, styleOption) {
    this.ID = id;
    this.set_dom(styleOption);
    this.inited = true;
  }
  /**
   * 设置样式
   * @param style {border:"边框",contrl_size:"控制器大小",splitline_size:"分割线大小",splitline_color:"分割线颜色",min_size:"拖动最小间隙"}
   */
  _set_style(styleOption) {
    var style = styleOption ? styleOption : {};
    this.min_size = style.min_size || 20;
    this.border = style.border || "1px solid #000";
    this.contrl_size = style.contrl_size || 14;
    this.splitline_size = style.splitline_size || 1;
    this.splitline_color = style.splitline_color || "#000";

    dragEvent.minSize = this.min_size;
    document.getElementById(this.ID).style.border = this.border;
    this._setControler(
      document
        .getElementById(this.ID)
        .getElementsByClassName(this.CONTENT_CLASS_NAME),
      this.contrl_size,
      this.splitline_size,
      this.splitline_color
    );
  }

  onDraging(fn) {
    //   拖动事件
    dragEvent.on("ondraging", this.ID, fn);
  }

  set_dom(style) {
    let dom = document.getElementById(this.ID);
    dom.style.boxSizing = "border-box";

    dom.ondragstart = function() {
      return false;
    };
    this._initialMode(dom);
    this._setColumn(dom.getElementsByClassName(this.ClOUMN_CLASS_NAME));
    this._setRow(dom.getElementsByClassName(this.ROW_CLASS_NAME));
    this._set_style(style);

    // 更新 控制器
    this.updateControler();
  }

  updateControler() {
    // 更新 控制器的位置
    for (let elctrl of document.getElementsByClassName("draggable")) {
      set_XY_Controler(elctrl);
    }
  }

  _setControler(el_contents, size, line_size, line_color) {
    for (const el of el_contents) {
      if (el.previousElementSibling) {
        //   如果存在兄弟节点, 当前为'r-content' 且下一个也是 'r-content' 就添加控制器
        if (
          hasClassName(el.className, this.CONTENT_CLASS_NAME) &&
          hasClassName(
            el.previousElementSibling.className,
            this.CONTENT_CLASS_NAME
          )
        ) {
          let dirction;
          if (hasClassName(el.parentElement.className, this.ROW_CLASS_NAME)) {
            dirction = "row";
          }
          if (
            hasClassName(el.parentElement.className, this.ClOUMN_CLASS_NAME)
          ) {
            dirction = "col";
          }
          if (dirction) {
            genControler(el, dirction, size, line_size, line_color);
          } else {
            throw new Error("_setControler 找不到方向dirction");
          }
        }
      }
    }
  }

  _setColumn(cols) {
    for (const el of cols) {
      // _initColumn(el);
      let chirld_n = el.parentElement.children.length;
      el.style.height = 100 / chirld_n + "%";
      el.style.display = "flex";
      // 处理 r-content
      for (const cel of el.children) {
        this._setContent(cel, "col");
      }
    }
  }
  _setRow(rows) {
    for (let el of rows) {
      let chirld_n = el.parentElement.children.length;
      el.style.height = 100 / chirld_n + "%";
      el.style.display = "block";
      // 处理 r-content
      for (let cel of el.children) {
        this._setContent(cel, "row");
      }
    }
  }
  _setContent(dom, dirction, child_n) {
    let n = child_n || dom.parentElement.children.length;
    if (dirction === "row") {
      dom.style.width = dom.style.width || "100%";
      dom.style.height = dom.style.height || 100 / n + "%";
      dom.style.boxSizing = "border-box";
      dom.style.overflow = "hidden";
    }
    if (dirction === "col") {
      dom.style.height = dom.style.height || "100%";
      dom.style.width = dom.style.width || 100 / n + "%";
      dom.style.boxSizing = "border-box";
      dom.style.overflow = "hidden";
    }
  }

  _initialMode(dom) {
    //
    let cols = [];
    for (let el of dom.getElementsByClassName(this.ClOUMN_CLASS_NAME)) {
      cols.push(el);
    }
    for (let col of cols) {
      this._initColumn(col);
    }
    //
    let rows = [];
    for (let el of dom.getElementsByClassName(this.ROW_CLASS_NAME)) {
      rows.push(el);
    }
    for (let row of rows) {
      this._initRow(row);
    }
  }
  _initRow(row) {
    let root_dom = row.parentElement.parentElement;
    let parent_dom = row.parentElement;
    if (hasClassName(root_dom.className, this.ROW_CLASS_NAME)) {
      // console.log("冲突");
      while (row.children.length > 0) {
        let el = row.children[0];
        root_dom.insertBefore(el, row.parentElement);
      }
      parent_dom.removeChild(row);

      if (parent_dom.children.length === 0) {
        root_dom.removeChild(parent_dom);
      }
    }
  }
  _initColumn(col) {
    let root_dom = col.parentElement.parentElement;
    let parent_dom = col.parentElement;
    if (hasClassName(root_dom.className, this.ClOUMN_CLASS_NAME)) {
      // console.log("冲突");
      while (col.children.length > 0) {
        let el = col.children[0];
        root_dom.insertBefore(el, col.parentElement);
      }
      parent_dom.removeChild(col);

      if (parent_dom.children.length === 0) {
        root_dom.removeChild(parent_dom);
      }
    }
  }
}

/**
 * FrameContainer
 * 扩展容器类，用于动态页面
 * Event 拖动: onDraging(function(a, b){})
 * Event 添加行: onAddRow = function(e){}
 * Event 添加列: onAddColumn = function(e){}
 */
class FrameContainer extends BaseContainer {
  constructor(row_classname, col_classname, content_classname) {
    super(row_classname, col_classname, content_classname);
  }

  /**
   * 初始化
   * @param id            根节点id
   * @param styleOption   样式选项
   * @param mode          row行模式|| col列模式
   * @param putNode       需要载入的节点
   */
  initial(id, mode, putNode,styleOption) {
    let root_dom = document.getElementById(id);

    if (
      root_dom.getElementsByClassName(this.ClOUMN_CLASS_NAME).length > 0 ||
      root_dom.getElementsByClassName(this.ROW_CLASS_NAME).length > 0
    ) {
      console.warn("Root dom has been child!");
      this.init(id, styleOption);
      return false;
    }
    if (!mode) {
      throw new Error("initialize faild, mode has not find");
    }

    let parent_dom;
    if (mode === "row") {
      parent_dom = this._createRowDom();
      let contentEl = this._createContentDom(100, "row");
      putNode instanceof Node ? contentEl.appendChild(putNode) : "";
      parent_dom.appendChild(contentEl);
      root_dom.appendChild(parent_dom);
    }
    if (mode === "col") {
      parent_dom = this._createColunmtDom();
      let contentEl = this._createContentDom(100, "col");
      putNode instanceof Node ? contentEl.appendChild(putNode) : "";
      parent_dom.appendChild(contentEl);
      root_dom.appendChild(parent_dom);
    }
    this.init(id, styleOption);
    return true;
  }

  /**
   * 添加行
   * @param dom
   * @param putNode 需要载入的节点
   */
  addRow(dom, putNode) {
    if (!this.inited) {
      throw new Error("<FrameContainer> : is not init()");
    }
    if (!hasClassName(dom.className, this.CONTENT_CLASS_NAME)) {
      throw new Error(
        `<FrameContainer> addRow : dom has not classname of ${this.CONTENT_CLASS_NAME}`
      );
    }

    let parent_dom;
    let content_el;

    // 直接添加 content
    if (hasClassName(dom.parentElement.className, this.ROW_CLASS_NAME)) {
      parent_dom = dom.parentElement;
      let size = ((dom.offsetHeight / parent_dom.offsetHeight) * 100) / 2;
      dom.style.height = size + "%";
      content_el = this._createContentDom(size, "row");
      putNode instanceof Node ? content_el.appendChild(putNode) : "";

      if (dom.nextElementSibling) {
        // 修改控制器的指向的前后Dom元素
        dom.nextElementSibling.ctrlElement.ctrlBeforeEl = content_el;
        parent_dom.insertBefore(content_el, dom.nextElementSibling);
        this.addControler(content_el);
        this.updateControler();
      } else {
        parent_dom.appendChild(content_el);
        this.addControler(content_el);
        this.updateControler();
      }
    }

    // 创建行框架 在添加content
    if (hasClassName(dom.parentElement.className, this.ClOUMN_CLASS_NAME)) {
      parent_dom = this._createRowDom();
      content_el = this._createContentDom(100, "row");
      putNode instanceof Node ? content_el.appendChild(putNode) : "";
      parent_dom.appendChild(content_el);
      dom.appendChild(parent_dom);
    }

    // 设置回调事件
    typeof this.onAddRow === "function"
      ? this.onAddRow({ _event: "addRow", dom: content_el })
      : null;
  }

  /**
   * 添加列
   * @param dom
   * @param putNode 需要载入的节点
   */
  addColumn(dom, putNode) {
    if (!this.inited) {
      throw new Error("<FrameContainer> is not init()");
    }
    if (!hasClassName(dom.className, this.CONTENT_CLASS_NAME)) {
      throw new Error(
        `<FrameContainer> addColumn : dom has not classname of ${this.CONTENT_CLASS_NAME}`
      );
    }

    let parent_dom;
    let content_el;

    // 直接添加 content
    if (hasClassName(dom.parentElement.className, this.ClOUMN_CLASS_NAME)) {
      parent_dom = dom.parentElement;
      let size = ((dom.offsetWidth / parent_dom.offsetWidth) * 100) / 2;
      dom.style.width = size + "%";
      content_el = this._createContentDom(size, "col");
      putNode instanceof Node ? content_el.appendChild(putNode) : "";

      if (dom.nextElementSibling) {
        // 修改控制器的指向的前后Dom元素
        dom.nextElementSibling.ctrlElement.ctrlBeforeEl = content_el;
        parent_dom.insertBefore(content_el, dom.nextElementSibling);
        this.addControler(content_el);
        this.updateControler();
      } else {
        parent_dom.appendChild(content_el);
        this.addControler(content_el);
        this.updateControler();
      }
    }
    // 创建列框架 在添加content
    if (hasClassName(dom.parentElement.className, this.ROW_CLASS_NAME)) {
      parent_dom = this._createRowDom();
      content_el = this._createContentDom(100, "col");
      putNode instanceof Node ? content_el.appendChild(putNode) : "";

      parent_dom.appendChild(content_el);
      dom.appendChild(parent_dom);
    }

    // 设置回调事件
    typeof this.onAddColumn === "function"
      ? this.onAddColumn({ _event: "addColumn", dom: content_el })
      : null;
  }

  /**
   * 添加控制器
   * @param el
   */
  addControler(el) {
    if (
      el.parentElement.getElementsByClassName(this.CONTENT_CLASS_NAME).length >
      1
    ) {
      //   如果存在兄弟节点, 当前为'r-content' 且下一个也是 'r-content' 就添加控制器
      if (
        hasClassName(el.className, this.CONTENT_CLASS_NAME) &&
        hasClassName(
          el.previousElementSibling.className,
          this.CONTENT_CLASS_NAME
        )
      ) {
        let dirction;
        if (hasClassName(el.parentElement.className, this.ROW_CLASS_NAME)) {
          dirction = "row";
        }
        if (hasClassName(el.parentElement.className, this.ClOUMN_CLASS_NAME)) {
          dirction = "col";
        }
        if (dirction) {
          genControler(
            el,
            dirction,
            this.contrl_size,
            this.splitline_size,
            this.splitline_color
          );
        } else {
          throw new Error("_setControler 找不到方向dirction");
        }
      }
    }
  }

  _createContentDom(size, dirction) {
    let el = document.createElement("div");
    el.className = this.CONTENT_CLASS_NAME;

    if (dirction === "row") {
      el.style.width = "100%";
      el.style.height = size + "%";
      el.style.boxSizing = "border-box";
      el.style.overflow = "hidden";
    }
    if (dirction === "col") {
      el.style.height = "100%";
      el.style.width = size + "%";
      el.style.boxSizing = "border-box";
      el.style.overflow = "hidden";
    }
    return el;
  }
  _createRowDom() {
    let el = document.createElement("div");
    el.className = this.ROW_CLASS_NAME;
    el.style.height = 100 + "%";
    el.style.display = "block";
    return el;
  }
  _createColunmtDom() {
    let el = document.createElement("div");
    el.className = this.ClOUMN_CLASS_NAME;
    el.style.height = 100 + "%";
    el.style.display = "flex";
    return el;
  }
}
