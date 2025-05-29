import axios from 'axios';

// Map country code to DataForSEO location code
const countryToLocationCode = {
  au: 2036, // Australia
  us: 2840, // United States
  uk: 2826, // United Kingdom
  ca: 2124, // Canada
  nz: 2276  // New Zealand
};

export default async function handler(req, res) {
  try {
    console.log('--- /api/keyword-data called ---');
    const { keyword, country } = req.query;
    if (!keyword) return res.status(400).json({ error: 'Keyword required' });

    const login = process.env.DATAFORSEO_LOGIN;
    const password = process.env.DATAFORSEO_PASSWORD;
    const location_code = countryToLocationCode[country] || 2840; // Default to US if not found

    const data = [
      {
        keywords: [keyword],
        language_name: "English",
        location_code
      }
    ];

    const response = await axios.post(
      'https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live',
      data,
      {
        auth: {
          username: login,
          password: password
        }
      }
    );

    // Log the full response for debugging
    console.log('DataForSEO raw response:', JSON.stringify(response.data, null, 2));

    // Defensive checks
    const tasks = response.data.tasks;
    if (!tasks || !tasks.length) {
      return res.status(404).json({ error: 'No tasks returned from DataForSEO' });
    }
    const results = tasks[0].result;
    if (!results || !results.length) {
      return res.status(404).json({ error: 'No results returned from DataForSEO' });
    }
    const keywords = results[0].keywords;
    if (!keywords || !keywords.length) {
      return res.status(404).json({ error: 'No keywords found for this query' });
    }

    // Normalize for exact match (trim and lowercase)
    const normalize = str => str.trim().toLowerCase();
    const exact = keywords.find(
      k => normalize(k.keyword) === normalize(keyword)
    );

    if (exact) {
      return res.status(200).json({
        keyword: exact.keyword,
        avg_monthly_searches: exact.search_volume,
        competition: exact.competition,
        cpc: exact.cpc,
        monthly_searches: exact.monthly_searches,
        exact_match: true
      });
    }

    // Fallback: return the closest related keyword (first in the list)
    const fallback = keywords[0];
    res.status(200).json({
      keyword: fallback.keyword,
      avg_monthly_searches: fallback.search_volume,
      competition: fallback.competition,
      cpc: fallback.cpc,
      monthly_searches: fallback.monthly_searches,
      exact_match: false
    });
  } catch (err) {
    console.error('DataForSEO API error:', err.response?.data || err.message || err);
    res.status(500).json({ error: err.response?.data?.status_message || err.message });
  }
}