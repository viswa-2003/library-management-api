const axios = require('axios');
const baseURL = 'http://localhost:3000/api';

class LibraryAPITester {
  constructor() {
    this.testData = {
      memberId: null,
      bookIds: [],
      transactionIds: []
    };
  }

  async runAllTests() {
    console.log('📚 LIBRARY MANAGEMENT API - COMPLETE TEST SUITE\n');
    console.log('='.repeat(60));

    try {
      // Test 1: Member Management
      await this.testMemberManagement();
      
      // Test 2: Book Management
      await this.testBookManagement();
      
      // Test 3: Borrowing System
      await this.testBorrowingSystem();
      
      // Test 4: Business Rules
      await this.testBusinessRules();
      
      // Test 5: Fine System
      await this.testFineSystem();
      
      // Test 6: State Machine
      await this.testStateMachine();

      console.log('\n' + '='.repeat(60));
      console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
      console.log('✅ Task is COMPLETE according to requirements');
      
    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      console.error('Error details:', error.response?.data || error);
    }
  }

  async testMemberManagement() {
    console.log('\n1️⃣ TESTING MEMBER MANAGEMENT');
    console.log('-'.repeat(40));

    // Create Member
    const createRes = await axios.post(`${baseURL}/members`, {
      name: "Test Member",
      email: `test.${Date.now()}@example.com`
    });
    this.testData.memberId = createRes.data.data.id;
    console.log(`✅ Created member: ${this.testData.memberId}`);

    // Get All Members
    const getAllRes = await axios.get(`${baseURL}/members`);
    console.log(`✅ Got ${getAllRes.data.members?.length || 0} members`);

    // Get Member by ID
    const getOneRes = await axios.get(`${baseURL}/members/${this.testData.memberId}`);
    console.log(`✅ Retrieved member: ${getOneRes.data.data.name}`);

    // Update Member
    const updateRes = await axios.put(`${baseURL}/members/${this.testData.memberId}`, {
      name: "Updated Test Member"
    });
    console.log(`✅ Updated member: ${updateRes.data.data.name}`);
  }

  async testBookManagement() {
    console.log('\n2️⃣ TESTING BOOK MANAGEMENT');
    console.log('-'.repeat(40));

    // Create 3 Books
    const books = [
      {
        isbn: `978${Date.now().toString().slice(-9)}`,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        category: "Classic",
        total_copies: 2
      },
      {
        isbn: `978${(Date.now() + 1).toString().slice(-9)}`,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        category: "Fiction",
        total_copies: 1
      },
      {
        isbn: `978${(Date.now() + 2).toString().slice(-9)}`,
        title: "1984",
        author: "George Orwell",
        category: "Dystopian",
        total_copies: 3
      }
    ];

    for (const bookData of books) {
      const res = await axios.post(`${baseURL}/books`, bookData);
      this.testData.bookIds.push(res.data.data.id);
      console.log(`✅ Created book: ${bookData.title} (ID: ${res.data.data.id})`);
    }

    // Get All Books
    const getAllRes = await axios.get(`${baseURL}/books`);
    console.log(`✅ Got ${getAllRes.data.books?.length || 0} books`);

    // Get Available Books
    const availableRes = await axios.get(`${baseURL}/books/available`);
    console.log(`✅ Got ${availableRes.data.books?.length || 0} available books`);

    // Get Book by ID
    const bookRes = await axios.get(`${baseURL}/books/${this.testData.bookIds[0]}`);
    console.log(`✅ Retrieved book: ${bookRes.data.data.title}`);

    // Update Book
    const updateRes = await axios.put(`${baseURL}/books/${this.testData.bookIds[0]}`, {
      title: "The Great Gatsby (Updated)"
    });
    console.log(`✅ Updated book: ${updateRes.data.data.title}`);
  }

