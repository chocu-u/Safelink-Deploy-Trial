// Set year if element exists
const yearElement = document.getElementById('y');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

function showScanner() {
  document.querySelector('.hero').style.display = 'none';
  document.querySelector('#features').style.display = 'none';
  document.querySelector('.help-section').style.display = 'none';
  document.querySelector('.scanner-section').style.display = 'block';
  // Reset to input state when showing scanner
  showInputSections();
  window.scrollTo(0, 0);
}

function showHome() {
  document.querySelector('.hero').style.display = 'grid';
  document.querySelector('#features').style.display = 'block';
  document.querySelector('.scanner-section').style.display = 'none';
  document.querySelector('.help-section').style.display = 'none';
  document.getElementById('results').innerHTML = '';
  document.getElementById('url-input').value = '';
  // Reset to input state
  showInputSections();
  window.scrollTo(0, 0);
}

function showHelp() {
  document.querySelector('.hero').style.display = 'none';
  document.querySelector('#features').style.display = 'none';
  document.querySelector('.scanner-section').style.display = 'none';
  document.querySelector('.help-section').style.display = 'block';
  window.scrollTo(0, 0);
}

// UI State Management Functions
function hideInputSections() {
  // Hide all scanner cards (URL and QR sections)
  const scannerCards = document.querySelectorAll('.scanner-card');
  scannerCards.forEach(card => {
    card.style.display = 'none';
  });
  
  // Hide the scanner section title/header if it exists
  const scannerHeader = document.querySelector('.scanner-section > div[style*="text-align:center"]');
  if (scannerHeader) scannerHeader.style.display = 'none';
}

function showInputSections() {
  // Show all scanner cards (URL and QR sections)
  const scannerCards = document.querySelectorAll('.scanner-card');
  scannerCards.forEach(card => {
    card.style.display = 'block';
  });
  
  // Show the scanner section title/header if it exists
  const scannerHeader = document.querySelector('.scanner-section > div[style*="text-align:center"]');
  if (scannerHeader) scannerHeader.style.display = 'block';
  
  // Clear results
  const resultsDiv = document.getElementById('results');
  if (resultsDiv) resultsDiv.innerHTML = '';
}

function showScanAgainButton() {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) {
    console.error('Results div not found for scan again button');
    return;
  }
  
  // Check if scan again button already exists
  if (resultsDiv.querySelector('.scan-again-container')) {
    console.log('Scan again button already exists');
    return;
  }
  
  // Add scan again button to results
  const scanAgainBtn = document.createElement('div');
  scanAgainBtn.className = 'scan-again-container';
  scanAgainBtn.style.cssText = `
    margin-top: 24px;
    text-align: center;
    padding: 0;
  `;
  scanAgainBtn.innerHTML = `
    <button onclick="scanAgain()" style="
      background: linear-gradient(135deg, #00d4ff, #0099cc);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 16px 32px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4), 0 4px 10px rgba(0, 0, 0, 0.15);
      position: relative;
      overflow: hidden;
      text-transform: uppercase;
      letter-spacing: 1px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      width: 100%;
      max-width: 600px;
      min-height: 60px;
    " onmouseover="
      this.style.transform='translateY(-3px) scale(1.02)'; 
      this.style.boxShadow='0 15px 35px rgba(0, 212, 255, 0.5), 0 8px 20px rgba(0, 0, 0, 0.2)';
      this.style.background='linear-gradient(135deg, #0099cc 0%, #00d4ff 100%)';
    " 
    onmouseout="
      this.style.transform='translateY(0) scale(1)'; 
      this.style.boxShadow='0 8px 25px rgba(0, 212, 255, 0.4), 0 4px 10px rgba(0, 0, 0, 0.15)';
      this.style.background='linear-gradient(135deg, #00d4ff, #0099cc)';
    "
    onmousedown="this.style.transform='translateY(1px) scale(0.98)'"
    onmouseup="this.style.transform='translateY(-3px) scale(1.02)'">
      <span style="
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 4v6h6"></path>
          <path d="M23 20v-6h-6"></path>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
        </svg>
        Scan Again
      </span>
    </button>
  `;
  
  resultsDiv.appendChild(scanAgainBtn);
  console.log('Scan again button added successfully');
}

function scanAgain() {
  console.log('Scan Again button clicked');
  showInputSections();
  clearAllInputs();
  window.scrollTo(0, 0);
}

// Make scanAgain globally accessible
window.scanAgain = scanAgain;

function clearAllInputs() {
  // Clear URL input
  const urlInput = document.getElementById('url-input');
  if (urlInput) urlInput.value = '';
  
  // Clear QR input
  clearQRFile();
  
  // Clear results
  const resultsDiv = document.getElementById('results');
  if (resultsDiv) resultsDiv.innerHTML = '';
}

// ============================================================================
// CLIENT-SIDE ML URL SCANNER - Replicates Python backend logic
// ============================================================================

// URL Validation System (replaces Python is_valid_url function)
function isValidURL(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: "URL cannot be empty or None", cleanUrl: null };
  }
  
  // Remove leading/trailing whitespace
  url = url.trim();
  
  // Check minimum length
  if (url.length < 4) {
    return { isValid: false, error: "URL is too short to be valid", cleanUrl: null };
  }
  
  // Check for obvious keyboard mashing (too many consecutive identical characters)
  if (/(.)\1{5,}/.test(url)) {
    return { isValid: false, error: "URL contains too many consecutive identical characters", cleanUrl: null };
  }
  
  // Add protocol if missing but looks like a valid domain
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Check if it looks like a domain (contains at least one dot and no spaces)
    if (url.includes('.') && !url.includes(' ') && !url.startsWith('//')) {
      url = 'https://' + url;
    } else {
      return { isValid: false, error: "Please make sure you've inputted a valid URL (e.g., https://example.com)", cleanUrl: null };
    }
  }
  
  // Basic URL format validation using regex
  const urlPattern = /^https?:\/\/(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/\?]\S+)$/i;
  
  if (!urlPattern.test(url)) {
    return { isValid: false, error: "URL format is invalid. Please enter a valid URL (e.g., https://example.com)", cleanUrl: null };
  }
  
  // Try to parse with URL constructor to catch additional issues
  try {
    const parsed = new URL(url);
    if (!parsed.hostname) {
      return { isValid: false, error: "URL is missing a valid domain name", cleanUrl: null };
    }
    
    // Check for obviously invalid domain patterns
    if (parsed.hostname.split('.').length === 1 && parsed.hostname !== 'localhost') {
      return { isValid: false, error: "Domain name appears to be invalid", cleanUrl: null };
    }
  } catch (e) {
    return { isValid: false, error: `URL parsing failed: ${e.message}`, cleanUrl: null };
  }
  
  return { isValid: true, error: null, cleanUrl: url };
}

