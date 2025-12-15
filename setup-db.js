const { sequelize } = require('./src/models');

async function setupDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully.');

    console.log('\n🎉 Database setup completed!');
    console.log('You can now run: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\nMake sure:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database credentials in .env are correct');
    console.error('3. Database "library_management" exists');
    process.exit(1);
  }
}

setupDatabase();