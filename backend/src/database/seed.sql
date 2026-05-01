-- FarmSync Vegetable Seed Data
-- Steps stored as pipe-separated "Title: Detail" pairs
-- Run: docker exec -i farming-postgres-1 psql -U postgres -d farmsync < backend/src/database/seed.sql

INSERT INTO vegetables (
  name, scientific_name, description, difficulty_level,
  days_to_harvest, spacing_cm, min_temp_celsius, max_temp_celsius, optimal_temp_celsius,
  water_frequency_days, sunlight_hours, soil_type, ph_min, ph_max,
  season, climate_zones, can_greenhouse, yields_per_plant,
  planting_tips, care_tips, pest_diseases, companion_plants
) VALUES

-- ─── WESTERN VEGETABLES ───────────────────────────────────────────────────────

('Tomato', 'Solanum lycopersicum',
 'One of the most popular home garden vegetables. Warm-season crop producing juicy, nutrient-rich fruit in endless varieties.',
 'intermediate', 75, 60, 10, 35, 24, 7, 8, 'Sandy loam, well-draining', 6.2, 6.8,
 'summer',
 ARRAY['Temperate','Subtropical','Mediterranean / Oceanic','Humid Continental','Temperate Continental'],
 true, 4.5,
 $$Choose a sunny location: Pick a spot with 8+ hours of direct sun — tomatoes need full sun for fruit development|Prepare rich soil: Dig 30cm deep and mix in 3-4 inches of compost; tomatoes are heavy feeders and reward good soil prep|Plant deep for strong roots: Bury 2/3 of the seedling stem — tomatoes form roots along the buried stem, creating a stronger plant|Set up support before planting: Install cage or stake before putting plants in ground to avoid disturbing roots later|Space 60cm apart: Crowded tomatoes get poor airflow and more disease; give each plant room to breathe$$,
 $$Water deeply once a week: Give 2-3 litres per plant, soaking 15cm deep — shallow watering causes shallow roots|Feed every 2 weeks: Use a balanced fertiliser once flowers appear; switch to low-nitrogen once fruit sets|Prune suckers on indeterminate types: Remove shoots growing between stem and branch — this focuses energy into fruit|Mulch 8cm around base: Keeps soil moisture even, prevents soil splash (which spreads disease), and regulates temperature|Watch for blossom end rot: Dark spot on bottom of fruit means inconsistent watering or calcium shortage — water more evenly$$,
 $$Tomato hornworm: Large green caterpillar eating leaves; hand-pick or use Bacillus thuringiensis (Bt) spray|Aphids: Tiny clusters under leaves; blast off with water or spray neem oil weekly|Early blight: Dark spots with yellow rings on lower leaves; remove affected leaves and improve airflow|Late blight: Dark water-soaked patches spreading fast; remove infected parts immediately and avoid overhead watering|Blossom drop: Flowers fall without setting fruit — usually too hot (above 35°C) or too cold; ensure consistent watering$$,
 ARRAY['Basil','Marigold','Garlic','Chives','Dill']),

('Lettuce', 'Lactuca sativa',
 'Fast-growing cool-season leaf vegetable. Perfect for beginners — harvest in as little as 30 days. Grows well in containers and raised beds.',
 'novice', 50, 20, 4, 24, 16, 3, 6, 'Fertile, well-draining', 6.0, 7.0,
 'spring',
 ARRAY['Temperate','Mediterranean / Oceanic','Humid Continental','Temperate Continental','Subtropical'],
 true, 0.3,
 $$Sow seeds in cool weather: Plant when daytime temps are 15-18°C — lettuce bolts (goes bitter and to seed) in heat|Press seeds into surface: Lettuce seeds need light to germinate; barely cover with 3mm of soil and firm gently|Sow in rows 30cm apart: Thin seedlings to 20cm spacing once they have 2 true leaves — use thinnings as baby salad|Water gently at soil level: Seeds and seedlings wash away easily; use a fine rose watering can or drip irrigation|Succession plant every 2 weeks: Sow a fresh row every 2 weeks for continuous harvest rather than a glut$$,
 $$Keep soil consistently moist: Check every 2 days; lettuce roots are shallow and dry out quickly|Mulch between plants: Keeps soil cool and moist — essential for preventing bolting in warmer spells|Harvest outer leaves first: Take the oldest outer leaves and the plant keeps producing; never strip the centre|Shade in warm weather: Drape with 30% shade cloth when temps exceed 22°C to prevent bolting|Watch for slugs at night: They shred leaves overnight; use copper tape around beds or set beer traps$$,
 $$Aphids: Small green/black clusters under leaves; wash off with water or use insecticidal soap|Slugs and snails: Irregular holes in leaves, slime trail present; use iron phosphate pellets or hand-pick at dusk|Downy mildew: Yellow patches on top of leaves, white fuzz below; improve airflow and avoid wetting foliage|Bolting: Plant shoots up and leaves taste bitter — caused by heat or long days; harvest immediately and resow$$,
 ARRAY['Chives','Garlic','Dill','Marigold','Radish']),

('Carrot', 'Daucus carota',
 'Root vegetable requiring loose, deep soil. Patient growers are rewarded with sweet, crunchy roots rich in beta-carotene.',
 'intermediate', 70, 7, 7, 27, 18, 7, 8, 'Sandy loam, deep and loose', 6.0, 6.8,
 'spring',
 ARRAY['Temperate','Mediterranean / Oceanic','Humid Continental','Temperate Continental'],
 false, 0.15,
 $$Prepare deep, rock-free soil: Loosen soil to 30cm depth and remove all stones — obstructions cause forked, misshapen roots|Sow seeds thinly: Scatter seeds 2cm apart in rows 30cm apart; cover with just 6mm of fine soil|Keep seedbed moist until germination: Seeds take 7-21 days; cover with damp cloth or board and check daily|Thin to 7cm apart: Once seedlings are 5cm tall, thin without pulling (use scissors) — disturbing soil dislodges neighbours|Mark rows clearly: Carrots are slow to emerge; mark rows so you don't accidentally dig them up$$,
 $$Water 2-3cm per week consistently: Irregular watering causes splitting; even moisture is key|Exclude light from shoulders: Earth up or mulch around the base — green shoulders taste bitter|Weed carefully: Carrots compete poorly with weeds; hand-weed close to plants to avoid disturbing roots|Fertilise with low-nitrogen feed: Too much nitrogen grows leafy tops and forked roots; use a root vegetable fertiliser|Harvest by loosening soil first: Ease a fork in 10cm away and lever up rather than pulling by tops$$,
 $$Carrot fly: White maggots tunnel through roots; cover with fine mesh immediately after sowing|Aphids: Wilting and leaf curl; spray with water or insecticidal soap|Forked roots: Caused by stony soil or fresh manure; always prepare soil well before sowing|Green shoulders: Roots exposed to light turn bitter and green; hill up soil or mulch around tops$$,
 ARRAY['Onion','Leek','Rosemary','Sage','Tomato']),

('Bell Pepper', 'Capsicum annuum',
 'Sweet, crunchy warm-season vegetable. Takes time but rewards patient growers with colourful fruit high in vitamin C. Excellent in containers.',
 'intermediate', 80, 45, 16, 35, 24, 4, 8, 'Fertile, well-draining loam', 6.0, 6.8,
 'summer',
 ARRAY['Temperate','Subtropical','Mediterranean / Oceanic','Humid Continental'],
 true, 1.5,
 $$Start seeds 8-10 weeks before last frost: Peppers need a long growing season — start indoors in seed trays at 27°C|Harden off for 10 days before transplanting: Gradually expose seedlings to outdoor conditions to prevent transplant shock|Transplant when soil reaches 18°C: Cold soil stunts peppers badly; wait until conditions are reliably warm|Plant at same depth as pot: Unlike tomatoes, peppers should not be buried deep|Space 45cm apart: Good spacing prevents disease and allows pollinators to access all flowers$$,
 $$Water every 3-4 days consistently: Peppers are sensitive to irregular watering which causes blossom drop and fruit problems|Support plants with stakes: Fruit-laden branches snap easily in wind; stake when 30cm tall|Feed with potassium-rich fertiliser: Once flowering starts, switch from balanced feed to high-K formula for better fruit set|Avoid high nitrogen: Too much nitrogen causes leafy, unproductive plants with few peppers|Harvest green or wait for colour: Green peppers are fully mature; waiting 2-3 more weeks gives red/yellow/orange colour$$,
 $$Aphids: Cluster under leaves and on new growth; spray with neem oil or insecticidal soap|Blossom drop: Flowers fall without setting — caused by temps above 35°C or below 16°C; ensure stable warm conditions|Bacterial leaf spot: Dark water-soaked spots on leaves; avoid overhead watering and remove affected leaves|Blossom end rot: Dark leathery patch on fruit bottom; caused by calcium deficiency from inconsistent watering$$,
 ARRAY['Basil','Marigold','Carrot','Onion','Tomato']),

('Cucumber', 'Cucumis sativus',
 'Fast-growing warm-season vine. Produces prolifically once established. Grows vertically on a trellis to save space and improve fruit quality.',
 'novice', 60, 30, 18, 35, 27, 5, 7, 'Moist, well-draining', 6.5, 7.0,
 'summer',
 ARRAY['Temperate','Subtropical','Mediterranean / Oceanic','Humid Continental','Tropical'],
 true, 8.0,
 $$Wait until soil is 18°C+: Cucumbers planted in cold soil fail to thrive; use a soil thermometer to check|Set up trellis before sowing: A 150cm trellis saves space and keeps fruit clean and straight|Sow 2-3 seeds per spot, 2.5cm deep: Thin to strongest seedling once 10cm tall|Water soil, not leaves: Wet foliage causes mildew; use drip irrigation or water at the base only|Warm the soil with black plastic mulch: Laying black plastic 2 weeks before planting dramatically speeds growth$$,
 $$Water deeply twice a week: Cucumbers are 95% water — consistent moisture is essential for non-bitter fruit|Feed with balanced liquid fertiliser every 2 weeks: Start feeding when first flowers appear|Train vines up trellis regularly: Guide tendrils weekly to prevent tangled, shaded growth|Harvest before fruit yellows: Pick every 2-3 days once ready — leaving overripe fruit stops production|Pollination: If fruit is small and yellowing, hand-pollinate by transferring pollen from male to female flowers with a small brush$$,
 $$Powdery mildew: White coating on leaves; improve airflow and avoid wetting leaves — very common in humid conditions|Cucumber beetle: Yellow/black striped beetle chewing leaves and spreading wilt; use row covers early in season|Aphids: Colonies on new growth; spray with water or neem oil|Bitter fruit: Caused by heat stress or inconsistent watering; keep moisture even and shade during extreme heat$$,
 ARRAY['Radish','Nasturtium','Dill','Basil','Sunflower']),

('Zucchini', 'Cucurbita pepo',
 'Extremely productive summer squash. One or two plants feed a family. Fast-growing with large leaves — needs space but rewards are huge.',
 'novice', 55, 90, 14, 38, 24, 7, 7, 'Fertile, well-draining', 6.0, 7.5,
 'summer',
 ARRAY['Temperate','Subtropical','Mediterranean / Oceanic','Humid Continental','Tropical'],
 true, 12.0,
 $$Plant after all frost risk has passed: One cold night kills zucchini; wait until reliably warm|Choose a large, sunny spot: Each plant spreads 90-120cm; plan space accordingly|Sow 3 seeds per hole, 2.5cm deep: Plant in a slight mound for good drainage; thin to strongest plant|Water in well after planting: Soak the planting area thoroughly and mulch immediately|Plant 2-3 plants for good pollination: Zucchinis need male and female flowers open at the same time for fruit set$$,
 $$Water at the base, never the leaves: Wet foliage is the main cause of powdery mildew — water slowly at ground level|Check for fruit daily once plants flower: Zucchini grows incredibly fast; harvest at 15-20cm for best taste|Hand pollinate if fruit fails to set: Take a male flower (thin stem) and brush inside a female flower (has small fruit at base)|Remove any yellowing leaves: Improves airflow and keeps the plant productive longer|Feed monthly with balanced fertiliser: These are hungry plants — feed regularly for sustained production$$,
 $$Powdery mildew: White dusty coating on leaves — very common; improve air circulation and remove badly affected leaves|Squash vine borer: Wilting despite watering; larvae inside stem — cut out and destroy infected sections|Cucumber beetle: Chews leaves and flowers; use row covers on young plants|Poor fruit set: Too few pollinators or only one gender of flowers open; hand pollinate in morning$$,
 ARRAY['Nasturtium','Dill','Borage','Marigold','Corn']),

('Green Beans', 'Phaseolus vulgaris',
 'One of the easiest vegetables to grow. Bush varieties need no support; pole varieties maximise yield in small spaces. Great first crop for beginners.',
 'novice', 55, 15, 16, 32, 22, 5, 8, 'Fertile, well-draining', 6.0, 7.0,
 'summer',
 ARRAY['Temperate','Subtropical','Mediterranean / Oceanic','Humid Continental','Temperate Continental'],
 false, 0.5,
 $$Sow directly after last frost: Beans hate transplanting — sow straight into final position when soil is 16°C+|Sow 4cm deep, 15cm apart: Plant in double rows 30cm apart for easier picking|Set up poles before sowing pole varieties: Install 180cm stakes in a teepee or row before seeds germinate|Do not fertilise with nitrogen: Beans fix their own nitrogen — extra nitrogen grows leaves, not pods|Water in after sowing and keep moist until germination: Germination takes 5-10 days$$,
 $$Water consistently — 2-3cm per week: Irregular watering causes misshapen pods and poor yield|Mulch after germination: Conserves moisture and suppresses weeds which beans compete with poorly|Pick pods when firm and before seeds swell: Older pods are tough and stringy; harvesting frequently encourages more production|Do not hoe close to plants: Beans have shallow roots that are easily damaged by cultivation|Leave a few plants to dry for seed: Mature dry pods give you seed for next year$$,
 $$Aphids: Cluster on growing tips; pinch off heavily infested tips or spray with water|Bean beetle: Black larvae skeletonise leaves; hand-pick or use Bt spray|Halo blight: Water-soaked spots with yellow halo on leaves; use disease-free seed and avoid overhead watering|Root rot: Sudden wilting from soggy soil; ensure good drainage before planting$$,
 ARRAY['Carrot','Cucumber','Squash','Marigold','Borage']),

('Spinach', 'Spinacia oleracea',
 'Super-nutritious cool-season green. Fast to harvest, tolerates light frost, and grows well in containers and raised beds.',
 'novice', 40, 12, 4, 24, 15, 3, 5, 'Fertile, moist, well-draining', 6.5, 7.0,
 'spring',
 ARRAY['Temperate','Mediterranean / Oceanic','Humid Continental','Temperate Continental'],
 true, 0.2,
 $$Sow in cool conditions only: Spinach bolts (goes to seed) quickly above 24°C — sow in early spring or autumn|Sow 1.2cm deep in rows 30cm apart: Thin to 12cm spacing once seedlings have 2 true leaves|Keep seedbed moist during germination: Takes 7-14 days; cover with damp fabric to retain moisture|Prepare soil with plenty of compost: Spinach is a nitrogen-hungry crop that loves rich, moisture-retaining soil|Stagger sowings every 2-3 weeks: For continuous harvest through the cool season$$,
 $$Water every 2-3 days: Never let spinach dry out — drought causes premature bolting|Harvest outer leaves regularly: Pick outer leaves and the plant keeps producing for weeks|Provide shade in warming weather: A 30% shade cloth can extend the season by several weeks|Watch for bolting: As soon as the plant sends up a central stalk, harvest everything immediately before leaves become bitter|Mulch between rows: Keeps soil cool and moist — critical in spring as temperatures rise$$,
 $$Leaf miner: White squiggly trails inside leaves; remove affected leaves; use fine mesh to prevent the fly laying eggs|Aphids: Colonies under leaves; blast off with water or use insecticidal soap|Downy mildew: Yellow patches on top of leaf, white fuzz beneath; improve airflow, sow resistant varieties|Bolting: Plant goes to seed prematurely due to heat or long days; harvest immediately$$,
 ARRAY['Strawberry','Garlic','Pea','Radish','Onion']),

-- ─── INDIAN VEGETABLES ────────────────────────────────────────────────────────

('Bitter Gourd', 'Momordica charantia',
 'Popular in Indian, Chinese and Southeast Asian cooking. Thrives in hot, humid conditions. Requires a trellis. The distinctive bitter taste is valued for its health benefits.',
 'intermediate', 55, 120, 25, 40, 30, 3, 8, 'Loamy, well-draining', 6.0, 6.7,
 'summer',
 ARRAY['Tropical','Subtropical'],
 true, 3.0,
 $$Soak seeds overnight before sowing: Hard seed coat prevents germination; soaking speeds sprouting to 3-5 days|Sow 2 seeds per hole, 2cm deep: Plant at base of a 180cm trellis or fence; remove weaker seedling after germination|Wait for soil to be 25°C+: Bitter gourd demands warmth; cold soil causes failure|Space plants 120cm apart along trellis: Vines spread widely and need room to climb and get airflow|Train vines up support from day one: Guide tendrils weekly to establish climbing habit$$,
 $$Water every 2-3 days in hot weather: Bitter gourd is thirsty — soil should never fully dry out|Feed with balanced fertiliser every 3 weeks: Apply once vines reach 30cm; avoid high nitrogen after flowering begins|Hand-pollinate for better yields: Brush pollen from male flowers (thin stem) into female flowers (mini bitter gourd at base) each morning|Harvest young for mild flavour: Pick when 10-15cm long and skin is still firm-green; older fruit becomes very bitter|Pinch lateral shoots at 5 nodes to encourage branching and more female flowers$$,
 $$Fruit fly: Maggots inside fruit; use fruit fly traps and pick and destroy fallen fruit daily|Powdery mildew: White powder on leaves in humid conditions; improve airflow and remove affected leaves|Aphids: Colonies on new growth; spray with neem oil — effective and safe for food crops|Mosaic virus: Mottled, distorted leaves; remove infected plants immediately and control aphid carriers$$,
 ARRAY['Basil','Marigold','Onion','Garlic']),

