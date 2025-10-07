// Load Testing Suite for MVC Architecture

export interface LoadTestConfig {
  baseUrl: string;
  concurrentUsers: number;
  duration: number; // in seconds
  rampUpTime: number; // in seconds
  thinkTime: number; // in milliseconds
  timeout: number; // in milliseconds
}

export interface LoadTestResult {
  testName: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  duration: number;
  errors: LoadTestError[];
}

export interface LoadTestError {
  timestamp: number;
  error: string;
  request: string;
  responseTime: number;
}

export interface LoadTestScenario {
  name: string;
  weight: number; // percentage of total load
  execute: () => Promise<void>;
}

export class LoadTestSuite {
  private config: LoadTestConfig;
  private results: LoadTestResult[] = [];
  private isRunning: boolean = false;
  private startTime: number = 0;
  private endTime: number = 0;

  constructor(config: Partial<LoadTestConfig> = {}) {
    this.config = {
      baseUrl: 'http://localhost:3000',
      concurrentUsers: 10,
      duration: 60,
      rampUpTime: 10,
      thinkTime: 1000,
      timeout: 30000,
      ...config
    };
  }

  // Load Test: Question Creation
  async testQuestionCreationLoad(): Promise<LoadTestResult> {
    console.log('🚀 Starting Question Creation Load Test...');
    
    const scenarios: LoadTestScenario[] = [
      {
        name: 'Create Question',
        weight: 40,
        execute: async () => {
          await this.simulateQuestionCreation();
        }
      },
      {
        name: 'View Questions',
        weight: 30,
        execute: async () => {
          await this.simulateViewQuestions();
        }
      },
      {
        name: 'Search Questions',
        weight: 20,
        execute: async () => {
          await this.simulateSearchQuestions();
        }
      },
      {
        name: 'Delete Question',
        weight: 10,
        execute: async () => {
          await this.simulateDeleteQuestion();
        }
      }
    ];

    return await this.runLoadTest('Question Creation Load Test', scenarios);
  }

  // Load Test: Exam Session
  async testExamSessionLoad(): Promise<LoadTestResult> {
    console.log('🚀 Starting Exam Session Load Test...');
    
    const scenarios: LoadTestScenario[] = [
      {
        name: 'Start Exam',
        weight: 30,
        execute: async () => {
          await this.simulateStartExam();
        }
      },
      {
        name: 'Answer Question',
        weight: 50,
        execute: async () => {
          await this.simulateAnswerQuestion();
        }
      },
      {
        name: 'Submit Exam',
        weight: 20,
        execute: async () => {
          await this.simulateSubmitExam();
        }
      }
    ];

    return await this.runLoadTest('Exam Session Load Test', scenarios);
  }

  // Load Test: Bulk Upload
  async testBulkUploadLoad(): Promise<LoadTestResult> {
    console.log('🚀 Starting Bulk Upload Load Test...');
    
    const scenarios: LoadTestScenario[] = [
      {
        name: 'Upload File',
        weight: 60,
        execute: async () => {
          await this.simulateBulkUpload();
        }
      },
      {
        name: 'Process File',
        weight: 30,
        execute: async () => {
          await this.simulateFileProcessing();
        }
      },
      {
        name: 'View Results',
        weight: 10,
        execute: async () => {
          await this.simulateViewResults();
        }
      }
    ];

    return await this.runLoadTest('Bulk Upload Load Test', scenarios);
  }

  // Load Test: Dashboard
  async testDashboardLoad(): Promise<LoadTestResult> {
    console.log('🚀 Starting Dashboard Load Test...');
    
    const scenarios: LoadTestScenario[] = [
      {
        name: 'Load Dashboard',
        weight: 50,
        execute: async () => {
          await this.simulateLoadDashboard();
        }
      },
      {
        name: 'Load Analytics',
        weight: 30,
        execute: async () => {
          await this.simulateLoadAnalytics();
        }
      },
      {
        name: 'Load Reports',
        weight: 20,
        execute: async () => {
          await this.simulateLoadReports();
        }
      }
    ];

    return await this.runLoadTest('Dashboard Load Test', scenarios);
  }

