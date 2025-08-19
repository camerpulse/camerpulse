/**
 * Secure map marker creation utility to replace unsafe innerHTML
 */

interface MarkerOptions {
  width?: number;
  height?: number;
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: string;
  iconSvg: string;
}

export function createSecureMarker(options: MarkerOptions): HTMLElement {
  const {
    width = 30,
    height = 30,
    backgroundColor,
    borderColor = 'white',
    borderWidth = 2,
    borderRadius = '50%',
    iconSvg
  } = options;

  // Create marker element safely
  const markerEl = document.createElement('div');
  markerEl.className = 'custom-marker';
  
  // Apply styles programmatically instead of innerHTML
  Object.assign(markerEl.style, {
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor,
    border: `${borderWidth}px solid ${borderColor}`,
    borderRadius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'all 0.2s ease'
  });

  // Create icon container
  const iconContainer = document.createElement('div');
  iconContainer.style.width = '18px';
  iconContainer.style.height = '18px';
  iconContainer.style.color = 'white';
  
  // Safely set SVG content using secure DOM creation
  if (iconSvg && iconSvg.trim().startsWith('<svg')) {
    // Parse and create SVG element securely
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(iconSvg, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    if (svgElement && !svgDoc.querySelector('parsererror')) {
      iconContainer.appendChild(svgElement);
    }
  }
  
  markerEl.appendChild(iconContainer);
  
  return markerEl;
}

/**
 * Secure PDF export content builder
 */
interface ExportContentData {
  name: string;
  position: string;
  region?: string;
  performanceMetrics?: {
    performanceScore?: number;
    transparencyScore?: number;
    civicEngagementScore?: number;
  };
  legislativeActivity?: {
    billsProposed?: number;
    billsPassed?: number;
  };
}

export function createSecureExportContent(
  data: ExportContentData,
  options: {
    includePerformance?: boolean;
    includeLegislation?: boolean;
  } = {}
): HTMLElement {
  const container = document.createElement('div');
  container.style.cssText = `
    width: 800px;
    background: white;
    padding: 40px;
    font-family: Arial, sans-serif;
  `;

  // Header section
  const headerDiv = document.createElement('div');
  headerDiv.style.cssText = 'text-align: center; margin-bottom: 30px;';

  const nameH1 = document.createElement('h1');
  nameH1.style.cssText = 'font-size: 28px; margin-bottom: 10px; color: #1a1a1a;';
  nameH1.textContent = data.name;

  const positionP = document.createElement('p');
  positionP.style.cssText = 'font-size: 18px; color: #666; margin-bottom: 5px;';
  positionP.textContent = data.position;

  headerDiv.appendChild(nameH1);
  headerDiv.appendChild(positionP);

  if (data.region) {
    const regionP = document.createElement('p');
    regionP.style.cssText = 'font-size: 16px; color: #888;';
    regionP.textContent = data.region;
    headerDiv.appendChild(regionP);
  }

  container.appendChild(headerDiv);

  // Performance metrics section
  if (options.includePerformance && data.performanceMetrics) {
    const perfDiv = document.createElement('div');
    perfDiv.style.cssText = 'margin-bottom: 30px;';

    const perfH3 = document.createElement('h3');
    perfH3.style.cssText = 'font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 5px;';
    perfH3.textContent = 'Performance Metrics';
    perfDiv.appendChild(perfH3);

    const metrics = data.performanceMetrics;
    if (metrics.performanceScore) {
      const p = document.createElement('p');
      p.textContent = 'Performance Score: ';
      const strong = document.createElement('strong');
      strong.textContent = `${metrics.performanceScore}%`;
      p.appendChild(strong);
      perfDiv.appendChild(p);
    }

    if (metrics.transparencyScore) {
      const p = document.createElement('p');
      p.textContent = 'Transparency Score: ';
      const strong = document.createElement('strong');
      strong.textContent = `${metrics.transparencyScore}%`;
      p.appendChild(strong);
      perfDiv.appendChild(p);
    }

    if (metrics.civicEngagementScore) {
      const p = document.createElement('p');
      p.textContent = 'Civic Engagement Score: ';
      const strong = document.createElement('strong');
      strong.textContent = `${metrics.civicEngagementScore}%`;
      p.appendChild(strong);
      perfDiv.appendChild(p);
    }

    container.appendChild(perfDiv);
  }

  // Legislative activity section
  if (options.includeLegislation && data.legislativeActivity) {
    const legDiv = document.createElement('div');
    legDiv.style.cssText = 'margin-bottom: 30px;';

    const legH3 = document.createElement('h3');
    legH3.style.cssText = 'font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 5px;';
    legH3.textContent = 'Legislative Activity';
    legDiv.appendChild(legH3);

    const activity = data.legislativeActivity;
    if (activity.billsProposed) {
      const p = document.createElement('p');
      p.textContent = 'Bills Proposed: ';
      const strong = document.createElement('strong');
      strong.textContent = String(activity.billsProposed);
      p.appendChild(strong);
      legDiv.appendChild(p);
    }

    if (activity.billsPassed) {
      const p = document.createElement('p');
      p.textContent = 'Bills Passed: ';
      const strong = document.createElement('strong');
      strong.textContent = String(activity.billsPassed);
      p.appendChild(strong);
      legDiv.appendChild(p);
    }

    container.appendChild(legDiv);
  }

  // Footer
  const footerDiv = document.createElement('div');
  footerDiv.style.cssText = 'text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;';
  footerDiv.textContent = `Generated from CamerPulse Senate Directory - ${new Date().toLocaleDateString()}`;
  container.appendChild(footerDiv);

  return container;
}