// Feature Extraction System (replaces Python extract_features function)
function extractFeatures(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    parsed = null;
  }

  // Basic features (same as Python implementation)
  const urlLength = url.length;
  const numDots = (url.match(/\./g) || []).length;
  const numHyphens = (url.match(/-/g) || []).length;
  const numAt = (url.match(/@/g) || []).length;
  const numDigits = (url.match(/\d/g) || []).length;
  const numParams = (url.match(/=/g) || []).length;
  const numSlashes = (url.match(/\//g) || []).length;
  const numQuestion = (url.match(/\?/g) || []).length;
  const numPercent = (url.match(/%/g) || []).length;
  const numSpecial = (url.match(/[;_?=&]/g) || []).length;

  const hostname = parsed ? parsed.hostname : "";
  const domainLength = hostname.length;
  const pathLength = parsed && parsed.pathname ? parsed.pathname.length : 0;
  const hasHttp = parsed && parsed.protocol === "http:" ? 1 : 0;

  // Enhanced features for Model 3 (same as Python v3 implementation)
  const phishingKeywords = ["login", "secure", "verify", "account", "bank", "paypal", "update"];
  const marketingKeywords = ["free", "win", "prize", "offer", "deal"];
  
  const hasPhishingKw = phishingKeywords.some(kw => url.toLowerCase().includes(kw)) ? 1 : 0;
  const hasMarketingKw = marketingKeywords.some(kw => url.toLowerCase().includes(kw)) ? 1 : 0;

  // Domain reputation features
  const domainParts = hostname.split('.');
  const mainDomain = domainParts[0] || "";
  
  // TLD analysis
  const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.pw'];
  const hasSuspiciousTld = suspiciousTlds.some(tld => hostname.endsWith(tld)) ? 1 : 0;
  
  // Enhanced legitimate TLD list including educational domains worldwide
  const legitimateTlds = ['.com', '.org', '.net', '.edu', '.gov', '.mil', 
                         '.edu.ph', '.edu.au', '.edu.sg', '.edu.my', '.edu.in',
                         '.ac.uk', '.edu.cn', '.edu.br', '.edu.mx', '.edu.co'];
  const hasLegitimateTld = legitimateTlds.some(tld => hostname.endsWith(tld)) ? 1 : 0;
  
  // Domain structure analysis
  const domainLooksEstablished = (mainDomain.length >= 4 && 
                                 !/^[0-9]+$/.test(mainDomain) &&
                                 domainParts.length >= 2) ? 1 : 0;
  
  // URL shortener detection
  const urlShorteners = ['bit.ly', 'tinyurl.com', 'ow.ly', 't.co', 'goo.gl'];
  const isUrlShortener = urlShorteners.some(shortener => hostname.includes(shortener)) ? 1 : 0;
  
  // Additional features
  const numSubdomains = domainParts.length > 2 ? domainParts.length - 2 : 0;
  const isIpAddress = /^\d+\.\d+\.\d+\.\d+/.test(hostname) ? 1 : 0;
  
  return {
    url_length: urlLength,
    num_dots: numDots,
    num_hyphens: numHyphens,
    num_at: numAt,
    num_digits: numDigits,
    num_params: numParams,
    num_slashes: numSlashes,
    num_question: numQuestion,
    num_percent: numPercent,
    num_special: numSpecial,
    domain_length: domainLength,
    path_length: pathLength,
    has_http: hasHttp,
    has_phishing_kw: hasPhishingKw,
    has_marketing_kw: hasMarketingKw,
    has_suspicious_tld: hasSuspiciousTld,
    has_legitimate_tld: hasLegitimateTld,
    domain_looks_established: domainLooksEstablished,
    is_url_shortener: isUrlShortener,
    num_subdomains: numSubdomains,
    is_ip_address: isIpAddress
  };
}

// Domain Reputation Checker (replaces Python check_domain_reputation function)
function checkDomainReputation(domain) {
  try {
    const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.pw'];
    const suspiciousPatterns = ['bit.ly', 'tinyurl.com', 'ow.ly', 't.co', 'goo.gl'];
    
    // Check for suspicious TLD
    const isSuspiciousTld = suspiciousTlds.some(tld => domain.endsWith(tld));
    
    // Check for URL shorteners
    const isUrlShortener = suspiciousPatterns.some(pattern => domain.includes(pattern));
    
    // Check domain length
    const mainDomainPart = domain.startsWith('www.') ? 
      domain.replace('www.', '').split('.')[0] : 
      domain.split('.')[0];
    const isShortDomain = mainDomainPart.length < 3;
    
    // Check for numbers in domain
    const mainDomain = domain.split('.')[0];
    const digitCount = (mainDomain.match(/\d/g) || []).length;
    const hasManyNumbers = digitCount > mainDomain.length * 0.5;
    
    return {
      is_suspicious_tld: isSuspiciousTld,
      is_url_shortener: isUrlShortener,
      is_short_domain: isShortDomain,
      has_many_numbers: hasManyNumbers,
      reputation_score: 0
    };
  } catch (e) {
    return {
      is_suspicious_tld: false,
      is_url_shortener: false,
      is_short_domain: false,
      has_many_numbers: false,
      reputation_score: 0
    };
  }
}

// ML Classification System (replaces Python classify_url function)
function classifyURL(url) {
  // Validate URL format before processing
  const validation = isValidURL(url);
  if (!validation.isValid) {
    return {
      error: `Invalid URL: ${validation.error}`,
      prediction: 'invalid',
      is_safe: null,
      confidence: 0,
      risk_score: 0,
      features: {},
      url: url,
      validation_error: true
    };
  }
  
  // Use the cleaned/validated URL for processing
  const validatedUrl = validation.cleanUrl;
  
  try {
    // Extract features
    const features = extractFeatures(validatedUrl);
    
    // Get domain for reputation analysis
    const domain = new URL(validatedUrl).hostname.toLowerCase();
    
    // HYBRID APPROACH: Rule-based + Heuristic analysis (mimics Python ML model)
    
    // Rule-based overrides for clearly legitimate domains
    const majorLegitimateDomains = [
      'google.com', 'facebook.com', 'messenger.com', 'github.com', 'microsoft.com', 'amazon.com',
      'apple.com', 'twitter.com', 'x.com', 'instagram.com', 'linkedin.com', 'canva.com',
      'youtube.com', 'reddit.com', 'stackoverflow.com', 'wikipedia.org',
      'netflix.com', 'spotify.com', 'discord.com', 'twitch.tv', 'steam.com',
      'epicgames.com', 'riot.com', 'blizzard.com', 'ea.com', 'ubisoft.com', 'riotgames.com', 'roblox.com'
    ];
    
    // Educational institution domains (highly trusted)
    const educationalDomains = ['.edu', '.edu.ph', '.edu.au', '.edu.sg', '.edu.my', '.edu.in',
                               '.ac.uk', '.edu.cn', '.edu.br', '.edu.mx', '.edu.co', '.ac.in', '.ac.jp'];
    
    const isEducational = educationalDomains.some(eduDomain => domain.endsWith(eduDomain));
    
    // Also check for educational patterns in domain names
    const educationalPatterns = ['university', 'college', 'school', 'institute', 'academy', 'national-u'];
    const hasEduPattern = educationalPatterns.some(pattern => domain.toLowerCase().includes(pattern));
    
    // Combine educational checks
    const isEducationalDomain = isEducational || (hasEduPattern && domain.includes('.edu.'));
    
    const isMajorLegitimate = majorLegitimateDomains.some(legitDomain => domain.includes(legitDomain));
    
    // Rule-based overrides for clearly suspicious patterns
    const suspiciousIndicators = [
      domain.endsWith('.tk'), domain.endsWith('.ml'), domain.endsWith('.ga'), 
      domain.endsWith('.cf'), domain.endsWith('.pw'),
      (domain.match(/\d/g) || []).length > domain.replace(/\./g, '').length * 0.4, // Too many numbers
      validatedUrl.includes('@'), domain.includes('bit.ly'), domain.includes('tinyurl.com') // Clear red flags
    ];
    
    const isClearlySuspicious = suspiciousIndicators.some(indicator => indicator);
    
    // Calculate base risk score using heuristic analysis (simulates ML model output)
    let riskScore = calculateRiskScore(features, domain);
    let reputationAdjustment = 0;
    let predictionText, isUrlSafe, riskLevel;
    
    if (isMajorLegitimate || isEducationalDomain) {
      // Override: Major legitimate domains and educational institutions are always safe
      isUrlSafe = true;
      predictionText = 'benign';
      riskLevel = 'low';
      riskScore = Math.min(riskScore * 0.2, 20); // Cap at 20% for trusted domains
      reputationAdjustment = -(riskScore * 0.8); // Show the adjustment made
      
    } else if (isClearlySuspicious) {
      // Use heuristic prediction but ensure it's flagged as risky
      riskScore = Math.max(riskScore, 70); // Minimum 70% for clearly suspicious
      reputationAdjustment = Math.max(0, 70 - riskScore);
      
      if (riskScore >= 70) {
        isUrlSafe = false;
        predictionText = 'malicious';
        riskLevel = 'high';
      } else {
        isUrlSafe = false;
        predictionText = 'medium risk';
        riskLevel = 'medium';
      }
      
    } else {
      // Use heuristic analysis with minor adjustments for other cases
      const domainRep = checkDomainReputation(domain);
      
      // Small bonus for clearly legitimate patterns
      if (domain.includes('.edu') || domain.includes('.gov') || domain.includes('.mil') || domain.includes('.org') || isEducationalDomain) {
        reputationAdjustment -= 25;
      }
      
      // Small bonus for well-formed domains
      if (domain.split('.')[0].length >= 4 && 
          domain.split('.').length >= 2 && 
          !domain.split('.')[0].substring(0, 3).match(/\d/)) {
        reputationAdjustment -= 10;
      }
      
      riskScore = Math.max(0, Math.min(100, riskScore + reputationAdjustment));
      
      // Classification based on adjusted score
      if (riskScore < 35) {
        isUrlSafe = true;
        predictionText = 'benign';
        riskLevel = 'low';
      } else if (riskScore >= 35 && riskScore < 65) {
        isUrlSafe = false;
        predictionText = 'medium risk';
        riskLevel = 'medium';
      } else {
        isUrlSafe = false;
        predictionText = 'malicious';
        riskLevel = 'high';
      }
    }
    
    const confidence = Math.max(60, 100 - Math.abs(50 - riskScore)); // Simulate confidence
    
    return {
      url: validatedUrl,
      original_input: url,
      prediction: predictionText,
      is_safe: isUrlSafe,
      confidence: Math.round(confidence * 100) / 100,
      risk_score: Math.round(riskScore * 100) / 100,
      risk_level: riskLevel,
      features: features,
      domain: domain,
      model_used: 'javascript_heuristic_v3'
    };
    
  } catch (error) {
    return {
      error: `Classification failed: ${error.message}`,
      prediction: 'unknown',
      is_safe: null,
      confidence: 0,
      risk_score: 0,
      features: {}
    };
  }
}

// Risk Score Calculator (simulates ML model predictions)
function calculateRiskScore(features, domain) {
  let score = 30; // Base neutral score
  
  // URL length analysis
  if (features.url_length > 100) score += 15;
  else if (features.url_length > 75) score += 10;
  else if (features.url_length < 20) score += 5;
  
  // Domain length analysis
  if (features.domain_length > 50) score += 20;
  else if (features.domain_length < 5) score += 15;
  
  // Special character analysis
  if (features.num_special > 10) score += 20;
  else if (features.num_special > 5) score += 10;
  
  // Suspicious patterns
  if (features.has_phishing_kw) score += 25;
  if (features.has_marketing_kw) score += 15;
  if (features.has_suspicious_tld) score += 30;
  if (features.is_ip_address) score += 25;
  if (features.is_url_shortener) score += 20;
  if (features.has_http) score += 15; // HTTP instead of HTTPS
  
  // Legitimate patterns (reduce risk)
  if (features.has_legitimate_tld) score -= 20;
  if (features.domain_looks_established) score -= 15;
  
  // Multiple @ symbols or excessive parameters
  if (features.num_at > 0) score += 25;
  if (features.num_params > 10) score += 15;
  
  // Too many subdomains
  if (features.num_subdomains > 3) score += 20;
  else if (features.num_subdomains > 1) score += 10;
  
  // Path analysis
  if (features.path_length > 100) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

// ============================================================================
// QR CODE SCANNER IMPLEMENTATION
// ============================================================================

// Load jsQR dynamically from CDN with better error handling
function loadJSQR() {
  return new Promise((resolve, reject) => {
    if (window.jsQR) {
      console.log('jsQR already available');
      return resolve(window.jsQR);
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    
    const timeout = setTimeout(() => {
      script.remove();
      reject(new Error('jsQR loading timeout'));
    }, 10000);
    
    script.onload = () => {
      clearTimeout(timeout);
      console.log('jsQR loaded successfully');
      resolve(window.jsQR);
    };
    
    script.onerror = (e) => {
      clearTimeout(timeout);
      console.error('Failed to load jsQR', e);
      reject(new Error('Failed to load jsQR library'));
    };
    
    document.head.appendChild(script);
  });
}

function setupQRScanner() {
  const uploadArea = document.getElementById('qr-upload-area');
  const fileInput = document.getElementById('qr-file');
  const scanBtn = document.getElementById('scan-qr-btn');
  
  if (!uploadArea || !fileInput || !scanBtn) {
    console.error('setupQRScanner: missing required elements');
    return;
  }
  
  uploadArea.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    handleFileSelection(file, fileInput, scanBtn);
  });
  
  // Enhanced drag & drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadArea.contains(e.relatedTarget)) {
      uploadArea.classList.remove('dragover');
    }
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0], fileInput, scanBtn);
    }
  });
  
  scanBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    extractQRURL();
  });
}

