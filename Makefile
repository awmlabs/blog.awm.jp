all:
	rm -rf public
	hugo server --watch

blog:
	rm -rf public
	hugo
	rsync -auz --delete -e ssh public/ blog.awm.jp:/home/www/blog/
install:
	git push
	rm -rf public
	git clone git@github.com:awmlabs/awmlabs.github.io.git public
	hugo
	rsync -auz --delete -e ssh public/ blog.awm.jp:/home/www/blog/
	cd public && git add . && git commit -m "[ci skip] publish" --allow-empty && git push origin master

#	cd public && git add . && git commit -m "[ci skip] publish" && git pull -m "merge from remote" && git push origin master
