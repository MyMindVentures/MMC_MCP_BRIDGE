// Brave Search API - Full Implementation
// 7+ tools for comprehensive search capabilities
// API Docs: https://api.search.brave.com/app/documentation/web-search/get-started

import axios from 'axios';

const BRAVE_API = 'https://api.search.brave.com/res/v1';

function getBraveHeaders() {
  if (!process.env.BRAVE_SEARCH_API_KEY) {
    throw new Error('BRAVE_SEARCH_API_KEY not configured');
  }
  return {
    'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY,
    'Accept': 'application/json'
  };
}

export async function executeBraveSearchTool(tool: string, params: any): Promise<any> {
  try {
    switch (tool) {
      // ========== WEB SEARCH ==========
      case 'webSearch':
        return await webSearch(params);
      
      // ========== IMAGE SEARCH ==========
      case 'imageSearch':
        return await imageSearch(params);
      
      // ========== VIDEO SEARCH ==========
      case 'videoSearch':
        return await videoSearch(params);
      
      // ========== NEWS SEARCH ==========
      case 'newsSearch':
        return await newsSearch(params);
      
      // ========== LOCAL SEARCH ==========
      case 'localSearch':
        return await localSearch(params);
      
      // ========== SUGGEST (AUTOCOMPLETE) ==========
      case 'suggest':
        return await suggest(params);
      
      // ========== SPELLCHECK ==========
      case 'spellcheck':
        return await spellcheck(params);
      
      default:
        throw new Error(`Unknown Brave Search tool: ${tool}`);
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(`Brave Search API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

// ========== WEB SEARCH ==========

async function webSearch(params: any) {
  const response = await axios.get(`${BRAVE_API}/web/search`, {
    headers: getBraveHeaders(),
    params: {
      q: params.query,
      country: params.country || 'US',
      search_lang: params.searchLang || 'en',
      ui_lang: params.uiLang || 'en',
      count: params.count || 20,
      offset: params.offset || 0,
      safesearch: params.safesearch || 'moderate',
      freshness: params.freshness, // pd (past day), pw (past week), pm (past month), py (past year)
      text_decorations: params.textDecorations !== false,
      spellcheck: params.spellcheck !== false,
      result_filter: params.resultFilter, // web, news, videos, images
      goggles_id: params.gogglesId, // Custom search goggles
    }
  });
  
  return {
    type: 'web',
    query: response.data.query,
    results: response.data.web?.results || [],
    news: response.data.news?.results || [],
    videos: response.data.videos?.results || [],
    images: response.data.images?.results || [],
    locations: response.data.locations?.results || [],
    infobox: response.data.infobox,
    discussions: response.data.discussions?.results || [],
    faq: response.data.faq?.results || [],
    mixed: response.data.mixed,
  };
}

// ========== IMAGE SEARCH ==========

async function imageSearch(params: any) {
  const response = await axios.get(`${BRAVE_API}/images/search`, {
    headers: getBraveHeaders(),
    params: {
      q: params.query,
      country: params.country || 'US',
      search_lang: params.searchLang || 'en',
      count: params.count || 20,
      offset: params.offset || 0,
      safesearch: params.safesearch || 'moderate',
      spellcheck: params.spellcheck !== false,
    }
  });
  
  return {
    type: 'images',
    query: response.data.query,
    results: response.data.results || [],
  };
}

// ========== VIDEO SEARCH ==========

async function videoSearch(params: any) {
  const response = await axios.get(`${BRAVE_API}/videos/search`, {
    headers: getBraveHeaders(),
    params: {
      q: params.query,
      country: params.country || 'US',
      search_lang: params.searchLang || 'en',
      ui_lang: params.uiLang || 'en',
      count: params.count || 20,
      offset: params.offset || 0,
      safesearch: params.safesearch || 'moderate',
      freshness: params.freshness,
      spellcheck: params.spellcheck !== false,
    }
  });
  
  return {
    type: 'videos',
    query: response.data.query,
    results: response.data.results || [],
  };
}

// ========== NEWS SEARCH ==========

async function newsSearch(params: any) {
  const response = await axios.get(`${BRAVE_API}/news/search`, {
    headers: getBraveHeaders(),
    params: {
      q: params.query,
      country: params.country || 'US',
      search_lang: params.searchLang || 'en',
      ui_lang: params.uiLang || 'en',
      count: params.count || 20,
      offset: params.offset || 0,
      freshness: params.freshness,
      spellcheck: params.spellcheck !== false,
    }
  });
  
  return {
    type: 'news',
    query: response.data.query,
    results: response.data.results || [],
  };
}

// ========== LOCAL SEARCH ==========

async function localSearch(params: any) {
  // Local search requires location parameters
  if (!params.location && !params.lat && !params.lon) {
    throw new Error('Local search requires either location (string) or lat/lon coordinates');
  }
  
  const response = await axios.get(`${BRAVE_API}/web/search`, {
    headers: getBraveHeaders(),
    params: {
      q: params.query,
      country: params.country || 'US',
      search_lang: params.searchLang || 'en',
      count: params.count || 20,
      offset: params.offset || 0,
      safesearch: params.safesearch || 'moderate',
      result_filter: 'locations',
      // Location parameters
      ...(params.location && { location: params.location }),
      ...(params.lat && { lat: params.lat }),
      ...(params.lon && { lon: params.lon }),
    }
  });
  
  return {
    type: 'local',
    query: response.data.query,
    results: response.data.locations?.results || [],
  };
}

// ========== SUGGEST (AUTOCOMPLETE) ==========

async function suggest(params: any) {
  const response = await axios.get(`${BRAVE_API}/suggest`, {
    headers: getBraveHeaders(),
    params: {
      q: params.query,
      country: params.country || 'US',
      lang: params.lang || 'en',
      count: params.count || 10,
    }
  });
  
  // Brave returns suggestions in format: [query, [suggestions]]
  const suggestions = Array.isArray(response.data) && response.data.length > 1 
    ? response.data[1] 
    : [];
  
  return {
    query: params.query,
    suggestions: suggestions,
  };
}

// ========== SPELLCHECK ==========

async function spellcheck(params: any) {
  // Spellcheck is part of web search, but we can extract just the correction
  const response = await axios.get(`${BRAVE_API}/web/search`, {
    headers: getBraveHeaders(),
    params: {
      q: params.query,
      country: params.country || 'US',
      search_lang: params.searchLang || 'en',
      count: 1, // Minimal results, we just want the correction
      spellcheck: true,
    }
  });
  
  return {
    original: params.query,
    corrected: response.data.query?.altered || response.data.query?.original,
    hasCorrection: !!response.data.query?.altered,
    suggestion: response.data.query?.altered,
  };
}

