# setup

go install github.com/spf13/hugo
pip install Pygments

hugo new site blog.awm.jp
cd blog.awm.jp
git submodule add git@github.com:htdvisser/hugo-base16-theme.git themes/base16
hugo new 2016/01/01/blog.md

hugo  server --watch -t base16
