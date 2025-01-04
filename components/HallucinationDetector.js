window.HallucinationDetector = class HallucinationDetector {
  constructor(openAIKey, exaKey) {
    this.openAIKey = openAIKey;
    this.exaKey = exaKey;
  }

  async extractClaims(content) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{
            role: "user",
            content: `Extract verifiable claims from this text. Return as JSON array with "claim" and "original_text" keys: "${content}"`
          }]
        })
      });

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Failed to extract claims:', error);
      throw error;
    }
  }

  async verifyClaim(claim, originalText) {
    try {
      const sources = await this.searchSources(claim);
      
      if (!sources || !Array.isArray(sources.results)) {
        throw new Error('No valid sources found');
      }
      
      const verification = await this.evaluateClaim(claim, originalText, sources);
      
      return {
        claim: claim,
        assessment: verification.assessment,
        confidence: verification.confidence,
        summary: verification.summary,
        fixed_text: verification.fixed_text,
        sources: sources.results.map(s => s.url)
      };
    } catch (error) {
      console.error('Failed to verify claim:', error);
      throw error;
    }
  }

  async searchSources(claim) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: "searchExa",
        query: claim,
        exaKey: this.exaKey
      }, response => {
        if (!response) {
          reject(new Error('No response from background script'));
          return;
        }
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(`Exa API Error: ${response.error}`));
        }
      });
    });
  }

  async evaluateClaim(claim, originalText, sources) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{
            role: "user",
            content: `Evaluate this claim against the sources. Return a JSON object with exactly these keys:
              {
                "claim": "${claim}",
                "assessment": "True" or "False" or "Insufficient Information",
                "confidence": (number between 0-100),
                "summary": "brief explanation",
                "fixed_text": "corrected version if false, otherwise same as original"
              }
            Claim: ${claim}
            Original text: ${originalText}
            Sources: ${JSON.stringify(sources)}`
          }]
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`OpenAI API Error: ${response.status} - ${text}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      // Validate the response format
      if (!result.assessment || !result.confidence || !result.summary || !result.fixed_text) {
        throw new Error('Invalid response format from OpenAI');
      }
      
      return result;
    } catch (error) {
      console.error('Error in evaluateClaim:', error);
      throw error;
    }
  }
} 