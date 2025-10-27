/**
 * Mock Service for Beer Tracker Development/Testing
 *
 * This service provides realistic mock data for the beer tracker app.
 * Enable mock mode by setting VITE_USE_MOCK_DATA=true in your .env file
 */

// Mock ENS names for realistic data
const mockENSNames = [
  'alice.eth',
  'bob.eth',
  'charlie.eth',
  'diana.eth',
  'ethan.eth',
  'fiona.eth',
  'george.eth',
  'hannah.eth',
  'isaac.eth',
  'julia.eth',
  'kevin.eth',
  'laura.eth',
  'mike.eth',
  'nina.eth',
  'oscar.eth'
];

// Beer-themed memo messages
const beerMemos = [
  'Cheers! 🍺',
  'One more for the road!',
  'Celebrating Bitcoin Pizza Day!',
  'Staying hydrated with liquid gold',
  'To the moon! 🚀',
  'HODL my beer',
  'Bullish on beer',
  'Diamond hands need refreshments',
  'This is the way',
  'To good times!',
  'Prost!',
  'Salud!',
  'Kampai!',
  'Living my best life',
  'Weekend vibes'
];

/**
 * Generate a random timestamp within the last N hours
 */
function randomTimestamp(hoursAgo: number): string {
  const now = new Date();
  const randomMinutes = Math.floor(Math.random() * hoursAgo * 60);
  const timestamp = new Date(now.getTime() - randomMinutes * 60 * 1000);
  return timestamp.toISOString();
}

/**
 * Generate random beer amount (1-3 beers per payment)
 */
function randomBeerAmount(): string {
  const amount = Math.floor(Math.random() * 3) + 1;
  return amount.toString();
}

/**
 * Generate mock webhook payment data
 */
export interface MockPayment {
  payments_senderEnsPrimaryName: string;
  payments_beerAmount: string;
  payments_blockTimestamp: string;
  payments_invoiceAmount: string;
  count_payments_senderEnsPrimaryName: number;
}

/**
 * Generate realistic mock payment data
 * @param numDrinkers Number of unique drinkers
 * @param totalPayments Total number of payment entries
 * @param hoursSpan Time span in hours for the data
 */
export function generateMockPayments(
  numDrinkers: number = 10,
  totalPayments: number = 50,
  hoursSpan: number = 8
): MockPayment[] {
  // Ensure we have enough ENS names
  const availableNames = mockENSNames.slice(0, Math.min(numDrinkers, mockENSNames.length));

  // Create a distribution where some people drink more than others
  const drinkerWeights = availableNames.map(() => Math.random() * 10 + 1);
  const totalWeight = drinkerWeights.reduce((sum, w) => sum + w, 0);

  const payments: MockPayment[] = [];

  // Generate payments
  for (let i = 0; i < totalPayments; i++) {
    // Weighted random selection for drinker
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let j = 0; j < drinkerWeights.length; j++) {
      random -= drinkerWeights[j];
      if (random <= 0) {
        selectedIndex = j;
        break;
      }
    }

    const ensName = availableNames[selectedIndex];
    const beerAmount = randomBeerAmount();
    const timestamp = randomTimestamp(hoursSpan);

    payments.push({
      payments_senderEnsPrimaryName: ensName,
      payments_beerAmount: beerAmount,
      payments_blockTimestamp: timestamp,
      payments_invoiceAmount: (parseInt(beerAmount) * 20).toString(), // $20 per beer
      count_payments_senderEnsPrimaryName: 0 // Will be calculated
    });
  }

  // Sort by timestamp (oldest to newest)
  payments.sort((a, b) =>
    new Date(a.payments_blockTimestamp).getTime() -
    new Date(b.payments_blockTimestamp).getTime()
  );

  // Calculate payment counts for each user
  const paymentCounts: Record<string, number> = {};
  payments.forEach(p => {
    const name = p.payments_senderEnsPrimaryName;
    paymentCounts[name] = (paymentCounts[name] || 0) + 1;
  });

  // Set the count for each payment
  payments.forEach(p => {
    p.count_payments_senderEnsPrimaryName = paymentCounts[p.payments_senderEnsPrimaryName];
  });

  return payments;
}

/**
 * Mock API service that simulates network delay
 */
export class MockBeerApi {
  private static mockData: MockPayment[] | null = null;
  private static lastGenerated: number = 0;
  private static readonly CACHE_DURATION = 10000; // 10 seconds

