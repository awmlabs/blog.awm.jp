+++
date = "2016-01-02"
title = "Hugo のサマリーが大きすぎる件"
categories = ["Hugo"]
tags = ["Blog", "Hugo"]
draft = false
+++

# はじめに

Hugo でブログサイトを作ってみたけれど、サマリーが大きすぎるので行数を減らしたかった。結論は以下の通り。

 * config.toml の頭に hasCJKLanguage = true を入れる
 * もしくは、 各々の markdown ファイルの先頭で isCJKLanguage = true を入れる

そこまで辿り着くまでの話。ドキュメントに明記されてました。恥ずかしいっ (*ノノ

 * https://gohugo.io/overview/configuration

```
# if true, auto-detect Chinese/Janapese/Korean Languages in the content. (.Summary and .WordCount can work properly in CJKLanguage)
hasCJKLanguage              false
```

 * https://gohugo.io/content/front-matter

```
**isCJKLanguage** If true, explicitly treat the content as CJKLanguage (.Summary and .WordCount can work properly in CJKLanguage)
```

ドキュメントもちゃんとあります。

# Hugo のサマリーの実例

デフォルトだと以下のように、サマリーが巨大になります。
<center> <img src="/2016/01/02/ss1_h.png" title="figure-1" > </center>

hasCJK 又は isCJK の設定を入れると以下のように自然なサイズになります。

<center> <img src="/2016/01/02/ss2_h.png" title="figure-2"/> </center>

# サマリーの仕様

 * https://gohugo.io/content/summaries/

```
By default, Hugo automatically takes the first 70 words of your content as its
summary and stores it into the .Summary variable, which you may use in your
templates.
```
単語70個だけ表示するそうです。

# 実装

 * github.com/spf13/hugo/hugolib/page.go

{{< highlight go >}}
if p.isCJKLanguage {
	summary, truncated = helpers.TruncateWordsByRune(p.PlainWords(), helpers.SummaryLength)
} else {
	summary, truncated = helpers.TruncateWordsToWholeSentence(p.PlainWords(), helpers.SummaryLength)
}
{{< /highlight >}}

削る処理では helper で定義している SummaryLength を参照しています。

 * github.com/spf13/hugo/helpers/content.go

{{< highlight go >}}
// Length of the summary that Hugo extracts from a content.
var SummaryLength = 70
{{< /highlight >}}

この SummaryLength を上書きする場所が無いので、単語数を減らすという戦術は使えません。(そもそもやるの間違えてる)
よくよく見返すと、
{{< highlight go >}}
if p.isCJKLanguage {
	summary, truncated = helpers.TruncateWordsByRune(
{{< /highlight >}}

CJK (中国語、日本語、韓国語をひっくるめた総称) と判定した場合に、文字ごとに分割してます。そうでない場合はアルファベット等なので、空白で分割でしょう。

日本語は空白をあまり挟まないので単語数として少なく数えてしまっているようです。
さて、この isCJKLanguage は何処で設定されるのでしょう。

 * github.com/spf13/hugo/hugolib/page.go

{{< highlight go >}}
case "iscjklanguage":
	isCJKLanguage = new(bool)
	*isCJKLanguage = cast.ToBool(v)
{{< /highlight >}}
{{< highlight go >}}
if isCJKLanguage != nil {
	p.isCJKLanguage = *isCJKLanguage
} else if viper.GetBool("HasCJKLanguage") {
	if cjk.Match(p.rawContent) {
		p.isCJKLanguage = true
	} else {
		p.isCJKLanguage = false
	}
}
{{< /highlight >}}


面倒なので、後はドキュメントを検索しました。

```
$ cd github.com/spf13/hugo
$ grep -ri iscjklanguage docs
docs/content/content/front-matter.md:* **isCJKLanguage** If true, explicitly treat the content as CJKLanguage (.Summary and .WordCount can work properly in CJKLanguage)
$ grep -ri hascjklanguage  docs
docs/content/overview/configuration.md:    hasCJKLanguage              false
```

後は対応する URL を開いて確認するだけです。

 * https://gohugo.io/overview/configuration
 * https://gohugo.io/content/front-matter

以上、 同じ罠にハマった方のお役に立てれば幸いです。
