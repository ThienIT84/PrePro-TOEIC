// Security Audit Suite for MVC Architecture

export interface SecurityAuditConfig {
  baseUrl: string;
  timeout: number;
  scanDepth: number;
  includeHeaders: boolean;
  includeCookies: boolean;
  includeLocalStorage: boolean;
}

export interface SecurityVulnerability {
  type: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  recommendation: string;
  affectedComponent: string;
  severity: number; // 1-10
  cwe?: string;
  owasp?: string;
}

export interface SecurityAuditResult {
  auditName: string;
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
  infoVulnerabilities: number;
  securityScore: number; // 0-100
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
  duration: number;
}

export class SecurityAuditSuite {
  private config: SecurityAuditConfig;
  private results: SecurityAuditResult[] = [];

  constructor(config: Partial<SecurityAuditConfig> = {}) {
    this.config = {
      baseUrl: 'http://localhost:3000',
      timeout: 30000,
      scanDepth: 3,
      includeHeaders: true,
      includeCookies: true,
      includeLocalStorage: true,
      ...config
    };
  }

  // XSS Vulnerability Scan
  async scanXSSVulnerabilities(): Promise<SecurityAuditResult> {
    console.log('🔍 Scanning for XSS vulnerabilities...');
    
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Check for unescaped user input in DOM
    const userInputs = document.querySelectorAll('input, textarea, select');
    userInputs.forEach((input, index) => {
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        const value = input.value;
        if (this.containsXSSPayload(value)) {
          vulnerabilities.push({
            type: 'high',
            category: 'XSS',
            title: 'Potential XSS in User Input',
            description: `Input field ${index} contains potentially malicious content: ${value}`,
            recommendation: 'Implement proper input validation and output encoding',
            affectedComponent: input.tagName,
            severity: 8,
            cwe: 'CWE-79',
            owasp: 'A03:2021'
          });
        }
      }
    });

