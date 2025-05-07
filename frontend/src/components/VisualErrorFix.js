/**
 * Utility functions to sanitize visual content data and fix common format issues
 */

/**
 * Validate and clean up visual explanation data
 * @param {Object|Array} data - The visual explanations data to sanitize
 * @returns {Array} - Clean array of explanation objects
 */
export const sanitizeVisualExplanations = (data) => {
  // Return empty array if data is invalid
  if (!data) return [];
  
  // If it's already an array, verify each item
  if (Array.isArray(data)) {
    return data.filter(item => {
      if (!item || typeof item !== 'object') return false;
      
      // Handle both formats (text or description)
      const hasText = typeof item.text === 'string';
      const hasDescription = typeof item.description === 'string';
      
      if (hasText || hasDescription) {
        // Standardize format by mapping description to text if needed
        if (hasDescription && !hasText) {
          item.text = item.description;
        }
        
        return typeof item.title === 'string' && typeof item.image === 'string';
      }
      
      return false;
    });
  }
  
  // Convert object to array if it's not already (handle API inconsistency)
  if (typeof data === 'object') {
    // Try using 'concepts' key if it exists (new API)
    if (data.concepts && Array.isArray(data.concepts)) {
      return sanitizeVisualExplanations(data.concepts);
    }
    
    // If it has a title/description structure, this might be the wrong data
    if (data.title && (data.description || data.text)) {
      return [];
    }
    
    // Try to extract array if it's nested
    if (data.explanations && Array.isArray(data.explanations)) {
      return sanitizeVisualExplanations(data.explanations);
    }
    
    // Convert object to array if it has indexed keys
    const keys = Object.keys(data).filter(k => !isNaN(parseInt(k)));
    if (keys.length > 0) {
      return sanitizeVisualExplanations(keys.map(k => data[k]));
    }
  }
  
  // Fallback
  console.error("Invalid visual explanations data format:", data);
  return [];
};

/**
 * Validate and clean up visual suggestions data
 * @param {Object|Array} data - The visual suggestions data to sanitize
 * @returns {Array} - Clean array of suggestion strings
 */
export const sanitizeVisualSuggestions = (data) => {
  // Return empty array if data is invalid
  if (!data) return [];
  
  // If it's already an array, convert items to strings
  if (Array.isArray(data)) {
    return data.map(item => 
      typeof item === 'string' ? item : JSON.stringify(item)
    );
  }
  
  // Extract suggestions if nested in an object
  if (typeof data === 'object' && data.suggestions && Array.isArray(data.suggestions)) {
    return sanitizeVisualSuggestions(data.suggestions);
  }
  
  // Fallback
  console.error("Invalid visual suggestions data format:", data);
  return [];
};

/**
 * Process the entire visual content object to ensure valid format
 * @param {Object} content - The visual content from API
 * @returns {Object} - Sanitized content object
 */
export const processVisualContent = (content) => {
  if (!content) return null;
  
  return {
    title: typeof content.title === 'string' ? content.title : "Visual Learning Materials",
    description: typeof content.description === 'string' 
      ? content.description 
      : "Learn through diagrams, concept maps, and visual representations.",
    explanations: sanitizeVisualExplanations(content.explanations),
    suggestions: sanitizeVisualSuggestions(content.suggestions)
  };
}; 