+++
date = "2017-08-06T11:59:20+09:00"
title = "ImageMagick で ICC プロファイルを扱う #3 コマンド解説"
categories = ["ImageMagick"]
draft = false
tags = ["ICC", "JPEG"]
+++

# はじめに


このエントリの続きです。

-  ImageMagick で ICC プロファイルを扱う #2 コマンド実行例
   - http://blog.awm.jp/2017/06/10/imicc/

JPEG のメタデータを消す時に ICC プロファイルを残す方法で、タイトルが不適切だったので、タイトルに合った解説を作りました。

# ImageMagick で ICC を操作する

JPEG ファイルは ICC プロファイルを埋め込めます。ImageMagick でその ICC プロファイルを操作するコマンドについて整理しました。

## 存在チェック (check)

### ICC プロファイルが入っている場合
```
% identify -format "%[profiles]\n" test.jpg
icc
```
<center> <img src="../fig1.png" /> </center>

### ICC プロファイルが入っていない場合
```
% identify -format "%[profiles]\n" test2.jpg
identify: unknown image property "%[profiles]" @ warning/property.c/InterpretImageProperties/3888.
```
<center> <img src="../fig2.png" /> </center>

## 抽出 (extract)

```
% convert test.jpg test.icc
%
```
<center> <img src="../fig3-extract.png" /> </center>


## 削除 (delete)

```
% convert test.jpg +profile icc output.jpg
%
```
<center> <img src="../fig4-delete.png" /> </center>

## 挿入 (insert)

```
% identify -format "%[profiles]" test.jpg
identify: unknown image property "%[profiles]" @ warning/property.c/InterpretImageProperties/3888.
% convert test.jpg -profile sRGB.icc output.jpg
%
```
<center>
   <img src="../fig2.png" /> <br />
   ↓ ↓ ↓ <br />
   <img src="../fig5-insert.png" />
</center>

## 入替え (replace)

画像ピクセルデータ変換あり

```
% identify -format "%[profiles]\n" test.jpg
icc
% convert test.jpg -profile sRGB.icc output.jpg
%
```
<center>
   <img src="../fig1.png" /> <br />
   ↓ ↓ ↓ <br />
   <img src="../fig6-replace.png" />
</center>

# 最後に

 -profile オプションを使った時の動作が、

- JPEG に ICC プロファイルが入っていない場合。 > 単純に ICC プロファイルを追加するだけ。
- JPEG に ICC プロファイルが入っている場合 > ICC プロファイルを差し替えると同時に、画像データの RGB値を、元の ICC から新しい ICC 相当に補正する。

といったところが注意点で、他は素直な使い方だと思います。

# 参考 URL

- RGB画像をCMYKに変換する（ImageMagick）
   - http://blog.livedoor.jp/yamma_ma/archives/3368542.html