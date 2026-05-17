-- Popular Fruits & Flowers — India & USA
-- Run: docker exec -i farming-postgres-1 psql -U postgres -d farmsync < backend/src/database/add_fruits_flowers.sql

-- ─── FRUITS ──────────────────────────────────────────────────────────────────

INSERT INTO vegetables (
  name, scientific_name, description, difficulty_level,
  days_to_harvest, spacing_cm, min_temp_celsius, max_temp_celsius, optimal_temp_celsius,
  water_frequency_days, sunlight_hours, soil_type, ph_min, ph_max,
  season, climate_zones, can_greenhouse, yields_per_plant,
  planting_tips, care_tips, pest_diseases, companion_plants
) VALUES

('Mango', 'Mangifera indica',
 'The undisputed king of fruits and India''s national fruit. A magnificent garden tree across tropical and subtropical USA — Florida, California and Hawaii. Grafted saplings bear fruit in 2–3 years and reward patient growers with hundreds of kilos of sweet, fragrant fruit every summer.',
 'intermediate', 120, 800, 15, 40, 27, 14, 8, 'Well-draining, sandy loam', 5.5, 7.5,
 'summer',
 ARRAY['Tropical','Subtropical','Humid Subtropical'],
 false, 80.0,
 $$Always plant a grafted sapling: Seed-grown trees take 6–10 years to fruit; grafted varieties bear in 2–3 years and produce true-to-type fruit|Choose the hottest, most sheltered spot: A south-facing wall reflects heat and protects flowers from cold winds|Dig wide, not deep: 1m wide and 60cm deep; mango roots spread laterally — loose, wide soil matters more than depth|Do not fertilise at planting: Wait 6 weeks before the first feed; fresh fertiliser burns new roots|Water in well and mulch thickly: A 10cm mulch ring out to the drip line holds moisture and keeps roots cool during establishment$$,
 $$Withhold water for 6 weeks before flowering: Drought stress in winter triggers flower bud formation — the single biggest yield secret|Water deeply once a fortnight in dry spells: Established trees are remarkably drought-tolerant; shallow frequent watering grows leaves, not fruit|Feed twice a year: Balanced fertiliser at bud break and after harvest; no nitrogen once flowers appear|Thin fruit clusters on young trees: Remove all but 1–2 fruits per panicle in the first 3 years to channel energy into root development|Prune lightly after harvest: Open the canopy for better airflow; never remove more than 20% in one season$$,
 $$Anthracnose: Black spots on flowers and fruit in humid weather; spray copper fungicide before rain; remove fallen fruit promptly|Mango hopper: Tiny grey insects crowding flower panicles; spray neem oil at first sign of bud break|Fruit fly: Larvae inside ripe fruit; set fruit fly traps and bag individual fruits as they swell|Powdery mildew: White powder on young growth in dry weather; spray sulfur solution every 2 weeks|Scale insects: Brown crusty bumps on bark; scrape off and spray with horticultural oil in winter$$,
 ARRAY['Neem','Banana','Turmeric','Sweet Basil','Lemongrass']),

('Strawberry', 'Fragaria × ananassa',
 'America''s most beloved garden fruit — and increasingly popular in India''s cool highland regions like Mahabaleshwar and Ooty. Compact plants burst with sweet, glossy berries in spring. Perfect for containers, raised beds and hanging baskets. One of the most satisfying crops a beginner can grow.',
 'novice', 90, 30, 1, 30, 18, 3, 6, 'Fertile, well-draining, slightly acidic', 5.5, 6.5,
 'spring',
 ARRAY['Temperate','Mediterranean / Oceanic','Humid Continental','Subtropical'],
 true, 0.5,
 $$Plant crowns at soil level — the most important rule: Planting too deep rots the crown; too shallow dries it out. The crown must sit exactly at the surface|Soak bare-root plants for 1 hour before planting: Rehydrates roots and dramatically improves establishment|Space 30cm apart in rows 45cm apart: Good spacing prevents botrytis and allows light to reach ripening berries|Plant in raised beds or on a slight mound: Strawberries hate waterlogged roots; even 5cm of elevation helps|Prepare soil 2–3 weeks before planting: Dig in a generous amount of compost and a handful of bonemeal per square metre$$,
 $$Mulch heavily with straw after planting: Keeps berries off soil, suppresses weeds, retains moisture and gives the plant its name|Feed with high-potash fertiliser as flowers open: Liquid tomato feed is perfect — never use high-nitrogen feed once flowering begins|Pinch off all flowers in the first 6 weeks: Ruthless but effective — redirects energy into roots for a much larger harvest later|Cut back all foliage after fruiting and feed: Removes disease spores and triggers fresh growth for next season|Propagate by pinning runners into pots: Each plant makes 4–6 runners per season; pin the first plantlet on each runner into a pot of compost$$,
 $$Botrytis (grey mould): Furry grey mould on berries in wet weather; remove affected fruit immediately, improve airflow, mulch to prevent soil splash|Vine weevil: C-shaped white grubs eating roots; plants wilt for no reason; apply nematode drench in late summer|Aphids: Clusters under leaves and on new growth; spray with water or insecticidal soap|Slugs: Holes in ripe berries; use iron phosphate pellets and harvest berries the moment they ripen|Birds: Net plants as berries begin to colour$$,
 ARRAY['Spinach','Lettuce','Garlic','Chives','Borage']),

('Banana', 'Musa × paradisiaca',
 'A rapid-growing tropical plant that transforms any garden into a lush paradise. India is the world''s largest banana producer. In the USA, bananas grow outdoors in Florida, Hawaii, southern California and the Gulf Coast. A planted pup produces a full bunch in under a year — one of the most rewarding fruiting plants possible.',
 'novice', 270, 300, 18, 40, 28, 7, 8, 'Rich, well-draining loam', 5.5, 7.0,
 'summer',
 ARRAY['Tropical','Subtropical','Humid Subtropical'],
 false, 15.0,
 $$Plant pups (suckers), not seed: Banana pups from an established plant produce fruit within 9–12 months; seed-grown bananas take years and rarely fruit true|Choose the warmest, most sheltered spot: A south-facing wall reflects heat and protects leaves from wind tearing|Dig a wide, deep planting hole: 60cm × 60cm filled with a mix of compost and native soil; bananas are heavy feeders from day one|Plant with the growing point just above soil level: Do not bury the growing tip|Water thoroughly after planting and mulch with 15cm of organic material: Moisture and warmth are the two things bananas need most$$,
 $$Feed heavily and often: Bananas are the hungriest plant in the garden; apply high-potash feed every 2 weeks during the growing season|Water deeply 2–3 times a week in hot, dry weather: Water stress shows as brown leaf edges and stunted growth|The mother plant dies after fruiting — remove it: Cut the main stem to the ground after harvest; daughter pups will take over|Allow only one or two pups per clump: Remove all others as they emerge — too many pups weakens the whole clump|Protect leaves from wind: Split leaves lose moisture fast; plant in a sheltered spot or create a windbreak$$,
 $$Panama wilt (Fusarium): Yellowing and collapsing from the base; no cure — remove and do not replant bananas in that spot|Banana weevil: Larvae tunnelling through the corm; plant only clean pups and maintain good garden hygiene|Sigatoka (leaf spot): Brown-yellow streaking on leaves; remove worst-affected leaves and avoid overhead watering|Mealybugs: White cottony clusters at leaf bases; spray with neem oil or diluted dish soap|Aphid colonies: Under leaves on young plants; blast with water or spray neem$$,
 ARRAY['Sweet Potato','Ginger','Lemongrass','Moringa','Turmeric']),