    // Check for innerHTML usage
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (script.innerHTML.includes('innerHTML') || script.innerHTML.includes('outerHTML')) {
        vulnerabilities.push({
          type: 'high',
          category: 'XSS',
          title: 'Dangerous DOM Manipulation',
          description: 'Script contains innerHTML/outerHTML usage which can lead to XSS',
          recommendation: 'Use textContent instead of innerHTML for user-controlled content',
          affectedComponent: 'Script',
          severity: 7,
          cwe: 'CWE-79',
          owasp: 'A03:2021'
        });
      }
    });

    return this.createAuditResult('XSS Vulnerability Scan', vulnerabilities);
  }

  // SQL Injection Scan
  async scanSQLInjectionVulnerabilities(): Promise<SecurityAuditResult> {
    console.log('🔍 Scanning for SQL injection vulnerabilities...');
    
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Check for dynamic SQL construction in client-side code
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      const content = script.innerHTML;
      
      // Look for SQL construction patterns
      if (content.includes('SELECT') && content.includes('WHERE') && content.includes('+')) {
        vulnerabilities.push({
          type: 'critical',
          category: 'SQL Injection',
          title: 'Dynamic SQL Construction',
          description: 'Client-side code contains dynamic SQL construction which can lead to SQL injection',
          recommendation: 'Use parameterized queries and avoid string concatenation for SQL',
          affectedComponent: 'Script',
          severity: 9,
          cwe: 'CWE-89',
          owasp: 'A03:2021'
        });
      }
    });

    return this.createAuditResult('SQL Injection Scan', vulnerabilities);
  }

  // Authentication Security Scan
  async scanAuthenticationVulnerabilities(): Promise<SecurityAuditResult> {
    console.log('🔍 Scanning for authentication vulnerabilities...');
    
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Check for hardcoded credentials
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      const content = script.innerHTML;
      
      // Look for hardcoded passwords, API keys, tokens
      const hardcodedPatterns = [
        /password\s*[:=]\s*['"][^'"]+['"]/gi,
        /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
        /token\s*[:=]\s*['"][^'"]+['"]/gi,
        /secret\s*[:=]\s*['"][^'"]+['"]/gi
      ];
      
      hardcodedPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          vulnerabilities.push({
            type: 'critical',
            category: 'Authentication',
            title: 'Hardcoded Credentials',
            description: 'Hardcoded credentials found in client-side code',
            recommendation: 'Move sensitive data to environment variables or secure storage',
            affectedComponent: 'Script',
            severity: 10,
            cwe: 'CWE-798',
            owasp: 'A07:2021'
          });
        }
      });
    });

    // Check for weak session management
    if (localStorage.getItem('sessionToken') || sessionStorage.getItem('sessionToken')) {
      vulnerabilities.push({
        type: 'medium',
        category: 'Authentication',
        title: 'Session Token in Local Storage',
        description: 'Session tokens stored in localStorage/sessionStorage are vulnerable to XSS',
        recommendation: 'Use httpOnly cookies for session management',
        affectedComponent: 'Local Storage',
        severity: 6,
        cwe: 'CWE-315',
        owasp: 'A07:2021'
      });
    }

    return this.createAuditResult('Authentication Security Scan', vulnerabilities);
  }

  // Data Exposure Scan
  async scanDataExposureVulnerabilities(): Promise<SecurityAuditResult> {
    console.log('🔍 Scanning for data exposure vulnerabilities...');
    
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Check for sensitive data in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key!);
      
      if (this.containsSensitiveData(value!)) {
        vulnerabilities.push({
          type: 'high',
          category: 'Data Exposure',
          title: 'Sensitive Data in Local Storage',
          description: `Sensitive data found in localStorage: ${key}`,
          recommendation: 'Remove sensitive data from client-side storage',
          affectedComponent: 'Local Storage',
          severity: 7,
          cwe: 'CWE-200',
          owasp: 'A02:2021'
        });
      }
    }

    // Check for sensitive data in sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key!);
      
      if (this.containsSensitiveData(value!)) {
        vulnerabilities.push({
          type: 'high',
          category: 'Data Exposure',
          title: 'Sensitive Data in Session Storage',
          description: `Sensitive data found in sessionStorage: ${key}`,
          recommendation: 'Remove sensitive data from client-side storage',
          affectedComponent: 'Session Storage',
          severity: 7,
          cwe: 'CWE-200',
          owasp: 'A02:2021'
        });
      }
    }

    // Check for sensitive data in global variables
    const sensitivePatterns = [
      /password/gi,
      /secret/gi,
      /token/gi,
      /key/gi,
      /credential/gi
    ];
    
    sensitivePatterns.forEach(pattern => {
      Object.keys(window).forEach(key => {
        if (pattern.test(key)) {
          vulnerabilities.push({
            type: 'medium',
            category: 'Data Exposure',
            title: 'Sensitive Data in Global Variables',
            description: `Sensitive data found in global variable: ${key}`,
            recommendation: 'Avoid exposing sensitive data in global scope',
            affectedComponent: 'Global Variables',
            severity: 5,
            cwe: 'CWE-200',
            owasp: 'A02:2021'
          });
        }
      });
    });

    return this.createAuditResult('Data Exposure Scan', vulnerabilities);
  }

  // HTTPS and Transport Security Scan
  async scanTransportSecurityVulnerabilities(): Promise<SecurityAuditResult> {
    console.log('🔍 Scanning for transport security vulnerabilities...');
    
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Check if running on HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      vulnerabilities.push({
        type: 'high',
        category: 'Transport Security',
        title: 'HTTP Instead of HTTPS',
        description: 'Application is not using HTTPS, making it vulnerable to man-in-the-middle attacks',
        recommendation: 'Use HTTPS for all communications',
        affectedComponent: 'Transport Layer',
        severity: 8,
        cwe: 'CWE-319',
        owasp: 'A02:2021'
      });
    }

    // Check for mixed content
    const images = document.querySelectorAll('img[src^="http:"]');
    const scripts = document.querySelectorAll('script[src^="http:"]');
    const links = document.querySelectorAll('link[href^="http:"]');
    
    if (images.length > 0 || scripts.length > 0 || links.length > 0) {
      vulnerabilities.push({
        type: 'medium',
        category: 'Transport Security',
        title: 'Mixed Content',
        description: 'Mixed HTTP/HTTPS content detected',
        recommendation: 'Use HTTPS for all resources',
        affectedComponent: 'Mixed Content',
        severity: 6,
        cwe: 'CWE-319',
        owasp: 'A02:2021'
      });
    }

    return this.createAuditResult('Transport Security Scan', vulnerabilities);
  }

  // Run comprehensive security audit
  async runComprehensiveSecurityAudit(): Promise<SecurityAuditResult[]> {
    console.log('🔒 Starting Comprehensive Security Audit...');
    
    const audits = [
      () => this.scanXSSVulnerabilities(),
      () => this.scanSQLInjectionVulnerabilities(),
      () => this.scanAuthenticationVulnerabilities(),
      () => this.scanDataExposureVulnerabilities(),
      () => this.scanTransportSecurityVulnerabilities()
    ];
    
    for (const audit of audits) {
      try {
        const result = await audit();
        this.results.push(result);
        
        console.log(`✅ Security audit completed: ${result.auditName}`);
        console.log(`   - Vulnerabilities: ${result.totalVulnerabilities}`);
        console.log(`   - Security Score: ${result.securityScore}/100`);
      } catch (error) {
        console.error(`❌ Security audit failed: ${error.message}`);
      }
    }
    
    this.generateSecurityReport();
    return this.results;
  }

  // Helper methods
  private containsXSSPayload(value: string): boolean {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<form/i,
      /<input/i,
      /<link/i,
      /<meta/i
    ];
    
    return xssPatterns.some(pattern => pattern.test(value));
  }

  private containsSensitiveData(value: string): boolean {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key/i,
      /credential/i,
      /ssn/i,
      /social security/i,
      /credit card/i,
      /card number/i
    ];
    
    return sensitivePatterns.some(pattern => pattern.test(value));
  }

  private createAuditResult(auditName: string, vulnerabilities: SecurityVulnerability[]): SecurityAuditResult {
    const critical = vulnerabilities.filter(v => v.type === 'critical').length;
    const high = vulnerabilities.filter(v => v.type === 'high').length;
    const medium = vulnerabilities.filter(v => v.type === 'medium').length;
    const low = vulnerabilities.filter(v => v.type === 'low').length;
    const info = vulnerabilities.filter(v => v.type === 'info').length;
    
    // Calculate security score (0-100)
    const totalVulnerabilities = vulnerabilities.length;
    const weightedScore = (critical * 10) + (high * 7) + (medium * 4) + (low * 2) + (info * 1);
    const maxPossibleScore = totalVulnerabilities * 10;
    const securityScore = maxPossibleScore > 0 ? Math.max(0, 100 - (weightedScore / maxPossibleScore) * 100) : 100;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(vulnerabilities);
    
    return {
      auditName,
      totalVulnerabilities,
      criticalVulnerabilities: critical,
      highVulnerabilities: high,
      mediumVulnerabilities: medium,
      lowVulnerabilities: low,
      infoVulnerabilities: info,
      securityScore: Math.round(securityScore),
      vulnerabilities,
      recommendations,
      duration: performance.now()
    };
  }

  private generateRecommendations(vulnerabilities: SecurityVulnerability[]): string[] {
    const recommendations = new Set<string>();
    
    vulnerabilities.forEach(vuln => {
      recommendations.add(vuln.recommendation);
    });
    
    return Array.from(recommendations);
  }

  private generateSecurityReport(): void {
    console.log('\n🔒 Security Audit Report:');
    console.log('========================');
    
    const totalVulnerabilities = this.results.reduce((sum, r) => sum + r.totalVulnerabilities, 0);
    const totalCritical = this.results.reduce((sum, r) => sum + r.criticalVulnerabilities, 0);
    const totalHigh = this.results.reduce((sum, r) => sum + r.highVulnerabilities, 0);
    const totalMedium = this.results.reduce((sum, r) => sum + r.mediumVulnerabilities, 0);
    const totalLow = this.results.reduce((sum, r) => sum + r.lowVulnerabilities, 0);
    const totalInfo = this.results.reduce((sum, r) => sum + r.infoVulnerabilities, 0);
    const avgSecurityScore = this.results.reduce((sum, r) => sum + r.securityScore, 0) / this.results.length;
    
    console.log(`Total Vulnerabilities: ${totalVulnerabilities}`);
    console.log(`Critical: ${totalCritical}`);
    console.log(`High: ${totalHigh}`);
    console.log(`Medium: ${totalMedium}`);
    console.log(`Low: ${totalLow}`);
    console.log(`Info: ${totalInfo}`);
    console.log(`Average Security Score: ${avgSecurityScore.toFixed(1)}/100`);
    
    if (totalCritical > 0) {
      console.log('\n🚨 Critical Vulnerabilities Found:');
      this.results.forEach(result => {
        result.vulnerabilities
          .filter(v => v.type === 'critical')
          .forEach(vuln => {
            console.log(`- ${vuln.title}: ${vuln.description}`);
          });
      });
    }
    
    if (totalHigh > 0) {
      console.log('\n⚠️ High Priority Vulnerabilities:');
      this.results.forEach(result => {
        result.vulnerabilities
          .filter(v => v.type === 'high')
          .forEach(vuln => {
            console.log(`- ${vuln.title}: ${vuln.description}`);
          });
      });
    }
  }

  // Get audit results
  getResults(): SecurityAuditResult[] {
    return [...this.results];
  }

  // Clear results
  clearResults(): void {
    this.results = [];
  }
}

// Export security audit suite instance
export const securityAuditSuite = new SecurityAuditSuite();
