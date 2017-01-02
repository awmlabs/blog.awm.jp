+++
categories = ["Graphics"]
draft = false
tags = ["Golang", "ImageMagick"]
date = "2017-01-02T14:15:26+09:00"
title = "Go Imagick について"

+++

# Go Imagick

Go言語で ImageMagick の機能を使えるようにするパッケージです。

- https://github.com/gographics/imagick

以前、Go Imagick の紹介スライドを作りました、参考にして下さい。

- GoImagick でサムネール作成
   - https://speakerdeck.com/yoya/goimagickthumbnail

ImageMagick の上位層ライブラリである MagickWand に cgo で繋いだ thin(薄い)ラッパーです。

<center> <img src="../goimagick.png" /> </center>

# 導入(インストール)

```
$ sudo yum install ImageMagick-devel
    # ImageMagick v6.8.9-8以前 (dpkg も多分これ)
$ go get gopkg.in/gographics/imagick.v1/imagick
```

yum や dpkg の ImageMagick はかなり古いので、自分でソースからインストールするのをお勧めします。ちなみに、macports はほぼ最新に近い状態で素晴らしいです。

```
$ tar xfz ImageMagick-6.9.6-6.tar.gz
$ (cd ImageMagick-6.9.6-6 ; ./configure ; make install)
    # ImageMagick v6.8.9-9以降 (最近の ImageMagick はこっち)
$ go get gopkg.in/gographics/imagick.v2/imagick
```
    
# サンプルコード

こちらにサンプルが沢山用意されています。

- https://github.com/gographics/imagick/tree/master/examples

エラー処理や後始末を省いて単純化した例をだします。

```
package main
import (
        "gopkg.in/gographics/imagick.v2/imagick”// v6.8.9-8以前は v
)
func main() {
        imagick.Initialize()
        mw := imagick.NewMagickWand()
        _ = mw.ReadImage(”input.png”)
        _ = mw.ResizeImage(640, 480, imagick.FILTER_UNDEFINED, 1)
        _ = mw.WriteImage("output.png")
}
```

- 実行

```
$ ls
resize640x480.go        input.png               output.png
$ go run resize640x480.go
$ identify *.png
input.png PNG 1600x1200 1600x1200+0+0 8-bit sRGB 1.512MB 0.000u 0:00.000
output.png PNG 640x480 640x480+0+0 8-bit sRGB 350KB 0.000u 0:00.000
```
    
# その他

尚、自分が GoImagick を使い始めた当初はメモリリークが激しかったので、本家に修正 PR を送って取り込んで貰いました。

- fixed to memory leak, string array issue.
  - https://github.com/gographics/imagick/pull/37

今は多分大丈夫だと思います。
