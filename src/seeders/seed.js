const { Book, Member, sequelize } = require('../models');

const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create sample books
    const books = await Book.bulkCreate([
      {
        isbn: '9780061120084',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        category: 'Fiction',
        total_copies: 5,
        available_copies: 5,
        status: 'available'
      },
      {
        isbn: '9780451524935',
        title: '1984',
        author: 'George Orwell',
        category: 'Dystopian',
        total_copies: 3,
        available_copies: 3,
        status: 'available'
      },
      {
        isbn: '9780743273565',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'Classic',
        total_copies: 4,
        available_copies: 4,
        status: 'available'
      }
    ]);
    console.log(`${books.length} books created`);

    // Create sample members
    const members = await Member.bulkCreate([
      {
        name: 'John Doe',
        email: 'john@example.com',
        membership_number: 'M001',
        status: 'active'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        membership_number: 'M002',
        status: 'active'
      }
    ]);
    console.log(`${members.length} members created`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();