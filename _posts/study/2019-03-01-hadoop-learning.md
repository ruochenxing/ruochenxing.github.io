---
layout: post
title: Hadoop集群环境搭建与使用
category: study
tags:
    - learn
description:  Hadoop集群环境搭建与使用
---


### Hadoop集群环境搭建与使用

#### Hadoop集群搭建
	
* 集群列表

	10.211.55.3/10.211.55.4/10.211.55.6 均安装了hadoop
	
* 修改hosts

	```
	10.211.55.3 ruochenxing3
	10.211.55.4 ruochenxing4
	10.211.55.6 ruochenxing6
	```
	
* 因为Hadoop需要使用ssh登陆到其他的机器上，所以需要配置SSH无密码登录节点

	10.211.55.3
	
	```
		ssh-keygen -t rsa
		cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
		scp ~/.ssh/id_rsa.pub ruochenxing@ruochenxing4:/home/ruochenxing/
		scp ~/.ssh/id_rsa.pub ruochenxing@ruochenxing6:/home/ruochenxing/
	```
	
	10.211.55.4/10.211.55.6
	
	```
		rm -rf ~/.ssh
		mkdir ~/.ssh
		cat ~/id_rsa.pub >> ~/.ssh/authorized_keys
	```
	
	在`10.211.55.3`上分别做以下验证，如果都成功登陆，则通过
	
	```
		ssh ruochenxing3
		ssh ruochenxing4
		ssh ruochenxing6
	```
		
* Hadoop配置 所有的 服务器的`~/hadoop-2.9.2/etc/hadoop`目录下
	
	10.211.55.3/10.211.55.4/10.211.55.6三台机器都需要增加如下配置
	
	
	
	slaves
	
	```
	ruochenxing3
	ruochenxing4
	ruochenxing6
	```
	
	core-site.xml
	
	```
	<configuration>
	        <property>
	                <name>fs.defaultFS</name>
	                <value>hdfs://ruochenxing3:9000</value>
	        </property>
			 <property>
	                <name>hadoop.tmp.dir</name>
	                <value>file:/home/ruochenxing/hadoop-2.9.2/tmp</value>
	       </property>
	</configuration>
	```
	
	hdfs-site.xml
	
	```
	<configuration>
	        <property>
	                <name>dfs.replication</name>
	                <value>2</value>
	        </property>
	        <property>
	                <name>dfs.namenode.secondary.http-address</name>
	                <value>ruochenxing3:50090</value>
	        </property>
	        <property>
	                <name>dfs.namenode.name.dir</name>
	                <value>file:/home/ruochenxing/hadoop-2.9.2/tmp/dfs/name</value>
	        </property>
	        <property>
	                <name>dfs.datanode.data.dir</name>
	                <value>file:/home/ruochenxing/hadoop-2.9.2/tmp/dfs/data</value>
	        </property>
	</configuration>
	```
	
	mapred-site.xml
	
	```
	<configuration>
	        <property>
	                <name>mapreduce.framework.name</name>
	                <value>yarn</value>
	        </property>
	        <property>
	                <name>mapreduce.jobhistory.address</name>
	                <value>ruochenxing3:10020</value>
	        </property>
	        <property>
	                <name>mapreduce.jobhistory.webapp.address</name>
	                <value>ruochenxing3:19888</value>
	        </property>
	</configuration>
	```
	
	yarn-site.xml
	
	```
	<configuration>
	        <property>
	                <name>yarn.resourcemanager.hostname</name>
	                <value>ruochenxing3</value>
	        </property>
	        <property>
	                <name>yarn.nodemanager.aux-services</name>
	                <value>mapreduce_shuffle</value>
	        </property>
	        <property>
	                <name>yarn.log-aggregation-enable</name>
	                <value>true</value>
	        </property>
	        <property>
	                <name>yarn.nodemanager.log-dirs</name>
	                <value>${yarn.log.dir}/userlogs</value>
	        </property>
	</configuration>
	```
	
* 运行 10.211.55.3

	`bin/hdfs namenode -format`
	
	`sbin/./start-all.sh`
	
* 访问

	http://10.211.55.3:50070
	
* 关闭

	`sbin/./start-stop.sh`