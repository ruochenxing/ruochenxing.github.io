---
layout: post
title: 详解TreeMap的红黑树实现
category: study
tags:
    - treemap
    - brtree
description:  Java TreeMap实现了SortedMap接口，也就是说会按照key的大小顺序对Map中的元素进行排序，key大小的评判可以通过其本身的自然顺序（natural ordering），也可以通过构造时传入的比较器（Comparator）。

---


## 红黑树

### 二叉查找树
二叉查找树（Binary Search Tree，简称BST）是一棵二叉树，它的左子节点的值比父节点的值要小，右节点的值要比父节点的值大。它的高度决定了它的查找效率。

BST存在的主要问题是，数在插入的时候会导致树倾斜，不同的插入顺序会导致树的高度不一样，而树的高度直接的影响了树的查找效率。如果树中插入的是随机数据，则执行效果很好，但如果插入的是有序或者逆序的数据，那么二叉查找树的执行速度就变得很慢。因为当插入数值有序时，二叉树就是非平衡的了，排在一条线上，其实就变成了一个链表……它的快速查找、插入和删除指定数据项的能力就丧失了。二叉树的理想高度是logN+1(N为节点个数，如下左图)，最坏的情况是所有的节点都在一条斜线上，这样的树的高度为N（如下右图）。
![1.png](https://static.oschina.net/uploads/img/201612/15231605_Hbuq.png)

### 平衡二叉树
平衡二叉树（Balanced Binary Tree）又被称为AVL树（有别于AVL算法），且具有以下性质：它是一棵空树或它的左右两个子树的高度差的绝对值不超过1，并且左右两个子树都是一棵平衡二叉树。平衡二叉树的常用实现方法有`红黑树`、`AVL`、`替罪羊树`、
`Treap`、`伸展树`等。 

### 红黑树
红黑树是平衡二叉树的一种实现，对一个要插入的数据项，插入后要检查是否破坏了红黑树的特征，如果破坏了，就得进行纠正，根据需要改变树的结构，从而保持树的平衡。红黑树的特征如下：

* 每个节点不是红色就是黑色的；
* 根节点总是黑色的；
* 如果节点是红色的，则它的子节点必须是黑色的（反之不一定）；
* 从根节点到叶节点或空子节点的每条路径，必须包含相同数目的黑色节点（即相同的黑色高度）。 

数据结构如下：

```
static final class Entry<K,V> implements Map.Entry<K,V> {
    K key;
    V value;
    Entry<K,V> left;
    Entry<K,V> right;
    Entry<K,V> parent;
    boolean color = BLACK;
}

```

#### 平衡性的修正
红黑树主要通过三种方式对平衡进行修正，改变节点颜色、左旋和右旋。

##### 左旋
左旋的过程是将待旋转节点x的右子树绕x逆时针旋转，使得x的右子树成为x的父亲，同时修改相关节点的引用。旋转之后，二叉查找树的属性仍然满足。
![2.png](https://static.oschina.net/uploads/img/201612/15231755_qaUv.png)

代码如下：

```
/** From CLR */
private void rotateLeft(Entry<K,V> p) {
    if (p != null) {
        Entry<K,V> r = p.right;//获取右子节点
        //step 1 r的左节点和p
        p.right = r.left;//p的右节点指向r的左节点
        if (r.left != null)
            r.left.parent = p;//r的左节点的父节点指向p
            
        //step 2 r和p的父节点
        r.parent = p.parent;//r的父节点指向p的父节点
        if (p.parent == null)  //如果p为根节点
            root = r;
        else if (p.parent.left == p)//如果p为父节点的左子节点
            p.parent.left = r;
        else
            p.parent.right = r;
            
          //step 3 r和p
        r.left = p;  //r的左子节点指向p
        p.parent = r;//p的父节点指向r
    }
}
```
动图如下

![3.gif](https://static.oschina.net/uploads/img/201612/15231646_C18W.gif)


##### 右旋
右旋的过程是将待旋转节点x的左子树绕x顺时针旋转，使得x的左子树成为x的父亲，同时修改相关节点的引用。旋转之后，二叉查找树的属性仍然满足。
![4.png](http://images2015.cnblogs.com/blog/939998/201605/939998-20160517212020498-954534792.png)

代码如下：

```
/** From CLR */
private void rotateRight(Entry<K,V> p) {
    if (p != null) {
        Entry<K,V> l = p.left;//获取左子节点
        // step 1 l的右子节点和p
        p.left = l.right;
        if (l.right != null) 
            l.right.parent = p;
            
        // step 2 l和p的父节点
        l.parent = p.parent;
        if (p.parent == null)
            root = l;
        else if (p.parent.right == p)
            p.parent.right = l;
        else p.parent.left = l;
        
        // step 3 l和p
        l.right = p;
        p.parent = l;
    }
}
```
动图如下

![5.gif](https://static.oschina.net/uploads/img/201612/15231938_BTQ8.gif)

#### 查找
`get(Object key)`方法根据指定的`key`值返回对应的`value`，该方法调用了`getEntry(Object key)`得到相应的`entry`，然后返回`entry.value`。`getEntry()`图解如下所示
![6.png](https://static.oschina.net/uploads/img/201612/15231957_h73v.png)

```
final Entry<K,V> getEntry(Object key) {
    // Offload comparator-based version for sake of performance
    if (comparator != null)
        return getEntryUsingComparator(key);
    if (key == null)
        throw new NullPointerException();
    @SuppressWarnings("unchecked")
        Comparable<? super K> k = (Comparable<? super K>) key;
    Entry<K,V> p = root;//将根节点设置为当前节点开始比较
    while (p != null) {
        int cmp = k.compareTo(p.key);
        if (cmp < 0)//比当前节点小则向左
            p = p.left;
        else if (cmp > 0)//比当前节点大则向右
            p = p.right;
        else //找到则返回
            return p;
    }
    return null;
}
```

#### 插入
`put(K key, V value)`方法是将指定的`key`, `value`对添加到`map`里。该方法首先会对`map`做一次查找（类似于`getEntry()`方法），看是否包含该元组，如果已经包含则将新值覆盖旧值并返回旧值；否则会在红黑树中插入新的`entry`，如果插入之后破坏了 红黑树的约束，还需要进行调整（旋转，改变某些节点的颜色）。

代码如下：

```
public V put(K key, V value) {
    Entry<K,V> t = root;
    if (t == null) {//如果是空树
        compare(key, key); // type (and possibly null) check

        root = new Entry<>(key, value, null);
        size = 1;
        modCount++;
        return null;
    }
    int cmp;
    Entry<K,V> parent;
    // split comparator and comparable paths
    Comparator<? super K> cpr = comparator;
    //有比较器
    if (cpr != null) {
            //查找
        do {
            parent = t;
            cmp = cpr.compare(key, t.key);
            if (cmp < 0)
                t = t.left;
            else if (cmp > 0)
                t = t.right;
            else
                return t.setValue(value); //找到 直接返回
        } while (t != null);
    }
    //无比较器 自然排序
    else {
        if (key == null)
            throw new NullPointerException();
        @SuppressWarnings("unchecked")
            Comparable<? super K> k = (Comparable<? super K>) key;
            //查找
        do {
            parent = t;
            cmp = k.compareTo(t.key);
            if (cmp < 0)
                t = t.left;
            else if (cmp > 0)
                t = t.right;
            else
                return t.setValue(value); //找到 直接返回
        } while (t != null);
    }
    //没找到 新建节点
    Entry<K,V> e = new Entry<>(key, value, parent);
    if (cmp < 0)//比当前节点小，为左子节点；否则，右子节点
        parent.left = e;
    else
        parent.right = e;
    //平衡红黑树
    fixAfterInsertion(e);
    size++;
    modCount++;
    return null;
}
```
插入新节点后，红黑树可能需要调整。也就是调用`fixAfterInsertion`。该方法的算法如下：

* 如果插入的节点为根节点，则涂黑，然后返回
* 如果插入的节点的父节点为黑色，什么都不做，直接返回
* 如果插入的节点的父节点为红色
    * 如果叔叔节点为红色，则将父节点，叔叔节点涂黑；祖父节点涂红（即颜色互换）。再将当前节点指向其祖父节点，再次从新的当前节点当作插入节点开始算法
    * 如果叔叔节点为黑色，则需要做两个判断
        * 如果当前节点是父节点的右子节点并且父节点是祖父节点的左子节点（也就是说这三个节点不在同一斜线上），则将当前节点指向父节点，并将父节点左旋
        * 如果当前节点是父节点的左子节点并且父节点是祖父节点的右子节点（也就是说这三个节点不在同一斜线上），则将当前节点指向父节点，并将父节点右旋
        * 判断执行后，则需要将当前节点（注意，上面两种情况可能改变当前节点的指向）的父节点涂黑，祖父节点涂红，然后将祖父节点左旋（如果当前节点的父节点是祖父节点右子节点），否则右旋。

代码如下：

```
/** From CLR */
private void fixAfterInsertion(Entry<K,V> x) {
    x.color = RED;//将当前的节点涂红
    while (x != null && x != root && x.parent.color == RED) {//如果当前节点不是根节点并且当前节点的父节点为红色
        if (parentOf(x) == leftOf(parentOf(parentOf(x)))) {//如果父节点是祖父节点的左子节点
            Entry<K,V> y = rightOf(parentOf(parentOf(x)));//叔叔节点
            if (colorOf(y) == RED) {//叔叔节点是红色
                setColor(parentOf(x), BLACK);
                setColor(y, BLACK);
                setColor(parentOf(parentOf(x)), RED);
                x = parentOf(parentOf(x));//将当前节点指向祖父节点
            } else {//如果叔叔节点是黑色
                if (x == rightOf(parentOf(x))) {//三个节点不在同一斜线上
                    x = parentOf(x);//当前节点指向父节点
                    rotateLeft(x);//当前节点左旋
                }
                setColor(parentOf(x), BLACK);
                setColor(parentOf(parentOf(x)), RED);
                rotateRight(parentOf(parentOf(x)));
            }
        } else {//如果父节点是祖父节点的右子节点，算法与上面的类似
            Entry<K,V> y = leftOf(parentOf(parentOf(x)));//叔叔节点
            if (colorOf(y) == RED) {//如果叔叔节点为红色
                setColor(parentOf(x), BLACK);
                setColor(y, BLACK);
                setColor(parentOf(parentOf(x)), RED);
                x = parentOf(parentOf(x));//将当前节点指向祖父节点
            } else {//如果叔叔节点是黑色
                if (x == leftOf(parentOf(x))) {//三个节点不在同一斜线上
                    x = parentOf(x);//当前节点指向父节点
                    rotateRight(x);//当前节点右旋
                }
                setColor(parentOf(x), BLACK);
                setColor(parentOf(parentOf(x)), RED);
                rotateLeft(parentOf(parentOf(x)));
            }
        }
    }
    root.color = BLACK;
}
```

至此，整个插入操作就完成了。


#### 删除
`remove(Object key)`方法是先查找，如果找到，则调用`deleteEntry()`进行删除。`deleteEntry()`整个过程并不复杂，算法如下：

* 如果待删除节点没有子节点，直接删除；
* 如果待删除节点只有一个子节点，用其子节点去顶替它（也就直接删除了）
* 如果待删除节点有两个子节点，则要先找到待删除节点的后继节点，将后继节点的值替换掉待删除节点的值，然后将待删除节点指向后继节点（过程复杂），以便删除
* 经过前面的判断，如果待删除的节点（经过前面的判断，待删除节点的指向可能改变）为黑色，则需要传入其顶替节点（注意，当待删除节点没有子节点时，顶替节点为自己；当待删除节点有子节点时，顶替节点为其子节点；）来调用`fixAfterDeletion`调整红黑树的平衡。

首先看后继节点，对于一棵二叉查找树，给定节点t，其后继（树种比大于t的最小的那个元素）可以通过如下方式找到：

* t的右子树不空，则t的后继是其右子树中最小的那个元素。
* t的右孩子为空，则t的后继是其第一个向左走的祖先。
如下图所示。
![7.png](https://static.oschina.net/uploads/img/201612/15232013_hYb2.png)

代码如下：

```
/**
 * Returns the successor of the specified Entry, or null if no such.
 */
static <K,V> TreeMap.Entry<K,V> successor(Entry<K,V> t) {
    if (t == null)
        return null;
    else if (t.right != null) {
        Entry<K,V> p = t.right;
        while (p.left != null)
            p = p.left;
        return p;
    } else {
        Entry<K,V> p = t.parent;
        Entry<K,V> ch = t;
        while (p != null && ch == p.right) {
            ch = p;
            p = p.parent;
        }
        return p;
    }
}
```

删除代码如下：

```
/**
 * Delete node p, and then rebalance the tree.
 */
private void deleteEntry(Entry<K,V> p) {
    modCount++;
    size--;

    // 待删除节点有俩个子节点，
    if (p.left != null && p.right != null) {
        Entry<K,V> s = successor(p);//查找当前节点的后继节点
        //将后继节点的值覆盖掉待删除节点的值
        p.key = s.key;
        p.value = s.value;
        p = s;//待删除节点指向后继节点
    }

    //获取顶替待删除节点的 节点
    Entry<K,V> replacement = (p.left != null ? p.left : p.right);
    //如果待删除节点有一个子节点，则用子节点顶替待删除节点
    if (replacement != null) {
        replacement.parent = p.parent;
        if (p.parent == null)
            root = replacement;
        else if (p == p.parent.left)
            p.parent.left  = replacement;
        else
            p.parent.right = replacement;

        // Null out links so they are OK to use by fixAfterDeletion.
        //执行删除
        p.left = p.right = p.parent = null;

        // Fix replacement
        if (p.color == BLACK)//如果待删除的节点为黑色
            fixAfterDeletion(replacement);
    } else if (p.parent == null) { // 如果待删除节点为根节点
        root = null;
    } else { //如果待删除节点没有子节点
        if (p.color == BLACK)
            fixAfterDeletion(p);
            //执行删除
        if (p.parent != null) {
            if (p == p.parent.left)
                p.parent.left = null;
            else if (p == p.parent.right)
                p.parent.right = null;
            p.parent = null;
        }
    }
}
```

逻辑并不复杂，删除节点时，如果删除的是黑色节点，则红黑树需要调整。如果是红色节点，则不需要调整，因为红色节点被删除并不会破坏红黑树的性质。平衡调整也就是调用`fixAfterDeletion`。该方法的算法如下：

* 如果当前节点（也就是上面说的顶替节点）为根节点，什么都不做
* 如果当前节点为红色，将其设置为黑色
* 如果当前节点为黑色，情况比较复杂，但总体可以分为两部分，一部分是当前节点为父节点左子节点，一部分为当前节点为父节点的右子节点。这两部分的算法是镜像操作，大部分都是类似的。具体的解释看代码

```
/** From CLR */
private void fixAfterDeletion(Entry<K,V> x) {
    while (x != root && colorOf(x) == BLACK) {//非根节点并且为颜色为黑色
        if (x == leftOf(parentOf(x))) {//如果当前节点为父节点的左子节点
            Entry<K,V> sib = rightOf(parentOf(x));//sib指向父节点的右子节点

            if (colorOf(sib) == RED) {
                setColor(sib, BLACK);
                setColor(parentOf(x), RED);
                rotateLeft(parentOf(x));//父节点左旋
                sib = rightOf(parentOf(x));//sib指向父节点的右子节点
            }

                //注意，sib不存在也为黑色
            if (colorOf(leftOf(sib))  == BLACK &&
                colorOf(rightOf(sib)) == BLACK) {
                setColor(sib, RED);
                x = parentOf(x);//当前节点指向父节点，继续算法
            } else {
                if (colorOf(rightOf(sib)) == BLACK) {//如果sib节点的右子节点为黑色
                    setColor(leftOf(sib), BLACK);//sib节点的左子节点涂黑
                    setColor(sib, RED);
                    rotateRight(sib);//sib节点右旋
                    sib = rightOf(parentOf(x));//sib指向父节点的右节点
                }
                setColor(sib, colorOf(parentOf(x)));
                setColor(parentOf(x), BLACK);
                setColor(rightOf(sib), BLACK);//sib节点的右子节点涂黑
                rotateLeft(parentOf(x));//父节点左旋
                x = root;//当前节点指向根节点 退出
            }
        } else { // 镜像操作
            Entry<K,V> sib = leftOf(parentOf(x));//sib指向父节点的左子节点

            if (colorOf(sib) == RED) {
                setColor(sib, BLACK);
                setColor(parentOf(x), RED);
                rotateRight(parentOf(x));//父节点右旋
                sib = leftOf(parentOf(x));//sib指向父节点的左子节点
            }
                //注意，sib不存在也为黑色
            if (colorOf(rightOf(sib)) == BLACK &&
                colorOf(leftOf(sib)) == BLACK) {
                setColor(sib, RED);
                x = parentOf(x);//当前节点指向父节点，继续算法
            } else {
                if (colorOf(leftOf(sib)) == BLACK) {//如果sib节点的左子节点为黑色
                    setColor(rightOf(sib), BLACK);//sib节点的右子节点涂黑
                    setColor(sib, RED);
                    rotateLeft(sib);//sib节点左旋
                    sib = leftOf(parentOf(x));//sib指向父节点的左子节点
                }
                setColor(sib, colorOf(parentOf(x)));
                setColor(parentOf(x), BLACK);
                setColor(leftOf(sib), BLACK);//sib的左子节点涂黑
                rotateRight(parentOf(x));//父节点右旋
                x = root;//当前节点指向根节点，退出
            }
        }
    }

    setColor(x, BLACK);//当前节点涂黑
}
```

整个过程删除过程就结束了，看得出来，平衡调整还是挺复杂的。


PS: `logN+1`  =>  `print math.floor(math.log(N,2)+1)`