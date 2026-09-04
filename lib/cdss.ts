export type GroupKey = "groupA" | "groupB" | "groupC" | "groupD";

export interface Question {
  id: string;
  text: string;
}

export interface QuestionGroup {
  label: string;
  icon: string;
  weight: number;
  questions: Question[];
}

export const KNOWLEDGE_BASE: Record<GroupKey, QuestionGroup> = {
  groupA: {
    label: "Urinary Symptoms",
    icon: "💧",
    weight: 3,
    questions: [
      {
        id: "a1",
        text: "Incomplete emptying: felt as though the bladder did not empty completely after urination",
      },
      {
        id: "a2",
        text: "Frequency: needed to urinate again less than 2 hours after last urination",
      },
      {
        id: "a3",
        text: "Intermittency: stopped and started again several times during urination",
      },
      {
        id: "a4",
        text: "Urgency: found it difficult to postpone urination when you felt the urge",
      },
      {
        id: "a5",
        text: "Weak stream: noticed that the urine stream was weak or reduced in force",
      },
      { id: "a6", text: "Straining: had to push or strain to begin urination" },
      {
        id: "a7",
        text: "Nocturia: needed to get up to urinate 2 or more times during the night",
      },
    ],
  },
  groupB: {
    label: "Systemic Symptoms",
    icon: "⚠️",
    weight: 4,
    questions: [
      {
        id: "b1",
        text: "Blood in urine (haematuria) — visible pink, red, or brown discolouration of urine",
      },
      { id: "b2", text: "Blood in semen (haematospermia)" },
      {
        id: "b3",
        text: "Unexplained significant weight loss in the past 3 months",
      },
      {
        id: "b4",
        text: "Persistent fatigue or unusual tiredness not explained by activity",
      },
      {
        id: "b5",
        text: "Swelling in the legs or feet that is not explained by injury",
      },
    ],
  },
  groupC: {
    label: "Pain Indicators",
    icon: "🔴",
    weight: 4,
    questions: [
      {
        id: "c1",
        text: "Persistent pain or stiffness in the lower back, hips, or pelvis",
      },
      {
        id: "c2",
        text: "Pain or burning sensation during urination (dysuria)",
      },
      {
        id: "c3",
        text: "Pain or discomfort in the perineal area (between scrotum and rectum)",
      },
      {
        id: "c4",
        text: "Bone pain or tenderness, especially in the back, hips, or ribs",
      },
      { id: "c5", text: "Painful ejaculation" },
    ],
  },
  groupD: {
    label: "Risk Factors",
    icon: "📊",
    weight: 2,
    questions: [
      {
        id: "d1",
        text: "Age 50 years or older (or age 40+ with a first-degree relative with prostate cancer)",
      },
      {
        id: "d2",
        text: "Father, brother, or son diagnosed with prostate cancer",
      },
      { id: "d3", text: "African or African-descent ancestry" },
      {
        id: "d4",
        text: "Previously elevated PSA (Prostate Specific Antigen) result reported by a doctor",
      },
      {
        id: "d5",
        text: "Previous abnormal digital rectal examination (DRE) result",
      },
      {
        id: "d6",
        text: "Diet consistently high in red meat and low in fruits and vegetables",
      },
      {
        id: "d7",
        text: "History of other cancers in the family (breast, colorectal)",
      },
    ],
  },
};

export interface RiskTier {
  tier: "urgent" | "high" | "moderate" | "low";
  label: string;
  min: number;
  color: string;
  bgClass: string;
  icon: string;
  summary: string;
  recommendation: string;
  urgency: string;
}

export const RISK_TIERS: RiskTier[] = [
  {
    tier: "urgent",
    label: "Urgent",
    min: 75,
    color: "#C0392B",
    bgClass: "urgent",
    icon: "🚨",
    summary:
      "Your responses indicate a pattern of symptoms that requires urgent clinical attention.",
    recommendation:
      "You should seek an immediate appointment at the ABUTH Urology or Oncology department. Do not delay. Bring this assessment report with you. A doctor will conduct a physical examination, request a PSA blood test, and determine if further imaging is needed.",
    urgency: "SAME DAY OR NEXT AVAILABLE APPOINTMENT",
  },
  {
    tier: "high",
    label: "High Risk",
    min: 50,
    color: "#B36B00",
    bgClass: "high",
    icon: "🔴",
    summary:
      "Your responses suggest a high level of concerning symptoms and risk factors.",
    recommendation:
      "An appointment with a urologist at ABUTH is strongly recommended within the next 1–2 weeks. A PSA test and digital rectal examination (DRE) will be arranged. Please do not self-medicate before your consultation.",
    urgency: "WITHIN 1–2 WEEKS",
  },
  {
    tier: "moderate",
    label: "Moderate Risk",
    min: 25,
    color: "#D4882A",
    bgClass: "moderate",
    icon: "🟡",
    summary:
      "Your responses suggest moderate symptoms that warrant clinical evaluation.",
    recommendation:
      "Schedule an outpatient consultation at ABUTH within the coming weeks. A doctor will review your responses and advise on appropriate next steps, which may include a PSA screening test.",
    urgency: "WITHIN 4 WEEKS",
  },
  {
    tier: "low",
    label: "Low Risk",
    min: 0,
    color: "#1A7A54",
    bgClass: "low",
    icon: "🟢",
    summary: "Your current responses suggest a low symptom burden.",
    recommendation:
      "Continue attending regular health check-ups. Men above age 50 (or age 40 with family history) should discuss routine PSA screening with their doctor annually. Report any new or worsening symptoms promptly.",
    urgency: "ROUTINE ANNUAL REVIEW",
  },
];

