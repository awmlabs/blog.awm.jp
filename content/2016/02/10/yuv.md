+++
categories = ["YUV"]
date = "2016-02-10T21:53:44+09:00"
draft = false
tags = ["JPEG", "YUV", "SabSampling"]
title = "JPEG のクロマサブサンプリングと YUVabc"

+++

# JPEG のクロマサブサンプリングと YUVabc

YCbCr については以下のページで紹介しました。

 * JPEG の YCbCr について
   * https://blog.awm.jp/2016/02/06/ycbcr/

YCbCr のメリットとして説明したクロマサブサンプリングの種類についてまとめます。

JPEG が本エントリの主眼なので YUV の U を Cb、V を Cr に当てはめて解説します。YUV と YCbCr は計算式が違いますが、サブサンプリングの記法としては同じものが使われます。

# はじめに早見表

<center> <img src="../yuvyab.png" /> </center>


※ YUV410 だけ変則的です

## ImageMagick での作り方

```
$ convert orig.jpg -sampling-factor "1x1,1x1,1x1" yuv444.jpg
$ convert orig.jpg -sampling-factor "2x1,1x1,1x1" yuv422.jpg
$ convert orig.jpg -sampling-factor "4x1,1x1,1x1" yuv411.jpg
$ convert orig.jpg -sampling-factor "1x2,1x1,1x1" yuv440.jpg
$ convert orig.jpg -sampling-factor "2x2,1x1,1x1" yuv420.jpg
$ convert orig.jpg -sampling-factor "4x4,1x1,1x1" yuv410.jpg # yuv9
```

### もう一つの YUV 指定方法

もっと直接的にも指定できます。ただし、YUV9 は表現できなさそうです。

```
$ convert orig.jpg -sampling-factor 4:4:4 yuv444.jpg
$ convert orig.jpg -sampling-factor 4:2:0 yuv422.jpg
$ convert orig.jpg -sampling-factor 4:1:1 yuv411.jpg
$ convert orig.jpg -sampling-factor 4:4:0 yuv440.jpg
$ convert orig.jpg -sampling-factor 4:2:0 yuv420.jpg
$ convert orig.jpg -sampling-factor 4:1:0 yuv410.jpg # yuv9 ???
% identify -format "%f %[jpeg:sampling-factor]\n" popu-unity-410.jpg
popu-unity-410.jpg 4x2,1x1,1x1
```

本来、4:1:0 のように :0 を指定すれば縦方向に1/2になる訳で、これだと縦の 1/4 が表現できません。

# YUVabc の種類

よく見る表現として、YUV444 、YUV422 の２つがあります。

## YUV444 の Y,Cb,Cr の並び

YUVabc と見立てると a, b, c の番号は以下のように対応します。

<center> <img src="../yuv444.png" /> </center>

## YUV422 の Y,Cb,Cr の並び

YUV422 の場合は Y に対して Cb, Cr を半分に間引きます。

<center> <img src="../yuv422-onaji.png" /> </center>

間引く分の偶数番目の Cb, Cr はデータから省略できます。

<center> <img src="../yuv422.png" /> </center>

# 色々な YUVabc 

実際に表記を見たことのある YUVabc を列挙します。(他に実例あればご指摘下さい)

 * YUV444 (再掲) : 間引かない

<center> <img src="../yuv444.png" /> </center>

 * YUV422 (再掲) : 横方向に 1/2 間引く。

<center> <img src="../yuv422.png" /> </center>

 * YUV440 : 縦方向に 1/2 間引く。

<center> <img src="../yuv440.png" /> </center>

 * YUV420 : 横方向に 1/2 、縦方向も 1/2 間引く。

<center> <img src="../yuv420.png" /> </center>

 * YUV411 : 横方向に 1/4 になるよう間引く。

<center> <img src="../yuv411.png" /> </center>

 * YUV410 : 横方向に 1/4 、縦方向は 1/2 間引く。(？)

<center> <img src="../yuv410.png" /> </center>

と言いたい所ですが、実際には 4x4 として使われるようです。

<center> <img src="../yuv410-4x4.png" /> </center>

# まとめ

 * YUVabc は横4pixel縦2pixel で考えて以下のようなパラメータ
   * a は Y の横方向サンプル数で4固定
   * b は横方向の間引き。Cb,Cr の横方向サンプル数で 4, 2, 1 のいずれか
   * c は縦方向の間引き。次の行の Cb,Cr の横方向サンプル数で b と同じか 0 のどちらか
 * YUV444 は全ピクセル Y,Cb,Cr をセットで持つ。画質を落としたくない場合はこれ
 * YUV422 は Cb,Cr を横方向で 1/2 で間引く。JPEG や動画でよく使われる
 * YUV410 は abc の法則から例外

# 参考

 * https://en.wikipedia.org/wiki/Chroma_subsampling
 * Chrome subsampling notation
   * http://www.poynton.com/PDFs/Chroma_subsampling_notation.pdf
 * YUVのサンプリング種類
   * http://blogs.yahoo.co.jp/linear_pcm0153/24210613.html
 * Digital Color Coding
   * http://www.telairity.com/assets/downloads/Digital%20Color%20Coding.pdf
