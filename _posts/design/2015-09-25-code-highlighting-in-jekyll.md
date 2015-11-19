---
layout: post
title: Jekyll-based 博客中实现代码高亮
category: design
tags: jekyll highlighting
image: http://i61.tinypic.com/10o44g9.png
description: 之前使用别人的博客模板，代码高亮so easy的，直接在`_config`中设置`highlighter`为`pygments`就可以了。可是自己改了一个模板，加上没有认真读[Jekyll Docs](http://jekyllrb.com/docs/templates/)，代码高亮失效了。好吧，还是自己动手。
---

之前使用别人的博客模板，代码高亮so easy的，直接在`_config`中设置`highlighter`为`pygments`就可以了。可是自己改了一个模板，加上没有认真读[Jekyll Docs](http://jekyllrb.com/docs/templates/)，代码高亮失效了。好吧，还是自己动手。

在GitHub Pages中实现代码高亮有两个选择，一是自定义CSS，另一个是使用嵌入的Gists。

# 自定义CSS样式

要让Jekyll为你实现代码高亮，需要做以下三件事：

* 添加一个语法高亮的CSS文件到你的文件目录中，例如`css/syntax.css`。Jekyll Docs中提到了一个现成的[syntax.css](https://github.com/mojombo/tpw/tree/master/css/syntax.css)，这个是和GitHub用的是同一种风格。

* 将刚才添加的CSS文件包含到相应的layout文件中，例如`_layouts/post.html`。

{% highlight css linenos %}
<head>
...
<link href="/css/syntax.css" rel="stylesheet">
...
</head>
{% endhighlight %}

* 第三步呢，就是在你的post中使用`highlight` Liquid tags。当然，你需要在`_config.yml`中设置好highlighter。如果你不想显示行号，可以不用加`linenos`。

* 那么，举个栗子，这段Ruby代码经过Jekyll处理之后就变成：

{% highlight ruby linenos %}
def show
  puts "Outputting a very lo-o-o-o-o-o-o-o-o-o-o-o-o-o-o-o-ong lo-o-o-o-o-o-o-o-o-o-o-o-o-o-o-o-ong lo-o-o-o-o-o-o-o-o-o-o-o-o-o-o-o-ong line"
  @widget = Widget(params[:id])
  respond_to do |format|
    format.html # show.html.erb
    format.json { render json: @widget }
  end
end
{% endhighlight %}

{% highlight ruby %}
def show
  puts "Outputting a very lo-o-o-o-o-o-o-o-o-o-o-o-o-o-o-o-ong lo-o-o-o-o-o-o-o-o-o-o-o-o-o-o-o-ong line"
  @widget = Widget(params[:id])
  respond_to do |format|
    format.html # show.html.erb
    format.json { render json: @widget }
  end
end
{% endhighlight %}

还不错吧，你还可以进一步改进CSS（完整版的[syntax.css](https://github.com/flinhong/flinhong.github.io/blob/share/css/syntax.css)），使行号与代码部分以不同样式分隔开，比如说我这里，让行号颜色变浅一些，并添加了竖线分割。要这么做，只需要在CSS中添加：

{% highlight html linenos %}
/* Add to css/syntax.css */
.highlight .lineno { color: #ccc; display:inline-block; padding: 0 5px; border-right:1px solid #ccc; }
.highlight pre code { display: block; white-space: pre; overflow-x: auto; word-wrap: normal; }
{% endhighlight %}

# 使用GitHub Gists

除了上述Jekyll内置的代码高亮外，另一种实现代码高亮的方法就是采用GitHub Gists。

打开[GitHub Gist](https://gist.github.com/)，创建一个gist，然后复制`Embed URL`，就能在post中实现和GitHub中一样一样的代码高亮。

比如说这样：

<script src="https://gist.github.com/flinhong/9c155871dadb81927b20.js"></script>


目前我还是采用第一种方法，Gists备用吧，貌似在手机上显示不是很好。