('Papaya', 'Carica papaya',
 'The fastest-fruiting tree you can grow from seed — bearing large, golden, perfumed fruit within 6–10 months of planting. One of India''s most widely grown backyard fruit trees, thriving also in Florida, Hawaii and Southern California. Papaya contains more Vitamin C per 100g than an orange and one of the highest concentrations of papain enzyme on earth.',
 'novice', 210, 250, 16, 40, 28, 7, 8, 'Well-draining, fertile loam', 6.0, 6.5,
 'summer',
 ARRAY['Tropical','Subtropical','Humid Subtropical'],
 true, 20.0,
 $$Start seeds directly in the ground or a large pot: Papaya has a delicate taproot and dislikes transplanting — sow 2–3 seeds per spot and thin to the strongest|Plant in the sunniest spot in the garden: Papaya produces the most fruit in full sun with no shade at all|Ensure near-perfect drainage: The most common cause of papaya death is waterlogged roots — plant on a slight mound if drainage is questionable|Seeds germinate in 2–3 weeks at 25°C+: Use a heat mat if starting in a cooler climate|Plant in groups to ensure pollination: Papaya comes in male, female and hermaphrodite forms; planting 3–4 seedlings and keeping the fruit-bearing ones is the easiest strategy$$,
 $$Water every 4–5 days — consistently: Papaya needs regular moisture but waterlogging is fatal; aim for moist but never soggy soil|Feed with high-potash fertiliser every 3 weeks: Heavy feeding produces much larger and sweeter fruit|Support the trunk in wind: The hollow stem snaps easily; tie to a stake in exposed gardens|Harvest when skin shows 20% yellow colour: Papaya ripens quickly off the tree; pick slightly early and ripen indoors for best flavour|Remove all dead lower leaves regularly: Improves airflow and keeps the planting area clean$$,
 $$Papaya ringspot virus: Mosaic patterns on leaves and warty, distorted fruit; no cure — remove and destroy the plant|Phytophthora root rot: Sudden wilting and stem rot at soil level; improve drainage; no effective cure|Fruit fly: Larvae inside ripe fruit; hang fruit fly traps nearby and harvest before full ripeness|Mealybug: White fuzzy clusters at stem base; spray neem oil|Powdery mildew: White coating on young leaves; spray sulfur solution in dry weather$$,
 ARRAY['Sweet Basil','Garlic','Lemongrass','Banana','Moringa']),

('Guava', 'Psidium guajava',
 'One of India''s most beloved backyard fruit trees — prolific, fragrant and extraordinarily nutritious. Also thriving across Florida, Texas, California and Hawaii. Guava produces more Vitamin C per 100g than an orange, and a single tree can flood a family with fruit for months. Fast-growing and forgiving, it is one of the easiest fruit trees a tropical gardener can grow.',
 'novice', 365, 300, 15, 40, 25, 10, 8, 'Well-draining, fertile or poor', 4.5, 7.0,
 'summer',
 ARRAY['Tropical','Subtropical','Humid Subtropical','Semi-Arid'],
 false, 30.0,
 $$Plant a grafted or air-layered sapling for earliest fruiting: Grafted trees begin bearing in 1–2 years; seedlings take 3–4 years|Choose full sun with some wind shelter: Guava tolerates partial shade but fruits best in full sun|Dig a hole 2× the width of the root ball: Work in compost but guava performs remarkably well in poor soil|Water in thoroughly and mulch with 10cm of organic material: Establishment mulch is critical in the first dry season|Plant in spring so roots establish before summer heat$$,
 $$Guava is remarkably drought-tolerant once established: Mature trees need watering only in prolonged dry spells|Feed with a balanced fertiliser twice a year: At the start of the growing season and after harvest|Prune to keep height manageable for harvesting: Cut back main branches by a third after each fruiting season|Guava fruits on new growth: Pruning actually stimulates the next flush of fruiting branches|Harvest when skin changes from bright green to pale yellow-green and gives slightly to pressure$$,
 $$Fruit fly: The most serious guava pest worldwide; bag individual fruits as they develop and set traps|Guava wilt (Fusarium): Sudden wilting and death; remove affected trees and do not replant guava in that spot|Scale insects: Crusty bumps on stems; scrape off and spray horticultural oil|Red ants at the base: Ants farm aphids on new growth; use sticky trunk bands and remove ant nests|Algal leaf spot: Orange-green patches on older leaves in humid conditions; improve airflow$$,
 ARRAY['Lemongrass','Sweet Basil','Garlic','Moringa','Turmeric']),

('Watermelon', 'Citrullus lanatus',
 'The ultimate summer fruit — crisp, cold and impossibly refreshing. America''s quintessential backyard crop and hugely popular in India''s hot interior regions. Watermelons are large, sprawling plants that need space, heat and patience, but the reward of cutting open a home-grown melon is one of gardening''s greatest pleasures.',
 'intermediate', 80, 120, 18, 38, 28, 7, 8, 'Sandy loam, well-draining', 6.0, 7.0,
 'summer',
 ARRAY['Tropical','Subtropical','Temperate','Semi-Arid','Humid Subtropical'],
 false, 4.0,
 $$Start seeds indoors 3–4 weeks before planting out: Watermelons need a long warm season; getting a head start is essential in temperate climates|Wait until soil is genuinely warm (21°C+): Cold soil causes permanent stunting — impatient planting is the most common mistake|Plant on low mounds 30cm high: Raised planting improves drainage and warms the soil around the roots|Use black plastic mulch: Warms soil, conserves moisture and dramatically increases yield in marginal climates|Space generously at 120cm minimum: Vines sprawl 3–4 metres; crowded plants get powdery mildew and poor fruit$$,
 $$Water deeply once a week: Soak to 30cm depth; shallow watering causes blossom drop and poor flavour|Stop all watering 2 weeks before harvest: Excess water at the end dilutes the sugar and causes splitting|Feed every 2 weeks until flowers appear, then switch to low-nitrogen high-potash: Too much nitrogen after flowering grows leaves, not fruit|Hand-pollinate if bees are scarce: Transfer pollen from male flowers to female (look for the tiny melon at the base) with a soft brush|Test for ripeness by tapping: A ripe melon sounds hollow; the tendril nearest the fruit dries and turns brown$$,
 $$Powdery mildew: White powder coating leaves in warm, dry weather; spray potassium bicarbonate or neem oil|Cucumber beetle: Yellow-black striped beetles on leaves; use row covers until flowering, then remove|Vine borer: Larvae tunnelling into vines; inject Bt into the vine or bury a section of vine to reroute roots|Fusarium wilt: Sudden wilting of entire vines; no cure — rotate crops and choose resistant varieties|Aphids: Clusters under leaves; spray water or insecticidal soap$$,
 ARRAY['Sweet Corn','Sunflower','Radish','Garlic','Sweet Basil']),