('Okra', 'Abelmoschus esculentus',
 'Heat-loving vegetable popular across India, Africa and the southern US. Grows tall and produces continuously once established. Rich in fibre and vitamins.',
 'novice', 60, 30, 22, 40, 30, 5, 8, 'Loamy, well-draining', 6.0, 6.8,
 'summer',
 ARRAY['Tropical','Subtropical'],
 false, 2.0,
 $$Sow directly when soil is warm: Okra needs soil above 22°C to germinate; does not transplant well|Soak seeds in water for 12-24 hours before planting: Speeds germination significantly|Sow 2-3 seeds per hole, 2cm deep, 30cm apart: Thin to 1 plant per position after germination|Sow in full sun only: Okra produces poorly in any shade|Ridge soil up around base when 20cm tall: This supports the tall plant and encourages side roots$$,
 $$Water every 4-5 days: Deep watering encourages deep roots and drought resilience|Harvest pods every 2-3 days without fail: Pods become tough and fibrous very quickly — pick at 8-10cm for best texture|Feed monthly with balanced fertiliser: Okra benefits from steady nutrition during the long growing season|Wear gloves when harvesting: The plant has fine spines that irritate skin|Leave a few late-season pods to mature fully for next year seed saving$$,
 $$Aphids: Common on young plants; spray with neem oil or water|Root-knot nematode: Stunted growth with knotted roots; rotate crops and add marigolds to the bed|Fusarium wilt: Yellowing and wilting from the base; no cure — remove plant and do not replant okra in that spot for 2 years|Pod borer: Caterpillars inside pods; pick and destroy affected pods, use Bt spray$$,
 ARRAY['Pepper','Basil','Sunflower','Marigold']),

('Eggplant', 'Solanum melongena',
 'Known as brinjal across South Asia and Africa. Long season but generous producer. A staple of Indian, Mediterranean and Asian cooking.',
 'intermediate', 80, 60, 20, 38, 27, 4, 8, 'Rich, well-draining loam', 5.5, 6.8,
 'summer',
 ARRAY['Tropical','Subtropical','Mediterranean / Oceanic'],
 true, 3.5,
 $$Start seeds indoors 8-10 weeks before planting out: Eggplant has a long growing season and needs a head start|Germinate at 27-30°C: Use a heat mat under seed trays — eggplant is one of the most heat-demanding seeds to germinate|Transplant when 15cm tall and temps are consistently above 20°C: Cold snaps at this stage can kill young plants|Space 60cm apart in full sun: Good spacing dramatically reduces disease problems|Stake at planting: The plant grows 60-100cm tall and becomes heavy with fruit$$,
 $$Water deeply every 4-5 days: Consistent moisture prevents bitter fruit; avoid getting leaves wet|Feed every 3 weeks with balanced fertiliser: Heavy feeder that benefits from regular nutrition throughout the season|Pinch out growing tip when 30cm tall to encourage branching and more fruit|Harvest when skin is glossy and firm: Dull skin means overripe — the flesh turns bitter and seedy|Protect from flea beetles with fine mesh: Young plants are very attractive to flea beetles$$,
 $$Flea beetle: Small holes across leaves; cover young plants with fine insect mesh|Spider mite: Fine webbing under leaves in hot, dry weather; spray with water or neem oil|Verticillium wilt: Yellowing on one side of plant; rotate crops and avoid the same bed for 3 years|Phomopsis blight: Dark lesions on fruit; remove affected fruit and improve airflow$$,
 ARRAY['Tomato','Pepper','Marigold','Basil','Thyme']),

('Fenugreek', 'Trigonella foenum-graecum',
 'Multipurpose herb-vegetable popular in Indian cooking. Leaves (methi) harvested young as greens; seeds used as spice. Extremely fast-growing and easy.',
 'novice', 25, 10, 10, 30, 18, 4, 6, 'Well-draining, moderately fertile', 6.0, 7.0,
 'winter',
 ARRAY['Subtropical','Mediterranean / Oceanic','Semi-Arid','Temperate'],
 true, 0.1,
 $$Sow seeds directly — do not transplant: Fenugreek does not like root disturbance|Broadcast seeds thickly or sow in rows 15cm apart, 1cm deep: For leaf harvest, dense sowing gives better yield|Best sown in cool weather (10-25°C): In hot climates, grow in winter; in temperate climates, grow in spring|Water in immediately after sowing: Seeds germinate in 3-5 days with warmth and moisture|Can be grown in containers as deep as 15cm: Excellent window box or balcony crop$$,
 $$Water every 3-4 days, keeping soil moist but not waterlogged|Harvest leaves when plant is 15-20cm tall: Cut the top 10cm; plant regrows for 2-3 more cuts|After the 3rd cut, allow plant to flower and set seed: Pods appear in 3-4 months; harvest when dry|No fertiliser needed for leaf crop: Fenugreek is a legume that fixes its own nitrogen|Pinch growing tips regularly to encourage bushy, leafy growth rather than tall, stemmy plants$$,
 $$Powdery mildew: Common in humid conditions; improve spacing and airflow|Root rot: From overwatering in poor-draining soil; ensure containers have drainage holes|Aphids: Occasional; spray with water|Leaf spot: Fungal spots in wet weather; reduce overhead watering$$,
 ARRAY['Fennel','Coriander','Spinach']),

-- ─── CHINESE VEGETABLES ───────────────────────────────────────────────────────

('Bok Choy', 'Brassica rapa subsp. chinensis',
 'Fast-growing Chinese cabbage with thick white stems and dark green leaves. A cool-season staple across East Asian cuisines. Very easy to grow.',
 'novice', 50, 20, 5, 24, 16, 4, 5, 'Fertile, well-draining', 6.0, 7.0,
 'spring',
 ARRAY['Temperate','Mediterranean / Oceanic','Humid Continental','Subtropical'],
 true, 0.4,
 $$Sow in cool weather: Bok choy bolts in heat — sow in early spring or autumn for best results|Sow 1cm deep in rows 30cm apart: Thin to 20cm spacing once seedlings are 5cm tall|Germination is fast — 3-7 days in cool, moist soil|Can be transplanted or direct sown: Transplants establish quickly if hardened off properly|Grows well in containers of 20cm+ depth: Great for balcony and patio gardening$$,
 $$Water every 3-4 days consistently: Bok choy is shallow-rooted and dries out quickly|Feed with nitrogen-rich fertiliser at 3 weeks: Leafy greens need nitrogen for lush growth|Harvest whole plant or outer leaves: For baby bok choy, harvest whole at 15cm; for mature, cut outer leaves|Protect from cabbage white butterfly with fine mesh: The larvae (caterpillars) devastate brassicas|Shade in late spring as temperatures rise to prevent bolting$$,
 $$Cabbage white caterpillar: Green caterpillars eating leaves; use Bt spray or hand-pick; cover with fine mesh|Aphids: Colonies in leaf joints; spray with water or insecticidal soap|Club root: Distorted, stunted roots; ensure soil pH is 6.5+ and rotate crops|Downy mildew: Yellow patches on leaves in humid conditions; improve airflow$$,
 ARRAY['Garlic','Onion','Dill','Celery','Marigold']),

('Daikon Radish', 'Raphanus sativus var. longipinnatus',
 'Large white Japanese/Chinese radish used extensively in Asian cooking. Grows very fast, breaks up compacted soil, and can be harvested as both leaf and root.',
 'novice', 60, 15, 5, 25, 15, 5, 6, 'Deep, loose, well-draining', 5.8, 6.8,
 'fall',
 ARRAY['Temperate','Mediterranean / Oceanic','Humid Continental','Subtropical'],
 false, 1.5,
 $$Sow in late summer to autumn: Daikon needs cool weather for root development; heat causes bolting|Prepare deep, loose soil: Roots can reach 40-60cm long; soil must be stone-free and deeply loosened|Sow 2cm deep, 5cm apart in rows: Thin to 15cm spacing once seedlings appear|Direct sow only — roots do not transplant: Never start in trays; always sow where they will grow|Mark rows clearly: Seedlings look like common weeds in the early stage$$,
 $$Water every 5-7 days: Consistent moisture prevents cracking and pithy texture in roots|Thin ruthlessly: Overcrowded roots become stunted; thin decisively to 15cm spacing|Harvest before a hard frost: Pull when root is 20-40cm long and 5cm diameter|Leaves are edible: Young daikon leaves make excellent stir-fry greens — harvest a few as you thin|Do not over-fertilise with nitrogen: Causes leafy growth at the expense of root development$$,
 $$Flea beetle: Small holes in seedling leaves; cover with fine mesh immediately after sowing|Cabbage fly root maggot: Tunnels in root; use fine mesh barrier at soil level|Cracking: From irregular watering; maintain consistent soil moisture|Pithy/hollow roots: Left too long in ground or grown in heat; harvest promptly$$,
 ARRAY['Carrot','Cucumber','Spinach','Lettuce','Pea']),

('Snow Peas', 'Pisum sativum var. macrocarpon',
 'Sweet, flat-podded peas eaten whole. A cool-season climber popular in Asian stir-fries. One of the most rewarding crops for effort versus yield.',
 'novice', 65, 10, 5, 24, 13, 5, 6, 'Well-draining, moderately fertile', 6.0, 7.0,
 'spring',
 ARRAY['Temperate','Mediterranean / Oceanic','Humid Continental','Subtropical'],
 false, 0.5,
 $$Sow as early as ground can be worked: Snow peas tolerate light frost — do not wait for warm weather|Set up a 120-150cm trellis or net before sowing: Peas climb by tendrils and need something to grip immediately|Sow 2-3cm deep, 10cm apart: No thinning needed; rows 45cm apart|Inoculate seeds with rhizobium before sowing: This maximises nitrogen fixation and dramatically improves yields|Do not feed with nitrogen: Peas fix atmospheric nitrogen; extra nitrogen produces leaves, not pods$$,
 $$Water every 5-7 days: Consistent moisture from flowering to harvest is critical; drought causes poor pod set|Guide tendrils onto support weekly: This prevents the plants becoming a tangled mat on the ground|Harvest when pods are flat and peas just visible: Do not let pods swell — once seeds fill out, flavour decreases|Pick every 2-3 days: Picking regularly keeps plants producing for weeks; stopping encourages plant to die off|Mulch around base after germination: Keeps soil cool and moist$$,
 $$Powdery mildew: White coating on leaves (very common in late spring); choose resistant varieties; improve airflow|Pea moth: Larvae inside pods; use fine mesh or sow early to avoid peak moth flight|Aphids: Colonies on growing tips; pinch out affected tips or spray with water|Birds: Eat germinating seeds and young shoots; protect with netting until plants are 15cm tall$$,
 ARRAY['Carrot','Spinach','Lettuce','Mint','Radish']),

('Chinese Long Beans', 'Vigna unguiculata subsp. sesquipedalis',
 'Yardlong beans popular across South and East Asia. Grow on vigorous climbing vines in hot weather. Pods reach 30-60cm long and taste similar to green beans.',
 'novice', 70, 30, 20, 38, 27, 5, 8, 'Well-draining, sandy loam', 6.0, 7.0,
 'summer',
 ARRAY['Tropical','Subtropical'],
 false, 2.0,
 $$Sow only in warm soil (20°C+): Unlike green beans, long beans are heat lovers and will not germinate in cold|Set up 180cm trellis or pole support before sowing: Vines grow very tall and need substantial support|Sow 3-4cm deep, 30cm apart at base of trellis|Do not add nitrogen fertiliser: Long beans fix their own nitrogen; extra nitrogen produces leaves only|Water in thoroughly after sowing and keep moist until germination$$,
 $$Water every 5-7 days: Once established, long beans are reasonably drought-tolerant but produce better with consistent moisture|Train vines up support: Guide the main shoot upwards weekly; side shoots will follow|Harvest pods when 30-40cm long: Pick before they start to swell and become fibrous|Harvest every 2-3 days: Plants are incredibly productive when pods are picked regularly|Feed monthly with potassium-rich fertiliser: Supports continuous pod production$$,
 $$Aphids: Common on new growth; spray with water or neem oil|Bean fly: Maggots inside stems near soil; use yellow sticky traps and remove affected plants|Powdery mildew: In humid conditions; improve airflow|Spider mite: In hot, dry weather; spray leaves with water$$,
 ARRAY['Corn','Squash','Marigold','Basil']),

-- ─── MEDITERRANEAN VEGETABLES (Spain / Italy) ─────────────────────────────────

('Artichoke', 'Cynara cardunculus var. scolymus',
 'Dramatic Mediterranean perennial producing large edible flower buds. A showpiece plant that takes a full season to establish but then produces for years.',
 'intermediate', 90, 90, 10, 32, 20, 7, 8, 'Deep, well-draining, slightly alkaline', 6.0, 6.5,
 'spring',
 ARRAY['Mediterranean / Oceanic','Subtropical','Temperate'],
 false, 6.0,
 $$Start from offshoots or transplants for faster results: Growing from seed is slow and inconsistent|Prepare very large planting holes: Mix in generous compost and ensure very deep drainage|Space plants 90cm+ apart: Artichokes grow into large architectural plants 120-150cm tall and wide|Plant in full sun in a sheltered position: Wind protection is important for the large leaves|In cold climates, mulch crowns heavily in autumn to protect from frost$$,
 $$Water weekly with deep soaking: Artichokes are thirsty; shallow watering is ineffective with their deep roots|Feed monthly with balanced fertiliser through spring and summer: These are hungry, long-season plants|Cut the central bud first: This encourages more side buds to develop|Harvest buds before they open: Tight, compact buds have the best flavour; once the scales open, they become fibrous|Cut plants back to 30cm after harvest: New growth will come from the base for next season$$,
 $$Aphids: Common in leaf bracts; spray with water or insecticidal soap; natural predators usually control them|Artichoke plume moth: Larvae burrow into buds; remove affected buds and destroy|Botrytis grey mould: In cool, damp weather; improve airflow and remove dead material|Slugs: Feed on young leaves at night; use iron phosphate pellets$$,
 ARRAY['Sunflower','Tarragon','Pea','Nasturtium']),

('Fennel', 'Foeniculum vulgare var. azoricum',
 'Florence fennel produces sweet anise-flavoured bulbs popular in Italian cooking. A beautiful, feathery plant that also attracts beneficial insects to the garden.',
 'intermediate', 75, 30, 10, 30, 20, 5, 6, 'Well-draining, moderately fertile', 6.0, 7.0,
 'spring',
 ARRAY['Mediterranean / Oceanic','Temperate','Subtropical'],
 false, 0.4,
 $$Sow directly into final position: Fennel has a long taproot and dislodges badly|Sow 1cm deep in rows 45cm apart: Thin to 30cm spacing when 10cm tall|Avoid sowing near tomatoes, peppers or beans: Fennel produces chemicals that inhibit many vegetables|Best sown in late spring for autumn harvest: Summer heat can cause bolting|Soil should be well-drained but reasonably fertile$$,
 $$Earth up the bulb as it develops: When the swelling base reaches 5cm diameter, pile soil around it (blanching) to keep it white and sweet|Water every 5-7 days: Even moisture prevents bolting; stress causes premature flowering|Harvest when bulb is 8-10cm across: Do not leave in the ground too long or it becomes woody|Cut 2cm above soil after harvest: Some varieties resprout for a second, smaller harvest|Feed once at 4 weeks with balanced fertiliser: Fennel does not need heavy feeding$$,
 $$Aphids: Common on feathery foliage; tolerate small colonies as they attract ladybirds; spray heavy infestations with water|Bolting: Premature flowering ruins the bulb; avoid heat stress and irregular watering|Slugs: Attack young seedlings; protect with copper tape or iron phosphate pellets|Root rot: From waterlogged soil; ensure excellent drainage$$,
 ARRAY['Dill','Coriander','Nasturtium']),

('Padron Pepper', 'Capsicum annuum Padrón',
 'Famous Spanish tapas pepper grown in Galicia. Small green peppers mostly mild — but 1 in 10 is fiery. Fun, productive, and delicious blistered in a pan with sea salt.',
 'novice', 75, 40, 15, 35, 24, 4, 8, 'Well-draining, moderately fertile', 6.0, 6.8,
 'summer',
 ARRAY['Mediterranean / Oceanic','Temperate','Subtropical'],
 true, 2.0,
 $$Start seeds indoors 8 weeks before last frost: Like all peppers, Padróns need a long warm season|Germinate at 25-28°C with a heat mat: Pepper seeds germinate poorly below 20°C|Transplant when nights stay above 15°C and soil is warm: Cold conditions cause permanent stunting|Space 40cm apart in full sun: Good spacing improves yield and prevents disease|Plant at same soil depth as pot — unlike tomatoes, do not bury deeper$$,
 $$Water every 3-4 days: Consistent moisture is key; drought stress increases the heat level of the peppers|Feed every 3 weeks with potassium-rich fertiliser once flowering starts: Supports continuous fruit production|Harvest when peppers are 4-6cm long, still green: Do not wait for them to turn red|Cook fresh the same day for best flavour: Blister in very hot olive oil for 2-3 minutes, serve with flaky sea salt|Leave a few to ripen red for seed saving$$,
 $$Aphids: Common on new growth; spray with neem oil or insecticidal soap|Blossom drop: Flowers falling without fruit set — caused by temperature extremes or drought|Bacterial leaf spot: Dark spots on leaves; avoid overhead watering|Verticillium wilt: Sudden wilting; no treatment — remove plant and rotate crops$$,
 ARRAY['Basil','Marigold','Onion','Carrot','Tomato']),

('Romanesco Broccoli', 'Brassica oleracea var. botrytis',
 'Stunning Italian vegetable with fractal lime-green heads. A cross between broccoli and cauliflower with a nutty, sweet flavour. A conversation piece in any garden.',
 'intermediate', 90, 50, 7, 24, 16, 5, 6, 'Rich, well-draining', 6.0, 7.0,
 'fall',
 ARRAY['Mediterranean / Oceanic','Temperate','Humid Continental'],
 false, 0.8,
 $$Start seeds indoors 6-8 weeks before transplanting: Timing is critical — aim for heads to mature in cool autumn weather|Transplant when 15cm tall and after summer heat has broken: Heat during head formation ruins Romanesco completely|Space generously at 50cm: Each plant produces one large head and needs room to develop its full rosette of leaves|Firm soil well around transplant base: Brassicas need a stable root run|Apply balanced granular fertiliser at planting and again at 4 weeks$$,
 $$Water every 5-6 days: Consistent moisture prevents hollow stems and poor head formation|Feed with nitrogen-rich fertiliser at 3 weeks after transplanting: Leaf growth now powers head development later|Protect from cabbage white butterfly with fine mesh immediately: This is the single most important pest action|Check under leaves weekly for caterpillars and egg clusters: Yellow eggs on leaf undersides hatch into devastation|Harvest when head is fully formed but before individual florets begin to open: The fractal pattern deteriorates quickly once flowering starts$$,
 $$Cabbage white caterpillar: Devastating; mandatory to use fine insect mesh or check and pick daily|Club root: Distorted roots, stunted plant; raise soil pH to 7.0+; avoid replanting brassicas for 7 years|Downy mildew: Yellow patches on leaves in cool, damp conditions; improve airflow|Aphids: In colonies along stems; spray with water or insecticidal soap$$,
 ARRAY['Celery','Onion','Dill','Marigold','Nasturtium']),

