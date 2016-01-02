+++
date = "2016-01-01"
title = "Blog はじめました"
categories = ["Blog"]
tags = ["Github", "Hugo"]

+++

# Blog はじめました

WordPressを試したり色々と迷いましたが、神のお告げに従い Github.io + Hugo + CircleCI の構成にしました。

 * https://twitter.com/nobu666/status/680683739534393344

CircleCI 対応は時間かかりそうなので、デプロイはとりあえず手動対処にして試行錯誤した結果がこれです。

 * https://github.com/awmcorp/blog.awm.jp

# Github.io

github.com で <ユーザ名>.github.io というレポジトリを作れば、その URL でアクセス出来ます。

 * https://github.com/awmlabs/awmlabs.github.io
 * => https://awmlabs.github.io/

ここにブログを表示する静的なHTMLを入れていけば良い訳です。
Markdown ファイルからBlogサイトのHTMLを生成するツールは Hugo を使ってみました。

## blog.awm.jp を公開URLにしたい

 * => https://blog.awm.jp/ (awmlabs.github.io を指します)

DNS の CNAME で blog.awm.jp => awmlabs.github.io を向けた上で、static/CNAME に blog.awm.jp の文字を入れておくと awmlabs.github.io でアクセスしても blog.awm.jp にリダイレクトするようです。

# Hugo

```
$ hugo new site blog.awm.jp
$ cd blog.awm.jp
$ hugo new 2016/01/01/blog.md
```
のようにすると
```
blog.awm.jp/content/2016/01/01/blog.md
```
にテンプレートの md ファイルが出来るので、そこに文章を記述して、blog.awm.jp フォルダのトップで、

```
$ hugo 
```
を実行します。すると public 以下に表示用の HTMLファイルが生成されます。 実際に表示する為には、テーマが必要です。

## Hugo themes

 * http://themes.gohugo.io/
ここで色々なテーマが確認できます。一目惚れした base16 を適用しました。

 * http://themes.gohugo.io/base16/

```
git submodule add git@github.com:htdvisser/hugo-base16-theme.git themes/base16
```
として持ってきます。尚、大抵のカスタマイズはトップのlayouts や static/css 以下で弄れるので、fork しなくても良さそうです。

後は、先ほど hugo を実行したのと同じ要領で、更に server -watch オプションをつけると、

```
$ hugo  server --watch -t base16
＜略＞
Web Server is available at http://127.0.0.1:1313/
```

このように http://127.0.0.1:1313/ で表示が確認できます。
md ファイルを編集するとリアルタイムに反映してくれて便利です。(これが出来なかったら hugo を使おうとしなかった位、大事な機能)

尚、config.toml (又は config.yaml) で theme を定義すれば -t base16 は不要です。

## テーマの文字

base16 は文字が読み辛いので自分好みに変更しました。

 * 記事の背景色 (少し明るくした)

{{< highlight css >}}
article.single section,
.article-list article {
;  background-color: #f2f0ec;
  background-color: #fcf8f0;
{{< /highlight >}}

 * 文字フォント (Windows で見た時に MS ゴシックが使われないように)

{{< highlight css >}}
body {
   ＜略＞
  font-family: "Hiragino Kaku Gothic ProN", Meiryo, Tahoma, Verdana, Arial, sans-serif;
;  font-family: 'Source Code Pro', monospace;
}
{{< /highlight >}}

# CircleCI

間に合わなかったので、また今度。。

# 備考

 * Circle CI のアカウント作成で Github と連携する際に「所属する組織全てのアクセス権限」を要求する(Github API の仕様上、組織毎にオンオフ出来ない)ので、自分が管理する組織にのみ所属するアカウント (awmlabs) を使う事にしました。
 * 当初、改行がされないと思ったけど、サマリーの方は改行無しで、記事のページに飛んだらちゃんと改行されてました。早とちり。
 * 色々なテーマを試そうとするとエラーがよく出ます。テーマ毎に md ファイルの先頭で必要な定義が違うみたいで、ちゃんとテーマの README を読んで設定しましょう。

# 参考 URL

 * https://github.com/nobu666/nobu666.com
 * http://qiita.com/eichann/items/4fe61b8b9bbafcfbe847
