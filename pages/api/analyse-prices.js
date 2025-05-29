export default async function handler(req, res) {
    const query = req.query.q;
    const country = req.query.country || 'au';
    const apiKey = "c9d956f0b8865c7deccc2a0f0a9afe07726efa8e22bb51d9f63be8bdbc4662fc";
  
    if (!query) {
      return res.status(400).json({ error: "Missing search query" });
    }

    const countrySettings = {
      au: { gl: 'au', domain: 'google.com.au', currency: 'AUD' },
      us: { gl: 'us', domain: 'google.com', currency: 'USD' },
      uk: { gl: 'uk', domain: 'google.co.uk', currency: 'GBP' },
      ca: { gl: 'ca', domain: 'google.ca', currency: 'CAD' },
      nz: { gl: 'nz', domain: 'google.co.nz', currency: 'NZD' }
    };

    const settings = countrySettings[country] || countrySettings.au;
  
    const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&api_key=${apiKey}&hl=en&gl=${settings.gl}&google_domain=${settings.domain}&num=40`;
  
    try {
      const response = await fetch(serpUrl);
      const data = await response.json();
  
      const items = data.shopping_results?.slice(0, 40) || [];
  
      const prices = items
        .map(item => parseFloat(item.price.replace(/[^0-9.]/g, '')))
        .filter(price => !isNaN(price))
        .sort((a, b) => a - b);
  
      if (prices.length === 0) {
        return res.status(404).json({ error: "No valid prices found." });
      }
  
      const median =
        prices.length % 2 === 0
          ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
          : prices[Math.floor(prices.length / 2)];
  
      const topSix = items
        .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
        .slice(0, 6)
        .map(item => ({
        title: item.title,
        price: item.price,
        link: item.link,
        source: item.source,
        thumbnail: item.thumbnail,
        rating: item.rating || null,
        reviews: item.reviews || null
      }));
  
      res.status(200).json({
        min: Math.min(...prices),
        max: Math.max(...prices),
        median,
        topSix,
        prices,
        currency: settings.currency
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch data", detail: err.message });
    }
  }
  