-- ─── MEXICAN / LATIN AMERICAN VEGETABLES ──────────────────────────────────────

('Tomatillo', 'Physalis philadelphica',
 'The tart green fruit at the heart of Mexican salsa verde. Husked relatives of the tomato, easy to grow, and prolific in warm weather.',
 'novice', 75, 60, 13, 35, 24, 5, 8, 'Well-draining loam', 6.0, 7.0,
 'summer',
 ARRAY['Temperate','Subtropical','Mediterranean / Oceanic','Humid Continental'],
 true, 2.5,
 $$Start seeds indoors 6-8 weeks before last frost: Like tomatoes, tomatillos need a long warm season|Plant at least two together: Tomatillos are not self-pollinating — a single plant gives almost no fruit|Transplant after soil hits 18°C and nights stay above 10°C|Bury 2/3 of the stem at planting: Roots form along buried stem, creating a sturdier plant|Stake or cage at planting: Mature plants sprawl 120cm wide and snap easily$$,
 $$Water deeply once a week: Tomatillos are drought-tolerant once established and dislike soggy soil|Mulch heavily around base: Conserves moisture and suppresses weeds|Harvest when husk splits and fruit fills it tight: Green and firm is best for salsa verde|Pick fruit that drops to the ground: Naturally fallen tomatillos are dead-ripe and perfectly sweet-tart|Skip nitrogen feed once flowering starts: High nitrogen makes leaves at the cost of fruit$$,
 $$Three-lined potato beetle: Yellow-striped beetle on leaves; hand-pick or use neem oil|Cutworms: Sever seedlings at soil line; use a cardboard collar around new transplants|Aphids: Cluster on growing tips; spray with water|Hollow fruit: Caused by poor pollination — plant more tomatillos near each other$$,
 ARRAY['Basil','Marigold','Cilantro','Onion','Pepper']),

('Jalapeño Pepper', 'Capsicum annuum Jalapeño',
 'The most popular hot pepper in Mexican and Tex-Mex cooking. Compact plants produce dozens of medium-heat green peppers that turn red if left to ripen.',
 'novice', 75, 45, 16, 35, 24, 4, 8, 'Well-draining loam', 6.0, 6.8,
 'summer',
 ARRAY['Temperate','Subtropical','Mediterranean / Oceanic','Humid Continental'],
 true, 1.8,
 $$Start indoors 8 weeks before last frost: Use a heat mat at 27°C for reliable germination|Harden off for 7-10 days before transplanting: Sudden outdoor exposure stunts seedlings permanently|Transplant when soil hits 18°C: Cold soil is the single biggest cause of pepper failure|Plant at same depth as pot — do not bury deep like tomatoes|Mulch with black plastic or dark mulch to warm soil$$,
 $$Water every 3-4 days, deeply: Drought stress increases heat level — useful if you like spicy|Stake plants when 30cm tall: Branches snap under heavy fruit load|Switch to potassium-rich feed at flowering: Boosts fruit set and fruit size|Harvest green at 7-8cm or red after another 3 weeks for sweeter heat|Wear gloves when picking and never touch eyes after handling$$,
 $$Aphids: Spray with neem oil or insecticidal soap|Pepper weevil: Larvae inside fruit; pick and destroy any fallen fruit immediately|Blossom drop: Above 35°C or below 16°C; provide afternoon shade in heatwaves|Bacterial leaf spot: Avoid overhead watering; remove infected leaves$$,
 ARRAY['Basil','Cilantro','Tomato','Onion','Marigold']),

('Poblano Pepper', 'Capsicum annuum Poblano',
 'Mild Mexican pepper essential for chiles rellenos and mole. When dried it becomes the famous ancho chile. Big plants and big yields.',
 'intermediate', 90, 50, 18, 35, 26, 4, 8, 'Rich, well-draining', 6.2, 6.8,
 'summer',
 ARRAY['Subtropical','Mediterranean / Oceanic','Temperate'],
 true, 2.5,
 $$Start indoors 10 weeks before last frost: Poblanos need an even longer season than jalapeños|Use a heat mat at 27-30°C: Slow or patchy germination is almost always due to cold|Transplant only when soil is reliably 20°C+: Cold-stunted poblanos rarely recover|Space 50cm apart in full sun: Plants grow large and bushy, often 90cm tall|Add bone meal at planting for steady phosphorus through the long season$$,
 $$Water deeply twice a week: Steady moisture prevents bitter, thin-walled fruit|Stake or cage early: A loaded poblano plant tips over in any wind|Feed monthly with balanced fertiliser; switch to high-K once fruit sets|Harvest when peppers are 12-15cm long and dark green-purple: Skin should be glossy|Leave a few to ripen red on the plant for the deepest mole flavour$$,
 $$Aphids: Spray with neem oil|Tobacco hornworm: Big green caterpillar; hand-pick at dawn|Sun scald: Pale leathery patches on fruit in heatwaves; provide light shade cloth|Blossom end rot: Inconsistent watering plus calcium shortage — mulch and water evenly$$,
 ARRAY['Basil','Cilantro','Onion','Carrot','Marigold']),

('Chayote', 'Sechium edule',
 'Latin American climbing squash whose entire fruit is edible — including the soft seed inside. Wildly productive once it gets going; one vine feeds a family.',
 'intermediate', 150, 180, 15, 32, 24, 5, 7, 'Rich, deep, well-draining', 6.0, 7.0,
 'summer',
 ARRAY['Tropical','Subtropical','Mediterranean / Oceanic'],
 false, 25.0,
 $$Plant a whole sprouted fruit, not seeds: Lay a wrinkled chayote on its side, pointed end slightly up, half-buried in soil|Wait for warm soil (18°C+): Chayote rots in cold wet ground|Build a sturdy 2m+ trellis or arbor before planting: Vines grow 9-12m and become very heavy|Plant in a sheltered spot: Strong winds rip the wide leaves|Allow 180cm minimum between plants: One vine fills a huge space$$,
 $$Water deeply every 5-7 days: Chayote is thirsty once vines start running|Feed monthly with balanced fertiliser: Heavy feeder during fruit set|Train vines onto support weekly: Otherwise the vine becomes a tangled ground mat|Pinch growing tip when vine reaches the top of trellis to encourage fruiting side shoots|First fruit appears 3-5 months after planting; pick when 10-15cm and still tender$$,
 $$Powdery mildew: White coating on leaves; improve airflow|Root rot: From wet feet — ensure excellent drainage at the planting mound|Aphids: Common on tender shoots; spray with water|Slow start: Normal — chayote takes 2-3 months of vine growth before flowering$$,
 ARRAY['Corn','Beans','Marigold','Basil']),

('Cilantro', 'Coriandrum sativum',
 'Fresh herb essential to Mexican, Indian, Thai, Vietnamese and Middle Eastern cooking. Leaves are cilantro; seeds are coriander spice. Grows fast in cool weather.',
 'novice', 35, 15, 5, 27, 18, 3, 5, 'Well-draining, moderately fertile', 6.2, 6.8,
 'spring',
 ARRAY['Temperate','Mediterranean / Oceanic','Humid Continental','Subtropical','Semi-Arid'],
 true, 0.1,
 $$Sow direct — cilantro hates transplanting because of its long taproot|Sow 1cm deep in rows 20cm apart: Thin to 15cm spacing once seedlings have 2 true leaves|Best in cool weather (16-22°C): Bolts to seed quickly above 27°C|Crush seed husks gently before sowing: Each husk contains 2 seeds — cracking improves germination|Sow a fresh patch every 2-3 weeks: Continuous supply because each plant is short-lived$$,
 $$Water every 2-3 days: Shallow roots dry out fast|Harvest outer leaves first: Cut at the base of the stem; the centre keeps growing|Pinch flower stalks early to extend leaf harvest by 2-3 weeks|Let one row bolt and set seed: Mature seeds are coriander spice; harvest when brown and dry|Provide afternoon shade in late spring: Delays bolting in warming weather$$,
 $$Aphids: Cluster on flower heads; spray with water|Bolting: Inevitable in heat — succession sow rather than fight it|Powdery mildew: Improve airflow in dense plantings|Damping off: Seedlings collapse in wet cold soil; sow in well-drained beds$$,
 ARRAY['Tomato','Pepper','Spinach','Basil']),

-- ─── AFRICAN / AFRICAN-AMERICAN / CARIBBEAN VEGETABLES ────────────────────────

('Collard Greens', 'Brassica oleracea var. viridis',
 'Cornerstone of African-American Southern cooking. Cold-hardy leafy green that gets sweeter after a frost. Generous, long-harvest plant.',
 'novice', 75, 60, -5, 27, 18, 4, 6, 'Rich, moisture-retaining', 6.0, 7.5,
 'fall',
 ARRAY['Temperate','Humid Continental','Subtropical','Mediterranean / Oceanic'],
 true, 1.5,
 $$Sow 6-8 weeks before first autumn frost or in early spring: Cool weather grows the sweetest leaves|Sow 1cm deep, 60cm spacing: Mature plants get large; thin ruthlessly|Transplant or direct sow: Either works well; transplants give a head start|Water in deeply at planting: Strong establishment is everything|Mulch with 5cm of compost: Heavy feeder that benefits from rich soil$$,
 $$Harvest outer leaves continuously: Take from the bottom up, leaving the central rosette to keep producing|Frost makes them sweeter: Do not rush to pull plants in autumn — leave them through light freezes|Feed every 4 weeks with high-nitrogen fertiliser: Leafy growth needs steady nitrogen|Cover with fine mesh against cabbage white butterfly: The single most important pest action|Pick before leaves turn yellow: Old leaves get tough and bitter$$,
 $$Cabbage white caterpillar: Devastates collards quickly; mandatory mesh or daily picking|Aphids: Spray with insecticidal soap|Flea beetle: Tiny holes in young leaves; cover seedlings with mesh|Cabbage looper: Pale green caterpillars; use Bt spray$$,
 ARRAY['Onion','Garlic','Dill','Marigold','Beet']),

('Sweet Potato', 'Ipomoea batatas',
 'Staple across West Africa, the Caribbean and the American South. Heat-loving vine that grows from cuttings (slips). Stores for months after harvest.',
 'intermediate', 120, 30, 18, 38, 27, 5, 8, 'Sandy loam, well-draining', 5.5, 6.5,
 'summer',
 ARRAY['Tropical','Subtropical','Mediterranean / Oceanic','Temperate'],
 false, 1.5,
 $$Grow slips from a sweet potato: Suspend half a sweet potato in water; sprouts (slips) emerge in 4-6 weeks|Plant slips when soil hits 21°C: Cold soil rots them|Build raised ridges 25cm high: Loose, deep soil grows long, straight tubers|Plant slips 30cm apart along ridges: Push the rooted slip 10cm into the soil|Water in well and keep moist for first 2 weeks while roots establish$$,
 $$Water deeply once a week: Sweet potato is drought-tolerant once vines run|No high-nitrogen fertiliser: Causes leafy growth and tiny tubers|Lift vines occasionally: Stops them rooting at every node, which steals energy from the main tuber|Harvest before first frost: Lift gently with a fork — skins damage easily|Cure in a warm humid spot for 10 days: This sweetens flesh and toughens skin for storage$$,
 $$Sweet potato weevil: Worst pest; rotate crops 3 years and use certified clean slips|Wireworm: Tunnels in tubers; avoid planting after grass|Vine borers: Wilting vines; cut and destroy affected stems|Scurf: Cosmetic black patches on skin; harmless but rotate crops$$,
 ARRAY['Beans','Pea','Thyme','Oregano']),

('Black-eyed Peas', 'Vigna unguiculata',
 'Drought-tolerant legume central to African, Caribbean and African-American cooking — including Hoppin'' John on New Year''s Day. Fixes nitrogen, improving the soil.',
 'novice', 75, 20, 18, 35, 27, 5, 8, 'Sandy loam, well-draining', 5.5, 7.0,
 'summer',
 ARRAY['Tropical','Subtropical','Mediterranean / Oceanic','Temperate','Semi-Arid'],
 false, 0.6,
 $$Direct sow only — black-eyed peas hate transplanting|Wait until soil is 18°C+: Cold seed rots in the ground|Sow 3cm deep, 20cm apart, rows 60cm apart|No nitrogen fertiliser: As legumes they fix their own; extra nitrogen grows leaves not pods|Inoculate with cowpea rhizobium for best yields$$,
 $$Water sparingly — every 7-10 days: Drought-tolerant; over-watering causes leaf disease|Mulch lightly between rows: Conserves moisture in dry weather|Harvest fresh pods when seeds bulge: Eat fresh like green beans|For dry beans, leave pods on the plant until brown and rattling: Then pull whole plants and dry under cover|Pinch growing tips at flowering to encourage bushier, more productive plants$$,
 $$Cowpea aphid: Black colonies on growing tips; spray with water or pinch off tips|Bean leaf beetle: Small holes in leaves; tolerate light damage|Root rot: Wet soil; ensure drainage|Birds: Eat young seedlings; cover with netting until 10cm tall$$,
 ARRAY['Corn','Squash','Marigold','Basil']),

('Mustard Greens', 'Brassica juncea',
 'Pungent leafy green popular in African-American Southern, Indian (sarson), and Chinese cooking. Fast, cold-hardy, and vitamin-rich.',
 'novice', 45, 25, -2, 24, 16, 3, 5, 'Fertile, well-draining', 6.0, 7.5,
 'fall',
 ARRAY['Temperate','Humid Continental','Subtropical','Mediterranean / Oceanic'],
 true, 0.5,
 $$Sow direct in early spring or 6 weeks before first autumn frost: Cool weather gives the best flavour|Sow 1cm deep in rows 30cm apart: Thin to 25cm spacing|Germinates in 3-7 days in moist cool soil|Choose a sunny spot but provide afternoon shade in warm zones to slow bolting|Sow every 3 weeks for continuous harvest$$,
 $$Water every 2-3 days: Drought makes leaves bitter and stringy|Harvest outer leaves at 15-20cm: Cut at the base; centre keeps producing|Eat young for mild salad greens; mature for cooked dishes — flavour intensifies with size|Cover with fine mesh against flea beetle and cabbage white|Bolting in heat: Pull and resow when temperatures cool$$,
 $$Flea beetle: Pinprick holes in leaves; mesh from sowing|Cabbage white caterpillar: Hand-pick or use Bt spray|Aphids: Spray with insecticidal soap|Downy mildew: Yellow patches; improve airflow$$,
 ARRAY['Onion','Garlic','Spinach','Beet','Carrot']),

('Callaloo (Amaranth)', 'Amaranthus viridis',
 'Leafy green at the heart of Caribbean callaloo and West African cooking. Heat-loving, fast-growing, and almost impossible to kill once established.',
 'novice', 40, 20, 20, 38, 28, 4, 6, 'Most soil types, well-draining', 6.0, 7.5,
 'summer',
 ARRAY['Tropical','Subtropical','Mediterranean / Oceanic'],
 true, 0.4,
 $$Sow direct after all frost danger is past and soil is 20°C+: Amaranth is a tropical heat lover|Surface-sow tiny seeds: Press in but barely cover; light aids germination|Sow thickly in rows 20cm apart: Thin to 20cm by harvesting youngest plants as baby greens|Choose full sun: Amaranth tolerates poor soil but needs heat and light|Water in well at sowing; germinates in 5-10 days$$,
 $$Water every 3-5 days: Drought-tolerant once established|Harvest by cutting top 15cm: Plant resprouts 2-3 times for continuous harvest|Pinch flower spikes to extend leaf harvest|No fertiliser needed in average soil; light compost top-dress at week 4|Save mature seed heads in autumn for next year — amaranth seeds are also edible (a grain)$$,
 $$Flea beetle: Tiny holes in young leaves; cover with mesh|Aphids: Light infestation tolerated|Self-seeding: Will reseed prolifically — pull seedlings you do not want|Leaf miner: White trails inside leaves; remove affected leaves$$,
 ARRAY['Tomato','Okra','Pepper','Marigold','Basil']),

-- ─── ADDITIONAL SOUTH ASIAN VEGETABLES ────────────────────────────────────────

('Bottle Gourd', 'Lagenaria siceraria',
 'Lauki / dudhi — staple of Indian, Pakistani and Bangladeshi cooking. Vigorous climbing vine with mild fleshy fruit. Also dried and used as utensils across Africa and Asia.',
 'novice', 70, 120, 22, 38, 28, 3, 8, 'Rich, well-draining loam', 6.0, 7.0,
 'summer',
 ARRAY['Tropical','Subtropical'],
 false, 6.0,
 $$Soak seeds 12-24 hours before sowing: Hard seed coat slows germination|Sow when soil is 22°C+: Cold soil rots seeds|Build a sturdy 2m+ trellis or pergola: Vines grow 9m and fruit is heavy|Sow 2-3 seeds per hole, 2cm deep, 120cm apart at base of trellis|Mulch heavily after germination to conserve moisture$$,
 $$Water every 2-3 days in hot weather: Lauki is very thirsty during fruit set|Train vines up support from day one|Hand-pollinate for better yields: Brush pollen from male (long stem) to female (small fruit at base) flowers in early morning|Harvest young at 30-40cm: Older fruit becomes fibrous and bitter|Feed monthly with balanced fertiliser$$,
 $$Fruit fly: Maggots inside fruit; use traps and pick fallen fruit immediately|Powdery mildew: White coating on leaves in humid weather; improve airflow|Aphids: Cluster on growing tips; spray with neem oil|Mosaic virus: Mottled distorted leaves; remove infected plants$$,
 ARRAY['Basil','Marigold','Onion','Garlic']),

