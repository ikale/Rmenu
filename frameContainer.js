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
 * @param setupEl
 * @param dirction  默认为横向 {1 'row'| 0 'col'}
 * @param opts      配置项 className  ctrlElsize lineColor lineSize creatLine
 */
function genControlerByEl(setupEl, dirction, opts) {
  typeof opts !== "object" || opts instanceof Array ? (opts = {}) : "";
  opts = opts || {};
  const draggableClassName = opts.draggableClassName || "draggable";
  const ctrlElsize = opts.ctrlElsize || 16;
  const lineColor = opts.lineColor || "#000";
  const lineSize = opts.lineSize || 1;
  const creatLine = opts.creatLine || true;

  if (
    !setupEl.previousElementSibling ||
    setupEl.getElementsByClassName(draggableClassName).length > 0
  ) {
    return null;
  }
  setupEl.style.position = "relative";

  // # 1.创建控制器
  const ctrlEl = document.createElement("div");
  ctrlEl.className = draggableClassName;
  ctrlEl.style.position = "absolute";
  ctrlEl.style.zIndex = 999;
  ctrlEl.ondragstart = function() {
    // 屏蔽默认拖拽
    return false;
  };
  if (dirction === "row") {
    ctrlEl.style.cursor = "s-resize";
    ctrlEl.style.width = "100%";
    ctrlEl.style.height = ctrlElsize + "px";
    ctrlEl.style.top = (ctrlElsize / 2) * -1 + "px";
    ctrlEl.style.left = 0;
  }
  if (dirction === "col") {
    ctrlEl.style.cursor = "w-resize";
    ctrlEl.style.height = "100%";
    ctrlEl.style.width = ctrlElsize + "px";
    ctrlEl.style.left = (ctrlElsize / 2) * -1 + "px";
    ctrlEl.style.top = 0;
  }

  if (creatLine) {
    // # 2.创建分割线
    const line = document.createElement("div");
    line.style.background = lineColor;
    line.style.position = "relative";
    dirction === "col"
      ? ((line.style.height = "100%"),
        (line.style.width = lineSize + "px"),
        (line.style.left = ctrlElsize / 2 + "px"))
      : "";
    dirction === "row"
      ? ((line.style.height = lineSize + "px"),
        (line.style.width = "100%"),
        (line.style.top = ctrlElsize / 2 + "px"))
      : "";
    line.ondragstart = function() {
      // 屏蔽默认拖拽
      return false;
    };
    ctrlEl.appendChild(line);
  }
  setupEl.appendChild(ctrlEl);
}

/**
 * 销毁所有控制器
 * @param dom   dom根节点
 * @param className  样式名默认为 draggable
 */
function destroyControler(dom, className) {
  className = className || "draggable";
  while (dom.getElementsByClassName(className).length > 0) {
    const ctrlEl = dom.getElementsByClassName(className)[0];
    ctrlEl.parentElement.removeChild(ctrlEl);
  }
}

/**
 * 判断样式名是否存在
 * @param className
 * @param str
 * @return Bollen;
 */
function hasClassName(className, str) {
  if (className) {
    let arr = className.trim().split(/\s+/);
    return arr.indexOf(str) > -1 ? true : false;
  }
  return false;
}

/**
 * 设置控制器的拖拽
 * @param callback                拖拽时触发的回调,用于外部使用拖拽事件 callback({aEl,bEl})
 * @param minSize                 最小间隙 | 50
 * @param isPercent               百分比 | true
 * @return draggableClassName;    控制器的样式名称 | draggable
 */
