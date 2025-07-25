const { chromium } = require('@playwright/test');

async function extractStabilityMetrics() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('🔍 Navigating to stability.ai...');
  await page.goto('https://stability.ai/', { waitUntil: 'networkidle' });
  
  console.log('📏 Extracting detailed metrics...');
  
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
        marginLeft: styles.marginLeft,
        marginRight: styles.marginRight,
        paddingTop: styles.paddingTop,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft,
        paddingRight: styles.paddingRight,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        display: styles.display,
        flexDirection: styles.flexDirection,
        justifyContent: styles.justifyContent,
        alignItems: styles.alignItems,
        gap: styles.gap,
        borderRadius: styles.borderRadius,
        boxShadow: styles.boxShadow
      };
    };

    const results = {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      
      // Header metrics
      header: getComputedStyles('header'),
      logo: getComputedStyles('header a[href="/"]') || getComputedStyles('header a:first-child'),
      navigation: {
        container: getComputedStyles('nav'),
        items: Array.from(document.querySelectorAll('nav a, header nav a')).map((el, i) => ({
          index: i,
          text: el.textContent?.trim(),
          ...getComputedStyles(`nav a:nth-child(${i+1}), header nav a:nth-child(${i+1})`)
        }))
      },
      headerCTA: getComputedStyles('header button') || getComputedStyles('header a[href*="started"]'),
      
      // Hero section metrics
      heroSection: getComputedStyles('main section:first-child') || getComputedStyles('section:first-child'),
      heroHeadline: getComputedStyles('h1') || getComputedStyles('main h1'),
      heroSubtext: getComputedStyles('h1 + p') || getComputedStyles('main p:first-of-type'),
      heroCTA: getComputedStyles('main button') || getComputedStyles('main a[href*="started"]'),
      
      // Content sections
      sections: Array.from(document.querySelectorAll('main section, section')).map((section, i) => {
        const heading = section.querySelector('h2, h3');
        const description = section.querySelector('p');
        
        return {
          index: i,
          heading: heading ? {
            text: heading.textContent?.trim(),
            ...getComputedStyles(`main section:nth-child(${i+1}) h2, section:nth-child(${i+1}) h2`)
          } : null,
          description: description ? {
            text: description.textContent?.trim(),
            ...getComputedStyles(`main section:nth-child(${i+1}) p, section:nth-child(${i+1}) p`)
          } : null,
          container: getComputedStyles(`main section:nth-child(${i+1}), section:nth-child(${i+1})`)
        };
      }),
      
      // Global layout metrics
      body: getComputedStyles('body'),
      main: getComputedStyles('main'),
      maxWidth: (() => {
        const containers = document.querySelectorAll('[class*="container"], [class*="max-w"], main > div, section > div');
        let maxWidthValue = '0px';
        containers.forEach(el => {
          const styles = window.getComputedStyle(el);
          if (parseInt(styles.maxWidth) > parseInt(maxWidthValue)) {
            maxWidthValue = styles.maxWidth;
          }
        });
        return maxWidthValue;
      })(),
      
      // Footer metrics
      footer: getComputedStyles('footer')
    };
    
    return results;
  });
  
  await browser.close();
  return metrics;
}

async function saveMetrics() {
  try {
    const metrics = await extractStabilityMetrics();
    
    // Save to JSON file
    const fs = require('fs');
    const path = require('path');
    
    const outputPath = path.join(__dirname, 'stability-metrics.json');
    fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2));
    
    console.log('✅ Metrics saved to:', outputPath);
    
    // Print key metrics
    console.log('\n📊 KEY METRICS EXTRACTED:');
    console.log('═══════════════════════════');
    
    if (metrics.heroHeadline) {
      console.log(`🎯 Hero Headline: "${metrics.heroHeadline.text}"`);
      console.log(`   Font Size: ${metrics.heroHeadline.fontSize}`);
      console.log(`   Font Family: ${metrics.heroHeadline.fontFamily}`);
      console.log(`   Font Weight: ${metrics.heroHeadline.fontWeight}`);
      console.log(`   Line Height: ${metrics.heroHeadline.lineHeight}`);
    }
    
    if (metrics.maxWidth) {
      console.log(`📐 Max Width: ${metrics.maxWidth}`);
    }
    
    if (metrics.headerCTA) {
      console.log(`🔘 Header CTA: "${metrics.headerCTA.text}"`);
    }
    
    console.log(`🖥️  Viewport: ${metrics.viewport.width}x${metrics.viewport.height}`);
    
    if (metrics.navigation.items.length > 0) {
      console.log(`🧭 Navigation Items: ${metrics.navigation.items.length}`);
      metrics.navigation.items.forEach(item => {
        if (item.text) console.log(`   - ${item.text}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error extracting metrics:', error);
  }
}

// Run the extraction
saveMetrics();