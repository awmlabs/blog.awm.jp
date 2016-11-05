+++
categories = ["TIFF"]
date = "2016-11-05T23:00:11+09:00"
draft = false
tags = ["TIFF"]
title = "TIFF フォーマットの分解"

+++

# TIFF フォーマットの分解

最近調べている DNG が TIFF の形式という事で、折角なので TIFF を分解してみました。(PHP で)

- https://github.com/yoya/IO_TIFF

# TIFF フォーマット仕様

仕様はこちらですが、いきなり読むのは辛いはずです。
- https://partners.adobe.com/public/developer/en/tiff/TIFF6.pdf

こちらの Exif 解説の方がイメージが掴めるでしょう。 klab さん有難う。

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

# PHP で分解

という訳で、こちらが成果物です。

- https://github.com/yoya/IO_TIFF

DNG で追加されたタグIDと名前の対応表がないので表示が中途半端ですが、一応、分解はできてます。

```
$ php sample/tiffdump.php  -nf test/APC_0025.dng
ByteOrder:II(LittleEndian)
TIFFVersion:0x002A
IFD:0th
    BaseOffset:8 BaseSize:710
    ExtendOffset:722 ExtendSize:133698
    TagTable:(count=59)
        0x00FE((Unknown)): Type:LONG Count:1 Data: [0]1
        0x0100(ImageWidth): Type:LONG Count:1 Data: [0]256
        0x0101(ImageLength): Type:LONG Count:1 Data: [0]192
        0x0102(BitsPerSample): Type:SHORT Count:3 Offset:722 Data: [0]8 [1]0 [2]8
        0x0103(Compression): Type:SHORT Count:1 Data: [0]1
        0x0106(PhotometricInterpretation): Type:SHORT Count:1 Data: [0]2
        0x010F(Make): Type:ASCII Count:6 Offset:728 Data:Apple
        0x0110(Model): Type:ASCII Count:14 Offset:734 Data:iPhone 7 Plus
        0x0111(StripOffsets): Type:LONG Count:1 Data: [0]138956
        0x0112(Orientation): Type:SHORT Count:1 Data: [0]1
        0x0115(SamplesPerPixel): Type:SHORT Count:1 Data: [0]3
        0x0116(RowsPerStrip): Type:LONG Count:1 Data: [0]192
        0x0117(StripByteCounts): Type:LONG Count:1 Data: [0]147456
        0x011C(PlanarConfiguration): Type:SHORT Count:1 Data: [0]1
        0x0131(Software): Type:ASCII Count:42 Offset:748 Data:Adobe Photoshop Lightroom 6.7 (Macintosh)
        0x0132(DateTime): Type:ASCII Count:20 Offset:790 Data:2016:11:04 19:40:39
        0x014A((Unknown)): Type:LONG Count:4 Offset:810 Data: [0]134420 [1]136510 [2]136902 [3]137484
＜略＞
```

以上です。