('Blueberry', 'Vaccinium corymbosum',
 'America''s superfruit — bursting with antioxidants and beloved by home gardeners across the USA. Blueberries are slow to establish but live for decades, rewarding patient growers with increasing harvests year after year. They demand acidic soil and are spectacular ornamental plants with white spring flowers, blue summer fruit and blazing red autumn colour.',
 'intermediate', 730, 120, -15, 30, 18, 7, 6, 'Acidic, well-draining, rich in organic matter', 4.5, 5.5,
 'summer',
 ARRAY['Temperate','Humid Continental','Mediterranean / Oceanic'],
 false, 3.0,
 $$Acidify soil before planting — non-negotiable: Blueberries grown in non-acid soil slowly yellow and die; dig in ericaceous compost and sulfur to lower pH to 4.5–5.5 before planting|Plant at least two different varieties for cross-pollination: A single blueberry plant produces very little fruit; two or more varieties dramatically increase yield|Plant in spring with the crown slightly above soil level: Waterlogging around the crown is lethal; plant on a slight mound if drainage is imperfect|Mulch thickly with pine bark, wood chips or leaf mould: Keeps roots cool and moist and slowly acidifies the soil|Do not fertilise in the first year: New roots are sensitive; a slow-release ericaceous feed in year 2 is sufficient$$,
 $$Water with rainwater if possible: Tap water is alkaline and gradually raises soil pH, harming the plant over time; set up a water butt|Never let the soil dry out completely: Blueberries are shallow-rooted; check soil moisture 5cm down every 3–4 days in summer|Feed with an ericaceous fertiliser in spring only: Too much nitrogen in summer promotes leaf growth at the expense of fruit|Prune out all fruit-bearing shoots after 4 years: Older wood produces less fruit; cut the oldest 2–3 canes to the ground each spring|Net before berries colour: Birds strip bushes overnight; nets are the single most important yield protection$$,
 $$Mummy berry: Infected berries shrivel to mummies and infect soil; rake up and destroy all fallen fruit|Botrytis (grey mould): Furry mould on berries in wet weather; remove affected fruit and improve airflow|Blueberry maggot: Larvae inside fruit; set sticky yellow traps nearby|Iron deficiency (chlorosis): Young leaves yellow while veins stay green — soil pH is too high; treat with chelated iron and sulfur|Scale insects: Crusty bumps on canes in winter; apply horticultural oil before bud break$$,
 ARRAY['Mint','Thyme','Borage','Garlic','Chamomile']),

('Pomegranate', 'Punica granatum',
 'A jewel of ancient gardens — cultivated for over 4,000 years from India to the Mediterranean to Persia. In the USA pomegranates thrive in California, Arizona and Texas; in India they are a major commercial crop in Maharashtra and Rajasthan. Drought-tolerant, long-lived and spectacularly beautiful with scarlet flowers and ruby-seeded arils rich in antioxidants.',
 'intermediate', 365, 400, 7, 40, 25, 14, 8, 'Well-draining, any type', 5.5, 7.2,
 'summer',
 ARRAY['Mediterranean / Oceanic','Subtropical','Semi-Arid','Tropical','Temperate'],
 false, 15.0,
 $$Plant a named grafted variety: Seedling pomegranates often bear sour fruit; named varieties like Wonderful (USA) or Bhagwa (India) are reliably sweet|Full sun is essential: Plant in the absolute sunniest spot; shade severely reduces both flowering and fruit|Excellent drainage is the only soil requirement: Pomegranates tolerate sand, clay or rocky soil as long as water drains away quickly|Soak roots for 2–4 hours before planting: Especially important for bare-root specimens that may have dried out|Space at least 4 metres apart for full-size trees: Or plant as a hedgerow 1.5m apart for a decorative fruiting screen$$,
 $$Water deeply but infrequently: Once established, pomegranates survive on minimal water; overwatering is more harmful than drought|Increase watering as fruit develops: Inconsistent moisture when fruits are swelling causes cracking|Feed lightly in spring with a balanced fertiliser: Heavy feeding produces leaves at the expense of fruit|Train to a multi-stem form rather than a single trunk: 3–5 main stems from the base creates a more productive, wind-resistant structure|Harvest when fruit skin sounds metallic when tapped: Pomegranates do not ripen off the tree$$,
 $$Pomegranate butterfly: Caterpillars boring into developing fruit; hand-pick larvae; use neem spray|Heart rot (Alternaria): Black decay inside fruit that looks perfect outside; avoid wetting fruit and ensure good airflow|Aphids: Dense colonies on new spring growth; spray neem or water blast|Thrips: Silvery scarring on fruit surface; apply spinosad spray|Fruit cracking: Caused by irregular watering as fruit matures; keep moisture consistent in the final 6 weeks$$,
 ARRAY['Rosemary','Lavender','Sweet Basil','Garlic','Marigold']),

-- ─── FLOWERS ─────────────────────────────────────────────────────────────────

('Marigold', 'Tagetes erecta',
 'The most widely grown flower in India — essential for festivals, garlands, offerings and every celebration from Diwali to weddings. In the USA marigolds are the number-one companion planting flower, known for repelling nematodes and pest insects. Brilliant orange and yellow blooms, deeply fragrant, and impossibly easy to grow.',
 'novice', 55, 30, 10, 38, 24, 4, 6, 'Any well-draining soil', 5.5, 7.5,
 'summer',
 ARRAY['Tropical','Subtropical','Temperate','Mediterranean / Oceanic','Semi-Arid','Humid Subtropical'],
 true, 30.0,
 $$Sow seeds directly where they are to grow: Marigolds dislike transplanting; sow 1cm deep where you want them and thin to 30cm spacing|Sow after all frost danger has passed: Seeds germinate in 5–7 days at 20°C+; cold soil causes rotting|Mix seeds with dry sand for even distribution when broadcast sowing: Ensures even coverage over a bed|Plant thickly around vegetable beds: Root secretions repel root-knot nematodes from tomatoes, peppers and other crops for up to 3 years|Start new batches every 6 weeks for continuous bloom from spring to first frost$$,
 $$Deadhead spent flowers twice a week: Removing old blooms triggers a new flush and doubles the season''s flower count|Water at soil level, not on the foliage: Wet leaves cause botrytis; marigolds prefer dry foliage|Never overwater: One of the most drought-tolerant flowers once established; more marigolds die from overwatering than drought|Pinch the central growing tip when plants are 15cm tall: Creates a bushy plant with many more flowering stems|Allow a few plants to set seed at season''s end: Collect the dried seed heads for next year''s free planting$$,
 $$Botrytis (grey mould): Furry mould in wet weather; deadhead promptly and improve airflow|Spider mites: Fine webbing on leaves in hot, dry weather; mist foliage and spray neem oil|Powdery mildew: White coating on leaves in late season; remove worst-affected stems|Slugs: Attack seedlings; use iron phosphate pellets at sowing time|Aster yellows: Plants stunted and distorted; remove and destroy affected plants immediately$$,
 ARRAY['Tomato','Sweet Basil','Pepper','Eggplant','Garlic']),