function setControlerDrag(callback, minSize, isPercent, draggableClassName) {
  draggableClassName = draggableClassName || "draggable";
  isPercent === false ? (isPercent = false) : (isPercent = true);

  minSize = minSize || 50;
  var drag = null;
  var type = "w-resize";
  var totalHeigh;
  var totalWidth;
  var elX;
  var elY;
  var elTop;
  var elLeft;

  document.removeEventListener("mousedown", handleEvent);
  document.removeEventListener("mousemove", handleEvent);
  document.removeEventListener("mouseup", handleEvent);

  document.addEventListener("mousedown", handleEvent);
  document.addEventListener("mousemove", handleEvent);
  document.addEventListener("mouseup", handleEvent);

  function _enableSelect() {
    document.body.style.mozUserSelect = "none";
    document.body.style.WebkitUserSelect = "none";
    document.body.style.msUserSelect = "none";
    document.body.style.KhtmlUserSelect = "none";
    document.body.style.UserSelect = "none";
  }
  function _disablSselect() {
    document.body.style.mozUserSelect = "text";
    document.body.style.WebkitUserSelect = "text";
    document.body.style.msUserSelect = "text";
    document.body.style.KhtmlUserSelect = "text";
    document.body.style.UserSelect = "text";
  }

  function handleEvent(event) {
    var target = event.target || event.srcElement;
    switch (event.type) {
      case "mousedown":
        if (
          hasClassName(target.className, draggableClassName) ||
          hasClassName(
            target.parentElement ? target.parentElement.className : "",
            draggableClassName
          )
        ) {
          hasClassName(target.parentElement.className, draggableClassName)
            ? (drag = target.parentElement)
            : (drag = target);

          type = drag.style.cursor;
          elX = drag.parentElement.previousElementSibling.offsetWidth;
          elY = drag.parentElement.previousElementSibling.offsetHeight;
          elTop = getXY(drag.parentElement.previousElementSibling).y;
          elLeft = getXY(drag.parentElement.previousElementSibling).x;
          totalHeigh =
            drag.parentElement.offsetHeight +
            drag.parentElement.previousElementSibling.offsetHeight; //前后元素的总高度
          totalWidth =
            drag.parentElement.offsetWidth +
            drag.parentElement.previousElementSibling.offsetWidth; //前后元素的总宽度
          // console.log("按下,总高度：", totalHeigh, elY);
        } else {
          drag = null;
        }
        break;
      case "mousemove":
        if (drag) {
          _enableSelect();
          const bEl = drag.parentElement; // 控制器所在的Dom
          const aEl = bEl.previousElementSibling;
          // 上下移动
          if (type === "s-resize") {
            var diffy = elY - event.clientY + elTop;
            var ay = event.clientY - getXY(aEl).y;
            var by = getXY(bEl).y + bEl.offsetHeight - event.clientY;
            // console.log("总高度",totalHeigh)
            if (ay > minSize && by > minSize) {
              bEl.style.height = totalHeigh - elY + diffy + "px";
              aEl.style.height = elY - diffy + "px";
            }
            // 触发拖拽回调
            typeof callback === "function"
              ? callback({
                  _event: "draging",
                  aEl: {
                    dom: aEl,
                    width: aEl.offsetWidth,
                    height: aEl.offsetHeight,
                  },
                  bEl: {
                    dom: bEl,
                    width: bEl.offsetWidth,
                    height: bEl.offsetHeight,
                  },
                })
              : null;
          }

          // 左右移动
          if (type === "w-resize") {
            var diffx = elX - event.clientX + elLeft;
            // console.log("开始移动", elX);
            var ax = event.clientX - getXY(aEl).x;
            var bx = getXY(bEl).x + bEl.offsetWidth - event.clientX;

            if (ax > minSize && bx > minSize) {
              bEl.style.width = totalWidth - elX + diffx + "px";
              aEl.style.width = elX - diffx + "px";
            }
          }
          // 触发拖拽回调
          typeof callback === "function"
            ? callback({
                _event: "draging",
                aEl: {
                  dom: aEl,
                  width: aEl.offsetWidth,
                  height: aEl.offsetHeight,
                },
                bEl: {
                  dom: bEl,
                  width: bEl.offsetWidth,
                  height: bEl.offsetHeight,
                },
              })
            : null;
        }
        break;
      case "mouseup":
        if (drag && isPercent) {
          //  转为百分比
          const bEl = drag.parentElement; // 控制器所在的Dom
          const aEl = bEl.previousElementSibling;
          if (type === "w-resize") {
            const w = bEl.parentElement.offsetWidth;
            bEl.style.width = (bEl.offsetWidth / w) * 100 + "%";
            aEl.style.width = (aEl.offsetWidth / w) * 100 + "%";
          }
          if (type === "s-resize") {
            const h = bEl.parentElement.offsetHeight;
            aEl.style.height = (aEl.offsetHeight / h) * 100 + "%";
            bEl.style.height = (bEl.offsetHeight / h) * 100 + "%";
          }
        }
        _disablSselect();
        drag = null;
        break;
    }
  }
}

