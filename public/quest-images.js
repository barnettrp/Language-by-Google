/**
 * ConvoQuest - Quest Image Generator
 *
 * Generates custom SVG images for quest stages using data URIs.
 * This ensures images match exactly what the AI asks users to count/identify.
 */

function encodeSvgForBtoa(svgText) {
  if (typeof TextEncoder !== 'undefined') {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(svgText);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return binary;
  }
  // Fallback for environments without TextEncoder
  return unescape(encodeURIComponent(svgText));
}

function svgToDataUri(svg) {
  const normalized = svg.trim();
  try {
    return 'data:image/svg+xml;base64,' + btoa(encodeSvgForBtoa(normalized));
  } catch (err) {
    console.warn('Failed to base64 encode SVG, falling back to utf8 data URI', err);
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(normalized);
  }
}

const QUEST_IMAGES = {
  /**
   * Market Day - Stage 1: Fruit Stand
   * Exact inventory: 8 red apples, 12 oranges, 6 bananas, 15 strawberries, 3 watermelons
   */
  marketDay_stage1_fruitStand: function() {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
        <!-- Background -->
        <rect width="600" height="400" fill="#f0e6d2"/>

        <!-- Market stand structure -->
        <rect x="50" y="150" width="500" height="200" fill="#8b4513" stroke="#654321" stroke-width="2"/>
        <rect x="40" y="140" width="520" height="20" fill="#a0522d" stroke="#654321" stroke-width="2"/>

        <!-- Stand dividers -->
        <line x1="150" y1="150" x2="150" y2="350" stroke="#654321" stroke-width="2"/>
        <line x1="270" y1="150" x2="270" y2="350" stroke="#654321" stroke-width="2"/>
        <line x1="390" y1="150" x2="390" y2="350" stroke="#654321" stroke-width="2"/>
        <line x1="510" y1="150" x2="510" y2="350" stroke="#654321" stroke-width="2"/>

        <!-- Section 1: 8 Red Apples (manzanas rojas) -->
        <circle cx="80" cy="190" r="15" fill="#dc143c" stroke="#8b0000" stroke-width="2"/>
        <circle cx="110" cy="190" r="15" fill="#dc143c" stroke="#8b0000" stroke-width="2"/>
        <circle cx="80" cy="225" r="15" fill="#dc143c" stroke="#8b0000" stroke-width="2"/>
        <circle cx="110" cy="225" r="15" fill="#dc143c" stroke="#8b0000" stroke-width="2"/>
        <circle cx="95" cy="260" r="15" fill="#dc143c" stroke="#8b0000" stroke-width="2"/>
        <circle cx="125" cy="260" r="15" fill="#dc143c" stroke="#8b0000" stroke-width="2"/>
        <circle cx="80" cy="295" r="15" fill="#dc143c" stroke="#8b0000" stroke-width="2"/>
        <circle cx="110" cy="295" r="15" fill="#dc143c" stroke="#8b0000" stroke-width="2"/>
        <!-- Apple stems -->
        <line x1="80" y1="175" x2="80" y2="180" stroke="#654321" stroke-width="2"/>
        <line x1="110" y1="175" x2="110" y2="180" stroke="#654321" stroke-width="2"/>

        <!-- Section 2: 12 Oranges (naranjas) -->
        <circle cx="180" cy="190" r="14" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>
        <circle cx="210" cy="190" r="14" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>
        <circle cx="240" cy="190" r="14" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>
        <circle cx="180" cy="225" r="14" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>
        <circle cx="210" cy="225" r="14" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>
        <circle cx="240" cy="225" r="14" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>
        <circle cx="180" cy="260" r="14" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>
        <circle cx="210" cy="260" r="14" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>
        <circle cx="240" cy="260" r="14" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>
        <circle cx="180" cy="295" r="14" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>
        <circle cx="210" cy="295" r="14" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>
        <circle cx="240" cy="295" r="14" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>

        <!-- Section 3: 6 Bananas (plátanos) - Individual bananas clearly separated -->
        <!-- Top row: 3 bananas -->
        <ellipse cx="300" cy="190" rx="12" ry="25" fill="#ffe135" stroke="#ffd700" stroke-width="2" transform="rotate(-10 300 190)"/>
        <path d="M 295 165 Q 297 163, 299 165" fill="none" stroke="#8b7355" stroke-width="2"/>

        <ellipse cx="330" cy="195" rx="12" ry="25" fill="#ffe135" stroke="#ffd700" stroke-width="2" transform="rotate(5 330 195)"/>
        <path d="M 325 170 Q 327 168, 329 170" fill="none" stroke="#8b7355" stroke-width="2"/>

        <ellipse cx="360" cy="190" rx="12" ry="25" fill="#ffe135" stroke="#ffd700" stroke-width="2" transform="rotate(10 360 190)"/>
        <path d="M 355 165 Q 357 163, 359 165" fill="none" stroke="#8b7355" stroke-width="2"/>

        <!-- Bottom row: 3 bananas -->
        <ellipse cx="295" cy="270" rx="12" ry="25" fill="#ffe135" stroke="#ffd700" stroke-width="2" transform="rotate(-15 295 270)"/>
        <path d="M 290 245 Q 292 243, 294 245" fill="none" stroke="#8b7355" stroke-width="2"/>

        <ellipse cx="330" cy="275" rx="12" ry="25" fill="#ffe135" stroke="#ffd700" stroke-width="2" transform="rotate(0 330 275)"/>
        <path d="M 325 250 Q 327 248, 329 250" fill="none" stroke="#8b7355" stroke-width="2"/>

        <ellipse cx="365" cy="270" rx="12" ry="25" fill="#ffe135" stroke="#ffd700" stroke-width="2" transform="rotate(15 365 270)"/>
        <path d="M 360 245 Q 362 243, 364 245" fill="none" stroke="#8b7355" stroke-width="2"/>

        <!-- Section 4: 15 Strawberries (fresas) -->
        <path d="M 410 190 L 420 200 L 410 210 L 400 200 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="410" cy="187" r="2" fill="#228b22"/>
        <path d="M 440 190 L 450 200 L 440 210 L 430 200 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="440" cy="187" r="2" fill="#228b22"/>
        <path d="M 470 190 L 480 200 L 470 210 L 460 200 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="470" cy="187" r="2" fill="#228b22"/>

        <path d="M 410 220 L 420 230 L 410 240 L 400 230 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="410" cy="217" r="2" fill="#228b22"/>
        <path d="M 440 220 L 450 230 L 440 240 L 430 230 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="440" cy="217" r="2" fill="#228b22"/>
        <path d="M 470 220 L 480 230 L 470 240 L 460 230 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="470" cy="217" r="2" fill="#228b22"/>

        <path d="M 410 250 L 420 260 L 410 270 L 400 260 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="410" cy="247" r="2" fill="#228b22"/>
        <path d="M 440 250 L 450 260 L 440 270 L 430 260 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="440" cy="247" r="2" fill="#228b22"/>
        <path d="M 470 250 L 480 260 L 470 270 L 460 260 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="470" cy="247" r="2" fill="#228b22"/>

        <path d="M 410 280 L 420 290 L 410 300 L 400 290 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="410" cy="277" r="2" fill="#228b22"/>
        <path d="M 440 280 L 450 290 L 440 300 L 430 290 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="440" cy="277" r="2" fill="#228b22"/>
        <path d="M 470 280 L 480 290 L 470 300 L 460 290 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="470" cy="277" r="2" fill="#228b22"/>

        <path d="M 410 310 L 420 320 L 410 330 L 400 320 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="410" cy="307" r="2" fill="#228b22"/>
        <path d="M 440 310 L 450 320 L 440 330 L 430 320 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="440" cy="307" r="2" fill="#228b22"/>
        <path d="M 470 310 L 480 320 L 470 330 L 460 320 Z" fill="#ff1744" stroke="#c41233" stroke-width="1.5"/>
        <circle cx="470" cy="307" r="2" fill="#228b22"/>

        <!-- Section 5: 3 Watermelons (sandías) -->
        <ellipse cx="530" cy="220" rx="25" ry="30" fill="#2d5016" stroke="#1a3a0f" stroke-width="2"/>
        <path d="M 510 220 Q 530 210, 550 220" stroke="#1a3a0f" stroke-width="2" fill="none"/>
        <path d="M 512 230 Q 530 220, 548 230" stroke="#1a3a0f" stroke-width="2" fill="none"/>
        <path d="M 514 240 Q 530 230, 546 240" stroke="#1a3a0f" stroke-width="2" fill="none"/>

        <ellipse cx="530" cy="280" rx="25" ry="30" fill="#2d5016" stroke="#1a3a0f" stroke-width="2"/>
        <path d="M 510 280 Q 530 270, 550 280" stroke="#1a3a0f" stroke-width="2" fill="none"/>
        <path d="M 512 290 Q 530 280, 548 290" stroke="#1a3a0f" stroke-width="2" fill="none"/>
        <path d="M 514 300 Q 530 290, 546 300" stroke="#1a3a0f" stroke-width="2" fill="none"/>

        <ellipse cx="530" cy="180" rx="25" ry="30" fill="#2d5016" stroke="#1a3a0f" stroke-width="2"/>
        <path d="M 510 180 Q 530 170, 550 180" stroke="#1a3a0f" stroke-width="2" fill="none"/>
        <path d="M 512 190 Q 530 180, 548 190" stroke="#1a3a0f" stroke-width="2" fill="none"/>
        <path d="M 514 200 Q 530 190, 546 200" stroke="#1a3a0f" stroke-width="2" fill="none"/>

        <!-- Title -->
        <text x="300" y="30" font-family="Arial, sans-serif" font-size="24" fill="#333" text-anchor="middle" font-weight="bold">Puesto de Frutas de María</text>
        <text x="300" y="55" font-family="Arial, sans-serif" font-size="16" fill="#666" text-anchor="middle">María's Fruit Stand</text>

        <!-- Labels -->
        <text x="95" y="120" font-family="Arial, sans-serif" font-size="14" fill="#333" text-anchor="middle">Manzanas</text>
        <text x="210" y="120" font-family="Arial, sans-serif" font-size="14" fill="#333" text-anchor="middle">Naranjas</text>
        <text x="315" y="120" font-family="Arial, sans-serif" font-size="14" fill="#333" text-anchor="middle">Plátanos</text>
        <text x="440" y="120" font-family="Arial, sans-serif" font-size="14" fill="#333" text-anchor="middle">Fresas</text>
        <text x="530" y="120" font-family="Arial, sans-serif" font-size="14" fill="#333" text-anchor="middle">Sandías</text>

        <!-- Ground -->
        <rect y="350" width="600" height="50" fill="#d2b48c"/>
      </svg>
    `;

    return svgToDataUri(svg);
  },

  /**
   * Market Day - Stage 2: Colorful Fruits Display
   * Shows fruits organized by color for learning color vocabulary
   */
  marketDay_stage2_colorfulFruits: function() {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
        <!-- Background -->
        <rect width="600" height="400" fill="#f5f5dc"/>

        <!-- Title -->
        <text x="300" y="35" font-family="Arial, sans-serif" font-size="28" fill="#333" text-anchor="middle" font-weight="bold">¡Frutas de Colores!</text>
        <text x="300" y="60" font-family="Arial, sans-serif" font-size="16" fill="#666" text-anchor="middle">Colorful Fruits Display</text>

        <!-- Red Section (Rojo) -->
        <rect x="30" y="90" width="130" height="130" fill="#fff" stroke="#ddd" stroke-width="2" rx="10"/>
        <text x="95" y="110" font-family="Arial, sans-serif" font-size="18" fill="#dc143c" text-anchor="middle" font-weight="bold">ROJO / RED</text>
        <circle cx="65" cy="150" r="18" fill="#dc143c" stroke="#8b0000" stroke-width="2"/>
        <line x1="65" y1="132" x2="65" y2="137" stroke="#654321" stroke-width="2"/>
        <circle cx="125" cy="150" r="18" fill="#dc143c" stroke="#8b0000" stroke-width="2"/>
        <line x1="125" y1="132" x2="125" y2="137" stroke="#654321" stroke-width="2"/>
        <path d="M 65 185 L 75 195 L 65 205 L 55 195 Z" fill="#ff1744" stroke="#c41233" stroke-width="2"/>
        <circle cx="65" cy="182" r="3" fill="#228b22"/>
        <path d="M 125 185 L 135 195 L 125 205 L 115 195 Z" fill="#ff1744" stroke="#c41233" stroke-width="2"/>
        <circle cx="125" cy="182" r="3" fill="#228b22"/>

        <!-- Yellow Section (Amarillo) -->
        <rect x="180" y="90" width="130" height="130" fill="#fff" stroke="#ddd" stroke-width="2" rx="10"/>
        <text x="245" y="110" font-family="Arial, sans-serif" font-size="18" fill="#ffd700" text-anchor="middle" font-weight="bold">AMARILLO</text>
        <text x="245" y="128" font-family="Arial, sans-serif" font-size="14" fill="#daa520" text-anchor="middle">YELLOW</text>
        <path d="M 210 150 Q 215 130, 220 150 Q 225 170, 230 150" fill="#ffe135" stroke="#ffd700" stroke-width="2"/>
        <path d="M 225 150 Q 230 130, 235 150 Q 240 170, 245 150" fill="#ffe135" stroke="#ffd700" stroke-width="2"/>
        <path d="M 240 150 Q 245 130, 250 150 Q 255 170, 260 150" fill="#ffe135" stroke="#ffd700" stroke-width="2"/>
        <circle cx="235" cy="195" r="16" fill="#fff59d" stroke="#f9a825" stroke-width="2"/>
        <path d="M 235 179 L 235 185" stroke="#8b7355" stroke-width="1.5"/>

        <!-- Orange Section (Naranja) -->
        <rect x="330" y="90" width="130" height="130" fill="#fff" stroke="#ddd" stroke-width="2" rx="10"/>
        <text x="395" y="110" font-family="Arial, sans-serif" font-size="18" fill="#ff8c00" text-anchor="middle" font-weight="bold">NARANJA</text>
        <text x="395" y="128" font-family="Arial, sans-serif" font-size="14" fill="#ff7f00" text-anchor="middle">ORANGE</text>
        <circle cx="365" cy="165" r="20" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>
        <circle cx="365" cy="165" r="3" fill="#ff6500"/>
        <circle cx="425" cy="165" r="20" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>
        <circle cx="425" cy="165" r="3" fill="#ff6500"/>
        <circle cx="395" cy="195" r="20" fill="#ff8c00" stroke="#ff6500" stroke-width="2"/>
        <circle cx="395" cy="195" r="3" fill="#ff6500"/>

        <!-- Green Section (Verde) -->
        <rect x="30" y="240" width="130" height="130" fill="#fff" stroke="#ddd" stroke-width="2" rx="10"/>
        <text x="95" y="260" font-family="Arial, sans-serif" font-size="18" fill="#228b22" text-anchor="middle" font-weight="bold">VERDE</text>
        <text x="95" y="278" font-family="Arial, sans-serif" font-size="14" fill="#2e7d32" text-anchor="middle">GREEN</text>
        <ellipse cx="95" cy="320" rx="35" ry="40" fill="#2d5016" stroke="#1a3a0f" stroke-width="2"/>
        <path d="M 65 320 Q 95 305, 125 320" stroke="#1a3a0f" stroke-width="2" fill="none"/>
        <path d="M 68 332 Q 95 317, 122 332" stroke="#1a3a0f" stroke-width="2" fill="none"/>
        <path d="M 71 344 Q 95 329, 119 344" stroke="#1a3a0f" stroke-width="2" fill="none"/>

        <!-- Purple Section (Morado) -->
        <rect x="180" y="240" width="130" height="130" fill="#fff" stroke="#ddd" stroke-width="2" rx="10"/>
        <text x="245" y="260" font-family="Arial, sans-serif" font-size="18" fill="#9c27b0" text-anchor="middle" font-weight="bold">MORADO</text>
        <text x="245" y="278" font-family="Arial, sans-serif" font-size="14" fill="#7b1fa2" text-anchor="middle">PURPLE</text>
        <circle cx="220" cy="310" r="8" fill="#8e44ad" stroke="#6c3483" stroke-width="1.5"/>
        <circle cx="235" cy="305" r="8" fill="#8e44ad" stroke="#6c3483" stroke-width="1.5"/>
        <circle cx="250" cy="310" r="8" fill="#8e44ad" stroke="#6c3483" stroke-width="1.5"/>
        <circle cx="227" cy="325" r="8" fill="#8e44ad" stroke="#6c3483" stroke-width="1.5"/>
        <circle cx="243" cy="325" r="8" fill="#8e44ad" stroke="#6c3483" stroke-width="1.5"/>
        <circle cx="235" cy="340" r="8" fill="#8e44ad" stroke="#6c3483" stroke-width="1.5"/>
        <path d="M 235 290 Q 235 285, 240 285 Q 245 285, 245 290" fill="#654321" stroke="#4a3319" stroke-width="1"/>

        <!-- Pink Section (Rosa) -->
        <rect x="330" y="240" width="130" height="130" fill="#fff" stroke="#ddd" stroke-width="2" rx="10"/>
        <text x="395" y="260" font-family="Arial, sans-serif" font-size="18" fill="#e91e63" text-anchor="middle" font-weight="bold">ROSA / PINK</text>
        <circle cx="365" cy="310" r="16" fill="#ff69b4" stroke="#ff1493" stroke-width="2"/>
        <path d="M 365 294 L 365 300" stroke="#8b4513" stroke-width="2"/>
        <circle cx="425" cy="310" r="16" fill="#ff69b4" stroke="#ff1493" stroke-width="2"/>
        <path d="M 425 294 L 425 300" stroke="#8b4513" stroke-width="2"/>
        <circle cx="395" cy="345" r="16" fill="#ff69b4" stroke="#ff1493" stroke-width="2"/>
        <path d="M 395 329 L 395 335" stroke="#8b4513" stroke-width="2"/>

        <!-- Decorative elements -->
        <path d="M 480 100 L 490 110 L 480 120 L 470 110 Z" fill="#ffd700" opacity="0.6"/>
        <path d="M 510 130 L 520 140 L 510 150 L 500 140 Z" fill="#ff69b4" opacity="0.6"/>
        <path d="M 490 160 L 500 170 L 490 180 L 480 170 Z" fill="#87ceeb" opacity="0.6"/>
        <circle cx="515" cy="200" r="8" fill="#98fb98" opacity="0.6"/>
        <circle cx="485" cy="230" r="8" fill="#ffb6c1" opacity="0.6"/>
      </svg>
    `;

    return svgToDataUri(svg);
  }
};

// Export for use in quest data
if (typeof window !== 'undefined') {
  window.QUEST_IMAGES = QUEST_IMAGES;
}