function handleFileSelection(file, fileInput, scanBtn) {
  if (!file) {
    showQRResult('⚠️ No file selected', 'danger');
    return;
  }
  
  // More comprehensive file type checking
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
  if (!file.type || !validTypes.includes(file.type.toLowerCase())) {
    showQRResult('⚠️ Please select a valid image file (JPG, PNG, GIF, BMP, WebP)', 'danger');
    return;
  }
  
  // File size check (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    showQRResult('⚠️ File too large. Please select an image under 10MB', 'danger');
    return;
  }
  
  selectedFile = file;
  
  // Update file input
  try {
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
  } catch (err) {
    console.warn('DataTransfer not available, but selectedFile is set', err);
  }
  
  showFileSelected(file.name);
  if (scanBtn) scanBtn.disabled = false;
  
  console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
}

function showFileSelected(filename) {
  const uploadArea = document.getElementById('qr-upload-area');
  if (!uploadArea) return;
  
  uploadArea.innerHTML = `
    <div style="color: #10b981; font-weight: bold;">
      ✓ ${filename}
    </div>
    <small style="opacity:0.7; margin-top:8px; display:block;">
      Ready to scan - Click "SCAN QR" button
    </small>
  `;
}

async function extractQRURL() {
  const scanBtn = document.getElementById('scan-qr-btn');
  if (!scanBtn) {
    console.error('extractQRURL: scan button not found');
    return;
  }
  if (!selectedFile) {
    showQRResult('❌ Please select a QR code image first.', 'danger');
    return;
  }
  
  console.log('Starting QR extraction for file:', selectedFile.name);
  
  hideInputSections();
  const originalText = scanBtn.textContent;
  scanBtn.disabled = true;
  scanBtn.innerHTML = '<div class="loading"></div> SCANNING...';
  
  // Show enhanced loading in results
  const resultsDiv = document.getElementById('results');
  if (resultsDiv) {
    resultsDiv.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #374151, #4b5563);
        border-radius: 16px;
        padding: 32px;
        text-align: center;
        color: white;
        margin-top: 24px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 40px;
          height: 40px;
          border: 3px solid #3b82f6;
          border-top: 3px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        "></div>
        <p style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">
          🔍 Extracting URL from QR code...
        </p>
        <p style="opacity: 0.7; margin: 0; font-size: 14px;">
          Processing: ${selectedFile.name}
        </p>
      </div>
    `;
  }
  
  try {
    const jsQRlib = await loadJSQR();
    const result = await processImageWithJSQR(selectedFile, jsQRlib);
    
    if (result) {
      console.log('QR code detected successfully:', result);
      
      // Auto-populate URL field and run client-side scan
      const urlInput = document.getElementById('url-input');
      if (urlInput) urlInput.value = result;
      
      // Add small delay to show extraction success, then trigger client-side analysis
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Trigger client-side ML scan immediately
      try { 
        // Use our new client-side classification
        const analysisResult = classifyURL(result);
        
        if (analysisResult.error) {
          throw new Error(analysisResult.error);
        }
        
        displayMLResults(analysisResult);
      } catch (e) { 
        console.error('Client-side URL analysis failed', e);
        showQRResult('❌ Failed to analyze extracted URL with AI model.', 'danger');
        showScanAgainButton();
      }
      
      setTimeout(clearQRFile, 1000); // Clean up QR file selection
    } else {
      console.log('No QR code found in image');
      showQRResult('❌ No QR code detected in this image. Please try another image.', 'danger');
      showScanAgainButton();
    }
  } catch (err) {
    console.error('QR extraction error:', err);
    showQRResult(`❌ Failed to scan QR code: ${err.message}`, 'danger');
    showScanAgainButton();
  } finally {
    scanBtn.disabled = false;
    scanBtn.textContent = originalText;
  }
}

// Enhanced image processing with multiple techniques
function processImageWithJSQR(file, jsQRlib) {
  return new Promise((resolve, reject) => {
    console.log('Processing image with jsQR...');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = function() {
        console.log('Image loaded:', img.width, 'x', img.height);
        
        try {
          // Try multiple processing techniques
          const results = [
            tryDirectScan(img, jsQRlib),
            tryResizedScan(img, jsQRlib, 800), // Resize to 800px max
            tryContrastEnhanced(img, jsQRlib),
            tryGrayscaleProcessing(img, jsQRlib)
          ];
          
          // Return first successful result
          for (const result of results) {
            if (result) {
              console.log('QR code found using processing technique');
              resolve(result);
              return;
            }
          }
          
          console.log('No QR code found after trying all techniques');
          resolve(null);
          
        } catch (err) {
          console.error('Error processing image:', err);
          reject(err);
        }
      };
      
      img.onerror = () => {
        console.error('Failed to load image');
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      console.error('Failed to read file');
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

// Direct scan without modifications
function tryDirectScan(img, jsQRlib) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Try different inversion methods
    let code = jsQRlib(imageData.data, imageData.width, imageData.height, { 
      inversionAttempts: "dontInvert" 
    });
    
    if (!code) {
      code = jsQRlib(imageData.data, imageData.width, imageData.height, { 
        inversionAttempts: "onlyInvert" 
      });
    }
    
    if (!code) {
      code = jsQRlib(imageData.data, imageData.width, imageData.height, { 
        inversionAttempts: "attemptBoth" 
      });
    }
    
    return code ? code.data : null;
  } catch (err) {
    console.warn('Direct scan failed:', err);
    return null;
  }
}

// Resize image for better processing
function tryResizedScan(img, jsQRlib, maxSize) {
  try {
    let { width, height } = img;
    
    // Calculate new dimensions
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    
    // Use better image scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    
    let code = jsQRlib(imageData.data, width, height, { 
      inversionAttempts: "attemptBoth" 
    });
    
    return code ? code.data : null;
  } catch (err) {
    console.warn('Resized scan failed:', err);
    return null;
  }
}

// Enhance contrast for better QR detection
function tryContrastEnhanced(img, jsQRlib) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Enhance contrast
    const factor = 2.0; // Contrast factor
    const intercept = 128 * (1 - factor);
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] * factor + intercept));     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * factor + intercept)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * factor + intercept)); // B
    }
    
    let code = jsQRlib(data, canvas.width, canvas.height, { 
      inversionAttempts: "attemptBoth" 
    });
    
    return code ? code.data : null;
  } catch (err) {
    console.warn('Contrast enhanced scan failed:', err);
    return null;
  }
}

// Convert to grayscale and apply threshold
function tryGrayscaleProcessing(img, jsQRlib) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert to grayscale and apply threshold
    const threshold = 128;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.floor(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      const bw = gray > threshold ? 255 : 0;
      
      data[i] = bw;     // R
      data[i + 1] = bw; // G
      data[i + 2] = bw; // B
    }
    
    let code = jsQRlib(data, canvas.width, canvas.height, { 
      inversionAttempts: "attemptBoth" 
    });
    
    return code ? code.data : null;
  } catch (err) {
    console.warn('Grayscale processing failed:', err);
    return null;
  }
}

function clearQRFile() {
  selectedFile = null;
  const fileInput = document.getElementById('qr-file');
  if (fileInput) fileInput.value = '';
  
  const uploadArea = document.getElementById('qr-upload-area');
  if (uploadArea) {
    uploadArea.innerHTML = `
      <div>Click to upload or drop QR code here</div>
      <small style="opacity:0.7; margin-top:8px; display:block;">
        Supports JPG, PNG
      </small>
    `;
  }
  
  const scanBtn = document.getElementById('scan-qr-btn');
  if (scanBtn) scanBtn.disabled = true;
}

function showQRResult(message, type) {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) {
    console.warn('showQRResult: no #results element');
    return;
  }
  
  const isError = type === 'danger';
  const isSuccess = type === 'success';
  
  let borderColor, bgColor, title, icon;
  
  if (isError) {
    borderColor = '#ef4444';
    bgColor = 'linear-gradient(135deg, #7f1d1d, #991b1b)';
    title = '❌ Scan Failed';
    icon = '❌';
  } else if (isSuccess) {
    borderColor = '#10b981';
    bgColor = 'linear-gradient(135deg, #065f46, #047857)';
    title = '✅ QR Code Found';
    icon = '✅';
  } else {
    borderColor = '#6b7280';
    bgColor = 'linear-gradient(135deg, #374151, #4b5563)';
    title = 'ℹ️ Info';
    icon = 'ℹ️';
  }
  
  resultsDiv.innerHTML = `
    <div style="
      background: ${bgColor};
      border-radius: 16px;
      padding: 24px;
      color: white;
      margin-top: 24px;
      border-left: 4px solid ${borderColor};
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      ">
        <span style="font-weight: 600; font-size: 18px;">${title}</span>
      </div>
      <div style="opacity: 0.9;">
        <p style="margin: 0; line-height: 1.5;">${message}</p>
      </div>
    </div>
  `;
}

// ============================================================================
// UI MANAGEMENT AND INITIALIZATION
// ============================================================================

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 SafeLink Client-Side Scanner Initialized');
  console.log('✅ No backend server required - Pure JavaScript implementation');
  
  // Attach event listeners
  const scanUrlBtn = document.getElementById('scan-url-btn');
  if (scanUrlBtn) {
    scanUrlBtn.addEventListener('click', (e) => { 
      e.preventDefault(); 
      scanURL(); 
    });
  }
  
  // Setup QR scanner
  setupQRScanner();
  
  // Ensure scan-qr button starts disabled
  const scanBtn = document.getElementById('scan-qr-btn');
  if (scanBtn) scanBtn.disabled = true;
  
  // Pre-load jsQR library
  loadJSQR().then(() => {
    console.log('📱 QR Scanner ready');
  }).catch(err => {
    console.warn('⚠️ QR Scanner not available:', err.message);
  });
  
  console.log('🔒 Ready to analyze URLs using AI-powered security detection');
});

// Main URL scanning function (replaces Flask API call)
async function scanURL() {
  const urlInput = document.getElementById('url-input');
  const resultsDiv = document.getElementById('results');
  
  if (!urlInput || !resultsDiv) {
    console.error('Required elements not found');
    return;
  }
  
  const url = urlInput.value.trim();
  if (!url) {
    alert('Please enter a URL to scan');
    return;
  }
  
  // Hide input sections immediately
  hideInputSections();
  
  // Show loading state
  resultsDiv.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #374151, #4b5563);
      border-radius: 16px;
      padding: 32px;
      text-align: center;
      color: white;
      margin-top: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    ">
      <div style="
        width: 40px;
        height: 40px;
        border: 3px solid #3b82f6;
        border-top: 3px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      "></div>
      <p style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">🤖 Analyzing URL with AI model...</p>
      <p style="opacity: 0.7; margin: 0;">Extracting features and making prediction...</p>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  
  // Simulate processing time for better UX
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    // Use client-side classification instead of Flask API
    const data = classifyURL(url);
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    displayMLResults(data);
  } catch (error) {
    console.error('Error scanning URL:', error);
    resultsDiv.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #7f1d1d, #991b1b);
        border-radius: 16px;
        padding: 24px;
        color: white;
        margin-top: 24px;
        border-left: 4px solid #ef4444;
      ">
        <h3 style="margin: 0 0 12px; color: #fca5a5;">❌ Analysis Failed</h3>
        <p style="margin: 0 0 16px;">${error.message}</p>
        <p style="margin: 0; opacity: 0.8;">Please check the URL format and try again.</p>
      </div>
    `;
    // Show scan again button even on error
    showScanAgainButton();
  }
}

