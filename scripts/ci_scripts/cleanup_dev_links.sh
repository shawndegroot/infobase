#!/bin/bash
set -e

echo "Starting dev link bucket cleanup..."

source ~/InfoBase/scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-start"

active_branches=$(git branch -r | sed -E 's/(.*\/)(.*)/\2/g')

# favicon.ico is arbitrary, just looking for any file present in the true dev link dir
# that isn't in the dead dev link dir
branches_with_live_dev_links=$(gsutil ls "$GCLOUD_BUCKET_ROOT/*/favicon.ico" | \
  sed -E 's/(.*\/)(.*)(\/favicon.ico$)/\2/g' | \
  sed -E '/(^__)|(^archived__).*/d')

inactive_branches_with_live_dev_links=$(grep -Fxvf <(echo "$active_branches" | tr ' ' '\n') <(echo "$branches_with_dev_link_buckets" | tr ' ' '\n'))

if [[ ! -z "$inactive_branches_with_live_dev_links" ]]; then
  # the index html replacements used for dead dev links are stored in google cloud and must be updated there. Note that
  # buckets don't support sym links, so if you update those files then you should also clobber over all the existing
  # instances in each old dev link dir
  dead_dev_link_html_location="$GCLOUD_BUCKET_ROOT/____dead_dev_link_html"

  echo "Clobbering dev link files for: $inactive_branches_with_live_dev_links"

  while IFS= read -r branch_name; do
    gsutil -m rsync -cdr -a public-read "$dead_dev_link_html_location" "$GCLOUD_BUCKET_ROOT/$branch_name"
    # saw cases where these html files were miss-typed. Couldn't tell why, but being explicit here to play it safe
    gsutil setmeta -h "Content-Type:text/html" "$GCLOUD_BUCKET_ROOT/$branch_name/*.html"
  done <<< "$inactive_branches_with_live_dev_links"
else 
  echo "No stale dev links to clobber"
fi

source ~/InfoBase/scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"