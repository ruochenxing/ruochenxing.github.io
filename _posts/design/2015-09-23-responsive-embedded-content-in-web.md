---
layout: post
title: Web中内嵌内容实现响应式效果，自适应屏幕宽度
category: design
tags: css responsive html
image: http://johnpolacek.github.io/scrolldeck.js/decks/responsive/img/responsive_web_design.png
description: 在这篇文章中，将会向您介绍如何使用CSS将嵌套进来的内容具有响应式的效果，比如说视频、日历等能随着浏览器的窗口大小自动调整。对于在网页上嵌入外部视频，而又不想添加额外的标签，我们也将会介绍如何使用JavaScript来替代CSS，让其在响应式设计的网站中能自动调整。
---

在这篇文章中，将会向您介绍如何使用CSS将嵌套进来的内容具有响应式的效果，比如说视频、日历等能随着浏览器的窗口大小自动调整。对于在网页上嵌入外部视频，而又不想添加额外的标签，我们也将会介绍如何使用JavaScript来替代CSS，让其在响应式设计的网站中能自动调整。

> 本文由[大漠](http://www.w3cplus.com/)根据[Rachel McCollin](http://mobile.smashingmagazine.com/author/rachel-mccollin/?rel=author)的《[Making Embedded Content Work In Responsive Design](http://mobile.smashingmagazine.com/2014/02/27/making-embedded-content-work-in-responsive-design/)》所译，如需转载此译文，需注明[英文出处](http://mobile.smashingmagazine.com/2014/02/27/making-embedded-content-work-in-responsive-design/)。
<br>作者：Rachel McCollin<br>译者：大漠

# 嵌入内容的标记

在响应式设计的网页布局中有一些元素没有发挥好，直接损坏响应式设计的布局。其中之一就是`iframe`元素，因为有时候你需要在页面中嵌入外部资源，比如说YouTobe的视频，这个时候就需要用到`iframe`元素。

在你的网站上嵌入内容，我们可以直接使用YouTube提供的代码，复制和粘贴到网站代码中。推荐使用YouTube，因为这样可以省服务器的空间，而且用户无论是用浏览器或设备，YouTube都可以正常的显示视频。目前主要有两种方法向网站中嵌入视频，一种是HTML5的`video`元素，但其在IE低版本中无法得到支持；另一种就是通过Flash，但其在iOS设备是无法工作。

当你在Web中嵌入外部来的资源时，可以通过`iframe`来嵌入：

{% highlight html %}
<iframe width="1280" height="720" src="https://www.youtube.com/embed/09R8_2nJtjg" frameborder="0" allowfullscreen></iframe>
{% endhighlight %}

`iframe`可以将嵌入的外部资源在你的网站中显示出来，因为它包含了一个指向内容来源的网址。

你可以发现，在`iframe`中包含了`width`和`height`属性。移除这两个属性，`iframe`会不显示，因为他不会有尺寸。而且非常的遗憾，我们无法通过CSS来解决这个问题。

`width`属性意味着，当屏幕小于这个宽度的时候，嵌入的内容会超出容器，将打破整个布局。下面的示例中的截图是来自于iPhone竖屏（宽度为320像素）中的效果，页面其他部分都缩小了，以嵌入视频的宽度来适应屏幕宽度。这效果非常的不理想。

![in iphone](http://media.mediatemple.netdna-cdn.com/wp-content/uploads/2014/02/01-non-responsive-video-large.png)

幸运的是，接下来我们主要围绕CSS的方法来解决这个问题。首先向大家介绍如何让嵌入的视频解决这个问题，接下来就是嵌入的日历。

# 响应式的视频

### HTML

为了能让嵌入的视频在Web中实现响应式效果，你需要在`iframe`标签外添加一个容器`div`来包裹他。其结构类似这样：

{% highlight html linenos %}
<div>
	<iframe width="1280" height="720" src="https://www.youtube.com/embed/09R8_2nJtjg" frameborder="0" allowfullscreen></iframe>
</div>
{% endhighlight %}

接下来是给这个容器`div`和`iframe`添加CSS样式。

### CSS

首先我们给包含`iframe`的`div`容器添加一个类名`video-container`（可根据需要自己命名）。正如Thierry Koblentz在ALA中发表的《[“Creating Intrinsic Ratios For Video”](http://alistapart.com/article/creating-intrinsic-ratios-for-video/)》一文中所述，可以在CSS样式表中添加下面的代码：

{% highlight css linenos %}
.video-container {
  position: relative;
  padding-bottom: 56.25%;
  padding-top: 30px;
  height: 0;
  overflow: hidden;
}
{% endhighlight %}

这段代码做了几件事：

* 设置`position`的值为`relative`，用来给`iframe`设置为`absolute`值；
* 设置`padding-bottom`值来计算视频的纵横比例。在我们的示例中，宽高的比例是16:9，表示高度是宽度的56.25%。如果宽高比是4:3，我们设置`padding-bottom`值为75%；
* 设置`padding-top`值为30px，主要为Chrome指定一个空间，这是指定给YouTobe的；
* `height`设置为0，因为我们通过`padding-bottom`来设置元素的高度。我们没有设置`width`，那是因为他要配合响应式设计自动调整容器的宽度；
* 设置`overflow`的值为`hidden`，确保溢出的内容能够隐藏起来。

**我们也要给`iframe`自身设置样式。** 在你的CSS样式文件中添加下面的样式代码：

{% highlight css linenos %}
.video-container iframe {
  position: absolute;
  top:0;
  left: 0;
  width: 100%;
  height: 100%;
}
{% endhighlight %}

`iframe`放置在`div.video-container`容器里，我们是通过下面的方式让`iframe`工作的：

* 使用绝对定位，那是因为包含他的容器的高度为0，如果`iframe`进行正常的定位，我们将给他的高度也是0；
* 设置`top`和`left`，将`iframe`定位在容器的正确位置上；
* 设置`width`和`height`值为100%，确保视频占满所用容器空间(实际是设置`padding-bottom`)的100%。

这样做之后，视频将根据屏幕的宽度进行调整，下图是在桌面上的效果：

![desktop](http://media.mediatemple.netdna-cdn.com/wp-content/uploads/2014/02/02-desktop-video-after-large.png)

而下图是在宽度为320px的手机屏幕上的效果：

![320px](http://media.mediatemple.netdna-cdn.com/wp-content/uploads/2014/02/03-responsive-video-iphone-large.png)

让我们继续了解其他的嵌入内容——特别是google的日历。

# 响应式日历

### HTML

设置嵌入内容具有响应式的CSS样式本质上是相同的，但不同的内容具有不同的纵横比例，这意味着，你要设置相应的`padding-bottom`值。

下面是一个嵌入Google日历的网站的屏幕的截图。正如你所看到的，在小屏幕上，日历打破了整个布局。在这种情况之下，日历在网站上显示正确的宽度，但日历超出屏幕的宽度，部分内容被隐藏了。

![calendar in iphone](http://media.mediatemple.netdna-cdn.com/wp-content/uploads/2014/02/04-non-responsive-calendar-large.png)

嵌入日历的结构如下：

{% highlight html %}
<iframe src="https://www.google.com/calendar/embed?height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=60aqhusbghf7v0qvvbfu1ml22k%40group.calendar.google.com&amp;color=%232952A3&amp;ctz=Europe%2FLondon" style=" border-width:0 " width="800" height="600" frameborder="0" scrolling="no"></iframe>
{% endhighlight %}

要制作响应式日历，需要给`iframe`外添加一个命名为`.calendar-container`的`div`容器：

{% highlight html %}
<div class="calendar-container">
  <iframe src="https://www.google.com/calendar/embed?height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=60aqhusbghf7v0qvvbfu1ml22k%40group.calendar.google.com&amp;color=%232952A3&amp;ctz=Europe%2FLondon" style=" border-width:0 " width="800" height="600" frameborder="0" scrolling="no">
  </iframe>
</div>  
{% endhighlight %}

接下来的步骤是给这个`div`写样式。

### CSS

写在日历上的CSS和视频的样式基本一致，但有两个例外：宽高的比例有所不同，而且不需要设置`padding-top`的值。

将下面的样式添加到样式表中：

{% highlight css linenos %}
.calendar-container {
  position: relative;
  padding-bottom: 75%;
  height: 0;
  overflow: hidden;
}
{% endhighlight %}

在这个例子中，`iframe`的宽度为800px,高度为600px，他们的宽高比例为4:3。所以设置`padding-bottom`的值为75%。

这样做之后，我们需要给容器中的`iframe`设置样式：

{% highlight css linenos %}
.calendar-container iframe {
  position: absolute;
  top:0;
  left: 0;
  width: 100%;
  height: 100%;
}
{% endhighlight %}

这跟应用在视频上的样式是相同的。

现在日历可以根据浏览器窗口调整大小，下图是Android手机上Opera浏览器中的日历效果：

![calendar in opera](http://media.mediatemple.netdna-cdn.com/wp-content/uploads/2013/04/05-responsive-calendar.png)

只要你记得使用适当的元素来包裹嵌入进来的日历和视频，那么这个CSS将适应于任何嵌套到你的网站中的视频与日历。

问题是，日历可以在整个页面是显示，但它几乎是无法使用，因为点击目标太小，甚至重要信息也看不到。如果你想完全显示日历，你也可以，你可以通过一些简单的CSS设置来实现(例如设置`display:block`或者`table`)，或者使用[w3widgets Responsive calendar](http://w3widgets.com/responsive-calendar/)或者[Calendario](http://tympanus.net/codrops/2012/11/27/calendario-a-flexible-calendar-plugin/)在你自己的日历上，你的用户会喜欢上。

# 使用CSS或JavaScript实现响应式视频

如果你正在使用一个CMS来开发一个响应式的网站，你可以通过一些编辑器嵌入一些视频。你可以通过你的编辑器来编辑[EmbedResponsively.com](http://embedresponsively.com/)，生成响应式的`<embed>`代码。实际上你可以通过javascript来解决，而不需要添加额外的标签和CSS。

到目前为止，大多数的解决方案都是依靠javascript的插件，但在一定的程度上，这对性能会有所影响。一个流行的插件是Todd Motto开发的[FluidVids.js](http://toddmotto.com/fluid-and-responsive-youtube-and-vimeo-videos-with-fluidvids-js/)。FluidVids.js的[简单运用](http://gomakethings.com/using-fluidvids-js):

* 从[Github](http://github.com/toddmotto/fluidvids/archive/master.zip)上下载文件下来，并解压缩出来，将文件放到你的项目路径中。把解压出来的js放在一个命名为`dist`的文件目录中。
* 在`<head>`中按下面的方式调用js。

{% highlight html %}
<script src="dist/fluidvids.js></script>
{% endhighlight %}

你需要做的就这些，只要支持js的设备，都可以使视频自动调整。它不仅适用于YouTube而且还适用于Vimeo。但问题是，如果你的用户不支持js或还没加错或者没有正确加载，可以在样式表中添加下面的样式：

{% highlight html %}
iframe {
  max-width: 100%;
}
{% endhighlight %}

这将确保你的视频会根据浏览器的宽度自动调整视频的宽度。但不会调整视频的高度，不幸的是，`iframe`中是行不通这种方式。因此，视频不会破坏你的布局，但它也不会怎么好看。所以这不是一个好的选择，如果能避免使用js还是尽量避免。

# 响应式的Google地图

除了在页面中嵌入视频和日历之外，还有就是在网站中嵌入地图。让嵌入的地图也具有响应式的功能。基本上采用的技术是相同的，同样通过`padding-bootm`来调整地图的宽度和高度的比例。

通常情况下，生成的Google地图的代码类似于：

{% highlight html %}
<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3022.260812859955!2d-73.990184!3d40.756288!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xb134c693ac14a04c!2sThe+TimesCenter!5e0!3m2!1sen!2suk!4v1393485725496" width="500" height="450" frameborder="0" style="border:0"></iframe>
{% endhighlight %}

同样在`iframe`外套一个`div`容器，并且运用相似的样式：

{% highlight css linenos %}
.google-maps {
  position: relative;
  padding-bottom: 90%; // (450 ÷ 500 = 0.9 = 90%)
  height: 0;
  overflow: hidden;
}
.google-maps iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
{% endhighlight %}

此时的结构变成这样：

{% highlight html %}
<div class="google-maps">
  <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d7098.94326104394!2d78.0430654485247!3d27.172909818538997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1385710909804" width="500" height="450" frameborder="0" style="border:0"></iframe>
</div>
{% endhighlight %}

同样，我们可以通过[EmbedResponsively](http://embedresponsively.com/)生成代码。

<iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d575.3471576554579!2d-1.5769315!3d54.7731352!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0000000000000000%3A0xed2897f8e29acfcb!2sDurham+Cathedral!5e0!3m2!1sen!2shk!4v1443016732669" width="600" height="450" frameborder="0" style="border:0" allowfullscreen></iframe>


---

看了这篇文章，才解决了自己博客上视频宽度自适应的问题，我想应该还有人需要解决这个问题吧。

如需转载烦请注明原文出处：

英文原文：http://mobile.smashingmagazine.com/2014/02/27/making-embedded-content-work-in-responsive-design/

中文译文：http://www.w3cplus.com/responsive/making-embedded-content-work-in-responsive-design.html
