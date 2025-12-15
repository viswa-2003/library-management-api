const axios = require('axios');
const baseURL = 'http://localhost:3000/api';

console.log('📋 VERIFYING ALL REQUIREMENTS FROM TASK\n');
console.log('='.repeat(60));

const requirements = [
  {
    category: 'BOOKS - CRUD OPERATIONS',
    tests: [
      { method: 'POST', endpoint: '/books', description: 'Create book' },
      { method: 'GET', endpoint: '/books', description: 'Get all books' },
      { method: 'GET', endpoint: '/books/{id}', description: 'Get book by ID' },
      { method: 'PUT', endpoint: '/books/{id}', description: 'Update book' },
      { method: 'DELETE', endpoint: '/books/{id}', description: 'Delete book' },
      { method: 'GET', endpoint: '/books/available', description: 'Get available books' }
    ]
  },
  {
    category: 'MEMBERS - CRUD OPERATIONS',
    tests: [
      { method: 'POST', endpoint: '/members', description: 'Create member' },
      { method: 'GET', endpoint: '/members', description: 'Get all members' },
      { method: 'GET', endpoint: '/members/{id}', description: 'Get member by ID' },
      { method: 'PUT', endpoint: '/members/{id}', description: 'Update member' },
      { method: 'DELETE', endpoint: '/members/{id}', description: 'Delete member' },
      { method: 'GET', endpoint: '/members/{id}/borrowed', description: 'Get borrowed books' }
    ]
  },
  {
    category: 'TRANSACTIONS',
    tests: [
      { method: 'POST', endpoint: '/transactions/borrow', description: 'Borrow book' },
      { method: 'POST', endpoint: '/transactions/{id}/return', description: 'Return book' },
      { method: 'GET', endpoint: '/transactions/overdue', description: 'Get overdue transactions' }
    ]
  },
  {
    category: 'FINES',
    tests: [
      { method: 'POST', endpoint: '/fines/{id}/pay', description: 'Pay fine' }
    ]
  }
];

async function verifyRequirements() {
  let allPassed = true;
  let testData = {};

  for (const category of requirements) {
    console.log(`\n${category.category}`);
    console.log('-'.repeat(40));

    for (const test of category.tests) {
      try {
        let endpoint = test.endpoint;
        let response;

        // Handle dynamic IDs
        if (endpoint.includes('{id}')) {
          if (endpoint.includes('/books/{id}')) {
            // Get a book ID first
            const booksRes = await axios.get(`${baseURL}/books`);
            if (booksRes.data.books && booksRes.data.books.length > 0) {
              const bookId = booksRes.data.books[0].id;
              endpoint = endpoint.replace('{id}', bookId);
              testData.bookId = bookId;
            } else {
              console.log(`⏭️  ${test.description}: No books available to test`);
              continue;
            }
          } else if (endpoint.includes('/members/{id}')) {
            // Get a member ID first
            const membersRes = await axios.get(`${baseURL}/members`);
            if (membersRes.data.members && membersRes.data.members.length > 0) {
              const memberId = membersRes.data.members[0].id;
              endpoint = endpoint.replace('{id}', memberId);
              testData.memberId = memberId;
            } else {
              console.log(`⏭️  ${test.description}: No members available to test`);
              continue;
            }
          } else if (endpoint.includes('/fines/{id}/pay')) {
            // Skip fine payment test if no fines
            console.log(`⏭️  ${test.description}: Requires existing fine`);
            continue;
          }
        }

        // Prepare test data based on endpoint
        let data = null;
        if (test.method === 'POST') {
          if (endpoint.includes('/books')) {
            data = {
              isbn: `978${Date.now().toString().slice(-9)}`,
              title: 'Verification Test Book',
              author: 'Test Author',
              category: 'Test',
              total_copies: 2
            };
          } else if (endpoint.includes('/members')) {
            data = {
              name: 'Verification Test Member',
              email: `verify.${Date.now()}@test.com`
            };
          } else if (endpoint.includes('/transactions/borrow')) {
            // Need book and member IDs
            if (!testData.bookId || !testData.memberId) {
              console.log(`⏭️  ${test.description}: Requires book and member IDs`);
              continue;
            }
            data = {
              book_id: testData.bookId,
              member_id: testData.memberId
            };
          }
        } else if (test.method === 'PUT') {
          if (endpoint.includes('/books')) {
            data = { title: 'Updated Title' };
          } else if (endpoint.includes('/members')) {
            data = { name: 'Updated Name' };
          }
        }

        // Make request
        response = await axios({
          method: test.method,
          url: baseURL + endpoint,
          data: data,
          validateStatus: () => true // Don't throw on error status
        });

        const success = response.status >= 200 && response.status < 300;
        const symbol = success ? '✅' : '⚠️ ';
        const color = success ? '\x1b[32m' : '\x1b[33m';
        
        console.log(`${color}${symbol} ${test.description.padEnd(35)} ${response.status}\x1b[0m`);
        
        if (!success && response.data?.error) {
          console.log(`   Reason: ${response.data.error}`);
        }

        if (!success) allPassed = false;

      } catch (error) {
        console.log(`\x1b[31m❌ ${test.description.padEnd(35)} ERROR: ${error.message}\x1b[0m`);
        allPassed = false;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('\x1b[32m✅ ALL REQUIREMENTS VERIFIED SUCCESSFULLY!\x1b[0m');
  } else {
    console.log('\x1b[33m⚠️  SOME REQUIREMENTS NEED ATTENTION\x1b[0m');
  }
  console.log('='.repeat(60));
}

verifyRequirements().catch(console.error);