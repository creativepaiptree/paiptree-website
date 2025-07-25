const { chromium } = require('@playwright/test');

async function extractCurrentMetrics() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('🔍 Navigating to localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
  
  console.log('📏 Extracting current site metrics...');
  
  const metrics = await page.evaluate(() => {
    const getComputedStyles = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      
      const styles = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      
      return {
        selector,
        text: element.textContent?.trim(),
        fontSize: styles.fontSize,
        fontFamily: styles.fontFamily,
        fontWeight: styles.fontWeight,
        lineHeight: styles.lineHeight,
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        marginTop: styles.marginTop,
        marginBottom: styles.marginBottom,
        paddingTop: styles.paddingTop,
        paddingBottom: styles.paddingBottom,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        display: styles.display,
        maxWidth: styles.maxWidth
      };
    };

    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      
      // Header metrics
      logo: getComputedStyles('header a') || getComputedStyles('a[href="/"]'),
      headerCTA: getComputedStyles('header button'),
      
      // Hero section metrics
      heroHeadline: getComputedStyles('h1'),
      heroSubtext: getComputedStyles('h1 + p'),
      heroCTA: getComputedStyles('main button'),
      
      // Layout metrics
      body: getComputedStyles('body'),
      main: getComputedStyles('main'),
      maxWidthContainer: getComputedStyles('.max-w-7xl') || getComputedStyles('[class*="max-w"]')
    };
  });
  
  await browser.close();
  return metrics;
}

async function saveCurrentMetrics() {
  try {
    const metrics = await extractCurrentMetrics();
    
    // Save to JSON file
    const fs = require('fs');
    const path = require('path');
    
    const outputPath = path.join(__dirname, 'current-metrics.json');
    fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2));
    
    console.log('✅ Current metrics saved to:', outputPath);
    
    // Print key metrics comparison
    console.log('\n📊 CURRENT SITE METRICS:');
    console.log('═══════════════════════════');
    
    if (metrics.heroHeadline) {
      console.log(`🎯 Hero Headline: "${metrics.heroHeadline.text}"`);
      console.log(`   Font Size: ${metrics.heroHeadline.fontSize}`);
      console.log(`   Font Family: ${metrics.heroHeadline.fontFamily}`);
      console.log(`   Font Weight: ${metrics.heroHeadline.fontWeight}`);
      console.log(`   Line Height: ${metrics.heroHeadline.lineHeight}`);
    }
    
    if (metrics.maxWidthContainer) {
      console.log(`📐 Max Width: ${metrics.maxWidthContainer.maxWidth}`);
    }
    
    if (metrics.headerCTA) {
      console.log(`🔘 Header CTA: "${metrics.headerCTA.text}"`);
    }
    
    if (metrics.logo) {
      console.log(`🏷️  Logo: "${metrics.logo.text}"`);
    }
    
    console.log(`🖥️  Viewport: ${metrics.viewport.width}x${metrics.viewport.height}`);
    
  } catch (error) {
    console.error('❌ Error extracting current metrics:', error);
    console.log('💡 Make sure your dev server is running on localhost:3000');
    console.log('   Run: npm run dev');
  }
}

// Run the extraction
saveCurrentMetrics();