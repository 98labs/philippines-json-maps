# Philippine Maps - Deployment Distribution

This distribution contains all files ready for deployment to any web hosting or CDN platform.

## 📁 Contents

```
public/
├── index.html              # Main landing page
├── components/
│   └── philippines-map.js    # Web component (17KB)
├── demos/                  # Interactive demos
│   ├── country.html        # All 17 regions
│   ├── regions.html        # All 88 provinces
│   ├── provdists.html      # All 1,642 municipalities
│   ├── municities.html     # Barangays (dropdown selector)
│   ├── component-example.html
│   ├── component-labels-example.html
│   ├── provinces-data.js         # Province lookup data (7KB)
│   ├── municipalities-data.js    # Municipality lookup data (105KB)
│   └── README.md
└── 2023/                   # GeoJSON/TopoJSON data (489 MB)
    ├── provdists-all.0.001.json        # All provinces (620KB)
    ├── municities-all.0.001.json       # All municipalities (1.8MB)
    ├── geojson/
    │   ├── country/            # Country-level (17 regions)
    │   ├── regions/            # Regional data (17 files)
    │   ├── provdists/          # Provincial data (88 files)
    │   └── municities/         # Municipal data (1,642 files)
    └── topojson/               # TopoJSON format (mirror structure)
```

## 🚀 Quick Deployment

### Option 1: Static Hosting (Recommended)

Upload entire `public/` folder to any of these platforms:

**Free Options:**
- **Cloudflare Pages**: Unlimited bandwidth (FREE)
  ```bash
  # Connect GitHub repo and deploy
  ```

- **Netlify**: 100GB bandwidth/month (FREE)
  ```bash
  netlify deploy --prod --dir=.
  ```

- **Vercel**: 100GB bandwidth/month (FREE)
  ```bash
  vercel --prod
  ```

- **GitHub Pages**: Unlimited (FREE for public repos)
  - Push to GitHub
  - Enable Pages in Settings
  - Done!

**Paid Options:**
- **DigitalOcean Spaces**: $5/month (250GB + 1TB bandwidth)
- **AWS S3 + CloudFront**: ~$90/month
- **Google Cloud Storage + CDN**: ~$90/month
- **Azure Blob Storage + CDN**: ~$90/month

### Option 2: Direct Upload

For CDNs that support direct upload:

```bash
# AWS S3
aws s3 sync . s3://your-bucket/

# Google Cloud
gsutil -m cp -r . gs://your-bucket/

# Azure
az storage blob upload-batch --destination your-container --source .

# DigitalOcean Spaces (via s3cmd)
s3cmd put --recursive . s3://your-space/
```

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📊 Data Files

### File Sizes

| Category | Files | Size | Description |
|----------|-------|------|-------------|
| Demos | 13 | ~200 KB | HTML files with resolution selector |
| Components | 1 | 18 KB | Web component JS |
| Helper Data | 2 | 112 KB | Lookup tables |
| Combined Files (lowres) | 2 | 2.4 MB | All provinces & municipalities |
| Combined Files (medres) | 2 | 12.7 MB | All provinces & municipalities |
| Combined Files (hires) | 2 | 107 MB | All provinces & municipalities |
| GeoJSON (lowres) | 1,748 | ~50 MB | 0.1% simplified |
| GeoJSON (medres) | 1,748 | ~180 MB | 1% simplified |
| GeoJSON (hires) | 1,748 | ~259 MB | 10% simplified |
| **Total** | **~5,266** | **~611 MB** | All formats |

### Resolution Levels

- **lowres** (0.001): Smallest file size, fastest loading, good for overviews (default)
- **medres** (0.01): Balanced quality and performance
- **hires** (0.1): Highest quality, larger files

All demos include a **Resolution Selector** to switch between resolutions on-the-fly!

## 🌐 Access URLs

After deployment, your files will be accessible at:

```
https://yourdomain.com/                    # Landing page
https://yourdomain.com/demos/              # Demos index
https://yourdomain.com/demos/country.html  # Country level
https://yourdomain.com/2023/...            # Data files
```

## 🔧 Web Component Usage

Include in your HTML:

```html
<script src="components/philippines-map.js"></script>

<philippines-map
    level="1"
    title="Philippine Regions"
    value-name="Population"
    color-scheme="blue"
    resolution="low"
    height="600px">
</philippines-map>
```

**Resolution Options:**
- `resolution="low"` - Low resolution (default, fastest)
- `resolution="medium"` - Medium resolution (balanced)
- `resolution="high"` - High resolution (most detailed)

Load custom data:

```javascript
const map = document.querySelector('philippines-map');
map.setData({
    'PH01': 85.5,
    'PH02': 72.3,
    // ...
});
```

## 📝 Configuration

### CORS Headers (if needed)

Some CDNs require CORS configuration. Add these headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD
Access-Control-Max-Age: 3600
```

### Cache Headers (recommended)

```
# For versioned files (JSON, JS)
Cache-Control: public, max-age=31536000, immutable

# For HTML files
Cache-Control: public, max-age=3600
```

### Content-Type

Ensure proper MIME types:

```
.json → application/json
.js → application/javascript
.html → text/html
```

## 🔐 Security

### HTTPS Only

Always serve over HTTPS. Most modern platforms provide free SSL certificates.

### Content Security Policy

Recommended CSP header:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' https://unpkg.com;
               style-src 'self' 'unsafe-inline' https://unpkg.com;
               img-src 'self' https://*.tile.openstreetmap.org data:;">
```

## 📖 Documentation

- **User Guide**: `demos/README.md`
- **Developer Guide**: `../DEMO_GUIDE.md`
- **Deployment Guide**: `../DEPLOYMENT_GUIDE.md`
- **API Reference**: See DEMO_GUIDE.md

## 🎯 Performance Tips

1. **Use lowres files** for demos (already configured)
2. **Enable compression** (gzip/brotli) on your CDN
3. **Set long cache times** for JSON/JS files
4. **Use CDN edge locations** near your users
5. **Consider lazy loading** for large datasets

## 📊 Monitoring

After deployment, monitor:
- Bandwidth usage
- Response times
- Error rates (404s)
- Popular endpoints

Most CDNs provide built-in analytics.

## 🐛 Troubleshooting

**Issue**: CORS errors
- **Solution**: Add CORS headers to your CDN configuration

**Issue**: Files not loading
- **Solution**: Check MIME types and file paths

**Issue**: Slow loading
- **Solution**: Ensure compression is enabled, use lowres files

**Issue**: 404 errors
- **Solution**: Verify file paths are relative (`../2023/...`)

## 📄 License

MIT License - Free to use in your projects

## 🔗 Links

- **Source Repository**: https://github.com/faeldon/philippines-json-maps
- **Data Source**: UN OCHA (PSA/NAMRIA 2023 Q4)
- **Leaflet.js**: https://leafletjs.com/
- **OpenStreetMap**: https://www.openstreetmap.org/

## 📮 Support

For issues or questions:
1. Check the documentation files
2. Review existing GitHub issues
3. Create a new issue with details

---

**Last Updated**: 2025-10-16
**Distribution Version**: 1.0.0
