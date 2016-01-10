+++
categories = ["JPEG"]
date = "2016-01-07T00:34:42+09:00"
draft = false
tags = ["JPEG", "Exif", "Orientation", "ExifTool"]
title = "JPEG Exif Orientation の操作"

+++

# JPEG Exif Orientation の操作

## Orientation とは

JPEG には画像データそのものと別に Exif という形式で日付、撮影条件、場所といった情報をタグ形式で入れる事が出来ます。
その中に、画像を表示する時に行う回転を表す Orientation というタグがあります。

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

Orientation に各値を設定する事で、全て 1 の向きに補正されて表示されます。(古いビューアだと補正しない事もあります)

 | | | 
----|----|---|---
1: <img src="/2016/01/07/orient-1-strip.jpg" /> | 2: <img src="/2016/01/07/orient-2-strip.jpg" />  | 3: <img src="/2016/01/07/orient-3-strip.jpg" />  | 4: <img src="/2016/01/07/orient-4-strip.jpg" /> 
5: <img src="/2016/01/07/orient-5-strip.jpg" /> | 6: <img src="/2016/01/07/orient-6-strip.jpg" />  | 7: <img src="/2016/01/07/orient-7-strip.jpg" />  | 8: <img src="/2016/01/07/orient-8-strip.jpg" /> 
 | | | 
(補正で行う回転する向きでない事に注意。これらは回転する前の画像です)

尚、画像の反転が定義されているのは、鏡のように映るインカメラ用だと思われます。[要出典]

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
apt-get install exiftool
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
    "3") mogrify -rotate 180       $FILE_ORIENT ;;
    "4") mogrify -rotate 180 -flop $FILE_ORIENT ;;
    "5") mogrify -rotate -90 -flip $FILE_ORIENT ;;
    "6") mogrify -rotate -90       $FILE_ORIENT ;;
    "7") mogrify -rotate  90 -flip $FILE_ORIENT ;;
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

# 参考 URL

 * Exif 2.3 規格書
   * http://www.cipa.jp/std/documents/j/DC-008-2012_J.pdf
 * ExifのOrientationを見て画像を回転させる
   * http://hackmylife.net/archives/7400448.html

