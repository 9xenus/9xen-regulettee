import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from './logger';

export interface ScrapedData {
  title: string;
  metaDescription: string;
  h1: string[];
  links: string[];
  text: string;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
];

export const advancedScraper = {
  /**
   * Performs an advanced scrape of a target URL using axios and cheerio.
   */
  async scrape(url: string): Promise<ScrapedData | null> {
    try {
      logger.info(`[ADVANCED_SCRAPER] Initiating scrape for: ${url}`);
      
      const randomUserAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': randomUserAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        },
        timeout: 10000,
        validateStatus: (status) => status < 500, // Handle 4xx as potential content
      });

      if (response.status >= 400) {
        logger.warn(`[ADVANCED_SCRAPER] Received status ${response.status} for ${url}`);
        return null;
      }

      const $ = cheerio.load(response.data);

      const title = $('title').text().trim();
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      
      const h1: string[] = [];
      $('h1').each((_, el) => {
        h1.push($(el).text().trim());
      });

      const links: string[] = [];
      $('a[href^="http"]').each((_, el) => {
        links.push($(el).attr('href') || '');
      });

      // Extract meaningful text, removing scripts and styles
      $('script, style, nav, footer').remove();
      const text = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);

      logger.info(`[ADVANCED_SCRAPER] Successfully scraped ${url}. Title: ${title}`);
      
      return {
        title,
        metaDescription,
        h1,
        links: [...new Set(links)].slice(0, 50), // Unique links, limit to 50
        text
      };
    } catch (error: any) {
      const isDnsOrNetworkError = error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENETUNREACH';
      if (isDnsOrNetworkError) {
        logger.warn(`[ADVANCED_SCRAPER] Unreachable or invalid domain for ${url}: ${error.message}`);
      } else {
        logger.error(`[ADVANCED_SCRAPER] Scrape failed for ${url}: ${error.message}`);
      }
      return null;
    }
  }
};
