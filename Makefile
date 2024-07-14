all:
	rm -rf public
	hugo
	npm run index
	hugo server --watch
blog:
	rm -rf public
	npm run index
	hugo
	rsync -auz --delete -e ssh public/ blog.awm.jp:/home/www/blog/
install:
	npm run index
	git push
	rm -rf public
	git clone git@github.com:awmlabs/awmlabs.github.io.git public
	hugo
	rsync -auz --delete -e ssh public/ blog.awm.jp:/home/www/blog/
	cd public && git add . && git commit -m "[ci skip] publish" && git fetch & git merge -m "merge from remote" && git push origin master
