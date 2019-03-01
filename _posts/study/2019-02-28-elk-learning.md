---
layout: post
title: ELK环境搭建与使用
category: study
tags:
    - learn
description:  elasticsearch logstash kibana环境搭建与使用
---


### ELK环境搭建与使用

#### 安装elasticsearch服务器
	
* 访问 `https://www.elastic.co/downloads/elasticsearch` 获取对应的下载地址，此处以Ubuntu18.04为例
* 下载 

		`wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-6.6.1.tar.gz`
* 解压 

		`tar -zxvf elasticsearch-6.6.1.tar.gz`

* `mv elasticsearch-6.6.1 elasticsearch` 

*  `sudo mv elasticsearch /usr/local`

* 将elasticsearch添加到Path中 

	`vim .bashrc` 
	
	`export PATH=/usr/local/elasticsearch/bin:$PATH`
	
* 修改配置文件

	`vim /usr/local/elasticsearch/config/elasticsearch.yml` 将`network.host`修改为当前服务IP
	
* 启动服务

	`elasticsearch`
	如果启动报错`max virtual memory areas vm.max_map_count [65530] is too low`，则执行`sudo sysctl -w vm.max_map_count=262144` 再启动
	如果启动报错`max number of threads [3682] for user`，则修改配置文件`/etc/security/limits.conf`，增加以下内容
	
	```
	* soft nproc 65536
	* hard nproc 65536
	* soft nofile 65536
	* hard nofile 65536
	```
	重新登陆即可

* 访问 `http://10.211.55.3:9200`返回以下结果
	```
	{
	    "name": "I8ZhAnn",
	    "cluster_name": "elasticsearch",
	    "cluster_uuid": "bzfrDsihT0WdiUerYAULCg",
	    "version": {
	        "number": "6.5.0",
	        "build_flavor": "default",
	        "build_type": "tar",
	        "build_hash": "816e6f6",
	        "build_date": "2018-11-09T18:58:36.352602Z",
	        "build_snapshot": false,
	        "lucene_version": "7.5.0",
	        "minimum_wire_compatibility_version": "5.6.0",
	        "minimum_index_compatibility_version": "5.0.0"
	    },
	    "tagline": "You Know, for Search"
	}
	```
* elasticsearch API 

	参考 `https://www.elastic.co/guide/en/elasticsearch/reference/current/docs.html`
	

#### 安装logstash服务器

* 下载

	访问`https://www.elastic.co/downloads/logstash`，获取最新的下载地址，执行
		`wget https://artifacts.elastic.co/downloads/logstash/logstash-6.6.1.tar.gz`
* 解压
	
	`tar -zxvf logstash-6.6.1.tar.gz`
	
* 新增配置文件,logstash-6.6.1/config/logstash.conf，内容如下

	```
	input {
	 stdin { }
	}
	output {
	 elasticsearch {
	 hosts => "10.211.55.5:9200"
	 index => "logstashtest1"
	 }
	 stdout {
	 codec => rubydebug {}
	 }
	}
	```
	
	`stdin`表示输入来源于标准输入。
	输出有两个，一个是输出到elasticsearch，一个是标准输出到控制台

* 当然，也可以指定输入来源为web日志，这样就可以把服务的日志导入到elastic search中。

	```
	input {
	  file{
	  	path => ["/Users/xxx/Documents/xxx/x/ToolsServer.log"]
	  	type => "weblogs"
	  }
	}
	
	output {
	  elasticsearch {
	    hosts => ["http://10.211.55.5:9200"]
	    index => "weblogs-%{+YYYY.MM.dd}"
	  }
	}
	```
	
* 启动

	`bin/./logstash -f config/logstash.conf`
	
	启动后，控制台会打印出`The stdin plugin is now waiting for input:`，然后键入`Hello World`,回车。
	
	访问`http://10.211.55.5:9200/logstashtest1/_search?q=*&pretty`查看索引创建的结果	
	
#### 安装kibana

* 下载

	访问`https://www.elastic.co/downloads/kibana`，获取最新的下载地址，执行
		`wget https://artifacts.elastic.co/downloads/kibana/kibana-6.6.1-linux-x86_64.tar.gz`
* 解压
	
	`tar -zxvf kibana-6.6.1-linux-x86_64.tar.gz`
	
* 修改配置文件 `config/kibana.yml`

	```
	server.host: "10.211.55.5"
	
	elasticsearch.hosts: ["http://10.211.55.5:9200"]
	```
	
* 启动

	```
		bin/./kibana
	```
	
	
* 访问 `10.211.55.5:5601`