/**
 * BaseContainer
 * 基础容器类，可单独使用布局完整的静态页面
 * 事件: onDraging(function(a, b){})
 */
class BaseContainer {
  constructor() {}

  init(root_domId, options) {
    this.ID = root_domId;
    this.set_dom(options);
    this.inited = true;
  }

  /**
   * 拖拽事件
   * @param fn:function({aEl, bEl}){}
   */
  onDraging(fn) {
    //   拖动事件
    if (this.isDraggable) {
      this.onDragingCallback = fn;
      setControlerDrag(
        fn,
        this.minSize,
        this.isPercent,
        this.draggableClassName
      );
    }
  }

  /**
   * 设置dom
   * @param options
   */
  set_dom(options) {
    typeof options !== "object" || options instanceof Array
      ? (options = {})
      : "";
    options = options ? options : {};

    this.rootDomBorder = options.rootDomBorder || "1px solid #000";
    this.ctrlElsize = options.ctrlElsize || 20;
    this.lineSize = options.lineSize || 1;
    this.lineColor = options.lineColor || "#000";

    this.draggableClassName = options.draggableClassName || "draggable";
    this.minSize = options.minSize || 10;
    this.isDraggable = options.isDraggable || true;
    this.isPercent = options.isPercent || true;
    this.ROW_CLASS_NAME = options.rowClassname || "r-row";
    this.ClOUMN_CLASS_NAME = options.columnClassname || "r-col";
    this.CONTENT_CLASS_NAME = options.contentClassname || "r-content";

    const rootDom = document.getElementById(this.ID);
    const cols = Array.from(
      rootDom.getElementsByClassName(this.ClOUMN_CLASS_NAME)
    );
    const rows = Array.from(
      rootDom.getElementsByClassName(this.ROW_CLASS_NAME)
    );
    const contents = Array.from(
      rootDom.getElementsByClassName(this.CONTENT_CLASS_NAME)
    );
    // 1.初始化 静态结构
    this._initialMode(cols, rows);
    this._setColumn(rootDom.getElementsByClassName(this.ClOUMN_CLASS_NAME));
    this._setRow(rootDom.getElementsByClassName(this.ROW_CLASS_NAME));

    // 2.设置样式
    rootDom.style.boxSizing = "border-box";
    rootDom.ondragstart = function() {
      return false;
    };
    rootDom.style.border = this.rootDomBorder;

    // 3.拖拽控制器
    if (this.isDraggable) {
      // 生成控制器
      this.controlerOpts = {
        draggableClassName: this.draggableClassName,
        ctrlElsize: this.ctrlElsize,
        lineColor: this.lineColor,
        lineSize: this.lineSize,
        creatLine: this.creatLine,
      };

      for (const content of contents) {
        this.addControler(content);
      }
      // 设置拖拽
      setControlerDrag(
        this.onDragingCallback,
        this.minSize,
        this.isPercent,
        this.draggableClassName
      );
    }
  }

  getOptions() {
    return {
      isDraggable: this.isDraggable, //  是否开启拖拽
      minSize: this.minSize, //  拖动最小间隙
      isPercent: this.isPercent, //  宽高为百分比
      ctrlElsize: this.ctrlElsize, //  控制器大小
      lineColor: this.lineColor, //  分割线颜色
      lineSize: this.lineSize, //  分割线大小
      creatLine: this.creatLine, //  是否创建分割线
      draggableClassName: this.draggableClassName, //  拖拽样式名称
      rootDomBorder: this.rootDomBorder, //  根节点边框
      rowClassname: this.rowClassname, //  行样式名称
      columnClassname: this.columnClassname, //  列样式名称
      contentClassname: this.contentClassname, //  单元格样式名称
    };
  }