('Rose', 'Rosa × hybrida',
 'The world''s most beloved flower — cultivated for over 5,000 years and prized across every culture. In India roses are grown commercially in Pune and Bengaluru for the export cut-flower market. In the USA they are the unofficial national flower. Available in thousands of varieties, roses reward careful growers with unmatched fragrance and beauty.',
 'intermediate', 45, 60, -5, 35, 18, 5, 6, 'Rich, well-draining clay-loam', 6.0, 6.5,
 'spring',
 ARRAY['Temperate','Mediterranean / Oceanic','Subtropical','Humid Continental'],
 false, 30.0,
 $$Plant bare-root roses in winter, potted roses in spring: Bare-root plants establish faster when planted at the right time|Dig a generous hole: 60cm wide and deep; work in a full bucket of compost and a handful of bonemeal|Plant the bud union at or just above soil level: The bud union placement varies by climate — above soil in frost-prone areas, just below in frost-free zones|Mix mycorrhizal fungi powder onto the roots before planting: Genuinely accelerates establishment and first-year growth|Plant with garlic, lavender or chives nearby: Natural companions that repel aphids$$,
 $$Feed every 2 weeks from bud break to mid-summer: Use a specialist rose fertiliser; stop feeding 6 weeks before expected first frost|Water deeply at the base — never on the leaves: Wet foliage is the primary cause of blackspot; water early morning so any splash dries quickly|Deadhead consistently: Remove spent flowers just above the first 5-leaflet leaf to stimulate new flowering stems|Prune main stems by two-thirds in late winter: The most important annual task — keeps plants vigorous and productive|Spray with a preventive fungicide in spring: Apply before problems appear; blackspot is almost impossible to cure once established$$,
 $$Blackspot: Classic black spots with yellow halos on leaves; spray with potassium bicarbonate or copper fungicide|Aphids: Dense colonies on new growth and flower buds; blast with water or spray neem; ladybirds are the best natural control|Powdery mildew: White powder on young leaves; improve airflow; spray sulfur in dry weather|Rose sawfly (leaf-rolling): Leaves rolled tightly by tiny caterpillars; pick off rolled leaves by hand and destroy|Rust: Orange pustules on leaf undersides; remove all affected leaves; spray with sulfur$$,
 ARRAY['Lavender','Garlic','Chives','Sweet Basil','Marigold']),

('Sunflower', 'Helianthus annuus',
 'America''s most cheerful crop — a towering, golden giant that transforms any garden into a statement. Sunflowers are deeply woven into US culture and agriculture, and increasingly popular across India for both oil production and home gardens. Extraordinarily easy to grow and one of the best flowers for attracting bees and butterflies.',
 'novice', 70, 45, 7, 35, 24, 5, 8, 'Well-draining, any type', 6.0, 7.5,
 'summer',
 ARRAY['Temperate','Subtropical','Mediterranean / Oceanic','Semi-Arid','Humid Subtropical','Tropical'],
 false, 1.0,
 $$Sow directly in final position: Sunflowers develop a deep taproot and resent transplanting — sow 2cm deep where they are to grow|Wait until soil is 10°C+: Germinates in 5–10 days in warm soil; cold wet soil rots the large seeds|Plant in the sunniest spot in the garden: Full sun all day — sunflowers planted in shade are spindly and rarely flower properly|Space large varieties 45cm apart, dwarf types 30cm: Crowded sunflowers compete and produce smaller heads|Sow every 3 weeks for a succession of blooms rather than a single mass display$$,
 $$No feeding needed on average soil: Over-fertilised sunflowers put all energy into leaves at the expense of the flower head|Water deeply once a week: The deep taproot finds water; overwatering on heavy soil causes root rot|Support tall varieties with a stake from an early stage: Secure loosely so the stem can strengthen|Harvest heads for seeds when the back turns brown and seeds are plump: Cut the head and hang in a warm, dry place for 2–3 weeks|Leave a few heads standing in autumn: A standing dried sunflower head is a banquet for finches and sparrows$$,
 $$Sunflower moth: Caterpillars eating developing seeds; check heads regularly and crush any visible caterpillars|Aphids: Grey-green masses on stems and under leaves; blast with water or plant nasturtiums as a sacrificial trap crop|Downy mildew: Yellow patches on upper leaves, grey fuzz below in wet weather; improve spacing|Botrytis: Grey mould on stems at soil level in cool, wet springs; improve drainage and avoid overcrowding|Squirrels and birds: Strip seeds from ripe heads; bag heads in paper bags if saving seeds$$,
 ARRAY['Cucumber','Watermelon','Sweet Corn','Zucchini','Sweet Basil']),

('Jasmine', 'Jasminum sambac',
 'The scent of a thousand Indian summer evenings — mogra is the most fragrant flower in the subcontinent, woven into garlands, bridal hair and religious offerings across India. In the USA, Arabian jasmine thrives in Florida, Texas, Hawaii and California, filling warm nights with an intoxicating perfume that no synthetic fragrance can replicate.',
 'novice', 180, 60, 10, 40, 28, 7, 6, 'Well-draining, fertile', 6.0, 7.5,
 'summer',
 ARRAY['Tropical','Subtropical','Humid Subtropical','Mediterranean / Oceanic'],
 true, 0.5,
 $$Plant from a cutting or rooted plant: Jasmine from seed takes 2–3 years to flower; a cutting flowers in one season|Choose the hottest spot against a south-facing wall: Reflected heat triggers the profuse flowering that makes mogra famous|Plant in spring when all cold has passed: Jasmine is cold-sensitive and suffers permanent damage below 5°C|Prepare soil with generous compost: Jasmine is not demanding but performs best in fertile, well-draining soil|Plant near windows, doors and sitting areas: The evening fragrance, strongest after sunset, is one of gardening''s greatest pleasures$$,
 $$Feed with a balanced fertiliser every 3–4 weeks during the growing season: Consistent feeding produces the continuous flush of flowers that makes mogra so prized|Prune hard after each flush of flowering: Cutting back by one-third after blooms fade triggers the next flower flush within 3–4 weeks|Water regularly in hot weather but ensure drainage: Jasmine prefers consistently moist but never waterlogged conditions|Train over a trellis, fence or pergola: Jasmine is a vigorous climber that responds to support with more flowers|Bring indoors in pots before first frost: In USDA zones below 9, treat jasmine as a container plant that winters indoors$$,
 $$Bud drop: Flowers form but drop before opening — caused by irregular watering or temperature fluctuation; keep conditions consistent|Mealybugs: White woolly masses in leaf joints; swab with diluted neem oil or isopropyl alcohol|Aphids: Dense colonies on new growth and buds; spray with water or neem oil|Leaf spot: Brown spots from fungal infection in humid weather; improve airflow and avoid wetting leaves|Spider mites: Fine webbing and stippled leaves in hot, dry weather; mist foliage and spray neem oil$$,
 ARRAY['Rose','Mint','Lavender','Lemongrass','Sweet Basil']),

('Lavender', 'Lavandula angustifolia',
 'The scent of Provence — beloved across America for its intoxicating fragrance, silvery foliage and stunning purple flower spikes. Lavender is one of the most versatile garden plants: edible, medicinal, bee-attracting, deer-resistant and spectacularly beautiful. In India it is grown in Jammu & Kashmir at altitude. The definitive low-maintenance, high-reward garden shrub.',
 'intermediate', 90, 45, -15, 35, 20, 14, 8, 'Sandy, sharp-draining, low fertility', 6.5, 7.5,
 'summer',
 ARRAY['Mediterranean / Oceanic','Temperate','Semi-Arid','Humid Continental'],
 false, 50.0,
 $$Sharp drainage is the absolute requirement: Lavender rots in wet soil; add 50% horticultural grit to heavy clay before planting|Plant in the poorest, most exposed, sunniest spot: Rich soil and shade produce lush, floppy plants that barely flower and die young|Do not add compost or fertiliser at planting: Lavender evolved on stony Mediterranean hillsides on almost nothing|Water in well to establish, then barely at all: Once established, lavender survives on rainfall except in extreme drought|Allow 45cm spacing: Lavender needs good air circulation around every stem to prevent botrytis$$,
 $$Prune immediately after flowering each year: Cut back by two-thirds into the soft, leafy growth; never cut into old brown wood or the plant will not regrow|Never cut into hard, woody stems: Lavender does not regenerate from old wood; keep annual pruning consistent|No feeding needed: One of the rare plants genuinely harmed by fertiliser — rich soil produces fewer, less fragrant flowers|Replace plants after 7–10 years: All lavenders eventually become woody and unproductive; propagate cuttings before you need to|Harvest flower spikes just before flowers fully open for maximum fragrance: Hang in bundles in a warm, dark, ventilated space$$,
 $$Botrytis (grey mould): The primary killer — grey wilting stems at the base; caused by poor drainage or overcrowding; no cure; improve drainage and remove affected plants|Root rot (Phytophthora): Sudden collapse in wet winters; drainage is the only prevention|Shab (Phoma lavandulae): Dieback and grey lesions; remove infected stems immediately|Froghoppers (spittlebugs): Foamy white blobs on stems; harmless — wash off with water|Lavender leaf hopper: Yellowing and distortion; spray with insecticidal soap if severe$$,
 ARRAY['Rose','Rosemary','Oregano','Thyme','Garlic']),

