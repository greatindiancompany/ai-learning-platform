# AI Blog Generator for inspir

Production-ready AI-powered blog post generation system using Claude Sonnet 4.5 to create high-quality, SEO-optimized educational content.

## Overview

This system generates 42 comprehensive blog posts (1,500-2,000 words each) to bring inspir's total from 58 to 100 published posts. All content is:
- AI-generated using Claude Sonnet 4.5
- SEO-optimized with metadata
- Quality-scored and validated
- Published directly to Supabase

**Estimated Cost:** $3-8
**Estimated Time:** 4-5 hours

## Prerequisites

1. **Anthropic API Key** with credits ($10+ recommended)
   - Located in `/root/inspir/backend/.env` as `ANTHROPIC_API_KEY`

2. **Supabase Credentials** (already configured)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Node.js** (v18+) and npm installed

## Quick Start

```bash
# 1. Navigate to the directory
cd /root/inspir/scripts/ai-blog-generator

# 2. Install dependencies (already done)
npm install

# 3. Generate 42 topic ideas
npm run topics

# 4. Generate blog post content (3-4 hours)
npm run generate

# 5. Publish to Supabase
npm run publish

# Or run all steps in sequence
npm run all
```

## Scripts

### 1. `npm run topics` - Topic Generation

Generates 60 topic ideas using Claude API, then selects the best 42 based on:
- Category distribution (12 study skills, 10 tool guides, 8 exam prep, etc.)
- Deduplication against existing 58 posts
- SEO value and search intent

**Output:** `config/topics.json` (42 topics with full metadata)

**Cost:** ~$0.15

**Time:** ~1 minute

### 2. `npm run generate` - Content Generation

Generates full blog post content for all 42 topics:
- Calls Claude API for each topic
- Generates 1,500-2,000 word articles
- Creates SEO metadata (title, description, keywords)
- Validates content quality (multi-stage validation)
- Scores each post (0-100)
- Saves checkpoints every 5 posts

**Output:**
- `output/generated-posts/post-001.json` through `post-042.json`
- `output/checkpoints/` - Resume points
- `output/reports/generation-report.json` - Detailed stats

**Cost:** ~$2.50-$5.00

**Time:** 3-4 hours (2-second delay between API calls)

### 3. `npm run publish` - Publication

Publishes qualified posts (score 70+) to Supabase:
- Final validation check
- Author/category assignment
- Database insertion
- Verifies no duplicate slugs

**Output:**
- Posts inserted into `seo_blog_posts` table
- `output/reports/publication-report.json`

**Cost:** Free (no API calls)

**Time:** ~1 minute

## Directory Structure

```
ai-blog-generator/
├── config/
│   ├── topics.json          # Generated topics (42)
│   ├── prompts.js           # System and user prompt templates
│   └── categories.js        # Category/author mappings
├── lib/
│   ├── anthropic-client.js  # Claude API wrapper with retry
│   ├── supabase-client.js   # Database operations
│   ├── seo-generator.js     # Metadata generation
│   ├── validator.js         # Content validation
│   └── utils.js             # Helper functions
├── output/
│   ├── generated-posts/     # Generated blog posts (JSON)
│   ├── checkpoints/         # Progress saves
│   └── reports/             # Generation & publication reports
├── generate-topics.js       # Step 1 script
├── generate-blog-posts.js   # Step 2 script (main)
├── validate-and-publish.js  # Step 3 script
├── package.json
└── README.md
```

## Configuration

### Category Distribution

Configured in `config/categories.js`:

| Category | Posts | Author |
|----------|-------|--------|
| Study Skills & Techniques | 12 | Dr. Sarah Chen |
| Tool Guides & Tutorials | 10 | James Wright |
| Exam Prep & Test-Taking | 8 | Emily Parker |
| Subject-Specific Help | 5 | Dr. Sarah Chen |
| Productivity & Motivation | 4 | James Wright |
| Time Management | 3 | James Wright |

### Quality Thresholds

Posts are scored 0-100 based on:
- Content length (20 pts)
- Structure completeness (15 pts)
- SEO optimization (20 pts)
- Internal links (15 pts)
- Readability (15 pts)
- No placeholder text (15 pts)