  /**
   * 添加控制器
   * @param contentEl
   */
  addControler(contentEl) {
    if (contentEl.previousElementSibling && this.isDraggable) {
      //   如果存在兄弟节点, 当前为'r-content' 且下一个也是 'r-content' 就添加控制器
      if (
        hasClassName(contentEl.className, this.CONTENT_CLASS_NAME) &&
        hasClassName(
          contentEl.previousElementSibling.className,
          this.CONTENT_CLASS_NAME
        )
      ) {
        let dirction;
        if (
          hasClassName(contentEl.parentElement.className, this.ROW_CLASS_NAME)
        ) {
          dirction = "row";
        }
        if (
          hasClassName(
            contentEl.parentElement.className,
            this.ClOUMN_CLASS_NAME
          )
        ) {
          dirction = "col";
        }
        if (dirction) {
          genControlerByEl(contentEl, dirction, this.controlerOpts);
        } else {
          throw new Error("addControler 找不到方向dirction");
        }
      }
    }
  }

  _initialMode(cols, rows) {
    // 初始化静态dom结构, 用于保证结构结构正确性
    destroyControler(document.getElementById(this.ID), this.draggableClassName);

    for (let col of cols) {
      this._initColumn(col);
    }
    for (let row of rows) {
      this._initRow(row);
    }
  }

