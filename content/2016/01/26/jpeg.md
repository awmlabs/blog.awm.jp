+++
categories = ["JPEG"]
date = "2016-01-26T14:55:39+09:00"
draft = false
tags = ["JPEG", "ImageMagick", "Format"]
title = "ImageMagick で JPEG の形式を変換"
+++

# ImageMagick で JPEG の形式を変換

JPEG は同じように見える画像でも、バイナリ的に色んな形式やメタデータで表現できます。ImageMagick でそれらの形式に変換する方法を並べてみます。

# プログレッシブJPEG

読みはじめに粗い画像を表示して、読み進めるにつれて画質に更新する表示が出来ます。ネットワーク回線が細い環境に嬉しい形式です。
周波数成分が粗い方から段階的に分けて JPEG チャンクに配置する事で実現します。

<center> <img src="../progressive.png"> </center>
画像元) [ニコニコ大百科(仮) ファンタジーゾーン](http://dic.nicovideo.jp/a/%E3%83%95%E3%82%A1%E3%83%B3%E3%82%BF%E3%82%B8%E3%83%BC%E3%82%BE%E3%83%BC%E3%83%B3)

 * プログレッシブJPEGの作り方

```
$ convert orig.jpg -interlace JPEG progressive.jpg
```

# クロマサブサンプリング

基本的に [^1] JPEG は色を YCbCr の３つの値で保持していて、色味を表す Cb と Cr だけ間引く事で見た目をあまり変えずにデータ量を削減する事ができます。人の目が色味の変化に鈍感な性質を利用する方式です。

 * JPEG の YCbCr について
   * https://blog.awm.jp/2016/02/06/ycbcr/
 * JPEG のクロマサブサンプリングと YUVabc
   * http://blog.awm.jp/2016/02/10/yuv/

<center> <img src="../yuvabc.png"> </center>

 * クロマサブサンプリングの作り方

```
$ convert orig.jpg -sampling-factor "1x1,1x1,1x1" yuv444.jpg
$ convert orig.jpg -sampling-factor "2x1,1x1,1x1" yuv422.jpg
$ convert orig.jpg -sampling-factor "4x1,1x1,1x1" yuv411.jpg
$ convert orig.jpg -sampling-factor "1x2,1x1,1x1" yuv440.jpg
$ convert orig.jpg -sampling-factor "2x2,1x1,1x1" yuv420.jpg
$ convert orig.jpg -sampling-factor "4x4,1x1,1x1" yuv410.jpg # yuv9
```

# Exif (Exittool で変換)

## Orientation

Exif の Orientation タグを指定する事で表示の時の画像の向きを制御できます。(たまに無視するビューアもあります)

<center> <img src="../exif_orientation.png"> </center>

Exif Orientation の向きについては以下の記事をどうぞ。

 * https://blog.awm.jp/2016/01/07/orient/

<center> <img src="../orient-38per.png"> </center>

既に Exif Orientation が含まれる画像ファイルであれば ImageMagick で更新出来ますが、入っていない場合に新規に追加する事は無理そうです。このケースでは Exiftool を使います。

```
$ exiftool orig.jpg -Orientation=0 -n -o orient0.jpg
$ exiftool orig.jpg -Orientation=1 -n -o orient1.jpg
$ exiftool orig.jpg -Orientation=2 -n -o orient2.jpg
$ exiftool orig.jpg -Orientation=3 -n -o orient3.jpg
$ exiftool orig.jpg -Orientation=4 -n -o orient4.jpg
$ exiftool orig.jpg -Orientation=5 -n -o orient5.jpg
$ exiftool orig.jpg -Orientation=6 -n -o orient6.jpg
$ exiftool orig.jpg -Orientation=7 -n -o orient7.jpg
```
※ -o をつけ忘れると orig.jpg を上書きしてしまうので注意

# Profile

## ICC Profile

ICC プロファイルの詳細は以下のスライドが分かり易いので、参照下さい。(英語)

 * ICC color management for print production
   * http://www.color.org/craigrevie.pdf (c) FujiFilm 2002

ポイントとしては、

 * 撮影や表示のデバイスによって R,G,B の値と実際の色との対応が微妙に違うのを補正する
   * 特に新し目のデバイスでは性能があがって表現できる色域が広がっているので、それと既存のデバイスとの辻褄合わせが要る
 * 全デバイス同士で直接変換すると組み合わせ爆発して辛いので、共通の色空間経由で変換する
   * その中心の空間を PCS (Profile Connection Space) と呼ぶ。CIE の Lab 又は XYZ を使う。
<center> <img src="../craigrevie_13_25per.png">  <img src="../craigrevie_14_25per.png"> <br /> (上記スライドからの引用)</center>

ImageMagick では -profile オプションで ICC プロファイルを適用できます。変換元の JPEG に ICC プロファイルが入っているか否かによって動作が異なります。

 * 変換元 JPEG に ICC プロファイルが無い場合
   *  ICC プロファイルのメタデータを追加するだけ
 * 変換元 JPEG に ICC プロファイルが入っている場合
   *  ICC プロファイルのメタデータを書き換えると同時に、ICCプロファイル対応ビューアでの表示の色が変わらないよう実データのピクセルの色を補正する

 * 変換元 JPEG に ICC プロファイルが無い場合

```
$ convert noicc.jpg -profile sRGB.icc srgb.icc # 見た目変わらない
$ convert noicc.jpg -profile  GBR.icc  gbr.icc # 見た目変わる
```

<center> <img src="../icc-profile1.png"> </center>

 * 変換元 JPEG に ICC プロファイルが入っている場合

```
$ convert srgb.jpg -profile sRGB.icc srgb.icc # 見た目変わらない
$ convert srgb.jpg -profile  GBR.icc  gbr.icc # 見た目変わらない
```
<center> <img src="../icc-profile2.png"> </center>

# グレイJPEG

JPEG 形式のタイプとして Grayscale が存在しますので、一応作り方を紹介。

<center> <img src="../Opaopa.jpg" align="middle"> => <img src="../Opaopa-gray.jpg" align="middle"> </center>

```
$ convert orig.jpg -type grayscale gray.jpg
```

# 最後に

他にもこんな形式を知っているという方がいましたら、ご指摘頂けると幸いです。

# 参考 URL

 * Exiftool
   * http://www.sno.phy.queensu.ca/~phil/exiftool/
 * JPG ファイルフォーマット
   * http://www.setsuki.com/hsp/ext/jpg.htm

[^1]: Grayscale や CMYK の値で持つ事もできます。
