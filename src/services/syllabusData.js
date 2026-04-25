// Complete syllabus with chapter content for Class 10
export const SYLLABUS = {
  Mathematics: {
    color: 'bg-blue-500',
    light: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600',
    icon: '📐',
    chapters: [
      {
        id: 'math-1', title: 'Real Numbers',
        content: `Real numbers include all rational and irrational numbers. The Fundamental Theorem of Arithmetic states that every composite number can be expressed as a product of primes in a unique way. Euclid's Division Lemma: For any two positive integers a and b, there exist unique integers q and r such that a = bq + r, where 0 ≤ r < b. Irrational numbers like √2, √3, π cannot be expressed as p/q. Decimal expansions of rational numbers are either terminating or non-terminating repeating. HCF and LCM can be found using prime factorization. HCF × LCM = Product of two numbers.`
      },
      {
        id: 'math-2', title: 'Polynomials',
        content: `A polynomial is an expression of the form p(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀. The degree of a polynomial is the highest power of x. Zeroes of a polynomial are values of x for which p(x) = 0. For a quadratic polynomial ax² + bx + c, sum of zeroes = -b/a and product of zeroes = c/a. The Remainder Theorem states that when p(x) is divided by (x-a), the remainder is p(a). Factor Theorem: (x-a) is a factor of p(x) if and only if p(a) = 0. Geometrically, zeroes of a polynomial are the x-coordinates where the graph intersects the x-axis.`
      },
      {
        id: 'math-3', title: 'Linear Equations in Two Variables',
        content: `A linear equation in two variables is of the form ax + by + c = 0. A pair of linear equations can be solved by substitution, elimination, or cross-multiplication methods. Graphically, two lines can be intersecting (unique solution), parallel (no solution), or coincident (infinitely many solutions). Consistent system has at least one solution. Inconsistent system has no solution. For a₁x + b₁y + c₁ = 0 and a₂x + b₂y + c₂ = 0: if a₁/a₂ ≠ b₁/b₂ → unique solution; if a₁/a₂ = b₁/b₂ ≠ c₁/c₂ → no solution; if a₁/a₂ = b₁/b₂ = c₁/c₂ → infinite solutions.`
      },
      {
        id: 'math-4', title: 'Quadratic Equations',
        content: `A quadratic equation is of the form ax² + bx + c = 0 where a ≠ 0. Methods of solving: factorization, completing the square, and quadratic formula. Quadratic formula: x = (-b ± √(b²-4ac)) / 2a. The discriminant D = b² - 4ac determines the nature of roots. If D > 0: two distinct real roots. If D = 0: two equal real roots. If D < 0: no real roots. Sum of roots = -b/a. Product of roots = c/a. Word problems involving quadratic equations appear frequently in exams.`
      },
      {
        id: 'math-5', title: 'Arithmetic Progressions',
        content: `An Arithmetic Progression (AP) is a sequence where each term differs from the previous by a constant called the common difference (d). General term: aₙ = a + (n-1)d where a is the first term. Sum of n terms: Sₙ = n/2 × [2a + (n-1)d] or Sₙ = n/2 × (a + l) where l is the last term. If three numbers are in AP, the middle one is their arithmetic mean. Common difference can be positive, negative, or zero. Applications include finding number of terms, specific terms, and sum problems.`
      },
    ]
  },
  Science: {
    color: 'bg-green-500',
    light: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600',
    icon: '🔬',
    chapters: [
      {
        id: 'sci-1', title: 'Chemical Reactions and Equations',
        content: `A chemical reaction involves the transformation of reactants into products. Chemical equations represent reactions using symbols and formulas. Balancing equations follows the Law of Conservation of Mass. Types of reactions: Combination (A + B → AB), Decomposition (AB → A + B), Displacement (A + BC → AC + B), Double Displacement (AB + CD → AD + CB), Oxidation-Reduction. Exothermic reactions release energy; endothermic reactions absorb energy. Corrosion is the slow eating away of metals. Rancidity is the oxidation of fats and oils. Indicators like litmus, phenolphthalein help identify acids and bases.`
      },
      {
        id: 'sci-2', title: 'Acids, Bases and Salts',
        content: `Acids produce H⁺ ions in solution and have pH < 7. Bases produce OH⁻ ions and have pH > 7. Neutral substances have pH = 7. Strong acids: HCl, H₂SO₄, HNO₃. Strong bases: NaOH, KOH. Neutralization: Acid + Base → Salt + Water. Common salts: NaCl (table salt), Na₂CO₃ (washing soda), NaHCO₃ (baking soda), CaOCl₂ (bleaching powder). pH scale ranges from 0-14. Indicators: litmus (red in acid, blue in base), phenolphthalein (colorless in acid, pink in base). Plaster of Paris is CaSO₄·½H₂O.`
      },
      {
        id: 'sci-3', title: 'Metals and Non-metals',
        content: `Metals are lustrous, malleable, ductile, good conductors of heat and electricity. Non-metals are brittle, poor conductors (except graphite). Reactivity series: K > Na > Ca > Mg > Al > Zn > Fe > Pb > H > Cu > Ag > Au. Metals react with oxygen to form oxides. Ionic bonds form between metals and non-metals. Extraction of metals: highly reactive metals by electrolysis, moderately reactive by reduction with carbon, less reactive by heating alone. Corrosion prevention: painting, galvanizing, alloying. Alloys: brass (Cu+Zn), bronze (Cu+Sn), solder (Pb+Sn).`
      },
      {
        id: 'sci-4', title: 'Life Processes',
        content: `Life processes are the basic functions performed by living organisms to maintain life. Nutrition: autotrophic (photosynthesis) and heterotrophic. Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (in presence of sunlight and chlorophyll). Respiration: aerobic (with oxygen, produces 38 ATP) and anaerobic. Digestion in humans: mouth → esophagus → stomach → small intestine → large intestine. Circulation: heart pumps blood through arteries (oxygenated) and veins (deoxygenated). Excretion: kidneys filter blood to form urine. Nephron is the functional unit of kidney.`
      },
      {
        id: 'sci-5', title: 'Electricity',
        content: `Electric current is the flow of electric charge. I = Q/t (Amperes). Ohm's Law: V = IR. Resistance R = ρl/A where ρ is resistivity. Resistors in series: R = R₁ + R₂ + R₃. Resistors in parallel: 1/R = 1/R₁ + 1/R₂ + 1/R₃. Electric power P = VI = I²R = V²/R (Watts). Electric energy = P × t (Joules or kWh). 1 kWh = 3.6 × 10⁶ J. Heating effect of current: H = I²Rt (Joule's Law). Fuse wire has high resistance and low melting point. MCB (Miniature Circuit Breaker) is a modern safety device.`
      },
    ]
  },
  Social: {
    color: 'bg-yellow-500',
    light: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-600',
    icon: '🌍',
    chapters: [
      {
        id: 'soc-1', title: 'Resources and Development',
        content: `Resources are everything available in our environment which can be used to satisfy our needs. Classification: Natural (biotic/abiotic), Human-made, Human resources. On the basis of exhaustibility: renewable and non-renewable. On the basis of ownership: individual, community, national, international. Resource planning is essential for sustainable development. Land use pattern in India: net sown area, forests, land not available for cultivation, fallow lands. Soil is the most important resource. Types of soil: alluvial, black, red and yellow, laterite, arid, forest soils. Soil erosion and conservation methods: terrace farming, contour ploughing, shelter belts.`
      },
      {
        id: 'soc-2', title: 'Forest and Wildlife Resources',
        content: `India has rich biodiversity with about 8% of world's biodiversity. Forests cover about 33% of India's geographical area (target). Types of forests: Reserved forests (most valuable), Protected forests, Unclassed forests. Threats to biodiversity: habitat destruction, poaching, over-exploitation. Project Tiger was launched in 1973 to protect tigers. Biosphere reserves, national parks, wildlife sanctuaries protect biodiversity. Community-based conservation: Chipko movement, Beej Bachao Andolan, Joint Forest Management (JFM). Sacred groves are patches of forest protected by local communities.`
      },
      {
        id: 'soc-3', title: 'Water Resources',
        content: `Water is a renewable resource but its availability is limited. Freshwater is only 2.5% of total water. India receives rainfall mainly through monsoons. Multipurpose river projects: Bhakra Nangal, Hirakud, Damodar Valley, Nagarjuna Sagar. Benefits: irrigation, electricity, flood control, recreation. Disadvantages: displacement of people, ecological damage, sedimentation. Rainwater harvesting: rooftop collection, check dams, tankas (underground tanks in Rajasthan). Watershed management helps in water conservation. Water scarcity is caused by overuse, pollution, and unequal distribution.`
      },
      {
        id: 'soc-4', title: 'Agriculture',
        content: `Agriculture is the primary occupation of most Indians. Types of farming: subsistence (primitive, intensive), commercial, plantation. Cropping seasons: Kharif (June-September: rice, maize, cotton), Rabi (October-March: wheat, barley, mustard), Zaid (summer: watermelon, cucumber). Green Revolution increased food grain production using HYV seeds, fertilizers, irrigation. Major crops: Rice (West Bengal, UP), Wheat (Punjab, Haryana), Cotton (Maharashtra, Gujarat), Jute (West Bengal). Technological reforms: consolidation of holdings, cooperative farming, land reforms. Challenges: small land holdings, lack of irrigation, soil degradation.`
      },
      {
        id: 'soc-5', title: 'Nationalism in India',
        content: `Indian nationalism emerged in the late 19th century. Non-Cooperation Movement (1920-22): boycott of British goods, courts, schools. Civil Disobedience Movement (1930): Dandi March by Gandhi against salt tax. Quit India Movement (1942): "Do or Die" slogan. Role of different groups: peasants, tribals, workers, women. Simon Commission (1927) was boycotted. Round Table Conferences (1930-32). Partition of Bengal (1905) sparked nationalist feelings. Indian National Congress founded in 1885. Rowlatt Act (1919) allowed detention without trial. Jallianwala Bagh massacre (1919) intensified the movement.`
      },
    ]
  },
  English: {
    color: 'bg-purple-500',
    light: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600',
    icon: '📖',
    chapters: [
      {
        id: 'eng-1', title: 'A Letter to God',
        content: `"A Letter to God" by G.L. Fuentes is a story about Lencho, a farmer who has deep faith in God. His crops are destroyed by hailstorm. He writes a letter to God asking for 100 pesos. Post office employees are moved by his faith and collect 70 pesos. Lencho receives the money but thinks the post office employees stole 30 pesos. He writes another letter asking God to send the remaining money but not through the mail. Theme: Unshakeable faith in God. Irony: The very people who helped him are accused by him. The story shows the contrast between blind faith and human goodness.`
      },
      {
        id: 'eng-2', title: 'Nelson Mandela: Long Walk to Freedom',
        content: `This is an excerpt from Nelson Mandela's autobiography. It describes his inauguration as the first black President of South Africa on May 10, 1994. Mandela reflects on the long struggle against apartheid. He talks about the twin obligations every man has: to his family and to his people. The policy of apartheid created a deep wound in South Africa. Mandela was imprisoned for 27 years on Robben Island. He believed that courage is not the absence of fear but the triumph over it. The story emphasizes that no one is born hating another person — hatred is learned and so love can be taught.`
      },
      {
        id: 'eng-3', title: 'Two Stories About Flying',
        content: `Part 1 - "His First Flight" by Liam O'Flaherty: A young seagull is afraid to fly. His family tries to encourage him but he refuses. Finally, hunger drives him to make his first flight. He discovers he can fly. Theme: Overcoming fear, courage, self-belief. Part 2 - "Black Aeroplane" by Frederick Forsyth: A pilot is flying from Paris to England at night. He encounters a storm and a mysterious black aeroplane guides him to safety. When he lands, the control room has no record of the black plane. Theme: Mystery, trust, gratitude. Both stories deal with the theme of facing fears and taking risks.`
      },
      {
        id: 'eng-4', title: 'From the Diary of Anne Frank',
        content: `Anne Frank was a Jewish girl who hid with her family in Amsterdam during Nazi occupation (1942-1944). She kept a diary addressing it to an imaginary friend "Kitty." She writes about her longing for a true friend, her relationship with her mother, and her observations about people. The diary was found after the war by her father Otto Frank, the only survivor. Anne believed that people are good at heart despite the horrors she witnessed. The diary is a testament to the human spirit. Anne died in Bergen-Belsen concentration camp in 1945 at age 15. The diary was published as "The Diary of a Young Girl."`
      },
      {
        id: 'eng-5', title: 'The Hundred Dresses',
        content: `"The Hundred Dresses" by Eleanor Estes is about Wanda Petronski, a Polish girl in an American school. She is poor and wears the same faded blue dress every day. She claims to have a hundred dresses at home. Maddie and Peggy tease her. Wanda wins the drawing contest with her hundred dress designs. She moves away before the results. Maddie feels guilty and writes a letter with Peggy. Wanda replies warmly. Theme: Bullying, empathy, social exclusion, guilt, and redemption. The story teaches us to be sensitive to others' feelings and not to participate in or ignore bullying.`
      },
    ]
  },
}

