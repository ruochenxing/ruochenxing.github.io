---
layout: post
title: Atom中为markdown自定义snippets
category: design
tags: atom snippets
image: https://i.github-camo.com/0640a63a979adc7350080305a0ef670095813966/687474703a2f2f73372e64697265637475706c6f61642e6e65742f696d616765732f3134303431312f6b67646c677367782e676966
description: Snippets在书写代码的时候非常有用，当然写文章的时候也可以借用。换到Atom之后，也想在markdown文件中使用自定义的snippets，主要还是为了加YAML信息。今天自己尝试了一下，管用！
---

Snippets在书写代码的时候非常有用，当然写文章的时候也可以借用。换到Atom之后，也想在markdown文件中使用自定义的snippets，主要还是为了加YAML信息。今天自己尝试了一下，管用！

当然，根据官方[Snippets](https://atom.io/docs/latest/using-atom-snippets)指南，还是比较容易学懂的。但是对于markdown格式来说，可能需要注意他的source格式是`source.gfm`。

![gfm](http://i68.tinypic.com/js0ro6.png)

由于我常用的YAML信息是：

```
---
layout:
titile:
category:
tags:
image:
description:
---
```

所以，在`.atom/snippets.cson`中的配置如下：

```
'.source.gfm':
  'yaml':
    'prefix': 'yaml'
    'body': """
      ---
      layout: $1
      title: $2
      category: $3
      tags: $4
      image: $5
      description: $6
      ---

      $7
    """
```

这样，我在markdown格式的文件中，直接使用`yaml`+`tab`就能快速填充YAML信息了。
