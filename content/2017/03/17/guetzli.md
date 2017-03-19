+++
date = "2017-03-17T17:34:14+09:00"
title = "Guetzli - Perceptual JPEG encoder"
draft = false
tags = ["JPEG", "Graphics", "Guetzli"]
categories = ["JPEG"]
+++

# 公式サイト

- https://github.com/google/guetzli
- Announcing Guetzli: A New Open Source JPEG Encoder
   - https://research.googleblog.com/2017/03/announcing-guetzli-new-open-source-jpeg.html

# はじめに

- Guetzli は知覚的(Perceptual)に人間が見ても分からないだろうギリギリまで JPEG 画像を劣化させるチキンレース技術です。
- 人間が見ても。という評価には Butteraugli を用います。 画像処理の論文では MSE, PNSR, SSIM をよく見かけますが結構これらは雑な評価で、Butteraugli は人間の視覚特性(例えば輝度と色味は別指標、色味も反対色説の色差軸)を元に計算します。
<center>
<img src="../opponent-color.jpg" /> <br />
(c) http://ieeexplore.ieee.org/ieee_pilot/articles/06/ttg2009061291/article.html
</center>

- JPEG quality を色々変えて画像サイズと画質のトレードオフを探る事はよくありますが、それの全自動版みたいな感じです。更に DQT (周波数成分毎の量子化パラメータ) を細かくいじります。
- 良い結果に当たるよう何度も繰り返し JPEG 生成する方式なので、とにかく時間がかかります。libjpeg や mozjpeg の代わりという訳にはいきません。アクセスが特別多い重要な画像に対してサイズを少しでも減らしたい。zopflipng のような使い方が良さそうです。

# 制限事項

ソースを読んで気づいた制限事項です。(README に記述して欲しいなぁ。)

## quality >= 84

quality は 84 以上しか指定できません。それ以下だと目に見えるレベルの劣化するそうです。 (ちなみにデフォルトは 95)

- guetzli/processor.cc
{{< highlight cpp >}}
bool Processor::ProcessJpegData(const Params& params, const JPEGData& jpg_in,
                                Comparator* comparator, GuetzliOutput* out,
                                ProcessStats* stats) {
＜略＞
if (params.butteraugli_target > 2.0f) {
    fprintf(stderr,
            "Guetzli should be called with quality >= 84, otherwise the\n"
            "output will have noticeable artifacts. If you want to\n"
            "proceed anyway, please edit the source code.\n");
    return false;
  }
{{< /highlight >}}

## CMYK 未対応

YCbCr JPEG のみ対応です。CMYK や CYYK は未対応。

- 参考) https://blog.awm.jp/2016/02/06/ycbcr/ YCbCr について

- guetzli/processor.cc
{{< highlight cpp >}}
bool Processor::ProcessJpegData(const Params& params, const JPEGData& jpg_in,
                                Comparator* comparator, GuetzliOutput* out,
                                ProcessStats* stats) {
＜略＞
if (jpg_in.components.size() != 3 || !HasYCbCrColorSpace(jpg_in)) {
  fprintf(stderr, "Only YUV color space input jpeg is supported\n");
  return false;
}
{{< /highlight >}}

## YUV 444,420 only

YUV444, 420 のみ対応。422,411,440 は NG。

- 参考) https://blog.awm.jp/2016/02/10/yuv/ YUV の種類

