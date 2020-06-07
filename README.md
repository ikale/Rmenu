# Rmenu
#### deom:  https://ikale.github.io/Rmenu/demo.html

## contextmenu.js 实现右键菜单 
#### 创建实例：
```
new Contextmenu(?config)
// config  在创建实例时可以不传入，通过update(config)方法设置也可以
```

#### 配置：
```
config = {
          x:{
            titile:" 一级菜单 1",
            target: callback,
            xx:{
                titile:" 二级菜单",
                target: callback,        
            }
          }
        }
```
一个花括号为一个层级，如果不定义title，默认以键值作为名称。 target 点击后执行的任务，它是一个回调函数，`callback(targetEl,el )`。

#### 方法：

```
bind(domId)                                     // 绑定dom元素
unbind(domId)                                   // 解除绑定
update(config)                                  // 更新配置
dispose()                                       // 销毁
```


#### 属性:
```
isbind_containers   //查看已绑定的dom
```


## frameContainer.js  实现拖拽调整布局大小 

#### 创建实例：
```
new FrameContainer(?row_classname, ?col_classname, ?content_classname)

样式名称：
// row_classname              可选 | 默认 "r-row"                 
// col_classname              可选 | 默认 "r-col"                           
// content_classname          可选 | 默认 "r-content"  
 ```
 
#### 结构
```
行模式
<div id="root">
  <div class="r-row"> 
      <div class="r-content"> </div>
  </div>
</div>

列模式
<div id="root">
  <div class="r-col"> 
      <div class="r-content"> </div>
  </div>
</div>

```

#### 配置
```
defaultOptions = {
      isDraggable: true,                          //  是否开启拖拽
      minSize: 10,                                //  拖动最小间隙
      isPercent: true,                            //  宽高为百分比
      ctrlElsize: 20,                             //  控制器大小
      lineColor: "#000",                          //  分割线颜色
      lineSize: 1,                                //  分割线大小
      creatLine: true,                            //  是否创建分割线
      draggableClassName: "draggable",            //  拖拽样式名称
      rootDomBorder: "1px solid #000",            //  根节点边框
      rowClassname: "r-row",                      //  行样式名称
      columnClassname: "r-col",                   //  列样式名称
      contentClassname: "r-content",              //  单元格样式名称
    };
```

#### 方法

###### init(root_domId,?options) 初始化

###### addRow(dom, ?insertPosition, ?putNode)   添加行
###### addColumn(dom,?insertPosition,?putNode)   添加列
```
参数：
dom 
insertPosition   // 插入的位置 默认值 "bottom"  ["top"(置顶) | "botoom"（置底） | "before"（dom元素的前面） | "after" （dom元素的后面）]
putNode  额外需要载入的节点

返回值：
[newContentEl, thisContentEl]
```

###### insertWindowTop(dom)   在dom元素的上方插入窗口
###### insertWindowBottom(dom)  在dom元素的下方插入窗口
###### insertWindowLeft(dom)                  
###### insertWindowRight(dom) 


#### 属性
```
inited   // 是否已经初始化
```

#### 事件Event

###### 拖动: onDraging((e)=>{})
 ```
 onDraging((e)=>{})
 回调参数：e: {
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
          }
  ```              
  
  
###### 添加窗口: onAddWindow = function(e){}
 ```
 onAddWindow = function(e){}
 回调参数：e: { _event: "addWindow", dom: contentEl }
 
 ```
 
 
###### 添加行: onAddRow = function(e){}
 ```
 onAddRow = function(e){}
 回调参数： e: { _event: "addRow", dom: newContentEl }

 ```
 
 ###### 添加列: onAddColumn = function(e){}
 ```
 onAddColumn = function(e){}
 回调参数： e: { _event: "addColumn", dom: newContentEl }

 ```



