+++
categories = ["ImageMagick"]
date = "2016-11-07T23:51:30+09:00"
draft = false
tags = ["ImageMagick"]
title = "ImageMagick の policy.xml でホワイトリスト？"

+++

# 追記 (2018/11/20)

ImageMagick 6.9.7-7 で policy.xml がホワイトリストに対応しました。

- ImageMagick 6.9.7-7 から policy の挙動が変わりました
  - https://blog.awm.jp/2017/02/09/imagemagick/
  
# policy.xml

ImageMagick は etc ディレクトリの policy.xml を見て、色んな制御ができます。

```
$ convert -list configure | grep etc
CONFIGURE_PATH /usr/local/Cellar/imagemagick/6.9.5-7/etc/ImageMagick-6/
$ ls /usr/local/Cellar/imagemagick/6.9.5-7/etc/ImageMagick-6/
coder.xml		mime.xml		type-dejavu.xml
colors.xml		policy.xml		type-ghostscript.xml
delegates.xml		quantization-table.xml	type-windows.xml
log.xml			thresholds.xml		type.xml
magic.xml		type-apple.xml
```

policy.xml で何が出来るかについては、こちらの記事が詳しいので、どうぞ。

- ImageMagickのピクセルキャッシュとリソース制限
  -  http://techlife.cookpad.com/entry/2016/05/18/180703

# 受理する画像のホワイトリストを設定したい

以前、このような事を呟きました。

- https://twitter.com/yoya/status/727867440412024832
<center> <img src="../tweet01-h.png" /> </center>

policy.xml で domain="coder" を指定して並べれば、ブラックリスト的に禁止する事は可能ですが、出来ればホワイトリスト方式で設定したいですよね。

結論を先にいうと無理でしたが。調べた事を以下にメモします。

## policy.xml を書き換えて実験

以下のように実験しました。

### 先勝ちルールでは？
```
  <policy domain="coder" rights="read|write" pattern="PNG" />
  <policy domain="coder" rights="none" pattern="*" />
```
```
 $ convert t.png t2.png
convert: not authorized `t.png' @ error/constitute.c/ReadImage/412.
convert: no images defined `t2.png' @ error/convert.c/ConvertImageCommand/3257.
```

### 後勝ちルールでは？
```
  <policy domain="coder" rights="none" pattern="*" />
  <policy domain="coder" rights="read|write" pattern="PNG" />
```
```
$ convert t.png t2.png
convert: not authorized `t.png' @ error/constitute.c/ReadImage/412.
convert: no images defined `t2.png' @ error/convert.c/ConvertImageCommand/3257.
```

どちらも駄目でした。
さて、コードを見てみましょう。


## magick/policy.xml

- エラーの発生箇所はここで

```
domain=CoderPolicyDomain;
rights=ReadPolicyRights;
if (IsRightsAuthorized(domain,rights,read_info->magick) == MagickFalse)
  {
    errno=EPERM;
    (void) ThrowMagickException(exception,GetMagickModule(),PolicyError,
      "NotAuthorized","`%s'",read_info->filename);
    read_info=DestroyImageInfo(read_info);
    return((Image *) NULL);
  }
```

- IsRightsAuthorized の処理はこれです。

```
p=(PolicyInfo *) GetNextValueInLinkedList(policy_cache);
while ((p != (PolicyInfo *) NULL) && (authorized != MagickFalse))
{
  if ((p->domain == domain) &&
      (GlobExpression(pattern,p->pattern,MagickFalse) != MagickFalse))
    {
      if (((rights & ReadPolicyRights) != 0) &&
          ((p->rights & ReadPolicyRights) == 0))
        authorized=MagickFalse;
      if (((rights & WritePolicyRights) != 0) &&
          ((p->rights & WritePolicyRights) == 0))
        authorized=MagickFalse;
      if (((rights & ExecutePolicyRights) != 0) &&
          ((p->rights & ExecutePolicyRights) == 0))
        authorized=MagickFalse;
    }
  p=(PolicyInfo *) GetNextValueInLinkedList(policy_cache);
}
```

先勝ちでも後がちでもなく False 勝ちルールのようです。。

# True は何のため？

False が一つでもマッチすると拒否するのだったら、True は何の為にあるの？と一瞬戸惑いましたが、write だけ、read だけといった区別で使っているようです。

# 結論

残念でした

- https://twitter.com/yoya/status/795515839042580481
<center> <img src="../tweet02-h.png" /> </center>

## 結局、どうすればいいの？

### シグネチャを自分でチェック

画像ファイルは先頭の3,4バイトを見れば、だいたい区別出来るので。ImageMagick に画像ファイルを渡す前に自分でチェックする方法があります。

- JPEG: "\xff\xd8\xff"
- PNG: "\x89PNG"
- GIF: "GIF"

### ブラックリストで頑張る

あとは、
```
$ convert -list coder

Path: [built-in]

Magick      Coder
-------------------------------------------------------------------------------
IMPLICIT    ***
BGRA        BGR
BGRO        BGR
BMP3        BMP
BMP2        BMP
＜略＞
```

で出てくる符号化を全部ブラックリストとして列挙して、必要なものだけコメントアウトする方法があります。

ちょっと辛いし、ImageMagick に新規フォーマットが追加された時の追随が面倒。
