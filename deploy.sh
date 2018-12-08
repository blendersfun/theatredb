rm -rf build
npm run build
aws s3 cp --recursive ./build s3://aaron-moore.me/theatredb
aws s3 cp s3://aaron-moore.me/theatredb/index.html s3://aaron-moore.me/theatredb/index.html --metadata-directive REPLACE --cache-control max-age=0