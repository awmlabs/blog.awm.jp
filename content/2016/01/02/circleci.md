+++
date = "2016-01-02"
title = "Blog の Deploy で Circle CI"
categories = ["CircleCI"]
tags = ["Blog", "Github", "CircleCI"]
+++

# Blog の Deploy で Circle CI

昨日の時点では Markdown ファイルの編集後に make install する事でブログサイトに HTML をデプロイしますが、今回は Markdown を git commit したら自動でデプロイされるべく、Circle CI で連携する仕組みを導入しました。

# はじめに

前回は awmcorp に markdown 等の blog のソースを置いてましたが、権限設定が面倒なので、awmlabs アカウントにレポジトリをまとめました。

 * × https://github.com/awmcorp/blog.awm.jp
 * ○ https://github.com/awmlabs/blog.awm.jp blog のソース
 * https://github.com/awmlabs/awmlabs.github.io blog の公開ファイル

# circle.yaml

連携時にどういったコマンドを実行するかの指定ですが、nobu666 神のファイルをコピペして、自分のとこに合うよう書き換えました。

 * https://github.com/nobu666/nobu666.com/blob/master/circle.yml
 * https://github.com/awmlabs/blog.awm.jp/blob/master/circle.yml

{{< highlight yaml >}}
machine:
  timezone: Asia/Tokyo

checkout:
  post:
    - git submodule update --init --recursive

dependencies:
  pre:
    - go get -v github.com/spf13/hugo
    - git config --global user.name "awm labs"
    - git config --global user.email "labs@awm.jp"

test:
  override:
   - echo

deployment:
  master:
    branch: master
    commands:
      - git clone git@github.com:awmlabs/awmlabs.github.io.git public
      - pip install Pygments --user
      - hugo
      - cd public && git add . && git commit -m "[ci skip] publish"; if [ $? -eq 0 ]; then git push origin master; else :; fi
{{< /highlight >}}

神よ、ありがとう、ありがとう。(666なので邪神かもしれないが。)

## Pygments

Syntax Highlight を使いたいので、Pygments を入れたいけど、
```
pip install Pygments
```
を実行すると、/usr/ 以下に入れようとして権限的にエラーになるので --user を後ろにつけてます。

# Circle CI アカウント作成

連携したい Github アカウントで Github にログインしておいて、Circle CI のページにアクセスして Circle CI のページで SignUp すると連携用アカウントが作れます。

 * https://circleci.com/

Github で所属する組織(Organizatins)全てのアクセス権を要求するので、色んな組織に所属するアカウントでの連携は避けたい。という人は新しい Github アカウントを作って設定すると良さそうです。

Github API 的に組織ごとのオンオフ出来ません。(アカウント単位での認証なので仕方ないのかも) あと組織(Organization) 側で Circle CI との連携は切る事も出来るので、融通が効く場合はそういった手もあります。

# Circle CI での連携設定

 * Add Project で監視するレポジトリを選択します。
 * Project Settings の Permissions (SSH, API, AWS のでなく、唯の Permissions) から Authorize ＞ Create and add とボタンを押してく。
 * https://github.com/settings/applications で連携を確認 (revoke 押すと戻すのが少し面倒なので気をつけて)

(あと一手間あった気がするので、思い出したら後で追記します)

# 異なる Github アカウントでの連携 (推測)

同じアカウントであれば Permission 設定でボタン一発ですが、アカウントが違うレポジトリの場合は ssh-keygen -f id_rsa_(アカウント名) で passphrase 空で作成して、秘密鍵と公開鍵を以下の URL に登録すれば出来そうな気がして試して駄目でした。気のせいでした。

 * https://circleci.com/gh/<ユーザor組織名>/<リポジトリ名>/edit#ssh
 * https://github.com/<ユーザor組織名>/<リポジトリ名/settings/keys

必要に迫られた時にでも、もう少し試行錯誤してみます。

# 備考

 * 当初、作りたてのレポジトリが見えなくていつの間にか見えたので反映に時間がかかるのかと思いましたが、普通はすぐ反映されるそうです。謎です。
 * 別アカウントでの連携をしたかったけど、push で marked as read only のエラーの壁を越えられなかったので、そのうち挑戦したい。

# 参考URL

 * http://qiita.com/xlune/items/f5248a6cdddfb011c2ac
 * http://tdoc.info/blog/2014/01/15/pip.html
