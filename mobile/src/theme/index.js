// ─── FarmSync Design Tokens ────────────────────────────────────────────────────

export const C = {
  // Brand greens
  forest:   '#1B5E20',   // deep — headers, hero backgrounds
  primary:  '#2E7D32',   // main — primary buttons, active states
  mid:      '#4CAF50',   // medium — icons, chips, small accents
  pale:     '#E8F5E9',   // lightest — tag/chip backgrounds

  // Page & surface
  page:     '#F2F5EF',   // warm off-white page background
  card:     '#FFFFFF',   // card surfaces
  input:    '#F4F7F2',   // input field background

  // Text
  ink:      '#1A2817',   // primary text
  sub:      '#4E6450',   // secondary / label text
  muted:    '#96A896',   // placeholder, timestamps, captions

  // Borders
  border:   '#DFE8DC',

  // Status
  planted:   '#43A047',
  growing:   '#1976D2',
  harvested: '#F57C00',
  failed:    '#D32F2F',
  planned:   '#9E9E9E',

  // Farm type accent colours
  farmType: {
    backyard:   '#43A047',
    greenhouse: '#00897B',
    field:      '#F57C00',
    rooftop:    '#1976D2',
    balcony:    '#7B1FA2',
    community:  '#546E7A',
    default:    '#4CAF50',
  },

  // Feature card icon colours (strip)
  feature: {
    tour:       '#9C27B0',
    chatbot:    '#2E7D32',
    schemes:    '#1565C0',
    financials: '#E65100',
    succession: '#00695C',
    stories:    '#6A1B9A',
  },
};

export const R = {
  xs:   6,
  sm:   10,
  md:   14,
  lg:   18,
  xl:   24,
  pill: 999,
};

// Shadow presets — use tinted green shadow for depth, not pure black
export const Sh = {
  xs: {
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 10,
    elevation: 4,
  },
};