- guetzli/processor.cc
{{< highlight cpp >}}
bool Processor::ProcessJpegData(const Params& params, const JPEGData& jpg_in,
                                Comparator* comparator, GuetzliOutput* out,
                                ProcessStats* stats) {
＜略＞
  if (jpg_in.Is444()) {
    input_is_420 = false;
  } else if (jpg_in.Is420()) {
    input_is_420 = true;
  } else {
    fprintf(stderr, "Unsupported sampling factors:");
{{< /highlight >}}

うーん。YUV422 の JPEG は世に溢れてるはずだけど、大丈夫なのでしょうか。420 なんかよりずっと多そうだけど。デジカメで普通の画質設定だと 422 になりそうですし。(自分は高画質しか興味ないので、よく分からない)

## 噂話 (ICC プロファイル)

あと、ICC プロファイルを引き継がないという噂がありますが、自分が試した限りではちゃんと引き継ぎます。ソースコードを見ても APPn を 丸々コピーする処理があります。

- guetzli/jpeg_data_reader.cc
{{< highlight cpp >}}
// Saves the APP marker segment as a string to *jpg.
bool ProcessAPP(const uint8_t* data, const size_t len, size_t* pos,
                JPEGData* jpg) {
  VERIFY_LEN(2);
  size_t marker_len = ReadUint16(data, pos);
  VERIFY_INPUT(marker_len, 2, 65535, MARKER_LEN);
  VERIFY_LEN(marker_len - 2);
  // Save the marker type together with the app data.
  std::string app_str(reinterpret_cast<const char*>(
      &data[*pos - 3]), marker_len + 1);
  *pos += marker_len - 2;
  jpg->app_data.push_back(app_str);
  return true;
}
＜略＞
bool ReadJpeg(const uint8_t* data, const size_t len, JpegReadMode mode,
              JPEGData* jpg) {
 ＜略＞
case 0xe0:
      case 0xe1:
      case 0xe2:
      case 0xe3:
      case 0xe4:
      case 0xe5:
      case 0xe6:
      case 0xe7:
      case 0xe8:
      case 0xe9:
      case 0xea:
      case 0xeb:
      case 0xec:
      case 0xed:
      case 0xee:
      case 0xef:
        if (mode != JPEG_READ_TABLES) {
          ok = ProcessAPP(data, len, &pos, jpg);
        }
        break;
{{< /highlight >}}

- guetzli/jpeg_data_writer.cc
{{< highlight cpp >}}
bool EncodeMetadata(const JPEGData& jpg, bool strip_metadata, JPEGOutput out) {
  if (strip_metadata) {
＜略＞
  bool ok = true;
  for (int i = 0; i < jpg.app_data.size(); ++i) {
    uint8_t data[1] = { 0xff };
    ok = ok && JPEGWrite(out, data, sizeof(data));
    ok = ok && JPEGWrite(out, jpg.app_data[i]);
  }
{{< /highlight >}}

どなたか Exif や ICC プロファイルを引き継がない JPEG ファイルをお持ちでしたら頂けないでしょうか。(修正コミットしてコントリビュータに紛れ込みたい！)

# インストール

macOS だと brew install guetzli で入りますが、一応 git レポジトリを使う方法のメモです。

libpng(libpng-dev) と gflags (libgflags-dev) のパッケージを入れて make するだけです。macOS Sierra と Linux Ubuntu16 で動作しました。

```
% git clone git@github.com:google/guetzli.git
% cd guetzli
% make
==== Building guetzli (release) ====
Creating bin/Release
Creating obj/Release
＜略＞
butteraugli.cc
Linking guetzli
ld: warning: option -s is obsolete and being ignored
% ls -l bin/Release/guetzli
-rwxr-xr-x  1 yoya  staff  280856  3 17 17:34 bin/Release/guetzli
% 
```

# 実験

様々なサイズの2Dイラスト画像1406枚で Guetzli を動かして計測しました。
何枚かは制限事項に引っかかるようで、実際に処理できたのは 1360枚です。


## 実行
```
% ls illust | wc
   1406    1406   26445
% mkdir tmp
% cd illust
% (for i in *.jpg ; do o="../tmp/$i" ; identify $i ; time guetzli $i $o ; identify $o ; done >& ../log.txt )
% ls -l ../tmp | wc
   1360   12233   86837
```

- ログデータ(の一部)

```
3b689cd9.jpg JPEG 500x375 500x375+0+0 8-bit sRGB 59.4KB 0.000u 0:00.000

real	0m7.194s
user	0m6.976s
sys	0m0.212s
../tmp/3b689cd9.jpg JPEG 500x375 500x375+0+0 8-bit sRGB 56KB 0.000u 0:00.000
```

## 集計スクリプト

{{< highlight php >}}
<?php

function filesizeUnit($filesize, $unit) { // to KB
    if ($unit === "KB") {
        ;
    } else if ($unit === "MB") {
        $filesize *= 1024;
    } else if ($unit === "GB") {
        $filesize *= 1024 * 1024;
    } else {
        echo "ERROR: $filesize, $unit\n"; exit(1);
    }
    return $filesize;
}

foreach (file($argv[1]) as $line) {
    if (preg_match("/^([^\/]+.jpg) JPEG (\d+)x(\d+) \S+ \S+ \S+ ([0-9\.]+)(.B)/\", $line, $matches)) {
        list($all, $file, $width, $height, $filesize, $unit) = $matches;
        $nPixel = $width * $height;
        $size = (int) sqrt($nPixel);
    $filesize = filesizeUnit($filesize, $unit);
} else if (preg_match("/^user\s+(\d+)m([\d\.]+)s/", $line, $matches)) {
        list($all, $minutes, $seconds) = $matches;
        $t = 60 * $minutes + $seconds;
        if ($t === 0.01) {
            // echo "ERROR: $size $t\n";
        } else {
            //  echo "$size,$t\n";
        }
    } else if (preg_match("/^\.\.\/tmp\/([^\/]+.jpg) JPEG (\d+)x(\d+) \S+ \S+ \S+ ([0-9\.]+)(.B)/", $line, $matches)) {
        list($all, $file, $width, $height, $filesize2, $unit) = $matches;
        $filesize2 = filesizeUnit($filesize2, $unit);
        echo "$filesize,$filesize2\n";
          if ($filesize < $filesize2) {
               exit(1);
        }
    }
}
{{< /highlight >}}

## 集計結果のグラフ

### 処理時間

<center> <img src="../time-graph-small.png" /> </center>

- 横がsqrt(width*height) 。正方形と仮定した場合の一辺の長さ相当
- 縦が user 時間の秒数

一辺2000px で100秒弱〜200秒が目安になりそうです。

ちなみにそこそこ高性能なゲームPCで実験してます。

### ファイルサイズ削減

横軸が元サイズ、縦軸が圧縮後のサイズです。どちらも KB 単位。

期待以上の異常なレベルでの削減率です。半分以下になることさえあります。

<center> <img src="../filesize-graph-small.png" /> </center>
(参考のため、サイズが変わらない時の場所にピンクの線を引いておきます)

削減率の多い画像を目視で確認しても、ぱっと見で違いは分かりませんでした。凄い。。

# 最後に

イラスト画像は線(周波数高)とグラデーション(周波数低)が命だと考えると周波数の中域は荒くて良さそうで、視覚特性以外でも削れる情報があって実な効果が大きいのかもしれません。

Guetzli で処理するとデータの劣化はするので、例えば画像を引き伸ばした時や画像にフィルタをかけた時に、違いが目に見える可能性があります。チキンレースで崖の位置が変われば当然落ちますし。画質評価で設定するその崖の位置は、モニタのDPI、視距離、測色標準観察者の種類といった想定する視聴環境のモデル次第です。

MozJPEG と比較してたりはするけど、土俵が違うのであんまりまとめても意味なさそうかな。。
