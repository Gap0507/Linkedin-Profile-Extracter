# LinkedIn Profile Extractor

A robust, reverse-engineered LinkedIn profile scraper built with Next.js. This application directly queries LinkedIn's servers and extracts comprehensive profile data without using heavy headless browsers 

🔗 **[Watch the Video Here](https://drive.google.com/file/d/1LYga5eRa-CvBBtWtCpnzSnZErpjF037G/view?usp=sharing)**

---

## 🚀 Features

- **Pure HTTP Reverse-Engineering**: Hits LinkedIn endpoints directly using `fetch` with authenticated cookies, resulting in incredibly fast scraping compared to browser-based automation.
- **Image Proxy**: Bypasses LinkedIn CDN's hotlinking (CORS/403) protections by proxying image requests through the backend.
- **Rich Data Extraction**: Extracts Name, Headline, Location, About, Experience, Education, Skills, Accomplishments (Projects, Honors, Languages), Recommendations, Contacts, and Recent Activity.
- **Modern UI**: A sleek, dark-mode animated interface with glassmorphism effects.

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- A valid LinkedIn account to obtain a session cookie.

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Linkedin-Profile-Extracter/web
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root of the `web` directory and add your LinkedIn session cookie. 

To get your cookie:
1. Log into LinkedIn on your browser.
2. Open Developer Tools (F12) -> Application tab -> Cookies.
3. Copy the value of the `li_at` cookie.

```env
# .env
LINKEDIN_COOKIE="li_at=YOUR_COOKIE_VALUE_HERE;"
```
*(Note: Do not commit your `.env` file to version control. It is already included in `.gitignore`)*

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 📖 API Documentation

### Endpoint
`GET /api/profile?url={linkedin_profile_url}`

### Parameters
| Name | Type   | Required | Description |
|------|--------|----------|-------------|
| url  | string | Yes      | The full URL of the LinkedIn profile you want to extract. |

### Example Request
```bash
curl "http://localhost:3000/api/profile?url=https://www.linkedin.com/in/williamhgates/"
```

### Example JSON Response Schema

The API returns a highly structured JSON object representing the parsed profile.

```json
{
  "success": true,
  "data": {
    "profileUrl": "https://www.linkedin.com/in/username/",
    "name": "John Doe",
    "profilePicture": "https://media.licdn.com/dms/image/v2/...",
    "headline": "Software Engineer at TechCorp",
    "location": "San Francisco Bay Area",
    "about": "Passionate developer with 10 years of experience...",
    "experience": [
      {
        "title": "Senior Engineer",
        "subtitle": "TechCorp",
        "metadata": ["Jan 2020 - Present", "San Francisco, CA"],
        "description": "Led the backend team in developing scalable microservices...",
        "logoUrl": "https://media.licdn.com/dms/image/v2/..."
      }
    ],
    "education": [
      {
        "title": "University of California, Berkeley",
        "subtitle": "Bachelor of Science in Computer Science",
        "metadata": ["2015 - 2019"],
        "description": "Graduated with Honors.",
        "logoUrl": "https://media.licdn.com/dms/image/v2/..."
      }
    ],
    "skills": [
      "JavaScript",
      "React.js",
      "Node.js"
    ],
    "accomplishments": [
      {
        "category": "Projects",
        "items": ["E-commerce Platform Architecture", "AI Chatbot Implementation"]
      },
      {
        "category": "Languages",
        "items": ["English", "Spanish"]
      }
    ],
    "recommendations": [
      "John is a fantastic engineer who always delivers on time. - Jane Smith, CTO"
    ],
    "contacts": [
      "Email: john.doe@example.com",
      "https://github.com/johndoe"
    ]
  }
}
```

---

## 🧠 Approach & Architecture

1. **Direct HTTP Fetching**: Rather than spinning up a resource-heavy headless browser, this application uses standard Node.js `fetch` requests with specific headers (including the `li_at` cookie and a mobile User-Agent). This tricks LinkedIn into serving the mobile HTML version of the profile, which is much simpler and faster to parse.
2. **DOM Parsing**: The raw HTML response is fed into `cheerio`, a fast server-side jQuery implementation. The API iterates over semantic `<section>` and `<li>` tags to extract titles, subtitles, metadata (dates/locations), descriptions, and logos.
3. **Image Proxying (`/api/image`)**: LinkedIn actively blocks image hotlinking via CORS and Referrer checks. To bypass this, the frontend never requests images directly from LinkedIn. Instead, it asks our own `/api/image` route to fetch the image buffer server-side and pipe it back to the client as an `image/jpeg` blob.

---

## ⚠️ Known Limitations

1. **Session Expiry**: The `li_at` authentication cookie used to scrape profiles will eventually expire (usually after a few months) or be invalidated if you log out of LinkedIn. The cookie will need to be manually updated in the `.env` file when this happens.
2. **Rate Limiting**: Because this scraper uses a real user's session cookie, excessively aggressive scraping (e.g., hundreds of profiles per minute) may trigger LinkedIn's anti-bot detection, which could result in rate-limiting or temporary suspension of the account whose cookie is being used.
3. **DOM Volatility**: The scraper relies on specific HTML classes and structures (e.g., `h2` text matching and `.list-item-heading`). If LinkedIn changes their DOM structure, the extraction logic in `cheerio` will need to be updated.
4. **Network Restrictions**: Some contact information (like exact email addresses) is hidden by LinkedIn depending on your connection degree with the target profile. The scraper can only extract what is visible to the account that owns the cookie.
