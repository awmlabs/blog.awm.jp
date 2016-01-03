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

 * https://gohugo.io/content/types/

何となく、この ContentTypes の archetype が使えそうです。

# archetypes

<del> archetypes/post.md に追加したいテンプレートを書いて、hugo new -k post <path> を実行します。</del>

archetypes/default.md に追加したいテンプレートを入れます。

```
$ cat archetypes/default.md
+++
categories = []
tags = []
draft = false
+++

#
$ hugo new test.md
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

 * 参考1 https://github.com/awmlabs/blog.awm.jp/commit/d9ac4c2eee770077fb39efc5aa5b0d436839407f
 * 参考2 https://github.com/awmlabs/blog.awm.jp/commit/7ad97d0766219602cf72434cd2b0daad3d72c2ac

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

# ソース巡り

英語のドキュメントが苦手なので、ソースコードを追って見つけました。

* github.com/spf13/hugo

```
$ cd github.com/spf13/hugo
$ grep -r "title =" . | head -3
./commands/import_jekyll.go:	       	 title = str
./create/content.go:			       by = []byte("+++\n title = \"title\"\n draft = true \n+++\n")
./docs/config.toml:title = "Hugo: A Fast and Flexible Website Generator"
```

 * create/content.go

{{< highlight go >}}
func NewContent(kind, name string) (err error) {
	location := FindArchetype(kind)
	if location == "" || err != nil {
		by = []byte("+++\n title = \"title\"\n draft = true \n+++\n")
	}
	psr, err := parser.ReadFrom(bytes.NewReader(by))
	metadata, err := psr.Metadata()
{{< /highlight >}}

archetype にファイルを置いてカスタムするのが分かります。kind で指定しているようです。

 * command/new.go

{{< highlight go >}}
newCmd.Flags().StringVarP(&contentType, "kind", "k", "", "Content type to create")
＜略＞
if contentType != "" {
	kind = contentType
}
return create.NewContent(kind, createpath)
{{< /highlight >}}

これで、-k オプションで指定する事が分かります。

あとはドキュメントを検索すると、

 * https://gohugo.io/content/types/

が出てきて、hugo new <path> は post と呼ばれるので、-k post だなと推測できる訳です。
