+++
categories = ["TIFF"]
date = "2016-11-05T23:00:11+09:00"
draft = false
tags = ["TIFF"]
title = "TIFF フォーマットの分解"

+++

# TIFF フォーマットの分解

DNG は TIFF として分解出来るので、折角なので TIFF を分解してみます。(PHP で)

# TIFF フォーマット仕様

仕様はこちらですが、いきなり読むのは辛いと思います。
- https://partners.adobe.com/public/developer/en/tiff/TIFF6.pdf

こちらの Exif 解説の方がイメージが掴めると思います。

- Exif データにアクセスするコードを自作してみる
  - http://dsas.blog.klab.org/archives/52123322.html

Exif は TIFF のフォーマットを利用していて、先頭 6byte "Exif\0\0" を除けば、TIFF として読めます。

# 大雑把なイメージ

<center> <img src="../figure01.png" /> </center>

注意点として、

- count が指定する数分 offset が後ろに何個も並ぶ
- type が使うバイト数xcount が 4byte に収まる場合は、offset フィールドに実データを入れてしまう。
- 治らない場合は、offset として IFD 以外のエリアに置かれたデータの場所を指す
- DNG は新しい TIFF の仕様を使っていて、Exif にない type (11:float, 12:double) を使う。

という訳で、作りました。

- https://github.com/yoya/IO_TIFF

DNG のタグIDと名前の対応表を入れていないので中途半端ですが、一応、分解はできます。

```
 $ php sample/tiffdump.php  -f test/APC_0025.dng
ByteOrder:II(LittleEndian)
TIFFVersion:0x002A
IFD:0th
    BaseOffset:8 BaseSize:710
    ExtendOffset:722 ExtendSize:133698
    TagTable:(count=59)
        0x00FE: Type:LONG Count:1 Data: [0]1
        0x0100: Type:LONG Count:1 Data: [0]256
        0x0101: Type:LONG Count:1 Data: [0]192
        0x0102: Type:SHORT Count:3 Offset:722 Data: [0]8 [1]0 [2]8
        0x0103: Type:SHORT Count:1 Data: [0]1
        0x0106: Type:SHORT Count:1 Data: [0]2
        0x010F: Type:ASCII Count:6 Offset:728 Data:Apple
        0x0110: Type:ASCII Count:14 Offset:734 Data:iPhone 7 Plus
        0x0111: Type:LONG Count:1 Data: [0]138956
        0x0112: Type:SHORT Count:1 Data: [0]1
        0x0115: Type:SHORT Count:1 Data: [0]3
        0x0116: Type:LONG Count:1 Data: [0]192
        0x0117: Type:LONG Count:1 Data: [0]147456
        0x011C: Type:SHORT Count:1 Data: [0]1
        0x0131: Type:ASCII Count:42 Offset:748 Data:Adobe Photoshop Lightroom 6.7 (Macintosh)
        0x0132: Type:ASCII Count:20 Offset:790 Data:2016:11:04 19:40:39
        0x014A: Type:LONG Count:4 Offset:810 Data: [0]134420 [1]136510 [2]136902 [3]137484
        0x02BC: Type:BYTE Count:11318 Offset:826 Data: [0]60 [1]63 [2]120 [3]112 [4]97 [5]99 [6]107 [7]101 [8]116 [9]32 [10]98 [11]101 [12]103 [13]105 [14]110 [15]61 [16]34 ... [11302]112 [11303]97 [11304]99 [11305]107 [11306]101 [11307]116 [11308]32 [11309]101 [11310]110 [11311]100 [11312]61 [11313]34 [11314]119 [11315]34 [11316]63 [11317]62
＜略＞
```

以上です。
