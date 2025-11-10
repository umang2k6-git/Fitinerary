/*
  # Create Travel Trivia Table

  1. New Tables
    - `travel_trivia`
      - `id` (uuid, primary key)
      - `category` (text, category of trivia: landmarks, cities, travel_tips, famous_travelers, cultural_facts)
      - `title` (text, short catchy title for the trivia)
      - `fact` (text, the actual trivia content)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `travel_trivia` table
    - Add policy for public read access (trivia is non-sensitive data)
    - Add policy for authenticated users to insert (for future admin features)

  3. Indexes
    - Create index on category for filtered queries
    - Create index on created_at for ordering

  4. Initial Data
    - Seed with 20+ diverse travel trivia facts covering all categories
*/

-- Create travel_trivia table
CREATE TABLE IF NOT EXISTS travel_trivia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('landmarks', 'cities', 'travel_tips', 'famous_travelers', 'cultural_facts')),
  title text NOT NULL,
  fact text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_travel_trivia_category ON travel_trivia(category);
CREATE INDEX IF NOT EXISTS idx_travel_trivia_created_at ON travel_trivia(created_at DESC);

-- Enable Row Level Security
ALTER TABLE travel_trivia ENABLE ROW LEVEL SECURITY;

-- Public read access policy
CREATE POLICY "Anyone can view travel trivia"
  ON travel_trivia FOR SELECT
  TO authenticated, anon
  USING (true);

-- Authenticated users can insert (for future admin features)
CREATE POLICY "Authenticated users can add travel trivia"
  ON travel_trivia FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Seed initial travel trivia data
INSERT INTO travel_trivia (category, title, fact) VALUES
  ('landmarks', 'The Eiffel Tower''s Height Changes', 'The Eiffel Tower can grow up to 6 inches taller during summer due to thermal expansion of the iron structure when heated by the sun.'),
  ('landmarks', 'The Great Wall''s Mortar Secret', 'The mortar used to bind the Great Wall of China''s stones was made with sticky rice, making it one of the strongest construction materials in ancient times.'),
  ('landmarks', 'Statue of Liberty''s Original Color', 'The Statue of Liberty was originally copper-colored. It turned green due to oxidation over about 30 years, creating the iconic patina we see today.'),
  ('landmarks', 'Machu Picchu''s Perfect Engineering', 'Machu Picchu was built without using wheels, iron tools, or draft animals, yet the stones fit so perfectly together that a knife blade cannot fit between them.'),
  
  ('cities', 'Venice''s Sinking Rate', 'Venice is sinking at a rate of 1-2 millimeters per year. It has sunk about 9 inches in the last century and continues to face flooding challenges.'),
  ('cities', 'Tokyo''s Lost and Found Success', 'Tokyo''s lost and found system is so efficient that over 80% of lost items, including cash, are returned to their owners. The city handles millions of items annually.'),
  ('cities', 'Istanbul''s Two Continents', 'Istanbul is the only city in the world that spans two continents. The Bosphorus Strait divides the city between Europe and Asia.'),
  ('cities', 'Singapore''s Ban on Chewing Gum', 'Singapore has strict regulations on chewing gum. It''s illegal to import or sell it, though personal consumption is allowed. The ban was implemented to keep the city clean.'),
  ('cities', 'La Paz''s Altitude Record', 'La Paz, Bolivia, is the world''s highest administrative capital at 11,975 feet above sea level. The city''s elevation can cause altitude sickness in visitors.'),
  
  ('travel_tips', 'Tuesday is the Cheapest Flight Day', 'Historically, Tuesday afternoons are the best time to book flights, as airlines often release deals on Monday evenings that competitors match by Tuesday.'),
  ('travel_tips', 'The 3-1-1 Liquids Rule Memory', 'For TSA liquids, remember 3-1-1: 3.4 ounces per container, 1 quart-sized bag, 1 bag per passenger. This applies to all US airports and many international ones.'),
  ('travel_tips', 'Airplane Air is Surprisingly Clean', 'Airplane cabin air is replaced every 2-3 minutes and passes through HEPA filters that remove 99.97% of particles, making it cleaner than most indoor spaces.'),
  ('travel_tips', 'Hotel Room Safes Have Master Codes', 'Most hotel safes can be opened by staff using master codes or physical keys. For truly valuable items, use the hotel''s main safe deposit box.'),
  ('travel_tips', 'Power of Packing Cubes', 'Packing cubes can increase luggage capacity by 30% and reduce packing time by half. They also keep clothes wrinkle-free and organized during travel.'),
  
  ('famous_travelers', 'Ibn Battuta''s Epic Journey', 'Ibn Battuta, a 14th-century Moroccan explorer, traveled over 75,000 miles across Africa, Asia, and Europe over 30 years—more than Marco Polo—visiting the equivalent of 44 modern countries.'),
  ('famous_travelers', 'Nellie Bly''s Around the World Record', 'In 1889, journalist Nellie Bly circumnavigated the globe in 72 days, beating Jules Verne''s fictional record. She traveled alone, carrying only one bag and inspiring generations of women travelers.'),
  ('famous_travelers', 'Anthony Bourdain''s Travel Philosophy', 'Anthony Bourdain believed that "Travel isn''t always pretty. It isn''t always comfortable. But that''s okay. Discomfort is the price of admission to a meaningful life."'),
  ('famous_travelers', 'Freya Stark''s Desert Adventures', 'British explorer Freya Stark traveled extensively through the Middle East in the 1930s, often alone. She mapped remote areas of Iran and Yemen, writing 30 books about her adventures.'),
  
  ('cultural_facts', 'Japan''s Punctuality Standard', 'In Japan, train companies issue official apologies if trains are even 1 minute late. The average delay is just 18 seconds, making it the world''s most punctual rail system.'),
  ('cultural_facts', 'Iceland''s Unique Naming System', 'Iceland uses a patronymic naming system. Children take their father''s (or mother''s) first name plus "son" or "dóttir." Phone books are alphabetized by first names.'),
  ('cultural_facts', 'Spain''s Siesta Misconception', 'While siestas exist in Spain, most Spaniards don''t actually nap. The midday break is for lunch with family and escaping afternoon heat, with shops reopening around 5 PM.'),
  ('cultural_facts', 'New Zealand''s Māori Welcome', 'The traditional Māori greeting, the hongi, involves pressing noses and foreheads together. It represents the sharing of breath, or the breath of life, symbolizing unity.'),
  ('cultural_facts', 'Norway''s Outdoor Philosophy', 'Norway''s cultural concept "friluftsliv" (open-air living) emphasizes spending time in nature for spiritual and physical well-being. It''s considered essential to Norwegian identity.')
ON CONFLICT DO NOTHING;