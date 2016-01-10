all:
	rm -rf public
	hugo server --watch

install:
	rm -rf public
	git clone git@github.com:awmlabs/awmlabs.github.io.git public
	hugo
	rsync -auz --delete -e ssh public/ blog.awm.jp:/home/www/blog/
	cd public && git add . && git commit -m "[ci skip] publish" && git push origin master
