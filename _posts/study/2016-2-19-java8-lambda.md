---
layout: post
title: Java 8 lambda表达式介绍
category: study
tags:
    - java
    - lambda
description:  Java是一门面向对象编程语言。面向对象编程语言和函数式编程语言中的基本元素（Basic Values）都可以动态封装程序行为：
`面向对象编程语言使用带有方法的对象封装行为，函数式编程语言使用函数封装行为。`但这个相同点并不明显，因为Java的对象往往比较“重量级”：实例化一个类型往往会涉及不同的类，并需要初始化类里的字段和方法。于是对于有些Java对象，只是对单个函数的封装。
---

Java是一门面向对象编程语言。面向对象编程语言和函数式编程语言中的基本元素（Basic Values）都可以动态封装程序行为：
`面向对象编程语言使用带有方法的对象封装行为，函数式编程语言使用函数封装行为。`但这个相同点并不明显，因为Java的对象往往比较“重量级”：实例化一个类型往往会涉及不同的类，并需要初始化类里的字段和方法。于是对于有些Java对象，只是对单个函数的封装。
下面这个典型用例：Java API中定义了一个接口（一般被称为回调接口），用户通过提供这个接口的实例来传入指定行为，例如：

```
public interface ActionListener {
  void actionPerformed(ActionEvent e);
}
```

这里并不需要专门定义一个类来实现ActionListener接口，因为它只会在调用处被使用一次。用户一般会使用匿名类型把行为内联（inline）：

```
button.addActionListener(new ActionListener) {
  public void actionPerformed(ActionEvent e) {
    ui.dazzle(e.getModifiers());
  }
}
```

显然匿名内部类并不是一个好的选择，其语法过于冗余，匿名类中的this和变量名容易使人产生误解，类型载入和实例创建语义不够灵活，无法捕获非final的局部变量，无法对控制流进行抽象等等等等。

### 函数式接口（Functional interfaces）

于是java8引入了一个函数式接口的概念。理解Functional Interface（函数式接口，以下简称FI）是学习Java8 Lambda表达式的关键所在，所以放在最开始讨论。FI的定义其实很简单：任何接口，如果只包含唯一一个抽象方法，那么它就是一个FI。

Java8提供了@FunctionalInterface注解。举个简单的例子，Runnable接口就是一个FI，下面是它的源代码：

```
@FunctionalInterface
public interface Runnable {
    public abstract void run();
}
```

我们并不需要额外的工作来声明一个接口是函数式接口：编译器会根据接口的结构自行判断（判断过程并非简单的对接口方法计数：一个接口可能冗余的定义了一个Object已经提供的方法，比如toString()，或者定义了静态方法或默认方法，这些都不属于函数式接口方法的范畴）。不过API作者们可以通过@FunctionalInterface注解来显式指定一个接口是函数式接口（以避免无意声明了一个符合函数式标准的接口），加上这个注解之后，编译器就会验证该接口是否满足函数式接口的要求。

下面是Java SE 7中已经存在的函数式接口：

```
java.lang.Runnable
java.util.concurrent.Callable
java.security.PrivilegedAction
java.util.Comparator
java.io.FileFilter
java.beans.PropertyChangeListener
```

Java8除了给Runnable，Comparator等接口打上了@FunctionalInterface注解之外，还预定义了一大批新的FI。这些接口都在java.util.function包里，例如：

```
Predicate<T>——接收T对象并返回boolean
Consumer<T>——接收T对象，不返回值
Function<T, R>——接收T对象，返回R对象
Supplier<T>——提供T对象（例如工厂），不接收值
UnaryOperator<T>——接收T对象，返回T对象
BinaryOperator<T>——接收两个T对象，返回T对象
```

下面简单介绍几个：

```
@FunctionalInterface
//Predicate用来判断一个对象是否满足某种条件，比如，单词是否由六个以上字母组成：
public interface Predicate<T> {
    boolean test(T t);
}
words.stream().filter(word -> word.length() > 6).count();
@FunctionalInterface
//Function表示接收一个参数，并产生一个结果的函数：
public interface Function<T, R> {
    R apply(T t);
}
//下面的例子将集合里的每一个整数都乘以2：
ints.stream().map(x -> x * 2);
@FunctionalInterface
//Consumer表示对单个参数进行的操作，前面例子中的forEach()方法接收的参数就是这种操作：
public interface Consumer<T> {
    void accept(T t);
}
```

### Lambda表达式（lambda expressions）
为了能够方便、快捷、幽雅的创建出FI的实例，Java8提供了Lambda表达式这颗语法糖。下面我用一个例子来介绍Lambda语法。假设我们想对一个List<String>按字符串长度进行排序，那么在Java8之前，可以借助匿名内部类来实现：

```
	List<String> words = Arrays.asList("apple", "banana", "pear");
	words.sort(new Comparator<String>() {
		@Override
		public int compare(String w1, String w2) {
		    return Integer.compare(w1.length(), w2.length());
		}
	});
```

上面的匿名内部类简直可以用丑陋来形容，唯一的一行逻辑被五行垃圾代码淹没。根据前面的定义（并查看Java源代码）可知，Comparator是个FI，所以，可以用Lambda表达式来实现：

