---
layout: post
title: spring,cxf,restful发布webservice传递List,Map,List<Map>
category: study
tags:
    - springmvc
    - webservice
description: spring,cxf,restful发布webservice传递List,Map,List<Map>
---
所用的jar包如下

![jar包](http://7xomt5.com1.z0.glb.clouddn.com/cafebabe_cn161600_5fdW_438301.png)
当服务器返回的是List或者是Map时，一定要将其封装在一个类中，

首先创建封装类,封装了List,Map对象，以及自定义的User类

User.java

	public class User {
		private String name;
		private int age;
		
		public User() {
		}
		public User(String name, int age) {
			this.name = name;
			this.age = age;
		}
		public String getName() {
			return name;
		}
		public void setName(String name) {
			this.name = name;
		}
		public int getAge() {
			return age;
		}
		public void setAge(int age) {
			this.age = age;
		}
		@Override
		public String toString() {
			return "User [age=" + age + ", name=" + name + "]";
		}
	}

DataResult.java

	@XmlRootElement
	public class DataResult {

		private List<User> userList;
		private Map<String,User> userMap;

		public List<User> getUserList() {
			return userList;
		}
		public void setUserList(List<User> userList) {
			this.userList = userList;
		}
		public Map<String, User> getUserMap() {
			return userMap;
		}
		public void setUserMap(Map<String, User> userMap) {
			this.userMap = userMap;
		}

		/**
		 * 为了测试时方便输出重写的一个toString()方法
		*/
		public String toString(){
			for(User u:userList){
				System.out.println(u);
			}
			Set<String> key = userMap.keySet();
			for (Iterator it = key.iterator(); it.hasNext();) {
				String s = (String) it.next();
				System.out.println(s + "-->" + userMap.get(s));
			}
			return "end";
		}
	}

创建webservice服务接口

	@Path(value = "/get")
	public interface TestService {
		
		@GET
		@Path("/listMap1")
		@Produces( { MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON })
		public List<Map> getListMap1();
		
		@GET
		@Path("/listMap")
		@Produces( { MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON })
		public List<Map> getListMap();

		@GET
		@Path("/dataResult")
		@Produces( { MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON })
		public DataResult getMap();

		@GET
		@Path("/string/{param}")
		@Produces( { MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON })
		public String getName(@PathParam("param")String param);

	}

创建服务接口实现类

	/**
	 * webservice服务实现类
	 * @author 那位先生
	 * */
	@Path(value = "/get")
	public class TestServiceImpl implements TestService{
		/**
		 * @see com.webservice.service.TestService#getListMap1()
		 * 传递 List<Map<String,User>>
		 */
		@Override
		@GET
		@Path("/listMap1")
		@Produces( { MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON })
		@XmlJavaTypeAdapter(MapAdapter.class)
		public List<Map> getListMap1() {
			List<Map> listMap = new ArrayList<Map>();
			for (int i = 0; i < 5; i++) {
				Map map = new HashMap<String,User>();
				for (int j = 0; j < 5; j++) {
					User user=new User("user"+j,new Random().nextInt());
					map.put("key" + i + j, user);
				}
				listMap.add(map);
			}
			return listMap;
		}

		/**
		 * @see com.webservice.service.TestService#getListMap()
		 * 传递 List<Map<String,String>>
		 * */
		@Override
		@GET
		@Path("/listMap")
		@Produces( { MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON })
		@XmlJavaTypeAdapter(MapAdapter.class)
		public List<Map> getListMap() {
			List<Map> listMap = new ArrayList<Map>();
			for (int i = 0; i < 5; i++) {
				Map map = new HashMap();
				for (int j = 0; j < 5; j++) {
					map.put("key" + i + j, "value" + i + j);
				}
				listMap.add(map);
			}
			return listMap;
		}

		/**
		 * 传递List,Map时需要封装到一个类中
		 * 
		 * */
		@Override
		@GET
		@Path("/dataResult")
		@Produces( { MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON })
		public DataResult getMap() {
			DataResult result=new DataResult();
			List<User> userList=new ArrayList<User>();
			Map<String,User> userMap=new HashMap<String,User>();
			
			for(int i=0;i<5;i++){
				User user=new User("user"+i,new Random().nextInt());
				userList.add(user);
				userMap.put("key"+i, user);
			}
			result.setUserList(userList);
			result.setUserMap(userMap);
			return result;
		}

		/**
		 * 传递String
		 * */
		@Override
		@GET
		@Path("/string/{param}")
		@Produces( { MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON })
		public String getName(@PathParam("param")String param) {
			return param;
		}
	}

因为在webservice服务中要传递List<Map>对象，这个不能直接传或者封装到某个类中，需要用到适配器和转换器

MapAdapter.java

	public class MapAdapter extends XmlAdapter<MapConvertor, Map<String, Object>> {

		@Override
		public MapConvertor marshal(Map<String, Object> map) throws Exception {
			MapConvertor convertor = new MapConvertor();
			for(Map.Entry<String, Object> entry:map.entrySet()){
				MapConvertor.MapEntry e = new MapConvertor.MapEntry(entry);
				convertor.addEntry(e);
			}
			return convertor;
		}

		@Override
		public Map<String, Object> unmarshal(MapConvertor map) throws Exception {
			Map<String, Object> result = new HashMap<String,Object>();
			for(MapConvertor.MapEntry e :map.getEntries()){
				result.put(e.getKey(), e.getValue());
			}
			return result;
		}

	}

MapConvertor.java

	@XmlType(name = "MapConvertor")
	@XmlAccessorType(XmlAccessType.FIELD)
	@XmlRootElement
	@XmlSeeAlso({User.class})//如果传递的是List<Map<String,User>>,必须要@XmlSeeAlso注解
	public class MapConvertor {

		private List<MapEntry> entries = new ArrayList<MapEntry>();

		public void addEntry(MapEntry entry) {
			entries.add(entry);
		}

		public static class MapEntry {
			public MapEntry() {
				super();
			}

			public MapEntry(Map.Entry<String, Object> entry) {
				super();
				this.key = entry.getKey();
				this.value = entry.getValue();
			}

			public MapEntry(String key, Object value) {
				super();
				this.key = key;
				this.value = value;
			}

			private String key;
			private Object value;

			public String getKey() {
				return key;
			}

			public void setKey(String key) {
				this.key = key;
			}

			public Object getValue() {
				return value;
			}

			public void setValue(Object value) {
				this.value = value;
			}
		}

		public List<MapEntry> getEntries() {
			return entries;
		}
	}

还有过滤器，这个没怎么研究，所以随便实现了一下

TestInterceptor.java

	public class TestInterceptor extends AbstractPhaseInterceptor<Message> {
		public TestInterceptor() {
			super(Phase.RECEIVE);
		}

		public TestInterceptor(String phase) {
			super(phase);
		}

		@Override
		public void handleMessage(Message arg0) throws Fault {
			System.out.println("handleMessage()");
		}
	}
最后全部交由spring容器管理

webservice-server.xml

	<?xml version="1.0" encoding="UTF-8"?>
	<beans xmlns="http://www.springframework.org/schema/beans"
		xmlns:context="http://www.springframework.org/schema/context"
		xmlns:jaxws="http://cxf.apache.org/jaxws" xmlns:jaxrs="http://cxf.apache.org/jaxrs"
		xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		xsi:schemaLocation="http://www.springframework.org/schema/beans 
	    http://www.springframework.org/schema/beans/spring-beans-3.0.xsd
	    http://www.springframework.org/schema/context
	    http://www.springframework.org/schema/context/spring-context-3.0.xsd
	    http://cxf.apache.org/jaxws 
	    http://cxf.apache.org/schemas/jaxws.xsd
	    http://cxf.apache.org/jaxrs
	    http://cxf.apache.org/schemas/jaxrs.xsd">

		<import resource="classpath:META-INF/cxf/cxf.xml" />
		<import resource="classpath:META-INF/cxf/cxf-extension-soap.xml" />
		<import resource="classpath:META-INF/cxf/cxf-servlet.xml" />
		
		<bean id="testServiceInterceptor" class="com.webservice.interceptor.TestInterceptor" />
		
		<bean id="service" class="com.webservice.service.impl.TestServiceImpl" />
		
		<jaxrs:server id="testServiceContainer" address="/test">
			<jaxrs:serviceBeans>
				<ref bean="service" />
			</jaxrs:serviceBeans>
			<jaxrs:inInterceptors>
				<ref bean="testServiceInterceptor" />
			</jaxrs:inInterceptors>
			<jaxrs:extensionMappings>
				<entry key="json" value="application/json" />
				<entry key="xml" value="application/xml" />
			</jaxrs:extensionMappings>
			<jaxrs:languageMappings>
				<entry key="cn" value="cn-ZH"/>
			</jaxrs:languageMappings>
		</jaxrs:server>
	</beans>

在web.xml中配置webservice的cxf Servlet以及spring容器
	<?xml version="1.0" encoding="UTF-8"?>
	<web-app version="2.5" xmlns="http://java.sun.com/xml/ns/javaee"
		xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		xsi:schemaLocation="http://java.sun.com/xml/ns/javaee 
		http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd">
		<context-param>
			<param-name>contextConfigLocation</param-name>
			<param-value>classpath:/webservice-server.xml</param-value>
		</context-param>

		<listener>
			<listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
		</listener>

		<servlet>
			<servlet-name>CXFServlet</servlet-name>
			<servlet-class>org.apache.cxf.transport.servlet.CXFServlet</servlet-class>
		</servlet>
		<!-- 设置访问的目录 -->
		<servlet-mapping>
			<servlet-name>CXFServlet</servlet-name>
			<url-pattern>/services/*</url-pattern>
		</servlet-mapping>
		<welcome-file-list>
			<welcome-file>index.jsp</welcome-file>
		</welcome-file-list>
	</web-app>

至此部署webservice就完成了，然后通过访问
	http://localhost:8080/webservice/services
或者
	http://localhost:8080/webservice/services/test?_wadl
来检测是否部署成功
----------------------------------------------------------------------------------------

要注意的是
服务器默认返回的是xml格式数据，当要返回json时则在路径后加  "?_type=json"即可，例如
	http://localhost:8080/webservice/services/test/get/string/testString?_type=json

访问其他查看结果：
	http://localhost:8080/webservice/services/test/get/string/testString?_type=json （访问这里时如果不返回json,返回xml,浏览器会显示解析xml失败，不知道为什么，所以在这里最好是返回json）
	http://localhost:8080/webservice/services/test/get/dataResult
	http://localhost:8080/webservice/services/test/get/listMap
	http://localhost:8080/webservice/services/test/get/listMap1

接下来创建webservice客户端，在这里为了方便测试，将客户端和服务器端写在一起


ClientTest.java

	public class ClientTest {

		public static void main(String[] args) {
			ClientTest test = new ClientTest();
			String result = test.getResultString("success");
			System.out.println(result);
		}

		/**
		 * 获取List<Map<String,User>>
		 * */
		public List<Map<String, User>> getListMap2() {
			WebClient client = getClientBySpring();
			String xml = client.path("get/listMap1").accept("application/xml").get(
					String.class);
			List<Map<String, User>> listMap = null;
			try {
				// 无法从服务器中直接获取List<Map>对象，所以只能获取xml,将其解析成List<Map>
				listMap = XmlParse.parseToListMap2(xml);
			} catch (ParserConfigurationException e) {
				e.printStackTrace();
			} catch (SAXException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
			return listMap;
		}

		/**
		 * 获取List<Map<String, String>>
		 * */
		public List<Map<String, String>> getListMap1() {
			WebClient client = getClientBySpring();
			String xml = client.path("get/listMap").accept("application/xml").get(
					String.class);
			List<Map<String, String>> listMap = null;
			try {
				// 无法从服务器中直接获取List<Map>对象，所以只能获取xml,将其解析成List<Map>
				listMap = XmlParse.parseToListMap1(xml);
			} catch (ParserConfigurationException e) {
				e.printStackTrace();
			} catch (SAXException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
			return listMap;
		}

		/**
		 * 获取封装类
		 * */
		public DataResult getDataResult() {
			WebClient client = getClientBySpring();
			DataResult result = client.path("get/dataResult/")
					.get(DataResult.class);
			return result;
		}

		/**
		 * 获取字符串结果
		 * */
		public String getResultString(String param) {
			WebClient client = getClientBySpring();
			String result = client.path("get/string/" + param).get(String.class);
			return result;
		}

		/**
		 * 打印map
		 * */
		private void printMap(Map<String, String> map) {
			Set<String> key = map.keySet();
			for (Iterator it = key.iterator(); it.hasNext();) {
				String s = (String) it.next();
				System.out.println(s + "-->" + map.get(s));
			}
		}

		/**
		 * 
		 * 从spring中获取client
		 * */
		private WebClient getClientBySpring() {
			ApplicationContext ctx = new ClassPathXmlApplicationContext(
					"webservice-client.xml");
			WebClient client = ctx.getBean("webClient", WebClient.class);
			return client;
		}

		/**
		 * 直接获取client
		 * */
		private WebClient getClientByCode() {
			String url = "http://localhost:8080/webservice/services/test/";
			WebClient client = WebClient.create(url);
			return client;
		}
	}	

XmlParse.java

	/**
	 * XML解析类
	 * */
	public class XmlParse {
		
		public static List<Map<String,User>> parseToListMap2(String content) throws ParserConfigurationException, SAXException, IOException{
			List<Map<String,User>> listMap=new ArrayList<Map<String,User>>();
			DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
			DocumentBuilder db = dbf.newDocumentBuilder();
			Document document = db.parse(new InputSource(new StringReader(content)));
			NodeList list = document.getElementsByTagName("mapConvertor");
			for (int i = 0; i < list.getLength(); i++) {
				Element element = (Element) list.item(i);
				Map<String,User> map=new HashMap<String,User>();
				NodeList entries=element.getElementsByTagName("entries");
				for(int j=0;j<entries.getLength();j++){
					Element entrie=(Element)entries.item(j);
					String key = entrie.getElementsByTagName("key").item(0).getTextContent();
					String age = entrie.getElementsByTagName("value").item(0).getFirstChild().getTextContent();
					String name = entrie.getElementsByTagName("value").item(0).getLastChild().getTextContent();
					User user=new User(name,Integer.parseInt(age));
					map.put(key, user);
				}
				listMap.add(map);
			}
			return listMap;
		}
		public static List<Map<String,String>> parseToListMap1(String content) throws ParserConfigurationException, SAXException, IOException{
			List<Map<String,String>> listMap=new ArrayList<Map<String,String>>();
			DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
			DocumentBuilder db = dbf.newDocumentBuilder();
			Document document = db.parse(new InputSource(new StringReader(content)));
			NodeList list = document.getElementsByTagName("mapConvertor");
			for (int i = 0; i < list.getLength(); i++) {
				Element element = (Element) list.item(i);
				Map<String,String> map=new HashMap<String,String>();
				NodeList entries=element.getElementsByTagName("entries");
				for(int j=0;j<entries.getLength();j++){
					Element entrie=(Element)entries.item(j);
					String key = entrie.getElementsByTagName("key").item(0).getTextContent();
					String value = entrie.getElementsByTagName("value").item(0).getTextContent();
					map.put(key, value);
				}
				listMap.add(map);
			}
			return listMap;
		}
	}

可以将客户端交由spring管理

spring-client.xml

	<?xml version="1.0" encoding="UTF-8"?>
	<beans xmlns="http://www.springframework.org/schema/beans"
		xmlns:context="http://www.springframework.org/schema/context"
		xmlns:jaxws="http://cxf.apache.org/jaxws" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
		xsi:schemaLocation="http://www.springframework.org/schema/beans 
	    http://www.springframework.org/schema/beans/spring-beans-3.0.xsd
	    http://www.springframework.org/schema/context
	    http://www.springframework.org/schema/context/spring-context-3.0.xsd
	    http://cxf.apache.org/jaxws 
	    http://cxf.apache.org/schemas/jaxws.xsd">

		<bean id="webClient" class="org.apache.cxf.jaxrs.client.WebClient"
			factory-method="create">
			<constructor-arg type="java.lang.String"
				value="http://localhost:8080/webservice/services/test/" />
		</bean>
	</beans>
至此大功告成。

PS：在学习webservice的时候，遇到过几个问题，希望有了解的能够告知，可以在我的博客下留言，,先谢谢了，问题如下
1）在访问http://localhost:8080/webservice/services/test/get/string/testString?_type=json
时，如果不加“_type=json”，浏览器会报错，不知道为什么，所以访问字符串时只能用返回json格式
2）对于返回的List<Map>对象需要使用的转换器来实现，如果服务器返回的是一个普通类对象，但这个对象中存在List<Map>，该怎么办呢？我在osc上提到过，但没有得到回答。
[源码下载地址](http://download.csdn.net/detail/ruochenxing1/7683859)