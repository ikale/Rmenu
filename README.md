# Rmenu
## contextmenu.js 实现右键菜单
#### 配置：
```
{
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
一个花括号为一个层级，如果不定义title，默认以键值作为名称。 target 点击后执行的任务，它是一个回调函数，callback(el,targetEl )。

#### 方法：
```
bind(domId)     // 绑定dom元素
unbind(domId)   // 解除绑定
update(config)  // 更新配置
```


#### 属性:
```
isbind_containers   //查看已绑定的dom
```


## frameContainer.js  实现拖拽调整布局大小

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
addRow(targetDom,addDom)
addColumn(targetDom,addDom)
```

##### 事件
```
 * Event 拖动: onDraging(function(a, b){})
 * Event 添加行: onAddRow = function(e){}
 * Event 添加列: onAddColumn = function(e){}
 ```
 