('Ridge Gourd', 'Luffa acutangula',
 'Turai / tori — ridged green gourd used in Indian and Southeast Asian cooking. Young fruits are eaten; mature fruits dry into natural loofah sponges.',
 'novice', 65, 90, 22, 38, 28, 3, 8, 'Rich, well-draining', 6.0, 7.0,
 'summer',
 ARRAY['Tropical','Subtropical'],
 false, 4.0,
 $$Soak seeds 24 hours before sowing: Significantly speeds germination|Wait for soil at 22°C+: Cold-sensitive plant|Build a 2m trellis before sowing: Vines climb aggressively and fruit hangs straight only when off the ground|Sow 2cm deep, 90cm apart at base of support|Plant in full sun in a sheltered position$$,
 $$Water deeply every 3 days: Steady moisture prevents bitter fruit|Train vines upward weekly: Tendrils grab anything nearby|Hand-pollinate at sunrise for reliable fruit set in low-bee areas|Harvest young at 15-20cm — about 1 week after pollination — for tender flesh|Leave a few fruits on the vine until brown and dry to harvest natural loofah sponges$$,
 $$Fruit fly: Use traps and remove fallen fruit|Powdery mildew: Improve airflow|Aphids: Spray with water|Cucumber beetle: Cover young plants with mesh$$,
 ARRAY['Tomato','Bitter Gourd','Marigold','Onion']),

('Moringa', 'Moringa oleifera',
 'The drumstick tree — leaves, pods and flowers are all edible. Among the most nutrient-dense plants on earth. Fast-growing tropical staple of Indian and African kitchens.',
 'novice', 240, 200, 18, 40, 28, 5, 8, 'Sandy, well-draining', 6.3, 7.0,
 'summer',
 ARRAY['Tropical','Subtropical'],
 false, 5.0,
 $$Plant seeds direct in warm soil 20°C+: Moringa hates root disturbance from transplanting|Sow 2cm deep in a hole filled with compost-rich soil|Space 200cm apart: Trees grow tall and wide quickly|Choose a sunny, sheltered spot: Wind snaps young trunks|Water in deeply at planting and weekly until established$$,
 $$Pinch the growing tip when tree reaches 1m to keep it bushy and within picking reach: Otherwise it grows 10m tall in a single year|Water weekly in dry season: Drought-tolerant but produces more leaves with regular water|Harvest leaves continuously: Cut whole branches and strip leaves; tree resprouts from each cut|Pods (drumsticks) appear at 8-12 months: Pick when 30-45cm long and still flexible|No fertiliser needed in average soil$$,
 $$Caterpillars: Hand-pick or use Bt spray on leaves|Termites: Damage trunks of young trees; check base monthly|Root rot: From waterlogging; never plant in heavy clay|Twig borer: Drill holes in branches; prune affected sections$$,
 ARRAY['Basil','Marigold','Tomato','Pepper']),

('Cluster Beans (Guar)', 'Cyamopsis tetragonoloba',
 'Guar / gawar phali — cluster beans popular in Rajasthan, Gujarat and across South Asia. Drought-tolerant legume thriving in heat where other beans fail.',
 'novice', 80, 30, 22, 42, 30, 7, 8, 'Sandy, well-draining', 6.5, 7.5,
 'summer',
 ARRAY['Tropical','Subtropical','Semi-Arid'],
 false, 0.4,
 $$Direct sow only — does not transplant well|Wait for soil at 22°C+: One of the most heat-loving legumes|Sow 3cm deep, 30cm apart in rows 60cm apart|No nitrogen feed: Legume that fixes its own nitrogen|Choose the hottest, driest spot in the garden — guar thrives where tomatoes wilt$$,
 $$Water deeply only every 7-10 days: Over-watering reduces yield significantly|Mulch lightly to conserve soil moisture|Harvest pods young at 6-8cm — they cluster on short stems, hence the name|Pick every 3-4 days: Continuous harvest extends the producing season|Allow some pods to dry on the plant for next year''s seed$$,
 $$Aphids: Light infestation tolerated; spray heavy ones with water|Pod borer: Caterpillar inside pods; pick affected pods|Powdery mildew: Rare in hot dry conditions|Root rot: Only from over-watering — let soil dry between watering$$,
 ARRAY['Corn','Squash','Marigold','Pepper']),

-- ─── ADDITIONAL EAST / SOUTHEAST ASIAN VEGETABLES ─────────────────────────────

('Napa Cabbage', 'Brassica rapa subsp. pekinensis',
 'Mild Chinese cabbage essential for kimchi, stir-fries and dumplings across Korean, Chinese and Japanese cuisines. Cool-season crop with crisp tender leaves.',
 'intermediate', 70, 40, 5, 24, 16, 4, 6, 'Rich, moisture-retaining', 6.0, 7.0,
 'fall',
 ARRAY['Temperate','Humid Continental','Mediterranean / Oceanic','Subtropical'],
 true, 1.5,
 $$Sow 8-10 weeks before first autumn frost: Heads must form in cool weather to avoid bolting|Start indoors and transplant, or direct sow with thinning|Space 40cm apart: Each plant forms a large dense head|Water in well at transplant and shade for 2 days while plants settle|Add compost generously at planting: Heavy feeder for tight head formation$$,
 $$Water every 3-4 days, never letting soil dry: Drought stress causes loose, bitter heads|Feed at week 3 with nitrogen-rich fertiliser: Drives leaf and head growth|Cover with fine mesh from day one against cabbage white|Tie outer leaves loosely around the head 2 weeks before harvest to blanch the inner leaves white|Harvest when heads feel firm and full — usually 60-70 days after sowing$$,
 $$Cabbage white caterpillar: Devastating; mandatory mesh|Flea beetle: Tiny holes; cover seedlings|Slugs: Feed on outer leaves at night; copper tape or iron phosphate|Bolting: From heat or stress — pull and resow if it happens$$,
 ARRAY['Onion','Garlic','Dill','Celery','Marigold']),

('Lemongrass', 'Cymbopogon citratus',
 'Aromatic Southeast Asian herb essential to Thai, Vietnamese, Filipino and Indonesian cooking. Forms grass-like clumps that multiply year after year.',
 'novice', 100, 60, 10, 38, 27, 4, 6, 'Sandy loam, well-draining', 5.5, 7.0,
 'summer',
 ARRAY['Tropical','Subtropical','Mediterranean / Oceanic'],
 true, 1.0,
 $$Easiest from store-bought stalks: Place fresh stalks in water; roots appear in 2-3 weeks|Plant rooted stalks 60cm apart in full sun: Clumps spread 60cm wide|Wait for soil at 18°C+: Cold-sensitive, treat as annual where winters are below -1°C|Mulch around base 5cm deep to conserve moisture and warmth|In containers (30cm+), bring indoors before frost in cold climates$$,
 $$Water every 4-5 days: Likes consistent moisture during peak summer|Harvest by cutting whole stalks at the base when 1.5cm thick|Trim browned leaf tips for a tidier plant — does not affect health|Divide clumps every 2 years in spring to keep them productive|Feed monthly with liquid fertiliser through summer$$,
 $$Rust: Orange spots on leaves in damp conditions; improve airflow|Aphids: Rare; spray with water|Mealybug on container plants: Wipe with diluted alcohol|Frost damage: Leaves blacken below 0°C; cut back and protect roots with thick mulch$$,
 ARRAY['Basil','Mint','Coriander','Pepper']),

('Thai Basil', 'Ocimum basilicum var. thyrsiflora',
 'Anise-flavoured basil essential to Thai, Vietnamese and Lao cooking. Sturdier and more heat-tolerant than sweet basil. Beautiful purple stems and flower spikes.',
 'novice', 60, 30, 16, 38, 27, 3, 6, 'Well-draining, moderately fertile', 6.0, 7.0,
 'summer',
 ARRAY['Tropical','Subtropical','Mediterranean / Oceanic','Temperate'],
 true, 0.4,
 $$Start seeds indoors 6 weeks before last frost or sow direct after frost: Thai basil germinates in 5-10 days at 21°C|Surface-sow seeds and lightly cover with 3mm soil: Light aids germination|Transplant 30cm apart in full sun|Pinch the tip at 15cm tall to encourage bushy branching|Container-friendly: Grows beautifully in a 25cm pot$$,
 $$Water every 2-3 days: Wilts quickly in dry soil but recovers with watering|Pinch flower spikes regularly: Otherwise plant focuses on seed and leaves lose flavour|Harvest by cutting whole stems above a leaf pair: Stimulates two new branches at every cut|Feed monthly with liquid fertiliser for steady leaf production|Take cuttings before autumn cold to grow indoors over winter$$,
 $$Aphids: Spray with water|Whitefly: Yellow sticky traps and neem oil|Fusarium wilt: Sudden wilting of one branch; remove plant|Slugs: Eat seedlings overnight; protect with copper tape$$,
 ARRAY['Tomato','Pepper','Eggplant','Marigold']),

('Garlic Chives', 'Allium tuberosum',
 'Flat-leaved chives with a mild garlic flavour, essential to Chinese dumplings (jiaozi) and Korean cuisine. Tough perennial that returns year after year.',
 'novice', 80, 15, -10, 32, 20, 5, 5, 'Well-draining, moderately fertile', 6.0, 7.0,
 'spring',
 ARRAY['Temperate','Humid Continental','Mediterranean / Oceanic','Subtropical'],
 true, 0.3,
 $$Easiest from divisions of an existing clump or transplants: Seeds are slow and unreliable|Plant clumps 15cm apart in full sun to part shade|Water in well at planting; rest of season is undemanding|Tolerates poor soil and a wide pH range|Container-friendly: Grows well in a 20cm pot for years$$,
 $$Water every 5-7 days, less in cool weather|Harvest by cutting leaves 3cm above the soil: Plant regrows in 2-3 weeks|Cut flower stalks if you want stronger leaves: Or leave the white flower clusters — edible and beautiful|Divide clumps every 3 years in spring to keep them vigorous|No fertiliser needed in average soil$$,
 $$Onion fly: Rare in chives; rotate crops|Rust: Orange spots in damp summers; cut back and dispose|Slugs: Light damage tolerated|Self-seeding: Cut flowers before seed disperses if you do not want spread$$,
 ARRAY['Carrot','Tomato','Lettuce','Rose']),

-- ─── ADDITIONAL ITALIAN / MEDITERRANEAN VEGETABLES ────────────────────────────

('Sweet Basil', 'Ocimum basilicum',
 'The classic Italian basil — Genovese type — essential for pesto, Caprese salad and tomato sauce. Tender annual that thrives alongside tomatoes.',
 'novice', 60, 30, 16, 35, 24, 3, 6, 'Rich, well-draining', 6.0, 7.5,
 'summer',
 ARRAY['Temperate','Subtropical','Mediterranean / Oceanic','Humid Continental'],
 true, 0.5,
 $$Start seeds indoors 6 weeks before last frost: Basil hates cold and grows slowly until warm|Surface-sow and lightly cover; needs light and 21°C+ to germinate|Transplant when nights are reliably above 13°C: Cold-shocked basil never quite recovers|Plant 30cm apart in full sun, ideally next to tomatoes|Pinch tip at 15cm to force bushy growth$$,
 $$Water every 2-3 days at soil level: Wet leaves invite disease|Pinch flower spikes the moment they appear: Once basil flowers, leaves turn bitter and growth stops|Harvest by cutting whole stems above a leaf node: Stimulates 2 new branches|Feed monthly with liquid fertiliser: Steady nutrition keeps leaves large and tender|Strip leaves and freeze in olive oil at season''s end for winter pesto$$,
 $$Aphids: Spray with water|Downy mildew: Yellow patches above, grey fuzz below; sow resistant varieties (e.g. Prospera)|Slugs: Strip seedlings overnight; copper tape or iron phosphate|Fusarium wilt: Sudden one-sided wilt; remove plant and rotate$$,
 ARRAY['Tomato','Pepper','Oregano','Marigold']),

('Radicchio', 'Cichorium intybus var. foliosum',
 'Italian leafy chicory with crisp red-and-white heads and a distinctive bitter edge that mellows when grilled. Cool-season crop popular across northern Italy.',
 'intermediate', 80, 30, -2, 22, 15, 5, 6, 'Well-draining, moderately fertile', 6.0, 7.0,
 'fall',
 ARRAY['Temperate','Humid Continental','Mediterranean / Oceanic'],
 true, 0.4,
 $$Sow in mid-summer for autumn harvest: Heads form best as days shorten and cool|Sow 1cm deep, thin to 30cm spacing|Direct sow or transplant: Both work; transplants give a head start|Water consistently at germination and through seedling stage|Choose a spot with morning sun and afternoon shade in warm climates$$,
 $$Water every 3-4 days: Drought makes leaves intensely bitter|Heads form when temperatures drop below 18°C: Be patient — early summer plants stay loose|Cut whole heads at the base when firm and tightly packed|Some varieties resprout from the cut stump for a second smaller harvest|Light frost improves flavour: Do not rush to harvest in autumn$$,
 $$Slugs: Hide in leaf folds; iron phosphate pellets|Aphids: Spray with water|Leaf miner: White trails; remove affected leaves|Bolting: Caused by heat — pull and resow when cool$$,
 ARRAY['Carrot','Onion','Garlic','Fennel']),

('Broccoli Rabe (Cime di Rapa)', 'Brassica rapa var. ruvo',
 'Sharply bitter Italian green essential to Pugliese cooking with orecchiette pasta. Quick to grow, productive, and underrated outside Italy.',
 'novice', 50, 20, 5, 24, 16, 4, 6, 'Fertile, well-draining', 6.0, 7.5,
 'fall',
 ARRAY['Temperate','Mediterranean / Oceanic','Humid Continental','Subtropical'],
 true, 0.3,
 $$Direct sow in early spring or 8 weeks before first autumn frost|Sow 1cm deep in rows 30cm apart, thin to 20cm|Cool weather only — bolts immediately in heat|Germinates in 5-10 days in moist cool soil|Sow every 2-3 weeks for continuous harvest$$,
 $$Water every 3-4 days: Steady moisture keeps leaves tender|Harvest the central flower bud when 10-15cm tall, before flowers open|Side shoots produce a second crop after the central head is cut|Pick flower buds, leaves and tender stems together — all are eaten|Feed once at week 3 with balanced fertiliser$$,
 $$Flea beetle: Cover seedlings with mesh|Cabbage white caterpillar: Mesh from day one|Aphids: Spray with insecticidal soap|Bolting: Heat is the enemy — sow only in cool weather$$,
 ARRAY['Onion','Garlic','Carrot','Celery']),

('Italian Parsley', 'Petroselinum crispum var. neapolitanum',
 'Flat-leaf parsley — preferred across Italian, Middle Eastern and Mexican cooking for its strong flavour. Hardy biennial often grown as annual; rich in vitamins.',
 'novice', 75, 25, -10, 30, 20, 5, 5, 'Moist, well-draining', 6.0, 7.0,
 'spring',
 ARRAY['Temperate','Mediterranean / Oceanic','Humid Continental','Subtropical'],
 true, 0.3,
 $$Soak seeds 24 hours before sowing: Seeds have notoriously slow germination — 2-4 weeks even with prep|Sow 1cm deep in rows 30cm apart; thin to 25cm|Cool soil sowing is fine — frost-tolerant|Mark rows clearly: Slow emergence makes them easy to lose|Container-friendly: Grows well in a 20cm-deep pot$$,
 $$Water every 2-3 days: Shallow roots dry out fast|Harvest outer stems at the base: Cut from the outside in to keep the centre producing|Pinch flower stalks in second year if you want continued leaf production|Feed every 4 weeks with balanced liquid fertiliser|Mulch with compost to keep roots cool through summer$$,
 $$Carrot fly: Same pest as carrots; cover with fine mesh|Aphids: Spray with water|Slugs: Hide in dense foliage; iron phosphate|Septoria leaf spot: Brown spots in wet weather; remove affected leaves$$,
 ARRAY['Tomato','Carrot','Onion','Asparagus']),

-- ─── MIDDLE EASTERN / MEDITERRANEAN HERBS & STAPLES ───────────────────────────

('Mint', 'Mentha spicata',
 'Essential herb across Middle Eastern, North African, Indian, Vietnamese and Mediterranean cooking. Indestructible perennial — best contained or it will take over.',
 'novice', 60, 30, -15, 32, 20, 4, 4, 'Moist, fertile', 6.0, 7.0,
 'spring',
 ARRAY['Temperate','Humid Continental','Mediterranean / Oceanic','Subtropical','Tropical'],
 true, 0.5,
 $$Always plant in a container or sunken pot with bottom — mint spreads aggressively by underground runners|Easiest from cuttings or transplants; seeds are slow and variable|Plant 30cm apart in part shade|Water in deeply at planting; mint loves moist soil|A 30cm container holds one plant for 2-3 years before needing division$$,
 $$Water every 2-3 days: Mint wilts fast in dry soil but bounces back|Harvest by cutting stems above a leaf pair: Plant regrows quickly|Pinch flower spikes to keep flavour strong|Cut back hard mid-season: Fresh growth has the best flavour|Divide clumps every 2-3 years in spring to keep them vigorous$$,
 $$Rust: Orange spots in humid summers; cut back hard and improve airflow|Mint moth: Caterpillars roll leaves; pick off affected leaves|Aphids: Light infestation tolerated|Invasive runners: Contain in pots — once free in the garden, mint is impossible to remove$$,
 ARRAY['Tomato','Cabbage','Pea','Carrot']),

('Garlic', 'Allium sativum',
 'Cornerstone of cuisines on every continent. Plant cloves in autumn, harvest in summer. One of the easiest and most rewarding crops in any kitchen garden.',
 'novice', 240, 15, -20, 30, 18, 7, 6, 'Fertile, well-draining', 6.0, 7.0,
 'fall',
 ARRAY['Temperate','Mediterranean / Oceanic','Humid Continental','Subtropical'],
 false, 0.1,
 $$Plant cloves in autumn 6-8 weeks before ground freezes: Cold period is needed to trigger bulb formation|Use largest cloves only: Bigger cloves grow bigger bulbs|Plant pointed end up, 5cm deep, 15cm apart|Mulch with 8cm of straw after planting: Insulates through winter|Choose a sunny, well-drained spot$$,
 $$Water weekly through spring: Stop watering 2 weeks before harvest|Cut flower stalks (scapes) on hardneck varieties when they curl: Stops energy diversion and gives a free harvest of edible scapes|Harvest when bottom 3-4 leaves yellow: Lift gently with a fork|Cure in a dry shaded spot for 3 weeks: Roots and tops dry; flavour matures|Save largest bulbs for next year''s seed stock$$,
 $$White rot: Soil-borne fungus rotting bulbs; rotate crops 5 years|Onion fly: Maggots in bulbs; cover with mesh|Rust: Orange spots on leaves; remove affected leaves|Soft bulbs at harvest: From inconsistent watering or wrong time$$,
 ARRAY['Tomato','Pepper','Carrot','Lettuce','Strawberry']),

