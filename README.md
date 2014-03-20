# jSouper临时帮助文档

## 快速开始

1. 引入`jSouper.js`
```html
<script type="text/javascript" src="js/lib/jSouper.js"></script>
```

2. 在页面上`xmp`节点内书写jSouper-View-Template，并为它声明一个Id，建议使用`jSouperApp`
```html
<body>
  <xmp id="jSouperApp">
    <h1>{{title}}</h1>
  </xmp>
</body>
```

3. 启动应用：
```js
jSouper.ready(function(){
  var jpp = jSouper.app({
    //页面中的元素ID
    Id:"jSouperApp",
    //数据源
    Data:{
      title:"Hello jSouper!!"
    }
  });
});
```
应用生成后，会在全局定义一个`App`变量，这个上面的代码片段中定义的jpp是同个ViewModel对象（下文简称VM）

##  基础语法入门

值得一提的是，作为MVVM框架，jSouper内置了强悍的Model层，为您实现了数据源的自动，多个VM无缝共享同个数据区，准成**“单一数据原则”**
同时，数据支持先使用后定义的特性，在文章后面总便可慢慢体会到它的灵活。

### 数据绑定

数据的绑定支持简单的对象、以及表达式、也可以在表达式中直接使用**JSON对象**
```
<!-- 使用字符串包裹的字符不会被解析，当然也可以使用转义来打乱语法来避免解析 -->
\{\{a\}\}:{{a}}
"{{a+b.c}}":{{window.parseInt(a)+b.c}}
"{{b['c']}}":{{b['c']}}
```
```js
App.set("a",1);
App.set("b.c",2);
```

### 属性绑定

值得高兴的是，不论是属性还是页面文字，我们统一使用同一套语法：
```html
<a href="http://{{myvalue||'about:blank'}}?_={{window.Math.random()}}">{{myvalue}}</a>
```

而在**表单绑定**，如果你有HTML表单知识的基础，相信您很快就能上手：
```html
<select value="{{myvalue}}">
  <option value="1">1</option>
  <option value="2">2</option>
</select>
```
**反向绑定**的方式也是统一使用`bind-input`，需要一个字符串对象来声明绑定的关键字：
```html
<input value="{{myvalue}}" bind-input="{{'myvalue'}}">
<select value="{{myvalue}}" bind-input="{{'myvalue'}}">
  <option value="">-?-</option>
  <option value="baidu.com">百度</option>
  <option value="yinyuetai.com">音悦台</option>
  <option value="youku.com">优酷</option>
</select>
```
> ~~PS：因为反向绑定的参数要求是一个字符串对象，这意味着你可以动态地改变方向绑定的关键字来实现一些奇特的映射~~

### 条件分支

