+++
tags = ["ImageMagick"]
categories = ["ImageMagick"]
date = "2017-02-09T20:59:11+09:00"
title = "ImageMagick 6.9.7-7 から policy の挙動が変わりました"
draft = false

+++

# はじめに

ImageMagick は100種類以上の大量の画像形式をサポートしています。この中の一つでも脆弱性があれば当然 ImageMagick の脆弱性となるので、必要のない画像形式を受け取らない為のケアが必要です。
通常は設定ファイルの policy.xml[^1] を使って画像形式(codec)毎に許可(OK)/不許可(NG)を指示します。

そして本題ですが、ImageMagick 6.9.7-7 から policy.xml で設定した条件ルールの適用方法が変わりました。

- ImageMagick-6.9.7-6 では NG が1つでもあると NG (false 勝ち)
- ImageMagick-6.9.7-7 最後にマッチしたルールが NG なら NG (後勝ち)

尚、ImageMagick 6.9.7-7 の ChangeLog には記載されていません。

# 改善点

今まで NG ルールが一つでもあると NG 扱いでした。この場合はブラックリスト方式でしか使えません。例えば読みたくない画像形式がある場合は、それを全て列挙します。面倒ですし漏れがありそうですよね。。

しかし今回、後勝ち NG ルールになった事で、始めに *(ワイルドカード)で全部 NG にして、その後ろで許可したい画像(PNG, JPEG, GIF など？)だけ OK のルールを書けば、それ以外の画像は処理しなくなる。安心という訳です。

今までブラックリストを大量に列挙するか、それだと漏れがあったり、ImageMagick 自体に新しい形式が追加されても漏れるので、自前で画像バイナリの先頭を走査してホワイトリスト形式で弾く前処理を入れる。等といった手間をかけてきました。

# ルール例

ImageMagick-6.9.7-7 から policy.xml で以下のような設定ができます。

{{< highlight xml >}}
<policy domain="coder" rights="none" pattern="*" />
<policy domain="coder" rights="read|write" pattern="PNG" />
<policy domain="coder" rights="read|write" pattern="JPEG" />
<policy domain="coder" rights="read|write" pattern="GIF" />
{{< /highlight >}}

尚、ImageMagick-6.9.7-6 以前では * のルールで NG が決定してしまい、全ての画像形式が処理できなくなります。

また、6.9.7-7 から定義 all が追加されました。全権限を表します。具体的には read|write|execute と同じです。

{{< highlight xml >}}
<policy domain="coder" rights="none" pattern="*" />
<policy domain="coder" rights="all" pattern="PNG" />
<policy domain="coder" rights="all" pattern="JPEG" />
<policy domain="coder" rights="all" pattern="GIF" />
{{< /highlight >}}

# ソース差分

magick/policy.c の IsRightsAuthorized 関数に差分があります。

policy_cache は設定エントリのリストです。GlobExpression で対応するエントリに絞って、read, write, execute といった権限をもたない場合に MagickFalse をセットれます。

この MagickFalse のセットの仕方が変更されています。

## ImageMagick-6.9.7-6

始めに authorized=MagickTrue として、ルールに一致した場合(例えば PNG かどうか)に権限をチェックし NG の場合は MagickFalse を代入します。
MagickTrue に戻す処理がないので、NG とするエントリが一つあれば後ろでひっくり返す事が出来ません。

{{< highlight c >}}
authorized=MagickTrue;
＜略＞
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
{{< /highlight >}}

## ImageMagick-6.9.7-7

始めに authorized=MagickTrue として、ルールに一致した場合(例えば PNG かどうか)に権限をチェックし OK なら MagickTrue 、NG なら MagickFalse を代入します。エントリが見つかる毎に上書きするので、後勝ちルールになります。

{{< highlight c >}}
authorized=MagickTrue;
＜略＞
p=(PolicyInfo *) GetNextValueInLinkedList(policy_cache);
while (p != (PolicyInfo *) NULL)
{
  if ((p->domain == domain) &&
      (GlobExpression(pattern,p->pattern,MagickFalse) != MagickFalse))
    {
      if ((rights & ReadPolicyRights) != 0)
        authorized=(p->rights & ReadPolicyRights) != 0;
      if ((rights & WritePolicyRights) != 0)
        authorized=(p->rights & WritePolicyRights) != 0;
      if ((rights & ExecutePolicyRights) != 0)
        authorized=(p->rights & ExecutePolicyRights) != 0;
    }
  p=(PolicyInfo *) GetNextValueInLinkedList(policy_cache);
}
{{< /highlight >}}

# さいごに

自分には嬉しい機能変更ですが、明確に挙動が変わっているので公式のアナウンスがあった方が良いと考えます。

[^1]: 具体的には以下の場所にファイルがあります → &lt;prefix&gt;/etc/ImageMagick-6/policy.xml