  // Run comprehensive load test
  async runComprehensiveLoadTest(): Promise<LoadTestResult[]> {
    console.log('🧪 Starting Comprehensive Load Test Suite...');
    
    const tests = [
      () => this.testQuestionCreationLoad(),
      () => this.testExamSessionLoad(),
      () => this.testBulkUploadLoad(),
      () => this.testDashboardLoad()
    ];
    
    for (const test of tests) {
      try {
        const result = await test();
        this.results.push(result);
        
        console.log(`✅ Load test completed: ${result.testName}`);
        console.log(`   - Requests: ${result.totalRequests}`);
        console.log(`   - Success Rate: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%`);
        console.log(`   - Avg Response Time: ${result.averageResponseTime.toFixed(2)}ms`);
        console.log(`   - RPS: ${result.requestsPerSecond.toFixed(2)}`);
      } catch (error) {
        console.error(`❌ Load test failed: ${error.message}`);
      }
    }
    
    this.generateLoadTestReport();
    return this.results;
  }

  // Core load test execution
  private async runLoadTest(testName: string, scenarios: LoadTestScenario[]): Promise<LoadTestResult> {
    this.isRunning = true;
    this.startTime = Date.now();
    
    const errors: LoadTestError[] = [];
    const responseTimes: number[] = [];
    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    
    // Calculate scenario distribution
    const scenarioInstances = this.calculateScenarioDistribution(scenarios);
    
    // Create concurrent users
    const userPromises = Array.from({ length: this.config.concurrentUsers }, (_, userIndex) => 
      this.simulateUser(userIndex, scenarioInstances, errors, responseTimes)
    );
    
    // Wait for all users to complete or timeout
    await Promise.race([
      Promise.all(userPromises),
      new Promise(resolve => setTimeout(resolve, this.config.duration * 1000))
    ]);
    
    this.isRunning = false;
    this.endTime = Date.now();
    
    // Calculate results
    totalRequests = responseTimes.length;
    successfulRequests = totalRequests - errors.length;
    failedRequests = errors.length;
    
    const result: LoadTestResult = {
      testName,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      requestsPerSecond: totalRequests / ((this.endTime - this.startTime) / 1000),
      errorRate: (failedRequests / totalRequests) * 100,
      duration: this.endTime - this.startTime,
      errors
    };
    
    return result;
  }

  // Calculate scenario distribution based on weights
  private calculateScenarioDistribution(scenarios: LoadTestScenario[]): LoadTestScenario[] {
    const totalWeight = scenarios.reduce((sum, s) => sum + s.weight, 0);
    const instances: LoadTestScenario[] = [];
    
    scenarios.forEach(scenario => {
      const count = Math.round((scenario.weight / totalWeight) * this.config.concurrentUsers);
      for (let i = 0; i < count; i++) {
        instances.push(scenario);
      }
    });
    
    return instances;
  }

  // Simulate a single user
  private async simulateUser(
    userIndex: number,
    scenarios: LoadTestScenario[],
    errors: LoadTestError[],
    responseTimes: number[]
  ): Promise<void> {
    const startTime = Date.now();
    const endTime = startTime + (this.config.duration * 1000);
    
    while (Date.now() < endTime && this.isRunning) {
      try {
        // Select random scenario
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        const requestStart = performance.now();
        await scenario.execute();
        const requestEnd = performance.now();
        
        responseTimes.push(requestEnd - requestStart);
        
        // Think time between requests
        await new Promise(resolve => setTimeout(resolve, this.config.thinkTime));
        
      } catch (error) {
        const requestEnd = performance.now();
        errors.push({
          timestamp: Date.now(),
          error: error.message,
          request: `User ${userIndex}`,
          responseTime: requestEnd - performance.now()
        });
      }
    }
  }

  // Simulation methods
  private async simulateQuestionCreation(): Promise<void> {
    // Simulate API call to create question
    await this.simulateApiCall('POST', '/api/questions', {
      part: 1,
      prompt_text: 'Test question',
      choices: { A: 'A', B: 'B', C: 'C', D: 'D' },
      correct_choice: 'A'
    });
  }

  private async simulateViewQuestions(): Promise<void> {
    // Simulate API call to get questions
    await this.simulateApiCall('GET', '/api/questions');
  }

  private async simulateSearchQuestions(): Promise<void> {
    // Simulate API call to search questions
    await this.simulateApiCall('GET', '/api/questions/search?q=test');
  }

