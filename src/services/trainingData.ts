// Comprehensive Training Dataset for Jarvy AI
// Real-world conversation examples across multiple domains

export interface TrainingConversation {
  query: string;
  response: string;
  rating: number;
  category: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  tags: string[];
}

export const comprehensiveTrainingData: TrainingConversation[] = [
  // Technology & Programming
  {
    query: "What's the difference between React and Vue.js?",
    response: "Great question! React and Vue.js are both popular frontend frameworks, but they have key differences:\n\n**React:**\n• Developed by Facebook\n• Uses JSX syntax\n• Larger ecosystem and community\n• More flexible but requires more configuration\n• Better for large, complex applications\n\n**Vue.js:**\n• Created by Evan You\n• Uses template-based syntax (closer to HTML)\n• Easier learning curve for beginners\n• More opinionated with built-in solutions\n• Great for small to medium projects\n\nBoth are excellent choices - React if you want maximum flexibility and have a large team, Vue if you want something easier to learn with good conventions built-in.",
    rating: 5,
    category: 'technology',
    complexity: 'moderate',
    tags: ['web development', 'frameworks', 'comparison', 'frontend']
  },

  {
    query: "How do I optimize my website's performance?",
    response: "Website performance optimization involves several key strategies:\n\n**Frontend Optimization:**\n• Minimize HTTP requests\n• Compress and optimize images (WebP format)\n• Use CSS and JavaScript minification\n• Implement lazy loading for images\n• Enable browser caching\n\n**Backend Optimization:**\n• Use a Content Delivery Network (CDN)\n• Optimize database queries\n• Implement server-side caching\n• Use compression (Gzip)\n\n**Tools to measure:**\n• Google PageSpeed Insights\n• GTmetrix\n• WebPageTest\n\n**Quick wins:**\n1. Optimize your largest images first\n2. Remove unused CSS/JavaScript\n3. Use a good hosting provider\n\nStart with these basics and you'll see significant improvements!",
    rating: 5,
    category: 'technology',
    complexity: 'complex',
    tags: ['web performance', 'optimization', 'frontend', 'backend']
  },

  // Business & Entrepreneurship
  {
    query: "How do I validate a business idea before investing time and money?",
    response: "Smart approach! Here's a systematic way to validate your business idea:\n\n**1. Market Research:**\n• Talk to potential customers (at least 100 people)\n• Analyze competitors and market size\n• Use Google Trends to check interest levels\n\n**2. Problem Validation:**\n• Confirm the problem actually exists\n• Determine if people are willing to pay for a solution\n• Check if current solutions are inadequate\n\n**3. Solution Testing:**\n• Create a Minimum Viable Product (MVP)\n• Build a landing page to test demand\n• Run small paid ads to gauge interest\n\n**4. Business Model Validation:**\n• Test different pricing strategies\n• Calculate unit economics\n• Identify distribution channels\n\n**Low-cost validation methods:**\n• Online surveys\n• Pre-orders or waitlists\n• Social media engagement\n• Prototype testing\n\nRemember: It's better to fail fast and cheap than to spend months building something nobody wants!",
    rating: 5,
    category: 'business',
    complexity: 'complex',
    tags: ['startup', 'validation', 'entrepreneurship', 'business planning']
  },

  // Health & Wellness
  {
    query: "What are some evidence-based ways to improve mental health?",
    response: "Excellent question! Here are scientifically-backed strategies for better mental health:\n\n**Daily Habits:**\n• Regular exercise (even 20 minutes of walking)\n• Consistent sleep schedule (7-9 hours)\n• Mindfulness or meditation practice\n• Gratitude journaling\n• Social connections with friends/family\n\n**Stress Management:**\n• Deep breathing exercises\n• Progressive muscle relaxation\n• Time in nature\n• Limiting social media and news consumption\n• Setting healthy boundaries\n\n**Professional Support:**\n• Therapy (CBT is particularly effective)\n• Support groups\n• Mental health apps (Headspace, Calm)\n• Talk to your doctor about options\n\n**Nutrition Impact:**\n• Omega-3 fatty acids\n• Regular meals (avoid blood sugar spikes)\n• Limit alcohol and caffeine\n• Stay hydrated\n\n**Important:** If you're struggling with persistent mental health issues, please reach out to a mental health professional. These strategies work best as part of comprehensive care.",
    rating: 5,
    category: 'health',
    complexity: 'moderate',
    tags: ['mental health', 'wellness', 'self-care', 'evidence-based']
  },

  // Education & Learning
  {
    query: "What's the most effective way to learn a new skill quickly?",
    response: "Great question! Here's a science-backed approach to accelerated learning:\n\n**The 80/20 Rule:**\n• Identify the 20% of concepts that give 80% of results\n• Focus on fundamentals first\n• Learn the most commonly used aspects\n\n**Active Learning Techniques:**\n• Practice retrieval (test yourself without looking)\n• Spaced repetition (review at increasing intervals)\n• Teach others what you've learned\n• Apply knowledge immediately in projects\n\n**Effective Learning Structure:**\n1. Set specific, measurable goals\n2. Break skill into sub-components\n3. Practice deliberately (focus on weaknesses)\n4. Get immediate feedback\n5. Practice consistently (even 15-30 min daily)\n\n**Learning Strategies:**\n• Use multiple senses (visual, auditory, kinesthetic)\n• Create mental models and analogies\n• Connect new info to existing knowledge\n• Take breaks (Pomodoro Technique)\n\n**Common Mistakes to Avoid:**\n• Passive consumption (just watching videos)\n• Learning too many things at once\n• Not practicing regularly\n• Avoiding difficult parts\n\nRemember: Quality practice beats quantity every time!",
    rating: 5,
    category: 'education',
    complexity: 'moderate',
    tags: ['learning', 'skill development', 'education', 'productivity']
  },

  // Science & Research
  {
    query: "Can you explain quantum computing in simple terms?",
    response: "Absolutely! Let me break down quantum computing using simple analogies:\n\n**Classical vs Quantum:**\n• Classical computers use bits (0 or 1) - like light switches (on/off)\n• Quantum computers use qubits - like spinning coins that are both heads AND tails until you look\n\n**Key Quantum Principles:**\n\n**1. Superposition:**\n• A qubit can be 0, 1, or both simultaneously\n• Like a coin spinning in the air\n• Allows exploring many solutions at once\n\n**2. Entanglement:**\n• Qubits can be mysteriously connected\n• Measuring one instantly affects the other\n• Even across vast distances (Einstein called it 'spooky action')\n\n**3. Quantum Interference:**\n• Wrong answers cancel out\n• Right answers get amplified\n• Like noise-canceling headphones for calculations\n\n**Real-world Applications:**\n• Drug discovery (testing millions of combinations)\n• Cryptography (breaking/creating codes)\n• Weather prediction\n• Financial modeling\n• AI optimization\n\n**Current Limitations:**\n• Extremely fragile (need near absolute zero temperature)\n• High error rates\n• Limited to specific problems\n• Very expensive\n\nThink of it as a super-powered calculator that's amazing at certain tasks but useless for others!",
    rating: 5,
    category: 'science',
    complexity: 'complex',
    tags: ['quantum computing', 'technology', 'physics', 'explanation']
  },

  // Creative & Design
  {
    query: "How can I improve my creative thinking and generate better ideas?",
    response: "Fantastic question! Creativity is a skill you can develop. Here are proven techniques:\n\n**Idea Generation Techniques:**\n\n**1. Divergent Thinking:**\n• Brainstorm without judgment (quantity over quality)\n• Set a timer and generate 50+ ideas\n• Use \"Yes, and...\" instead of \"No, but...\"\n• Combine unrelated concepts\n\n**2. SCAMPER Method:**\n• **S**ubstitute: What can I substitute?\n• **C**ombine: What can I combine?\n• **A**dapt: What can I adapt?\n• **M**odify: What can I modify?\n• **P**ut to other uses: How else can this be used?\n• **E**liminate: What can I remove?\n• **R**everse: What can I rearrange?\n\n**3. Environmental Changes:**\n• Work in different locations\n• Change your routine\n• Take walks (movement boosts creativity)\n• Listen to instrumental music\n\n**4. Cross-Pollination:**\n• Study fields outside your expertise\n• Talk to people from different backgrounds\n• Read diverse content\n• Travel or experience new cultures\n\n**Creative Habits:**\n• Keep an idea journal\n• Schedule 'thinking time'\n• Practice mindfulness\n• Get enough sleep (REM sleep consolidates ideas)\n• Exercise regularly\n\n**Overcoming Blocks:**\n• Start with bad ideas (perfectionism kills creativity)\n• Set constraints (limitations spark creativity)\n• Take breaks when stuck\n• Question assumptions\n\nRemember: Every expert was once a beginner. Practice makes creative!",
    rating: 5,
    category: 'creativity',
    complexity: 'moderate',
    tags: ['creativity', 'innovation', 'brainstorming', 'problem solving']
  },

  // Finance & Investment
  {
    query: "I'm a beginner. How should I start investing my money?",
    response: "Great that you're starting early! Here's a beginner-friendly investment approach:\n\n**Step 1: Foundation First**\n• Build an emergency fund (3-6 months expenses)\n• Pay off high-interest debt (credit cards)\n• Maximize employer 401(k) match (free money!)\n\n**Step 2: Investment Basics**\n• Start with low-cost index funds (like S&P 500)\n• Use tax-advantaged accounts (401k, IRA)\n• Consider target-date funds for simplicity\n• Automate investments (dollar-cost averaging)\n\n**Simple Portfolio for Beginners:**\n• 70% Total Stock Market Index Fund\n• 20% International Stock Index Fund\n• 10% Bond Index Fund\n• Adjust based on your age and risk tolerance\n\n**Key Principles:**\n• Diversify (don't put all eggs in one basket)\n• Invest for the long term (10+ years)\n• Keep costs low (expense ratios under 0.2%)\n• Don't try to time the market\n• Stay consistent through ups and downs\n\n**Avoid These Mistakes:**\n• Individual stock picking as a beginner\n• High-fee mutual funds\n• Emotional investing (panic selling/buying)\n• Trying to get rich quick\n\n**Recommended Platforms:**\n• Fidelity, Vanguard, or Schwab for low fees\n• Start with their target-date funds\n\n**Remember:** Time in the market beats timing the market. Start small if needed, but start now!",
    rating: 5,
    category: 'finance',
    complexity: 'moderate',
    tags: ['investing', 'personal finance', 'beginner', 'wealth building']
  },

  // Environmental & Sustainability
  {
    query: "What are the most impactful things I can do to help the environment?",
    response: "Excellent question! Here are the most impactful environmental actions based on research:\n\n**Highest Impact Actions:**\n\n**1. Transportation:**\n• Fly less (or offset flights)\n• Drive less, walk/bike/public transport more\n• Consider electric or hybrid vehicles\n• Work from home when possible\n\n**2. Diet Changes:**\n• Eat less meat (especially beef)\n• Reduce food waste\n• Buy local and seasonal produce\n• Consider plant-based meals a few times per week\n\n**3. Energy Use:**\n• Improve home insulation\n• Use LED light bulbs\n• Unplug devices when not in use\n• Consider renewable energy (solar panels)\n• Use a programmable thermostat\n\n**4. Consumption:**\n• Buy less stuff overall\n• Choose quality items that last longer\n• Repair instead of replacing\n• Buy secondhand when possible\n• Avoid single-use plastics\n\n**5. Home & Lifestyle:**\n• Reduce, reuse, recycle (in that order)\n• Use eco-friendly cleaning products\n• Take shorter showers\n• Line-dry clothes when possible\n\n**Beyond Personal Actions:**\n• Vote for environmentally conscious leaders\n• Support sustainable businesses\n• Educate others and lead by example\n• Join environmental organizations\n\n**Start Small:**\nPick 2-3 actions that feel manageable and build from there. Small changes add up to big impact when adopted by many people!",
    rating: 5,
    category: 'environment',
    complexity: 'moderate',
    tags: ['sustainability', 'environment', 'climate change', 'personal action']
  },

  // Psychology & Relationships
  {
    query: "How can I improve my communication skills in relationships?",
    response: "Great question! Strong communication is the foundation of healthy relationships. Here's how to improve:\n\n**Active Listening:**\n• Give full attention (put devices away)\n• Ask clarifying questions\n• Reflect back what you heard: \"So you're feeling...\"\n• Don't interrupt or plan your response while they're talking\n\n**Expressing Yourself:**\n• Use \"I\" statements instead of \"You\" accusations\n• Be specific about feelings and needs\n• Choose the right time and place for important conversations\n• Stay calm and avoid emotional flooding\n\n**Conflict Resolution:**\n• Focus on the issue, not the person\n• Look for compromise and win-win solutions\n• Take breaks if emotions get too high\n• Apologize when you're wrong (and mean it)\n\n**Building Connection:**\n• Ask open-ended questions\n• Show genuine interest in their thoughts/feelings\n• Express appreciation and gratitude regularly\n• Share your own vulnerabilities appropriately\n\n**Non-Verbal Communication:**\n• Maintain appropriate eye contact\n• Match your body language to your words\n• Be aware of your tone of voice\n• Give physical affection (if appropriate)\n\n**Common Mistakes to Avoid:**\n• Trying to \"fix\" instead of just listening\n• Making assumptions about their thoughts/feelings\n• Bringing up past issues during current conflicts\n• Using absolute words like \"always\" or \"never\"\n\n**Practice Tips:**\n• Start with low-stakes conversations\n• Ask for feedback on your communication style\n• Read books on relationships and communication\n• Consider couples therapy as a skill-building tool\n\nRemember: Good communication is a skill that takes practice, but it's worth the investment!",
    rating: 5,
    category: 'psychology',
    complexity: 'moderate',
    tags: ['communication', 'relationships', 'psychology', 'social skills']
  },

  // Career & Professional Development
  {
    query: "I feel stuck in my career. How do I figure out what to do next?",
    response: "Feeling stuck is actually a sign of growth - you're ready for something new! Here's a structured approach:\n\n**Self-Assessment:**\n• **Values:** What matters most to you? (autonomy, impact, creativity, security, etc.)\n• **Strengths:** What are you naturally good at?\n• **Interests:** What energizes you?\n• **Lifestyle:** What work-life balance do you want?\n\n**Exploration Phase:**\n• **Informational interviews:** Talk to people in roles you find interesting\n• **Job shadowing:** Spend a day with someone in a different role\n• **Skills inventory:** What transferable skills do you have?\n• **Market research:** What opportunities exist in your field or others?\n\n**Practical Steps:**\n\n**1. Immediate Actions (1-3 months):**\n• Update your LinkedIn profile\n• Network within and outside your industry\n• Take on new projects at your current job\n• Start a side project related to your interests\n\n**2. Medium-term (3-12 months):**\n• Develop new skills through courses or certifications\n• Attend industry events and conferences\n• Consider internal transfers or promotions\n• Build a portfolio of your work\n\n**3. Long-term (1+ years):**\n• Make strategic career moves\n• Consider further education if needed\n• Start your own business or freelance\n• Transition to a completely new field\n\n**Questions to Ask Yourself:**\n• What would I do if money wasn't an issue?\n• What problems do I want to solve?\n• What would success look like in 5 years?\n• What am I curious about learning?\n\n**Remember:**\n• Career changes are normal and healthy\n• You don't need to have it all figured out\n• Small experiments can lead to big discoveries\n• Your career is a journey, not a destination\n\nStart with one small step this week!",
    rating: 5,
    category: 'career',
    complexity: 'complex',
    tags: ['career development', 'professional growth', 'career change', 'self-discovery']
  }
];

