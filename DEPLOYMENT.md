# Google Cloud Run Deployment Guide

This guide shows how to deploy the Expense Bot to Google Cloud Run with environment variables and secrets.

## Prerequisites

1. **Google Cloud Account** - Create one at [console.cloud.google.com](https://console.cloud.google.com)
2. **gcloud CLI** - Install from [cloud.google.com/sdk](https://cloud.google.com/sdk)
3. **Project ID** - Create a new GCP project or use an existing one
4. **Enable APIs:**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   ```

## Method 1: Simple Deploy with Environment Variables (Fastest)

Deploy directly with environment variables passed via CLI:

```bash
gcloud run deploy expense-bot \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars BOT_TYPE=telegram,TELEGRAM_BOT_TOKEN=your_token_here,GOOGLE_SHEETS_ID=your_sheet_id,GOOGLE_CLIENT_EMAIL=your_email@...iam.gserviceaccount.com,GOOGLE_PRIVATE_KEY="$(cat /path/to/private_key.json)" \
  --platform managed
```

**Pros:** Quick, no extra setup
**Cons:** Secrets visible in command history

## Method 2: Using Secret Manager (Recommended for Secrets)

Store sensitive data securely:

### Step 1: Create secrets in Google Secret Manager

```bash
# Create secrets for sensitive values
gcloud secrets create telegram-bot-token --data-file=- << EOF
your_telegram_bot_token_here
EOF

gcloud secrets create google-private-key --data-file=- << EOF
$(cat /path/to/service-account-key.json | jq -r .private_key)
EOF

gcloud secrets create google-client-email --data-file=- << EOF
your-service-account@project-id.iam.gserviceaccount.com
EOF

gcloud secrets create google-sheets-id --data-file=- << EOF
your_google_sheets_id_here
EOF
```

### Step 2: Grant Cloud Run access to secrets

```bash
# Get the Cloud Run service account
gcloud iam service-accounts list --format='value(email)'

# Grant it access to read secrets (replace PROJECT_ID and EMAIL)
gcloud secrets add-iam-policy-binding telegram-bot-token \
  --member=serviceAccount:YOUR-SERVICE-ACCOUNT@PROJECT-ID.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

gcloud secrets add-iam-policy-binding google-private-key \
  --member=serviceAccount:YOUR-SERVICE-ACCOUNT@PROJECT-ID.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

gcloud secrets add-iam-policy-binding google-client-email \
  --member=serviceAccount:YOUR-SERVICE-ACCOUNT@PROJECT-ID.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

gcloud secrets add-iam-policy-binding google-sheets-id \
  --member=serviceAccount:YOUR-SERVICE-ACCOUNT@PROJECT-ID.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

### Step 3: Deploy with Secret Manager references

```bash
gcloud run deploy expense-bot \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars \
    BOT_TYPE=telegram,\
    TELEGRAM_BOT_TOKEN=projects/PROJECT_ID/secrets/telegram-bot-token/versions/latest,\
    GOOGLE_PRIVATE_KEY=projects/PROJECT_ID/secrets/google-private-key/versions/latest,\
    GOOGLE_CLIENT_EMAIL=projects/PROJECT_ID/secrets/google-client-email/versions/latest,\
    GOOGLE_SHEETS_ID=projects/PROJECT_ID/secrets/google-sheets-id/versions/latest \
  --platform managed
```

**Note:** Replace `PROJECT_ID` with your actual GCP project ID.

## Method 3: Using cloudbuild.yaml with Secrets (CI/CD)

Update your `cloudbuild.yaml` to automatically set environment variables:

```yaml
steps:
  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/expense-bot:$SHORT_SHA', '.']

  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/expense-bot:$SHORT_SHA']

  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gke-deploy'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'expense-bot'
      - '--image'
      - 'gcr.io/$PROJECT_ID/expense-bot:$SHORT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--set-env-vars'
      - 'BOT_TYPE=telegram,TELEGRAM_BOT_TOKEN=$_TELEGRAM_BOT_TOKEN,GOOGLE_SHEETS_ID=$_GOOGLE_SHEETS_ID,GOOGLE_CLIENT_EMAIL=$_GOOGLE_CLIENT_EMAIL,GOOGLE_PRIVATE_KEY=$_GOOGLE_PRIVATE_KEY'

images:
  - 'gcr.io/$PROJECT_ID/expense-bot:$SHORT_SHA'

substitutions:
  _TELEGRAM_BOT_TOKEN: 'your_default_token'
  _GOOGLE_SHEETS_ID: 'your_default_sheet_id'
  _GOOGLE_CLIENT_EMAIL: 'your_default_email'
  _GOOGLE_PRIVATE_KEY: 'your_default_key'

options:
  logging: CLOUD_LOGGING_ONLY
```

Deploy with:
```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_TELEGRAM_BOT_TOKEN="your_actual_token",_GOOGLE_SHEETS_ID="your_actual_id" \
  .
```

## Method 4: Using .env.yaml File

Create a `cloud-env.yaml` file with your environment variables:

```yaml
# cloud-env.yaml (DO NOT COMMIT THIS FILE)
BOT_TYPE: "telegram"
TELEGRAM_BOT_TOKEN: "your_token_here"
GOOGLE_SHEETS_ID: "your_sheet_id"
GOOGLE_CLIENT_EMAIL: "your_email@...iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY: "your_private_key_here"
PORT: "8080"
NODE_ENV: "production"
```

Deploy with:
```bash
gcloud run deploy expense-bot \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --env-vars-file cloud-env.yaml \
  --platform managed
```

Add to `.gitignore`:
```
cloud-env.yaml
```

## Step-by-Step Example (Complete Setup)

### 1. Set your GCP project

```bash
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1
gcloud config set project $PROJECT_ID
```

### 2. Create a service account for the app

```bash
gcloud iam service-accounts create expense-bot-app \
  --display-name="Expense Bot Service Account"

# Grant it access to Sheets API (if needed)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:expense-bot-app@$PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/editor
```

### 3. Create secrets

```bash
# Store your secrets securely
echo "your_telegram_token" | gcloud secrets create telegram-token --data-file=-
echo "your_sheet_id" | gcloud secrets create sheets-id --data-file=-
```

### 4. Deploy

```bash
gcloud run deploy expense-bot \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars \
    BOT_TYPE=telegram,\
    TELEGRAM_BOT_TOKEN=projects/$PROJECT_ID/secrets/telegram-token/versions/latest,\
    GOOGLE_SHEETS_ID=projects/$PROJECT_ID/secrets/sheets-id/versions/latest \
  --platform managed
```

### 5. View logs

```bash
gcloud run logs read expense-bot --region $REGION --limit 50
```

## Updating Environment Variables

To update an already deployed service:

```bash
gcloud run deploy expense-bot \
  --update-env-vars BOT_TYPE=telegram,TELEGRAM_BOT_TOKEN=new_token \
  --region us-central1
```

To remove a variable:

```bash
gcloud run deploy expense-bot \
  --remove-env-vars OLD_VAR \
  --region us-central1
```

## Getting Your Service URL

After deployment:

```bash
gcloud run services describe expense-bot --region us-central1 --format 'value(status.url)'
```

You'll get something like:
```
https://expense-bot-abc123-uc.a.run.app
```

Use this URL to configure webhooks (for WhatsApp via Twilio).

## Troubleshooting

### Secrets not loading
```bash
# Check if Cloud Run service account has access
gcloud secrets get-iam-policy telegram-token
```

### View Cloud Run logs
```bash
gcloud run logs read expense-bot --region us-central1 --limit 100
```

### Test your deployment
```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe expense-bot \
  --region us-central1 --format 'value(status.url)')

# Test health endpoint
curl $SERVICE_URL/health
```

## Cost Considerations

- **Cloud Run**: Free tier includes 2M requests/month
- **Secret Manager**: Free tier includes 6 active secrets
- **Cloud Build**: Free tier includes 120 minutes/day

For a personal expense bot, you'll likely stay in the free tier.

## Next Steps

1. ✅ Deploy to Cloud Run
2. 🔄 Set up CI/CD to auto-deploy on git push
3. 📊 Monitor logs and performance
4. 🎯 Configure custom domain (optional)
5. 💰 Set up billing alerts

See [Google Cloud Run Documentation](https://cloud.google.com/run/docs) for more details.
