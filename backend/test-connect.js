import mongoose from 'mongoose';

console.log('🔍 Testing MongoDB Connection...\n');

// Test connection
mongoose.connect('mongodb://127.0.0.1:27017/skill-stack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 3000
})
.then(() => {
  console.log('✅ SUCCESS: Connected to MongoDB!');
  console.log(`   Host: ${mongoose.connection.host}`);
  console.log(`   Port: ${mongoose.connection.port}`);
  console.log(`   Database: ${mongoose.connection.db.databaseName}`);
  
  // List all databases
  return mongoose.connection.db.admin().listDatabases();
})
.then(result => {
  console.log('\n📁 Available databases:');
  result.databases.forEach(db => {
    console.log(`   - ${db.name} (size: ${db.sizeOnDisk} bytes)`);
  });
  
  // Check if our database exists
  const dbExists = result.databases.some(db => db.name === 'skill-stack');
  console.log(`\n📊 Database 'skill-stack' exists: ${dbExists ? '✅ YES' : '❌ NO'}`);
  
  if (!dbExists) {
    console.log('💡 Database will be created automatically on first write.');
  }
  
  mongoose.disconnect();
  process.exit(0);
})
.catch(error => {
  console.log('❌ FAILED to connect:', error.message);
  console.log('\n💡 Possible solutions:');
  console.log('   1. Start MongoDB: mongod --dbpath=C:\\data\\db');
  console.log('   2. Check if running: netstat -ano | findstr :27017');
  console.log('   3. Try: mongo --eval "db.version()"');
  process.exit(1);
});