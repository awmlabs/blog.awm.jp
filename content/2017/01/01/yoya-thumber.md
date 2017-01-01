+++
date = "2017-01-01T23:11:14+09:00"
title = "yoya-thumber と go-thumber"
tags = ["yoya-thumber", "go-thumber", "Golang", "ImageMagick"]
categories = ["Graphics"]
draft = false

+++

# はじめに

go-thumber は Pivix さんの公開している画像リサイズプロキシです。

- https://github.com/pixiv/go-thumber

yoya-thumber は、go-thumber を魔改造して ImageMagick に繋げたものです。

- https://github.com/smartnews/yoya-thumber
- http://developer.smartnews.com/blog/2016/12/19/yoya-thumber/

これらについて少し解説します。

# go-thumber

go-thumber を構成するディレクトリです。

```
$ git clone git@github.com:pixiv/go-thumber.git
$ go-thumber
$ ls
LICENSE		jpeg		swscale		thumberd
README.md	mkthumb		test-image	thumbnail
```

- jpeg： libjpeg を使って JPEG 画像の処理
- mkthumb: テスト用コマンドラインツール
- swscale: ffmpeg の libswscale を使って画像リサイズ
- thumberd: net/http でサーバ機能を実装 (開始エントリ)
- thumbnail: 画像リサイズの主に座標計算

このうち jpeg と swscale は Go言語の cgo 機能を用いて libjpeg, libswscale のルーチンを呼び出します。

<center> <img src="../go-thumber.png" />  </center>

運用を JPEG で統一出来れば go-thumber で良いのですが、PNG や JPEG も扱いたい。文字入れや画像の合成もしたいという要望があり、
go-thumber を素直に拡張すると、まず libpng や giflib を繋げて、かつ ffmpeg の libfilter(drawtext) も使えるようにする。といった大工事が想像出来ます。

<center> <img src="../go-thumber-kai.png" />  </center>

これは少し辛いので採用しませんでした。

# yoya-thumber

cgo の処理を全部 GoImagick に丸投げして、ImageMagick の機能を使えるようにしたのが yoya-thumber です。

<center> <img src="../yoya-thumber.png" />  </center>

つまり、Go言語の net/http を使った go-thumber のサーバ機能をほぼそのまま使い、画像処理だけ GoImagick に差し替えて ImageMagick を使うという魔改造が yoya-thumber です。

# GoImagick

Go言語で ImageMagick の機能を使えるようにする MagickWand ライブラリの thin(薄い)ラッパーです。

- https://github.com/gographics/imagick

以前、GoImagick の紹介スライドを作りました、参考にして下さい。

- GoImagick でサムネール作成
   - https://speakerdeck.com/yoya/goimagickthumbnail

尚、自分が GoImagick を使い始めた当初はメモリリークが激しかったので、本家に修正 PR を送って取り込んで貰いました。

- fixed to memory leak, string array issue.
  - https://github.com/gographics/imagick/pull/37

今は多分大丈夫だと思います。

# その他

続くかもしれません。