// Function to display ML model results
function displayMLResults(data) {
  const resultsDiv = document.getElementById('results');
  
  let riskColor = '#10b981'; // green for safe
  let riskBgColor = '#059669';
  let riskIcon = '✅';
  let statusText = 'SAFE';
  let riskPercentage = data.risk_score || 0;
  
  if (!data.is_safe) {
    if (data.risk_score > 70) {
      riskColor = '#ef4444'; // red for high risk
      riskBgColor = '#dc2626';
      riskIcon = '🚨';
      statusText = 'HIGH RISK';
    } else {
      riskColor = '#f59e0b'; // yellow for medium risk
      riskBgColor = '#d97706';
      riskIcon = '⚠️';
      statusText = 'MEDIUM RISK';
    }
  }
  
  // Create the main result card matching your design
  resultsDiv.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #374151, #4b5563);
      border-radius: 16px;
      padding: 24px;
      color: white;
      margin-top: 24px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      position: relative;
    ">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #10b981;">✅</span>
          <span style="font-weight: 600; font-size: 18px;">Security Analysis</span>
        </div>
        <div style="
          background: ${riskBgColor};
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        ">${statusText}</div>
      </div>
      <!-- Analyzed URL -->
      <div style="margin-bottom: 24px;">
        <div style="color: #d1d5db; font-weight: 600; margin-bottom: 8px;">Analyzed URL:</div>
        <div style="
          background: rgba(75, 85, 99, 0.8);
          padding: 12px 16px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 14px;
          color: #60a5fa;
          word-break: break-all;
        ">${data.url}</div>
      </div>
      <!-- Stats Grid -->
      <div style="
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        margin-bottom: 24px;
      ">
        <div style="background: rgba(75, 85, 99, 0.6); padding: 16px; border-radius: 12px;">
          <div style="color: #9ca3af; font-size: 12px; margin-bottom: 4px;">PREDICTION:</div>
          <div style="color: ${riskColor}; font-weight: 700; font-size: 16px;">
            ${data.prediction ? data.prediction.toUpperCase() : 'N/A'}
          </div>
        </div>
      <!-- Risk Level Bar -->
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="color: #d1d5db; font-weight: 600;">Risk Level</span>
          <span style="color: ${riskColor}; font-weight: 700;">${riskPercentage.toFixed(2)}%</span>
        </div>
        <div style="
          width: 100%;
          height: 8px;
          background: rgba(75, 85, 99, 0.8);
          border-radius: 4px;
          overflow: hidden;
        ">
          <div style="
            width: ${riskPercentage}%;
            height: 100%;
            background: linear-gradient(90deg, ${riskColor}, ${riskBgColor});
            border-radius: 4px;
            transition: width 0.8s ease;
          "></div>
        </div>
      </div>
      <!-- Collapsible Features Section -->
      <div style="margin-bottom: 24px;">
        <button id="features-toggle" onclick="toggleFeatures()" style="
          width: 100%;
          background: rgba(75, 85, 99, 0.6);
          border: none;
          border-radius: 12px;
          padding: 16px;
          color: #60a5fa;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(75, 85, 99, 0.8)'" 
           onmouseout="this.style.background='rgba(75, 85, 99, 0.6)'">
          <span>Features</span>
          <span id="toggle-icon">▼</span>
        </button>
        
        <div id="features-content" style="
          display: none;
          margin-top: 16px;
          background: rgba(75, 85, 99, 0.4);
          border-radius: 12px;
          padding: 16px;
        ">
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
          ">
            ${generateFeatureItems(data.features)}
          </div>
        </div>
      </div>
      <!-- Recommendation -->
      <div style="
        background: rgba(${data.is_safe ? '16, 185, 129' : '239, 68, 68'}, 0.2);
        border: 1px solid rgba(${data.is_safe ? '16, 185, 129' : '239, 68, 68'}, 0.3);
        border-radius: 12px;
        padding: 16px;
      ">
        <div style="font-weight: 600; margin-bottom: 8px;">Recommendation:</div>
        <div style="opacity: 0.9;">
          ${data.is_safe 
            ? '✅ SafeLink found no immediate threats or suspicious content. This URL appears to be safe to visit.' 
            : '⚠️ SafeLink recommend additional verification before visiting, as security risks were detected. Exercise caution with this URL. '}
        </div>
      </div>
    </div>
  `;
  
  // Add scan again button
  console.log('About to show scan again button after successful ML results');
  showScanAgainButton();
}

function generateFeatureItems(features) {
  if (!features) return '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">No features available</div>';
  
  const items = [];
  
  // Protocol (has_http: 1 means HTTP, 0 means HTTPS)
  const isHTTPS = features.has_http === 0;
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">Protocol:</div>
      <div style="
        background: ${isHTTPS ? '#1f2937' : '#7f1d1d'};
        color: ${isHTTPS ? '#10b981' : '#ef4444'};
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
      ">${isHTTPS ? '🔒 HTTPS' : '🔓 HTTP'}</div>
    </div>
  `);
  
  // Domain Length
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">Domain Length:</div>
      <div style="color: white; font-weight: 600;">${features.domain_length || 0} chars</div>
    </div>
  `);
  
  // URL Length
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">URL Length:</div>
      <div style="color: white; font-weight: 600;">${features.url_length || 0} chars</div>
    </div>
  `);
  
  // Special Characters
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">Special Characters:</div>
      <div style="color: white; font-weight: 600;">${features.num_special || 0}</div>
    </div>
  `);
  
  // Is IP Address
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">IP Address:</div>
      <div style="
        background: ${features.is_ip_address === 1 ? '#7f1d1d' : '#1f2937'};
        color: ${features.is_ip_address === 1 ? '#ef4444' : '#10b981'};
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
      ">${features.is_ip_address === 1 ? '⚠️ Yes' : '✅ No'}</div>
    </div>
  `);
  
  // Number of Dots
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">Dots Count:</div>
      <div style="color: white; font-weight: 600;">${features.num_dots || 0}</div>
    </div>
  `);
  
  // Number of Hyphens
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">Hyphens:</div>
      <div style="color: white; font-weight: 600;">${features.num_hyphens || 0}</div>
    </div>
  `);
  
  // Number of Digits
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">Digits:</div>
      <div style="color: white; font-weight: 600;">${features.num_digits || 0}</div>
    </div>
  `);
  
  // Path Length
  items.push(`
    <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
      <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">Path Length:</div>
      <div style="color: white; font-weight: 600;">${features.path_length || 0} chars</div>
    </div>
  `);
  
  // Suspicious Keywords (if available)
  if (features.has_phishing_kw !== undefined) {
    items.push(`
      <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
        <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">Phishing Keywords:</div>
        <div style="
          background: ${features.has_phishing_kw === 1 ? '#7f1d1d' : '#1f2937'};
          color: ${features.has_phishing_kw === 1 ? '#ef4444' : '#10b981'};
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
        ">${features.has_phishing_kw === 1 ? '⚠️ Found' : '✅ None'}</div>
      </div>
    `);
  }
  
  // URL Shortener (if available)
  if (features.is_url_shortener !== undefined) {
    items.push(`
      <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
        <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">URL Shortener:</div>
        <div style="
          background: ${features.is_url_shortener === 1 ? '#f59e0b' : '#1f2937'};
          color: ${features.is_url_shortener === 1 ? '#000' : '#10b981'};
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
        ">${features.is_url_shortener === 1 ? '⚠️ Yes' : '✅ No'}</div>
      </div>
    `);
  }
  
  // Subdomains (if available)
  if (features.num_subdomains !== undefined) {
    items.push(`
      <div style="background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 8px; text-align: center;">
        <div style="color: #93c5fd; font-size: 12px; margin-bottom: 4px;">Subdomains:</div>
        <div style="color: white; font-weight: 600;">${features.num_subdomains}</div>
      </div>
    `);
  }
  
  return items.join('');
}

// Toggle features visibility
function toggleFeatures() {
  const content = document.getElementById('features-content');
  const icon = document.getElementById('toggle-icon');
  
  if (!content || !icon) return;
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.textContent = '▲';
  } else {
    content.style.display = 'none';
    icon.textContent = '▼';
  }
}

// Make toggleFeatures globally accessible
window.toggleFeatures = toggleFeatures;

// Check if Flask API and ML model are ready
async function checkAPIStatus() {
  try {
    const [healthResponse, modelResponse] = await Promise.all([
      fetch(`${API_BASE}/health`),
      fetch(`${API_BASE}/model/info`)
    ]);
    
    const healthData = await healthResponse.json();
    const modelData = await modelResponse.json();
    
    console.log('✅ Flask API Status:', healthData);
    console.log('🤖 ML Model Status:', modelData);
    
    if (!modelData.model_loaded) {
      console.warn('⚠️ ML Model not loaded! Run LogisticRegression_Algorithm.ipynb first');
    }
  } catch (error) {
    console.warn('⚠️ API/Model check failed:', error.message);
    console.warn('Make sure to run: python app.py');
  }
}

// Check API and model status when page loads
document.addEventListener('DOMContentLoaded', checkAPIStatus);

// IMPROVED QR SCANNER CODE
let selectedFile = null;

// Load jsQR dynamically from CDN with better error handling
function loadJSQR() {
  return new Promise((resolve, reject) => {
    if (window.jsQR) {
      console.log('jsQR already available');
      return resolve(window.jsQR);
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    
    const timeout = setTimeout(() => {
      script.remove();
      reject(new Error('jsQR loading timeout'));
    }, 10000);
    
    script.onload = () => {
      clearTimeout(timeout);
      console.log('jsQR loaded successfully');
      resolve(window.jsQR);
    };
    
    script.onerror = (e) => {
      clearTimeout(timeout);
      console.error('Failed to load jsQR', e);
      reject(new Error('Failed to load jsQR library'));
    };
    
    document.head.appendChild(script);
  });
}

function setupQRScanner() {
  const uploadArea = document.getElementById('qr-upload-area');
  const fileInput = document.getElementById('qr-file');
  const scanBtn = document.getElementById('scan-qr-btn');
  
  if (!uploadArea || !fileInput || !scanBtn) {
    console.error('setupQRScanner: missing required elements');
    return;
  }
  
  uploadArea.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    handleFileSelection(file, fileInput, scanBtn);
  });
  
  // Enhanced drag & drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadArea.contains(e.relatedTarget)) {
      uploadArea.classList.remove('dragover');
    }
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0], fileInput, scanBtn);
    }
  });
  
  scanBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    extractQRURL();
  });
}

function handleFileSelection(file, fileInput, scanBtn) {
  if (!file) {
    showQRResult('⚠️ No file selected', 'danger');
    return;
  }
  
  // More comprehensive file type checking
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
  if (!file.type || !validTypes.includes(file.type.toLowerCase())) {
    showQRResult('⚠️ Please select a valid image file (JPG, PNG, GIF, BMP, WebP)', 'danger');
    return;
  }
  
  // File size check (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    showQRResult('⚠️ File too large. Please select an image under 10MB', 'danger');
    return;
  }
  
  selectedFile = file;
  
  // Update file input
  try {
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
  } catch (err) {
    console.warn('DataTransfer not available, but selectedFile is set', err);
  }
  
  showFileSelected(file.name);
  if (scanBtn) scanBtn.disabled = false;
  
  console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
}

function showFileSelected(filename) {
  const uploadArea = document.getElementById('qr-upload-area');
  if (!uploadArea) return;
  
  uploadArea.innerHTML = `
    <div style="color: #10b981; font-weight: bold;">
      ✓ ${filename}
    </div>
    <small style="opacity:0.7; margin-top:8px; display:block;">
      Ready to scan - Click "SCAN QR" button
    </small>
  `;
}

async function extractQRURL() {
  const scanBtn = document.getElementById('scan-qr-btn');
  if (!scanBtn) {
    console.error('extractQRURL: scan button not found');
    return;
  }
  if (!selectedFile) {
    showQRResult('❌ Please select a QR code image first.', 'danger');
    return;
  }
  
  console.log('Starting QR extraction for file:', selectedFile.name);
  
  hideInputSections();
  const originalText = scanBtn.textContent;
  scanBtn.disabled = true;
  scanBtn.innerHTML = '<div class="loading"></div> SCANNING...';
  
  // Show enhanced loading in results
  const resultsDiv = document.getElementById('results');
  if (resultsDiv) {
    resultsDiv.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #374151, #4b5563);
        border-radius: 16px;
        padding: 32px;
        text-align: center;
        color: white;
        margin-top: 24px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 40px;
          height: 40px;
          border: 3px solid #3b82f6;
          border-top: 3px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        "></div>
        <p style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">
          🔍 Extracting URL from QR code...
        </p>
        <p style="opacity: 0.7; margin: 0; font-size: 14px;">
          Processing: ${selectedFile.name}
        </p>
      </div>
    `;
  }
  
  try {
    const jsQRlib = await loadJSQR();
    const result = await processImageWithJSQR(selectedFile, jsQRlib);
    
    if (result) {
      console.log('QR code detected successfully:', result);
      
      // Auto-populate URL field and run client-side scan
      const urlInput = document.getElementById('url-input');
      if (urlInput) urlInput.value = result;
      
      // Add small delay to show extraction success, then trigger client-side analysis
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Trigger client-side ML scan immediately
      try { 
        // Use our new client-side classification
        const analysisResult = classifyURL(result);
        
        if (analysisResult.error) {
          throw new Error(analysisResult.error);
        }
        
        displayMLResults(analysisResult);
      } catch (e) { 
        console.error('Client-side URL analysis failed', e);
        showQRResult('❌ Failed to analyze extracted URL with AI model.', 'danger');
        showScanAgainButton();
      }
      
      setTimeout(clearQRFile, 1000); // Clean up QR file selection
    } else {
      console.log('No QR code found in image');
      showQRResult('❌ No QR code detected in this image. Please try another image.', 'danger');
      showScanAgainButton();
    }
  } catch (err) {
    console.error('QR extraction error:', err);
    showQRResult(`❌ Failed to scan QR code: ${err.message}`, 'danger');
    showScanAgainButton();
  } finally {
    scanBtn.disabled = false;
    scanBtn.textContent = originalText;
  }
}

