// Temporary implementation - RevenueCat not yet installed
// TODO: Install react-native-purchases and replace with actual implementation

const ENTITLEMENT = process.env.EXPO_PUBLIC_RC_ENTITLEMENT_NAME || "pro";

// Mock implementation for development
let mockHasPro = false;
let mockIsTrialing = true;

export async function initPurchases(userId?: string): Promise<void> {
  console.log('RevenueCat initialization (mock) - userId:', userId);
  // Mock initialization - replace with actual RevenueCat setup
}

export async function hasProEntitlement(): Promise<boolean> {
  // Mock implementation - in production, check actual subscription status
  return mockHasPro;
}

export async function startTrialOrPurchase(): Promise<boolean> {
  // Mock implementation - simulate purchase flow
  console.log('Starting trial/purchase (mock)');

  // Simulate successful trial activation
  mockIsTrialing = true;
  mockHasPro = true;

  return true;
}

// Development helpers
export function setMockProStatus(hasPro: boolean): void {
  mockHasPro = hasPro;
}

export function setMockTrialStatus(isTrialing: boolean): void {
  mockIsTrialing = isTrialing;
}

export function getMockStatus() {
  return { hasPro: mockHasPro, isTrialing: mockIsTrialing };
}
