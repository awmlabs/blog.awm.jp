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

yoya-thumber は SmartNews さんの公開している画像リサイズプロキシです。
Pixiv さんの go-thumber の画像処理を ImageMagick に繋げ直し、文字入れや画像合成の機能を追加しました。

- https://github.com/smartnews/yoya-thumber
- http://developer.smartnews.com/blog/2016/12/19/yoya-thumber/

# go-thumber

go-thumber を構成するディレクトリです。

```
$ git clone git@github.com:pixiv/go-thumber.git
$ cd go-thumber
$ ls
LICENSE		jpeg		swscale		thumberd
README.md	mkthumb		test-image	thumbnail
```

- jpeg： libjpeg を使って JPEG 画像の処理
- mkthumb: テスト用コマンドラインツール
- swscale: ffmpeg の libswscale を使って画像リサイズ
- thumberd: net/http でサーバ機能を実装 (処理の起点)
- thumbnail: パラメータに応じた画像リサイズ処理

このうち jpeg と swscale は Go言語の cgo 機能を用いて libjpeg, libswscale の C言語 API にアクセスします。

<center> <img src="../go-thumber.png" />  </center>

運用を JPEG で統一出来れば go-thumber で良いのですが、PNG や GIF も扱いたいですし、文字入れや画像の重ね合わせもしたいといった要望に応じて、go-thumber を素直に拡張すると、libpng や giflib を繋げて、かつ ffmpeg の libfilter(drawtext) も使えるようにする、大工事が想定されます。

<center> <img src="../go-thumber-kai.png" />  </center>

見るからに大変そうです。また go-thumber は jpeg に特化して作られているので png や gif に合わせて抽象化するのも手間がかかります。

# yoya-thumber

GoImagick を介して画像処理の殆どをImageMagick に丸投げしたのが yoya-thumber です。

<center> <img src="../yoya-thumber.png" />  </center>

まとめると、Go言語の net/http を使った go-thumber のサーバ機能をほぼそのまま、画像処理だけ GoImagick に差し替えて ImageMagick を使うという魔改造が yoya-thumber です。

# あとがき

続くかもしれません。
