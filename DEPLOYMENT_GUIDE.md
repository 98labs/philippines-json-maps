# Philippines JSON Maps - Deployment Guide

Complete guide for deploying the Philippines JSON Maps shapefiles and web components to popular CDN platforms.

## Table of Contents

1. [Google Cloud Platform (GCP)](#google-cloud-platform-gcp)
2. [Amazon Web Services (AWS)](#amazon-web-services-aws)
3. [Microsoft Azure](#microsoft-azure)
4. [Cloudflare](#cloudflare)
5. [Netlify](#netlify)
6. [Vercel](#vercel)
7. [GitHub Pages](#github-pages)
8. [DigitalOcean Spaces](#digitalocean-spaces)
9. [npm CDNs (jsDelivr & unpkg)](#npm-cdns-jsdelivr--unpkg)
10. [Cost Comparison](#cost-comparison)
11. [Performance Optimization](#performance-optimization)
12. [Monitoring and Analytics](#monitoring-and-analytics)

---

## Google Cloud Platform (GCP)

### Using Cloud Storage + Cloud CDN

#### Prerequisites
- Google Cloud account
- `gcloud` CLI installed
- Billing enabled

#### Step 1: Create a Storage Bucket

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Create a bucket with multi-regional storage
gsutil mb -c STANDARD -l ASIA gs://philippine-maps

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://philippine-maps
```

#### Step 2: Configure CORS

Create `cors.json`:
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
```

Apply CORS configuration:
```bash
gsutil cors set cors.json gs://philippine-maps
```

#### Step 3: Upload Files

```bash
# Upload all GeoJSON files
gsutil -m cp -r 2023/ gs://philippine-maps/

# Upload public folder (includes demos and components)
gsutil -m cp -r public/ gs://philippine-maps/

# Set cache control (1 year for versioned files)
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
  gs://philippine-maps/2023/**/*.json

# Set cache control for HTML (1 hour)
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" \
  gs://philippine-maps/public/**/*.html
```

#### Step 4: Enable Cloud CDN

```bash
# Create a backend bucket
gcloud compute backend-buckets create philippine-maps-backend \
  --gcs-bucket-name=philippine-maps \
  --enable-cdn

# Create a URL map
gcloud compute url-maps create philippine-maps-url-map \
  --default-backend-bucket=philippine-maps-backend

# Create a target HTTP proxy
gcloud compute target-http-proxies create philippine-maps-http-proxy \
  --url-map=philippine-maps-url-map

# Reserve a static IP
gcloud compute addresses create philippine-maps-ip --global

# Get the IP address
gcloud compute addresses describe philippine-maps-ip --global

# Create forwarding rule
gcloud compute forwarding-rules create philippine-maps-http-rule \
  --address=philippine-maps-ip \
  --global \
  --target-http-proxy=philippine-maps-http-proxy \
  --ports=80
```

#### Step 5: Access Your Files

Your files will be available at:
```
http://[YOUR-IP-ADDRESS]/2023/geojson/country/lowres/country.0.001.json
http://[YOUR-IP-ADDRESS]/components/philippines-map.js
```

#### Optional: Custom Domain with SSL

```bash
# Create SSL certificate
gcloud compute ssl-certificates create philippine-maps-cert \
  --domains=maps.yourdomain.com

# Create HTTPS proxy
gcloud compute target-https-proxies create philippine-maps-https-proxy \
  --url-map=philippine-maps-url-map \
  --ssl-certificates=philippine-maps-cert

# Create HTTPS forwarding rule
gcloud compute forwarding-rules create philippine-maps-https-rule \
  --address=philippine-maps-ip \
  --global \
  --target-https-proxy=philippine-maps-https-proxy \
  --ports=443
```

**Access URL**: `https://maps.yourdomain.com/`

#### Cost Estimation (GCP)
- **Storage**: $0.020 per GB/month (Standard)
- **Bandwidth**: $0.08-$0.12 per GB (Asia)
- **CDN**: $0.08-$0.20 per GB (varies by region)
- **Estimated monthly cost** (100GB data, 1TB bandwidth): ~$90-120

---

## Amazon Web Services (AWS)

### Using S3 + CloudFront

#### Prerequisites
- AWS account
- AWS CLI installed and configured
- Domain name (optional)

#### Step 1: Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://philippine-maps --region ap-southeast-1

# Enable static website hosting
aws s3 website s3://philippine-maps \
  --index-document index.html \
  --error-document error.html
```

#### Step 2: Configure Bucket Policy

Create `bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::philippine-maps/*"
    }
  ]
}
```

Apply policy:
```bash
aws s3api put-bucket-policy \
  --bucket philippine-maps \
  --policy file://bucket-policy.json
```

#### Step 3: Configure CORS

Create `cors-config.json`:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

Apply CORS:
```bash
aws s3api put-bucket-cors \
  --bucket philippine-maps \
  --cors-configuration file://cors-config.json
```

#### Step 4: Upload Files

```bash
# Upload with proper content types and cache headers
aws s3 sync 2023/ s3://philippine-maps/2023/ \
  --content-type "application/json" \
  --cache-control "public, max-age=31536000" \
  --acl public-read

aws s3 sync public/ s3://philippine-maps/public/ \
  --cache-control "public, max-age=3600" \
  --acl public-read
```

#### Step 5: Create CloudFront Distribution

```bash
# Create distribution
aws cloudfront create-distribution \
  --origin-domain-name philippine-maps.s3.ap-southeast-1.amazonaws.com \
  --default-root-object index.html
```

Or use the AWS Console:
1. Go to CloudFront → Create Distribution
2. **Origin Domain**: Select your S3 bucket
3. **Viewer Protocol Policy**: Redirect HTTP to HTTPS
4. **Allowed HTTP Methods**: GET, HEAD, OPTIONS
5. **Cache Policy**: CachingOptimized
6. **Compress Objects**: Yes
7. Create Distribution

#### Step 6: Get Distribution URL

```bash
# List distributions
aws cloudfront list-distributions \
  --query 'DistributionList.Items[*].[Id,DomainName,Status]' \
  --output table
```

**Access URL**: `https://d1234567890.cloudfront.net/`

#### Optional: Custom Domain

1. Request SSL certificate in ACM (us-east-1 region)
2. Add Alternate Domain Names (CNAMEs) to distribution
3. Update DNS to point to CloudFront

**Access URL**: `https://maps.yourdomain.com/`

#### Cost Estimation (AWS)
- **S3 Storage**: $0.023 per GB/month
- **S3 Requests**: $0.0004 per 1,000 GET requests
- **CloudFront**: $0.085 per GB (first 10TB)
- **Estimated monthly cost** (100GB data, 1TB bandwidth): ~$90-110

---

## Microsoft Azure

### Using Blob Storage + Azure CDN

#### Prerequisites
- Azure account
- Azure CLI installed
- Resource group created

#### Step 1: Create Storage Account

```bash
# Set variables
RESOURCE_GROUP="philippine-maps-rg"
STORAGE_ACCOUNT="philippinesmaps"
LOCATION="southeastasia"

# Create storage account
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2 \
  --allow-blob-public-access true
```

#### Step 2: Create Blob Container

```bash
# Get connection string
CONNECTION_STRING=$(az storage account show-connection-string \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --output tsv)

# Create container
az storage container create \
  --name maps \
  --connection-string $CONNECTION_STRING \
  --public-access blob
```

#### Step 3: Configure CORS

```bash
az storage cors add \
  --services b \
  --methods GET HEAD OPTIONS \
  --origins "*" \
  --allowed-headers "*" \
  --exposed-headers "*" \
  --max-age 3600 \
  --connection-string $CONNECTION_STRING
```

#### Step 4: Upload Files

```bash
# Upload files
az storage blob upload-batch \
  --destination maps \
  --source ./2023 \
  --destination-path 2023 \
  --content-cache-control "public, max-age=31536000" \
  --connection-string $CONNECTION_STRING

az storage blob upload-batch \
  --destination maps \
  --source ./demos \
  --destination-path demos \
  --content-cache-control "public, max-age=3600" \
  --connection-string $CONNECTION_STRING
```

#### Step 5: Enable Azure CDN

```bash
# Create CDN profile
az cdn profile create \
  --name philippine-maps-cdn \
  --resource-group $RESOURCE_GROUP \
  --sku Standard_Microsoft

# Create CDN endpoint
az cdn endpoint create \
  --name philippine-maps \
  --profile-name philippine-maps-cdn \
  --resource-group $RESOURCE_GROUP \
  --origin $STORAGE_ACCOUNT.blob.core.windows.net \
  --origin-host-header $STORAGE_ACCOUNT.blob.core.windows.net \
  --enable-compression true
```

#### Step 6: Access Your Files

**Access URL**: `https://philippine-maps.azureedge.net/maps/2023/geojson/country/lowres/country.0.001.json`

#### Optional: Custom Domain

```bash
# Add custom domain
az cdn custom-domain create \
  --endpoint-name philippine-maps \
  --hostname maps.yourdomain.com \
  --name maps-domain \
  --profile-name philippine-maps-cdn \
  --resource-group $RESOURCE_GROUP

# Enable HTTPS
az cdn custom-domain enable-https \
  --endpoint-name philippine-maps \
  --name maps-domain \
  --profile-name philippine-maps-cdn \
  --resource-group $RESOURCE_GROUP
```

**Access URL**: `https://maps.yourdomain.com/`

#### Cost Estimation (Azure)
- **Blob Storage**: $0.018 per GB/month
- **Bandwidth**: $0.087 per GB (first 10TB)
- **CDN**: $0.081 per GB (Standard tier)
- **Estimated monthly cost** (100GB data, 1TB bandwidth): ~$85-105

---

## Cloudflare

### Using Cloudflare Pages or R2 Storage

#### Option A: Cloudflare Pages (Recommended for Static Sites)

**Prerequisites**:
- Cloudflare account
- GitHub repository

**Steps**:

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/philippine-maps.git
git push -u origin main
```

2. **Deploy to Cloudflare Pages**:
   - Go to Cloudflare Dashboard → Pages
   - Click "Create a project"
   - Connect to GitHub
   - Select repository
   - Build settings:
     - Framework preset: None
     - Build command: (leave empty)
     - Build output directory: `/`
   - Click "Save and Deploy"

3. **Configure Custom Domain** (optional):
   - Go to Custom domains
   - Add domain: `maps.yourdomain.com`
   - Update DNS records as instructed

**Access URL**: `https://philippine-maps.pages.dev/`

#### Option B: Cloudflare R2 (S3-Compatible Storage)

**Prerequisites**:
- Cloudflare account with R2 enabled

**Steps**:

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create R2 bucket
wrangler r2 bucket create philippine-maps

# Upload files using rclone or AWS CLI with R2 endpoint
# Configure AWS CLI with R2 credentials
aws configure --profile r2

# Upload files
aws s3 sync ./2023 s3://philippine-maps/2023 \
  --endpoint-url https://[account-id].r2.cloudflarestorage.com \
  --profile r2

# Create public URL
# Go to R2 dashboard → philippine-maps → Settings → Public access
# Enable public access and get the URL
```

**Access URL**: `https://philippine-maps.[account-id].r2.dev/`

#### Cost Estimation (Cloudflare)
- **Pages**: FREE (unlimited bandwidth)
- **R2 Storage**: $0.015 per GB/month
- **R2 Egress**: FREE (no bandwidth charges!)
- **Estimated monthly cost** (100GB data, 1TB bandwidth): ~$1.50 (R2) or FREE (Pages)

---

## Netlify

### Static Site Deployment

**Prerequisites**:
- Netlify account
- GitHub repository (or use Netlify CLI)

#### Method 1: GitHub Integration

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy via Netlify Dashboard**:
   - Go to Netlify → New site from Git
   - Connect to GitHub
   - Select repository
   - Build settings:
     - Base directory: (leave empty)
     - Build command: (leave empty)
     - Publish directory: `/`
   - Click "Deploy site"

3. **Configure Headers** (create `netlify.toml`):
```toml
[[headers]]
  for = "/*.json"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Access-Control-Allow-Origin = "*"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=3600"
    Access-Control-Allow-Origin = "*"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Access-Control-Allow-Origin = "*"
```

#### Method 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod --dir=.
```

**Access URL**: `https://philippine-maps.netlify.app/`

#### Custom Domain

1. Go to Domain settings
2. Add custom domain: `maps.yourdomain.com`
3. Update DNS records
4. SSL certificate is automatically provisioned

**Access URL**: `https://maps.yourdomain.com/`

#### Cost Estimation (Netlify)
- **Free Tier**: 100GB bandwidth/month
- **Pro Tier**: $19/month (1TB bandwidth)
- **Estimated monthly cost**: FREE (if under 100GB) or $19

---

## Vercel

### Edge Network Deployment

**Prerequisites**:
- Vercel account
- GitHub repository (or use Vercel CLI)

#### Method 1: GitHub Integration

1. **Push to GitHub**
2. **Import to Vercel**:
   - Go to Vercel Dashboard → Add New → Project
   - Import from GitHub
   - Select repository
   - Framework Preset: Other
   - Root Directory: `./`
   - Click "Deploy"

3. **Configure Headers** (create `vercel.json`):
```json
{
  "headers": [
    {
      "source": "/(.*).json",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    },
    {
      "source": "/(.*).js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Access URL**: `https://philippine-maps.vercel.app/`

#### Custom Domain

1. Go to Project Settings → Domains
2. Add domain: `maps.yourdomain.com`
3. Configure DNS records
4. SSL is automatic

**Access URL**: `https://maps.yourdomain.com/`

#### Cost Estimation (Vercel)
- **Hobby (Free)**: 100GB bandwidth/month
- **Pro**: $20/month (1TB bandwidth)
- **Estimated monthly cost**: FREE (if under 100GB) or $20

---

## GitHub Pages

### Free Static Hosting

**Prerequisites**:
- GitHub account
- GitHub repository

#### Setup Steps

1. **Create Repository**:
```bash
# Initialize repo if not exists
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub and push
git remote add origin https://github.com/yourusername/philippine-maps.git
git push -u origin main
```

2. **Enable GitHub Pages**:
   - Go to repository → Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `root`
   - Click "Save"

3. **Configure CORS** (create `.nojekyll` file):
```bash
touch .nojekyll
git add .nojekyll
git commit -m "Disable Jekyll"
git push
```

4. **Optional: Custom Domain**:
   - Add CNAME file: `echo "maps.yourdomain.com" > CNAME`
   - Configure DNS: `CNAME maps.yourdomain.com yourusername.github.io`

**Access URL**: `https://yourusername.github.io/philippine-maps/`

**Custom Domain URL**: `https://maps.yourdomain.com/`

#### Limitations
- 1GB repository size limit
- 100GB bandwidth/month (soft limit)
- HTTPS required for custom domains
- No server-side processing

#### Cost Estimation (GitHub Pages)
- **Free**: Unlimited for public repositories
- **Estimated monthly cost**: FREE

---

## DigitalOcean Spaces

### Object Storage with CDN

**Prerequisites**:
- DigitalOcean account
- `s3cmd` or DigitalOcean CLI

#### Step 1: Create Space

1. Go to DigitalOcean → Spaces
2. Click "Create Space"
3. Choose region (SGP1 for Asia)
4. Name: `philippine-maps`
5. Enable CDN
6. Create Space

#### Step 2: Configure Access Keys

1. Go to API → Spaces access keys
2. Generate new key
3. Save Access Key ID and Secret Key

#### Step 3: Configure s3cmd

```bash
# Install s3cmd
sudo apt-get install s3cmd  # or: brew install s3cmd

# Configure
s3cmd --configure
```

Enter:
- Access Key: [Your Key]
- Secret Key: [Your Secret]
- Default Region: `sgp1`
- S3 Endpoint: `sgp1.digitaloceanspaces.com`
- DNS-style bucket: `%(bucket)s.sgp1.digitaloceanspaces.com`

#### Step 4: Upload Files

```bash
# Upload with public ACL
s3cmd put --recursive --acl-public \
  --add-header="Cache-Control: public, max-age=31536000" \
  2023/ s3://philippine-maps/2023/

s3cmd put --recursive --acl-public \
  --add-header="Cache-Control: public, max-age=3600" \
  public/ s3://philippine-maps/public/
```

#### Step 5: Configure CORS

Create `cors.xml`:
```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <MaxAgeSeconds>3600</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>
```

Apply CORS:
```bash
s3cmd setcors cors.xml s3://philippine-maps
```

**Access URLs**:
- Direct: `https://philippine-maps.sgp1.digitaloceanspaces.com/`
- CDN: `https://philippine-maps.sgp1.cdn.digitaloceanspaces.com/`

#### Custom Domain

1. Go to Space → Settings
2. Add custom subdomain: `maps.yourdomain.com`
3. Create CNAME record pointing to CDN endpoint
4. Enable Let's Encrypt certificate

**Access URL**: `https://maps.yourdomain.com/`

#### Cost Estimation (DigitalOcean Spaces)
- **Storage**: $5/month (250GB included)
- **Bandwidth**: 1TB included, $0.01/GB overage
- **Estimated monthly cost**: $5 (very cost-effective)

---

## npm CDNs (jsDelivr & unpkg)

### For Web Components Distribution

If you publish the web component to npm, it becomes available on public CDNs.

#### Step 1: Prepare for npm

Create `package.json`:
```json
{
  "name": "@yourusername/philippines-map",
  "version": "1.0.0",
  "description": "Web component for Philippine administrative boundaries",
  "main": "public/components/philippines-map.js",
  "files": [
    "public/components/philippines-map.js",
    "2023/**/*.json"
  ],
  "keywords": ["philippines", "map", "geojson", "web-component"],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/philippine-maps.git"
  }
}
```

#### Step 2: Publish to npm

```bash
# Login to npm
npm login

# Publish package
npm publish --access public
```

#### Step 3: Use via CDN

**jsDelivr** (recommended - faster in Asia):
```html
<!-- Web Component -->
<script src="https://cdn.jsdelivr.net/npm/@yourusername/philippines-map@1.0.0/public/components/philippines-map.js"></script>

<!-- GeoJSON Data -->
<script>
const url = 'https://cdn.jsdelivr.net/npm/@yourusername/philippines-map@1.0.0/2023/geojson/country/lowres/country.0.001.json';
</script>
```

**unpkg**:
```html
<script src="https://unpkg.com/@yourusername/philippines-map@1.0.0/public/components/philippines-map.js"></script>
```

#### Cost Estimation (npm CDNs)
- **Cost**: FREE
- **Bandwidth**: Unlimited
- **Global CDN**: Included
- **Estimated monthly cost**: FREE

---

## Cost Comparison

| Platform | Storage (100GB) | Bandwidth (1TB) | Monthly Cost | Free Tier |
|----------|-----------------|-----------------|--------------|-----------|
| **Cloudflare Pages** | Included | FREE | $0 | Yes |
| **Cloudflare R2** | $1.50 | FREE | $1.50 | 10GB free |
| **GitHub Pages** | FREE | FREE | $0 | Yes (public) |
| **Netlify** | Included | FREE/19 | $0-19 | 100GB bandwidth |
| **Vercel** | Included | FREE/20 | $0-20 | 100GB bandwidth |
| **DigitalOcean Spaces** | $5 | $0 | $5 | 250GB included |
| **AWS S3+CloudFront** | $2.30 | $85 | $87 | 5GB/20k requests |
| **Google Cloud** | $2.00 | $85 | $87 | None |
| **Azure** | $1.80 | $87 | $89 | $200 credit |
| **jsDelivr/unpkg** | FREE | FREE | $0 | Yes |

**Recommendation by Use Case**:
- **Best Free Option**: Cloudflare Pages or GitHub Pages
- **Best Value**: DigitalOcean Spaces ($5/month)
- **Best for High Traffic**: Cloudflare R2 (no egress fees)
- **Best for npm Packages**: jsDelivr/unpkg
- **Enterprise**: AWS/GCP/Azure (with SLA and support)

---

## Performance Optimization

### 1. Enable Compression

Ensure gzip/brotli compression is enabled:

**Cloudflare** (automatic)
**AWS CloudFront**:
```bash
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --distribution-config file://distribution-config.json
```

**Nginx** (self-hosted):
```nginx
gzip on;
gzip_types application/json text/javascript;
gzip_min_length 1000;
```

### 2. Set Appropriate Cache Headers

```bash
# Immutable files (versioned)
Cache-Control: public, max-age=31536000, immutable

# Dynamic files
Cache-Control: public, max-age=3600

# No cache (for development)
Cache-Control: no-cache, no-store, must-revalidate
```

### 3. Use HTTP/2 or HTTP/3

Most CDNs enable this by default. Verify:
```bash
curl -I --http2 https://your-cdn-url.com/
```

### 4. Geographic Distribution

- Use multi-region buckets (GCP, AWS)
- Enable CDN edge locations near your users
- For Asia-Pacific: Singapore, Hong Kong, Tokyo regions

### 5. Lazy Loading

Load data on-demand:
```javascript
// Only load when component is in viewport
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.loadMap();
      }
    });
  });
  observer.observe(mapElement);
}
```

---

## Monitoring and Analytics

### Cloudflare Analytics

```bash
# View analytics
curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/analytics/dashboard" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### AWS CloudWatch

```bash
# View CloudFront metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=YOUR_DISTRIBUTION_ID \
  --start-time 2025-10-01T00:00:00Z \
  --end-time 2025-10-16T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

### Google Analytics

Add to your HTML:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Performance Monitoring

```javascript
// Track load times
const perfData = performance.getEntriesByType('navigation')[0];
console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart);

// Track resource load times
const resources = performance.getEntriesByType('resource');
resources.forEach(resource => {
  if (resource.name.includes('.json')) {
    console.log('GeoJSON Load Time:', resource.duration);
  }
});
```

---

## Security Considerations

### 1. HTTPS Only

Always serve over HTTPS:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 2. Content Security Policy

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' https://unpkg.com;
               style-src 'self' 'unsafe-inline' https://unpkg.com;">
```

### 3. CORS Configuration

Only allow necessary origins:
```json
{
  "AllowedOrigins": ["https://yourdomain.com"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600
}
```

### 4. Rate Limiting

**Cloudflare**:
- Enable rate limiting rules
- Set threshold: 100 requests/minute

**AWS**:
```bash
aws wafv2 create-rate-based-rule \
  --name philippine-maps-rate-limit \
  --rate-limit 100
```

---

## Troubleshooting

### CORS Errors

```javascript
// Check CORS headers
fetch('https://your-cdn.com/file.json')
  .then(response => {
    console.log('Access-Control-Allow-Origin:',
      response.headers.get('Access-Control-Allow-Origin'));
  });
```

### Cache Issues

```bash
# Purge CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

# Purge Cloudflare cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### SSL Certificate Issues

```bash
# Check SSL certificate
openssl s_client -connect maps.yourdomain.com:443 -servername maps.yourdomain.com
```

---

## Maintenance

### Regular Tasks

1. **Monitor bandwidth usage** (monthly)
2. **Update web component** (as needed)
3. **Review access logs** (weekly)
4. **Check SSL expiry** (auto-renew should handle this)
5. **Update GeoJSON data** (when new data available)

### Backup Strategy

```bash
# Backup from S3
aws s3 sync s3://philippine-maps ./backup/

# Backup from Google Cloud
gsutil -m rsync -r gs://philippine-maps ./backup/

# Backup from Azure
az storage blob download-batch \
  --source maps \
  --destination ./backup/ \
  --connection-string $CONNECTION_STRING
```

---

## Summary

**Recommended Setup for Most Users**:

1. **Development**: GitHub Pages (free, easy setup)
2. **Small to Medium Traffic**: Cloudflare Pages or DigitalOcean Spaces
3. **High Traffic**: Cloudflare R2 (no egress fees)
4. **Enterprise**: AWS/GCP/Azure with proper monitoring and SLA

**Quick Start (Cloudflare Pages)**:
```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Initial" && git push

# 2. Deploy via Cloudflare Dashboard
# - Connect GitHub
# - Deploy
# - Done! (free unlimited bandwidth)
```

**Access URL**: `https://philippine-maps.pages.dev/public/demos/`

---

## Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [AWS CloudFront Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/)
- [Google Cloud CDN](https://cloud.google.com/cdn/docs)
- [Azure CDN Documentation](https://docs.microsoft.com/en-us/azure/cdn/)
- [Netlify Docs](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)

---

## License

This deployment guide is provided under the same MIT License as the Philippines JSON Maps project.

---

**Last Updated**: 2025-10-16
