export type Season = "spring" | "summer" | "fall" | "winter";

export interface TripDestination {
  id: string;
  name: string;
  region: string;
  tagline: string;
  emoji: string;
  lat: number;
  lon: number;
  season: Season;
  activities: string[];
  whyNow: string;
}

export const TRIPS: TripDestination[] = [
  // ── SPRING ──────────────────────────────────────────────
  {
    id: "dc-spring",
    name: "Washington D.C.",
    region: "USA",
    tagline: "Cherry blossom season",
    emoji: "🌸",
    lat: 38.9072,
    lon: -77.0369,
    season: "spring",
    activities: ["Cherry blossoms", "Museums", "Monuments"],
    whyNow: "Late March through mid-April is peak bloom — the city turns pink!",
  },
  {
    id: "smoky-spring",
    name: "Smoky Mountains",
    region: "Tennessee, USA",
    tagline: "Wildflowers everywhere",
    emoji: "🌼",
    lat: 35.6532,
    lon: -83.507,
    season: "spring",
    activities: ["Wildflower hikes", "Waterfalls", "Wildlife"],
    whyNow: "Over 1,500 species of wildflowers bloom — trails are cool and green.",
  },
  {
    id: "savannah-spring",
    name: "Savannah",
    region: "Georgia, USA",
    tagline: "Garden city in bloom",
    emoji: "🌿",
    lat: 32.0835,
    lon: -81.0998,
    season: "spring",
    activities: ["Azalea gardens", "Historic squares", "Ghost tours"],
    whyNow: "Mild 70s weather and azaleas in full bloom — before summer heat hits.",
  },
  {
    id: "amsterdam-spring",
    name: "Amsterdam",
    region: "Netherlands",
    tagline: "Tulips and canals",
    emoji: "🌷",
    lat: 52.3676,
    lon: 4.9041,
    season: "spring",
    activities: ["Keukenhof tulips", "Canal bikes", "Museums"],
    whyNow: "Keukenhof Gardens open April–May with 7 million blooming tulips.",
  },
  {
    id: "portland-spring",
    name: "Portland",
    region: "Oregon, USA",
    tagline: "Rose City blooms",
    emoji: "🌹",
    lat: 45.5231,
    lon: -122.6765,
    season: "spring",
    activities: ["Rose Garden", "Food carts", "Forest hikes"],
    whyNow: "Rainy season ends in May — roses peak and the city sparkles.",
  },

  // ── SUMMER ──────────────────────────────────────────────
  {
    id: "bar-harbor-summer",
    name: "Bar Harbor",
    region: "Maine, USA",
    tagline: "Cool summers by the sea",
    emoji: "🦞",
    lat: 44.3876,
    lon: -68.2039,
    season: "summer",
    activities: ["Whale watching", "Lobster feasts", "Acadia hiking"],
    whyNow: "While the rest of the East Coast bakes, Maine stays a perfect 70°F.",
  },
  {
    id: "yellowstone-summer",
    name: "Yellowstone",
    region: "Wyoming, USA",
    tagline: "Geysers and wildlife",
    emoji: "🦬",
    lat: 44.428,
    lon: -110.5885,
    season: "summer",
    activities: ["Old Faithful", "Bison sightings", "Grand Canyon of Yellowstone"],
    whyNow: "Roads are all open and baby animals are everywhere in June-July.",
  },
  {
    id: "tahoe-summer",
    name: "Lake Tahoe",
    region: "California, USA",
    tagline: "Crystal clear mountain lake",
    emoji: "🏄",
    lat: 39.0968,
    lon: -120.0324,
    season: "summer",
    activities: ["Swimming", "Kayaking", "Mountain biking"],
    whyNow: "The lake warms up enough to swim and skies are perfectly sunny.",
  },
  {
    id: "alaska-summer",
    name: "Anchorage",
    region: "Alaska, USA",
    tagline: "Midnight sun adventures",
    emoji: "🌅",
    lat: 61.2181,
    lon: -149.9003,
    season: "summer",
    activities: ["Midnight sun hikes", "Glacier kayaking", "Bear watching"],
    whyNow: "22 hours of daylight — hike at midnight with full sun!",
  },
  {
    id: "capecod-summer",
    name: "Cape Cod",
    region: "Massachusetts, USA",
    tagline: "Classic New England beach",
    emoji: "⛵",
    lat: 41.6688,
    lon: -70.2962,
    season: "summer",
    activities: ["Beach days", "Whale watching", "Lobster rolls"],
    whyNow: "Ocean temps peak in August — perfect for swimming and sailing.",
  },

  // ── FALL ────────────────────────────────────────────────
  {
    id: "vermont-fall",
    name: "Burlington",
    region: "Vermont, USA",
    tagline: "Peak leaf peeping",
    emoji: "🍂",
    lat: 44.4759,
    lon: -73.2121,
    season: "fall",
    activities: ["Foliage drives", "Apple picking", "Cider mills"],
    whyNow: "Vermont's foliage peaks mid-October — the most stunning fall on Earth.",
  },
  {
    id: "napa-fall",
    name: "Napa Valley",
    region: "California, USA",
    tagline: "Harvest season wine country",
    emoji: "🍷",
    lat: 38.2975,
    lon: -122.2869,
    season: "fall",
    activities: ["Grape harvest", "Wine tasting", "Hot air balloon"],
    whyNow: "Crush season in September-October — wineries are buzzing with activity.",
  },
  {
    id: "sedona-fall",
    name: "Sedona",
    region: "Arizona, USA",
    tagline: "Red rocks in crisp air",
    emoji: "🏜️",
    lat: 34.8697,
    lon: -111.761,
    season: "fall",
    activities: ["Red rock hiking", "Stargazing", "Jeep tours"],
    whyNow: "Summer heat breaks and the red rocks look amazing in fall light.",
  },
  {
    id: "asheville-fall",
    name: "Asheville",
    region: "North Carolina, USA",
    tagline: "Blue Ridge foliage",
    emoji: "🎵",
    lat: 35.5951,
    lon: -82.5515,
    season: "fall",
    activities: ["Blue Ridge Parkway", "Craft breweries", "Art galleries"],
    whyNow: "The Parkway explodes with color in October and beer is cold.",
  },
  {
    id: "salem-fall",
    name: "Salem",
    region: "Massachusetts, USA",
    tagline: "Halloween capital of the world",
    emoji: "🎃",
    lat: 42.5195,
    lon: -70.8967,
    season: "fall",
    activities: ["Haunted history tours", "Witch museum", "Costume festivals"],
    whyNow: "October is Salem's month — the whole city celebrates Halloween.",
  },

  // ── WINTER ──────────────────────────────────────────────
  {
    id: "aspen-winter",
    name: "Aspen",
    region: "Colorado, USA",
    tagline: "World-class skiing",
    emoji: "⛷️",
    lat: 39.1911,
    lon: -106.8175,
    season: "winter",
    activities: ["Skiing", "Snowboarding", "Après-ski"],
    whyNow: "Slopes open in November — powder conditions peak in January.",
  },
  {
    id: "jackson-winter",
    name: "Jackson Hole",
    region: "Wyoming, USA",
    tagline: "Epic powder days",
    emoji: "🏔️",
    lat: 43.4799,
    lon: -110.7624,
    season: "winter",
    activities: ["Big mountain skiing", "Sleigh rides", "Wildlife safari"],
    whyNow: "Deepest snowpack in the Rockies — and elk in the National Elk Refuge.",
  },
  {
    id: "hawaii-winter",
    name: "Honolulu",
    region: "Hawaii, USA",
    tagline: "Escape the cold",
    emoji: "🌺",
    lat: 21.3069,
    lon: -157.8583,
    season: "winter",
    activities: ["Beach days", "Surfing", "Humpback whales"],
    whyNow: "Humpback whales arrive December-March and the beach is 80°F.",
  },
  {
    id: "quebec-winter",
    name: "Quebec City",
    region: "Quebec, Canada",
    tagline: "Winter Carnival magic",
    emoji: "🏰",
    lat: 46.8139,
    lon: -71.2082,
    season: "winter",
    activities: ["Ice sculptures", "Dog sledding", "Bonhomme parades"],
    whyNow: "The February Winter Carnival turns the old city into a fairy tale.",
  },
  {
    id: "cancun-winter",
    name: "Cancún",
    region: "Mexico",
    tagline: "Warm beaches in January",
    emoji: "🏖️",
    lat: 21.1619,
    lon: -86.8515,
    season: "winter",
    activities: ["Snorkeling", "Mayan ruins", "All-inclusive resorts"],
    whyNow: "Dry season means clear skies and calm seas — no crowds yet.",
  },
];

export const SEASON_CONFIG: Record<
  Season,
  { label: string; emoji: string; color: string; bgColor: string; months: string }
> = {
  spring: {
    label: "Spring",
    emoji: "🌸",
    color: "#E91E8C",
    bgColor: "#FDE8F4",
    months: "Mar – May",
  },
  summer: {
    label: "Summer",
    emoji: "☀️",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
    months: "Jun – Aug",
  },
  fall: {
    label: "Fall",
    emoji: "🍂",
    color: "#C2610A",
    bgColor: "#FEF0DC",
    months: "Sep – Nov",
  },
  winter: {
    label: "Winter",
    emoji: "❄️",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
    months: "Dec – Feb",
  },
};

export function getCurrentSeason(): Season {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "fall";
  return "winter";
}