**Publishing Threshold:** 70+ (Acceptable or higher)

### Rate Limiting

- 2-second delay between API requests
- Exponential backoff on 429 errors
- Budget limit: $10 (hard stop)
- Budget alert at 80% ($8)

## Validation Pipeline

Each post goes through 4 validation stages:

### Stage 1: Generation-Time Checks
- Response received and valid
- Minimum 1,400 words
- Has H1 title
- Has 3+ H2 sections
- Valid markdown syntax

### Stage 2: Content Quality
- Word count: 1,500-2,000 (strict)
- Readability: Appropriate grade level
- Internal links: 2+ links
- No placeholder text
- Proper heading structure (1 H1, 5+ H2)

### Stage 3: SEO Validation
- SEO title: 50-60 characters
- Meta description: 150-160 characters
- Keywords: 5-10 keywords
- Primary keyword in title
- URL-safe slug

### Stage 4: Database Validation
- Slug uniqueness
- Author ID exists
- Category ID exists
- Field length constraints

## Monitoring Progress

### During Generation

Watch for:
- `✅ Success (score: 92/100)` - Post passed validation
- `⚠️  Low quality (score: 68/100)` - Post needs review
- `❌ Error: ...` - Generation failed (will retry)

### Checkpoints

Saved every 5 posts to `output/checkpoints/`:
- Resume capability if process interrupted
- Cost tracking
- Success/failure counts

### Reports

**Generation Report** (`output/reports/generation-report.json`):
- Total successful/failed posts
- Average quality score
- Quality breakdown (excellent/good/acceptable)
- Total cost and duration
- Failed post details

**Publication Report** (`output/reports/publication-report.json`):
- Posts published
- Posts failed (with errors)
- Posts skipped (duplicate slugs)
- Before/after database counts

## Troubleshooting

### "Topics file not found"
Run `npm run topics` first to generate topics.

### "Missing Anthropic API key"
Check `/root/inspir/backend/.env` has `ANTHROPIC_API_KEY` set.

### "Category not found"
Verify category names in `topics.json` match exactly with database.

### "Slug already exists"
Post will be skipped. This is expected if re-running publication.

### "Budget exceeded"
Generation stops at $10 limit. Increase `CONFIG.budgetLimit` in `anthropic-client.js` if needed.

### Low quality scores
- Check prompt templates in `config/prompts.js`
- Verify topics have clear structure
- May need to adjust temperature or max_tokens

## Cost Breakdown

| Item | Cost |
|------|------|
| Topic generation (60 topics) | $0.15 |
| Content generation (42 posts) | $2.48 |
| Retries (estimated 3 posts) | $0.18 |
| Metadata generation | $0.30 |
| **Total** | **$3.11 - $5.00** |

## Success Metrics

### Immediate (Day 1)
- ✅ 42 posts generated successfully
- ✅ 90%+ pass quality threshold (36+ posts)
- ✅ Total cost under $10
- ✅ 100 total posts live on inspir.uk

### Short-Term (Week 1)
- All 42 posts indexed by Google
- Average quality score: 85+
- Zero database errors

### Medium-Term (Month 1)
- 20+ posts on page 1 for target keywords
- 50% increase in organic blog traffic
- 25% increase in tool page visits from blog

## Advanced Usage

### Resume from Checkpoint

If generation is interrupted, restart and it will continue:
```bash
npm run generate
```

### Regenerate Specific Topics

Edit `config/topics.json` to include only desired topics, then:
```bash
npm run generate
```

### Adjust Quality Threshold

Edit `validate-and-publish.js`:
```javascript
const MIN_QUALITY_SCORE = 70; // Change to 60, 80, etc.
```

### Preview Generated Content

Generated posts are saved as JSON in `output/generated-posts/`. You can review before publishing:
```bash
cat output/generated-posts/post-001.json | jq '.content'
```

## Support

For issues or questions:
1. Check this README
2. Review error messages in terminal
3. Check reports in `output/reports/`
4. Verify environment variables in `/root/inspir/backend/.env`

## License

MIT - Part of the inspir project
