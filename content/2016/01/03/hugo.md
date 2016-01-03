+++
title = "Hugo の post テンプレートのカスタマイズ"
date = "2016-01-03T22:03:24+09:00"
categories = ["Hugo"]
tags = ["Hugo"]
draft = false
+++

# Hugo の記事テンプレート

hugo new <path> を実行すると Markdown ファイルが作られます。

```
$ hugo new 2016/01/03/hugo.md
/yoya/yoya/git/blog.awm.jp/content/2016/01/03/hugo.md created
```

しかしデフォルトの記事テンプレートが
```
date = "2016-01-03T22:12:24+09:00"
title = "test"
```
のように date と title だけで、出来ればもう少し欲しい所です。

そこで archetypes の出番！

# archetypes/post.md

archetypes/post.md に追加したいテンプレートを書いて、hugo new -k post <path> を実行します。

```
$ cat archetypes/post.md
+++
categories = []
tags = []
draft = false
+++

#
$ hugo new -k post test.md
```

# 結果

元々の date, title に加えて post.md の中身が追加されました。
```
$ cat content/test.md
+++
categories = []
date = "2016-01-03T22:14:22+09:00"
draft = false
tags = []
title = "test3"

+++

#
```

これで少し書き始める手間が減りますね。

 * 参考 https://github.com/awmlabs/blog.awm.jp/commit/d9ac4c2eee770077fb39efc5aa5b0d436839407f

# 思う所

メタデータの並びは、出来れば
```
title = "Hugo の post テンプレートのカスタマイズ"
date = "2016-01-03T22:03:24+09:00"
categories = ["Hugo"]
tags = ["Hugo"]
draft = false

```
のようにしたいのですが、abc 順で並び直されてしまうようです。ここは出来れば改造したいです。
