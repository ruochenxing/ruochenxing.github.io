---
layout: post
title: Java 8十个lambda表达式案例
category: study
tags:
    - java
    - lambda
description: 	Java 8十个lambda表达式案例
---

```

package java8demo;

import java.util.Arrays;
import java.util.IntSummaryStatistics;
import java.util.List;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import javax.swing.JButton;

public class Java8LambdaDemo {

	/**
	 * 使用() -> {} 替代匿名类：
	 */
	public static void test1() {
		new Thread(() -> System.out.println("In Java8!")).start();
	}

	/**
	 * 实现事件处理 使用Lambda表达式替代匿名类
	 */
	public static void test2() {
		JButton show = new JButton("Show");
		show.addActionListener(e -> {
			System.out.println("Action!!Lambda expressions Rocks");
		});
	}

	/**
	 * 使用Lambda表达式遍历List集合
	 */
	public static void test3() {
		List<String> features = Arrays.asList("HEHE", "HAHA");
		features.forEach(s -> System.out.println(s));
		features.forEach(System.out::println);
	}

	/**
	 * 使用Lambda表达式和函数接口
	 * 
	 */
	public static void test4() {
		List<String> languages = Arrays.asList("Java", "C++", "C", "Php", "Lisp");
		test4_filter2(languages, str -> str.length() >= 4);
	}

	/**
	 * 为了支持函数编程，Java 8加入了一个新的包java.util.function，其中有一个接口java.util.function.
	 * Predicate是支持Lambda函数编程：
	 */
	public static void test4_filter1(List<String> languages, Predicate<String> predicate) {
		for (String language : languages) {
			if (predicate.test(language)) {
				System.out.println(language + " ");
			}
		}
	}

	/**
	 * Stream API 的filter方法能够接受 Predicate参数
	 */
	public static void test4_filter2(List<String> languages, Predicate<String> predicate) {
		languages.stream().filter(language -> predicate.test(language))
				.forEach(language -> System.out.println(language + " "));
	}

	/**
	 * java.util.function.Predicate提供and(), or() 和 xor()可以进行逻辑操作
	 */
	public static void test5() {
		List<String> languages = Arrays.asList("Java", "C++", "C", "Php", "Lisp", "Javascript");
		Predicate<String> startsWithJ = language -> language.startsWith("J");
		Predicate<String> fourLetterLong = language -> language.length() == 4;
		languages.stream().filter(startsWithJ.and(fourLetterLong)).forEach(language -> System.out.println(language));
	}

	/**
	 * Lambda实现Map 和 Reduce
	 */
	public static void test6() {
		List<Integer> costBeforeTax = Arrays.asList(100, 200, 300, 400, 500);
		costBeforeTax.stream().map((cost) -> cost + 0.12 * cost).forEach(System.out::println);
		double bill = costBeforeTax.stream().map(cost -> cost + 0.12 * cost).reduce((sum, cost) -> sum + cost).get();
		System.out.println(bill);
	}

	/**
	 * Filtering是对大型Collection操作的一个通用操作，Stream提供filter()方法，接受一个Predicate对象，
	 * 意味着你能传送lambda表达式作为一个过滤逻辑进入这个方法：
	 */
	public static void test7() {
		List<String> languages = Arrays.asList("Java", "C++", "C", "Php", "Lisp", "Javascript");
		List<String> filtered = languages.stream().filter(x -> x.length() > 2).collect(Collectors.toList());
		System.out.printf("Original List : %s, filtered list : %s %n", languages, filtered);
	}

	/**
	 * 对集合中元素运用一定的功能，如表中的每个元素乘以或除以一个值等等.
	 */
	public static void test8() {
		List<String> G7 = Arrays.asList("USA", "Japan", "France", "Germany", "Italy", "U.K.", "Canada");
		String G7Countries = G7.stream().map(x -> x.toUpperCase()).collect(Collectors.joining(","));
		System.out.println(G7Countries);
	}

	/**
	 * 使用Stream的distinct()方法过滤集合中重复元素。
	 */
	public static void test9() {
		List<Integer> numbers = Arrays.asList(9, 10, 3, 4, 7, 3, 4);
		List<Integer> distinct = numbers.stream().map(i -> i * i).distinct().collect(Collectors.toList());
		System.out.printf("Original List : %s,  Square Without duplicates : %s %n", numbers, distinct);
	}

	/**
	 * 计算List中的元素的最大值，最小值，总和及平均值
	 */
	public static void test10() {
		List<Integer> primes = Arrays.asList(2, 3, 5, 7, 11, 13, 17, 19, 23, 29);
		IntSummaryStatistics stats = primes.stream().mapToInt((x) -> x).summaryStatistics();
		System.out.println("最大值: " + stats.getMax());
		System.out.println("最小值: " + stats.getMin());
		System.out.println("总和: " + stats.getSum());
		System.out.println("均值: " + stats.getAverage());
	}

	public static void main(String[] args) {
		test10();
	}
}
```
