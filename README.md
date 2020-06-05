# Rmenu
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
style_opts = {
    contrl_size: 14,            //  控制器尺寸
    splitline_size: 1,          //  分割线尺寸
    splitline_color: "#aaa",    //  分割线颜色
    border: "2px solid #aaa",   //  父级外框
    min_size: 50,               //  拖动的最小间隔
  };
```

#### 方法
```
init(root_domId,?styleOption)          // 初始化
setInitMode(mode)                      // 初始模式，row | col （注：页面没有 "结构"dom时才需要初始化，参考上方结构介绍）

insertWindowTop(dom)                   // 在dom元素的上方插入窗口
insertWindowBottom(dom)                // 在dom元素的下方插入窗口
insertWindowLeft(dom)                  
insertWindowRight(dom) 
```

#### 属性
```
inited   // 是否已经初始化
```

#### 事件
```
 * Event 拖动: onDraging(function(a, b){})
 * Event 添加窗口 onAddWindow = function(e){}
 ```
 