  _setColumn(cols) {
    // 设置col的结构样式
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
    // 设置row的结构样式
    for (const el of rows) {
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
    // 设置content的结构样式
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

  _initRow(row) {
    // 初始化 修正静态row结构
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
    // 初始化 修正静态column结构
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
 * Event 添加窗口 onAddWindow = function(e){}
 * Event 删除窗口 ondeleteWindow  = function(e){}
 * ondeleteWindowBefore
 */
class FrameContainer extends BaseContainer {
  constructor() {
    super();
  }

  /**
   * 初始化
   * @param root_domId    根节点id
   * @param options       配置选项
   */
  init(root_domId, options) {
    this.ID = root_domId;
    this.set_dom(options);
    this.inited = true;
  }

  /**
   * 设置根模式
   * @param mode          row行模式|| col列模式
   * @returns contentEl
   */
  setInitMode(mode, dom) {
    if (!mode) {
      throw new Error("<FrameContainer> setInitMode:faild, mode has not find");
    }

    let parent_dom;
    let contentEl;
    let root_dom = dom;
    if (mode === "row") {
      parent_dom = this._createRowDom();
      contentEl = this._createContentDom(100, "row");
      const putNodes = Array.from(root_dom.childNodes);
      for (const el of putNodes) {
        if (!hasClassName(el.className, this.draggableClassName)) {
          contentEl.appendChild(el);
        }
      }
      parent_dom.appendChild(contentEl);
      root_dom.appendChild(parent_dom);
    }
    if (mode === "col") {
      parent_dom = this._createColunmtDom();
      contentEl = this._createContentDom(100, "col");
      const putNodes = Array.from(root_dom.childNodes);
      for (const el of putNodes) {
        if (!hasClassName(el.className, this.draggableClassName)) {
          contentEl.appendChild(el);
        }
      }
      parent_dom.appendChild(contentEl);
      root_dom.appendChild(parent_dom);
    }
    return contentEl;
  }

  /**
   * 获取可用容器contentEl
   * @param dom
   * @param mode | 默认 "row"  没找到contentEL时自动创建行模式
   * @returns contentEl
   */
  getParentContentEl(dom, mode) {
    // 获取可用容器,无可用容器时自动创建contentEl

    mode = mode || "row";
    var contentEl = dom;
    if (!hasClassName(dom.className, this.CONTENT_CLASS_NAME)) {
      contentEl = null;
      var _is_go = true;
      if (document.getElementById(this.ID) === dom) {
        contentEl = this.setInitMode(mode, document.getElementById(this.ID));
        _is_go = false;
      }
      // 向上查找
      while (_is_go) {
        dom = dom.parentElement;
        if (hasClassName(dom.className, this.CONTENT_CLASS_NAME)) {
          _is_go = false;
          contentEl = dom;
        }
        if (dom.id === this.ID) {
          _is_go = false;
          contentEl = this.setInitMode(mode, document.getElementById(this.ID));
        }
      }
    }
    return contentEl;
  }

  /**
   * 添加行
   * @param dom
   * @param insertPosition   插入的位置 默认值 "bottom" ["top"(置顶) | "botoom"（置底） | "before"（dom元素的前面） | "after" （dom元素的后面）]
   * @param putNode 额外需要载入的节点
   * @returns [newContentEl, thisContentEl]
   */
  addRow(dom, insertPosition, putNode) {
    insertPosition = insertPosition || "bottom";

    // 1.查找目标contentEl
    dom = this.getParentContentEl(dom, "row");
    if (!dom) {
      throw new Error("<FrameContainer:addRow> must be init!");
    }

    // 2.初始化结构
    var content_el;
    var parent_dom;
    var thisParentEl; // parentEl  (row)
    var thisContentEl; // contentEl
    var newContentEl; //  新contentEl

    // ### 在列模式时，创建行框架 在添加content
    if (hasClassName(dom.parentElement.className, this.ClOUMN_CLASS_NAME)) {
      // console.log("添加行模式框架");
      dom = this.setInitMode("row", dom);
    }

    // ### 直接添加 content
    if (hasClassName(dom.parentElement.className, this.ROW_CLASS_NAME)) {
      parent_dom = dom.parentElement;
      let size = ((dom.offsetHeight / parent_dom.offsetHeight) * 100) / 2;
      dom.style.height = size + "%";
      content_el = this._createContentDom(size, "row");
      putNode instanceof Node ? content_el.appendChild(putNode) : "";
      parent_dom.appendChild(content_el);
      // console.log("直接添加行contentEl");
      this.addControler(content_el);

      thisContentEl = dom;
      newContentEl = content_el;
      thisParentEl = parent_dom;
    }

    // 3.排序 ["top"(置顶) | "botoom"（置底） | "before"（dom元素的前面） | "after" （dom元素的后面）]
    switch (insertPosition) {
      case "top":
        if (
          newContentEl.getElementsByClassName(this.draggableClassName).length >
          0
        ) {
          destroyControler(newContentEl);
          thisParentEl.insertBefore(newContentEl, thisParentEl.children[0]);
          this.addControler(thisParentEl.children[0]);
        }
        break;
      case "bottom":
        if (
          newContentEl.getElementsByClassName(this.draggableClassName).length >
          0
        ) {
          thisParentEl.appendChild(newContentEl);
        }
        break;
      case "before":
        if (thisParentEl.children.length > 1) {
          if (
            thisContentEl.getElementsByClassName(this.draggableClassName)
              .length > 0
          ) {
            thisParentEl.insertBefore(newContentEl, thisContentEl);
          } else {
            const ctrlEl = newContentEl.getElementsByClassName(
              this.draggableClassName
            )[0];
            thisContentEl.appendChild(ctrlEl);
            thisParentEl.insertBefore(newContentEl, thisContentEl);
          }
        }
        break;
      case "after":
        if (thisParentEl.children.length > 2) {
          if (thisContentEl.nextElementSibling) {
            thisParentEl.insertBefore(
              newContentEl,
              thisContentEl.nextElementSibling
            );
          }
        }
        break;
    }

    // 4.设置回调事件
    typeof this.onAddRow === "function"
      ? this.onAddRow({ _event: "addRow", dom: newContentEl })
      : null;
    return [newContentEl, thisContentEl];
  }

  /**
   * 添加列
   * @param dom
   * @param insertPosition   插入的位置 默认值 "bottom" ["top"(置顶) | "botoom"（置底） | "before"（dom元素的前面） | "after" （dom元素的后面）]
   * @param putNode 额外需要载入的节点
   */
  addColumn(dom, insertPosition, putNode) {
    insertPosition = insertPosition || "bottom";

    // 1.查找目标contentEl
    dom = this.getParentContentEl(dom, "col");
    if (!dom) {
      throw new Error("<FrameContainer:addRow> must be init!");
    }

    // 2.初始化结构
    var content_el;
    var parent_dom;
    var thisParentEl; // parentEl  (col)
    var thisContentEl; // contentEl
    var newContentEl; //  新contentEl

    // ### 在行模式下，创建列框架 在添加content
    if (hasClassName(dom.parentElement.className, this.ROW_CLASS_NAME)) {
      // console.log("添加列模式框架");
      dom = this.setInitMode("col", dom);
    }

    // ### 直接添加 content
    if (hasClassName(dom.parentElement.className, this.ClOUMN_CLASS_NAME)) {
      parent_dom = dom.parentElement;
      let size = ((dom.offsetWidth / parent_dom.offsetWidth) * 100) / 2;
      dom.style.width = size + "%";
      content_el = this._createContentDom(size, "col");
      putNode instanceof Node ? content_el.appendChild(putNode) : "";

      parent_dom.appendChild(content_el);
      this.addControler(content_el);

      thisContentEl = dom;
      newContentEl = content_el;
      thisParentEl = parent_dom;
    }

    // 3.排序 ["top"(置顶) | "botoom"（置底） | "before"（dom元素的前面） | "after" （dom元素的后面）]
    switch (insertPosition) {
      case "top":
        if (
          newContentEl.getElementsByClassName(this.draggableClassName).length >
          0
        ) {
          destroyControler(newContentEl);
          thisParentEl.insertBefore(newContentEl, thisParentEl.children[0]);
          this.addControler(thisParentEl.children[0]);
        }
        break;
      case "bottom":
        if (
          newContentEl.getElementsByClassName(this.draggableClassName).length >
          0
        ) {
          thisParentEl.appendChild(newContentEl);
        }
        break;
      case "before":
        if (thisParentEl.children.length > 1) {
          if (
            thisContentEl.getElementsByClassName(this.draggableClassName)
              .length > 0
          ) {
            thisParentEl.insertBefore(newContentEl, thisContentEl);
          } else {
            const ctrlEl = newContentEl.getElementsByClassName(
              this.draggableClassName
            )[0];
            thisContentEl.appendChild(ctrlEl);
            thisParentEl.insertBefore(newContentEl, thisContentEl);
          }
        }
        break;
      case "after":
        if (thisParentEl.children.length > 2) {
          if (thisContentEl.nextElementSibling) {
            thisParentEl.insertBefore(
              newContentEl,
              thisContentEl.nextElementSibling
            );
          }
        }
        break;
    }

    // 4.设置回调事件
    typeof this.onAddColumn === "function"
      ? this.onAddColumn({ _event: "addColumn", dom: newContentEl })
      : null;
    return [newContentEl, thisContentEl];
  }

  deleteWindow(dom) {
    var _is_go = false;
    var deleteContentEl = null;
    if (hasClassName(dom.className, this.CONTENT_CLASS_NAME)) {
      deleteContentEl = dom;
    } else {
      _is_go = true;
    }
    if (dom.id === this.ID) {
      _is_go = false;
    }
    // 向上查找
    while (_is_go) {
      dom = dom.parentElement;
      if (hasClassName(dom.className, this.CONTENT_CLASS_NAME)) {
        _is_go = false;
        deleteContentEl = dom;
      }
      dom.id === this.ID ? (_is_go = false) : "";
    }
    if (!deleteContentEl) {
      return false;
    }

    var aEl, bEl, mode, nearEl, thissize;
    var parentEl = deleteContentEl.parentElement;

    if (parentEl.children.length === 1) {
      parentEl = parentEl.parentElement;
      if (parentEl.id === this.ID) {
        const chirldEl = Array.from(deleteContentEl.children);
        for (const chirld of chirldEl) {
          if (!hasClassName(chirld.className, this.draggableClassName)) {
            parentEl.appendChild(chirld);
          }
        }

        typeof this.ondeleteWindowBefore === "function"
        ? this.ondeleteWindowBefore({
            _event: "deleteWindowBefore",
            dom: deleteContentEl.parentElement,
          })
        : "";

        parentEl.removeChild(deleteContentEl.parentElement);

        typeof this.ondeleteWindow === "function"
          ? this.ondeleteWindow({
              _event: "deleteWindow",
              dom: parentEl,
              width: parentEl.offsetWidth,
              height: parentEl.offsetHeight,
            })
          : "";
        return false;
      }
      aEl = parentEl.previousElementSibling;
      bEl = parentEl.nextElementSibling;
      nearEl = aEl || bEl;

      mode = hasClassName(nearEl.className, this.ClOUMN_CLASS_NAME)
        ? "col"
        : "row";
      mode === "row"
        ? (thissize = deleteContentEl.offsetHeight)
        : (thissize = deleteContentEl.offsetWidth);
      parentEl.parentElement.removeChild(parentEl);
    } else {
      aEl = deleteContentEl.previousElementSibling;
      bEl = deleteContentEl.nextElementSibling;

      nearEl = aEl || bEl;
      mode = hasClassName(parentEl.className, this.ClOUMN_CLASS_NAME)
        ? "col"
        : "row";
      mode === "row"
        ? (thissize = deleteContentEl.offsetHeight)
        : (thissize = deleteContentEl.offsetWidth);

        typeof this.ondeleteWindowBefore === "function"
        ? this.ondeleteWindowBefore({
            _event: "deleteWindowBefore",
            dom: deleteContentEl,
          })
        : "";
      parentEl.removeChild(deleteContentEl);
    }

    if (mode === "row") {
      const nearSize = nearEl.offsetHeight;
      nearEl.style.height =
        ((thissize + nearSize) / nearEl.parentElement.offsetHeight) * 100 + "%";
    } else {
      const nearSize = nearEl.offsetWidth;
      nearEl.style.width =
        ((thissize + nearSize) / nearEl.parentElement.offsetWidth) * 100 + "%";
    }

    typeof this.ondeleteWindow === "function"
      ? this.ondeleteWindow({
          _event: "deleteWindow",
          dom: nearEl,
          width: nearEl.offsetWidth,
          height: nearEl.offsetHeight,
        })
      : "";

    return true;
  }

  insertWindowTop(dom) {
    const arr = this.addRow(dom, "before");
    // 设置回调事件
    typeof this.onAddWindow === "function"
      ? this.onAddWindow({
          _event: "addWindow",
          aEl: {
            dom: arr[0],
            width: arr[0].offsetWidth,
            height: arr[0].offsetHeight,
          },
          bEl: {
            dom: arr[1],
            width: arr[1].offsetWidth,
            height: arr[1].offsetHeight,
          },
        })
      : null;
    return arr;
  }
  insertWindowBottom(dom) {
    const arr = this.addRow(dom, "after");

    // 设置回调事件
    typeof this.onAddWindow === "function"
      ? this.onAddWindow({
          _event: "addWindow",
          aEl: {
            dom: arr[1],
            width: arr[1].offsetWidth,
            height: arr[1].offsetHeight,
          },
          bEl: {
            dom: arr[0],
            width: arr[0].offsetWidth,
            height: arr[0].offsetHeight,
          },
        })
      : null;
    return arr;
  }
  insertWindowLeft(dom) {
    const arr = this.addColumn(dom, "before");

    // 设置回调事件
    typeof this.onAddWindow === "function"
      ? this.onAddWindow({
          _event: "addWindow",
          aEl: {
            dom: arr[0],
            width: arr[0].offsetWidth,
            height: arr[0].offsetHeight,
          },
          bEl: {
            dom: arr[1],
            width: arr[1].offsetWidth,
            height: arr[1].offsetHeight,
          },
        })
      : null;
    return arr;
  }
  insertWindowRight(dom) {
    const arr = this.addColumn(dom, "after");

    // 设置回调事件
    typeof this.onAddWindow === "function"
      ? this.onAddWindow({
          _event: "addWindow",
          aEl: {
            dom: arr[1],
            width: arr[1].offsetWidth,
            height: arr[1].offsetHeight,
          },
          bEl: {
            dom: arr[0],
            width: arr[0].offsetWidth,
            height: arr[0].offsetHeight,
          },
        })
      : null;
    return arr;
  }

  _createContentDom(size, dirction) {
    let el = document.createElement("div");
    el.className = this.CONTENT_CLASS_NAME;
    el.style.position = "relative";
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
