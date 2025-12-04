// Playwright MCP Tools - Full Implementation
// Covers: Navigation, Screenshots, PDF, Video, Network, Cookies, Storage, Emulation

import { chromium, Browser, Page, BrowserContext } from 'playwright';

// Browser pool for reuse
let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserInstance;
}

export async function executePlaywrightTool(tool: string, params: any): Promise<any> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: params.viewport || { width: 1280, height: 720 },
    userAgent: params.userAgent,
    locale: params.locale,
    timezoneId: params.timezone,
    geolocation: params.geolocation,
    permissions: params.permissions,
  });
  const page = await context.newPage();

  try {
    switch (tool) {
      // ==================== NAVIGATION ====================
      case 'navigate': {
        await page.goto(params.url, {
          waitUntil: params.waitUntil || 'load',
          timeout: params.timeout || 30000,
        });
        return {
          url: page.url(),
          title: await page.title(),
          status: 'success',
        };
      }

      case 'goBack': {
        await page.goBack({ waitUntil: params.waitUntil || 'load' });
        return { url: page.url(), title: await page.title() };
      }

      case 'goForward': {
        await page.goForward({ waitUntil: params.waitUntil || 'load' });
        return { url: page.url(), title: await page.title() };
      }

      case 'reload': {
        await page.reload({ waitUntil: params.waitUntil || 'load' });
        return { url: page.url(), title: await page.title() };
      }

      // ==================== SCREENSHOTS ====================
      case 'screenshot': {
        if (params.url) {
          await page.goto(params.url, { waitUntil: 'networkidle' });
        }
        
        const screenshot = await page.screenshot({
          fullPage: params.fullPage || false,
          type: params.type || 'png',
          quality: params.quality,
          clip: params.clip,
        });
        
        return {
          screenshot: screenshot.toString('base64'),
          type: params.type || 'png',
          size: screenshot.length,
        };
      }

      case 'screenshotElement': {
        if (params.url) {
          await page.goto(params.url, { waitUntil: 'networkidle' });
        }
        
        const element = await page.locator(params.selector);
        const screenshot = await element.screenshot({
          type: params.type || 'png',
          quality: params.quality,
        });
        
        return {
          screenshot: screenshot.toString('base64'),
          type: params.type || 'png',
        };
      }

      // ==================== PDF ====================
      case 'generatePDF': {
        if (params.url) {
          await page.goto(params.url, { waitUntil: 'networkidle' });
        }
        
        const pdf = await page.pdf({
          format: params.format || 'A4',
          printBackground: params.printBackground !== false,
          margin: params.margin,
          landscape: params.landscape || false,
          scale: params.scale || 1,
        });
        
        return {
          pdf: pdf.toString('base64'),
          size: pdf.length,
        };
      }

      // ==================== VIDEO RECORDING ====================
      case 'recordVideo': {
        // Note: Video recording requires context-level setup
        const videoContext = await browser.newContext({
          recordVideo: {
            dir: params.videoDir || './videos',
            size: params.videoSize || { width: 1280, height: 720 },
          },
        });
        const videoPage = await videoContext.newPage();
        
        await videoPage.goto(params.url, { waitUntil: 'networkidle' });
        
        // Execute actions if provided
        if (params.actions) {
          for (const action of params.actions) {
            await executePageAction(videoPage, action);
          }
        }
        
        await videoPage.waitForTimeout(params.duration || 5000);
        await videoContext.close();
        
        return {
          success: true,
          message: 'Video recorded',
          path: params.videoDir || './videos',
        };
      }

      // ==================== SCRAPING ====================
      case 'scrape': {
        if (params.url) {
          await page.goto(params.url, { waitUntil: 'networkidle' });
        }
        
        if (params.selector) {
          const element = page.locator(params.selector);
          const content = await element.textContent();
          return { content, selector: params.selector };
        }
        
        const content = await page.content();
        return { content, fullPage: true };
      }

      case 'scrapeMultiple': {
        if (params.url) {
          await page.goto(params.url, { waitUntil: 'networkidle' });
        }
        
        const results: Record<string, any> = {};
        
        for (const [key, selector] of Object.entries(params.selectors)) {
          const elements = await page.locator(selector as string).all();
          results[key] = await Promise.all(
            elements.map(el => el.textContent())
          );
        }
        
        return results;
      }

      case 'evaluate': {
        if (params.url) {
          await page.goto(params.url, { waitUntil: 'networkidle' });
        }
        
        const result = await page.evaluate(params.script);
        return { result };
      }

      // ==================== INTERACTIONS ====================
      case 'click': {
        if (params.url) {
          await page.goto(params.url, { waitUntil: 'networkidle' });
        }
        
        await page.click(params.selector, {
          button: params.button || 'left',
          clickCount: params.clickCount || 1,
          delay: params.delay,
        });
        
        return { success: true, selector: params.selector };
      }

      case 'fill': {
        if (params.url) {
          await page.goto(params.url, { waitUntil: 'networkidle' });
        }
        
        await page.fill(params.selector, params.value);
        return { success: true, selector: params.selector };
      }

      case 'type': {
        if (params.url) {
          await page.goto(params.url, { waitUntil: 'networkidle' });
        }
        
        await page.type(params.selector, params.text, {
          delay: params.delay || 50,
        });
        
        return { success: true, selector: params.selector };
      }

      case 'select': {
        if (params.url) {
          await page.goto(params.url, { waitUntil: 'networkidle' });
        }
        
        await page.selectOption(params.selector, params.value);
        return { success: true, selector: params.selector };
      }

      case 'interact': {
        if (params.url) {
          await page.goto(params.url, { waitUntil: 'networkidle' });
        }
        
        for (const action of params.actions) {
          await executePageAction(page, action);
        }
        
        return { success: true, actionsExecuted: params.actions.length };
      }

      // ==================== WAITING ====================
      case 'waitForSelector': {
        if (params.url) {
          await page.goto(params.url, { waitUntil: 'networkidle' });
        }
        
        await page.waitForSelector(params.selector, {
          state: params.state || 'visible',
          timeout: params.timeout || 30000,
        });
        
        return { success: true, selector: params.selector };
      }

      case 'waitForNavigation': {
        await page.waitForURL(params.url, {
          waitUntil: params.waitUntil || 'load',
          timeout: params.timeout || 30000,
        });
        
        return { url: page.url(), title: await page.title() };
      }

      // ==================== NETWORK ====================
      case 'interceptNetwork': {
        const requests: any[] = [];
        const responses: any[] = [];
        
        page.on('request', request => {
          requests.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
          });
        });
        
        page.on('response', response => {
          responses.push({
            url: response.url(),
            status: response.status(),
            headers: response.headers(),
          });
        });
        
        await page.goto(params.url, { waitUntil: 'networkidle' });
        
        return { requests, responses };
      }

      case 'blockResources': {
        await page.route(params.pattern || '**/*.{png,jpg,jpeg,gif,svg,css,font}', route => route.abort());
        await page.goto(params.url, { waitUntil: 'networkidle' });
        return { success: true, blocked: params.pattern };
      }

      // ==================== COOKIES ====================
      case 'getCookies': {
        if (params.url) {
          await page.goto(params.url);
        }
        const cookies = await context.cookies(params.urls);
        return { cookies };
      }

      case 'setCookies': {
        await context.addCookies(params.cookies);
        return { success: true, count: params.cookies.length };
      }

      case 'clearCookies': {
        await context.clearCookies();
        return { success: true };
      }

      // ==================== STORAGE ====================
      case 'getLocalStorage': {
        if (params.url) {
          await page.goto(params.url);
        }
        
        const storage = await page.evaluate(() => {
          const items: Record<string, string> = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) items[key] = localStorage.getItem(key) || '';
          }
          return items;
        });
        
        return { storage };
      }

      case 'setLocalStorage': {
        if (params.url) {
          await page.goto(params.url);
        }
        
        await page.evaluate((items) => {
          for (const [key, value] of Object.entries(items)) {
            localStorage.setItem(key, value as string);
          }
        }, params.items);
        
        return { success: true };
      }

      // ==================== EMULATION ====================
      case 'emulateDevice': {
        const devices = require('playwright').devices;
        const device = devices[params.device];
        
        if (!device) {
          throw new Error(`Unknown device: ${params.device}`);
        }
        
        const deviceContext = await browser.newContext(device);
        const devicePage = await deviceContext.newPage();
        await devicePage.goto(params.url);
        
        const screenshot = await devicePage.screenshot();
        await deviceContext.close();
        
        return {
          success: true,
          device: params.device,
          screenshot: screenshot.toString('base64'),
        };
      }

      case 'setGeolocation': {
        await context.setGeolocation({
          latitude: params.latitude,
          longitude: params.longitude,
          accuracy: params.accuracy,
        });
        
        if (params.url) {
          await page.goto(params.url);
        }
        
        return { success: true, location: { latitude: params.latitude, longitude: params.longitude } };
      }

      case 'setViewport': {
        await page.setViewportSize({
          width: params.width,
          height: params.height,
        });
        
        return { success: true, viewport: { width: params.width, height: params.height } };
      }

      default:
        throw new Error(`Unknown Playwright tool: ${tool}`);
    }
  } finally {
    await page.close();
    await context.close();
  }
}

// Helper function to execute page actions
async function executePageAction(page: Page, action: any): Promise<void> {
  switch (action.type) {
    case 'click':
      await page.click(action.selector);
      break;
    case 'fill':
      await page.fill(action.selector, action.value);
      break;
    case 'type':
      await page.type(action.selector, action.value);
      break;
    case 'select':
      await page.selectOption(action.selector, action.value);
      break;
    case 'wait':
      await page.waitForTimeout(action.duration || 1000);
      break;
    case 'waitForSelector':
      await page.waitForSelector(action.selector);
      break;
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