('Hibiscus', 'Hibiscus rosa-sinensis',
 'India''s most iconic flowering shrub — the gudhal blooms almost year-round in tropical gardens, its enormous scarlet flowers used for Kali worship, hair care and hibiscus tea. In the USA it thrives in Florida, Hawaii, California and the Gulf Coast. The flowers are edible, the tea is tart and deeply antioxidant, and the plant is one of the most forgiving and generous shrubs in existence.',
 'novice', 90, 120, 10, 40, 27, 5, 6, 'Well-draining, fertile loam', 6.0, 7.0,
 'summer',
 ARRAY['Tropical','Subtropical','Humid Subtropical','Mediterranean / Oceanic'],
 true, 200.0,
 $$Plant from a cutting for fastest establishment: A 15cm cutting roots in 3–4 weeks in water or moist compost|Choose a sunny spot with protection from harsh wind: Full sun produces the most flowers; strong wind damages the large blooms|Prepare a generously composted hole: Hibiscus is a hungry feeder and appreciates rich soil at planting|Space large shrubs at least 1.2 metres apart: Hibiscus grows 2–3 metres tall in warm climates; give it room|Plant in spring or early summer so the plant establishes before the first cool season$$,
 $$Feed with high-potash fertiliser every 2 weeks from spring to autumn: Potassium drives flower production — the single biggest lever for more blooms|Water regularly in hot weather: Hibiscus wilts dramatically in drought but recovers fast; aim for consistently moist soil|Prune hard in late winter or early spring: Cut back by one-half; hibiscus blooms on new growth so heavy pruning means more flowers|Bring container plants indoors before temperatures drop below 10°C: Tropical hibiscus cannot tolerate frost|Harvest flowers for hibiscus tea at full bloom and dry them in the sun or a low oven$$,
 $$Hibiscus aphid: Dense yellow aphid colonies on new growth; spray neem oil or insecticidal soap|Whitefly: Tiny white flies rising in a cloud when disturbed; use yellow sticky traps and neem oil|Leaf spot (Cercospora): Brown spots on leaves; remove worst-affected leaves and avoid wetting foliage|Mealybugs: White woolly masses in leaf joints; treat with neem oil or diluted rubbing alcohol|Scale insects: Brown crusty bumps on woody stems; scrub off and apply horticultural oil$$,
 ARRAY['Sweet Basil','Lemongrass','Marigold','Moringa','Banana']),

('Zinnia', 'Zinnia elegans',
 'The American summer garden''s most cheerful flower — an explosion of bold, saturated colour from midsummer to first frost. Zinnias thrive in heat that wilts other flowers, produce an abundance of long-stemmed blooms perfect for cutting, and are one of the best butterfly-attracting flowers you can grow. Increasingly popular across India''s warm plains.',
 'novice', 60, 25, 15, 38, 26, 5, 8, 'Well-draining, any type', 5.5, 7.0,
 'summer',
 ARRAY['Tropical','Subtropical','Temperate','Mediterranean / Oceanic','Semi-Arid','Humid Subtropical'],
 false, 40.0,
 $$Sow direct after all frost risk has passed: Zinnias hate cold and germinate in 5–7 days in warm soil (20°C+)|Press seeds lightly into the surface: Do not bury deeply — 0.5cm is sufficient|Sow every 3–4 weeks from spring to midsummer: Successive sowings produce flowers from early summer to October|Plant in the hottest, most open part of the garden: The more sun, the more blooms and the less powdery mildew|Thin seedlings ruthlessly to 25cm apart: Crowded zinnias get mildew that ruins the display$$,
 $$Deadhead continuously or cut for vases: Every spent flower removed triggers two new stems — the plant rewards regular attention|Never water on the leaves: Wet foliage causes powdery mildew; water at soil level only|Pinch growing tip when plants are 15cm tall: Creates a branching plant with far more flowering stems than an unpinched one|No feeding needed on average soil: Overfeeding produces enormous leaves and poor flowers; zinnias prefer slightly hungry conditions|Leave a few seed heads at season''s end: Zinnia seeds are easy to collect and store$$,
 $$Powdery mildew: The most common zinnia problem — white powder spreading across leaves; space plants widely and never wet foliage|Alternaria blight: Brown-ringed spots on leaves in wet conditions; remove worst-affected leaves and improve airflow|Aphids: Clusters on new growth and flower buds; spray with water or neem oil|Bacterial leaf spot: Water-soaked spots that turn brown; avoid overhead watering and rotate crops|Spider mites: Stippled, bronzed leaves in hot, dry weather; mist foliage and spray neem oil$$,
 ARRAY['Sweet Basil','Tomato','Marigold','Sunflower','Garlic']),

('Chrysanthemum', 'Chrysanthemum × morifolium',
 'One of the most important flowers in both Indian and American horticulture. In India, chrysanthemums (guldaudi) are a mainstay of the festival flower market — used in garlands, offerings and wedding decoration throughout the cool season. In the USA they are synonymous with autumn, filling gardens with rich golds, bronzes, purples and reds from September to November.',
 'intermediate', 90, 45, 0, 30, 17, 5, 6, 'Well-draining, fertile loam', 5.5, 6.5,
 'autumn',
 ARRAY['Temperate','Subtropical','Humid Continental','Mediterranean / Oceanic'],
 true, 20.0,
 $$Plant rooted cuttings in spring for autumn blooms: Chrysanthemums need the long growing season of spring and summer to build the plant that flowers in autumn|Choose a sunny spot with good airflow: Shade and poor airflow are the two main causes of spindly plants and fungal disease|Prepare fertile, well-draining soil: Work in 2–3 inches of compost; chrysanthemums are hungry feeders that reward rich soil|Plant at the same level as the pot: Do not bury the stem; the crown must stay above soil|Space 45cm apart: Generous spacing is the key to disease prevention and allows each plant to develop its full round form$$,
 $$Pinch growing tips every 2–3 weeks from planting until mid-summer: Each pinch creates 2–3 new stems; stopping pinching by July allows buds to form for autumn bloom|Feed with balanced fertiliser every 2 weeks until buds show colour: Switch to high-potash feed when buds swell to intensify flower colour|Stake tall varieties in midsummer: A single central stake with loose ties prevents autumn storms from flattening plants|Water at the base — never on the foliage: Wet leaves are the primary cause of the fungal diseases that devastate chrysanthemums|Cut back to 15cm after all flowering has finished and mulch the crown for winter$$,
 $$White rust (Puccinia horiana): White pustules on leaf undersides; a notifiable disease in some countries; remove and destroy affected plants immediately|Aphids: Dense colonies on new growth and flower buds; spray neem or insecticidal soap|Leaf miner: Pale winding tunnels in leaves; remove affected leaves; rarely causes serious harm|Botrytis (grey mould): Furry mould in cool, damp conditions; improve airflow; remove affected flowers promptly|Eelworm (chrysanthemum nematode): Brown discoloration spreading up through leaves; no cure; destroy affected plants and do not replant chrysanthemums in that spot$$,
 ARRAY['Garlic','Chives','Lavender','Marigold','Mint'])