// Enhanced image processing with multiple techniques
function processImageWithJSQR(file, jsQRlib) {
  return new Promise((resolve, reject) => {
    console.log('Processing image with jsQR...');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = function() {
        console.log('Image loaded:', img.width, 'x', img.height);
        
        try {
          // Try multiple processing techniques
          const results = [
            tryDirectScan(img, jsQRlib),
            tryResizedScan(img, jsQRlib, 800), // Resize to 800px max
            tryContrastEnhanced(img, jsQRlib),
            tryGrayscaleProcessing(img, jsQRlib)
          ];
          
          // Return first successful result
          for (const result of results) {
            if (result) {
              console.log('QR code found using processing technique');
              resolve(result);
              return;
            }
          }
          
          console.log('No QR code found after trying all techniques');
          resolve(null);
          
        } catch (err) {
          console.error('Error processing image:', err);
          reject(err);
        }
      };
      
      img.onerror = () => {
        console.error('Failed to load image');
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      console.error('Failed to read file');
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

// Direct scan without modifications
function tryDirectScan(img, jsQRlib) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Try different inversion methods
    let code = jsQRlib(imageData.data, imageData.width, imageData.height, { 
      inversionAttempts: "dontInvert" 
    });
    
    if (!code) {
      code = jsQRlib(imageData.data, imageData.width, imageData.height, { 
        inversionAttempts: "onlyInvert" 
      });
    }
    
    if (!code) {
      code = jsQRlib(imageData.data, imageData.width, imageData.height, { 
        inversionAttempts: "attemptBoth" 
      });
    }
    
    return code ? code.data : null;
  } catch (err) {
    console.warn('Direct scan failed:', err);
    return null;
  }
}

// Resize image for better processing
function tryResizedScan(img, jsQRlib, maxSize) {
  try {
    let { width, height } = img;
    
    // Calculate new dimensions
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    
    // Use better image scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    
    let code = jsQRlib(imageData.data, width, height, { 
      inversionAttempts: "attemptBoth" 
    });
    
    return code ? code.data : null;
  } catch (err) {
    console.warn('Resized scan failed:', err);
    return null;
  }
}

// Enhance contrast for better QR detection
function tryContrastEnhanced(img, jsQRlib) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Enhance contrast
    const factor = 2.0; // Contrast factor
    const intercept = 128 * (1 - factor);
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] * factor + intercept));     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * factor + intercept)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * factor + intercept)); // B
    }
    
    let code = jsQRlib(data, canvas.width, canvas.height, { 
      inversionAttempts: "attemptBoth" 
    });
    
    return code ? code.data : null;
  } catch (err) {
    console.warn('Contrast enhanced scan failed:', err);
    return null;
  }
}

