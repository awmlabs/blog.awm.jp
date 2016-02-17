+++
categories = ["YUV"]
date = "2016-02-10T21:53:44+09:00"
draft = false
tags = ["JPEG", "YUV", "SabSampling"]
title = "JPEG のクロマサブサンプリングと YUVxxx について"

+++

# JPEG のクロマサブサンプリングと YUVxxx について

YCbCr については以下のページで紹介しました。

 * JPEG の YCbCr について
   * https://blog.awm.jp/2016/02/06/ycbcr/

YCbCr のメリットとして説明したクロマサブサンプリングの種類についてまとめます。

JPEG が本エントリの主眼なので YUV の U を Cb、V を Cr に当てはめて解説します。YUV と YCbCr は計算式が違いますが、サブサンプリングの記法としては同じものが使われます。

# YUVxxx の種類

よく見る表現として、YUV444 、YUV422 というのがあります。

 * YUV444 の Y,Cb,Cr の並び

YUVabc と見立てて a, b, c の番号は以下のように対応します。

<center> <img src="../yuv444.png" /> </center>

 * YUV422 の Y,Cb,Cr の並び

YUV422 の場合は Y に対して Cb, Cr を半分に間引きます。

<center> <img src="../yuv422-onaji.png" /> </center>

間引く分の偶数番目の Cb, Cr はデータから省略できます。

<center> <img src="../yuv422.png" /> </center>

# 色々な YUVxxx 

実際に表記を見たことのある YUVxxx を列挙します。(他で実例あれば教えて下さい)

 * YUV444 (再掲) : 間引かない

<center> <img src="../yuv444.png" /> </center>

 * YUV422 (再掲) : 横方向方向に 1/2 間引く。

<center> <img src="../yuv422.png" /> </center>

 * YUV440 : 縦方向に 1/2 間引く。

<center> <img src="../yuv440.png" /> </center>

 * YUV420 : 横方向に 1/2 、縦方向も 1/2 間引く。

<center> <img src="../yuv420.png" /> </center>

 * YUV411 : 横方向に 1/4 になるよう間引く。

<center> <img src="../yuv411.png" /> </center>

# 参考

 * https://en.wikipedia.org/wiki/Chroma_subsampling
 * Chrome subsampling notation
   * http://www.poynton.com/PDFs/Chroma_subsampling_notation.pdf
 * YUVのサンプリング種類
   * http://blogs.yahoo.co.jp/linear_pcm0153/24210613.html
 * Digital Color Coding
   * http://www.telairity.com/assets/downloads/Digital%20Color%20Coding.pdf

