/* ============================================
   CARBON FOOTPRINT AWARENESS PLATFORM
   Data Layer — Emission Factors, Equivalencies, Actions
   ============================================ */

const EMISSION_DATA = {

  // ─── TRANSPORT ───────────────────────────────
  transport: {
    question: "How do you usually get around?",
    icon: "🚗",
    options: [
      { label: "Drive daily", value: "car_daily", tons: 4.6 },
      { label: "Drive a few times a week", value: "car_sometimes", tons: 2.3 },
      { label: "Public transport", value: "public_transit", tons: 0.9 },
      { label: "Bike, walk, or remote", value: "bike_walk", tons: 0.1 }
    ]
  },

  // ─── FLIGHTS ─────────────────────────────────
  flights: {
    question: "How many round-trip flights do you take per year?",
    icon: "✈️",
    options: [
      { label: "None", value: "0", tons: 0 },
      { label: "1–2 flights", value: "1-2", tons: 1.8 },
      { label: "3–5 flights", value: "3-5", tons: 5.4 },
      { label: "6+ flights", value: "6+", tons: 10.8 }
    ]
  },

  // ─── FOOD ────────────────────────────────────
  food: {
    question: "How would you describe your diet?",
    icon: "🍽️",
    options: [
      { label: "Meat with most meals", value: "heavy_meat", tons: 3.3 },
      { label: "Meat a few times a week", value: "moderate_meat", tons: 2.5 },
      { label: "Mostly plant-based, some meat", value: "occasional_meat", tons: 1.7 },
      { label: "Vegetarian", value: "vegetarian", tons: 1.4 },
      { label: "Vegan", value: "vegan", tons: 1.0 }
    ]
  },

  // ─── HOME ENERGY ─────────────────────────────
  energy: {
    question: "What's your home energy situation?",
    icon: "⚡",
    options: [
      { label: "Large home, gas/oil heating", value: "large_gas", tons: 4.0 },
      { label: "Average home, mixed energy", value: "average", tons: 2.5 },
      { label: "Small or efficient home", value: "small_efficient", tons: 1.2 },
      { label: "Renewable energy powered", value: "renewable", tons: 0.3 }
    ]
  },

  // ─── SHOPPING ────────────────────────────────
  shopping: {
    question: "How would you describe your shopping habits?",
    icon: "🛍️",
    options: [
      { label: "I buy new things often", value: "heavy", tons: 2.5 },
      { label: "Average — some new, some not", value: "average", tons: 1.5 },
      { label: "Minimal — mostly secondhand or essential", value: "minimal", tons: 0.5 }
    ]
  }
};

// ─── CATEGORY METADATA ─────────────────────────
const CATEGORIES = {
  transport: { label: "Transport", icon: "🚗", color: "#3B82F6" },
  flights:   { label: "Flights",   icon: "✈️", color: "#6366F1" },
  food:      { label: "Food",      icon: "🍽️", color: "#F59E0B" },
  energy:    { label: "Energy",    icon: "⚡", color: "#8B5CF6" },
  shopping:  { label: "Shopping",  icon: "🛍️", color: "#EC4899" }
};

// ─── GLOBAL AVERAGES ───────────────────────────
const AVERAGES = {
  global: 4.7,
  us: 17.6,
  eu: 8.4,
  target2c: 2.0
};

// ─── EQUIVALENCIES ─────────────────────────────
const EQUIVALENCIES = {
  trees: {
    icon: "🌳",
    calc: (tons) => Math.round(tons / 0.022),
    label: (val) => `${val} trees needed per year to absorb your carbon`
  },
  flights: {
    icon: "✈️",
    calc: (tons) => (tons / 1.6).toFixed(1),
    label: (val) => `${val} round-trip transatlantic flights`
  },
  driving: {
    icon: "🌍",
    calc: (tons) => (tons * 4000 / 40075).toFixed(1),
    label: (val) => `${val}× driving around the entire Earth`
  },
  smartphones: {
    icon: "📱",
    calc: (tons) => Math.round(tons * 120000).toLocaleString(),
    label: (val) => `${val} smartphone charges worth of energy`
  }
};

