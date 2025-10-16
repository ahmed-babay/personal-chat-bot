const vectorStore = require('../services/vectorStore');

async function setupMyInfo() {
  console.log('🚀 Setting up your personal information in RAG system...\n');

  try {
    // Load existing vector store
    await vectorStore.load();

    console.log('📝 Adding your personal information...\n');



    // About Me
    await vectorStore.addDocument(
      "Ahmed Babay is a computer scientist and a software engineer with a passion for building intelligent applications",
      { category: "about_me", tags: ["identity", "career", "introduction", "about me"] }
    );

    await vectorStore.addDocument(
      "Ahmed specializes in artificial intelligence, machine learning, and software engineering",
      { category: "skills", tags: ["AI", "ML", "expertise", "skills", "software engineering"] }
    );

    await vectorStore.addDocument(
      "Ahmed is proficient in JavaScript, TypeScript, Python and Java",
      { category: "skills", tags: ["programming", "languages"] }
    );

    // Education 
    await vectorStore.addDocument(
      "Ahmed graduated with a Bachelor of Science degree in Computer Science from Technical University of Darmstadt in Germany",
      { category: "education", tags: ["degree", "university"] }
    );

    // Projects
    await vectorStore.addDocument(
      "Ahmed built a modern AI chatbot with RAG capabilities using React and Node.js",
      { category: "projects", tags: ["chatbot", "RAG", "AI"] }
    );

    // Interests
    await vectorStore.addDocument(
      "Ahmed is passionate about building intelligent applications that solve real-world problems",
      { category: "interests", tags: ["passion", "AI"] }
    );

    // Contact/Social 
    await vectorStore.addDocument(
      "Ahmed can be reached via email or LinkedIn for professional inquiries or any other questions. you can find me on LinkedIn at https://www.linkedin.com/in/ahmed-babay-0a6a9b1b1/ or my email is ahmed.babay.personal@gmail.com",
      { category: "contact", tags: ["social", "professional","email","linkedin"] }
    );

    // Work Experience
    await vectorStore.addDocument(
        "Ahmed worked as a software engineer at a startup called Queryella GmbH where he helped build a privacy and security analysis tool for both Android and iOS using machine learning and natural language processing. He also worked as a research assistant at the Technical University of Darmstadt in data science.",
        { category: "contact", tags: ["social", "professional","email","linkedin"] }
      );

    // ========================================
    // END OF EDITABLE SECTION
    // ========================================

    console.log('\n✅ Setup complete!\n');


    const stats = vectorStore.getStats();
    console.log(' -> Vector Store Statistics:');
    console.log(`   Total documents: ${stats.total_documents}`);
    console.log(`   Model: ${stats.model}`);
    console.log(`   Dimension: ${stats.dimension}`);
    console.log(`   Storage: server/data/documents.json\n`);

    console.log('📚 Your documents:');
    const allDocs = vectorStore.getAllDocuments();
    allDocs.forEach((doc, i) => {
      console.log(`   ${i + 1}. [${doc.metadata.category}] ${doc.text.substring(0, 60)}...`);
    });

    console.log('\n Your personal RAG system is ready!');
    console.log('\n Next steps:');
    console.log('   1. Start your server: npm run dev');
    console.log('   2. The chatbot will now use this information to answer questions about you!');

  } catch (error) {
    console.error('❌ Error setting up information:', error.message);
    console.error(error);
  }
}

setupMyInfo();

