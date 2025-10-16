const { HfInference } = require('@huggingface/inference');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Initialize HuggingFace client
const hf = new HfInference(process.env.HF_TOKEN);

// all-MiniLM-L6-v2 creates 384-dimensional vectors
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

/**
 * Convert text into embeddings (vector representation)
 * 
 * @param {string} text - The text to convert into embeddings
 * @returns {Promise<number[]>} - Array of 384 numbers representing the text
 * 
 * Example:
 *   Input:  "Ahmed is a developer"
 *   Output: [0.234, -0.123, 0.567, ..., 0.891] (384 numbers)
 */
async function getEmbedding(text) {
  try {
    // Validate input
    if (!text || typeof text !== 'string') {
      throw new Error('Text must be a non-empty string');
    }

    // Clean the text (remove extra spaces, newlines)
    const cleanedText = text.trim().replace(/\s+/g, ' ');

    console.log(` Generating embedding for text: "${cleanedText.substring(0, 50)}..."`);

    // Call HuggingFace API to get embeddings
    const embedding = await hf.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: cleanedText
    });

    // The API returns embeddings as an array
    // Convert to regular JavaScript array if needed
    const embeddingArray = Array.isArray(embedding) ? embedding : Array.from(embedding);

    console.log(`✅ Embedding generated successfully (dimension: ${embeddingArray.length})`);

    return embeddingArray;

  } catch (error) {
    console.error('X Error generating embedding:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('401')) {
      throw new Error('Invalid HuggingFace token. Please check your HF_TOKEN in .env file');
    }
    
    if (error.message.includes('429')) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again');
    }

    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Calculate cosine similarity between two vectors
 * This tells us how similar two pieces of text are
 * 
 * @param {number[]} vecA - First embedding vector
 * @param {number[]} vecB - Second embedding vector
 * @returns {number} - Similarity score between 0 and 1 (1 = identical, 0 = completely different)
 * 
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  // Calculate dot product (multiply corresponding elements and sum them)
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }

  // Calculate magnitudes (length of each vector)
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  // Cosine similarity = dot product / (magnitude A * magnitude B)
  // Result is always between -1 and 1, but for text it's usually 0 to 1
  const similarity = dotProduct / (magA * magB);
  
  return similarity;
}

/**
 * Batch process multiple texts into embeddings
 * More efficient than calling getEmbedding multiple times
 * 
 * @param {string[]} texts - Array of texts to convert
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
async function getEmbeddings(texts) {
  try {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error('Texts must be a non-empty array');
    }

    console.log(`🔄 Generating embeddings for ${texts.length} texts...`);

    // Process each text and get its embedding
    const embeddings = await Promise.all(
      texts.map(text => getEmbedding(text))
    );

    console.log(`✅ Generated ${embeddings.length} embeddings successfully`);

    return embeddings;

  } catch (error) {
    console.error('❌ Error generating batch embeddings:', error.message);
    throw error;
  }
}

// Export functions for use in other files
module.exports = {
  getEmbedding,
  getEmbeddings,
  cosineSimilarity,
  EMBEDDING_MODEL
};