// ─── LETTER GRADES ─────────────────────────────
function getGrade(tons) {
  if (tons <= 2.0) return { grade: "A+", label: "Excellent", color: "#059669" };
  if (tons <= 4.0) return { grade: "A",  label: "Great",     color: "#10B981" };
  if (tons <= 6.0) return { grade: "B",  label: "Good",      color: "#34D399" };
  if (tons <= 8.0) return { grade: "B-", label: "Average",   color: "#FBBF24" };
  if (tons <= 12.0) return { grade: "C", label: "Above Avg", color: "#F59E0B" };
  if (tons <= 16.0) return { grade: "D", label: "High",      color: "#EF4444" };
  return { grade: "F", label: "Very High", color: "#DC2626" };
}

// ─── REDUCTION ACTIONS ─────────────────────────
// Keyed by category. Each action has a title, description, and estimated annual savings.
const ACTIONS = {
  transport: [
    {
      title: "Try cycling or walking twice a week",
      description: "Replace 2 car trips per week with biking or walking for short distances.",
      savings: 0.5,
      icon: "🚴"
    },
    {
      title: "Carpool or use public transit",
      description: "Sharing rides or using buses/trains can cut your commute emissions in half.",
      savings: 1.2,
      icon: "🚌"
    },
    {
      title: "Combine errands into fewer trips",
      description: "Plan your week to reduce the number of individual car journeys.",
      savings: 0.3,
      icon: "📋"
    }
  ],
  flights: [
    {
      title: "Replace one flight with a train",
      description: "For trips under 500km, trains emit up to 90% less CO₂ than flying.",
      savings: 1.4,
      icon: "🚆"
    },
    {
      title: "Take one fewer flight this year",
      description: "Skipping just one round trip saves more than months of recycling.",
      savings: 1.8,
      icon: "🎫"
    },
    {
      title: "Choose direct flights when you fly",
      description: "Takeoffs and landings are the most fuel-intensive parts. Direct = less carbon.",
      savings: 0.3,
      icon: "✈️"
    }
  ],
  food: [
    {
      title: "Try 2 meat-free days per week",
      description: "Replacing beef and lamb with plant-based meals just twice a week makes a big difference.",
      savings: 0.4,
      icon: "🥗"
    },
    {
      title: "Switch from beef to chicken or fish",
      description: "Beef produces 10× more emissions than chicken. A simple swap with big impact.",
      savings: 0.6,
      icon: "🍗"
    },
    {
      title: "Reduce food waste by planning meals",
      description: "About 30% of food is wasted. A weekly meal plan can cut your food footprint significantly.",
      savings: 0.3,
      icon: "📝"
    }
  ],
  energy: [
    {
      title: "Lower your thermostat by 2°C",
      description: "A small temperature adjustment saves energy without a noticeable comfort change.",
      savings: 0.4,
      icon: "🌡️"
    },
    {
      title: "Switch to a green energy provider",
      description: "Renewable electricity can eliminate most of your home energy emissions.",
      savings: 1.5,
      icon: "☀️"
    },
    {
      title: "Unplug devices and use LED bulbs",
      description: "Standby power and old bulbs waste more energy than you'd think.",
      savings: 0.2,
      icon: "💡"
    }
  ],
  shopping: [
    {
      title: "Buy secondhand when possible",
      description: "Thrift stores and online marketplaces give items a second life and skip manufacturing emissions.",
      savings: 0.5,
      icon: "♻️"
    },
    {
      title: "Choose quality over quantity",
      description: "One durable item beats three cheap replacements — for the planet and your wallet.",
      savings: 0.4,
      icon: "✨"
    },
    {
      title: "Avoid fast fashion",
      description: "The fashion industry emits more CO₂ than aviation. Buying less new clothing helps.",
      savings: 0.3,
      icon: "👕"
    }
  ]
};