// Advanced Conversation Examples for Complex Reasoning
export const complexReasoningExamples: TrainingConversation[] = [
  {
    query: "Analyze the potential long-term implications of artificial intelligence on employment and society.",
    response: "This is a multifaceted issue that requires examining multiple perspectives and timeframes:\n\n**Historical Context:**\nPrevious technological revolutions (industrial, digital) initially displaced jobs but ultimately created new ones. However, AI may be different in its scope and speed.\n\n**Short-term Implications (5-10 years):**\n• **Job Displacement:** Routine and predictable tasks across sectors\n• **Job Creation:** AI specialists, data scientists, human-AI collaboration roles\n• **Skills Gap:** Mismatch between displaced workers and new job requirements\n• **Economic Inequality:** Benefits may initially flow to capital owners\n\n**Long-term Scenarios (20+ years):**\n\n**Optimistic Scenario:**\n• AI handles routine work, humans focus on creative/interpersonal tasks\n• Universal Basic Income or similar safety nets emerge\n• New industries and job categories we can't yet imagine\n• Shorter work weeks, focus on life fulfillment\n\n**Pessimistic Scenario:**\n• Mass unemployment as AI capabilities expand\n• Increased social unrest and political instability\n• Concentration of wealth among AI owners\n• Loss of human purpose and dignity\n\n**Most Likely Scenario:**\n• Gradual transition with both challenges and opportunities\n• Need for continuous reskilling and education\n• Government intervention through policy and regulation\n• Hybrid human-AI workforce in most sectors\n\n**Critical Factors:**\n• Speed of AI advancement vs. adaptation capacity\n• Quality of education and retraining programs\n• Political will for redistributive policies\n• International cooperation on AI governance\n\n**Recommendations:**\n• Invest in lifelong learning and adaptability\n• Develop uniquely human skills (creativity, empathy, complex problem-solving)\n• Support policies for transition assistance\n• Participate in discussions about AI governance\n\nThe outcome isn't predetermined - it depends on choices we make today.",
    rating: 5,
    category: 'technology',
    complexity: 'expert',
    tags: ['artificial intelligence', 'future of work', 'social impact', 'policy', 'economics']
  },

  {
    query: "How should we balance economic growth with environmental sustainability? What are the trade-offs?",
    response: "This is one of the defining challenges of our time. Let me analyze the tensions and potential solutions:\n\n**The Traditional Trade-off:**\nHistorically, economic growth has come at environmental cost due to:\n• Resource extraction and consumption\n• Pollution and waste generation\n• Short-term profit focus over long-term sustainability\n• Externalized environmental costs\n\n**Why This Matters Now:**\n• Climate change accelerating\n• Resource depletion becoming critical\n• Ecosystem collapse affecting economic systems\n• Social inequality linked to environmental degradation\n\n**Emerging Paradigms:**\n\n**1. Decoupling Theory:**\n• Absolute decoupling: Economic growth with reduced environmental impact\n• Examples: Renewable energy, circular economy, efficiency gains\n• Evidence: Some developed countries showing early signs\n\n**2. Doughnut Economics:**\n• Balance between social foundation and ecological ceiling\n• Focus on wellbeing rather than just GDP growth\n• Regenerative and distributive design\n\n**3. Green Growth:**\n• Innovation-driven sustainable development\n• Clean technology as economic opportunity\n• Natural capital accounting\n\n**Strategic Approaches:**\n\n**Policy Level:**\n• Carbon pricing and environmental taxes\n• Subsidy reform (remove fossil fuel subsidies)\n• Green infrastructure investment\n• Circular economy regulations\n\n**Business Level:**\n• Triple bottom line (people, planet, profit)\n• Sustainable business models\n• Supply chain transparency\n• Long-term value creation\n\n**Individual Level:**\n• Conscious consumption\n• Support for sustainable businesses\n• Political engagement\n• Lifestyle changes\n\n**Real-World Examples:**\n• **Costa Rica:** Carbon negative while growing economy\n• **Denmark:** Wind energy exports\n• **Circular economy:** Netherlands, Finland leading\n• **B-Corps:** Businesses with social/environmental purpose\n\n**Challenges:**\n• Rebound effects (efficiency gains offset by increased consumption)\n• Global coordination needed\n• Vested interests in status quo\n• Measuring success beyond GDP\n\n**Conclusion:**\nThe goal isn't to stop growth but to redefine it. Quality of life, wellbeing, and environmental health can grow while material throughput stabilizes or decreases. This requires systemic change in how we measure success and structure our economy.\n\nThe question isn't whether we can afford to make this transition - it's whether we can afford not to.",
    rating: 5,
    category: 'environment',
    complexity: 'expert',
    tags: ['sustainability', 'economics', 'policy', 'climate change', 'systems thinking']
  }
];