// Online tests data
export const ONLINE_TESTS = [
  {
    id: 'test-1',
    subject: 'Mathematics',
    chapter: 'Quadratic Equations',
    title: 'Chapter Test — Quadratic Equations',
    duration: 20, // minutes
    totalMarks: 20,
    status: 'pending', // pending | completed
    questions: [
      {
        id: 'q1', type: 'mcq',
        question: 'Which of the following is a quadratic equation?',
        options: ['x³ + 2x + 1 = 0', 'x² + 3x + 2 = 0', '2x + 5 = 0', '1/x + 3 = 0'],
        correct: 1, marks: 2,
        explanation: 'A quadratic equation has degree 2. x² + 3x + 2 = 0 has the highest power of x as 2.'
      },
      {
        id: 'q2', type: 'mcq',
        question: 'The discriminant of 2x² - 4x + 3 = 0 is:',
        options: ['8', '-8', '4', '-4'],
        correct: 1, marks: 2,
        explanation: 'D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8'
      },
      {
        id: 'q3', type: 'mcq',
        question: 'If the roots of x² - 5x + 6 = 0 are α and β, then α + β = ?',
        options: ['6', '-5', '5', '-6'],
        correct: 2, marks: 2,
        explanation: 'Sum of roots = -b/a = -(-5)/1 = 5'
      },
      {
        id: 'q4', type: 'mcq',
        question: 'The roots of x² - 4 = 0 are:',
        options: ['2, 2', '-2, -2', '2, -2', '4, -4'],
        correct: 2, marks: 2,
        explanation: 'x² = 4, so x = ±2. The roots are 2 and -2.'
      },
      {
        id: 'q5', type: 'mcq',
        question: 'For equal roots, the discriminant must be:',
        options: ['> 0', '< 0', '= 0', '≥ 0'],
        correct: 2, marks: 2,
        explanation: 'When D = 0, the quadratic equation has two equal real roots.'
      },
      {
        id: 'q6', type: 'descriptive',
        question: 'Solve the quadratic equation x² - 5x + 6 = 0 by factorization method.',
        marks: 5,
        sampleAnswer: 'x² - 5x + 6 = 0 → x² - 3x - 2x + 6 = 0 → x(x-3) - 2(x-3) = 0 → (x-2)(x-3) = 0 → x = 2 or x = 3',
        explanation: 'Find two numbers whose sum is -5 and product is 6. Those are -2 and -3.'
      },
      {
        id: 'q7', type: 'descriptive',
        question: 'Find the nature of roots of 3x² - 4√3x + 4 = 0.',
        marks: 5,
        sampleAnswer: 'D = b² - 4ac = (4√3)² - 4(3)(4) = 48 - 48 = 0. Since D = 0, the equation has two equal real roots.',
        explanation: 'Calculate discriminant D = b² - 4ac and interpret based on its sign.'
      },
    ]
  },
  {
    id: 'test-2',
    subject: 'Science',
    chapter: 'Acids, Bases and Salts',
    title: 'Unit Test — Acids, Bases and Salts',
    duration: 15,
    totalMarks: 15,
    status: 'pending',
    questions: [
      {
        id: 'q1', type: 'mcq',
        question: 'What is the pH of a neutral solution?',
        options: ['0', '7', '14', '1'],
        correct: 1, marks: 2,
        explanation: 'A neutral solution has pH = 7. Acids have pH < 7 and bases have pH > 7.'
      },
      {
        id: 'q2', type: 'mcq',
        question: 'Which of the following is a strong acid?',
        options: ['Acetic acid', 'Carbonic acid', 'Hydrochloric acid', 'Citric acid'],
        correct: 2, marks: 2,
        explanation: 'HCl (Hydrochloric acid) is a strong acid that completely dissociates in water.'
      },
      {
        id: 'q3', type: 'mcq',
        question: 'Baking soda is chemically known as:',
        options: ['Na₂CO₃', 'NaHCO₃', 'NaCl', 'NaOH'],
        correct: 1, marks: 2,
        explanation: 'Baking soda is sodium bicarbonate (NaHCO₃). Washing soda is Na₂CO₃.'
      },
      {
        id: 'q4', type: 'mcq',
        question: 'The color of litmus in acidic solution is:',
        options: ['Blue', 'Green', 'Red', 'Yellow'],
        correct: 2, marks: 2,
        explanation: 'Litmus turns red in acidic solution and blue in basic solution.'
      },
      {
        id: 'q5', type: 'descriptive',
        question: 'What happens when an acid reacts with a base? Write the general equation.',
        marks: 7,
        sampleAnswer: 'When an acid reacts with a base, a neutralization reaction occurs producing salt and water. General equation: Acid + Base → Salt + Water. Example: HCl + NaOH → NaCl + H₂O',
        explanation: 'This is called a neutralization reaction. The H⁺ from acid combines with OH⁻ from base to form water.'
      },
    ]
  },
  {
    id: 'test-3',
    subject: 'Social',
    chapter: 'Resources and Development',
    title: 'Quiz — Resources and Development',
    duration: 10,
    totalMarks: 10,
    status: 'completed',
    score: 8,
    questions: [
      {
        id: 'q1', type: 'mcq',
        question: 'Which type of resource is solar energy?',
        options: ['Non-renewable', 'Renewable', 'Biotic', 'Human-made'],
        correct: 1, marks: 2,
        explanation: 'Solar energy is a renewable resource as it is continuously replenished by nature.'
      },
      {
        id: 'q2', type: 'mcq',
        question: 'Laterite soil is found mainly in:',
        options: ['Punjab', 'Rajasthan', 'Kerala and Karnataka', 'West Bengal'],
        correct: 2, marks: 2,
        explanation: 'Laterite soil is found in areas with high temperature and heavy rainfall like Kerala, Karnataka, and parts of Odisha.'
      },
      {
        id: 'q3', type: 'mcq',
        question: 'Which soil is best for cotton cultivation?',
        options: ['Alluvial soil', 'Black soil', 'Red soil', 'Laterite soil'],
        correct: 1, marks: 2,
        explanation: 'Black soil (regur soil) is ideal for cotton cultivation as it retains moisture well.'
      },
      {
        id: 'q4', type: 'mcq',
        question: 'Terrace farming is practiced to:',
        options: ['Increase soil fertility', 'Prevent soil erosion', 'Improve drainage', 'Increase crop yield'],
        correct: 1, marks: 2,
        explanation: 'Terrace farming is done on hill slopes to prevent soil erosion by reducing water runoff.'
      },
      {
        id: 'q5', type: 'mcq',
        question: 'The Rio Earth Summit was held in:',
        options: ['1990', '1992', '1995', '2000'],
        correct: 1, marks: 2,
        explanation: 'The Rio Earth Summit (UN Conference on Environment and Development) was held in 1992 in Rio de Janeiro, Brazil.'
      },
    ]
  },
]

