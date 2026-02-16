import axios from 'axios';

const API_BASES = [
  'https://de1.api.radio-browser.info/json',
  'https://fr1.api.radio-browser.info/json',
  'https://at1.api.radio-browser.info/json',
  'https://nl1.api.radio-browser.info/json'
];

// Simple cache mechanism
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

class RadioApiService {
  constructor() {
    this.baseUrl = API_BASES[0];
    this.checkServer();
  }

  async checkServer() {
    // Determine the fastest/working server
    for (const url of API_BASES) {
      try {
        await axios.get(`${url}/servers`, { timeout: 2000 });
        this.baseUrl = url;
        // console.log(`Connected to Radio Browser API: ${this.baseUrl}`);
        break;
      } catch (e) {
        // console.warn(`Failed to connect to ${url}, trying next...`);
      }
    }
  }

  async get(endpoint, params = {}) {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    if (cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey);
      if (Date.now() - timestamp < CACHE_DURATION) {
        // console.log('Returning cached data for:', endpoint);
        return data;
      }
      cache.delete(cacheKey);
    }

    try {
      // console.log(`Making API call to: ${this.baseUrl}${endpoint} with params:`, params);
      const response = await axios.get(`${this.baseUrl}${endpoint}`, { params });
      // console.log('API response received:', response.data);
      cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getTopStations(limit = 20) {
    return this.get('/stations/topclick', { limit });
  }

  async searchStations({ name, country, language, tag, bitrateMin, limit = 20, offset = 0, order = 'clickcount', reverse = true }) {
    const params = { limit, offset, hidebroken: true, order, reverse };
    if (name) params.name = name;
    if (country) params.country = country;
    if (language) params.language = language;
    if (tag) params.tag = tag;
    if (bitrateMin) params.bitrateMin = bitrateMin;
    
    // console.log('API searchStations called with params:', params);
    const result = await this.get('/stations/search', params);
    // console.log('API searchStations result:', result);
    return result;
  }

  async getStationsByCountry(country, limit = 20) {
    return this.get(`/stations/bycountry/${encodeURIComponent(country)}`, { limit, hidebroken: true });
  }
  
  async getStationsByTag(tag, limit = 20, order = 'clickcount') {
     return this.get(`/stations/bytag/${encodeURIComponent(tag)}`, { limit, hidebroken: true, order, reverse: true });
  }

  async getStats() {
    return this.get('/stats');
  }

  async voteForStation(stationUuid) {
    // API endpoint for voting is typically POST /url/vote/stationuuid
    // But the radio browser API documentation says GET /vote/{stationuuid}
    // We'll try to follow the standard pattern or use simple GET
    try {
        await axios.get(`${this.baseUrl}/vote/${stationUuid}`);
        return true;
    } catch (e) {
        console.error("Vote failed", e);
        return false;
    }
  }

  async getStationByUuid(uuid) {
    const data = await this.get(`/stations/byuuid/${uuid}`);
    return data && data.length > 0 ? data[0] : null;
  }

  async getRelatedStations(station, limit = 6) {
    // Try to find by tags first
    if (station.tags) {
      const tags = station.tags.split(',').filter(t => t.length > 2);
      if (tags.length > 0) {
        // Use the first meaningful tag
        return this.searchStations({ tag: tags[0], limit, hidebroken: true });
      }
    }
    // Fallback to country
    if (station.country) {
      return this.getStationsByCountry(station.country, limit);
    }
    // Fallback to top stations
    return this.getTopStations(limit);
  }

  async getCountries() {
    return this.get('/countries');
  }

  async getLanguages() {
    return this.get('/languages');
  }
  
  async getTags() {
    return this.get('/tags');
  }
}

export const radioApi = new RadioApiService();
