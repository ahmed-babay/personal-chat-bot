const fs = require('fs').promises;
const path = require('path');
const { getEmbedding, cosineSimilarity } = require('./embeddings');
const DOCUMENTS_PATH = path.join(__dirname, '..', 'data', 'documents.json');

/**
 * Vector Store - In-memory storage with file persistence
 * Stores documents with their embeddings and provides similarity search
 */
class VectorStore {
  constructor() {
    this.documents = [];
    this.metadata = {
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      dimension: 384,
      version: '1.0'
    };
  }

  /**
   * Load documents from JSON file
   * Called automatically when the server starts
   */
  async load() {
    try {
      const data = await fs.readFile(DOCUMENTS_PATH, 'utf8');
      const parsed = JSON.parse(data);
      
      this.documents = parsed.documents || [];
      this.metadata = parsed.metadata || this.metadata;
      
      console.log(`✅ Loaded ${this.documents.length} documents from vector store`);
      return this.documents.length;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📝 No existing documents found. Starting with empty vector store.');
        await this.save(); // Create the file
        return 0;
      }
      throw error;
    }
  }

  /**
   * Save documents to JSON file
   * Persists the in-memory data to disk
   */
  async save() {
    try {
      const data = {
        documents: this.documents,
        metadata: {
          ...this.metadata,
          last_updated: new Date().toISOString(),
          total_documents: this.documents.length
        }
      };

      await fs.writeFile(DOCUMENTS_PATH, JSON.stringify(data, null, 2), 'utf8');
      console.log(`💾 Saved ${this.documents.length} documents to vector store`);
    } catch (error) {
      console.error('❌ Error saving vector store:', error.message);
      throw error;
    }
  }

  /**
   * Generate a unique ID for a document
   */
  generateId() {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add a document to the vector store
   * 
   * @param {string} text - The text content to store
   * @param {object} metadata - Optional metadata (category, tags, etc.)
   * @returns {Promise<object>} - The created document
   * 
   * Example:
   *   await vectorStore.addDocument(
   *     "Ahmed is a software engineer",
   *     { category: "about_me", tags: ["career", "profile"] }
   *   );
   */
  async addDocument(text, metadata = {}) {
    try {
      console.log(`📝 Adding document: "${text.substring(0, 50)}..."`);

      // Generate embedding for the text
      const embedding = await getEmbedding(text);

      // Create document object
      const document = {
        id: this.generateId(),
        text: text.trim(),
        embedding: embedding,
        metadata: {
          ...metadata,
          created_at: new Date().toISOString(),
          text_length: text.length
        }
      };

      // Add to in-memory store
      this.documents.push(document);

      // Save to disk
      await this.save();

      console.log(`✅ Document added with ID: ${document.id}`);
      return document;

    } catch (error) {
      console.error('❌ Error adding document:', error.message);
      throw error;
    }
  }

  /**
   * Add multiple documents at once
   * 
   * @param {Array<{text: string, metadata?: object}>} documents
   * @returns {Promise<Array<object>>} - Array of created documents
   */
  async addDocuments(documents) {
    try {
      console.log(`📝 Adding ${documents.length} documents...`);

      const createdDocs = [];

      for (const doc of documents) {
        const embedding = await getEmbedding(doc.text);
        
        const document = {
          id: this.generateId(),
          text: doc.text.trim(),
          embedding: embedding,
          metadata: {
            ...doc.metadata,
            created_at: new Date().toISOString(),
            text_length: doc.text.length
          }
        };

        this.documents.push(document);
        createdDocs.push(document);
      }

      await this.save();

      console.log(`✅ Added ${createdDocs.length} documents`);
      return createdDocs;

    } catch (error) {
      console.error('❌ Error adding documents:', error.message);
      throw error;
    }
  }

  /**
   * Search for documents similar to a query
   * 
   * @param {string} query - The search query
   * @param {number} topK - Number of results to return (default: 3)
   * @param {number} threshold - Minimum similarity score (0-1, default: 0)
   * @returns {Promise<Array<object>>} - Array of similar documents with scores
   */
  async searchSimilar(query, topK = 3, threshold = 0) {
    try {
      if (this.documents.length === 0) {
        console.log('⚠️  Vector store is empty. No documents to search.');
        return [];
      }

      console.log(`🔍 Searching for: "${query.substring(0, 50)}..."`);

      // Generate embedding for the query
      const queryEmbedding = await getEmbedding(query);

      // Calculate similarity for each document
      const results = this.documents.map(doc => ({
        document: doc,
        similarity: cosineSimilarity(queryEmbedding, doc.embedding)
      }));

      // Filter by threshold and sort by similarity (highest first)
      const filtered = results
        .filter(result => result.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      console.log(`✅ Found ${filtered.length} similar documents`);
      
      // Log results for debugging
      filtered.forEach((result, i) => {
        console.log(`  ${i + 1}. [${result.similarity.toFixed(4)}] ${result.document.text.substring(0, 60)}...`);
      });

      return filtered;

    } catch (error) {
      console.error('❌ Error searching documents:', error.message);
      throw error;
    }
  }

  /**
   * Get all documents in the store
   * @returns {Array<object>} - All documents
   */
  getAllDocuments() {
    return this.documents;
  }

  /**
   * Get a document by ID
   * @param {string} id - Document ID
   * @returns {object|null} - Document or null if not found
   */
  getDocumentById(id) {
    return this.documents.find(doc => doc.id === id) || null;
  }

  /**
   * Delete a document by ID
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async deleteDocument(id) {
    try {
      const index = this.documents.findIndex(doc => doc.id === id);
      
      if (index === -1) {
        console.log(`⚠️  Document ${id} not found`);
        return false;
      }

      const deleted = this.documents.splice(index, 1)[0];
      await this.save();

      console.log(`🗑️  Deleted document: ${deleted.text.substring(0, 50)}...`);
      return true;

    } catch (error) {
      console.error('❌ Error deleting document:', error.message);
      throw error;
    }
  }

  /**
   * Clear all documents from the store
   * @returns {Promise<number>} - Number of documents deleted
   */
  async clearAll() {
    try {
      const count = this.documents.length;
      this.documents = [];
      await this.save();

      console.log(`🗑️  Cleared ${count} documents from vector store`);
      return count;

    } catch (error) {
      console.error('❌ Error clearing vector store:', error.message);
      throw error;
    }
  }

  /**
   * Get statistics about the vector store
   * @returns {object} - Statistics
   */
  getStats() {
    return {
      total_documents: this.documents.length,
      model: this.metadata.model,
      dimension: this.metadata.dimension,
      version: this.metadata.version,
      last_updated: this.metadata.last_updated
    };
  }
}

const vectorStore = new VectorStore();

module.exports = vectorStore;
module.exports.VectorStore = VectorStore;