('Onion', 'Allium cepa',
 'Universal kitchen staple grown on every continent. Easy to grow from sets (small bulbs), trickier from seed. Stores for months in a cool, dry place.',
 'novice', 100, 10, -5, 30, 18, 5, 6, 'Fertile, well-draining', 6.0, 7.0,
 'spring',
 ARRAY['Temperate','Mediterranean / Oceanic','Humid Continental','Subtropical'],
 false, 0.2,
 $$Plant sets (small bulbs) in early spring: Push pointy end up, just covered with soil|Space 10cm apart in rows 30cm apart|Choose a sunny, well-drained spot — onions hate wet feet|Match variety to your day length: Long-day onions for the north, short-day for the south|Add compost at planting: Onions are heavy feeders$$,
 $$Water every 5-7 days: Stop watering 2 weeks before harvest to firm up bulbs|Hand-weed gently: Onions hate competition and have shallow roots|Feed with balanced fertiliser at week 3 and week 6|Bend over tops when bulbs swell and start lifting from soil: Speeds maturity and curing|Harvest when tops yellow and fall over; cure in a shaded dry spot for 2 weeks$$,
 $$Onion fly: Maggots in bulbs; cover with fine mesh from planting|Downy mildew: Pale stripes on leaves; improve airflow|Thrips: Silvery streaks on leaves; spray with water or insecticidal soap|White rot: Soil-borne; rotate crops$$,
 ARRAY['Tomato','Carrot','Lettuce','Beet','Strawberry']),

('Potato', 'Solanum tuberosum',
 'Staple crop across Northern Europe, the Andes, Eastern Europe and beyond. Easy, productive, and stores for months. One of the most reliable crops for beginners.',
 'novice', 90, 30, 5, 27, 18, 5, 6, 'Loose, well-draining, slightly acidic', 5.5, 6.5,
 'spring',
 ARRAY['Temperate','Humid Continental','Mediterranean / Oceanic','Subtropical'],
 false, 1.5,
 $$Plant seed potatoes (certified, not supermarket) in early spring 2 weeks before last frost|Chit (pre-sprout) seed potatoes for 2 weeks before planting in a cool, light spot|Cut large seed potatoes into pieces with 2 eyes each; let cuts dry overnight|Plant 15cm deep, 30cm apart in rows 75cm apart|Choose a sunny spot with loose, slightly acidic soil$$,
 $$Earth up around stems when 20cm tall: Cover with 10cm of soil; repeat every 2 weeks until flowering — protects tubers from light|Water every 5-7 days, especially during flowering: Drought now means small tubers|No fertiliser needed if soil has compost; never use fresh manure (causes scab)|Harvest new potatoes when plants flower; main crop when tops die back|Cure main-crop potatoes 2 weeks in dark, cool, dry spot before storing$$,
 $$Colorado potato beetle: Yellow-striped beetle and orange larvae; hand-pick or use Bt|Late blight: Dark patches spreading fast in wet weather; remove infected plants immediately|Wireworm: Tunnels in tubers; avoid planting after grass|Scab: Rough patches on skin; keep pH below 6.0 and soil moist during tuber formation$$,
 ARRAY['Beans','Corn','Cabbage','Marigold']),

('Sweet Corn', 'Zea mays var. saccharata',
 'Native American staple now grown worldwide. Sweet kernels eaten fresh; the foundation of countless cuisines. Grow in blocks, not rows, for proper pollination.',
 'novice', 80, 30, 16, 35, 24, 5, 8, 'Rich, well-draining', 6.0, 6.8,
 'summer',
 ARRAY['Temperate','Subtropical','Humid Continental','Mediterranean / Oceanic'],
 false, 0.5,
 $$Sow direct after last frost when soil is 16°C+: Corn hates transplanting|Sow in a block, not a long row: At least 4 rows wide for wind pollination|Plant 3cm deep, 30cm apart, rows 75cm apart|Add compost generously at planting: Corn is a very heavy feeder|Choose a sunny, sheltered spot — wind helps pollination but topples plants$$,
 $$Water deeply once a week: Especially critical at tasseling and silking|Earth up the base when stems are 30cm tall: Stabilises tall plants|Feed with high-nitrogen fertiliser at knee-high stage and again at tasseling|Harvest when silks turn brown and a kernel pierced with a thumbnail oozes milky liquid|Eat or freeze within hours: Sugars convert to starch quickly after picking$$,
 $$Corn earworm: Caterpillars at ear tips; drop a few drops of mineral oil on silks|Raccoons: Strip ears overnight; electric fence is the only reliable defence|Smut: Grey-black galls on cobs; remove and dispose|Poor pollination: Missing kernels — caused by row planting; always grow in blocks$$,
 ARRAY['Beans','Squash','Cucumber','Pumpkin']),

('Pumpkin', 'Cucurbita pepo',
 'Native American giant — Halloween icon and pie staple. Sprawling vine that needs space but rewards with show-stopping fruit. Stores for months.',
 'novice', 110, 180, 15, 35, 24, 7, 8, 'Rich, well-draining', 6.0, 7.0,
 'summer',
 ARRAY['Temperate','Subtropical','Mediterranean / Oceanic','Humid Continental'],
 false, 8.0,
 $$Sow direct after last frost when soil is 18°C+: Or start indoors 3 weeks before transplanting|Build a compost-rich mound: Pumpkins are heavy feeders|Plant 2 seeds 3cm deep per mound; thin to strongest|Space 180cm apart: Each vine sprawls 3-5m|Plan space carefully — pumpkins overrun anything in their path$$,
 $$Water deeply once a week at the base: Wet leaves cause mildew|Feed every 3 weeks with balanced fertiliser; switch to high-K when fruit sets|Limit to 2-3 fruits per vine for show-sized pumpkins; pinch off extras|Place ripening pumpkins on cardboard or straw: Keeps skin clean and dry|Harvest when stem hardens and skin resists a thumbnail; cure 2 weeks in the sun for storage$$,
 $$Powdery mildew: White coating; improve airflow, water early in the day|Squash vine borer: Wilting despite watering; cut into stem and remove larva|Cucumber beetle: Cover young plants with mesh|Blossom end rot: Calcium issue from inconsistent watering$$,
 ARRAY['Corn','Beans','Nasturtium','Marigold']),

('Beetroot', 'Beta vulgaris',
 'Sweet root vegetable popular across Eastern European, Mediterranean and Middle Eastern cooking. Both roots and leaves are edible. Cold-tolerant and easy.',
 'novice', 60, 10, -5, 27, 18, 5, 6, 'Loose, well-draining', 6.0, 7.0,
 'spring',
 ARRAY['Temperate','Mediterranean / Oceanic','Humid Continental','Subtropical'],
 true, 0.2,
 $$Soak seeds 4 hours before sowing: Each seed cluster contains 2-4 seedlings|Sow 1.5cm deep in rows 30cm apart; thin to 10cm spacing|Direct sow only — does not transplant well|Tolerates light frost; sow as soon as soil can be worked|Loose, stone-free soil grows the smoothest roots$$,
 $$Water every 4-5 days: Inconsistent watering causes splitting and woody roots|Thin ruthlessly at 5cm tall: Eat thinnings as baby greens|Harvest leaves continuously: Take outer leaves and root keeps growing|Pull roots when 5-7cm diameter — younger is sweeter|Twist tops off (do not cut) before storing to prevent bleeding$$,
 $$Leaf miner: White trails inside leaves; remove affected leaves|Boron deficiency: Internal black spots; add a pinch of borax to soil|Slugs: Hide in leaves; iron phosphate pellets|Cracked roots: Caused by drought followed by heavy rain — water consistently$$,
 ARRAY['Onion','Lettuce','Cabbage','Garlic']),

('Malabar Spinach', 'Basella alba',
 'Filipino alugbati / Indian poi — heat-loving climbing leaf crop that thrives where regular spinach bolts. Glossy leaves with a mild flavour, excellent in stir-fries.',
 'novice', 70, 30, 22, 38, 28, 3, 6, 'Rich, moisture-retaining', 6.0, 7.0,
 'summer',
 ARRAY['Tropical','Subtropical','Mediterranean / Oceanic'],
 true, 1.0,
 $$Soak seeds 24 hours before sowing: Hard seed coat slows germination|Sow direct after soil hits 22°C: Loves heat, hates cold|Build a 2m trellis at planting: Vines climb aggressively|Sow 1cm deep, 30cm apart at base of support|Choose full sun with rich, moisture-retaining soil$$,
 $$Water every 2-3 days in hot weather: Loves moisture as much as it loves heat|Harvest by pinching leaves and tender stem tips: Plant branches more after each picking|Pinch flower spikes to extend leaf harvest|Save seeds from purple berries at season''s end for next year|Feed monthly with balanced fertiliser for steady leafy growth$$,
 $$Powdery mildew: Rare in well-aired plantings|Aphids: Spray with water|Self-seeding: Berries drop and germinate next year — pull volunteer seedlings if not wanted|Cold damage: Leaves blacken below 10°C; treat as annual outside the tropics$$,
 ARRAY['Okra','Tomato','Pepper','Marigold'])

ON CONFLICT (name) DO NOTHING;

-- ─── FUN FACTS & GROWING STORIES ─────────────────────────────────────────────

UPDATE vegetables SET
  fun_fact = 'Tomatoes are legally fruits — but a U.S. Supreme Court ruling in 1893 declared them vegetables for trade tariff purposes. The debate has never truly ended.',
  growing_story = 'Meena in Hyderabad grew tomatoes in old clay pots on her rooftop, watering them every evening after work. By summer she had more than the whole family could eat. She swore the secret was the wood ash she added from the kitchen fire.'
WHERE name = 'Tomato';

UPDATE vegetables SET
  fun_fact = 'Lettuce is one of the oldest cultivated vegetables on earth — ancient Egyptians were growing it as far back as 4500 BC, originally for its seeds, which were pressed for cooking oil.',
  growing_story = 'Priya in Pune repurposed old plastic water bottles, cutting them lengthwise and hanging them on her balcony railing. Three months later she had a vertical salad wall and had not bought lettuce from the market since.'
WHERE name = 'Lettuce';

UPDATE vegetables SET
  fun_fact = 'Carrots were originally purple! Orange carrots were developed by Dutch growers in the 17th century, reportedly to honour the Dutch royal House of Orange.',
  growing_story = 'Ravi planted carrots in a deep bucket filled with sandy soil on his Kerala terrace. His children loved pulling them up — like a treasure hunt they could eat.'
WHERE name = 'Carrot';

UPDATE vegetables SET
  fun_fact = 'Red bell peppers contain nearly 11 times more beta-carotene than green ones. They are identical vegetables — green peppers are simply red peppers that were harvested before full ripening.',
  growing_story = 'Sunita grew bell peppers in a single grow bag on her south-facing Chennai balcony. Three months of patience paid off when bright red peppers appeared in December — she became the envy of her whole apartment building.'
WHERE name = 'Bell Pepper';

UPDATE vegetables SET
  fun_fact = 'Cucumbers are 96% water by weight — even more water than watermelon. In several traditional cultures, a fresh cucumber slice under the tongue is considered a remedy for bad breath.',
  growing_story = 'Deepak fixed a bamboo trellis to his Delhi terrace wall and trained cucumbers vertically. By July the vines covered the entire two-metre wall and he was harvesting four or five cucumbers every other morning.'
WHERE name = 'Cucumber';

UPDATE vegetables SET
  fun_fact = 'A zucchini left on the plant for just one extra week can grow to over 60 cm long and weigh several kilograms. Gardeners worldwide compete annually to grow the longest one — current records exceed 2.5 metres.',
  growing_story = 'Maria planted two zucchini plants in her Seville courtyard as a casual experiment. By August she was leaving bags of zucchini at her neighbours'' doors every few days because she could not keep up with the harvest.'
WHERE name = 'Zucchini';

UPDATE vegetables SET
  fun_fact = 'Green beans were among the first vegetables sent into space. NASA included them in early astronaut meal packs because they pack significant nutrition into minimal weight.',
  growing_story = 'The Patel family in Gujarat built a bamboo frame over their courtyard and grew climbing beans on it. By peak summer the frame became a living shaded canopy, and the children helped pick beans every evening before dinner.'
WHERE name = 'Green Beans';

UPDATE vegetables SET
  fun_fact = 'Spinach contains oxalic acid that can block calcium absorption — but squeezing fresh lemon juice over it before eating neutralises the effect and dramatically boosts iron uptake at the same time.',
  growing_story = 'Ananya in Bengaluru plants spinach in old wooden drawer boxes she rescued from discarded furniture. She harvests a handful every few days for her morning smoothie — the freshest spinach in Koramangala, she jokes.'
WHERE name = 'Spinach';

UPDATE vegetables SET
  fun_fact = 'Bitter gourd has been used in Ayurvedic medicine for over 3,000 years. It contains a compound called charantin that is actively studied for its effect on blood sugar regulation.',
  growing_story = 'Meena in Odisha trained bitter gourd vines along her courtyard fence. Neighbours initially teased her about the bitter vegetable obsession — but by monsoon season she was sharing freshly made karela sabzi that even the sceptics ate happily with rice.'
WHERE name = 'Bitter Gourd';

UPDATE vegetables SET
  fun_fact = 'The word "gumbo" — the beloved American dish — comes directly from ki ngombo, the Bantu word for okra. The vegetable was brought to the Americas by enslaved Africans and has shaped cuisine across three continents.',
  growing_story = 'Ramesh planted okra directly in his Andhra Pradesh terrace bed in April. The plants grew taller than his children by June. His son started a small informal stall selling fresh bhindi to neighbours, earning his first pocket money.'
WHERE name = 'Okra';

UPDATE vegetables SET
  fun_fact = 'Eggplant flowers are almost perfectly self-pollinating — even a gentle breeze, or the vibration from a bee hovering nearby without landing, is enough to shake pollen loose and set fruit.',
  growing_story = 'Fatima in Lucknow grew a single large brinjal plant in a half-cut oil drum on her rooftop. That one plant gave her over forty brinjals in a single season — enough for months of baingan bharta and baghara baingan.'
WHERE name = 'Eggplant';

UPDATE vegetables SET
  fun_fact = 'Fenugreek seeds contain sotolon — the same aromatic compound found in maple syrup. Food manufacturers actually use fenugreek extract to produce artificial maple syrup flavouring.',
  growing_story = 'Savita in Jaipur sows methi seeds in old steel tiffin boxes filled with kitchen compost. She harvests young leaves every three weeks year-round, and fresh methi thepla has become an unbreakable weekly ritual at home.'
WHERE name = 'Fenugreek';

UPDATE vegetables SET
  fun_fact = 'Bok choy is one of the fastest vegetables on the planet — some varieties are harvest-ready just 21 days after germination, making it ideal for impatient first-time growers.',
  growing_story = 'Linda in Singapore grows bok choy in recycled styrofoam boxes placed along her HDB flat corridor. Three weeks after planting she had her first harvest — stir-fried with oyster sauce, it tasted nothing like the limp supermarket version.'
WHERE name = 'Bok Choy';

UPDATE vegetables SET
  fun_fact = 'Daikon radishes are natural soil aerators. Their long taproot breaks up compacted soil up to 60 cm deep, and when the roots decompose, they leave channels that improve drainage for the crops that follow.',
  growing_story = 'Kenji planted daikon in a neglected corner of his Tokyo community garden plot. The following season, other members noticed the surrounding soil had become noticeably easier to dig — the daikon had done the hard work for them.'
WHERE name = 'Daikon Radish';

UPDATE vegetables SET
  fun_fact = 'Snow peas were a luxury ingredient at the court of Versailles in the 17th century. French chefs called them pois gourmands — gourmet peas — and served them at royal banquets as a delicacy for the nobility.',
  growing_story = 'Ching Wei in Penang grows snow peas on a fine net strung between two window bars. Every morning before school, her daughter picks a handful to eat raw as a snack on the way out. Better than any crisp, she says.'
WHERE name = 'Snow Peas';

UPDATE vegetables SET
  fun_fact = 'Chinese long beans are not actually related to green beans — they belong to the same species as black-eyed peas and can tolerate far higher heat and drought conditions than most common bean varieties.',
  growing_story = 'Aunt Bela in the Philippines tied long bean vines to the support brackets of her roof gutters. By mid-summer the beans dangled almost to the ground. She cut them into sections and stir-fried them daily, sharing the harvest with the whole street.'
WHERE name = 'Chinese Long Beans';

UPDATE vegetables SET
  fun_fact = 'An artichoke is a flower that never bloomed. If you leave one on the plant, it opens into a spectacular 15 cm purple thistle. The edible parts we eat are the fleshy bracts and the base, called the heart.',
  growing_story = 'Carlo in Naples inherited a single artichoke plant from his father. Three years later that one plant had spread into a clump of seven, and every spring he harvests enough to host the entire neighbourhood for a stuffed artichoke Sunday lunch.'
WHERE name = 'Artichoke';

UPDATE vegetables SET
  fun_fact = 'Ancient Greek athletes at the Olympic games ate fennel seeds believing they improved performance and courage. Fennel was also used as a symbol of victory — winners were sometimes crowned with fennel wreaths.',
  growing_story = 'Giulia in Palermo grew bulb fennel in a raised wooden planter and discovered it seemed to deter aphids from her nearby tomatoes. The feathery fronds became her favourite garnish, turning every home-cooked plate into something that looked restaurant-quality.'
WHERE name = 'Fennel';

UPDATE vegetables SET
  fun_fact = 'Roughly one in ten Padrón peppers is fiery hot — but there is no way to tell which one by looking at it. This unpredictability is a beloved tradition in Galicia, Spain, where eating them is treated as a social game of chance.',
  growing_story = 'Tomás in Galicia grows a row of Padrón peppers every summer. He blisters them in a pan with olive oil and coarse salt, and every August evening friends gather on his terrace to eat them — everyone waiting to see who draws the hot one.'
WHERE name = 'Padron Pepper';

UPDATE vegetables SET
  fun_fact = 'Romanesco''s spiral florets are a mathematically perfect fractal. Count the spirals in either direction and each number is a Fibonacci number. The pattern repeats identically at every scale — nature''s own geometry lesson.',
  growing_story = 'Silvia in Bologna grew Romanesco in her kitchen garden for the first time last autumn. She almost could not bring herself to harvest it — the lime-green spiral was so beautiful she photographed it for a week first. The risotto she finally made was worth the wait.'
WHERE name = 'Romanesco Broccoli';

-- ─── FUN FACTS & STORIES — MEXICAN / LATIN AMERICAN ──────────────────────────

