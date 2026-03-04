import { Medication, Interaction } from "../types";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";
const MODEL = "arcee-ai/trinity-large-preview:free";

export async function checkInteractions(medications: Medication[]): Promise<Interaction[]> {
  if (medications.length < 2) return [];

  const drugList = medications.map(m => `${m.name} (${m.dosage})`).join(", ");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "MediSafe"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `Role: Act as a Senior Pharmacist Assistant and Patient Advocate. 
            Goal: Identify clinically significant interactions between drugs, or between drugs and common foods/alcohol.
            
            Formatting Rules:
            - No Medical Jargon: Use "Thinning the blood" instead of "Anticoagulation", "Protecting the stomach" instead of "Prophylaxis", etc.
            - Plain Language: Suitable for elderly patients.
            - Safety First: Always focus on risk explanation.
            
            CRITICAL: Cross-reference with official data from OpenFDA, RxNorm, and NLM DailyMed. 
            Response Format: You MUST return a valid JSON array of objects.
            Each object must have:
            - severity: "severe" | "moderate" | "mild" | "none"
            - drugs: string[]
            - explanation: Plain language explanation of the risk.
            - recommendation: Clear advice on what to do.
            - source: Data source used.
            
            Example Format: [{"severity": "moderate", "drugs": ["A", "B"], "explanation": "...", "recommendation": "...", "source": "..."}]`
          },
          {
            role: "user",
            content: `Check for potential drug-drug interactions between these medications: ${drugList}.`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "[]";

    // Some models wrap the array in an object when using response_format: json_object
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : (parsed.interactions || []);
  } catch (e) {
    console.error("Failed to check interactions via OpenRouter", e);
    return [];
  }
}

export async function askMedicationQuestion(question: string, medications: Medication[]): Promise<string> {
  const drugContext = medications.map(m => `- ${m.name}: ${m.dosage}, ${m.frequency}, ${m.foodRequirement} food`).join("\n");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "MediSafe"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `Role: Act as a Senior Pharmacist Assistant and Patient Advocate. 
            Goal: Simplify complex medication information and answer questions using plain, accessible language suitable for elderly patients.
            
            The user is taking the following medications:
            ${drugContext}
            
            Formatting Rules:
            - No Medical Jargon: Use "Thinning the blood" instead of "Anticoagulation", "Water pill" instead of "Diuretic", etc.
            - Visual Layout: Use Markdown for lists and bold text. Keep it clean.
            - Safety First: Always include a prominent disclaimer that this is an AI-generated tool and the user must consult a doctor before changing their regimen.
            
            Special Instructions:
            - "Double-Check" Feature: If the user asks about interactions or adding a new med, ask: "Are you also taking any herbal supplements like St. John's Wort?"
            - If a question is dangerous or requires immediate medical attention, advise them to call emergency services or their doctor immediately.`
          },
          {
            role: "user",
            content: question
          }
        ]
      })
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
  } catch (e) {
    console.error("Failed to ask question via OpenRouter", e);
    return "I'm sorry, I'm having trouble connecting to my knowledge base right now.";
  }
}
