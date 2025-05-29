import { useState, useEffect } from 'react';
import PriceCurveChart from '../components/PriceCurveChart';

export default function Home() {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('au');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [keywordData, setKeywordData] = useState(null);
  const [keywordError, setKeywordError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setData(null);
    setKeywordData(null);
    setKeywordError('');

    try {
      const res = await fetch(`/api/analyse-prices?q=${encodeURIComponent(query)}&country=${country}`);
      const json = await res.json();
      if (json.error) setError(json.error);
      else setData(json);

      const keywordRes = await fetch(`/api/keyword-data?keyword=${encodeURIComponent(query)}&country=${country}`);
      const keywordJson = await keywordRes.json();
      if (keywordJson.error) setKeywordError(keywordJson.error);
      else setKeywordData(keywordJson);
    } catch {
      setError('Something went wrong');
    }
  };

  const countries = [
    { code: 'au', name: 'Australia', flag: '🇦🇺' },
    { code: 'us', name: 'United States', flag: '🇺🇸' },
    { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'ca', name: 'Canada', flag: '🇨🇦' },
    { code: 'nz', name: 'New Zealand', flag: '🇳🇿' }
  ];

  const selectedCountry = countries.find(c => c.code === country);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.backgroundColor = 'transparent';
    document.body.style.margin = 0;
    document.body.style.fontFamily = "'DM Sans', sans-serif";
  }, []);

  const product = query.trim();
  const possessive = product.endsWith('s') ? `${product}’` : `${product}’s`;

  const currencySymbols = {
    AUD: 'A$',
    USD: '$',
    GBP: '£',
    CAD: 'C$',
    NZD: 'NZ$'
  };

  const formatPrice = (amount, currency) => {
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#fff', background: 'transparent' }}>
      <div style={{
        display: 'flex',
        gap: '2.5rem',
        alignItems: 'flex-start',
        background: '#0A1E08',
        borderRadius: '16px',
        padding: '2rem 2rem 1.5rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        width: '100%'
      }}>
        {/* Left Column: Title, Search, Insights, Chart */}
        <div style={{ flex: '0 1 800px', minHeight: '100%' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Product Price Snapshot
          </h1>

          <form onSubmit={handleSearch} style={{ display: 'flex', maxWidth: '640px', marginBottom: '2rem' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. dog bed"
              required
              style={{
                flex: 1,
                padding: '0.85rem 1rem',
                fontSize: '16px',
                borderRadius: '8px 0 0 8px',
                border: '1px solid #1F4A1B',
                borderRight: 'none',
                background: 'transparent',
                color: '#fff',
                fontWeight: 500,
                outline: 'none'
              }}
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{
                padding: '0.85rem 1rem',
                fontSize: '16px',
                border: '1px solid #1F4A1B',
                borderRight: 'none',
                borderLeft: 'none',
                background: 'transparent',
                color: '#fff',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2.5 4.5L6 8L9.5 4.5' stroke='%23A3B8A0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '12px',
                paddingRight: '2.5rem'
              }}
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
            <button type="submit" style={{
              padding: '0.85rem 1.5rem',
              backgroundColor: '#48A031',
              color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
              border: 'none',
              borderRadius: '0 8px 8px 0',
              cursor: 'pointer'
            }}>
              Analyse
            </button>
          </form>

          {error && <p style={{ color: '#EF4444', fontWeight: 'bold' }}>❌ {error}</p>}

          {data && (
            <>
              <div style={{
                backgroundColor: 'transparent',
                padding: '1.25rem',
                borderRadius: '12px',
                marginBottom: '1.75rem',
                border: '1px solid #1F4A1B'
              }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem' }}>💡 Market Insights</h2>
                <p style={{ margin: 0, lineHeight: '1.5', color: '#D1D5DB' }}>
                  Most competitors selling <strong style={{color: '#fff'}}>{possessive}</strong> in <strong style={{color: '#fff'}}>{selectedCountry.name}</strong> are priced between <strong style={{color: '#fff'}}>{formatPrice(data.min, data.currency)}–{formatPrice(data.max, data.currency)}</strong>.<br />
                  The median price is <strong style={{color: '#fff'}}>{formatPrice(data.median, data.currency)}</strong>.
                </p>
              </div>

              <div style={{ marginBottom: 0 }}>
                <PriceCurveChart 
                  prices={data.prices} 
                  topSixPrices={data.topSix.map(item => parseFloat(item.price.replace(/[^0-9.]/g, '')))} 
                />
              </div>
            </>
          )}
        </div>

        {/* Right Column: Product Listings */}
        {data && data.topSix && (
          <div style={{ width: '340px', flex: 'none', alignSelf: 'stretch' }}>
            <h3 style={{ 
              fontSize: '1.3rem', 
              fontWeight: 600, 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🧾 Top 6 Listings
            </h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              alignContent: 'start'
            }}>
              {data.topSix.map((item, i) => (
                <div key={i} style={{
                  background: 'transparent',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  border: '1px solid #1F4A1B',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    background: '#48A031',
                    color: '#fff',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    zIndex: 1
                  }}>
                    {i + 1}
                  </div>
                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: '6px',
                    padding: '0.25rem',
                    marginBottom: '0.35rem'
                  }}>
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      style={{ 
                        width: '100%', 
                        height: '60px', 
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    color: '#D1D5DB',
                    textDecoration: 'none',
                    display: 'block',
                    height: '2em',
                    overflow: 'hidden',
                    marginBottom: '0.2rem',
                    lineHeight: '1em'
                  }}>
                    {item.title}
                  </a>
                  <div style={{ marginTop: 'auto' }}>
                    <p style={{ margin: '0.15rem 0', fontWeight: 600, fontSize: '0.95rem', color: '#48A031' }}>{item.price}</p>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0.1rem 0 0' }}>{item.source}</p>
                    {item.rating && (
                      <p style={{ fontSize: '10px', margin: '0.1rem 0 0', color: '#9CA3AF' }}>
                        ⭐ {item.rating} ({item.reviews.toLocaleString()} reviews)
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
