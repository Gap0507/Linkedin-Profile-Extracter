
require('dotenv').config();
const cheerio = require('cheerio');

async function test() {
  try {
    const profileUrl = "https://www.linkedin.com/in/garv-shah-341294244/";
    const cookie = process.env.LINKEDIN_COOKIE;
    const csrfToken = process.env.LINKEDIN_CSRF_TOKEN;

    const headers = {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.6',
      'cookie': cookie,
      'priority': 'u=0, i',
      'sec-ch-ua': '"Not=A?Brand";v="99", "Brave";v="151", "Chromium";v="151"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'sec-gpc': '1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'
    };

    const response = await fetch(profileUrl, { headers });

    if (!response.ok) {
      console.error(`Failed: ${response.status}`);
      return;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const experience = [];
    $('.experience-container > ol > li.profile-entity-lockup').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      experience.push(text);
    });

    const education = [];
    $('.education-container > ol > li.profile-entity-lockup').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      education.push(text);
    });

    const skills = [];
    $('.collapsible-list-container').each((_, sectionEl) => {
      const title = $(sectionEl).find('h2').first().text().trim();
      if (title.toLowerCase().includes('skills')) {
        $(sectionEl).find('ol > li.profile-entity-lockup').each((_, el) => {
          const text = $(el).text().replace(/\s+/g, ' ').trim();
          skills.push(text);
        });
      }
    });

    console.log(JSON.stringify({ experience, education, skills }, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
