# UserPulse.AI - Competitive Intelligence

> Scan Reddit. Hear what users say about your competitors.

A full-stack web application that provides competitive intelligence by analyzing Reddit discussions about your product and competitors using AI.

## Features

- **Single-step Input**: Enter your product and up to 3 competitors
- **Reddit Mining**: Scans 52+ AI/ML/product subreddits for discussions
- **AI Analysis**: Uses GPT-5 to analyze sentiment, features, and pain points
- **Live Processing**: Watch the "Agent Brain" process data in real-time
- **Detailed Reports**: Get evidence-linked insights with direct Reddit permalinks
- **Export Options**: Download as Markdown or CSV
- **Report History**: Save and access previous analyses locally

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Material UI v5 (Material 3 design)
- **Backend**: Next.js API Routes, Node.js
- **AI**: OpenAI GPT-5/GPT-4o for analysis and report generation
- **Data Source**: Reddit API via `snoowrap`
- **Styling**: Material UI with custom Material 3 theme, Framer Motion
- **Deployment**: Vercel-ready configuration

## Setup

### Prerequisites

- Node.js 18.17.0 or higher
- Reddit API credentials
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd competitor-insight
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Add your API credentials to `.env.local`:
```env
# Reddit API
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5-nano-2025-08-07

# Configuration
DEFAULT_MIN_SCORE_REDDIT=0
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `REDDIT_CLIENT_ID` | Reddit app client ID | Yes |
| `REDDIT_CLIENT_SECRET` | Reddit app client secret | Yes |
| `REDDIT_USERNAME` | Reddit username | Yes |
| `REDDIT_PASSWORD` | Reddit password | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `OPENAI_MODEL` | OpenAI model (gpt-5-nano-2025-08-07 recommended; also supports gpt-4o) | No |
| `DEFAULT_MIN_SCORE_REDDIT` | Minimum Reddit post score (default: 0) | No |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Usage

1. **Enter Product Info**: Add your product name and up to 3 competitors
2. **Start Analysis**: Click "Run Analysis" to begin
3. **Watch Processing**: Monitor the "Agent Brain" for live updates
4. **Review Report**: Get detailed insights with Reddit evidence links
5. **Export Results**: Download as Markdown or CSV format

## Report Structure

The generated report includes:

- **Your Product Analysis**: What users are saying about your product
- **Competitor Analysis**: For each competitor:
  - 🚀 New Updates (launches, releases)
  - 💚 What Users Love (positive feedback)
  - ⚠️ What Users Dislike (pain points, complaints)
- **💡 Strategic Takeaways**: First-person recommendations for founders

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions, please create a GitHub issue or contact the development team.# Deployment trigger Mon Aug 18 14:03:33 EDT 2025
