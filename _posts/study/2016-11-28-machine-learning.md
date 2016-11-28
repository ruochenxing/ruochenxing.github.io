---
layout: post
title: 机器学习初探-识别图片验证码实现篇
category: study
tags:
    - machine-learning
description:  机器学习(Machine Learning, ML)就是专门研究计算机怎样模拟或实现人类的学习行为，以获取新的知识或技能。其涉及范围还是挺广的，包括概率论、统计学、逼近论、凸分析、算法复杂度理论等。比如前段时间打败世界顶级围棋棋手李世石的AlphaGo就是一个很好的例子。

---


在这篇文章里大致的讲解了一下机器学习识别验证码的整个过程，现在我们用python代码来实现一下。

#### 环境
* python2.7
* requests
* libsvm

首先，我们需要大量的样本来进行模型训练，所以要先下载一些验证码下来。

```
# 下载图片
def downloads_pic(pic_path, picname):
	r = int(time.time()) * 1000
	r_s = to36(int(r))
	url = "http://xxxx.com/User/Validation/" + r_s
	res = requests.get(url, stream=True)
	with open(pic_path + picname + '.jpg', 'wb') as f:
		for chunk in res.iter_content(chunk_size=1024):
			if chunk:
				f.write(chunk)
				f.flush()
		f.close()
```
图片如下：

