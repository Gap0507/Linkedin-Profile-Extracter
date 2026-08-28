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
    
    // Profile Picture (Targeting the specific container to avoid navbar logged-in user image)
    let profilePicture = $('#profile-picture-container img').attr('data-delayed-url') || 
                         $('#profile-picture-container img').attr('src') || '';
    
    // Fallback if the container isn't found: look for an image whose alt text contains the user's name
    if (!profilePicture) {
        $('img').each((_, el) => {
            const src = $(el).attr('src') || $(el).attr('data-delayed-url') || '';
            const alt = $(el).attr('alt') || '';
            if (src.includes('profile-displayphoto') && alt.toLowerCase().includes(name.toLowerCase())) {
                profilePicture = src;
            }
        });
    }

    // Fix HTML entity encoding in the URL (&amp; to &)
    if (profilePicture) {
        profilePicture = profilePicture.replace(/&amp;/g, '&');
    }
    
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

    const cleanText = (str: string) => {
        if (!str) return '';
        return str.replace(/\s+/g, ' ').replace(/…more|See less/g, '').trim();
    };

    const experience: any[] = [];
    const education: any[] = [];
    const skills: string[] = [];
    const accomplishments: any[] = [];
    const recommendations: string[] = [];
    const contacts: string[] = [];
    let recentPost: any = null;

    $('section').each((_, sec) => {
        const h2 = $(sec).find('h2').text().trim().toLowerCase();
        
        if (h2 === 'experience') {
            $(sec).find('li').each((_, el) => {
                const $el = $(el);
                let logoUrl = $el.find('img').attr('data-delayed-url') || $el.find('img').attr('src') || '';
                if (logoUrl) logoUrl = logoUrl.replace(/&amp;/g, '&');
                
                const title = cleanText($el.find('.list-item-heading').text()) || cleanText($el.find('.body-medium-bold').first().text());
                
                let subtitle = '';
                const $headingDiv = $el.find('.list-item-heading').length ? $el.find('.list-item-heading') : $el.find('.body-medium-bold').first();
                if ($headingDiv.length) {
                    subtitle = cleanText($headingDiv.next('.body-small').text());
                }
            
                let metadata: string[] = [];
                $el.find('.text-color-text-low-emphasis').each((i, metaEl) => {
                    const mText = cleanText($(metaEl).text());
                    if (mText) metadata.push(mText);
                });
            
                const description = cleanText($el.find('.body-small.text-color-text').text());
            
                if (title || subtitle) {
                    // Deduplicate
                    if (!experience.find(e => e.title === title && e.subtitle === subtitle)) {
                        experience.push({ title, subtitle, metadata, description, logoUrl });
                    }
                }
            });
        } else if (h2 === 'education') {
            $(sec).find('li').each((_, el) => {
                const $el = $(el);
                let logoUrl = $el.find('img').attr('data-delayed-url') || $el.find('img').attr('src') || '';
                if (logoUrl) logoUrl = logoUrl.replace(/&amp;/g, '&');
                
                const title = cleanText($el.find('.list-item-heading').text()) || cleanText($el.find('.body-medium-bold').first().text());
                
                let subtitle = '';
                const $headingDiv = $el.find('.list-item-heading').length ? $el.find('.list-item-heading') : $el.find('.body-medium-bold').first();
                if ($headingDiv.length) {
                    subtitle = cleanText($headingDiv.next('.body-small').text());
                }
            
                let metadata: string[] = [];
                $el.find('.text-color-text-low-emphasis').each((i, metaEl) => {
                    const mText = cleanText($(metaEl).text());
                    if (mText) metadata.push(mText);
                });
            
                const description = cleanText($el.find('.body-small.text-color-text').text());
            
                if (title || subtitle) {
                    // Deduplicate
                    if (!education.find(e => e.title === title && e.subtitle === subtitle)) {
                        education.push({ title, subtitle, metadata, description, logoUrl });
                    }
                }
            });
        } else if (h2 === 'skills') {
            $(sec).find('li').each((_, el) => {
                let text = cleanText($(el).find('span[dir="ltr"]').text()) || cleanText($(el).text());
                if (text) {
                    // Clean up dot separators
                    text = text.replace(/·/g, '').replace(/•/g, '').trim();
                    if (text && !skills.includes(text)) {
                        skills.push(text);
                    }
                }
            });
        } else if (h2 === 'accomplishments') {
            $(sec).find('.accomplishment-category').each((_, cat) => {
                const categoryTitle = cleanText($(cat).find('.category-title').text()) || cleanText($(cat).find('h3').text());
                const items: string[] = [];
                $(cat).find('li').each((_, li) => {
                    items.push(cleanText($(li).text()));
                });
                accomplishments.push({ category: categoryTitle, items });
            });
            if (accomplishments.length === 0) {
                $(sec).find('li').each((_, el) => {
                    const text = cleanText($(el).text());
                    if (text && !accomplishments.includes(text)) accomplishments.push(text);
                });
            }
        } else if (h2 === 'recommendations') {
            $(sec).find('li').each((_, el) => {
                const text = cleanText($(el).text());
                if (text && !recommendations.includes(text)) recommendations.push(text);
            });
        } else if (h2 === 'contact') {
            $(sec).find('li').each((_, el) => {
                const value = cleanText($(el).text());
                if (value && !contacts.includes(value)) contacts.push(value);
            });
        } else if (h2 === 'activity') {
            const $post = $(sec).find('article').first();
            if ($post.length) {
                const caption = cleanText($post.find('.feed-shared-update-v2__description').text()) || cleanText($post.find('p').first().text());
                let picture = $post.find('img').attr('data-delayed-url') || $post.find('img').attr('src') || '';
                if (picture) picture = picture.replace(/&amp;/g, '&');
                if (caption || picture) {
                    recentPost = { caption, picture };
                }
            }
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
        skills,
        accomplishments,
        recommendations,
        contacts,
        recentPost
      }
    });

  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
