---
layout: post
category: tips
title: HTML 相对路径和绝对路径区别分析
tags: html path
image: http://www.w3.org/wiki/images/5/5d/Path.png
description: HTML初学者会经常遇到这样一个问题，如何正确引用一个文件。比如，怎样在一个HTML网页中引用另外一个HTML网页作为超链接(hyperlink)？怎样在一个网页中插入一张图片。如果你在引用文件时(如加入超链接，或者插入图片等)，使用了错误的文件路径，就会导致引用失效(无法浏览链接文件，或无法显示插入的图片等)。
---

HTML初学者会经常遇到这样一个问题，如何正确引用一个文件。比如，怎样在一个HTML网页中引用另外一个HTML网页作为超链接(hyperlink)？怎样在一个网页中插入一张图片。如果你在引用文件时(如加入超链接，或者插入图片等)，使用了错误的文件路径，就会导致引用失效(无法浏览链接文件，或无法显示插入的图片等)。

为了避免这些错误，正确地引用文件，我们需要学习一下HTML路径。

HTML有2种路径的写法：相对路径和绝对路径。

## HTML相对路径(Relative Path)

### 同一个目录的文件引用

如果源文件和引用文件在同一个目录里，直接写引用文件名即可。

我们现在建一个源文件info.html，在info.html里要引用index.html文件作为超链接。

假设info.html路径是：`c:\Inetpub\wwwroot\sites\blabla\info.html`

假设index.html路径是：`c:\Inetpub\wwwroot\sites\blabla\index.html`

在info.html加入index.html超链接的代码应该这样写：

```
<a href = "index.html">index.html</a>
```

### 如何表示上级目录

../表示源文件所在目录的上一级目录，../../表示源文件所在目录的上上级目录，以此类推。

假设info.html路径是：`c:\Inetpub\wwwroot\sites\blabla\info.html`

假设index.html路径是：`c:\Inetpub\wwwroot\sites\index.html`

在info.html加入index.html超链接的代码应该这样写：

```
<a href = "../index.html">index.html</a>
```

假设info.html路径是：`c:\Inetpub\wwwroot\sites\blabla\info.html`

假设index.html路径是：`c:\Inetpub\wwwroot\index.html`

在info.html加入index.html超链接的代码应该这样写：

```
<a href = "../../index.html">index.html</a>
```

假设info.html路径是：`c:\Inetpub\wwwroot\sites\blabla\info.html`

假设index.html路径是：`c:\Inetpub\wwwroot\sites\wowstory\index.html`

在info.html加入index.html超链接的代码应该这样写：

```
<a href = "../wowstory/index.html">index.html</a>
```

### 如何表示下级目录

引用下级目录的文件，直接写下级目录文件的路径即可。

假设info.html路径是：`c:\Inetpub\wwwroot\sites\blabla\info.html`

假设index.html路径是：`c:\Inetpub\wwwroot\sites\blabla\html\index.html`

在info.html加入index.html超链接的代码应该这样写：

```
<a href = "html/index.html">index.html</a>
```

假设info.html路径是：`c:\Inetpub\wwwroot\sites\blabla\info.html`

假设index.html路径是：`c:\Inetpub\wwwroot\sites\blabla\html\tutorials\index.html`

在info.html加入index.html超链接的代码应该这样写：

```
<a href = "html/tutorials/index.html">index.html</a>
```

## HTML绝对路径(Absolute Path)

HTML绝对路径(absolute path)指带域名的文件的完整路径。

假设我有一个域名[flinhong.github.io](http://flinhong.github.io)，并使用GitHub Pages，那么这个域名就是网站的根目录。

假设在根目录下放了一个文件index.html，这个文件的绝对路径就是： `http://flinhong.github.io/index.html`。

假设在根目录下建了一个目录叫html_tutorials，然后在该目录下放了一个文件index.html，这个文件的绝对路径就是`http://flinhong.github.io/html_tutorials/index.html`。
