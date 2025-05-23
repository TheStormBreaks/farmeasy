
'use server';

// No new dependencies, use built-in fetch and regex for simplicity.

interface PdfInfo {
  url: string;
  text: string; // Text of the link
}

export async function fetchLatestWeatherPdfUrls(): Promise<PdfInfo[]> {
  const targetUrl = 'https://patna.kvk4.in/weather.php';
  const extractedPdfs: PdfInfo[] = [];

  try {
    const response = await fetch(targetUrl, { cache: 'no-store' }); // Ensure fresh fetch
    if (!response.ok) {
      console.error(`Failed to fetch ${targetUrl}: ${response.statusText}`);
      return [];
    }

    const htmlContent = await response.text();

    // Regex to find <a> tags linking to .pdf files
    const pdfLinkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])([^"']*\.pdf)\1[^>]*>(.*?)<\/a>/gi;
    let match;

    while ((match = pdfLinkRegex.exec(htmlContent)) !== null) {
      let pdfUrl = match[2];
      const linkText = match[3].replace(/<[^>]+>/g, '').trim(); // Strip HTML from link text

      // Ensure the URL is absolute
      if (!pdfUrl.startsWith('http')) {
        try {
            const base = new URL(targetUrl);
            // Handle cases where pdfUrl might already be a full path from domain root
            if (pdfUrl.startsWith('/')) {
                 pdfUrl = new URL(pdfUrl, base.origin).href;
            } else {
                 // Assumes pdfUrl is relative to the current path of targetUrl
                 pdfUrl = new URL(pdfUrl, base.origin + base.pathname.substring(0, base.pathname.lastIndexOf('/') + 1)).href;
            }
        } catch(e) {
            console.error("Error constructing absolute URL for:", match[2], e);
            continue; // Skip this URL if it cannot be resolved
        }
      }
      
      // Avoid duplicates and ensure some link text
      if (linkText && !extractedPdfs.some(pdf => pdf.url === pdfUrl)) {
        extractedPdfs.push({ url: pdfUrl, text: linkText });
      }
    }
    
    // Prioritize links containing relevant keywords
    const preferredKeywords = ["agromet", "advisory", "bulletin", "मौसम", "कृषि सलाह", "weather", "forecast"];
    extractedPdfs.sort((a, b) => {
        const aTextLower = a.text.toLowerCase();
        const bTextLower = b.text.toLowerCase();
        const aScore = preferredKeywords.reduce((score, keyword) => score + (aTextLower.includes(keyword.toLowerCase()) ? 1 : 0), 0);
        const bScore = preferredKeywords.reduce((score, keyword) => score + (bTextLower.includes(keyword.toLowerCase()) ? 1 : 0), 0);
        
        // If scores are equal, prefer shorter link texts (often more direct) or newer dates if parsable (complex)
        if (aScore === bScore) {
            return a.text.length - b.text.length;
        }
        return bScore - aScore; // Higher score first
    });

  } catch (error) {
    console.error('Error fetching or parsing weather PDFs:', error);
    return []; // Return empty on error
  }
  
  return extractedPdfs;
}