  /**
   * Simulate fetching data from webhook
   * @param delay Network delay in ms (default 200-500ms random)
   */
  static async fetchMockData(delay?: number): Promise<MockPayment[]> {
    // Simulate network delay
    const actualDelay = delay ?? (Math.random() * 300 + 200);
    await new Promise(resolve => setTimeout(resolve, actualDelay));

    // Check if we need to regenerate data (simulate real-time updates)
    const now = Date.now();
    if (!this.mockData || now - this.lastGenerated > this.CACHE_DURATION) {
      // Generate new data with some randomization
      const numDrinkers = Math.floor(Math.random() * 5) + 8; // 8-12 drinkers
      const totalPayments = Math.floor(Math.random() * 30) + 40; // 40-70 payments

      this.mockData = generateMockPayments(numDrinkers, totalPayments, 8);
      this.lastGenerated = now;

      console.log('🍺 Generated fresh mock data:', {
        drinkers: numDrinkers,
        payments: totalPayments,
        timestamp: new Date().toISOString()
      });
    }

    return this.mockData;
  }

  /**
   * Add a random new beer payment (simulates real-time updates)
   */
  static addRandomBeer(): void {
    if (!this.mockData) return;

    const randomName = mockENSNames[Math.floor(Math.random() * mockENSNames.length)];
    const existingPayments = this.mockData.filter(
      p => p.payments_senderEnsPrimaryName === randomName
    );

    const newPayment: MockPayment = {
      payments_senderEnsPrimaryName: randomName,
      payments_beerAmount: randomBeerAmount(),
      payments_blockTimestamp: new Date().toISOString(),
      payments_invoiceAmount: "20",
      count_payments_senderEnsPrimaryName: existingPayments.length + 1
    };

    this.mockData.push(newPayment);

    console.log('🍺 Added new beer:', newPayment);
  }

  /**
   * Reset mock data
   */
  static reset(): void {
    this.mockData = null;
    this.lastGenerated = 0;
  }

  /**
   * Get current mock data without regenerating
   */
  static getCurrentData(): MockPayment[] | null {
    return this.mockData;
  }
}

/**
 * Check if mock mode is enabled
 */
export function isMockModeEnabled(): boolean {
  return import.meta.env.VITE_USE_MOCK_DATA === 'true';
}

/**
 * Generate preset scenarios for testing
 */
export const MockScenarios = {
  /**
   * Empty state - no beers consumed yet
   */
  empty: (): MockPayment[] => [],

  /**
   * Single drinker scenario
   */
  singleDrinker: (): MockPayment[] => {
    return generateMockPayments(1, 5, 2);
  },

  /**
   * Early stage - party just started
   */
  earlyStage: (): MockPayment[] => {
    return generateMockPayments(5, 15, 1);
  },

  /**
   * Mid party - things are getting fun
   */
  midParty: (): MockPayment[] => {
    return generateMockPayments(10, 60, 4);
  },

  /**
   * Peak party - maximum consumption
   */
  peakParty: (): MockPayment[] => {
    return generateMockPayments(15, 150, 8);
  },

  /**
   * Competitive - close race for top spot
   */
  competitive: (): MockPayment[] => {
    const payments = generateMockPayments(8, 80, 6);

    // Make top 3 drinkers very close
    const topThree = ['alice.eth', 'bob.eth', 'charlie.eth'];
    const now = new Date();

    topThree.forEach((name, index) => {
      // Add 15-18 beers for each top drinker
      const extraBeers = 18 - index;
      for (let i = 0; i < extraBeers; i++) {
        payments.push({
          payments_senderEnsPrimaryName: name,
          payments_beerAmount: '1',
          payments_blockTimestamp: new Date(now.getTime() - i * 300000).toISOString(),
          payments_invoiceAmount: '20',
          count_payments_senderEnsPrimaryName: extraBeers
        });
      }
    });

    return payments;
  },

  /**
   * High pace - lots of beers in short time
   */
  highPace: (): MockPayment[] => {
    return generateMockPayments(8, 80, 2); // 80 beers in 2 hours = 40 beers/hour
  },

  /**
   * Slow pace - casual drinking
   */
  slowPace: (): MockPayment[] => {
    return generateMockPayments(6, 20, 8); // 20 beers in 8 hours = 2.5 beers/hour
  }
};

/**
 * Export a preset scenario setter for easy testing
 */
export function setMockScenario(scenario: keyof typeof MockScenarios): void {
  const data = MockScenarios[scenario]();
  (MockBeerApi as any).mockData = data;
  (MockBeerApi as any).lastGenerated = Date.now();
  console.log(`🍺 Set mock scenario: ${scenario}`, {
    payments: data.length,
    drinkers: new Set(data.map(p => p.payments_senderEnsPrimaryName)).size
  });
}

// Export for window debugging in development
if (import.meta.env.DEV) {
  (window as any).mockBeerService = {
    MockBeerApi,
    MockScenarios,
    setMockScenario,
    generateMockPayments
  };
}
