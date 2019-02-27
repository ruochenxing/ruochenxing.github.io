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
	
#### 权限说明

* 用户角色

	read: 只读数据权限
	readWrite:学些数据权限

* 数据库管理角色

	root: 超级用户
	dbAdmin: 在当前db中执行管理操作的权限
	dbOwner: 在当前db中执行任意操作
	userADmin: 在当前db中管理user的权限

* 数据库角色

	readAnyDatabase: 在所有数据库上都有读取数据的权限
	readWriteAnyDatabase: 在所有数据库上都有读写数据的权限
	userAdminAnyDatabase: 在所有数据库上都有管理user的权限
	dbAdminAnyDatabase: 管理所有数据库的权限

* 集群管理

	clusterAdmin: 管理机器的最高权限
	clusterManager: 管理和监控集群的权限
	clusterMonitor: 监控集群的权限
	hostManager: 管理Server

#### 副本集

* 服务器

	10.211.55.3
	10.211.55.4
	10.211.55.5

* 启动mongo服务
	
	分别在`10.211.55.3`,`10.211.55.4`,`10.211.55.5`上执行以下命令

	```
		mkdir data
		mkdir data/db
		mongod --bind_ip 0.0.0.0 --dbpath /home/ruochenxing/data/db --replSet rs1
	```

* 配置

	随便连接一台服务器的mongo服务，然后执行以下命令

	```
	cfg = {_id:"rs1", members:[{_id:0,host:'10.211.55.3:27017'}, {_id:1, host:'10.211.55.4:27017'}, {_id:2, host:'10.211.55.5:27017'}]};
	rs.initiate(cfg);
	rs.status();
	```
	执行完后，当前服务器就变成了`PRIMARY`

* 测试

	登陆`PRIMARY`服务器的mongo服务，插入数据
	```
		use test;
		for(var i=0;i<10000;i++){db.test.insert({"name":"test"+i,"age":123})};
	```
	执行完后，登陆到其他服务器的mongo中，查询结果
	```
	use test;
	db.test.count();
	```
	执行会报`not master and slaveOk=false`错误，因为mongo副本集实现了读写分离，默认的副本无法读写，需要执行以下命令：
	```
	rs.slaveOk()
	```

