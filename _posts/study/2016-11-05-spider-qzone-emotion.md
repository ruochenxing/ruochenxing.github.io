---
layout: post
title: 爬取QQ空间的说说列表
category: study
tags:
    - qzone
description:  爬取QQ空间的`某个用户`的`可访问`的所有说说列表，包括说说图片和评论图片，说说图片存放在emotions文件夹中，评论中的图片存放在comments文件夹中，说说列表存放在当前目录的`qq号.txt`文本文件中。原理就是通过扫描二维码模拟登录webqq，然后分析QQ空间的请求地址，解析数据即可。可以爬取自己的也可以爬取别人的，只要你能访问对方的QQ空间。

---

## 爬取QQ空间的说说列表


爬取QQ空间的`某个用户`的`可访问`的所有说说列表，包括说说图片和评论图片，说说图片存放在emotions文件夹中，评论中的图片存放在comments文件夹中，说说列表存放在当前目录的`qq号.txt`文本文件中。


如果是带有图片的说说或评论，则在说说或评论的内容后面都会有`[img1][img2]...[imgN]`等内容来对应emotions或comments文件夹下的图片，即[img1]对应`img1.jpg`。

评论前缀为`====`的为一级评论，评论前缀为`======`的为二级评论，也就是评论的回复。



原理就是通过扫描二维码模拟登录webqq，然后分析QQ空间的请求地址，解析数据即可。可以爬取自己的也可以爬取别人的，只要你能访问对方的QQ空间。


以下是代码：`ExportQzoneData.py`