```
	List<String> words = Arrays.asList("apple", "banana", "pear");
	words.sort((String w1, String w2) -> {
	    return Integer.compare(w1.length(), w2.length());
	});
```

lambda表达式的语法由参数列表、箭头符号->和函数体组成。函数体既可以是一个表达式，也可以是一个语句块：
表达式：表达式会被执行然后返回执行结果。
语句块：语句块中的语句会被依次执行，就像方法中的语句一样——
		return语句会把控制权交给匿名方法的调用者
		break和continue只能在循环中使用
		如果函数体有返回值，那么函数体内部的每一条路径都必须返回值
表达式函数体适合小型lambda表达式，它消除了return关键字，使得语法更加简洁。
下面是一些出现在语句中的lambda表达式：

```
FileFilter java = (File f) -> f.getName().endsWith("*.java");
String user = doPrivileged(() -> System.getProperty("user.name"));
new Thread(() -> {
  connectToService();
  sendNotification();
}).start();
```

### 目标类型（Target typing）
对于给定的lambda表达式，其类型都由上下文推导而出，例如：

```
ActionListener l = (ActionEvent e) -> ui.dazzle(e.getModifiers());	//ActionListener的实例
Callable<String> c = () -> "done";									//Callable的实例
PrivilegedAction<String> a = () -> "done";							//PrivilegedAction的实例
```

lambda表达式对目标类型也是有要求的。编译器会检查lambda表达式的类型和目标类型的方法签名（method signature）是否一致。当且仅当下面所有条件均满足时，lambda表达式才可以被赋给目标类型T：

* T是一个函数式接口
* lambda表达式的参数和T的方法参数在数量和类型上一一对应
* lambda表达式的返回值和T的方法返回值相兼容（Compatible）
* lambda表达式内所抛出的异常和T的方法throws类型相兼容

并且lambda表达式的参数类型可以从目标类型中得出

```
Comparator<String> c = (s1, s2) -> s1.compareToIgnoreCase(s2);
```

在上面的例子里，编译器可以推导出s1和s2的类型是String。此外，当lambda的参数只有一个而且它的类型可以被推导得知时，该参数列表外面的括号可以被省略：

```
FileFilter java = f -> f.getName().endsWith(".java");
```

### 方法引用（Method References）

有时候Lambda表达式的代码就只是一个简单的方法调用而已，遇到这种情况，Lambda表达式还可以进一步简化为 方法引用（Method References） 。一共有四种形式的方法引用，第一种引用 静态方法 ，例如：

```
List<Integer> ints = Arrays.asList(1, 2, 3);
ints.sort(Integer::compare);
```

第二种引用 某个特定对象的实例方法
，例如前面那个遍历并打印每一个word的例子可以写成这样：

```
words.forEach(System.out::println);
```

第三种引用 某个类的实例方法，例如：

```
words.stream().map(word -> word.length()); // lambda
words.stream().map(String::length); // method reference
```

第四种引用类的 构造函数 ，例如：

```
// lambda
words.stream().map(word -> {
    return new StringBuilder(word);
});
// constructor reference
words.stream().map(StringBuilder::new);
```

### 总结

我们在设计lambda时的一个重要目标就是新增的语言特性和库特性能够无缝结合（designed to work together）。接下来，我们通过一个实际例子（按照姓对名字列表进行排序）来演示这一点：
比如说下面的代码：

```
List<Person> people = ...
Collections.sort(people, new Comparator<Person>() {
  public int compare(Person x, Person y) {
    return x.getLastName().compareTo(y.getLastName());
  }
})
```

冗余代码实在太多了！有了lambda表达式，我们可以去掉冗余的匿名类：

```
Collections.sort(people,
                 (Person x, Person y) -> x.getLastName().compareTo(y.getLastName()));
```

尽管代码简洁了很多，但它的抽象程度依然很差：开发者仍然需要进行实际的比较操作（而且如果比较的值是原始类型那么情况会更糟），所以我们要借助Comparator里的comparing方法实现比较操作：

```
Collections.sort(people, Comparator.comparing((Person p) -> p.getLastName()));
```

在类型推导和静态导入的帮助下，我们可以进一步简化上面的代码：

```
Collections.sort(people, comparing(p -> p.getLastName()));
```

我们注意到这里的lambda表达式实际上是getLastName的代理（forwarder），于是我们可以用方法引用代替它：

```
Collections.sort(people, comparing(Person::getLastName));
```

最后，使用Collections.sort这样的辅助方法并不是一个好主意：它不但使代码变的冗余，也无法为实现List接口的数据结构提供特定（specialized）的高效实现，而且由于Collections.sort方法不属于List接口，用户在阅读List接口的文档时不会察觉在另外的Collections类中还有一个针对List接口的排序（sort()）方法。
默认方法可以有效的解决这个问题，我们为List增加默认方法sort()，然后就可以这样调用：

```
people.sort(comparing(Person::getLastName));;
```

此外，如果我们为Comparator接口增加一个默认方法reversed()（产生一个逆序比较器），我们就可以非常容易的在前面代码的基础上实现降序排序。

```
people.sort(comparing(Person::getLastName).reversed());;
```
