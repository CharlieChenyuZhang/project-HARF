#!/usr/bin/env bash
# Invite a HARF editor: creates a Cognito user (Cognito emails a temporary
# password) and adds it to the ADMINS group.
#
#   AWS_PROFILE=chenyu scripts/invite-editor.sh editor@example.org
set -euo pipefail

EMAIL="${1:?usage: scripts/invite-editor.sh <email>}"
OUTPUTS="$(dirname "$0")/../amplify_outputs.json"
POOL_ID=$(node -p "require('$OUTPUTS').auth.user_pool_id")
REGION=$(node -p "require('$OUTPUTS').auth.aws_region")

aws cognito-idp admin-create-user --region "$REGION" --user-pool-id "$POOL_ID" \
  --username "$EMAIL" --user-attributes Name=email,Value="$EMAIL" Name=email_verified,Value=true \
  --desired-delivery-mediums EMAIL >/dev/null
aws cognito-idp admin-add-user-to-group --region "$REGION" --user-pool-id "$POOL_ID" \
  --username "$EMAIL" --group-name ADMINS

echo "Invited $EMAIL. They will receive a temporary password by email and can sign in at /admin/."
