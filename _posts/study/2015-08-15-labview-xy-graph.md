---
layout: post
title: LabVIEW中XY图曲线显示方法
tags:
  - LabVIEW Study
  - xy graph
category: study
image: http://errantscience.com/wp-content/uploads/Labview-vs-Python.jpg
description: LabVIEW 中有很多图形显示控件，最常用的有三个：波形图（Waveform Graph），波形图（Waveform Chart），XY图（XY Graph）。这里就主要介绍一下XY图的使用。
---

*LabVIEW* 中有很多图形显示控件，最常用的有三个：波形图（Waveform Graph），波形图（Waveform Chart），XY图（XY Graph）。这里就主要介绍一下XY图的使用。

XY图专门用于表示Y值随X值得变化规律，很多资料中都说：

> XY图只能用来一次显示接收到的数据，并无实时显示能力

但是合理编程，还是可以实时显示的，下文中我会讲到这样一种实时显示方法。XY图控件位置为：前面板——图形——XY图，其完整路径及控件如下：

![path](https://s3.amazonaws.com/f.cl.ly/items/3g0k3r432I2q0P1N1I3Q/Image%202.png)

下面来说XY图的应用。首先是单曲线的显示，有两种方法。

* 先将单个点的X，Y坐标捆绑成簇，再组成数组送给XY图；
* X，Y轴坐标先输出为一维数组，再捆绑为簇送给XY图。

![2method](http://cl.ly/image/1m182M2D2s3I/Image%203.png)

对于两条曲线显示，有多种方法。

* 将两条曲线的坐标分别捆绑为簇，再组成数组送给XY图（和单曲线显示方法一类似）；
* 各曲线X，Y轴坐标输出为一维数组，分别捆绑为簇之后，再创建簇数组送给XY图（和单曲线显示方法一类似）；
* 各曲线X，Y轴坐标分别捆绑为簇，输出为一维簇数组，然后捆绑为簇，创建簇数组送给XY图。

![3method](http://cl.ly/image/1h440z2s0b0s/Image%204.png)

![3method sample](http://cl.ly/image/3X2B0W2T0q02/Image%205.png)

双曲线显示还有另外一种方法，就是我说的可以实现**即时显示**功能的。不过似乎最多**两条**，再多我不知道为什么不可以了。

![realtime](http://cl.ly/image/260p0y2w0E3z/Image%206.png)
![sample](http://cl.ly/image/1s083v2e2h3h/Screen%20Recording%202015-08-05%20at%209.02.42%20%E4%B8%8B%E5%8D%88.gif)

最后说一下超过两条曲线输出时可用的方法。

![relsample](http://cl.ly/image/1z0C103U370m/Image%207.png)

照猫画虎搬运了上面的内容，也当做是自己的一个笔记吧。

[Reference](http://zoomsky1988.blog.163.com/blog/static/165202344201122363936708)
