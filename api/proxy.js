export default async function handler(req, res) {
  // Enhanced logging for debugging
  console.log("Proxy handler called");
  console.log("Request headers:", JSON.stringify(req.headers));
  console.log("Request query:", JSON.stringify(req.query));
  console.log("Environment variables:", {
    NODE_ENV: process.env.NODE_ENV,
    FOOTBALL_API_KEY_EXISTS: !!process.env.FOOTBALL_API_KEY,
    VITE_API_KEY_EXISTS: !!process.env.VITE_API_KEY
  });
  
  // Set CORS headers to allow requests from your domain
  const origin = req.headers.origin;
  console.log(`Request origin: ${origin || 'none'}`);
  
  // Always set CORS headers in production to ensure they're applied
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return res.status(200).end();
  }
  
  // Extract path from query parameters
  let path = req.query.path || '';
  console.log(`Raw path parameter: ${path}`);
  
  // Remove any leading slashes to avoid double slashes in the URL
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  console.log(`Normalized path: ${path}`);
  
  // Forward the request to the football-data.org API
  // Try multiple possible environment variable names
  const apiKey = process.env.FOOTBALL_API_KEY || process.env.VITE_API_KEY || '8a95ce980f7549e0813011d8a66b519e';
  const url = `https://api.football-data.org/v4/${path}`;
  
  console.log(`Proxying request to: ${url}`);
  console.log(`API Key available: ${apiKey ? 'Yes' : 'No'}`);
  
  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'X-Auth-Token': apiKey,
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    
    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API returned ${response.status}: ${errorText}`);
      return res.status(response.status).json({ 
        error: `Football API error: ${response.statusText}`,
        details: errorText
      });
    }
    
    const data = await response.json();
    
    // Return the API response
    res.status(response.status).json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch data from the API', message: error.message });
  }
}
