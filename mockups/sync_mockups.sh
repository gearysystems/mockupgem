# !/bin/bash

# Be careful with this command. The --delete flag will delete anything that
# is in the destination but not in the source (in this case the S3 bucket
# is the destination but you could change that by reversing the order.)
aws s3 sync ./processed s3://mockup-gem-mockup-images --delete