export interface CDSSResult {
  score: number;
  maxScore: number;
  percentage: number;
  tier: RiskTier;
  automaticRecommendation: string;
  breakdown: Record<GroupKey, number>;
  selectedIds: string[];
  timestamp: string;
}

const SYMPTOM_RECOMMENDATIONS = [
  {
    priority: 100,
    symptomIds: ["b1"],
    text: "Blood in the urine should be assessed promptly by a clinician. Arrange an urgent clinical review, especially if the bleeding is ongoing, heavy, or accompanied by pain, clots, dizziness, or difficulty passing urine.",
  },
  {
    priority: 100,
    symptomIds: ["c4"],
    text: "New or persistent bone pain should be assessed promptly by a clinician. Arrange an urgent review and explain where the pain is, how long it has lasted, and whether it limits movement or sleep.",
  },
  {
    priority: 95,
    symptomIds: ["b3"],
    text: "Unexplained significant weight loss should be reviewed promptly by a clinician. Arrange an appointment and mention the amount and timing of the weight change, along with any other symptoms.",
  },
  {
    priority: 95,
    symptomIds: ["b5"],
    text: "Unexplained swelling of the legs or feet should be reviewed promptly, particularly if it is new, worsening, one-sided, or associated with breathlessness or chest pain. Seek urgent care for severe or sudden symptoms.",
  },
  {
    priority: 70,
    symptomIds: ["a1", "a2", "a3", "a4", "a5", "a6", "a7"],
    text: "Urinary symptoms can have several causes and should be discussed with a clinician. Arrange a review to assess the symptoms and ask whether urine testing, a prostate examination, or other investigations are appropriate. Do not self-medicate.",
  },
  {
    priority: 65,
    symptomIds: ["b2", "b4"],
    text: "Systemic or reproductive symptoms should be discussed with a clinician. Arrange a clinical review and report when the symptom started, whether it is changing, and any associated symptoms.",
  },
  {
    priority: 60,
    symptomIds: ["c1", "c2", "c3", "c5"],
    text: "Persistent pelvic, back, urinary, or sexual pain should be assessed by a clinician. Arrange a review and describe the location, severity, duration, and triggers of the pain.",
  },
  {
    priority: 40,
    symptomIds: ["d1", "d2", "d3", "d4", "d5", "d6", "d7"],
    text: "Your risk factors are worth discussing during a routine clinical review. Bring any previous test results and family history details so the clinician can advise whether screening or further assessment is appropriate.",
  },
] as const;

export function getAutomaticRecommendation(selectedIds: string[]) {
  const selected = new Set(selectedIds);
  const match = SYMPTOM_RECOMMENDATIONS.find((recommendation) =>
    recommendation.symptomIds.some((id) => selected.has(id)),
  );

  return (
    match?.text ??
    "No symptoms were selected. Continue routine health care and discuss any new or worsening symptoms with a clinician."
  );
}

export function runCDSS(selectedIds: string[]): CDSSResult {
  let score = 0;
  let maxScore = 0;
  const breakdown: Record<GroupKey, number> = {
    groupA: 0,
    groupB: 0,
    groupC: 0,
    groupD: 0,
  };

  (Object.entries(KNOWLEDGE_BASE) as [GroupKey, QuestionGroup][]).forEach(
    ([gKey, group]) => {
      group.questions.forEach((q) => {
        maxScore += group.weight;
        if (selectedIds.includes(q.id)) {
          score += group.weight;
          breakdown[gKey] += group.weight;
        }
      });
    },
  );

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const tier = RISK_TIERS.find((t) => percentage >= t.min)!;

  return {
    score,
    maxScore,
    percentage,
    tier,
    automaticRecommendation: getAutomaticRecommendation(selectedIds),
    breakdown,
    selectedIds,
    timestamp: new Date().toISOString(),
  };
}