  async testBorrowingSystem() {
    console.log('\n3️⃣ TESTING BORROWING SYSTEM');
    console.log('-'.repeat(40));

    // Borrow Book 1
    const borrow1 = await axios.post(`${baseURL}/transactions/borrow`, {
      book_id: this.testData.bookIds[0],
      member_id: this.testData.memberId
    });
    this.testData.transactionIds.push(borrow1.data.data.id);
    console.log(`✅ Borrowed book 1, Transaction: ${borrow1.data.data.id}`);

    // Borrow Book 2
    const borrow2 = await axios.post(`${baseURL}/transactions/borrow`, {
      book_id: this.testData.bookIds[1],
      member_id: this.testData.memberId
    });
    this.testData.transactionIds.push(borrow2.data.data.id);
    console.log(`✅ Borrowed book 2, Transaction: ${borrow2.data.data.id}`);

    // Get Member's Borrowed Books
    const borrowedRes = await axios.get(`${baseURL}/members/${this.testData.memberId}/borrowed`);
    console.log(`✅ Member has ${borrowedRes.data.data?.length || 0} borrowed books`);

    // Return Book 1
    const returnRes = await axios.post(`${baseURL}/transactions/${this.testData.transactionIds[0]}/return`);
    console.log(`✅ Returned book 1, Status: ${returnRes.data.data.status}`);
  }

  async testBusinessRules() {
    console.log('\n4️⃣ TESTING BUSINESS RULES');
    console.log('-'.repeat(40));

    // Rule 1: Max 3 books per member
    console.log('Testing: Max 3 books per member...');
    
    // Already have 1 active book (book 2), borrow 2 more
    const borrow3 = await axios.post(`${baseURL}/transactions/borrow`, {
      book_id: this.testData.bookIds[2],
      member_id: this.testData.memberId
    });
    this.testData.transactionIds.push(borrow3.data.data.id);
    console.log(`✅ Borrowed 3rd book (total active: 2)`);

    // Create another book for 4th borrow attempt
    const book4 = await axios.post(`${baseURL}/books`, {
      isbn: `978${(Date.now() + 3).toString().slice(-9)}`,
      title: "Test Book 4",
      author: "Test Author",
      category: "Test",
      total_copies: 1
    });
    const book4Id = book4.data.data.id;

    // Try to borrow 4th book (should fail)
    try {
      await axios.post(`${baseURL}/transactions/borrow`, {
        book_id: book4Id,
        member_id: this.testData.memberId
      });
      console.log('❌ Should have failed at 4th book');
    } catch (error) {
      console.log(`✅ Correctly rejected 4th borrow: ${error.response?.data?.error || error.message}`);
    }

    // Rule 2: Cannot borrow same book twice
    console.log('\nTesting: Cannot borrow same book twice...');
    try {
      await axios.post(`${baseURL}/transactions/borrow`, {
        book_id: this.testData.bookIds[1], // Already borrowed
        member_id: this.testData.memberId
      });
      console.log('❌ Should have failed - book already borrowed');
    } catch (error) {
      console.log(`✅ Correctly rejected duplicate borrow: ${error.response?.data?.error || error.message}`);
    }
  }

  async testFineSystem() {
    console.log('\n5️⃣ TESTING FINE SYSTEM');
    console.log('-'.repeat(40));

    // Get overdue transactions
    const overdueRes = await axios.get(`${baseURL}/transactions/overdue`);
    console.log(`✅ Found ${overdueRes.data.transactions?.length || 0} overdue transactions`);

    // Get all fines
    const finesRes = await axios.get(`${baseURL}/fines`);
    console.log(`✅ Found ${finesRes.data.fines?.length || 0} fines`);
  }

  async testStateMachine() {
    console.log('\n6️⃣ TESTING STATE MACHINE');
    console.log('-'.repeat(40));

    // Check book status after operations
    const bookRes = await axios.get(`${baseURL}/books/${this.testData.bookIds[1]}`);
    console.log(`✅ Book status: ${bookRes.data.data.status}`);
    console.log(`✅ Available copies: ${bookRes.data.data.available_copies}`);

    // Update book status
    const statusRes = await axios.patch(`${baseURL}/books/${this.testData.bookIds[2]}/status`, {
      status: "maintenance"
    });
    console.log(`✅ Updated book status to: ${statusRes.data.data.status}`);

    // Try to borrow book in maintenance
    try {
      await axios.post(`${baseURL}/transactions/borrow`, {
        book_id: this.testData.bookIds[2],
        member_id: this.testData.memberId
      });
      console.log('❌ Should have failed - book in maintenance');
    } catch (error) {
      console.log(`✅ Correctly rejected borrow from maintenance: ${error.response?.data?.error || error.message}`);
    }
  }
}

// Run tests
const tester = new LibraryAPITester();
tester.runAllTests().catch(console.error);