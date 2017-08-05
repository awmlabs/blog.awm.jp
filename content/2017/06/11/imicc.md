+++
date = "2017-06-11T01:13:05+09:00"
title = "ImageMagick で ICC プロファイルを扱う #2 コマンド実行例"
draft = false
categories = ["ImageMagick"]
tags = ["ICC", "JPEG"]
+++

# はじめに

色域って何？ ICC プロファイルって何？という人は、 前置きのエントリをどうぞ。

-  ImageMagick で ICC プロファイルを扱う #1 前置き
   - http://blog.awm.jp/2017/06/10/imicc/

本エントリでは、ImageMagick コマンドの具体的な使い方を説明します。

# JPEG メタデータ

JPEG ファイルは画像データ以外にメタデータとして、プライベートな情報を含む事があります。

<center> <img src="../fig1.png" /> </center>

- 撮影日時
- 撮影場所 (GPS情報)
- カメラの機種、レンズ。
- カメラの撮影設定詳細。露光とか
- サムネール画像 (上書き保存前の画像の事もある。。)

JPEG 画像を不特定多数に公開する時は、これらを削除する方が良いでしょう。
尚、大手の画像投稿サービスなら、少なくとも GPS 情報は自動で削除してくれるはずです。

# ImageMagick で JPEG メタデータを削除

## お勧めコマンド

完璧な方法は無いのは後述しますが、先に結論を言うと、このコマンドがお勧めです。

```
$ convert in.jpg -auto-orient +profile '!icc,*' out.jpg

```
<center>
  <img src="../fig2.png" /> <br />
  ↓ ↓ ↓ <br>
  <img src="../fig3-final.png" />
</center>

ここから先の文章は、このコマンドに至るまでの解説です。

## メタデータを全て削除

ImageMagick は -strip オプションで画像のメタデータを全て削除できます。
検索すると見つかるのは大体この方法です。

```
$ convert in.jpg -strip out.jpg
```

<center>
  <img src="../fig2.png" /> <br />
  ↓ ↓ ↓ <br>
  <img src="../fig4-strip.png" />
</center>

しかし、メタデータの中には表示に影響するものがあるので、お勧めしません。

## Exif Orientation

撮影した時の向きを Exif の Orientation タグに記録して、表示の時に回転させる方式です。メタデータの内 Exif を単純に削除すると、今までと画像の向きが変わってしまう事があります。

<img src="../../../../2016/01/07/digicame.png">

ImageMagick には Orientationタグに応じて画像を回転させて、このタグを削除するオプションがあります。

```
$ convert in.jpg -auto-orient out.jpg
```
<center>
  <img src="../fig2.png" /> <br />
  ↓ ↓ ↓ <br>
  <img src="../fig5.2-auto-orient.png" />
</center>

こうすれば、その後で strip をしても大丈夫です。


```
$ convert in.jpg -auto-orient -strip out.jpg
```
<center>
  <img src="../fig2.png" /> <br />
  ↓ ↓ ↓ <br>
  <img src="../fig5-auto-orient.png" />
</center>


ただし、-strip をすると ICC プロファイルまで削除してしまいます。

## ICC プロファイル

ICC プロファイルを単純に消すと色味が変わる可能性があります。
対処としては以下の２つの方法が考えられます。

- ICC プロファイルを残す (最近の環境)
- 画像のピクセルデータ自体の RGB 値を ICC プロファイルの色空間から sRGB 相当の数値に変換して、ICC プロファイルを削除する

### 理想的な環境

今時の PC 環境や、新し目のスマートフォンであれば、ICC プロファイルに対応するカラーマネジメントいシステムが搭載されているので、このコマンドで、Exif 等の余計なメタデータを削除しつつ、ICC プロファイルだけ残すと良いです。

```
$ convert in.jpg +profile '!icc,*' out.jpg
```

ImageMagick はメタデータを profile というカテゴリで管理していて、+profile はそのメタデータを削除する命令です。* (ワイルドカード)指定で全て削除を意味しますが、!icc をつける事で ICC だけ残せます。

単純に Exif を削除すると Orientation の値次第で画像の向きが変わってしまうので、こちらの方が良いでしょう。(お勧めコマンド)

```
$ convert in.jpg -auto-orient +profile '!icc,*' out.jpg
```
<center>
  <img src="../fig2.png" /> <br />
  ↓ ↓ ↓ <br>
  <img src="../fig3-final.png" />
</center>

### ICC プロファイルを無視する環境

古い PC やスマートフォンだと、ICC プロファイルで RGB を補正せずそのままモニタに出力する環境があります。具体的にはモニタが sRGB なら sRGBとして、AdobeRGB なら AdobeRGB として RGB を解釈して表示します。

このケースへの完璧な対策はありませんが、世の中のディスプレイは sRGB 対応が多いので、sRGB の RGB に変換し、sRGB の ICC プロファイルを埋め込むのが無難です。

```
$ convert in.jpg -auto-orient +profile '!icc,*' -profile sRGB.icc out.jpg
```
<center>
  <img src="../fig2.png" /> <br />
  ↓ ↓ ↓ <br>
  <img src="../fig6-auto-orient-srgb.png" />
</center>

AdobeRGB  や P3 で撮影した画像だと sRGB の色域に押し込められて犠牲になる色も出ますが、どのみち古い環境だと表示できない事が多いと思って諦めるのも手です。

# 最後に

これら以外にも DCF オプション色空間という規格ががあり、これでも色空間を指定できるのですが、今回は割愛させて下さい。

# 参考URL

- 拡張色空間の国際標準化動向と広色域ディスプレイ
   - https://www.jsa.or.jp/datas/media/10000/md_796.pdf
- DCF 2.0 (2010年年版)
   - http://www.cipa.jp/std/documents/j/DC-009-2010_J.pdf