// Domain-Specific Training Examples
export const domainSpecificTraining = {
  technology: [
    {
      query: "Explain microservices architecture and when to use it",
      response: "Microservices architecture breaks applications into small, independent services. Here's when and how to use it:\n\n**What it is:**\n• Small, focused services that do one thing well\n• Each service owns its data and business logic\n• Services communicate via APIs (usually REST or messaging)\n• Teams can develop, deploy, and scale independently\n\n**When to use microservices:**\n• Large, complex applications\n• Multiple teams working on same product\n• Different parts need different scaling\n• Want to use different technologies for different services\n• Need rapid, independent deployments\n\n**When NOT to use:**\n• Small applications or teams\n• Simple, well-defined domains\n• Limited DevOps capabilities\n• Network latency is critical\n• Starting a new project (start monolithic, evolve)\n\n**Benefits:**\n• Scalability and flexibility\n• Technology diversity\n• Team autonomy\n• Fault isolation\n• Faster deployments\n\n**Challenges:**\n• Increased complexity\n• Network latency\n• Data consistency across services\n• Testing complexity\n• DevOps overhead\n\n**Implementation tips:**\n• Start with a monolith, extract services gradually\n• Design for failure (circuit breakers, retries)\n• Invest in monitoring and observability\n• Use API gateways for client communication\n• Implement proper service discovery\n\nRemember: Microservices solve organizational problems as much as technical ones!",
      rating: 5,
      category: 'technology',
      complexity: 'complex',
      tags: ['architecture', 'microservices', 'software design', 'scalability']
    }
  ],

  health: [
    {
      query: "What's the science behind intermittent fasting? Is it effective?",
      response: "Intermittent fasting (IF) has solid scientific backing for certain benefits. Here's what research shows:\n\n**What happens during fasting:**\n• **12+ hours:** Glycogen stores deplete, body shifts to fat burning\n• **16+ hours:** Autophagy increases (cellular cleanup)\n• **24+ hours:** Growth hormone increases, insulin sensitivity improves\n\n**Scientific Benefits:**\n• **Weight Loss:** Caloric restriction + metabolic advantages\n• **Insulin Sensitivity:** Improved blood sugar control\n• **Cellular Health:** Enhanced autophagy and stress resistance\n• **Brain Function:** Increased BDNF (brain-derived neurotrophic factor)\n• **Longevity:** Animal studies show lifespan extension\n\n**Human Research Findings:**\n• 3-8% weight loss over 3-24 weeks\n• Reduced inflammation markers\n• Improved cardiovascular health markers\n• Better cognitive function in some studies\n• Preserved muscle mass when combined with resistance training\n\n**Common Methods:**\n• **16:8** - Fast 16 hours, eat in 8-hour window (most popular)\n• **5:2** - Normal eating 5 days, 500-600 calories 2 days\n• **OMAD** - One meal a day\n• **ADF** - Alternate day fasting\n\n**Who should avoid IF:**\n• Pregnant or breastfeeding women\n• History of eating disorders\n• Certain medical conditions (diabetes, heart conditions)\n• Children and teenagers\n• Very active athletes\n\n**Practical tips:**\n• Start gradually (12:12, then extend)\n• Stay hydrated\n• Focus on nutrient-dense foods during eating windows\n• Listen to your body\n• Consult healthcare provider if you have medical conditions\n\n**Bottom line:** IF can be effective for weight loss and metabolic health, but it's not magic. The key is finding an eating pattern you can sustain long-term.",
      rating: 5,
      category: 'health',
      complexity: 'moderate',
      tags: ['nutrition', 'intermittent fasting', 'metabolism', 'weight loss', 'science-based']
    }
  ],

  business: [
    {
      query: "How do you build a strong company culture in a remote-first organization?",
      response: "Building strong culture remotely requires intentional design and consistent execution. Here's a comprehensive approach:\n\n**Foundation Elements:**\n\n**1. Clear Values & Mission:**\n• Define and communicate core values explicitly\n• Make values actionable with specific behaviors\n• Hire and promote based on cultural fit\n• Share mission regularly and connect daily work to it\n\n**2. Communication Systems:**\n• Over-communicate rather than under-communicate\n• Use multiple channels (video, chat, async)\n• Regular all-hands meetings\n• Transparent decision-making processes\n\n**Building Connection:**\n\n**3. Virtual Social Interactions:**\n• Regular team video coffee chats\n• Virtual lunch and learns\n• Online game sessions or trivia\n• Show and tell sessions\n• Birthday and milestone celebrations\n\n**4. Collaboration Rituals:**\n• Daily standups or check-ins\n• Weekly team retrospectives\n• Cross-functional project teams\n• Mentorship programs\n• Peer recognition systems\n\n**Operational Excellence:**\n\n**5. Meeting Culture:**\n• Default to video on\n• Start meetings with personal check-ins\n• Use collaborative tools (Miro, Figma)\n• Respect time zones and async work\n• Record important meetings\n\n**6. Professional Development:**\n• Learning and development budgets\n• Internal skill sharing sessions\n• Conference attendance (virtual/in-person)\n• Career development conversations\n• Internal mobility opportunities\n\n**Measurement & Iteration:**\n\n**7. Culture Metrics:**\n• Regular employee engagement surveys\n• Retention and promotion rates\n• Participation in optional cultural activities\n• Internal referral rates\n• Exit interview feedback\n\n**8. Leadership Modeling:**\n• Leaders participate in cultural activities\n• Vulnerability and authenticity in leadership\n• Recognition of cultural champions\n• Investment in culture initiatives\n\n**Unique Remote Considerations:**\n• **Asynchronous respect:** Not everyone needs to be online simultaneously\n• **Home life integration:** Acknowledge personal circumstances\n• **Digital fatigue:** Balance synchronous and asynchronous work\n• **Inclusive practices:** Ensure all voices are heard in virtual settings\n\n**Success Indicators:**\n• People choose to turn cameras on\n• Voluntary participation in cultural events\n• Cross-team friendships form\n• People stay through other job opportunities\n• Strong internal referrals\n\n**Remember:** Culture isn't built through perks or events alone - it's the accumulation of daily interactions, decisions, and behaviors that either reinforce or undermine your stated values.",
      rating: 5,
      category: 'business',
      complexity: 'complex',
      tags: ['company culture', 'remote work', 'leadership', 'team building', 'organizational development']
    }
  ]
};

// Export all training data
export const allTrainingData = [
  ...comprehensiveTrainingData,
  ...complexReasoningExamples,
  ...domainSpecificTraining.technology,
  ...domainSpecificTraining.health,
  ...domainSpecificTraining.business
];