![验证码](http://r.photo.store.qq.com/psb?/V13noWcS14yFN5/Oo6e3JSA*kfBrKMmT3vsqIoganAplFC26hwBcyFtY1k!/o/dHEBAAAAAAAA&ek=1&kp=1&pt=0&bo=tATWAbQE1gEDACU!&su=1137315937&sce=0-12-12&rf=2-9)

分析其特征，包括：四个只含有阿拉伯数字和字母的字符，50*22像素。四个字符排列还算整齐，分割起来比较容易。

#### 二值化

首先将其二值化以便之后训练时减少算法的复杂度

```
def get_bin_table():
	threshold = 80
	table = []
	for ii in range(256):
		if ii < threshold:
			table.append(0)
		else:
			table.append(1)
	return table
	
def toGrey(im):
	imgry = im.convert('L')  # 转化为灰度图
	table = get_bin_table()
	out = imgry.point(table, '1')
	return out
```

#### 去除噪点

然后去除噪点，可以看出，这里的验证码相对简单，其实也没必要去除噪点，但我这里还是简单说一下去除噪点的实现。

![去除噪点](http://images2015.cnblogs.com/blog/111649/201607/111649-20160715101529561-1953823859.png)

方法就是，对所有黑点周边的黑点进行计数，如果其周边黑点数少于2个，我们则认为此点为孤立点，然后将这些孤立点移除。如上图所示。代码如下：

```
# 黑点个数
def sum_9_region(img, x, y):
	width = img.width
	height = img.height
	flag = getflag(img, x, y)
	# 如果当前点为白色区域,则不统计邻域值
	if flag == 0:
		return 0
	# 如果是黑点
	if y == 0:  # 第一行
		if x == 0:  # 左上顶点,4邻域
			# 中心点旁边3个点
			total = getflag(img, x, y + 1) + getflag(img, x + 1, y) + getflag(img, x + 1, y + 1)
			return total
		elif x == width - 1:  # 右上顶点
			total = getflag(img, x, y + 1) + getflag(img, x - 1, y) + getflag(img, x - 1, y + 1)
			return total
		else:  # 最上非顶点,6邻域
			total = getflag(img, x - 1, y) + getflag(img, x - 1, y + 1) + getflag(img, x, y + 1) \
					+ getflag(img, x + 1, y) \
					+ getflag(img, x + 1, y + 1)
			return total
	elif y == height - 1:  # 最下面一行
		if x == 0:  # 左下顶点
			# 中心点旁边3个点
			total = getflag(img, x + 1, y) + getflag(img, x + 1, y - 1) + getflag(img, x, y - 1)
			return total
		elif x == width - 1:  # 右下顶点
			total = getflag(img, x, y - 1) + getflag(img, x - 1, y) + getflag(img, x - 1, y - 1)
			return total
		else:  # 最下非顶点,6邻域
			total = getflag(img, x - 1, y) + getflag(img, x + 1, y) + getflag(img, x, y - 1) + getflag(img, x - 1, y - 1) + getflag(img, x + 1, y - 1)
			return total
	else:  # y不在边界
		if x == 0:  # 左边非顶点
			total = getflag(img, x, y - 1) + getflag(img, x, y + 1) + getflag(img, x + 1, y - 1) + getflag(img, x + 1, y) + getflag(img, x + 1, y + 1)
			return total
		elif x == width - 1:  # 右边非顶点
			total = getflag(img, x, y - 1) + getflag(img, x, y + 1) + getflag(img, x - 1, y - 1) + getflag(img, x - 1, y) + getflag(img, x - 1, y + 1)
			return total
		else:  # 具备9领域条件的
			total = getflag(img, x - 1, y - 1) + getflag(img, x - 1, y) + getflag(img, x - 1, y + 1) + getflag(img, x, y - 1) \
					+ getflag(img, x, y + 1) + getflag(img, x + 1, y - 1) + getflag(img, x + 1, y) + getflag(img, x + 1, y + 1)
			return total
			
# 判断像素点是黑点还是白点
def getflag(img, x, y):
	tmp_pixel = img.getpixel((x, y))
	if tmp_pixel > 228:  # 白点
		tmp_pixel = 0
	else:  # 黑点
		tmp_pixel = 1
	return tmp_pixel
```

去除噪点代码

```
# 去除噪点
def greyimg(image):
	width = image.width
	height = image.height
	box = (0, 0, width, height)
	imgnew = image.crop(box)
	for i in range(0, height):
		for j in range(0, width):
			num = sum_9_region(image, j, i)
			if num < 2:
				imgnew.putpixel((j, i), 255)  # 设置为白色
			else:
				imgnew.putpixel((j, i), 0)  # 设置为黑色
	return imgnew
```

#### 分割图片

图片预处理完后，对图片进行分割，通过对图片的分析可以得知：
![图片分割](http://r.photo.store.qq.com/psb?/V13noWcS14yFN5/AAHdheccNtILdU.5nsizXVtUD10K3VXIWMzlrtSpXhg!/o/dHABAAAAAAAA&ek=1&kp=1&pt=0&bo=twWAAjwGugIDAJc!&su=1262018705&sce=0-12-12&rf=2-9)

* 图片像素50*22
* 每个字符间隔1像素
* 每个字符宽8个字符
* 字符的外边距,上下为5，左右为6.
分割后查看效果，然后适当的优化一下，最后的源码如下：

```
# 分割图片
def spiltimg(img):
	# 按照图片的特点,进行切割,这个要根据具体的验证码来进行工作.
	child_img_list = []
	for index in range(4):
		x = 6 + index * (8 + 1) 
		y = 5
		child_img = img.crop((x, y, x + 9, img.height - 2))
		child_img_list.append(child_img)
	return child_img_list
```
最后得到的结果如下：
![分割结果](http://r.photo.store.qq.com/psb?/V13noWcS14yFN5/lZ0Dh8LYqBDZXhL6CTPBpnkwpBJSI8CT.X5LIjFnHHU!/o/dHcBAAAAAAAA&ek=1&kp=1&pt=0&bo=XwOAAqgDtgIDAOQ!&su=140884721&sce=0-12-12&rf=2-9)

#### 素材标记
由于本文使用的这种识别方法中，机器在最开始是不具备任何 数字的观念的。所以需要人为的对素材进行标识，告诉机器什么样的图片的内容是1什么是2.
如下图所示：

![归类](https://static.oschina.net/uploads/img/201611/28165134_2CyL.png)

根据之前的文章对图片的分析，我们记录下一个字符图片的每一行和每一列各有多少个黑点当作这个验证码的特征码记录下来。
代码如下：

```
def get_feature(img):
	# 获取指定图片的特征值,
	# 1. 按照每排的像素点,高度为12,则有12个维度,然后为8列,总共20个维度
	# :return:一个维度为20（高度）的列表
	width, height = img.size
	pixel_cnt_list = []
	for y in range(height):
		pix_cnt_x = 0
		for x in range(width):
			if img.getpixel((x, y)) <= 100:  # 黑色点
				pix_cnt_x += 1
		pixel_cnt_list.append(pix_cnt_x)
	for x in range(width):
		pix_cnt_y = 0
		for y in range(height):
			if img.getpixel((x, y)) <= 100:  # 黑色点
				pix_cnt_y += 1
		pixel_cnt_list.append(pix_cnt_y)

	return pixel_cnt_list
	
def train(filename, merge_pic_path):
	if os.path.exists(filename):
		os.remove(filename)
	result = open(filename, 'a')
	for f in os.listdir(merge_pic_path):
		if f != '.DS_Store' and os.path.isdir(merge_pic_path + f):
			for img in os.listdir(merge_pic_path + f):
				if img.endswith(".jpg"):
					pic = Image.open(merge_pic_path + f + "/" + img)
					pixel_cnt_list = get_feature(pic)
					if ord(f) >= 97:
						line = str(ord(f)) + " "
					else:
						line = f + " "
					for i in range(1, len(pixel_cnt_list) + 1):
						line += "%d:%d " % (i, pixel_cnt_list[i - 1])
					result.write(line + "\n")
	result.close()
```

最后生成的标记结果如下：
![模型结果](http://r.photo.store.qq.com/psb?/V13noWcS14yFN5/dAJvTqQT*hN2EjhzHG1LZE6eeA7FobvmpuwwT1NeIeg!/o/dHwBAAAAAAAA&ek=1&kp=1&pt=0&bo=NAb0ADQG9AADACU!&su=1250639265&sce=0-12-12&rf=2-9)

一行特征码代表一张图片，最前面的一列就是这个特征码所代表的字符，后面的1:1 2:2 意思就是第一行有1个黑点，第二行有两个黑点。而19:4，20:7就是第一列有4个黑点，第2列有7个黑点。

#### 模型训练

这里我们用的是libsvm，首先在这里[下载](http://www.csie.ntu.edu.tw/~cjlin/libsvm)，然后将整个目录拷贝到你的项目中，在libsvm目录下执行make命令，并添加`__init__.py`，在libsvm/python目录下执行make命令并添加`__init__.py`，至此，就可以在项目中使用`from libsvm.python.svmutil import *` 来调用libsvm了。此时只需要输入特征文件就可以输出模型文件。

```
# 模型训练
def train_svm_model(filename):
	y, x = svm_read_problem(base_path + filename)
	model = svm_train(y, x)
	svm_save_model(base_path + "svm_model_file", model)
```


#### 模型测试

训练生成模型后，需要使用 训练集 之外的全新的标记后的图片作为 测试集 来对模型进行测试。

首先根据前面提到的方法生成需要识别的验证码的特征码，并将其全部标记为0，代码如下：

```
def train_new(filename, path_new):
	if os.path.exists(filename):
		os.remove(filename)
	result_new = open(filename, 'a')
	for f in os.listdir(path_new):
		if f != '.DS_Store' and f.endswith(".jpg"):
			pic = Image.open(path_new + f)
			pixel_cnt_list = get_feature(pic)
			line = "0 "
			for i in range(1, len(pixel_cnt_list) + 1):
				line += "%d:%d " % (i, pixel_cnt_list[i - 1])
			result_new.write(line + "\n")
	result_new.close()
```

将生成的文件传入到下面方法中，每四个字符为一个识别结果。

```
# 使用测试集测试模型
def svm_model_test(filename):
	yt, xt = svm_read_problem(base_path + '/' + filename)
	model = svm_load_model(base_path + "svm_model_file")
	p_label, p_acc, p_val = svm_predict(yt, xt, model)  # p_label即为识别的结果
	cnt = 0
	results = []
	result = ''
	for item in p_label:  # item:float
		if int(item) >= 97:
			result += chr(int(item))
		else:
			result += str(int(item))
		cnt += 1
		if cnt % 4 == 0:
			results.append(result)
			result = ''
	return results
```

至此，识别过程结束。