  private async simulateDeleteQuestion(): Promise<void> {
    // Simulate API call to delete question
    await this.simulateApiCall('DELETE', '/api/questions/1');
  }

  private async simulateStartExam(): Promise<void> {
    // Simulate API call to start exam
    await this.simulateApiCall('POST', '/api/exams/start', { examId: 1 });
  }

  private async simulateAnswerQuestion(): Promise<void> {
    // Simulate API call to answer question
    await this.simulateApiCall('POST', '/api/exams/answer', {
      questionId: 1,
      answer: 'A'
    });
  }

  private async simulateSubmitExam(): Promise<void> {
    // Simulate API call to submit exam
    await this.simulateApiCall('POST', '/api/exams/submit');
  }

  private async simulateBulkUpload(): Promise<void> {
    // Simulate API call to upload file
    await this.simulateApiCall('POST', '/api/questions/bulk-upload');
  }

  private async simulateFileProcessing(): Promise<void> {
    // Simulate API call to process file
    await this.simulateApiCall('GET', '/api/questions/bulk-upload/status');
  }

  private async simulateViewResults(): Promise<void> {
    // Simulate API call to view results
    await this.simulateApiCall('GET', '/api/questions/bulk-upload/results');
  }

  private async simulateLoadDashboard(): Promise<void> {
    // Simulate API call to load dashboard
    await this.simulateApiCall('GET', '/api/dashboard');
  }

  private async simulateLoadAnalytics(): Promise<void> {
    // Simulate API call to load analytics
    await this.simulateApiCall('GET', '/api/analytics');
  }

  private async simulateLoadReports(): Promise<void> {
    // Simulate API call to load reports
    await this.simulateApiCall('GET', '/api/reports');
  }

  // Simulate API call with realistic timing
  private async simulateApiCall(method: string, endpoint: string, data?: any): Promise<void> {
    const startTime = performance.now();
    
    // Simulate network delay (50-500ms)
    const delay = Math.random() * 450 + 50;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate occasional failures (5% error rate)
    if (Math.random() < 0.05) {
      throw new Error(`API Error: ${method} ${endpoint} failed`);
    }
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    // Log request for debugging
    console.log(`${method} ${endpoint} - ${responseTime.toFixed(2)}ms`);
  }

  // Generate load test report
  private generateLoadTestReport(): void {
    console.log('\n📊 Load Test Report:');
    console.log('==================');
    
    this.results.forEach(result => {
      console.log(`\n${result.testName}:`);
      console.log(`  Total Requests: ${result.totalRequests}`);
      console.log(`  Successful: ${result.successfulRequests}`);
      console.log(`  Failed: ${result.failedRequests}`);
      console.log(`  Success Rate: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%`);
      console.log(`  Avg Response Time: ${result.averageResponseTime.toFixed(2)}ms`);
      console.log(`  Min Response Time: ${result.minResponseTime.toFixed(2)}ms`);
      console.log(`  Max Response Time: ${result.maxResponseTime.toFixed(2)}ms`);
      console.log(`  Requests/Second: ${result.requestsPerSecond.toFixed(2)}`);
      console.log(`  Error Rate: ${result.errorRate.toFixed(2)}%`);
      console.log(`  Duration: ${(result.duration / 1000).toFixed(2)}s`);
    });
    
    // Overall statistics
    const totalRequests = this.results.reduce((sum, r) => sum + r.totalRequests, 0);
    const totalSuccessful = this.results.reduce((sum, r) => sum + r.successfulRequests, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failedRequests, 0);
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.averageResponseTime, 0) / this.results.length;
    
    console.log('\nOverall Statistics:');
    console.log(`  Total Requests: ${totalRequests}`);
    console.log(`  Total Successful: ${totalSuccessful}`);
    console.log(`  Total Failed: ${totalFailed}`);
    console.log(`  Overall Success Rate: ${((totalSuccessful / totalRequests) * 100).toFixed(2)}%`);
    console.log(`  Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  }

  // Get test results
  getResults(): LoadTestResult[] {
    return [...this.results];
  }

  // Clear results
  clearResults(): void {
    this.results = [];
  }

  // Stop running tests
  stop(): void {
    this.isRunning = false;
  }
}

// Export load test suite instance
export const loadTestSuite = new LoadTestSuite();
