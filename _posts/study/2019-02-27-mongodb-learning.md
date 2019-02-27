---
layout: post
title: mongodb安装与使用
category: study
tags:
    - learn
description:  mongodb安装与使用
---



### mongodb安装与使用

#### 安装mongo服务器
* 访问 `https://www.mongodb.com/download-center/community`，获取对应的package和服务器类型获取下载地址（此处以ubuntu18.04为例），

* 使用命令 将文件下载到服务器

	`wget https://repo.mongodb.org/apt/ubuntu/dists/bionic/mongodb-org/4.0/multiverse/binary-amd64/mongodb-org-server_4.0.6_amd64.deb`
	
* 运行

	`sudo dpkg -i mongodb-org-server_4.0.6_amd64.deb`
	
* 修改配置文件

	因为默认情况mongodb是只能本地访问的，但是我们服务器本地又没有安装mongodb的客户端，所以，我们需要更改一下配置文件，默认`/etc/mongod.conf`,将`bindIp`改为`0.0.0.0`
	

* 启动

	`sudo service mongod start`
	

* 访问 在安装客户端的机器上执行以下命令便可以访问mongodb了

	`mongo --host 10.211.55.7 --port 27017` 
	
	
#### 安装客户端

* 访问 `https://www.mongodb.com/download-center/community`，获取对应的package和服务器类型获取下载地址（此处以ubuntu18.04为例），

* 使用命令 将文件下载到服务器

	`wget https://repo.mongodb.org/apt/ubuntu/dists/bionic/mongodb-org/4.0/multiverse/binary-amd64/mongodb-org-shell_4.0.6_amd64.deb`
	
* 运行

	`sudo dpkg -i mongodb-org-shell_4.0.6_amd64.deb`
	
* 使用客户端访问mongo

	`mongo` 

#### 添加权限

* 执行 `mongo`，连接到mongo服务，然后执行以下命令

	```
	use admin
	db.createUser({user: 'root', pwd: '123456', roles: ['root'],"mechanisms":["SCRAM-SHA-1"]});
	db.createUser({user:"testuser",pwd:"123456",roles:[{role:"readWrite",db:"test"},{role:"read",db:"admin"}]});
	```
	
* 修改配置文件 /etc/mongod.conf 添加以下配置

	```
	security:
  		authorization: enabled
	```

* 重启

	`sudo service mongod restart` 或者使用`mongod --config /etc/mongod.conf` 
	如果不修改配置，也可以使用`mongod --config /etc/mongod.conf --auth` 来启动

	
* 访问mongod服务器
	执行 `mongo -port 27017 -u root -p` 然后输入密码即可。当然，执行mongo也是可以访问的，但是很多操作都没有权限，所以还要再进行认证，执行以下命令
	```
	use admin
	db.auth("admin", "123456")
	```
	