UPDATE vegetables SET
  fun_fact = 'The word "tomatillo" is Aztec — from the Nahuatl tomatl. The Aztecs cultivated tomatillos a thousand years before tomatoes; tomatillos are actually the older crop in Mesoamerican cooking.',
  growing_story = 'Lupita in Oaxaca grows three tomatillo plants beside her doorway. By August they sprawl across the path and she scoops fallen fruit from the ground every morning — the dropped ones, she says, make the best salsa verde of all.'
WHERE name = 'Tomatillo';

UPDATE vegetables SET
  fun_fact = 'Smoked and dried jalapeños become chipotles. The smoking tradition began over 600 years ago with the Aztecs, who realised that jalapeños rotted faster than they could dry — so they smoked them over wood fires instead.',
  growing_story = 'Carlos in San Antonio plants jalapeños along his fence every spring. By July his neighbours start lining up at his gate with empty jars — he pickles them in vinegar with carrots and garlic, just like his grandmother taught him in Monterrey.'
WHERE name = 'Jalapeño Pepper';

UPDATE vegetables SET
  fun_fact = 'When a poblano dries, it becomes the ancho chile — and "ancho" means "wide" in Spanish. Three different names (poblano, ancho, mulato) all refer to the same pepper at different stages of drying.',
  growing_story = 'Rosa in Puebla grows poblanos in clay pots on her azotea. Every September she stuffs them with picadillo and walnut sauce for chiles en nogada — the green, white and red of the Mexican flag — to celebrate Independence Day with her family.'
WHERE name = 'Poblano Pepper';

UPDATE vegetables SET
  fun_fact = 'Chayote is one of the few plants where every part is edible — fruit, seed, vine tips, leaves, and even the starchy root after a year. In Veracruz, the root is dug up and roasted like a potato.',
  growing_story = 'Doña Elena in Costa Rica planted a sprouted chayote her sister sent in a package. Three years later that single fruit had grown into a vine that covered the entire pergola — she gives away dozens of chayotes every week to anyone who passes by.'
WHERE name = 'Chayote';

UPDATE vegetables SET
  fun_fact = 'Cilantro and coriander are the same plant. Americans call the leaves cilantro and the seeds coriander; in Britain both are coriander; in India only the seeds are dhania. One plant, three or four names worldwide.',
  growing_story = 'Aditi in New Delhi sows dhania seeds in a flat tray on her kitchen windowsill every two weeks. By the time one tray is ready to harvest, the next is sprouting — fresh coriander for chutney every single day, year-round.'
WHERE name = 'Cilantro';

-- ─── FUN FACTS & STORIES — AFRICAN / CARIBBEAN ───────────────────────────────

UPDATE vegetables SET
  fun_fact = 'Collard greens were brought to America by enslaved West Africans who recognised them as a relative of dishes from home. They cooked them low and slow with smoked meat — and the resulting "pot likker" became a soul food tradition that still anchors New Year''s Day meals across the South.',
  growing_story = 'Mr. Williams in Atlanta has grown the same line of collards for 40 years, saving seed every autumn from his best plant. His grandchildren now grow them in three states, and every Christmas the family gathers around a single huge pot of collards cooked in his great-grandmother''s recipe.'
WHERE name = 'Collard Greens';

UPDATE vegetables SET
  fun_fact = 'The orange-flesh sweet potato is not actually a potato — it is in the morning glory family. It also is not the same as a yam, despite American supermarket labels. True yams are African tubers from a completely different plant family.',
  growing_story = 'Akua in Accra plants sweet potato slips at the start of every rainy season along the edge of her cassava field. The vines smother weeds, the leaves go into stew, and the tubers feed her family through the dry season — three crops from a single planting.'
WHERE name = 'Sweet Potato';

UPDATE vegetables SET
  fun_fact = 'Eating black-eyed peas on New Year''s Day for good luck is a tradition that travelled with enslaved West Africans to the American South — but the same belief exists across West Africa, Sephardic Jewish communities, and parts of Italy. The pea is older than any one tradition that claims it.',
  growing_story = 'Auntie May in Charleston cooks Hoppin'' John every January 1st using black-eyed peas she grew herself the summer before. She says the luck only counts if you grew them — store-bought peas, in her words, "do not know who you are yet."'
WHERE name = 'Black-eyed Peas';

UPDATE vegetables SET
  fun_fact = 'Mustard greens are the world''s most cosmopolitan green — known as sarson in Punjab, gai choy in Cantonese, takana in Japan, and just "mustard" in the American South. The same plant, four entirely different cooking traditions.',
  growing_story = 'Harpreet in Punjab sows sarson in October at the edge of his wheat field. By February the field is half yellow flowers, half wheat stalks, and his wife is making sarson da saag with makki di roti every Sunday until the frost ends.'
WHERE name = 'Mustard Greens';

UPDATE vegetables SET
  fun_fact = 'Callaloo is so central to Caribbean food that Jamaica, Trinidad and Guyana each insist their own version — made with amaranth, taro leaves, or both — is the original. The dispute is older than any of those countries.',
  growing_story = 'Miss Beverly in Kingston grows callaloo in old paint buckets along her veranda. The plants grow back so fast that she swears she has not bought a bunch from the market in 12 years — and she sends bags home with every visiting grandchild.'
WHERE name = 'Callaloo (Amaranth)';

-- ─── FUN FACTS & STORIES — ADDITIONAL SOUTH ASIAN ────────────────────────────

UPDATE vegetables SET
  fun_fact = 'A bottle gourd dried with the flesh removed becomes the body of the sitar. The same vegetable that goes into your lauki ki sabzi has been the resonating chamber of Indian classical music for over a thousand years.',
  growing_story = 'Sunil in Varanasi let one lauki dry on the vine all winter. His son hollowed it out, attached a bamboo neck and three strings, and made a child''s ektara. The neighbour''s music teacher heard him playing and offered him real lessons on the spot.'
WHERE name = 'Bottle Gourd';

UPDATE vegetables SET
  fun_fact = 'If you let a ridge gourd dry on the vine, the mature fruit becomes a natural bath sponge — the same loofah you buy at the chemist. One plant gives you both dinner and your bathroom supplies for the year.',
  growing_story = 'Lakshmi in Hyderabad grows tori on a bamboo trellis above her well. She picks young tori for sambar all summer — and lets the last 5 fruits of the season dry, becoming loofah sponges that go in every family Diwali gift hamper.'
WHERE name = 'Ridge Gourd';

UPDATE vegetables SET
  fun_fact = 'Moringa leaves contain more vitamin C than oranges, more potassium than bananas, and more calcium than milk — gram for gram. The UN classifies it as one of the most nutritionally dense plants on earth, and it grows like a weed in the tropics.',
  growing_story = 'Meera in Tamil Nadu planted a single moringa cutting at the corner of her courtyard. Two years later she harvests drumsticks, leaves, and flowers nearly weekly — and her neighbours come asking for cuttings of "the magic tree" that needs almost no water.'
WHERE name = 'Moringa';

UPDATE vegetables SET
  fun_fact = 'Cluster bean (guar) gum is the binding agent in everything from ice cream to fracking fluid. India produces 80% of the world''s supply — and the same humble pod that makes Rajasthani gawar phali sabzi is in your toothpaste tonight.',
  growing_story = 'Bhanu in Jodhpur grows gawar in soil where almost nothing else survives the summer heat. By August she picks pods every other morning before sunrise — the only crop on her plot that does not need irrigation, drinking only the brief monsoon rains.'
WHERE name = 'Cluster Beans (Guar)';

-- ─── FUN FACTS & STORIES — ADDITIONAL EAST/SE ASIAN ──────────────────────────

UPDATE vegetables SET
  fun_fact = 'A single jar of authentic napa cabbage kimchi takes a community to make — a Korean tradition called kimjang, recognised by UNESCO as cultural heritage. Families and neighbours gather every November to ferment cabbage by the dozen heads.',
  growing_story = 'Mrs. Park in Queens, New York, grows napa cabbage in her backyard each autumn. Every November her daughters drive from three states to spend the weekend making kimchi — they fill 40 jars, and not a single one lasts past March.'
WHERE name = 'Napa Cabbage';

UPDATE vegetables SET
  fun_fact = 'Lemongrass is one of the few culinary plants that also repels mosquitoes — the same citral compound that gives it its lemon flavour is the active ingredient in citronella candles.',
  growing_story = 'Nguyen in Ho Chi Minh City grows a single lemongrass clump at her front door. After 5 years it has multiplied into a thicket; she cuts stalks for pho daily and trims the leaves to throw into the courtyard fire — keeping mosquitoes off the family at dusk.'
WHERE name = 'Lemongrass';

UPDATE vegetables SET
  fun_fact = 'Thai basil is one of the few basils that holds its flavour when cooked — sweet basil wilts and loses its perfume in heat, but Thai basil''s anise notes deepen, which is why it is added at the very end of a stir-fry, not the start.',
  growing_story = 'Ploy in Bangkok keeps three Thai basil plants in clay pots beside her wok station. She picks fresh leaves the moment a stir-fry hits the plate — the heat releases the aroma into the kitchen, and her customers can smell it the moment they walk in.'
WHERE name = 'Thai Basil';

UPDATE vegetables SET
  fun_fact = 'Garlic chive flowers are entirely edible and were once used as currency in parts of imperial China — bunched into bundles and traded for rice. Today the unopened buds are still a delicacy in Chinese stir-fries.',
  growing_story = 'Auntie Lin in Taipei has had the same garlic chive clump in her balcony pot for 17 years. She divides it every few years to share with her sisters — there are now 8 cousins of that one plant growing in 8 different kitchens around the city.'
WHERE name = 'Garlic Chives';

-- ─── FUN FACTS & STORIES — ADDITIONAL ITALIAN/MEDITERRANEAN ──────────────────

UPDATE vegetables SET
  fun_fact = 'Genovese basil grown outside Liguria does not taste the same. The unique terroir — sea air, mineral soil, and specific humidity — gives true Genovese basil a flavour that has DOP protected status, like champagne or parmigiano.',
  growing_story = 'Marco in Liguria grows the same line of Genovese basil his great-grandfather brought up from the village in 1923. Every August his family makes a year''s worth of pesto in a single afternoon — pounded by hand in marble mortars, sealed in jars under olive oil.'
WHERE name = 'Sweet Basil';

UPDATE vegetables SET
  fun_fact = 'Radicchio''s deep red colour only develops when the plant is exposed to cold and limited light — Italian growers in Treviso traditionally bind the leaves and force them in dark cellars in winter, a 500-year-old technique called imbianchimento.',
  growing_story = 'Giovanni in Treviso forces his radicchio in his grandfather''s underground cellar each December. By Christmas the heads emerge with deep wine-red leaves and white ribs — he sells them to a Michelin-starred restaurant in Venice that has bought from his family for three generations.'
WHERE name = 'Radicchio';

UPDATE vegetables SET
  fun_fact = 'In Puglia, broccoli rabe is so essential to the regional dish "orecchiette con cime di rapa" that the local dialect has different words for the buds, leaves and stems — each cooked slightly differently in the same pan.',
  growing_story = 'Nonna Pina in Bari sows cime di rapa every September behind the kitchen. By November her grandchildren stop by daily — she sends them home with a bag of cime di rapa and instructions: "Cook with garlic, peperoncino, and orecchiette. Nothing else. That is the rule."'
WHERE name = 'Broccoli Rabe (Cime di Rapa)';

UPDATE vegetables SET
  fun_fact = 'Italian flat-leaf parsley has up to three times the vitamin C of an orange by weight, plus more iron than spinach. Italians have eaten it as a vegetable, not just a garnish, for over 2,000 years.',
  growing_story = 'Maria in Naples grows a permanent parsley patch by her back door. She harvests a fistful every morning for the family''s daily ragù, frittata or seafood pasta — by her count she has not bought parsley from a shop since 1987.'
WHERE name = 'Italian Parsley';

-- ─── FUN FACTS & STORIES — UNIVERSAL STAPLES ─────────────────────────────────

UPDATE vegetables SET
  fun_fact = 'Mint hybridises wildly with itself — there are over 600 named mint varieties globally, and gardeners often discover new spontaneous crosses in their own gardens. Two mint plants placed near each other can produce a brand-new flavour by next year.',
  growing_story = 'Yasmin in Beirut grows three different mints — spearmint, Moroccan, and a wild type her grandmother brought from a village in the south. She makes mint tea with a different blend every day, and swears her best cup uses leaves from all three plants together.'
WHERE name = 'Mint';

UPDATE vegetables SET
  fun_fact = 'Ancient Egyptians paid pyramid workers partly in garlic and onions — both were considered sacred, and supplies were carefully rationed by overseers. Garlic shortages reportedly caused the only documented strike during the building of the Great Pyramid.',
  growing_story = 'Tomáš in Prague plants garlic every October on the autumn equinox, just as his grandfather did. He swears the cloves planted at the equinox grow biggest — and after 40 years of comparison he says the science cannot explain it, but the bulbs prove it.'
WHERE name = 'Garlic';

UPDATE vegetables SET
  fun_fact = 'Onions cannot be stored alongside potatoes — both release moisture and ethylene gas that make the other rot or sprout faster. Generations of cooks placed them together by habit, halving their store life without realising why.',
  growing_story = 'Patricia in County Cork plants 200 onion sets every March. By August she plaits them into long ropes that hang from her kitchen rafters all winter, just as her mother and grandmother did — the kitchen smells of dry onion skin from October until April.'
WHERE name = 'Onion';

UPDATE vegetables SET
  fun_fact = 'There are over 4,000 varieties of native potato in the Andes — purple, blue, pink, even striped. The Quechua people have separate words to describe potatoes by texture in the mouth, including "makes you cry" and "good for stepping on with bare feet."',
  growing_story = 'Esperanza in the Sacred Valley of Peru grows 12 native potato varieties on a steep terrace at 3,400m. She harvests them all together, sorts them by colour on a blanket, and trades each variety with neighbours growing different ones — the Andean barter that fed civilisations.'
WHERE name = 'Potato';

UPDATE vegetables SET
  fun_fact = 'Sweet corn becomes less sweet within hours of picking — the sugars convert to starch fast. The classic American advice is to put a pot of water on to boil before walking out to the field; that is the only way to taste corn at its true peak.',
  growing_story = 'The Henderson family in Iowa plants a 50ft block of sweet corn every Memorial Day weekend. On the first picking night in August, neighbours walk over with empty pots — the rule is you can have all you want, but you have to eat it within the hour.'
WHERE name = 'Sweet Corn';

UPDATE vegetables SET
  fun_fact = 'The world record pumpkin weighs over 1,200 kg — heavier than a small car. Competitive growers feed plants milk, fish emulsion and compost tea, and limit each vine to a single fruit so all energy goes into one giant.',
  growing_story = 'Joe in Vermont grew his first show pumpkin in 2018 and broke 400kg by his third year. His daughter helps him roll the pumpkin onto a forklift each October — the whole street comes to watch the lift, and the carved jack-o''-lantern fits a small child inside.'
WHERE name = 'Pumpkin';

UPDATE vegetables SET
  fun_fact = 'Beetroot juice was used as ink in medieval manuscripts, and the same betalain pigment is now used as a natural red food colouring (E162). The deep red of strawberry yoghurt or pink lemonade is often beetroot, not strawberry.',
  growing_story = 'Anya in Kraków pickles beets every autumn for barszcz — the deep magenta soup that opens every Christmas Eve dinner in her family. She grows three different varieties so the soup has layered flavours, and her recipe has not changed in 60 years.'
WHERE name = 'Beetroot';

UPDATE vegetables SET
  fun_fact = 'Malabar spinach is not a true spinach — it is in the basella family, evolutionarily closer to beetroot. It is one of the only "spinaches" that thrives in tropical heat, which is why it spread from India through Southeast Asia and the Caribbean.',
  growing_story = 'Tita Rosa in Manila trains alugbati up the metal grille of her kitchen window. The vine fully covers the window by July and she picks tender tips daily for adobong alugbati — and the climbing leaves shade her kitchen from the brutal afternoon sun for free.'
WHERE name = 'Malabar Spinach';

-- ─── NUTRITION ────────────────────────────────────────────────────────────────

