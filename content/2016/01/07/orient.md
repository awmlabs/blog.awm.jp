+++
categories = ["JPEG"]
date = "2016-01-07T00:34:42+09:00"
draft = false
tags = ["JPEG", "Exif", "Orientation", "ExifTool"]
title = "JPEG Exif Orientation の操作"

+++

# JPEG Exif Orientation の操作

## Orientation とは

JPEG には画像データそのものと別に Exif 形式で日付、撮影条件、場所といった情報をタグ形式で入れる事が出来ます。
その中に、画像を表示する時に行う回転を表す Orientation タグがあります。

例えばカメラを横倒しにして撮影した場合は、カメラに映る画像データも横倒しに映ります。
撮影した時のカメラの向きを元に Orientation タグを付与する事で、表示する時に画像の向きを直す事ができます。
<center> <img src="/2016/01/07/digicame.png" /> </center>

ImageMagick の identify コマンドで Orientation の値を参照出来ます。

```
$ identify -verbose orient-6.jpg | grep Orient
  Orientation: RightTop
    exif:Orientation: 6
```

## Orientation の数値の対応

以下の画像は Orientation に各値を設定すると、全て 1 の向きに補正されて表示される画像です。(古いビューアだと補正しない事もあります)

### 早見表1

 | | | 
----|----|---|---
1: <a href="/2016/01/07/orient-1-strip.jpg"> <img src="/2016/01/07/orient-1-strip.jpg" /> </a> | 2: <a href="/2016/01/07/orient-2-strip.jpg"> <img src="/2016/01/07/orient-2-strip.jpg" /> </a>  | 3: <a href="/2016/01/07/orient-3-strip.jpg"> <img src="/2016/01/07/orient-3-strip.jpg" /> </a>  | 4: <a href="/2016/01/07/orient-4-strip.jpg"> <img src="/2016/01/07/orient-4-strip.jpg" /> </a>
5: <a href="/2016/01/07/orient-5-strip.jpg"> <img src="/2016/01/07/orient-5-strip.jpg" /> </a> | 6: <a href="/2016/01/07/orient-6-strip.jpg"> <img src="/2016/01/07/orient-6-strip.jpg" /> </a>  | 7: <a href="/2016/01/07/orient-7-strip.jpg"> <img src="/2016/01/07/orient-7-strip.jpg" /> </a>  | 8: <a href="/2016/01/07/orient-8-strip.jpg"> <img src="/2016/01/07/orient-8-strip.jpg" /> </a>
 | | | 

(補正で行う回転する向きでない事に注意。これらはその真逆です)

尚、画像の反転が定義されているのは、鏡のように映るインカメラ用だと思われます。[要出典]

こうして素直に 1 から順に並べてみると、
```
 * 1 を基準として、
 * 1の左右反転 => 2 、1の上下反転 => 4、 1の左右と上下反転 => 3、
 * 1,2,3,4 各々を斜め軸で反転 => 5,6,7,8
```
となっていて、右回転、左回転の定義が不要なのが面白いです。尚、1を引くとビット毎に、どの軸で鏡像回転するかのフラグになります)

これらは処理系の都合であって、実際には以下のように利用されます。
```
 * 1 を基準として、90度回転 => 8, 180度回転 = 3, 270度回転 => 6
 * 1 の鏡反転 => 2、8 の鏡反転 => 5, 3の鏡反転=> 4、6 の鏡反転 => 7
```


### 早見表2

変換の方向がわかりやすい図もつけます。

Orient | 画像の実データ | Exif-Orient を解釈して表示
----|----|---
1 | <a href="/2016/01/07/orient-1-strip.jpg"> <img src="/2016/01/07/orient-1-strip.jpg" /> </a> | <a href="/2016/01/07/orient-1-strip.jpg"> <img src="/2016/01/07/orient-1-strip.jpg" />
2 | <a href="/2016/01/07/orient-2-strip.jpg"> <img src="/2016/01/07/orient-2-strip.jpg" /> </a>  | <a href="/2016/01/07/orient-1-strip.jpg"> <img src="/2016/01/07/orient-1-strip.jpg" />
3 | <a href="/2016/01/07/orient-3-strip.jpg"> <img src="/2016/01/07/orient-3-strip.jpg" /> </a>  | <a href="/2016/01/07/orient-1-strip.jpg"> <img src="/2016/01/07/orient-1-strip.jpg" />
4 | <a href="/2016/01/07/orient-4-strip.jpg"> <img src="/2016/01/07/orient-4-strip.jpg" /> </a> |  <a href="/2016/01/07/orient-1-strip.jpg"> <img src="/2016/01/07/orient-1-strip.jpg" />
5 | <a href="/2016/01/07/orient-5-strip.jpg"> <img src="/2016/01/07/orient-5-strip.jpg" /> </a> | <a href="/2016/01/07/orient-1-strip.jpg"> <img src="/2016/01/07/orient-1-strip.jpg" />
6 | <a href="/2016/01/07/orient-6-strip.jpg"> <img src="/2016/01/07/orient-6-strip.jpg" /> </a>  | <a href="/2016/01/07/orient-1-strip.jpg"> <img src="/2016/01/07/orient-1-strip.jpg" />
7 | <a href="/2016/01/07/orient-7-strip.jpg"> <img src="/2016/01/07/orient-7-strip.jpg" /> </a>  | <a href="/2016/01/07/orient-1-strip.jpg"> <img src="/2016/01/07/orient-1-strip.jpg" />
8 | <a href="/2016/01/07/orient-8-strip.jpg"> <img src="/2016/01/07/orient-8-strip.jpg" /> </a> | <a href="/2016/01/07/orient-1-strip.jpg"> <img src="/2016/01/07/orient-1-strip.jpg" />


