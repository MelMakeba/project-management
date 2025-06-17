//main entry point for the frontend application
console.log('----------------------------------------');
console.log('🚀 Project Management System');
console.log('----------------------------------------');
console.log(`📅 Started at: ${new Date().toLocaleString()}`);
console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);

setTimeout(() => {
  console.log('----------------------------------------');
  console.log('📄 Frontend is available at:');
  console.log('👉 http://127.0.0.1:5500/frontend/index.html');
  console.log('----------------------------------------');
}, 1000);