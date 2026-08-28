import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let profileUrl = searchParams.get('url');

  if (!profileUrl) {
    return NextResponse.json({ error: 'Profile URL is required' }, { status: 400 });
  }

  // Ensure it's a valid mobile URL or desktop URL
  if (profileUrl.includes('linkedin.com/mwlite/')) {
      // It's already fine, but usually people provide the desktop url
  }

  try {
    const cookie = process.env.LINKEDIN_COOKIE;
    const csrfToken = process.env.LINKEDIN_CSRF_TOKEN;

    if (!cookie) {
      return NextResponse.json({ error: 'LinkedIn authentication not configured. Please set LINKEDIN_COOKIE in .env' }, { status: 500 });
    }

    const headers: Record<string, string> = {
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
      return NextResponse.json({ error: `Failed to fetch profile: ${response.status} ${response.statusText}` }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Basic Extraction
    const name = $('h1.text-color-text.heading-large').text().trim();
    
    // Profile Picture
    let profilePicture = $('#profile-picture-container img').attr('data-delayed-url') || 
                         $('#profile-picture-container img').attr('src') || 
                         $('.artdeco-entity-image').attr('data-delayed-url') || '';
    
    // Headline is usually in the next div
    const headline = $('h1').parent().next('.body-small.text-color-text').text().trim() || 
                     $('.basic-profile-section .body-small.text-color-text').first().text().trim();
    
    // Location
    let location = '';
    $('.basic-profile-section .body-small.text-color-text-low-emphasis').each((_, el) => {
        const text = $(el).text();
        if (text && text.includes('connections') && !location) {
             // Example format: "Ahmedabad, Gujarat, India \n 500+ connections"
             location = text.split('connections')[0].replace(/\s*[0-9+]+\s*$/, '').replace(/\n/g, '').replace(/·/g, '').trim();
        }
    });
    // Fallback if location not found
    if (!location) {
        location = $('.basic-profile-section .body-small.text-color-text-low-emphasis').first().text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    // About
    const about = $('.about-section .description').text().trim();

    // Lists
    const experience: any[] = [];
    $('.experience-container > ol > li.profile-entity-lockup').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        experience.push(text);
    });

    const education: any[] = [];
    $('.education-container > ol > li.profile-entity-lockup').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        education.push(text);
    });

    const skills: any[] = [];
    // Skills might be in a generic collapsible-list-container, but let's check for "Skills" h2
    $('.collapsible-list-container').each((_, sectionEl) => {
        const title = $(sectionEl).find('h2').first().text().trim();
        if (title.toLowerCase().includes('skills')) {
            $(sectionEl).find('ol > li.profile-entity-lockup').each((_, el) => {
                const text = $(el).text().replace(/\s+/g, ' ').trim();
                skills.push(text);
            });
        }
    });

    return NextResponse.json({
      success: true,
      data: {
        profileUrl,
        name,
        profilePicture,
        headline,
        location,
        about,
        experience,
        education,
        skills
      }
    });

  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
