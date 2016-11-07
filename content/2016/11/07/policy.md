+++
categories = ["ImageMagick"]
date = "2016-11-07T23:51:30+09:00"
draft = false
tags = ["ImageMagick"]
title = "ImageMagick の policy.xml でホワイトリスト？"

+++

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

# 受理する画像の種類のホワイトリストを設定がしたい

以前、このような事を呟きました。

- https://twitter.com/yoya/status/727867440412024832
<center> <img src="../tweet01-h.png" /> </center>

policy.xml で domain="coder" を指定して並べれば、ブラックリスト的に禁止する事は可能ですが、出来ればホワイトリストとして設定したいですよね。

結論を先にいうと無理でしたが。一応調べた事を以下にメモします。

## policy.xml を書き換えて実験

以下のように実験しました。

- 先勝ちルールでは？
```
  <policy domain="coder" rights="read|write" pattern="PNG" />
  <policy domain="coder" rights="none" pattern="*" />
```
 => PNG 処理できず

- 後勝ちルールでは？
```
  <policy domain="coder" rights="none" pattern="*" />
  <policy domain="coder" rights="read|write" pattern="PNG" />
```

どちらも駄目です。コードを見てみましょう。


## magick/policy.xml

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

呼び元を見ると。

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

例えば、オプションなりでデフォルト True ルールを設定できればホワイトルールも実現出来るかと思ったのですが、この関数の呼び方を見ると無理そうです。

# じゃぁ、True は何のため？

write だけとか、read だけとかの区別で使っているようです。

# 結論

残念でした

- https://twitter.com/yoya/status/795515839042580481
<center> <img src="../tweet02-h.png" /> </center>