## 編集ツール

Exif タグはツールを使って自由に入れ替えができるので、Orientation 検証画像を自分で作る事が出来ます。

ExifTool が便利なのでこちらを使う事にします。

# ExifTool

 * http://www.sno.phy.queensu.ca/~phil/exiftool/

## インストール

MacOS は
```
$ brew install exiftool
```
Debian Linux は
```
# apt-get install exiftool
```
でインストールできます。

Perl なので他のプラットフォームでも入れるのは難しくないでしょう。

## ExifTool の使い方

Orientation は以下のコマンドで書き換えられます。

```
$ exiftool -Orientation=6 -n test.jpg
test.jpg
    1 image files updated
```

## まとめて 1〜8を設定する

ついでに表示の時に元の画像の向きを維持するようにします。

* https://github.com/yoya/misc/blob/master/bash/severalorientation.sh

{{< highlight bash >}}
#! /bin/bash

set -u

ORIGINAL_SUFFIX="_original" # exiftool の-delete-original が動かないので
SUFFIX=".jpg"

FILE=$1
PREFIX=`basename $FILE $SUFFIX`

for i in `seq 1 8` ;
do
  FILE_ORIENT="$PREFIX-$i$SUFFIX"
  echo $FILE_ORIENT
  cp $FILE $FILE_ORIENT
  exiftool -Orientation=$i -n $FILE_ORIENT
  rm $FILE_ORIENT$ORIGINAL_SUFFIX
  case $i in
    "2") mogrify             -flop $FILE_ORIENT ;;
    "3") mogrify       -flip -flop $FILE_ORIENT ;;
    "4") mogrify             -flop $FILE_ORIENT ;;
    "5") mogrify -rotate  90 -flop $FILE_ORIENT ;;
    "6") mogrify -rotate -90       $FILE_ORIENT ;;
    "7") mogrify -rotate -90 -flop $FILE_ORIENT ;;
    "8") mogrify -rotate  90       $FILE_ORIENT ;;
  esac
done
{{< /highlight >}}

 * 実行

```
$ severalorientation.sh orient.jpg
$ identify -verbose orient-?.jpg | grep Orient
  Orientation: TopLeft
    exif:Orientation: 1
  Orientation: TopRight
    exif:Orientation: 2
  Orientation: BottomRight
    exif:Orientation: 3
  Orientation: BottomLeft
    exif:Orientation: 4
  Orientation: LeftTop
    exif:Orientation: 5
  Orientation: RightTop
    exif:Orientation: 6
  Orientation: RightBottom
    exif:Orientation: 7
  Orientation: LeftBottom
    exif:Orientation: 8
```

* 結果

 | | | 
----|----|---|---
1: <a href="/2016/01/07/orient-1.jpg"> <img src="/2016/01/07/orient-1.jpg" /> </a> | 2: <a href="/2016/01/07/orient-2.jpg"> <img src="/2016/01/07/orient-2.jpg" /> </a>  | 3: <a href="/2016/01/07/orient-3.jpg"> <img src="/2016/01/07/orient-3.jpg" /> </a>  | 4: <a href="/2016/01/07/orient-4.jpg"> <img src="/2016/01/07/orient-4.jpg" /> </a> 
5: <a href="/2016/01/07/orient-5.jpg"> <img src="/2016/01/07/orient-5.jpg" /> </a> | 6: <a href="/2016/01/07/orient-6.jpg"> <img src="/2016/01/07/orient-6.jpg" /> </a>  | 7: <a href="/2016/01/07/orient-7.jpg"> <img src="/2016/01/07/orient-7.jpg" /> </a>  | 8: <a href="/2016/01/07/orient-8.jpg"> <img src="/2016/01/07/orient-8.jpg" /> </a>
 | | | 

テーブルの中では傾いてますが、画像をクリックすると向きが補正された画像が出ます。(テーブルに表示するのもクリックして表示されるのも同じ JPEG 画像です)

ちなみに、前半の方の表に貼り付けた画像は、更に
```
for i in *-?.jpg ; do
  o=`basename $i .jpg` ;
  convert -strip $i $o-strip.jpg;
done
```
として Exif タグを削除したものです。

# 参考 URL

 * Exif 2.3 規格書
   * http://www.cipa.jp/std/documents/j/DC-008-2012_J.pdf
 * ExifのOrientationを見て画像を回転させる
   * http://hackmylife.net/archives/7400448.html