这里开始使用到**特殊前缀**。
但为了降低学习代价，条件语句语法使用和非常常见的[`Handlebars.js`](http://handlebarsjs.com/)类似的语法规则和关键字：`#if-#else-/if`：
```html
{{#if myvalue=='github.com'}}
  很高兴您能访问Github
{{#else}}
  请输入“github.com”，您输入：{{myvalue}}
{{/if}}
```
从上面的实例中可以看出语法规则就是：`前缀`加`空格`加`参数（0个或1个或多个表达式集合，中间用“,”隔开）`。
条件分支中，`#else`是可以不写的。

### 循环分支

循环分支的前缀组合是：`#each-/each`：

```html
{{#each [
  {
    "url":"baidu.com",
    "value":"百度"
  },
  {
    "url":"yinyuetai.com",
    "value":"音悦台"
  },
  {
    "url":"youku.com",
    "value":"优酷"
  }
]}}
<label>{{value}}
<input type="radio" bind-input="{{'$Caller.myvalue'}}" checked="{{$Caller.myvalue}}" value="{{url}}" name="url"></label>
{{/each}}
```

## 进阶模块化

### 模块的定义

写法如下：
```html
<xmp type="template" name="模块名称">
  <fieldset>
    <legend>{{title}}</legend>
    <content>
      <p>{{content}}</p>
      <textarea bind-input="{{'content'}}">随便输入</textarea>
    </content>
  </fieldset>
</xmp>
```
使用方法：
```js
var myfirstvm = jSouper.modules["模块名称"]($初始化数据);
```

### 模块使用数据源

记住，`jSouper.app`这个API所生成的全局对象`App`本身就是一个VM对象，使用`shelter（收留）`方法来声明数据源的共享：
```js
App.shelter(myfirstvm);
```

shelter的第二个参数是String类型，代表绑定的数据源头，比如：
```js
//效果一样
App.shelter(myfirstvm,"$This");
```

### 在View中使用模板

语法介绍
```
{{#layout "模块名称"[,"数据源头key"[,显示的条件[,默认数据]]]}}
```
使用方法如下：
```html
<!-- 可以用#>简写替代#layout -->
{{#> "模块名称"}}
{{#> "模块名称","$This"}}
{{#> "模块名称","$This",true}}
{{#> "模块名称","$This",true,({"content":"???"})}}
```

### 手动解析模板
使用`parse`API来实现：
```js
var module = jSouper.parse("<hr><b>{{bb}}</b>");
var vm1 = module({bb:"手动解析的模板1"});
vm1.append(document.body);

jSouper.parse("<xmp type='template' name='tmpl2'><b>{{bb}}</b><xmp>")
var vm2jSouper.modules[tmpl2]({bb:"手动解析的模板2"})
vm2.append(document.body);
```

### 指定位置放置模板
使用`teleporter`API来实现所谓的**传送**效果。
首先，在View中放置一个传送点：
```html
<div>
  <p>这是传送进来的：</p>
  {{#teleporter "我的传送点1"}}
  <label><input type="checkbox" bind-input="{{'show_tp_2'}}">显示传送进来的VM：</label>
  {{#teleporter "我的传送点2",show_tp_2}}
  <hr>
</div>
```
在程序中将一个指定VM传送到这个VM的传送点内：
```js
App.teleporter(jSouper.modules["模块名称"]({
  title:"数据是独立的",
  content:"因为没有通过使用shelter API来声明数据源的共享"
}),"我的传送点1");
App.teleporter(jSouper.modules["模块名称"]({
  title:"数据是独立的",
  content:"因为没有通过使用shelter API来声明数据源的共享"
}),"我的传送点2");
```

### 定义模块的构造函数
```html
<script type="text/vm" name="模块名称">
  function  (vm) {
    vm.set("content","VM:"+vm._id+"初始化了\n"+vm.get("content"))
  }
</script>
```

## 高级特性

### 前缀关键字

#### 作用域关键字

* `$Caller`：获取上一个作用域区域
* `$App`：获取主应用作用域

#### 数据域关键字

* `$Parent`：获取上一层数据
* `$This`：获取当前层数据
* `$Private`：定位到私有某个Model节点的私有数据区
* `$Top`：获取最顶层的数据区
* `$Js`：获取以全局对象为数据源的Model，即：`new Model(window)`

#### 特殊值关键字

* `$Path`：获取当前数据源的路径（PS：用这个可以实现许多高级的动态映射，比如把JSON-Object数据绑定成HTML-Tree，而无需转化为Array数据）
* `$Index`：获取数组中的下标

#### 疑难点

1. `$Caller`与`$Parent`

二者的不同点，在于`$Caller`针对作用域，而`$Parent`针对数据的结构。
比如下面的代码：
```html
{{#each array_data}}
  <!-- 数据结构上，当前数据节点的父级是数组数据 -->
  {{$This}} === [ {{$Parent}} ][ {{$Index}} ]
{{/each}}
<hr>
{{#each array_data}}
  <!-- 作用域上，上一级作用域相当于$Parent.$Parent（data.array_data.0 =$Parent=> data.array_data =$Parent=> data） -->
  {{$This}} === [ {{$Caller.array_data}} ][ {{$Index}} ]
{{/each}}
```

2. `$Js`的用途

或许你会很纳闷`$Js`的存在感，你甚至不能这样用，因为可以使用在`window`前缀在View的表达式中，但是要注意的是，使用window前缀是无法进行绑定的，比如文章前面的代码中有出现：`{{window.Math.random()}}`，如果你改变了random对象是无法触发更新的。
但如果使用`$Js.Math.random`，并通过set进行修改函数，触发就能正常运作。

3. `$App`的用途

我承认这个东西其实并没多少用，和`$Js`一样使用的频率一样不大，但是如果你想省去写`shelter`的话或许可以试一下。

### 那些奇怪的设定

#### `#layout`与`#teleporter`的**显示的条件**

如果你认为这个参数只是为了省去`#if-\if`的话那就大错特错了，这如同为递归函数加上了退出堆栈的条件，一方面节省了无畏的资源开支，同时也可以避免死循环，这样就能实现无限的递归了，你可以动态添加数据节点从而动态添加HTML节点，尽情享用Ajax。

### 不懂构造函数有什么用？

刚入门这个概念的可能不大清楚我创建构造函数这个概念是为了什么，说是为了交互？没必要，交互的话在正常的`<script>`标签就能处理实现，同样也能达成代码的复用。关键的是在构造函数中，你能获取到这个VM对象，而且这个逻辑**发生在你的业务代码获取到这个VM对象前**，所以我们就能用它来做一些手脚。比如格式化数据，为节点动态添加属性绑定。

比如下面的代码，用来动态添加属性，这样就省去在View中写一大堆绑定了，还有定义一个自动更新的计算属性：
```html
<script>
function initVM(vm){//这边函数名什么的写的不会影响到全局，我们会给一个独立的闭包进行编译
  /*
   * 动态绑定属性
   */
  //获取存储在attr字段内的特定数据
  var _attr = vm.get("attr")||{};

  //由于这时vm可能还没在document.body中，所以无法用jQuery直接取值
  //不过你可以通过vm.topNode来获取这个vm所属的父级节点，交给jQuery，从而使用jQuery取值
  var nodes = vm.queryElement({
    tagName:"DIV"
  });//这里node数组

  //生成新的属性绑定列表
  var _attr_bind = {};
  for(var i in _attr){
    _attr_bind[i] = "{{attr."+i+"}}";
  }

  //绑定属性
  vm.addAttr(nodes , _attr_bind);

  /*
   * 处理属性
   */
  //写在$Private中的数据只数据这个数据节点，不会影响到整个数据源，当然也可以用来绑定
  vm.set("$Private.result",Model.Observer(function(){
    //Model.Observer是Model的拓展类，用于与相应的数据形成绑定关系
    //但a或者b发生改变时，$Private.result也会触发更新，
    return vm.get("a") + vm.get("b");
    //PS：如果你想性能优先，手动触发更新，可以用Model.define来声明一个简单的计算属性
  }));
}
</script>
```
#### `#layout`第四个参数为何而生？

如果你认为这个功能只是鸡肋般的存在的话，我且问一句，难道你想让前端开发的人在使用组件时还要跑去写一个JS文件来配置页面上的参数？
它的存在如同在HTML标签中写属性一样，鲜明的效果！有些东西本就应该在View层中声明，不然我们就退化到界面属性全部用代码写了！HTML的意义又何在？注意的是，由于它大部分情况下是JSON对象，所以我建议用`()`进行包裹，避免和View层的语意符号冲突。当然如果您将模板配置成`<%  %>`那想来是最保险了。

### 还有多少深藏不露的功能？

#### Model.Observer

刚才的代码中可以看到它的影子，就像大部分MV*框架带有的计算属性一样，不同的是，它能定义`setter`。
其中第一个参数是`getter`，第二个参数是`setter`。
如果你想知道怎么使用，我建议您还是在控制台中打个断点，或者打印出它的参数：`console.log(arguments)`。
幸运的是，如果你不知道我前面这句在讲什么，那么你无需想办法去支配这个功能，特别是setter。

#### 自定义Model类型

```js
Model.extend("新类型的名字",function(){
  var $对象 = {
    get:function(){},
    set:function(){}
  }
  return $对象
});
```