```
# coding=utf-8

import json
import os
import sys
import urllib2
import time
from QzoneLogin import QzoneLogin

reload(sys)
sys.setdefaultencoding("utf-8")

DEST_QQ = "10000"
f = open(DEST_QQ+".txt", "a")
baseDir = ''
emotionsDir = ''
commentsDir = ''
qqLogin = None
imageCount = 0
tweetCount = 0


def seemore(uin, tid, pos, num):
	gtk = qqLogin.getgtk()
	refer = 'http://user.qzone.qq.com/'+str(uin)
	html = qqLogin.get('http://taotao.qq.com/cgi-bin/emotion_cgi_msgdetail_v6?uin={0}&tid={1}&t1_source=undefined&ftype=0&sort=0&pos={2}&num={3}&g_tk={4}&callback=_preloadCallback&code_version=1&format=jsonp&need_private_comment=1'.format(str(uin),str(tid),int(pos),int(num),str(gtk)),refer)
	html = html.replace('_preloadCallback(', '')
	html = html.replace(');', '')
	if html == '':
		print str(uin), "\t", str(tid), "\t", str(pos), "\t", str(num)
		return
	data = json.loads(html)
	if data.get("commentlist") is None:
		print data
		sys.exit(0)
	commentlist = data['commentlist']
	parsecomments(commentlist)


def parsecomments(commentlist):
	if commentlist is None or len(commentlist) <= 0:
		return
	for j in range(0, len(commentlist)):
		comment = commentlist[j]
		parsecomment(comment)


def parsecomment(comment):
	global imageCount
	if comment is None:
		return
	c_qq = str(comment['uin'])  # 评论人QQ
	c_content = str(comment['content'])  # 评论内容
	c_createtime = str(comment['createTime2'])
	c_name = str(comment['name'])  # 评论人
	f.write("===="+c_name+"["+str(c_qq)+"]("+c_createtime+")："+c_content+"\n")
	picstr = ''
	if comment.get("pic") is not None:
		pics = comment["pic"]
		for i in range(0, len(pics)):
			imageCount += 1
			pic = pics[i]
			url = pic["hd_url"]
			if url == '':
				url = pic['b_url']
			try:
				content2 = urllib2.urlopen(url, timeout=30).read()
				file1 = open('{0}/{1}.jpg'.format(commentsDir, "img"+str(imageCount)), "wb")
				file1.write(content2)
				file1.flush()
				file1.close()
				picstr += ('[img'+str(imageCount)+']')
			except Exception, ee:
				print ee
	if comment.get("list_3") is None:
		return
	list_3 = comment['list_3']
	if list_3 is None or list_3 == '' or len(list_3) == 0:
		return
	for k in range(0, len(list_3)):
		reply = comment['list_3'][k]
		if len(picstr) == 0:
			f.write("======"+reply['name']+"："+reply['content']+"\n")
		else:
			f.write("======" + reply['name'] + "：" + picstr + "\n")


def prestart(destqq):
	global baseDir, emotionsDir, commentsDir
	baseDir = destqq
	emotionsDir = destqq+"/"+"emotions"
	commentsDir = destqq+"/"+"comments"
	if not os.path.isdir(baseDir):
		os.makedirs(baseDir)
		os.makedirs(emotionsDir)
		os.makedirs(commentsDir)


def taothandler(uin, pos, num):
	global imageCount, tweetCount
	code = 0
	message = ''
	gtk = qqLogin.getgtk()
	try:
		refer = "http://cnc.qzs.qq.com/qzone/app/mood_v6/html/index.html"
		html = qqLogin.get('http://taotao.qq.com/cgi-bin/emotion_cgi_msglist_v6?uin={0}&ftype=0&sort=0&pos={1}&num={2}&replynum=100&g_tk={3}&callback=_preloadCallback&code_version=1&format=jsonp&need_private_comment=1'.format(uin, pos, num, str(gtk)), refer)
		html = html.replace('_preloadCallback(', '')
		html = html.replace(');', '')
		data = json.loads(html)
		code = data['code']
		message = data['message']
		emotions = []
		for i in range(0, len(data['msglist'])):
			if data['msglist'][i] is None:
				break
			# 说说内容
			tweetCount += 1
			content = data['msglist'][i]['content']  # 内容
			create_time = time.strftime("%Y-%m-%d	%H:%M:%S", time.localtime(data['msglist'][i]['created_time']))  # 发表时间
			cmtnum = data['msglist'][i]['cmtnum']  # 评论数
			tid = str(data['msglist'][i]['tid'])  # ID
			# name = data['msglist'][i]['name']  # 发表人
			source_name = data['msglist'][i]['source_name']  # 手机类型？
			picstr = ''
			if data["msglist"][i].get("pic") is not None:
				pics = data["msglist"][i].get("pic")
				for j in range(0, len(pics)):
					imageCount += 1
					pic = pics[j]
					url = pic["url2"]
					if url == '':
						url = pic['url1']
					try:
						content2 = urllib2.urlopen(url, timeout=10).read()
						file1 = open('{0}/{1}.jpg'.format(emotionsDir, "img"+str(imageCount)), "wb")
						file1.write(content2)
						file1.flush()
						file1.close()
						picstr += ('[img' + str(imageCount) + ']')
					except Exception, ee:
						print ee
			emotions.append((tid, content, create_time, cmtnum, source_name, uin))
			f.write("\n第"+str(tweetCount)+"条说说[" + str(create_time) + "]：\t" + content + picstr + "\n")
			if int(cmtnum) > 0:
				f.write("评论列表(" + str(cmtnum) + "):\n")
			else:
				f.write("无评论\n")
			# 评论列表
			if int(cmtnum) > 10:
				pos1 = 0
				while pos1 < int(cmtnum):
					seemore(uin, tid, pos1, 20)
					pos1 += 20
			elif int(cmtnum) > 0:
				if data['msglist'][i].get("commentlist") is None:
					print data['msglist'][i]
				else:
					commentlist = data['msglist'][i]['commentlist']
					parsecomments(commentlist)
		print "qq:", uin, "pos:", pos, "...save	emotions count is ", len(emotions)
	except Exception, ee:
		print "get ", uin, " emotions error:", message, code
		if code == -10000 or code == -10031 or code == -3000:  # 被禁
			print "禁止访问" + str(code) + message
		raise StandardError(ee)


def start(qq):
	begin = 0
	while True:
		try:
			taothandler(qq, begin, 20)  # 爬取用户的说说，评论
			begin += 20
		except Exception, ee:
			print ee
			if begin > 0:
				print "目测是爬取完毕...."
			else:
				print "目测是挂了....."
			break


# -----------------
# 主程序
# -----------------
if __name__ == "__main__":
	global qqLogin
	if DEST_QQ == '10000':
		print "你还没有输入要爬谁的说说哦！！"
		sys.exit(0)
	prestart(DEST_QQ)
	try:
		qqLogin = QzoneLogin('./v.jpg')
	except Exception, e:
		print str(e)
		sys.exit(0)
	start(DEST_QQ)

```

`HttpClient.py`，`QzoneLogin.py`的代码参见[这里](https://git.oschina.net/sherlock65535/codes)



