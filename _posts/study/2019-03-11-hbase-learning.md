---
layout: post
title: hbase安装与使用
category: study
tags:
    - learn
description:  hbase安装与使用
---


### hbase安装与使用

#### 安装hbase服务器

访问 `https://hbase.apache.org/downloads.html`获取下载地址，我们以ubuntu18.04为例。

* 前提 安装jdk8+

* 安装
	
	* `https://www.apache.org/dyn/closer.lua/hbase/2.1.3/hbase-2.1.3-bin.tar.gz`
	* `tar -zxvf hbase-2.1.3-bin.tar.gz`

##### 单机运行

单机运行时，用户需要通过操作系统的常规机制来设置变量 ，但HBase提供了一个中心机制文 件conf/hbase-env.sh，可编辑此文件，取消注释以JAVA_HOME开头的行，并将其设置为适合用户操作系统的位置。也可以通过 conf/hbase-site.xml的配置指定数据存储位置等信息。

* 编辑`config/hbase-env.sh`，添加`JAVA_HOME`配置
	
	```
	export JAVA_HOME=/usr/lib/jvm/java-8-oracle
	```
* 编辑`config/hbase-site.xml`，添加如下配置
	
	```
	<configuration> 
	  <property> 
	    <name>hbase.rootdir</name>  
	    <value>file:///home/testuser/hbase</value> 
	    <!--目录需要有用户权限-->
	  </property>  
	  <property> 
	    <name>hbase.zookeeper.property.dataDir</name>  
	    <value>/home/testuser/zookeeper</value> 
	  </property>  
	  <property> 
	    <name>hbase.unsafe.stream.capability.enforce</name>  
	    <value>false</value>  
	  </property> 
	</configuration>
	```
	
* 运行`hbase-2.1.3/bin`目录

	`./start-hbase.sh`
	
* 测试

	* 执行命令`jps` 显示 `HMaster`
	* 执行 `./hbase shell`即可访问数据库


##### 伪分布式运行

HBase伪分布模式与独立模式一样是在单个主机上运行的，伪分布模式下每个HBase守护进程 (HMaster、HRegion Server和ZooKeeper)会作为一个单独的进程运行。默认情况下，如果 hbase.rootdir属性没有被专门指定，数据仍被存储在/tmp/中。在本次示例中，假设用户已经拥有可运行的Hadoop平台，且HDFS可启动运行，这里将会通过案例配置将数据存储由本地文件系统迁移至HDFS中。

* 运行 hadoop


* 编辑`hbase-site.xml`

	```
	<configuration>
		<property>
		  <name>hbase.cluster.distributed</name>
		  <value>true</value>
		</property>
		<property>
		  <name>hbase.rootdir</name>
		  <value>hdfs://ruochenxing3:9000/hbase1</value>
		  <!--在进行 hbase.rootdir 值的配置时。这个域名和端口一定要与Hadoop中core-site.xml中的defaultFS参数值一样-->
		</property>
	</configuration>
	```
	
* 运行

	`bin/./start-hbase.sh`
	执行`jps`，可以看到以下进程（我这里hadoop是分布式运行的，如何部署参考）
	
	```
	3024 HRegionServer
	1617 DataNode
	2837 HQuorumPeer
	2901 HMaster
	2022 ResourceManager
	3111 Jps
	1402 NameNode
	1867 SecondaryNameNode
	2220 NodeManager
	```
	
* 注意

	特别注意的是，Hbase的版本和Hadoop的版本存在各种兼容性问题，之前我使用的都是最新的版本，结果运行各种问题，所以，如果你按照上面的步骤跑不起来（有可能跑的起来，但是hbase执行shell命令创建表的时候就会有问题），首先确定下是不是版本不兼容，我这里用的是`hadoop-2.9.2`,`hbase-1.4.9`。
	
	出现的问题可能有
	* HMaster启动不起来
	* Can't get master address from ZooKeeper
	* master.HMaster: Failed to become active master
	* handler.OpenRegionHandler: Failed open of region
	* org.apache.hadoop.hbase.PleaseHoldException: Master is initializing
	* 等等等等
	
##### 分布式运行

完全分布式是在实际场景中应用的模式。在分布式配置中，集群包含多个节点，每个节点运行一个或多个HBase守护进程，包括主要和备份Master实例 ，多个ZooKeeper节点和多个Region Server节点。

* 前提 所有的机器都需要SSH免密登陆，具体设置参考之前的`hadoop集群搭建`文章

* 运行 hadoop

* 编辑`hbase-site.xml`

```
	<configuration>
		<property>
		  <name>hbase.cluster.distributed</name>
		  <value>true</value>
		</property>
		<property>
		  <name>hbase.rootdir</name>
		  <value>hdfs://ruochenxing3:9000/hbase_full</value>
		  <!--在进行 hbase.rootdir 值的配置时。这个域名和端口一定要与Hadoop中core-site.xml中的defaultFS参数值一样-->
		</property>
		<!--full distributed-->
		<property>
		  <name>hbase.zookeeper.quorum</name>
		  <value>ruochenxing3,ruochenxing4,ruochenxing7</value>
		</property>
		<property>
		  <name>hbase.zookeeper.property.dataDir</name>
		  <value>/home/ruochenxing/zk_data</value>
		</property>
	</configuration>
```

* 编辑`conf/regionservers`,删除其中的`localhost`，添加

```
ruochenxing4
ruochenxing7
```

* 然后将整个hbase文件夹复制到其他机器的相同目录下

```
scp -r /home/ruochenxing/hbase-1.4.9 ruochenxing@ruochenxing4:/home/ruochenxing
scp -r /home/ruochenxing/hbase-1.4.9 ruochenxing@ruochenxing7:/home/ruochenxing
```

* 运行hbase `./start-hbase.sh`

* 访问`http://ruochenxing3:16010/master-status`访问查看结果
	