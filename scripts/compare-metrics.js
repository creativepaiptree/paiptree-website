const fs = require('fs');
const path = require('path');

function compareMetrics() {
  try {
    // Load both metric files
    const stabilityPath = path.join(__dirname, 'stability-metrics.json');
    const currentPath = path.join(__dirname, 'current-metrics.json');
    
    const stabilityMetrics = JSON.parse(fs.readFileSync(stabilityPath, 'utf8'));
    const currentMetrics = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
    
    console.log('🔍 DETAILED METRICS COMPARISON');
    console.log('═══════════════════════════════════════════════════════');
    
    // Extract key hero headline data from stability.ai
    const stabilityHeroHeadline = stabilityMetrics.heroHeadline;
    const currentHeroHeadline = currentMetrics.heroHeadline;
    
    console.log('\n🎯 HERO HEADLINE COMPARISON:');
    console.log('─────────────────────────────────────────────────');
    console.log(`📝 Text Content:`);
    console.log(`   Stability.ai: "${stabilityHeroHeadline?.text || 'N/A'}"`);
    console.log(`   Current:      "${currentHeroHeadline?.text || 'N/A'}"`);
    console.log(`   ✅ Match: ${stabilityHeroHeadline?.text === currentHeroHeadline?.text ? 'YES' : 'NO'}`);
    
    console.log(`\n📏 Font Size:`);
    console.log(`   Stability.ai: ${stabilityHeroHeadline?.fontSize || 'N/A'}`);
    console.log(`   Current:      ${currentHeroHeadline?.fontSize || 'N/A'}`);
    console.log(`   📊 Difference: ${parseFloat(currentHeroHeadline?.fontSize) - parseFloat(stabilityHeroHeadline?.fontSize)}px`);
    
    console.log(`\n🔤 Font Family:`);
    console.log(`   Stability.ai: ${stabilityHeroHeadline?.fontFamily || 'N/A'}`);
    console.log(`   Current:      ${currentHeroHeadline?.fontFamily || 'N/A'}`);
    console.log(`   ✅ Match: ${stabilityHeroHeadline?.fontFamily?.includes('Archivo') && currentHeroHeadline?.fontFamily?.includes('Inter') ? 'NO - Different fonts' : 'Checking...'}`);
    
    console.log(`\n💪 Font Weight:`);
    console.log(`   Stability.ai: ${stabilityHeroHeadline?.fontWeight || 'N/A'}`);
    console.log(`   Current:      ${currentHeroHeadline?.fontWeight || 'N/A'}`);
    console.log(`   ✅ Match: ${stabilityHeroHeadline?.fontWeight === currentHeroHeadline?.fontWeight ? 'YES' : 'NO'}`);
    
    console.log(`\n📐 Line Height:`);
    console.log(`   Stability.ai: ${stabilityHeroHeadline?.lineHeight || 'N/A'}`);
    console.log(`   Current:      ${currentHeroHeadline?.lineHeight || 'N/A'}`);
    
    // Layout comparison
    console.log('\n🏗️ LAYOUT COMPARISON:');
    console.log('─────────────────────────────────────────────────');
    console.log(`📐 Max Width:`);
    console.log(`   Stability.ai: ${stabilityMetrics.maxWidth || 'N/A'}`);
    console.log(`   Current:      ${currentMetrics.maxWidthContainer?.maxWidth || 'N/A'}`);
    console.log(`   📊 Difference: ${parseFloat(stabilityMetrics.maxWidth) - parseFloat(currentMetrics.maxWidthContainer?.maxWidth)}px`);
    
    // Logo comparison
    console.log('\n🏷️ LOGO COMPARISON:');
    console.log('─────────────────────────────────────────────────');
    console.log(`   Stability.ai: "${stabilityMetrics.logo?.text || 'Stability AI (image)'}"`);
    console.log(`   Current:      "${currentMetrics.logo?.text || 'N/A'}"`);
    console.log(`   ✅ Match: NO - Different text`);
    
    // CTA Button comparison
    console.log('\n🔘 CTA BUTTON COMPARISON:');
    console.log('─────────────────────────────────────────────────');
    console.log(`   Stability.ai: "${stabilityMetrics.headerCTA?.text || "Let's get started"}"`);
    console.log(`   Current:      "${currentMetrics.headerCTA?.text || 'N/A'}"`);
    console.log(`   ✅ Match: ${currentMetrics.headerCTA?.text?.includes("Let's get started") ? 'YES' : 'Partial'}`);
    
    // Generate improvement recommendations
    console.log('\n🎯 IMPROVEMENT RECOMMENDATIONS:');
    console.log('═══════════════════════════════════════════════════════');
    
    const recommendations = [];
    
    // Font size difference
    const fontSizeDiff = parseFloat(currentHeroHeadline?.fontSize) - parseFloat(stabilityHeroHeadline?.fontSize);
    if (Math.abs(fontSizeDiff) > 2) {
      recommendations.push({
        priority: 'HIGH',
        issue: `Hero headline font size difference: ${fontSizeDiff.toFixed(1)}px`,
        solution: `Change from ${currentHeroHeadline?.fontSize} to ${stabilityHeroHeadline?.fontSize}`,
        css: `font-size: ${stabilityHeroHeadline?.fontSize};`
      });
    }
    
    // Font family difference
    if (stabilityHeroHeadline?.fontFamily?.includes('Archivo') && currentHeroHeadline?.fontFamily?.includes('Inter')) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Wrong font family - using Inter instead of Archivo',
        solution: 'Import and use Archivo font family',
        css: `font-family: 'Archivo', sans-serif;`
      });
    }
    
    // Font weight difference
    if (stabilityHeroHeadline?.fontWeight !== currentHeroHeadline?.fontWeight) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: `Font weight mismatch: ${currentHeroHeadline?.fontWeight} vs ${stabilityHeroHeadline?.fontWeight}`,
        solution: `Change font weight to match Stability.ai`,
        css: `font-weight: ${stabilityHeroHeadline?.fontWeight};`
      });
    }
    
    // Max width difference
    const maxWidthDiff = parseFloat(stabilityMetrics.maxWidth) - parseFloat(currentMetrics.maxWidthContainer?.maxWidth);
    if (Math.abs(maxWidthDiff) > 50) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: `Container max-width difference: ${maxWidthDiff}px`,
        solution: `Change max-width from ${currentMetrics.maxWidthContainer?.maxWidth} to ${stabilityMetrics.maxWidth}`,
        css: `max-width: ${stabilityMetrics.maxWidth};`
      });
    }
    
    // Logo text
    if (currentMetrics.logo?.text !== 'Stability AI') {
      recommendations.push({
        priority: 'HIGH',
        issue: `Logo text mismatch: "${currentMetrics.logo?.text}" vs "Stability AI"`,
        solution: 'Change logo text to "Stability AI"',
        css: 'Update logo text content'
      });
    }
    
    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. [${rec.priority}] ${rec.issue}`);
      console.log(`   💡 Solution: ${rec.solution}`);
      console.log(`   📝 CSS: ${rec.css}`);
    });
    
    // Generate summary
    console.log('\n📊 SUMMARY:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🔍 Total Issues Found: ${recommendations.length}`);
    console.log(`🚨 High Priority: ${recommendations.filter(r => r.priority === 'HIGH').length}`);
    console.log(`⚠️  Medium Priority: ${recommendations.filter(r => r.priority === 'MEDIUM').length}`);
    console.log(`✅ Overall Similarity: ${Math.max(0, 100 - (recommendations.length * 15))}%`);
    
    // Save recommendations to file
    const recommendationsPath = path.join(__dirname, 'improvement-recommendations.json');
    fs.writeFileSync(recommendationsPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      recommendations: recommendations,
      metrics: {
        stability: {
          heroHeadline: stabilityHeroHeadline,
          maxWidth: stabilityMetrics.maxWidth,
          logo: stabilityMetrics.logo
        },
        current: {
          heroHeadline: currentHeroHeadline,
          maxWidth: currentMetrics.maxWidthContainer?.maxWidth,
          logo: currentMetrics.logo
        }
      }
    }, null, 2));
    
    console.log(`\n💾 Detailed recommendations saved to: ${recommendationsPath}`);
    
  } catch (error) {
    console.error('❌ Error comparing metrics:', error);
  }
}

// Run the comparison
compareMetrics();