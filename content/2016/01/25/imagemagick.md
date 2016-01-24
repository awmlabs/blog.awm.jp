+++
categories = ["ImageMagick"]
date = "2016-01-25T00:32:35+09:00"
draft = false
tags = ["ImageMagick", "JPEG", "Orientation"]
title = "もうサムネイルで泣かないための ImageMagick ノウハウ集に一言"

+++

# もうサムネイルで泣かないための ImageMagick ノウハウ集に一言

 * https://speakerdeck.com/yoya/imagemagick-knowhow
スライドだと URL のリンクが辿りにくいのとブログ形式で読みたいとの声があったので、ほぼ同じ内容のエントリを作りました。

 * Slideshare を使えば、テキストの中身が展開されて便利なのですが、僕は SpeakerDeck 派なので。すみません。

# 一部界隈で話題

もうサムネイルで泣かないための ImageMagick ノウハウ集
<center> <img src="../cybozuinsideout.png" /> </center>

色んなノウハウが詰まっていて素晴らしい記事ですが、幾つか追加したい情報がありますので勝手に補足してみます。

# 良いノウハウ

## リリース大量消費に注意

 * limit 大事 (特にユーザ投稿画像を扱う場合)
<pre>
$ convert -limit <u>memory 256MB</u> -limit <u>disk 0</u> src.jpg dst.png
</pre>

 * 画像や処理によって予期しない量のメモリを使われる事があるので、-limit memory で制限をかけるのと、仮にディスクが使われた日には極端に遅くなるので -limit disk も必要です。

## ImageMagick のオプションの順序に注意

 * ImageMagick は引数を先頭から順に命令実行する

以下のように、for ループで引数を先頭から順番に見て、該当するオプションを個別に実行します。

 * wand/mogrify.c (convert も引数チェック後にこの関数を呼ぶ)

{{< highlight c >}}
for (i=1; i < (ssize_t) (argc-1); i++)
  {
    option=argv[i];
＜略＞
WandExport MagickBooleanType MogrifyImage(ImageInfo *image_info,const int argc,
  const char **argv,Image **image,ExceptionInfo *exception)
＜略＞
  for (i=0; i < (ssize_t) argc; i++)
  {
    ＜略＞
    switch (*(option+1))
    {
       ＜略＞
      case 'r':
      {
         ＜略＞
        if (LocaleCompare("repage",option+1) == 0)
          {
            if (*option == '+')
              {
                (void) ParseAbsoluteGeometry("0x0+0+0",&(*image)->page);
                break;
              }
            (void) ResetImagePage(*image,argv[i+1]);
            InheritException(exception,&(*image)->exception);
            break;
          }
{{< /highlight >}}

なので順番で結果が変わります。
逆にいうと順序次第で色んな操作が可能になるという事です。

# 補足したい項目

対応するブログのエントリを並べます。

 * 画像比較は人間の眼で行うべし
   * http://blog.awm.jp/2016/01/25/diff/ ImageMagick で画像を比較する
 * Orientation を考慮しよう
   * http://blog.awm.jp/2016/01/06/orient/ -auto-orient でオフセットがズレる件
 * 透過画像を考慮しよう
   * http://blog.awm.jp/2016/01/25/flatten/ 透明度を含む画像を JPEG に変換する時の背景色
 * グレイスケール画像を考慮しよう
   * http://blog.awm.jp/2016/01/06/gray/ グレー形式JPEGをPNGに変換すると暗くなる件
 * -define jpeg:size に注意
   * http://blog.awm.jp/2016/01/08/jpeghint/ JPEG の size hinting について
