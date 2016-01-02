all:
	rm -rf public
	git clone git@github.com:awmlabs/awmlabs.github.io.git public
	hugo
	cd public && git add . && git commit -m "[ci skip] publish" && git push origin master
