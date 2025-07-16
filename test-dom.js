import axios from 'axios';
import * as cheerio from 'cheerio';

async function testDOMExtraction() {
  try {
    console.log('Testing DOM extraction for smartfiche.com...');
    
    const response = await axios.get('https://smartfiche.com', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DLMETRIX/1.0)'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Content length:', response.data.length);
    
    const $ = cheerio.load(response.data);
    
    // Test H1 extraction
    const h1Elements = $('h1');
    console.log('H1 count:', h1Elements.length);
    console.log('H1 text:', h1Elements.first().text().trim());
    
    // Test other elements
    console.log('Title:', $('title').text().trim());
    console.log('Meta description:', $('meta[name="description"]').attr('content') || 'Not found');
    console.log('H2 count:', $('h2').length);
    console.log('H3 count:', $('h3').length);
    
    // Test headings structure
    const headings = {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: []
    };
    
    $('h1, h2, h3, h4, h5, h6').each((_, elem) => {
      const tag = elem.name.toLowerCase();
      const text = $(elem).text().trim();
      if (text && headings[tag]) {
        headings[tag].push(text);
      }
    });
    
    console.log('Extracted headings:', JSON.stringify(headings, null, 2));
    
    if (headings.h1.length > 0) {
      console.log('✅ DOM extraction working correctly');
    } else {
      console.log('❌ H1 extraction failed');
    }
    
  } catch (error) {
    console.error('❌ DOM extraction failed:', error.message);
  }
}

testDOMExtraction();