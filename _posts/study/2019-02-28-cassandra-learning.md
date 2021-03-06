---
layout: post
title: cassandra安装与使用
category: study
tags:
    - learn
description:  cassandra安装与使用
---


### cassandra安装与使用

#### 安装cassandra服务器
参照 `https://cassandra.apache.org/doc/latest/getting_started/installing.html`的顺序来就可以，我们以ubuntu18.04为例。

* 前提 服务器安装好了JDK8+ （`sudo apt-get install openjdk-8-jre`），Python2.7（`sudo apt-get install python`）

* 安装
	
	* `wget http://mirrors.tuna.tsinghua.edu.cn/apache/cassandra/3.11.4/apache-cassandra-3.11.4-bin.tar.gz`
	* `tar -zxvf apache-cassandra-3.11.4-bin.tar.gz`
	* `mv apache-cassandra-3.11.4 cassandra`
	* `sudo mv cassandra /usr/local`
	* 添加cassandra到path `vim ~/.bashrc` `export PATH=/usr/local/cassandra/bin:$PATH` `source ~/.bashrc`
* 使用命令`cassandra`运行

* 客户端访问
	* `cqlsh localhost`
	* 如果需要外部服务器访问，则需要修改配置文件`/usr/local/cassandra/conf/cassandra.yaml`中的`rpc_address`改为服务器地址而不是默认的`0.0.0.0`，改完`重启`后便可以在其他机器上通过`cqlsh xxx.xx.xx.xx`来访问了。
	
* 测试数据
	
	* 创建空间 `CREATE KEYSPACE tp WITH replication = {'class':'SimpleStrategy', 'replication_factor':1};`
	* 创建表  `CREATE TABLE emp(emp_id int PRIMARY KEY, emp_name text, emp_city text, emp_sal varint,emp_phone varint);`
	* 插入数据 `INSERT INTO emp (emp_id, emp_name, emp_city, emp_phone, emp_sal) VALUES(1,'ram', 'Hyderabad', 9848022338, 50000);`
	* 查询数据 `SELECT * FROM emp`

* Java API访问

	* pom.xml
		```
		<dependency>
			<groupId>com.datastax.cassandra</groupId>
			<artifactId>cassandra-driver-core</artifactId>
			<version>3.6.0</version>
		</dependency>
		```
	* 代码

	```
	import com.datastax.driver.core.Cluster;
	import com.datastax.driver.core.ResultSet;
	import com.datastax.driver.core.Session;
	public class App {
		public static Session getSession(String keySpace) {
			// 创建一个集群对象
			Cluster cluster = Cluster.builder().addContactPoint("10.211.55.5").build();
			if (keySpace != null && keySpace.trim().length() > 0) {
				// 创建会话对象
				return cluster.connect(keySpace);
			}
			return cluster.connect();
		}
		public static void testCreateKeySpace() {
			Session session = getSession("");
			// 创建一个名为tp的KeySpace
			// 第一个副本放置策略，即简单策略，我们选择复制因子为1个副本。
			String query = "CREATE KEYSPACE tp WITH replication "
					+ "= {'class':'SimpleStrategy', 'replication_factor':1}; ";
			session.execute(query);
			// 使用KeySpace
			session.execute(" USE tp ");
			session.close();
		}
		public static void testCreteTable() {
			// Query
			String query = "CREATE TABLE emp(emp_id int PRIMARY KEY, " + "emp_name text, " + "emp_city text, "
					+ "emp_sal varint, " + "emp_phone varint );";
			// Creating Session object
			Session session = getSession("tp");
			// Executing the query
			ResultSet result = session.execute(query);
			System.out.println(result.isExhausted());
			session.closeAsync();
		}
		public static void testDeleteTable() {
			String query = "DROP TABLE emp3;";
			// Creating Session object
			Session session = getSession("tp");
			// Executing the query
			ResultSet result = session.execute(query);
			System.out.println(result.isExhausted());
			session.close();
		}
		public static void testInsertTable() {
			String query1 = "INSERT INTO emp (emp_id, emp_name, emp_city, emp_phone, emp_sal) VALUES(1,'ram', 'Hyderabad', 9848022338, 50000);";
			String query2 = "INSERT INTO emp (emp_id, emp_name, emp_city, emp_phone, emp_sal) VALUES(2,'robin', 'Hyderabad', 9848022339, 40000);";
			String query3 = "INSERT INTO emp (emp_id, emp_name, emp_city, emp_phone, emp_sal) VALUES(3,'rahman', 'Chennai', 9848022330, 45000);";
			Session session = getSession("tp");
			session.execute(query1);
			session.execute(query2);
			session.execute(query3);
			session.close();
		}
		public static void main(String[] args) {
			testCreateKeySpace();
		}
	}
	```

### 集群环境搭建

	* 服务器列表 10.211.55.3/10.211.55.4/10.211.55.6 都安装了cassandra
	* 修改配置文件 `/usr/local/cassandra/conf/cassandra.yaml`
		10.211.55.3 服务器

		```
		cluster_name: 'TC01'
		num_tokens: 256
		seed_provider:
		    - class_name: org.apache.cassandra.locator.SimpleSeedProvider
		      parameters:
		          - seeds: "10.211.55.3"
		listen_address: 10.211.55.3
		rpc_address: 10.211.55.3
		endpoint_snitch: SimpleSnitch
		```

		10.211.55.4 服务器

		```
		cluster_name: 'TC01'
		num_tokens: 256
		seed_provider:
		    - class_name: org.apache.cassandra.locator.SimpleSeedProvider
		      parameters:
		          - seeds: "10.211.55.3"
		listen_address: 10.211.55.4
		rpc_address: 10.211.55.4
		endpoint_snitch: SimpleSnitch
		```

		10.211.55.6 服务器

		```
		cluster_name: 'TC01'
		num_tokens: 256
		seed_provider:
		    - class_name: org.apache.cassandra.locator.SimpleSeedProvider
		      parameters:
		          - seeds: "10.211.55.3"
		listen_address: 10.211.55.6
		rpc_address: 10.211.55.6
		endpoint_snitch: SimpleSnitch
		```
	* 依次启动 `cassandra`
	* 在`10.211.55.3`上执行 `nodetool status` 查看节点状态
		```
			--  Address      Load       Tokens       Owns (effective)  Host ID                               Rack
			UN  10.211.55.3  129.47 KiB  256          100.0%            eb000f47-b82c-4011-928e-fccc5a0070df  rack1
			UN  10.211.55.6  245.61 KiB  256          100.0%            e82cec80-aacd-42a0-9dda-b889a3c32984  rack1
			UN  10.211.55.4  262.16 KiB  256          100.0%            5542461b-b303-4de7-b7c4-7bedf041345e  rack1
		```

	* 测试数据 执行`cqlsh 10.211.55.4`访问其中一台cassandra
		* `CREATE KEYSPACE test WITH REPLICATION = { 'class' : 'NetworkTopologyStrategy', 'datacenter1' : 3 } AND DURABLE_WRITES = false;`
		* `describe keyspaces`