UPDATE vegetables SET nutrition = '18 kcal per 100g. Packed with lycopene — a powerful antioxidant linked to reduced heart disease and cancer risk. Rich in Vitamin C (21mg), potassium (237mg), and Vitamin K. Cooking tomatoes actually increases lycopene availability by up to 35%, so a sauce is as healthy as eating them raw.' WHERE name = 'Tomato';
UPDATE vegetables SET nutrition = '15 kcal per 100g. Surprisingly rich in Vitamin K (126µg — over 100% of your daily needs) and folate, critical for cell repair. The darker the leaf, the more nutritious — romaine contains 8× more Vitamin A than iceberg. One of the lowest-calorie vegetables that still delivers real micronutrient value.' WHERE name = 'Lettuce';
UPDATE vegetables SET nutrition = '41 kcal per 100g. Single best food source of beta-carotene (8285µg) — one medium carrot covers your entire daily Vitamin A requirement. Eating carrots with a small amount of fat (olive oil, butter) increases beta-carotene absorption by up to 65%. Also provides biotin for hair and nail health.' WHERE name = 'Carrot';
UPDATE vegetables SET nutrition = '31 kcal per 100g. The richest common source of Vitamin C — a single red bell pepper contains 169mg, nearly double the adult daily requirement. Red bells contain 11× more beta-carotene than green ones. Also rich in Vitamin B6, folate, and the antioxidant quercetin.' WHERE name = 'Bell Pepper';
UPDATE vegetables SET nutrition = '16 kcal per 100g. Exceptionally hydrating — 96% water by weight, one of the highest of any food. Provides Vitamin K (16µg), potassium, and silica, a trace mineral that supports collagen production in skin, hair, and nails. An ideal low-calorie volume food.' WHERE name = 'Cucumber';
UPDATE vegetables SET nutrition = '17 kcal per 100g. Good source of Vitamin C (17mg), manganese, and folate (24µg). Eating with the skin triples the fibre intake. Also provides B vitamins (B2, B6) that support energy metabolism. Low in calories but surprisingly filling due to its high water and fibre content.' WHERE name = 'Zucchini';
UPDATE vegetables SET nutrition = '31 kcal per 100g. Well-rounded source of Vitamin K (43µg), Vitamin C (12mg), folate (33µg), and plant iron (1mg). One of the most nutritionally balanced low-calorie vegetables — provides something from nearly every micronutrient category without specialising in any one.' WHERE name = 'Green Beans';
UPDATE vegetables SET nutrition = '23 kcal per 100g. Extraordinarily nutrient-dense: Vitamin K (483µg — 400% DV), folate (194µg), Vitamin A, and iron (2.7mg) in one small handful. Adding lemon juice when eating spinach doubles the body''s iron absorption by converting ferric iron to the more bioavailable ferrous form.' WHERE name = 'Spinach';
UPDATE vegetables SET nutrition = '17 kcal per 100g. High in Vitamin C (84mg) and folate (72µg). Contains charantin and polypeptide-p — compounds actively studied for blood sugar regulation in Type 2 diabetes. One of Ayurveda''s most consistently prescribed medicinal foods, used for 3,000 years.' WHERE name = 'Bitter Gourd';
UPDATE vegetables SET nutrition = '33 kcal per 100g. The characteristic sliminess is mucilage — soluble fibre that feeds beneficial gut bacteria and is clinically shown to lower LDL cholesterol. Also provides folate (60µg), Vitamin K (31µg), and Vitamin C (23mg). A surprisingly strong all-round nutritional profile.' WHERE name = 'Okra';
UPDATE vegetables SET nutrition = '25 kcal per 100g. The purple skin contains nasunin — a flavonoid antioxidant that specifically protects brain cell membranes from free radical damage. Good source of fibre (3g), manganese, and potassium (229mg). One of the few vegetables with meaningful brain-protective antioxidants.' WHERE name = 'Eggplant';
UPDATE vegetables SET nutrition = '49 kcal per 100g (fresh leaves). Remarkably iron-rich — dried fenugreek leaves contain nearly 3× the iron of spinach. Fresh leaves provide calcium (395mg) and folate. The seeds contain galactomannan, a soluble fibre clinically shown to slow post-meal blood sugar spikes.' WHERE name = 'Fenugreek';
UPDATE vegetables SET nutrition = '13 kcal per 100g. One of the best plant sources of calcium (105mg) with an absorption rate higher than dairy. Also rich in Vitamin C (45mg), Vitamin K, and folate (66µg). Provides all this at just 13 calories — one of the best nutrient-to-calorie ratios of any vegetable.' WHERE name = 'Bok Choy';
UPDATE vegetables SET nutrition = '18 kcal per 100g. Contains digestive enzymes — diastase, amylase, and esterase — that actively break down starches and fats in the gut. This is why it is traditionally served alongside oily Japanese meals. Also provides Vitamin C (22mg), folate (28µg), and potassium (227mg).' WHERE name = 'Daikon Radish';
UPDATE vegetables SET nutrition = '42 kcal per 100g. High in Vitamin C (60mg — 67% DV), Vitamin K, and plant iron (2mg per 100g). One of few vegetables that provides meaningful protein (2.8g) while staying very low in calories. The combination of Vitamin C and iron in the same pod aids iron absorption directly.' WHERE name = 'Snow Peas';
UPDATE vegetables SET nutrition = '47 kcal per 100g. Good source of folate (62µg — important for DNA synthesis), Vitamin C (18mg), and plant protein (2.8g). Genetically closer to black-eyed peas than common beans, sharing their iron density (1.3mg). One of the most heat-tolerant protein vegetables.' WHERE name = 'Chinese Long Beans';
UPDATE vegetables SET nutrition = '47 kcal per 100g. One of the highest-fibre vegetables (5.4g per 100g), largely inulin — a prebiotic that feeds Bifidobacterium and Lactobacillus in the gut. Also provides folate (68µg), magnesium (60mg), and cynarin, a compound that stimulates bile production and supports fat digestion.' WHERE name = 'Artichoke';
UPDATE vegetables SET nutrition = '31 kcal per 100g. Richer in potassium (414mg) than a banana, with folate (27µg), Vitamin C, and fibre. Contains anethole — the compound responsible for its anise flavour — which has demonstrated anti-inflammatory and antimicrobial properties in laboratory studies.' WHERE name = 'Fennel';
UPDATE vegetables SET nutrition = '27 kcal per 100g. Very high in Vitamin C (118mg) and Vitamin B6. The occasional hot Padrón contains capsaicin, which triggers endorphin release and has been shown to temporarily boost metabolism by up to 8%. Even the mild ones are rich in antioxidant carotenoids.' WHERE name = 'Padron Pepper';
UPDATE vegetables SET nutrition = '25 kcal per 100g. Dense in Vitamin C (93mg), sulforaphane (a potent glucosinolate studied for its anti-cancer properties), and Vitamin K (102µg). Light steaming preserves significantly more sulforaphane than boiling — the enzyme that activates it is destroyed by excessive heat.' WHERE name = 'Romanesco Broccoli';
UPDATE vegetables SET nutrition = '32 kcal per 100g. Contains withanolides — a class of antioxidants being actively researched for anti-cancer properties in laboratory studies. Provides niacin (1.8mg), Vitamin C, and potassium (268mg). The papery husk protects the fruit and keeps it fresh up to 3× longer than tomatoes.' WHERE name = 'Tomatillo';
UPDATE vegetables SET nutrition = '29 kcal per 100g. Very high in Vitamin C (119mg — 132% DV) and Vitamin B6 (0.4mg). Capsaicin binds pain receptors and triggers endorphin release. Regular consumption is associated with reduced appetite and a modest but measurable increase in calorie burn for up to 2 hours after eating.' WHERE name = 'Jalapeño Pepper';
UPDATE vegetables SET nutrition = '20 kcal per 100g. Rich in Vitamin C (95mg — over daily needs) and Vitamin A. Provides mild capsaicin that delivers anti-inflammatory benefits without intense heat. One of the most nutritious mild peppers — more Vitamin C per gram than most citrus fruit.' WHERE name = 'Poblano Pepper';
UPDATE vegetables SET nutrition = '19 kcal per 100g. Unusually high in folate (93µg — 23% DV) for such a mild vegetable, making it especially valuable during pregnancy. Provides zinc (0.7mg), Vitamin C, and fibre. Almost calorie-free while providing real bulk — one of the best vegetables for low-calorie volume eating.' WHERE name = 'Chayote';
UPDATE vegetables SET nutrition = '23 kcal per 100g. Extraordinary Vitamin K content (310µg — 258% DV) and Vitamin A (337µg) packed into small leaves. Also high in Vitamin C (27mg) and quercetin — an antioxidant flavonoid with potent anti-inflammatory properties. Far more nutritious than its garnish role suggests.' WHERE name = 'Cilantro';
UPDATE vegetables SET nutrition = '32 kcal per 100g. Among the highest Vitamin K vegetables on earth (623µg — over 500% DV) and an outstanding non-dairy calcium source (232mg per 100g). Rich in Vitamin C (35mg), folate (166µg), and glucosinolates linked to reduced cancer risk through multiple mechanisms.' WHERE name = 'Collard Greens';
UPDATE vegetables SET nutrition = '86 kcal per 100g. One medium sweet potato covers 107% of the daily Vitamin A requirement from beta-carotene alone. Also high in Vitamin C, B6, and potassium (337mg). After cooking and cooling, the starch partially converts to resistant starch — a prebiotic that feeds beneficial gut bacteria.' WHERE name = 'Sweet Potato';
UPDATE vegetables SET nutrition = '116 kcal per 100g cooked. Outstanding folate source (208µg — 52% DV), plant protein (8g), and iron (2.5mg). The high soluble fibre (6.5g) slows glucose absorption, making black-eyed peas one of the most diabetes-friendly legumes. Also provides zinc (1.3mg) and manganese.' WHERE name = 'Black-eyed Peas';
UPDATE vegetables SET nutrition = '27 kcal per 100g. Very high in Vitamin K (593µg), Vitamin C (70mg), and glucosinolates — sulfur compounds the body converts to isothiocyanates, which are studied for their ability to neutralise carcinogens. One of the most antioxidant-dense leafy greens consumed worldwide.' WHERE name = 'Mustard Greens';
UPDATE vegetables SET nutrition = '23 kcal per 100g. High calcium (215mg) that is better absorbed than spinach calcium due to lower oxalate content. Also provides Vitamin C (43mg), iron (2.3mg), and plant protein (2.5g) — unusually high for a leafy green. The deep colours signal high levels of anthocyanin and betacyanin antioxidants.' WHERE name = 'Callaloo (Amaranth)';
UPDATE vegetables SET nutrition = '14 kcal per 100g — one of the lowest-calorie vegetables that exists. Composed of 96% water. Provides choline (6mg) for liver health and Vitamin C (10mg). Ayurveda prescribes bottle gourd specifically as a summer food for its clinically observed cooling effect on core body temperature.' WHERE name = 'Bottle Gourd';
UPDATE vegetables SET nutrition = '20 kcal per 100g. Provides Vitamin C (12mg), iron (0.4mg), and zinc. Low in calories but delivers satisfying bulk and fibre. Let one ridge gourd dry completely on the vine and it becomes a loofah — the same bathroom sponge sold commercially — demonstrating how structurally unusual this vegetable is.' WHERE name = 'Ridge Gourd';
UPDATE vegetables SET nutrition = '64 kcal per 100g (fresh leaves). Gram for gram: more Vitamin C than oranges, more calcium than milk, more iron than spinach. Contains all 9 essential amino acids — exceptionally rare for a plant. The UN FAO classifies it as one of the most nutritionally complete plant foods on earth.' WHERE name = 'Moringa';
UPDATE vegetables SET nutrition = '16 kcal per 100g. Contains guar gum — a soluble fibre that forms a thick gel in the gut, clinically demonstrated to slow glucose absorption and lower LDL cholesterol. Also provides folate (47µg), iron (1mg), and plant protein (1.6g). The same gum is commercially extracted for use in ice cream and gluten-free baking.' WHERE name = 'Cluster Beans (Guar)';
UPDATE vegetables SET nutrition = '13 kcal per 100g. High in Vitamin K (59µg), Vitamin C (27mg), and folate (79µg — 20% DV). When fermented into kimchi, probiotic bacteria multiply and Vitamin C content measurably increases. The fermentation also creates B vitamins not present in fresh cabbage, making kimchi more nutritious than the raw ingredient.' WHERE name = 'Napa Cabbage';
UPDATE vegetables SET nutrition = 'Negligible calories when used fresh in cooking. Contains citral and limonene — compounds with demonstrated antibacterial, antifungal, and anti-inflammatory properties in clinical studies. Dried lemongrass is notably high in potassium (723mg per 100g) and iron (8.2mg). Used therapeutically in Southeast Asian medicine for fever reduction and digestive relief.' WHERE name = 'Lemongrass';
UPDATE vegetables SET nutrition = '22 kcal per 100g. Extremely high in Vitamin K (415µg — 346% DV). Contains eugenol — an anti-inflammatory compound also found in cloves and studied for pain relief comparable to mild NSAIDs. Rich in Vitamin A (264µg) and antioxidant flavonoids that protect against oxidative cell damage.' WHERE name = 'Thai Basil';
UPDATE vegetables SET nutrition = '30 kcal per 100g. Provides Vitamin C (35mg), calcium (92mg), and iron (1.5mg). The allicin compounds — the same family found in garlic — have demonstrated antibacterial activity against multiple pathogen strains. Green leaves are more micronutrient-dense than spring onion tops.' WHERE name = 'Garlic Chives';
UPDATE vegetables SET nutrition = '22 kcal per 100g. High in Vitamin K (415µg) and contains eugenol, which inhibits the inflammatory enzyme COX-2 — the same target as ibuprofen. Also provides Vitamin A (264µg) and rosmarinic acid, an antioxidant that crosses the blood-brain barrier. Fresh basil loses up to 90% of its volatile compounds when dried.' WHERE name = 'Sweet Basil';
UPDATE vegetables SET nutrition = '23 kcal per 100g. The deep red-purple colour comes from anthocyanins — potent antioxidants linked to improved memory and cardiovascular health. High in Vitamin K (255µg) and inulin (prebiotic fibre). Contains lactucopicrin, the bitter compound that stimulates bile production and supports liver function.' WHERE name = 'Radicchio';
UPDATE vegetables SET nutrition = '22 kcal per 100g. High in Vitamin K (224µg), calcium (108mg), and Vitamin C (20mg). Contains glucosinolates that the body converts to sulforaphane on chewing — one of the most researched anti-cancer plant compounds. Nutritionally denser than regular broccoli per gram.' WHERE name = 'Broccoli Rabe (Cime di Rapa)';
UPDATE vegetables SET nutrition = '36 kcal per 100g. Contains an extraordinary 1640µg of Vitamin K per 100g — over 1300% of the daily requirement. More iron per gram than red meat (6mg), more Vitamin C than an orange (133mg per 100g), and more Vitamin A than carrots. The most nutrient-dense garnish in existence.' WHERE name = 'Italian Parsley';
UPDATE vegetables SET nutrition = '44 kcal per 100g. Menthol activates cold-sensitive receptors in the mouth and intestines, creating a cooling sensation without temperature change — and clinically shown to relieve IBS symptoms. Rich in Vitamin A (212µg) and iron (5.1mg). Rosmarinic acid provides anti-inflammatory effects.' WHERE name = 'Mint';
UPDATE vegetables SET nutrition = '149 kcal per 100g. Contains allicin — one of nature''s most powerful broad-spectrum antimicrobials, effective against over 20 bacterial species including antibiotic-resistant strains. Crushing or chopping garlic and waiting 10 minutes before cooking maximises allicin formation. Also provides selenium (14µg) and manganese.' WHERE name = 'Garlic';
UPDATE vegetables SET nutrition = '40 kcal per 100g. Rich in quercetin — a flavonoid antioxidant with anti-inflammatory properties shown to inhibit histamine release (relevant to allergies). Contains chromium, which supports insulin sensitivity and glucose metabolism. Cooking concentrates sulphur compounds that have documented heart-protective effects.' WHERE name = 'Onion';
UPDATE vegetables SET nutrition = '77 kcal per 100g. Highest potassium of any common vegetable (421mg — more than a banana). Also provides Vitamin C (20mg), Vitamin B6, and resistant starch — when cooked and then cooled, up to 40% of the starch becomes resistant, acting as a prebiotic that feeds beneficial gut bacteria.' WHERE name = 'Potato';
UPDATE vegetables SET nutrition = '86 kcal per 100g. Contains lutein and zeaxanthin — two carotenoids that accumulate specifically in the retina and are clinically shown to reduce the risk of age-related macular degeneration. Also provides thiamine (B1) for nerve health, fibre (2g), and Vitamin C (7mg).' WHERE name = 'Sweet Corn';
UPDATE vegetables SET nutrition = '26 kcal per 100g. Exceptional source of beta-carotene (3100µg — converts to Vitamin A). Rich in potassium (340mg) and Vitamin C. The seeds are nutritionally distinct from the flesh: very high in zinc (7.8mg — 71% DV), magnesium, and plant protein (19g per 100g). Do not discard pumpkin seeds.' WHERE name = 'Pumpkin';
UPDATE vegetables SET nutrition = '43 kcal per 100g. Contains dietary nitrates that the body converts to nitric oxide — proven in multiple clinical trials to reduce blood pressure by 4–10mmHg and measurably improve athletic endurance by increasing oxygen efficiency. Rich in folate (109µg) and betalain antioxidants unique to the beet family.' WHERE name = 'Beetroot';
UPDATE vegetables SET nutrition = '19 kcal per 100g. Unusually high Vitamin C for a leafy green that holds heat (102mg per 100g — the heat-stable mucilage protects the vitamin during cooking). Also provides Vitamin A (200µg), calcium (109mg), and iron (1.2mg). The mucilage functions as a natural thickener in soups and stews.' WHERE name = 'Malabar Spinach';

-- ─── SIMPLE RECIPES ───────────────────────────────────────────────────────────

UPDATE vegetables SET simple_recipe = 'Classic Bruschetta — Slice a baguette, brush with olive oil and toast until golden. Rub each slice with a raw garlic clove while still hot. Dice ripe tomatoes with a pinch of salt, a drizzle of olive oil and torn basil. Pile it on the bread and eat immediately. Ready in 10 minutes, and better than any restaurant version.' WHERE name = 'Tomato';

UPDATE vegetables SET simple_recipe = 'Lemon Herb Salad — Tear fresh lettuce leaves into a bowl. Whisk together 2 tbsp olive oil, 1 tbsp lemon juice, a pinch of salt and half a teaspoon of honey. Toss the leaves in the dressing and scatter over whatever herbs you have — mint, chives or dill all work beautifully. On the table in 5 minutes.' WHERE name = 'Lettuce';

UPDATE vegetables SET simple_recipe = 'Honey-Glazed Carrots — Peel and slice carrots into sticks. Cook in a pan with butter over medium heat for 5 minutes until just tender. Add a tablespoon of honey and a pinch of salt, toss for another 2 minutes until they caramelise and go glossy. A squeeze of lemon at the end lifts the whole dish. Ready in 12 minutes.' WHERE name = 'Carrot';

UPDATE vegetables SET simple_recipe = 'Roasted Stuffed Peppers — Halve bell peppers and remove seeds. Fill each half with cooked rice, diced onion, tomato and a handful of grated cheese. Bake at 200°C for 25 minutes until the peppers soften and the cheese bubbles. Simple, filling, and the colours on the plate are stunning.' WHERE name = 'Bell Pepper';

UPDATE vegetables SET simple_recipe = 'Cucumber Raita — Grate or finely dice one cucumber and squeeze out excess water. Mix into a bowl of cold yoghurt with a pinch of cumin, salt and a handful of chopped mint or coriander. Refrigerate for 10 minutes. Serve alongside rice, flatbread or grilled meat. Perfect on a hot day.' WHERE name = 'Cucumber';

UPDATE vegetables SET simple_recipe = 'Garlic Butter Zucchini — Slice zucchini into thin rounds. Heat butter and olive oil in a wide pan until the butter foams. Add the zucchini in a single layer and cook undisturbed for 3 minutes so they colour. Flip, add a crushed garlic clove, season with salt and a squeeze of lemon. Five ingredients, ten minutes, delicious.' WHERE name = 'Zucchini';

UPDATE vegetables SET simple_recipe = 'Sautéed Green Beans with Almonds — Blanch green beans in boiling salted water for 3 minutes, then drain. In the same pan, toast a handful of sliced almonds in butter until golden. Add the beans, season with salt and a splash of lemon juice. Toss together and serve immediately. A French classic that takes 15 minutes total.' WHERE name = 'Green Beans';

UPDATE vegetables SET simple_recipe = 'Garlic Wilted Spinach — Heat olive oil in a wide pan and add two crushed garlic cloves. Cook 30 seconds until fragrant, then throw in a large handful of spinach. Toss with tongs for 2 minutes — it will shrink dramatically. Season with salt and a pinch of chilli flakes. Done before the kettle boils.' WHERE name = 'Spinach';

