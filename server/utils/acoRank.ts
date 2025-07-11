// Ant Colony Optimization Algorithm for Drug Locator
// This algorithm helps find the best pharmacies based on distance, stock, and freshness

interface PharmacyOption {
  id: number;
  name: string;
  address: string;
  city: string;
  lat: string | null;
  lng: string | null;
  quantity: number;
  lastUpdated: Date;
  distance?: number;
}

interface ACOResult extends PharmacyOption {
  acoScore: number;
  pheromoneLevel: number;
  heuristicValue: number;
  explanation: string;
}

// ACO Parameters
const ACO_PARAMS = {
  alpha: 1.0,        // Pheromone importance
  beta: 2.0,         // Heuristic importance
  evaporationRate: 0.1,
  maxDistance: 50,   // Maximum distance to consider (km)
  stockWeight: 0.4,  // Weight for stock level
  distanceWeight: 0.4, // Weight for distance
  freshnessWeight: 0.2, // Weight for data freshness
};

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate pheromone level based on stock quantity
 * Higher stock = higher pheromone level
 */
function calculatePheromoneLevel(quantity: number): number {
  if (quantity <= 0) return 0.1;
  if (quantity <= 10) return 0.3;
  if (quantity <= 50) return 0.6;
  if (quantity <= 100) return 0.8;
  return 1.0;
}

/**
 * Calculate heuristic value based on distance (inverse relationship)
 * Closer distance = higher heuristic value
 */
function calculateHeuristicValue(distance: number): number {
  if (distance <= 0) return 1.0;
  if (distance >= ACO_PARAMS.maxDistance) return 0.1;
  return Math.max(0.1, (ACO_PARAMS.maxDistance - distance) / ACO_PARAMS.maxDistance);
}

/**
 * Calculate freshness factor based on last update time
 * More recent updates = higher freshness
 */
function calculateFreshnessFactor(lastUpdated: Date): number {
  const now = new Date();
  const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceUpdate <= 1) return 1.0;
  if (hoursSinceUpdate <= 6) return 0.8;
  if (hoursSinceUpdate <= 24) return 0.6;
  if (hoursSinceUpdate <= 168) return 0.4; // 1 week
  return 0.2;
}

/**
 * Generate explanation for the ACO ranking
 */
function generateExplanation(pharmacy: ACOResult): string {
  const reasons: string[] = [];
  
  if (pharmacy.quantity > 50) {
    reasons.push("High stock availability");
  } else if (pharmacy.quantity > 10) {
    reasons.push("Moderate stock available");
  } else {
    reasons.push("Limited stock");
  }
  
  if (pharmacy.distance !== undefined) {
    if (pharmacy.distance < 5) {
      reasons.push("Very close location");
    } else if (pharmacy.distance < 15) {
      reasons.push("Nearby location");
    } else {
      reasons.push("Distant location");
    }
  }
  
  const freshness = calculateFreshnessFactor(pharmacy.lastUpdated);
  if (freshness > 0.8) {
    reasons.push("Recently updated inventory");
  } else if (freshness > 0.4) {
    reasons.push("Moderately fresh data");
  } else {
    reasons.push("Older inventory data");
  }
  
  return reasons.join(", ");
}

/**
 * Main ACO ranking function
 * Ranks pharmacies based on stock, distance, and data freshness
 */
export function rankPharmaciesWithACO(
  pharmacies: PharmacyOption[],
  userLat?: number,
  userLng?: number
): ACOResult[] {
  // Calculate distances if user location is provided
  const pharmaciesWithDistance = pharmacies.map(pharmacy => {
    let distance: number | undefined;
    
    if (userLat && userLng && pharmacy.lat && pharmacy.lng) {
      distance = calculateDistance(
        userLat, userLng,
        parseFloat(pharmacy.lat), parseFloat(pharmacy.lng)
      );
    }
    
    return { ...pharmacy, distance };
  });
  
  // Filter out pharmacies that are too far or have no stock
  const validPharmacies = pharmaciesWithDistance.filter(pharmacy => {
    if (pharmacy.quantity <= 0) return false;
    if (pharmacy.distance && pharmacy.distance > ACO_PARAMS.maxDistance) return false;
    return true;
  });
  
  // Calculate ACO scores
  const rankedPharmacies = validPharmacies.map(pharmacy => {
    const pheromoneLevel = calculatePheromoneLevel(pharmacy.quantity);
    const heuristicValue = pharmacy.distance ? calculateHeuristicValue(pharmacy.distance) : 0.5;
    const freshnessFactor = calculateFreshnessFactor(pharmacy.lastUpdated);
    
    // ACO probability formula: τ^α * η^β * freshness
    const stockComponent = Math.pow(pheromoneLevel, ACO_PARAMS.alpha) * ACO_PARAMS.stockWeight;
    const distanceComponent = Math.pow(heuristicValue, ACO_PARAMS.beta) * ACO_PARAMS.distanceWeight;
    const freshnessComponent = freshnessFactor * ACO_PARAMS.freshnessWeight;
    
    const acoScore = stockComponent + distanceComponent + freshnessComponent;
    
    const result: ACOResult = {
      ...pharmacy,
      acoScore,
      pheromoneLevel,
      heuristicValue,
      explanation: ""
    };
    
    result.explanation = generateExplanation(result);
    return result;
  });
  
  // Sort by ACO score (highest first)
  return rankedPharmacies.sort((a, b) => b.acoScore - a.acoScore);
}

/**
 * Simplified function for quick pharmacy ranking
 */
export function findBestPharmacies(
  pharmacies: PharmacyOption[],
  userLat?: number,
  userLng?: number,
  limit = 10
): ACOResult[] {
  const ranked = rankPharmaciesWithACO(pharmacies, userLat, userLng);
  return ranked.slice(0, limit);
}

/**
 * Get pharmacy recommendation explanation
 */
export function getRecommendationExplanation(pharmacy: ACOResult): string {
  return `Ranked #${pharmacy.acoScore.toFixed(2)} based on: ${pharmacy.explanation}`;
}