ON CONFLICT (name) DO NOTHING;

-- ─── FUN FACTS, STORIES, NUTRITION & RECIPES ─────────────────────────────────

UPDATE vegetables SET
  fun_fact = 'Mango has been cultivated in India for over 4,000 years — it appears in the writings of Alexander the Great''s historians when his army entered India in 327 BC. India still produces nearly half of the world''s entire mango crop.',
  growing_story = 'Ramesh planted a grafted Alphonso sapling on the south side of his house in Ratnagiri. Three years later the tree touched the first-floor window. That summer, the family ate fresh mangoes every morning for six weeks and gave away more than they could count.',
  nutrition = '60 kcal per 100g (fresh). Exceptional source of Vitamin C (36mg) and Vitamin A. Rich in folate, potassium and B6. Contains mangiferin — a powerful polyphenol with anti-inflammatory and anti-tumour properties researched in dozens of clinical studies.',
  simple_recipe = 'Aam Panna — Pressure-cook 2 raw green mangoes until soft. Scoop out the pulp and blend with 4 tablespoons of jaggery, a pinch of cumin, black salt and a handful of mint leaves. Add cold water to taste and serve over ice. India''s greatest summer cooler, ready in 15 minutes — it prevents heat stroke and tastes like nothing else.'
WHERE name = 'Mango';

UPDATE vegetables SET
  fun_fact = 'Strawberries are not technically berries — they are "accessory fruits," because the fleshy part develops from the flower''s base, not the ovary. True berries, by botanical definition, include bananas and avocados.',
  growing_story = 'Priya grew strawberries in old colander containers hung on her Mahabaleshwar balcony railing. The holes in the bottom allowed perfect drainage in the monsoon. By March her red berries were visible from the road, and strangers kept asking what she was growing.',
  nutrition = '32 kcal per 100g. An exceptional source of Vitamin C — 100g of strawberries provides 58mg, nearly the full daily requirement. Also rich in folate, manganese and powerful antioxidant ellagic acid. One of the lowest-sugar fruits available.',
  simple_recipe = 'Strawberry Lassi — Blend a cup of ripe strawberries with 2 cups of thick yoghurt, 2 tablespoons of sugar and a pinch of cardamom. Add a handful of ice and blend again until smooth and frothy. Pour into tall glasses and serve immediately. A 5-minute drink that uses a whole punnet of strawberries and is better than any commercial version.'
WHERE name = 'Strawberry';

UPDATE vegetables SET
  fun_fact = 'The banana plant is not a tree — it is a giant herb, making bananas technically the world''s largest herbaceous plant. What looks like a trunk is a pseudostem made entirely of tightly packed leaf bases. The plant dies after fruiting and is replaced by one of its own pups.',
  growing_story = 'Sunita had a single banana pup from her neighbour in a 20-litre pot on her Mumbai terrace. Within 8 months it was producing a full bunch. She photographed the flowers unfolding petal by petal over three weeks and said it was the most beautiful thing her terrace had ever grown.',
  nutrition = '89 kcal per 100g. Rich in potassium (358mg) — the highest of any common fruit. Excellent source of Vitamin B6, Vitamin C, magnesium and fibre. Contains resistant starch when unripe, which feeds beneficial gut bacteria. One medium banana provides 12% of the daily potassium requirement.',
  simple_recipe = 'Banana Halwa — Mash 4 ripe bananas into a smooth paste. Heat 2 tablespoons of ghee in a heavy pan and add the banana paste, stirring constantly on medium heat. Add 3 tablespoons of sugar and keep stirring until the mixture comes away from the pan and turns a deep golden colour — about 15 minutes. Add cardamom powder and chopped cashews. Press into a greased tray and cut into squares when cool.'
WHERE name = 'Banana';

UPDATE vegetables SET
  fun_fact = 'Papaya contains papain — a proteolytic enzyme so powerful it is used commercially to tenderise meat and in pharmaceutical products to treat digestive disorders. A slice of raw papaya placed on a tough cut of meat will begin breaking it down in under an hour.',
  growing_story = 'Kavitha planted two papaya seeds in a corner of her Chennai courtyard in June. By December, one had produced its first fruit. By February it bore eleven at once, more than the family could eat. She gave bags of papaya to every house on the street and the tree kept fruiting for another two years.',
  nutrition = '43 kcal per 100g. More Vitamin C per 100g than an orange — 62mg versus 53mg. Exceptional source of folate, potassium and Vitamin A. The enzyme papain has proven anti-inflammatory properties. Unripe papaya has been used in traditional medicine across Asia for centuries.',
  simple_recipe = 'Raw Papaya Salad (Som Tam-style) — Shred a firm green papaya on the coarse side of a grater. Mix with lime juice, fish sauce (or salt), a pinch of sugar, sliced red chilli, cherry tomatoes and crushed roasted peanuts. Toss well and serve immediately. The acidity of the lime against the raw papaya is extraordinary — fresh, fiery and completely addictive.'
WHERE name = 'Papaya';

UPDATE vegetables SET
  fun_fact = 'Guava has more Vitamin C per 100g than almost any other fruit on earth — 228mg versus the orange''s 53mg. A single guava provides four times the daily Vitamin C requirement of an adult. Despite being one of India''s cheapest fruits, it is nutritionally one of the most valuable.',
  growing_story = 'Old Mr. Sharma''s guava tree in his Lucknow courtyard had been there for 40 years. He never watered it, never fed it and pruned it only when branches hit the wall. Every winter it produced more fruit than three families could eat. He said the secret was planting it in the wrong place — where water from the roof drained and the sun bounced off two white walls.',
  nutrition = '68 kcal per 100g. 228mg Vitamin C — the highest of any commonly eaten fruit. Rich in lycopene (more than tomatoes in pink varieties), potassium, folate and fibre. The entire fruit is edible including the skin, which contains the highest concentration of nutrients.',
  simple_recipe = 'Guava Chaat — Peel and chop firm guavas into large chunks. Toss with a squeeze of lime juice, a generous pinch of chaat masala, black salt, roasted cumin powder and a pinch of red chilli. Add finely sliced green chilli and fresh coriander. Toss and eat immediately as a snack. The combination of guava''s sweet-tart flavour with the spiced masala is one of the great simple pleasures of Indian street food.'
WHERE name = 'Guava';