UPDATE vegetables SET simple_recipe = 'Crispy Karela Chips — Slice bitter gourd paper-thin, toss with salt and leave for 15 minutes, then squeeze out the water. Coat lightly in rice flour, turmeric and chilli powder. Shallow-fry in batches over medium-high heat until genuinely crisp. The bitterness becomes addictive when paired with the crunch. Impossible to stop eating.' WHERE name = 'Bitter Gourd';

UPDATE vegetables SET simple_recipe = 'Bhindi Masala — Slice okra into 2 cm pieces and dry-fry in a hot pan with a little oil for 5 minutes, stirring, until the sliminess disappears. Add diced tomato, cumin, coriander, turmeric and a pinch of chilli. Cook another 5 minutes until the tomato collapses into a dry masala that coats every piece. Serve with roti.' WHERE name = 'Okra';

UPDATE vegetables SET simple_recipe = 'Smoky Baingan Bharta — Char a whole eggplant directly over a gas flame, turning until the skin is completely blackened and the inside is soft. Peel under cold water. Mash the flesh with roasted onion, tomato, garlic, cumin and a pinch of amchur. Finish with fresh coriander. The charring is the flavour — do not skip it.' WHERE name = 'Eggplant';

UPDATE vegetables SET simple_recipe = 'Methi Thepla — Mix fresh fenugreek leaves with whole wheat flour, yoghurt, a pinch each of turmeric, cumin, chilli and salt into a soft dough. Roll into thin rounds and cook on a hot griddle with a little oil, pressing the edges down. Eat warm with pickle and yoghurt. A Gujarati breakfast that travels well — these keep for two days.' WHERE name = 'Fenugreek';

UPDATE vegetables SET simple_recipe = 'Oyster Sauce Bok Choy — Halve bok choy lengthwise and blanch in boiling water for 2 minutes. Drain and arrange on a plate. Mix 2 tbsp oyster sauce, 1 tsp sesame oil and a splash of hot water, then drizzle over the leaves. Scatter fried garlic on top. The fastest restaurant-quality side dish you will ever make.' WHERE name = 'Bok Choy';

UPDATE vegetables SET simple_recipe = 'Quick Pickled Daikon — Peel and cut daikon into thin matchsticks. Dissolve 3 tbsp sugar and 2 tbsp salt in half a cup of rice vinegar warmed gently. Pour over the daikon and leave at room temperature for 30 minutes. Crunchy, tangy and sweet — it transforms any rice bowl, bánh mì or noodle dish instantly.' WHERE name = 'Daikon Radish';

UPDATE vegetables SET simple_recipe = 'Sesame Snow Pea Stir-fry — Heat a wok until smoking. Add a splash of oil, then snow peas and toss for 2 minutes until bright green and just tender. Add a tablespoon of soy sauce and sesame oil, toss once more. Scatter toasted sesame seeds over the top. The whole thing takes 5 minutes and tastes incredible with steamed rice.' WHERE name = 'Snow Peas';

UPDATE vegetables SET simple_recipe = 'Garlic Long Bean Stir-fry — Cut long beans into 5 cm lengths. Heat oil in a wok until very hot, add the beans and cook without stirring for 2 minutes so they blister. Add minced garlic, a splash of soy sauce and a pinch of sugar. Toss vigorously for another minute. The blistered spots are the best part — the skin goes crisp while the inside stays tender.' WHERE name = 'Chinese Long Beans';

UPDATE vegetables SET simple_recipe = 'Steamed Artichoke with Lemon Butter — Trim the stem, snap off tough outer leaves, and steam whole artichokes for 35–40 minutes until a leaf pulls away easily. While they steam, melt butter with crushed garlic and a squeeze of lemon. Eat leaf by leaf, scraping the soft base between your teeth and dipping into the butter. The heart at the centre is the prize.' WHERE name = 'Artichoke';

UPDATE vegetables SET simple_recipe = 'Fennel and Orange Salad — Slice fennel bulb paper-thin on a mandoline or by hand. Peel and segment an orange. Arrange overlapping on a plate. Dress with olive oil, a pinch of salt and a few drops of lemon juice. Scatter fennel fronds on top. This Italian classic is elegantly simple and the sweetness of orange against the anise of raw fennel is unexpectedly perfect.' WHERE name = 'Fennel';

UPDATE vegetables SET simple_recipe = 'Pimientos de Padrón — Heat a generous splash of olive oil in a heavy pan until shimmering. Add the whole Padrón peppers in a single layer and cook undisturbed for 3 minutes until they blister and char on one side. Flip once. Slide onto a plate and scatter over flaky sea salt. Eat immediately with cold beer. One in ten will be fiery — nobody knows which one.' WHERE name = 'Padron Pepper';

UPDATE vegetables SET simple_recipe = 'Roasted Romanesco with Lemon — Break Romanesco into florets, toss with olive oil, salt and a pinch of chilli flakes. Roast at 220°C for 20 minutes until the tips char slightly and go crispy. Squeeze fresh lemon juice over immediately as it comes out of the oven. The caramelised edges taste almost nutty — a stunning side dish with almost no effort.' WHERE name = 'Romanesco Broccoli';

UPDATE vegetables SET simple_recipe = 'Fresh Salsa Verde — Husk and halve tomatillos, roast under the grill for 8 minutes until charred. Blend with a green chilli, garlic, coriander and salt to a rough sauce. That is it. Use immediately on tacos, eggs, grilled chicken or just eaten with warm tortilla chips. The bright acidity of tomatillo makes this salsa completely different from tomato-based versions.' WHERE name = 'Tomatillo';

UPDATE vegetables SET simple_recipe = 'Quick Pickled Jalapeños — Slice jalapeños into rings and pack into a clean jar with sliced garlic and carrot coins. Bring equal parts white vinegar and water to a boil with 1 tsp salt and 1 tsp sugar, pour over the peppers and leave to cool. Ready in one hour, better after a day. Keep in the fridge for three weeks. Everything tastes better with these on top.' WHERE name = 'Jalapeño Pepper';

UPDATE vegetables SET simple_recipe = 'Rajas con Crema — Char poblano peppers over a flame, peel, and slice into strips. Sauté with sliced onion in butter until soft. Pour in a few spoonfuls of crema or sour cream and a handful of corn kernels. Cook until the cream thickens slightly. Serve inside warm tortillas or alongside grilled meat. Rich, smoky and deeply satisfying.' WHERE name = 'Poblano Pepper';

UPDATE vegetables SET simple_recipe = 'Chayote with Lime and Chili — Peel and cube chayote, boil for 8 minutes until just tender. Drain and toss while hot with lime juice, a pinch of chilli powder, salt and a drizzle of olive oil. Scatter chopped coriander over the top. Simple, refreshing and ready in 15 minutes — a light salad that pairs beautifully with grilled fish or chicken.' WHERE name = 'Chayote';

UPDATE vegetables SET simple_recipe = 'Green Coriander Chutney — Blend a large handful of fresh cilantro with a small green chilli, a thumb of ginger, a clove of garlic, 2 tbsp yoghurt and the juice of half a lime. Blend until smooth, season with salt. The best dipping sauce in the world, ready in 3 minutes. Serve with samosas, grilled meats, sandwiches or literally anything.' WHERE name = 'Cilantro';

UPDATE vegetables SET simple_recipe = 'Slow-Cooked Collard Greens — Wash and remove the tough stems, then stack and slice the leaves into ribbons. Cook a diced onion and two crushed garlic cloves in oil until soft. Add the collards with a cup of broth and a pinch of chilli flakes. Cover and cook on low heat for 45 minutes until silky and tender. Season with vinegar and salt. The longer they cook, the better they get.' WHERE name = 'Collard Greens';

UPDATE vegetables SET simple_recipe = 'Baked Sweet Potato with Cinnamon Butter — Scrub sweet potatoes, pierce a few times with a fork and bake whole at 200°C for 45 minutes until a knife slides in easily. Split open and push the ends to fluff the inside. Top with a knob of butter, a pinch of cinnamon and a drizzle of honey. No recipe in this entire book requires less effort for more flavour.' WHERE name = 'Sweet Potato';

UPDATE vegetables SET simple_recipe = 'Hoppin'' John — Fry diced onion, celery and garlic in oil until soft. Add cooked black-eyed peas, a cup of rice and two cups of broth. Bring to a boil, then cover and simmer on the lowest heat for 18 minutes. Fluff and serve with hot sauce. A one-pot meal that has fed families across the South for centuries — simple, filling and deeply flavoured.' WHERE name = 'Black-eyed Peas';

UPDATE vegetables SET simple_recipe = 'Sarson da Saag — Wash and roughly chop mustard greens with a handful of spinach. Pressure-cook with ginger and green chilli for 3 whistles, then blend coarsely. Temper with a large knob of butter, sliced garlic and dried red chilli. Stir the tempering into the saag and cook another 10 minutes. Serve with makki di roti and more butter. Punjab on a plate.' WHERE name = 'Mustard Greens';

UPDATE vegetables SET simple_recipe = 'Callaloo Soup — Sauté onion, garlic and a chopped scotch bonnet in oil until soft. Add callaloo leaves with coconut milk and a cup of water. Simmer for 20 minutes until the greens are completely tender. Blend partially for a creamy-smooth texture, or leave chunky. Season with salt and white pepper. Serve with rice and peas — a Caribbean Sunday essential.' WHERE name = 'Callaloo (Amaranth)';

UPDATE vegetables SET simple_recipe = 'Lauki Ki Sabzi — Peel and cube bottle gourd. Heat oil and add cumin seeds — let them pop. Add diced onion and cook until golden, then ginger-garlic paste for a minute. Add the lauki with turmeric, coriander and a little salt. Cover and cook on low heat for 20 minutes until the gourd is completely soft and has absorbed all the spices. Serve with hot chapati.' WHERE name = 'Bottle Gourd';

UPDATE vegetables SET simple_recipe = 'Tori Dal — Peel and slice ridge gourd. Cook moong dal with turmeric until soft. In a separate pan, temper mustard seeds, curry leaves and dried red chilli in oil. Add the ridge gourd and sauté 5 minutes, then combine with the cooked dal. Simmer together for 10 minutes. Serve with rice. The gourd melts into the dal and the two become inseparable.' WHERE name = 'Ridge Gourd';

UPDATE vegetables SET simple_recipe = 'Drumstick Sambar — Pressure-cook toor dal with turmeric until mushy. In a pan, cook drumstick pieces in water with tomato until tender, about 15 minutes. Add the dal, sambar powder, tamarind paste and salt. Bring to a boil and temper with mustard seeds, curry leaves and dried chilli in oil. Serve over rice. The drumstick flesh is sucked off the pods — no fork needed.' WHERE name = 'Moringa';

UPDATE vegetables SET simple_recipe = 'Gawar Phali Sabzi — String the cluster beans and slice into 3 cm pieces. Heat oil and add cumin, then diced onion and cook until golden. Add ginger, green chilli, turmeric, coriander and red chilli powder. Add the gawar with a splash of water, cover and cook for 15 minutes until tender. A dry, spiced Rajasthani preparation that pairs perfectly with dal baati.' WHERE name = 'Cluster Beans (Guar)';

UPDATE vegetables SET simple_recipe = 'Quick Napa Cabbage Soup — Slice napa cabbage into 4 cm ribbons. Bring a pot of broth to a boil with sliced ginger and garlic. Add the cabbage and simmer 10 minutes until silky. Season with soy sauce, sesame oil and white pepper. Add tofu cubes or sliced mushrooms if you have them. Ready in 20 minutes — warming, light and exactly what you need on a grey afternoon.' WHERE name = 'Napa Cabbage';

UPDATE vegetables SET simple_recipe = 'Lemongrass Ginger Tea — Bruise two lemongrass stalks by bashing with a rolling pin — this releases the oils. Simmer in a pot of water with sliced ginger for 10 minutes. Strain into cups and add honey to taste. Optionally add a lime wedge. Fragrant, gently medicinal and incredibly refreshing either hot or poured over ice. The aroma fills the whole kitchen.' WHERE name = 'Lemongrass';

UPDATE vegetables SET simple_recipe = 'Thai Basil Stir-fry (Pad Krapow) — Fry minced garlic and chilli in hot oil for 30 seconds. Add ground or minced chicken or pork and cook until browned. Add a splash of oyster sauce, fish sauce and a pinch of sugar. Turn off the heat and stir in a very large handful of Thai basil leaves — they wilt instantly. Serve over rice with a fried egg on top. Street food in 10 minutes.' WHERE name = 'Thai Basil';

UPDATE vegetables SET simple_recipe = 'Garlic Chive Pancakes — Mix chopped garlic chives with flour, an egg, water and a pinch of salt into a thin batter. Fry ladlefuls in a lightly oiled pan over medium heat, pressing flat, for 2 minutes each side. Serve with a dipping sauce of soy, rice vinegar and sesame oil. Crispy at the edges, soft in the middle — a classic Chinese snack that disappears immediately.' WHERE name = 'Garlic Chives';

UPDATE vegetables SET simple_recipe = 'Classic Pesto — Pound a large bunch of sweet basil leaves with a garlic clove and a small handful of toasted pine nuts in a mortar, or blend briefly. Add grated parmigiano reggiano and drizzle in good olive oil until you reach a loose paste. Season with salt. Toss through freshly cooked pasta with a spoonful of the pasta water to emulsify. Do not cook the pesto — ever.' WHERE name = 'Sweet Basil';

UPDATE vegetables SET simple_recipe = 'Radicchio Risotto — Slice radicchio and sauté with butter and a little red wine until wilted and slightly caramelised. Make a simple risotto with arborio rice, hot broth and white wine. Stir in the radicchio halfway through. Finish with butter and parmigiano. The bitterness of the radicchio becomes mellow and almost sweet in the risotto, turning a simple rice dish into something sophisticated.' WHERE name = 'Radicchio';

UPDATE vegetables SET simple_recipe = 'Orecchiette con Cime di Rapa — Blanch broccoli rabe in boiling salted water for 3 minutes, remove but keep the water for the pasta. Cook orecchiette in the same water. Meanwhile fry sliced garlic and peperoncino in generous olive oil. Drain pasta, add to the pan with the broccoli rabe and a ladle of pasta water. Toss vigorously until the sauce emulsifies. A Pugliese masterpiece that takes 20 minutes.' WHERE name = 'Broccoli Rabe (Cime di Rapa)';

UPDATE vegetables SET simple_recipe = 'Gremolata — Finely chop a large bunch of Italian parsley with the zest of one lemon and two garlic cloves until everything is almost a paste. Scatter over osso buco, grilled fish, risotto or roasted vegetables just before serving. The raw garlic, bright parsley and lemon cut through richness and wake up any dish. Three ingredients, two minutes, transformative.' WHERE name = 'Italian Parsley';

UPDATE vegetables SET simple_recipe = 'Fresh Mint Tea — Rinse a large handful of fresh mint leaves and put them in a teapot or heatproof jug. Pour over just-boiled water and steep for 5 minutes. Add honey and a squeeze of lemon to taste. Serve hot in winter or pour over ice in summer. In Morocco this is a ritual of hospitality — the tea is poured from a height to create a frothy top, and refusing a second glass is considered rude.' WHERE name = 'Mint';

UPDATE vegetables SET simple_recipe = 'Roasted Garlic — Slice the top off a whole garlic head to expose the cloves. Drizzle with olive oil and wrap in foil. Roast at 180°C for 45 minutes until the cloves are completely soft and golden. Squeeze the paste out of each clove directly onto bread. It spreads like butter and tastes nothing like raw garlic — sweet, nutty and deeply savoury. One of the best things you will ever eat on toast.' WHERE name = 'Garlic';

UPDATE vegetables SET simple_recipe = 'Caramelised Onion Tart — Slowly cook four sliced onions in butter on the lowest heat for 45 minutes, stirring occasionally, until they turn deeply golden and jammy — this cannot be rushed. Spread onto a pre-baked shortcrust tart case. Top with crumbled goat cheese and thyme. Bake 15 minutes. The patience of the long cook is the entire recipe — the result is sweet, rich and extraordinary.' WHERE name = 'Onion';

UPDATE vegetables SET simple_recipe = 'Patatas Bravas — Cut potatoes into rough chunks and fry or roast at 220°C for 30 minutes until golden and crispy. For the sauce, fry garlic and smoked paprika in oil for 30 seconds, add tinned tomato and a pinch of cayenne. Simmer 10 minutes until thick. Pour over the hot potatoes and add a swirl of aioli. Spain''s greatest bar snack, ready in 40 minutes.' WHERE name = 'Potato';

UPDATE vegetables SET simple_recipe = 'Elote (Mexican Street Corn) — Grill whole corn cobs over high heat, turning until charred all over. While hot, brush with a mixture of mayonnaise and lime juice. Roll in crumbled cotija cheese or feta. Dust with chilli powder and a final squeeze of lime. Eat standing up. The contrast of sweet charred corn, creamy mayo, salty cheese and sour lime is one of the greatest flavour combinations in street food.' WHERE name = 'Sweet Corn';

UPDATE vegetables SET simple_recipe = 'Pumpkin Soup — Roast cubed pumpkin with olive oil at 200°C for 25 minutes until caramelised. Fry onion and garlic until soft, add the roasted pumpkin and enough hot broth to cover. Blend until completely smooth. Stir in a swirl of cream and season with salt, white pepper and a pinch of nutmeg. Serve with crusty bread. The roasting instead of boiling makes this soup taste like it took all day.' WHERE name = 'Pumpkin';

UPDATE vegetables SET simple_recipe = 'Roasted Beetroot and Feta Salad — Wrap whole beetroots in foil and roast at 190°C for 1 hour until tender. Peel and slice. Arrange on a plate with crumbled feta, toasted walnuts and rocket. Dress with olive oil, balsamic vinegar and a pinch of salt. The combination of sweet earthy beet, salty feta and bitter leaves is one of those salads that disappears before you are ready for it to end.' WHERE name = 'Beetroot';

UPDATE vegetables SET simple_recipe = 'Adobong Alugbati — Pick tender Malabar spinach tips and young leaves. Sauté garlic and onion in oil until soft. Add a splash of soy sauce and white vinegar — the Filipino adobo ratio — and let it bubble for a minute. Add the spinach and toss for 2 minutes until wilted and glossy. The slight slipperiness of Malabar spinach becomes silky in the sauce. Serve over rice.' WHERE name = 'Malabar Spinach';
