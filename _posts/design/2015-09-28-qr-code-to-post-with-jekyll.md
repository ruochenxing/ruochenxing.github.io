---
layout: post
title: 为Jekyll文章添加二维码
category: design
tags: jekyll qrcode
image: http://img.huxiu.com/portal/201303/02/142031masiss3lsk6rzmzl.jpg
description: 自己动手，用jquery-qrcode生成二维码。
---

看到别人这么做，自己也试了下，确实可以。不过还是用分享按钮里面现成的吧。

GitHub上有个现成的[jquery-qrcode.js](https://github.com/jeromeetienne/jquery-qrcode)，按照里面的说明很容易就能为文章生成一个二维码了。

首先去GitHub上clone这个js（[https://github.com/jeromeetienne/jquery-qrcode.git](https://github.com/jeromeetienne/jquery-qrcode.git)），放到合适的地方，在需要生成二维码的地方引用：

{% highlight html %}
<script type="text/javascript" src="jquery.qrcode.min.js"></script>
{% endhighlight %}

然后创建任意一个元素来包含所生成的二维码图片，比如说一个`<div>`：

{% highlight html linenos%}
<div id="qrcode"></div>

<script type="text/javascript">
  $("#code").qrcode({
    width: 150,
    height: 150,
    text: "{{ page.url | prepend: site.url }}"
  });
</script>
{% endhighlight %}

其中的text部分按照自己需要修改就可以。长宽也可以自定义。这样就可以任意生成二维码了。

jQuery-qrcode的作者有个完整的[示例](https://github.com/jeromeetienne/jquery-qrcode/blob/master/examples/basic.html)，也许更有帮助。