UPDATE vegetables SET
  fun_fact = 'Watermelon is 92% water — making it one of the most hydrating foods on earth. Ancient Egyptians placed watermelons in the tombs of pharaohs as a source of water in the afterlife; seeds have been found in Tutankhamun''s tomb dating to 3,300 years ago.',
  growing_story = 'Harjeet grew a single watermelon vine along the fence of his Punjab kitchen garden, training it up the wire. The vine climbed 4 metres. By August he had three watermelons hanging in old net bags tied to the fence to support their weight. He chilled one in a bucket of well-water and cut it open for the family on a 42°C afternoon.',
  nutrition = '30 kcal per 100g. 92% water. Rich in lycopene — the red colour comes from the same antioxidant as tomatoes, but watermelon contains more. Lycopene is linked to reduced risk of heart disease and certain cancers. Good source of Vitamin C, Vitamin A and citrulline, which improves blood flow.',
  simple_recipe = 'Watermelon Agua Fresca — Blend a large chunk of seedless watermelon flesh until smooth. Pour through a sieve or just leave unstrained. Add the juice of 2 limes, a pinch of salt and 2 tablespoons of sugar if needed. Fill glasses with ice, add the watermelon juice and garnish with a sprig of mint. Mexico''s greatest summer drink — takes 5 minutes and tastes like a chilled waterfall.'
WHERE name = 'Watermelon';

UPDATE vegetables SET
  fun_fact = 'Blueberries are one of the only foods that are naturally blue. The blue colour comes from anthocyanins — the same antioxidant compounds responsible for the fruit''s remarkable health properties. Wild blueberries have been eaten by Indigenous Americans for at least 13,000 years.',
  growing_story = 'Martha in Vermont planted two blueberry bushes in her garden the year she retired. For three summers they produced almost nothing. Then in year four both bushes erupted with more blueberries than she had ever seen. She made pies, jams, muffins and still froze three bags. Forty years later, the same two bushes are still producing.',
  nutrition = '57 kcal per 100g. Among the highest antioxidant content of any food on earth. Rich in anthocyanins, Vitamin C, Vitamin K and manganese. Regular blueberry consumption is linked in multiple clinical studies to improved memory, reduced blood pressure and lower cardiovascular risk. Eating a cup of blueberries a day for 6 weeks measurably reduces arterial stiffness.',
  simple_recipe = 'Blueberry Compote — Put 2 cups of blueberries in a saucepan with 3 tablespoons of sugar and the juice of half a lemon. Cook on medium heat, stirring, for 8 minutes until the berries have burst and the mixture has thickened to a syrupy sauce. Pour warm over vanilla ice cream, pancakes, yoghurt or toast. The simplest thing you can make with a blueberry harvest and completely irresistible.'
WHERE name = 'Blueberry';

UPDATE vegetables SET
  fun_fact = 'Pomegranate appears in the mythology of ancient Greece, Egypt, Persia and India — it is mentioned in the Bible, the Quran and the Rig Veda. In Indian tradition the pomegranate is a symbol of fertility and prosperity; in Greek myth it is the fruit that bound Persephone to the underworld for half the year, creating the seasons.',
  growing_story = 'Rekha''s Bhagwa pomegranate in Solapur fruits twice a year and is the centrepiece of her kitchen garden. She says the only secret is this: she stops all watering for 6 weeks before the rains begin. When the first rain comes, the flowers burst out within 10 days. The whole tree turns scarlet before she even sees a single fruit.',
  nutrition = '83 kcal per 100g (arils). Rich in punicalagins — among the most powerful antioxidants in nature, with 3× the antioxidant activity of red wine or green tea. Good source of Vitamin C, folate and potassium. Clinical studies show regular consumption lowers blood pressure and reduces arterial inflammation.',
  simple_recipe = 'Anardana Raita — Stir a generous handful of pomegranate seeds into thick yoghurt with a pinch of cumin powder, black salt, a few mint leaves and a small pinch of sugar. The seeds stay crunchy in the raita and the burst of sweet-sharp juice against the cool yoghurt is one of the great small pleasures of Indian cooking. Ready in 2 minutes.'
WHERE name = 'Pomegranate';

UPDATE vegetables SET
  fun_fact = 'A single marigold plant produces over 30 distinct aromatic compounds from its roots — these are toxic to root-knot nematodes and several soil-borne pathogens. Plant marigolds for 3 months and the soil remains protected for years afterward. French and African marigolds are among the very few plants with scientifically proven nematode-suppression effects.',
  growing_story = 'For Deepawali, Sunita''s family grew a full bed of marigolds in the back garden from September onwards. By October the garden was a solid wall of orange and gold. They cut armloads for garlands and the house smelled of marigold for the entire festival week. Her grandmother said the fragrance was the smell of celebration.',
  nutrition = 'Marigold petals (Tagetes) are edible and rich in lutein and zeaxanthin — two carotenoids clinically proven to protect against macular degeneration and cataracts. The petals are used to colour butter, cheese and egg yolks across Europe and are approved as a natural food colouring.',
  simple_recipe = 'Marigold Petal Rice — Wash and dry 2 cups of fresh marigold petals, removing any bitter white bases. Cook basmati rice and while hot, fold in the petals with a knob of butter or ghee, a pinch of saffron and cardamom. The petals turn the rice a soft golden colour and add a faint floral bitterness that is extraordinary alongside any korma or rich dal.'
WHERE name = 'Marigold';

UPDATE vegetables SET
  fun_fact = 'It takes approximately 60,000 rose blossoms to produce a single 30ml bottle of rose essential oil — explaining why real Bulgarian rose otto costs more per litre than most precious metals. The rose has been cultivated longer than any other ornamental plant; rose fossils found in Colorado date to 35 million years ago.',
  growing_story = 'Anjali''s grandmother brought a dark red Damask rose cutting from her village in UP when she moved to Delhi. Three generations later the same cutting — now a gnarled, 2-metre shrub — grows beside the front door of the family house. It blooms twice a year and the fragrance still stops people in the street.',
  nutrition = 'Rose petals are edible and rich in Vitamin C — wild rosehips (the fruit of the rose) contain 20× more Vitamin C than oranges and were collected in Britain during WWII as a Vitamin C supplement when citrus was unavailable. Rose water, distilled from petals, has proven anti-inflammatory and antimicrobial properties.',
  simple_recipe = 'Rose Sharbat — Simmer 2 cups of fresh rose petals in 2 cups of water with 1 cup of sugar for 10 minutes until the petals go pale and the syrup turns pink. Strain and add a few drops of rose water and a pinch of citric acid. Store in the fridge. To serve, mix 2 tablespoons of syrup into a glass of cold water or milk. The colour is extraordinary — a deep blush pink that looks too beautiful to drink.'
WHERE name = 'Rose';

UPDATE vegetables SET
  fun_fact = 'Sunflowers are heliotropic — young plants track the sun from east to west throughout the day and reset overnight, facing east again by dawn. This stops once the flower fully opens. Scientists discovered this is driven by circadian-rhythm-controlled growth hormones that cause one side of the stem to grow faster than the other.',
  growing_story = 'Every year Ravi plants a row of giant sunflowers along his Delhi garden wall on Holi. By July they are taller than the wall, visible from the road. His children measure themselves against the stems. He lets the heads dry on the plants and in November the sparrows strip them completely in three days.',
  nutrition = 'Sunflower seeds: 584 kcal per 100g. Extraordinarily rich in Vitamin E — 35mg per 100g, the single highest concentration of Vitamin E in any commonly eaten food. Excellent source of selenium, magnesium, B vitamins and healthy linoleic acid. A small handful of sunflower seeds provides a full day''s Vitamin E requirement.',
  simple_recipe = 'Roasted Sunflower Seeds — Scoop seeds from a dried sunflower head, rinse well and spread on a baking tray. Toss with a teaspoon of oil, salt and any spice you like — smoked paprika, cumin or chaat masala all work perfectly. Roast at 180°C for 12–15 minutes, shaking once, until golden. They become irresistibly crunchy as they cool. Far better than anything from a packet.'
