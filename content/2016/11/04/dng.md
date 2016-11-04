+++
categories = ["DNG"]
date = "2016-11-04T23:14:09+09:00"
draft = false
tags = ["DNG" ,"TIFF", "RAW"]
title = "DNG 画像のフォーマット (コンテナ編)"

+++   

# DNG 仕様書

Adobe DNG ヘルプにリンクがあります。

- https://helpx.adobe.com/jp/photoshop/digital-negative.html
- http://wwwimages.adobe.com/content/dam/Adobe/en/products/photoshop/pdfs/dng_spec_1.4.0.0.pdf

```
TIFF Compatible
DNG is an extension of the TIFF 6.0 format, and is compatible with the TIFF-EP standard. It
is possible (but not required) for a DNG file to simultaneously comply with both the Digital
Negative specification and the TIFF-EP standard.
```

TIFF のフォーマットを用いて、新たな DNG 用タグを追加する方式です。
例えば、ImageMagick に TIFF として読ませようとすると。以下のように知らないタグの警告が出ます。

<center> <img src="../identity-dngAsTiff.png" /> </center>

exiftool は DNGタグに対応している為、以下のように解釈できます。

<center> <img src="../exiftool01.png" /> </center>
<center> <img src="../exiftool02.png" /> </center>

# 編集の設定値

Lightroom や Photoshop で"現像"する際に、色温度やホワイトバランス、露光量等を指定できますが。保存時のダイヤログを見ると DNG 自体に設定値を保存するようです。

<center> <img src="../saveMetadata.png" /> </center>

試してみます。

<center> <a href="../photoshop-colortemp.png"> <img src="../photoshop-colortemp-h.png" /> </a> </center>

さて TIFF タグを確認。

<center> <img src="../exiftool-colortemp.png" /> </center>

確かに値が書き換わってます。

# History タグ

Lightroom で誤って JPEG 画像を指定して DNG 出力してしまった場合、このタグに記録が残ります。

<center> <img src="../historyTag.png" /> </center>

便利ですね！
