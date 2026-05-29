const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists in the root folder
const screenshotDir = path.join(__dirname, '..', 'assets', 'screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
  console.log(`Created directory: ${screenshotDir}`);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set viewport to a nice standard desktop size
  await page.setViewport({ width: 1280, height: 850, deviceScaleFactor: 1 });

  try {
    console.log('Navigating to landing page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Wait a bit for layout to stabilize
    await delay(3500);
    
    console.log('Taking landing page screenshot...');
    await page.screenshot({ path: path.join(screenshotDir, 'landing_page.png') });
    console.log('Captured landing_page.png');

    // Helper to generate itinerary and take screenshot
    async function generateAndCapture(destination, fileName) {
      console.log(`Generating itinerary for: ${destination}...`);
      
      // Go to localhost to reset state
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await delay(2000);

      // Scroll to generator section
      await page.evaluate(() => {
        const element = document.getElementById('generator');
        if (element) {
          element.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      });
      await delay(1000);

      // Find the input and click/type
      const inputSelector = 'input[placeholder*="Paris"]';
      await page.waitForSelector(inputSelector);
      
      // Click input, clear it, and type
      await page.click(inputSelector);
      await page.evaluate(selector => {
        document.querySelector(selector).value = '';
      }, inputSelector);
      await page.type(inputSelector, destination);
      await delay(500);

      // Find and click the Generate button
      const buttons = await page.$$('button');
      let generateBtn = null;
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('Generate Magic Itinerary')) {
          generateBtn = btn;
          break;
        }
      }

      if (generateBtn) {
        await generateBtn.click();
        console.log('Clicked generate, waiting for rendering...');
        // Wait for loading to finish and map to load
        await delay(6000);
        
        // Scroll the map and itinerary into view nicely
        await page.evaluate(() => {
          window.scrollBy(0, 450);
        });
        await delay(2000);

        await page.screenshot({ path: path.join(screenshotDir, fileName) });
        console.log(`Captured ${fileName}`);
      } else {
        console.error('Could not find generate button!');
      }
    }

    // Capture Paris
    await generateAndCapture('Paris, France', 'paris_itinerary.png');

    // Capture Tokyo
    await generateAndCapture('Tokyo, Japan', 'tokyo_itinerary.png');

    // Capture Rome
    await generateAndCapture('Rome, Italy', 'rome_itinerary.png');

  } catch (error) {
    console.error('An error occurred during screenshot generation:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
    console.log('Done!');
  }
})();
