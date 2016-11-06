+++
categories = ["TIFF"]
date = "2016-11-06"
draft = false
tags = ["TIFF", "Exif", "JPEG"]
title = "TIFF と Exif と JPEG"

+++

# JPEG と Exif と TIFF の関係

TIFF は独立した画像フォーマットの一種ですが、メタ構造をタグで扱う形式の使い勝手が良い為か、JPEG の Exif も TIFF フォーマットをそのまま使っています。

だいたい以下のような関係です。

<center> <img src="../figure01.png" /> </center>

昨日作った IO_TIFF ライブラリは、JPEG, Exif, TIFF のいずれのファイルを渡されても、TIFF の部分だけ参照してダンプします。

# 実装

- https://github.com/yoya/IO_TIFF

IO/TIFF.php の parse function の先頭です。

## TIFF をとりこむ

TIFF ファイルが渡された場合はそのまま取り込みます。

```
if ($head2 === "II" || $head2 === "MM") { // TIFF format
    $bit->input($tiffData);
```

## Exif を取り込む

Exit ファイルが渡された場合は、先頭6バイトを読み飛ばします。

```
} else if ($head6 === "Exif\0\0") { // Exif format
    $bit->input(substr($tiffData, 6));
```

## JEPG を取り込む

これは少し厄介です。JPEG の Chunk を APP1 が出るまで読み飛ばし、APP1 の先頭を削って Exif 内の TIFF 形式の場所を抜き出します。

```
} else if ($head2 === "\xff\xd8") { // JPEG format
    $jpegBit = new IO_Bit();
    $jpegBit->input($tiffData);
    $jpegBit->setOffset(2, 0); // skip SOI
    $found = false;
    while ($jpegBit->getUI8() == 0xff) { // chunk marker
        $marker2 = $jpegBit->getUI8();
        $len = $jpegBit->getUI16BE();
        if ($marker2 === 0xe1) { // APP1
               if ($jpegBit->getData(6) === "Exif\0\0") {
                $found = true;
                break;
            }
        }
        $jpegBit->incrementOffset($len - 2, 0);
    }
    list($offset, $dummy) = $jpegBit->getOffset();
    if ($found === false) {
        throw new Exception("Illegal JPEG format. offset: $offset");
    }
    $bit->input(substr($tiffData, $offset));
```

まぁ、でもバイナリのコンテナ分解に慣れると一瞬でかける処理です。
