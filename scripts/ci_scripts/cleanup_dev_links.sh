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

inactive_branches_with_live_dev_links=$(grep -Fxvf <(echo "$active_branches") <(echo "$branches_with_dev_link_buckets"))

if [[ ! -z "$inactive_branches_with_live_dev_links" ]]; then
  # the index html replacements used for dead dev links is stored in google cloud and must be updated there. Note that
  # buckets don't support sym links, so if you update that file you should also clobber over all the existing instances
  dead_dev_link_html_location="$GCLOUD_BUCKET_ROOT/____dead_dev_link_html"

  while IFS= read -r branch_name; do
    gsutil -m rsync -cdr -a public-read "$dead_dev_link_html_location" "$GCLOUD_BUCKET_ROOT/$branch_name"
  done <<< "$inactive_branches_with_live_dev_links"

  rm -r "$tmpfile"
fi


source ~/InfoBase/scripts/ci_scripts/redact_env_vars_from_logging.sh "redact-end"