WHERE name = 'Sunflower';

UPDATE vegetables SET
  fun_fact = 'Jasmine is the national flower of Pakistan and the state flower of Hawaii. In India, jasmine (mogra) is interwoven with culture to an extraordinary degree — it is offered to deities, worn in hair, used in wedding garlands, and the process of enfleurage — absorbing jasmine fragrance into fat — was developed in India thousands of years before modern perfumery.',
  growing_story = 'Every evening, Meena''s mogra bush on the Pune terrace opens its flowers at dusk. The fragrance carries across three floors. Her daughter says it is the smell of home — that no matter where she lives, she only has to smell jasmine and she is back in that apartment, listening to the evening prayer from the temple below.',
  nutrition = 'Jasmine flowers have been used in traditional medicine for thousands of years. Jasmine tea is rich in antioxidant catechins and has demonstrated anti-anxiety effects in several clinical studies. The aroma of jasmine has been shown to reduce anxiety and improve sleep quality as effectively as low-dose valium in one German study.',
  simple_recipe = 'Jasmine Rice — Toast 1.5 cups of basmati rice in a dry pan for 2 minutes until fragrant. Add to a pot of boiling water with a handful of fresh jasmine flowers tied in a muslin cloth. Cook the rice as normal, then remove the flower bundle. The rice absorbs a faint jasmine fragrance that makes even plain rice feel like something special. Serve under any mild curry or just with a knob of butter.'
WHERE name = 'Jasmine';

UPDATE vegetables SET
  fun_fact = 'Lavender was used by Roman soldiers to disinfect wounds — the Latin word lavare (to wash) is the root of the name. During WWI, when hospital antiseptics ran out, French surgeons used lavender essential oil as a wound disinfectant. Modern research confirms it has genuine antibacterial and antifungal properties.',
  growing_story = 'Carol in Provence inherited a derelict lavender field of 400 plants from her grandmother. Her first summer she did nothing but prune them hard after flowering. The second summer the field turned purple from June to August. She sells dried bundles at the village market every Saturday and says the bees make more noise than the tourists.',
  nutrition = 'Lavender is edible and used in Provençal cooking, herbes de Provence and increasingly in culinary applications worldwide. Contains linalool and linalyl acetate — compounds with clinically proven anxiolytic effects. Lavender tea reduces anxiety, improves sleep quality and lowers heart rate in multiple double-blind studies.',
  simple_recipe = 'Lavender Shortbread — Cream 200g butter with 100g icing sugar until pale. Add 1 tablespoon of finely chopped fresh lavender flowers (or 1 teaspoon dried), 250g plain flour and a pinch of salt. Roll into a log, wrap in clingfilm and chill for 30 minutes. Slice into rounds 1cm thick and bake at 160°C for 15 minutes until just pale gold at the edges. The lavender makes these extraordinary — not soapy, just faintly floral, in a way that makes people ask what they are eating.'
WHERE name = 'Lavender';

UPDATE vegetables SET
  fun_fact = 'Hibiscus tea is the world''s third most consumed herbal tea after chamomile and peppermint. In multiple clinical trials, drinking 2-3 cups of hibiscus tea daily for 6 weeks reduced systolic blood pressure by an average of 7 points — comparable to the effect of low-dose antihypertensive medication.',
  growing_story = 'Every morning at the Kali temple in Kolkata, Dipa brings a basket of fresh gudhal flowers — fresh from the plant in her courtyard — for the puja. She has grown hibiscus in the same clay pot for 11 years, cutting it back hard each March. It blooms from April to December without stopping, and she cannot remember a single day it looked unhappy.',
  nutrition = 'Hibiscus petals: rich in anthocyanins and organic acids including hibiscus acid and citric acid. 100ml of hibiscus tea contains more antioxidants than green tea. Multiple clinical studies confirm regular consumption lowers LDL cholesterol, reduces blood pressure and has liver-protective effects. Used in Ayurveda for hair growth and cooling properties.',
  simple_recipe = 'Hibiscus Cooler (Agua de Jamaica) — Bring 1 litre of water to a boil, add 1 cup of dried hibiscus petals and simmer for 5 minutes. Turn off the heat, add 4 tablespoons of sugar and stir. Leave to steep for 10 minutes. Strain into a jug and refrigerate. Serve over ice with a slice of lime. The colour is a deep garnet red — one of the most beautiful drinks in existence. Essential in Mexico and increasingly everywhere.'
WHERE name = 'Hibiscus';

UPDATE vegetables SET
  fun_fact = 'Zinnias were the first flower grown entirely in space — aboard the International Space Station in 2016, NASA astronaut Scott Kelly grew a zinnia using the VEGGIE plant growth system. Nasa chose zinnias because they are a model for studying how plants respond to microgravity and limited light.',
  growing_story = 'Every summer Rosa plants a long border of mixed zinnias along the fence of her Texas vegetable garden. By August the fence disappears under a wall of every colour imaginable. She says zinnias are the only flowers that look better cut than growing — she fills every room in the house with them all summer and still cannot keep up with how fast they produce new blooms.',
  nutrition = 'Zinnia petals are edible and used as a garnish in modern culinary applications. The plant is valued primarily as an ornamental and companion plant. Studies confirm that zinnia plantings increase beneficial insect populations — particularly predatory wasps and parasitic flies — by providing nectar in periods when other flowers are not available.',
  simple_recipe = 'Zinnia Petal Salad Garnish — Take fresh zinnia petals in bright orange, red and yellow and scatter liberally over a green salad dressed with honey-lemon vinaigrette. The petals add a faint peppery-bitter note and are startlingly beautiful. Pull the petals from the base of the flower and use only the coloured portion. The effect of a salad scattered with flower petals is so striking it becomes the main talking point of any table it appears on.'
WHERE name = 'Zinnia';

UPDATE vegetables SET
  fun_fact = 'Chrysanthemum is the oldest cultivated ornamental flower in the world — records of chrysanthemum cultivation in China date to 1500 BC. The flower is the symbol of the Japanese imperial family and appears on the Emperor''s Seal. In Japan, the National Chrysanthemum Exhibition has been held annually for over 200 years.',
  growing_story = 'Every November, Geeta''s chrysanthemum garden in Pune is the talk of the neighbourhood. She grows 14 varieties in pots arranged on the front steps — bronze football blooms, delicate white spiders, bold red cushions. She has been growing them for 30 years and says the secret is pinching every 2 weeks from April to July without exception.',
  nutrition = 'Chrysanthemum tea is a major traditional drink in China and increasingly popular worldwide. Rich in flavonoids including apigenin and luteolin. Clinical studies show chrysanthemum extract lowers blood pressure, reduces inflammation and has anti-bacterial effects against several common pathogens. In traditional Chinese medicine it is used for headaches, fever and eye inflammation.',
  simple_recipe = 'Chrysanthemum Tea — Bring 500ml of water to just below boiling (85°C). Add 8–10 fresh or dried chrysanthemum flowers and steep for 3–5 minutes. Add a small piece of rock sugar and stir until dissolved. Pour into a clear glass so the flowers are visible and the golden colour can be appreciated. Drink warm or allow to cool and serve over ice. Subtly floral, faintly sweet and deeply calming — one of Asia''s great everyday drinks.'
WHERE name = 'Chrysanthemum';
