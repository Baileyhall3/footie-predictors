export default async function handler(req, res) {
  // Set CORS headers to allow requests from your domain
  const origin = req.headers.origin;
  if (origin && (origin.includes('footiepredictors.com') || process.env.NODE_ENV !== 'production')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { path } = req.query;
  
  // Forward the request to the football-data.org API
  const apiKey = process.env.FOOTBALL_API_KEY;
  const url = `https://api.football-data.org/v4/${path || ''}`;
  
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
