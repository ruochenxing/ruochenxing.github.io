---
layout: post
title: 使用Python破解支付宝VR红包
category: life
tags:
    - python
description:  最近支付宝上线了VR红包的功能，试玩了几次后发现可以用图片识别进行破解，过程大概就是“截图->切割->除干扰->识别”，在这里简单的说一下过程和实现。

---

最近支付宝上线了VR红包的功能，试玩了几次后发现可以用图片识别进行破解，过程大概就是“截图->切割->除干扰->识别”，在这里简单的说一下过程和实现。

## 前期处理
首先按住红包提示进行截图，然后根据提示图片所处的位置对图片进行切割，将需要识别的那部分提取出来，即下图的蓝框部分。

![1.png](http://7xomt5.com1.z0.glb.clouddn.com/10.PNG)

代码实现：（这里以iPhone6为例）

```
path2 = "/Users/xxx/Desktop/vr/output"
path1 = "/Users/xxx/Desktop/vr/input"

## 提示图片的位置信息，left:左边距,top代表上边距,width代表宽和高（正方形）
position = {
    '750*1335': {'left': 207, 'top': 638, 'width': 338}
}

def handlerImg(path):
    filename = path[path.rfind('/') + 1:]
    extension = path[path.rfind('.') + 1:]
    name = filename.replace(extension + ".", "")
    # 读取图像
    im = Image.open(path)
    w = im.width
    h = im.height

    global position
    pos = position.get(str(w) + '*' + str(h))
    if pos is None:
        pos = position.get('750*1335')
    left = pos['left']
    top = pos['top']
    width = pos['width']
    pic = im.crop((left, top, left + width, top + width))
    
```
## 判断干扰线

此处得到的pic即为切割后的图片，效果如下。

![2.png](http://7xomt5.com1.z0.glb.clouddn.com/12.png)

切割后则需要进行去除黑色干扰线，分析图片发现，干扰线上的像素点的RGB中R的值都不会超过100，我们假定如果像素点RGB值中的R值小于100，我们就认定其为黑色，如果一行像素点中，黑色点超过一定的临界值，我们就认为其为干扰线，然后用临近点去替换它，以达到消除干扰的目的。代码如下：

```
def m2(pic, width):
    last = 0  ##标记上一行的状态是否是黑色
    blacks = []  #黑色点个数
    for y in range(0, width): #遍历 行
        count = 0
        for x in range(0, width):
            pixel = getpixel(pic, x, y) ##获取RGB值
            r, g, b = pixel[0]
            if r < 100:  ##如果该点为黑色
                count += 1
        if count > 334:  # 如果一行中黑色点超过334个，则认为该行为干扰线
            blacks.append(y)
            last = 1
        else:  # 白行
            if last == 1:  # 上一行是黑行
                if 0 < len(blacks) <= 7:  去除黑行
                    copyandpaste2(pic, blacks, width)
            last = 0
            blacks = []
```

## 去除干扰线

去除干扰线有两种方式，

1是使用干扰线上面的某一行像素点分别替换干扰线中的每一行像素点，实现代码如下：

```
def copyandpaste2(pic, blacks, width):
    minline = min(blacks)
    maxline = max(blacks)
    margin = 1
    tmp = pic.crop((0, minline - margin, width, minline - margin + 1))  ##干扰线上方的某一行像素点
    for i in range(minline, maxline + 1):  #对干扰线的每一行像素点进行替换
        pic.paste(tmp, (0, i, width, i + 1))
        
```

2是使用干扰线上面的多行像素点直接替换掉干扰线，实现代码如下：

```
def copyandpaste2(pic, blacks, width):
    minline = min(blacks)
    maxline = max(blacks)
    size = len(blacks)
    tmp = pic.crop((0, minline - size, width, minline)) ##干扰线上方的多行像素点
    pic.paste(tmp, (0, minline, width, maxline + 1)) ##替换
    
```

最后，将去处干扰线后的图片保存

```
pic.save(savepath + '/' + filename, extension)
```
效果如下：
![ccc.png](http://7xomt5.com1.z0.glb.clouddn.com/ccc.png)
![cccc.png](http://7xomt5.com1.z0.glb.clouddn.com/cccc.png)

保存后打开图片扫描即可，目前的正确率还是不错的，不过遗憾的是，每人每天只能领十个红包。下图是战果：

![13.png](http://7xomt5.com1.z0.glb.clouddn.com/13.jpeg)

完整代码如下：

```
# -*- coding: utf-8 -*-

from PIL import Image, ImageFilter
import os
import numpy as np

path2 = "/Users/xxx/Desktop/vr/output"
path1 = "/Users/xxx/Desktop/vr/input"
position = {
    '750*1335': {'left': 207, 'top': 638, 'width': 338}  # 对应iPhone6的截图图片的 坐标点
}


def getpixel(img, x, y):
    tmp_pixel = img.getpixel((x, y))
    return tmp_pixel, rgb2hex(tmp_pixel)


def rgb2hex(rgbcolor):
    r, g, b = rgbcolor
    return (r << 16) + (g << 8) + b


def handlerImg(path, savepath=''):
    filename = path[path.rfind('/') + 1:]
    extension = path[path.rfind('.') + 1:]
    name = filename.replace(extension + ".", "")
    # 读取图像
    im = Image.open(path)
    w = im.width
    h = im.height

    global position
    pos = position.get(str(w) + '*' + str(h))
    if pos is None:
        pos = position.get('750*1335')
    left = pos['left']
    top = pos['top']
    width = pos['width']
    pic = im.crop((left, top, left + width, top + width))
    pic.save(savepath + '/' + name + "1" + ".png", extension)
    m2(pic, width)
    pic.save(savepath + '/' + filename, extension)


def m2(pic, width):
    last = 0
    blacks = []
    for y in range(0, width):
        count = 0
        for x in range(0, width):
            pixel = getpixel(pic, x, y)
            r, g, b = pixel[0]
            if r < 100:
                count += 1
        if count > 334:  # 黑行
            blacks.append(y)
            last = 1
        else:  # 白行
            if last == 1:  # 上一行是黑行
                if 0 < len(blacks) <= 7:
                    copyandpaste1(pic, blacks, width)
            last = 0
            blacks = []


def copyandpaste1(pic, blacks, width):
    minline = min(blacks)
    maxline = max(blacks)
    margin = 1
    tmp = pic.crop((0, minline - margin, width, minline - margin + 1))
    for i in range(minline, maxline + 1):
        pic.paste(tmp, (0, i, width, i + 1))


def copyandpaste2(pic, blacks, width):
    minline = min(blacks)
    maxline = max(blacks)
    size = len(blacks)
    tmp = pic.crop((0, minline - size, width, minline))
    pic.paste(tmp, (0, minline, width, maxline + 1))


def begin():
    ## 批量执行
    for file in os.listdir(path1):
        path = os.path.join(path1, file).lower()
        if path.endswith('png'):
            handlerImg(path, path2)
    ## 单个执行
    # handlerImg(os.path.join(path1, "img_6849.PNG").lower(), path2)


if __name__ == '__main__':
    begin()

```