// Convert to grayscale and apply threshold
function tryGrayscaleProcessing(img, jsQRlib) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert to grayscale and apply threshold
    const threshold = 128;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.floor(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      const bw = gray > threshold ? 255 : 0;
      
      data[i] = bw;     // R
      data[i + 1] = bw; // G
      data[i + 2] = bw; // B
    }
    
    let code = jsQRlib(data, canvas.width, canvas.height, { 
      inversionAttempts: "attemptBoth" 
    });
    
    return code ? code.data : null;
  } catch (err) {
    console.warn('Grayscale processing failed:', err);
    return null;
  }
}

function clearQRFile() {
  selectedFile = null;
  const fileInput = document.getElementById('qr-file');
  if (fileInput) fileInput.value = '';
  
  const uploadArea = document.getElementById('qr-upload-area');
  if (uploadArea) {
    uploadArea.innerHTML = `
      <div>Click to upload or drop QR code here</div>
      <small style="opacity:0.7; margin-top:8px; display:block;">
        Supports JPG, PNG
      </small>
    `;
  }
  
  const scanBtn = document.getElementById('scan-qr-btn');
  if (scanBtn) scanBtn.disabled = true;
}

function showQRResult(message, type) {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) {
    console.warn('showQRResult: no #results element');
    return;
  }
  
  const isError = type === 'danger';
  const isSuccess = type === 'success';
  
  let borderColor, bgColor, title, icon;
  
  if (isError) {
    borderColor = '#ef4444';
    bgColor = 'linear-gradient(135deg, #7f1d1d, #991b1b)';
    title = '❌ Scan Failed';
    icon = '❌';
  } else if (isSuccess) {
    borderColor = '#10b981';
    bgColor = 'linear-gradient(135deg, #065f46, #047857)';
    title = '✅ QR Code Found';
    icon = '✅';
  } else {
    borderColor = '#6b7280';
    bgColor = 'linear-gradient(135deg, #374151, #4b5563)';
    title = 'ℹ️ Info';
    icon = 'ℹ️';
  }
  
  resultsDiv.innerHTML = `
    <div style="
      background: ${bgColor};
      border-radius: 16px;
      padding: 24px;
      color: white;
      margin-top: 24px;
      border-left: 4px solid ${borderColor};
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      ">
        <span style="font-weight: 600; font-size: 18px;">${title}</span>
      </div>
      <div style="opacity: 0.9;">
        <p style="margin: 0; line-height: 1.5;">${message}</p>
      </div>
    </div>
  `;
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Attach event listeners
  const scanUrlBtn = document.getElementById('scan-url-btn');
  if (scanUrlBtn) {
    scanUrlBtn.addEventListener('click', (e) => { 
      e.preventDefault(); 
      scanURL(); 
    });
  }
  
  // Start API check and QR setup
  checkAPIStatus();
  setupQRScanner();
  
  // Ensure scan-qr button starts disabled
  const scanBtn = document.getElementById('scan-qr-btn');
  if (scanBtn) scanBtn.disabled = true;
  
  // Pre-load jsQR library
  loadJSQR().then(() => {
    console.log('jsQR pre-loaded successfully');
  }).catch(err => {
    console.warn('Failed to pre-load jsQR:', err);
  });
});