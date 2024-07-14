# Usage

## setup

```
$ git clone git@github.com:awmlabs/blog.awm.jp.git
$ cd blog.awm.jp
$ git submodule update --init --recursive
$ go get github.com/spf13/hugo
$ go install github.com/spf13/hugo
$ pip install Pygments # for syntax highlight
```

## watch

```
$ cd blog.awm.jp
$ hugo server --watch -t hugo-theme-base16
```

## edit

```
$ cd blog.awm.jp
$ hugo new 2016/01/01/blog.md
$ vi content/2016/01/01/blog.md
```

# Notes

## develop

```
$ hugo new site blog.awm.jp
$ cd blog.awm.jp
$ git init
$ # forked from  git@github.com:htdvisser/hugo-base16-theme.git
$ git submodule add git@github.com:awmlabs/hugo-base16-theme.git  themes/hugo-base16-theme
$ vi config.toml
```
