window.HallucinationDetector = class HallucinationDetector {
  constructor(openaiKey, exaKey) {
    this.openaiKey = openaiKey;
    this.exaKey = exaKey;
  }

  async extractClaims(text) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: 'Extract factual claims from the given text. Return them as a JSON array of objects with "claim" and "original_text" properties.'
          }, {
            role: 'user',
            content: text
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI');
      }

      const claims = JSON.parse(data.choices[0].message.content);
      if (!Array.isArray(claims)) {
        throw new Error('Expected array of claims from OpenAI');
      }

      return claims;
    } catch (error) {
      console.error('Failed to extract claims:', error);
      throw error;
    }
  }

  async verifyClaim(claim, originalText) {
    try {
      // First, search for relevant sources
      const sources = await this.searchSources(claim);
      
      if (!sources || !sources.results || sources.results.length === 0) {
        return {
          claim,
          assessment: "Insufficient Information",
          confidence: 0,
          summary: "No reliable sources found to verify this claim.",
          sources: []
        };
      }

      // Then evaluate the claim against the sources
      const evaluation = await this.evaluateClaim(claim, originalText, sources.results);
      
      return {
        claim,
        assessment: evaluation.assessment,
        confidence: evaluation.confidence,
        summary: evaluation.summary,
        fixed_text: evaluation.fixed_text,
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
          'Authorization': `Bearer ${this.openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: "You are a fact-checking assistant. Evaluate the claim against the provided sources and determine if it's true, false, or if there's insufficient information."
          }, {
            role: "user",
            content: `Evaluate this claim against the sources and return a JSON object with exactly these keys:
              {
                "assessment": "True" or "False" or "Insufficient Information",
                "confidence": (number between 0-100),
                "summary": "brief explanation",
                "fixed_text": "corrected version if false, otherwise same as original"
              }

              Claim: ${claim}
              Original context: ${originalText}
              Sources: ${JSON.stringify(sources.map(s => ({
                url: s.url,
                title: s.title,
                content: s.text
              })))}`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
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