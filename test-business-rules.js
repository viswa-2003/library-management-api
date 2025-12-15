const axios = require('axios');
const baseURL = 'http://localhost:3000/api';

console.log('🔍 TESTING BUSINESS RULES\n');
console.log('='.repeat(60));

async function testBusinessRules() {
  // Create test data
  console.log('Setting up test data...');
  
  // Create a member
  const memberRes = await axios.post(`${baseURL}/members`, {
    name: "Business Rules Test Member",
    email: `business.${Date.now()}@test.com`
  });
  const memberId = memberRes.data.data.id;
  console.log(`✅ Created member: ${memberId}`);

  // Create 4 books
  const bookIds = [];
  for (let i = 0; i < 4; i++) {
    const bookRes = await axios.post(`${baseURL}/books`, {
      isbn: `978${Date.now() + i}`,
      title: `Business Test Book ${i + 1}`,
      author: `Author ${i + 1}`,
      category: "Test",
      total_copies: 1
    });
    bookIds.push(bookRes.data.data.id);
    console.log(`✅ Created book ${i + 1}: ${bookRes.data.data.id}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('RULE 1: Max 3 books per member\n');

  // Borrow 3 books (should succeed)
  const transactionIds = [];
  for (let i = 0; i < 3; i++) {
    try {
      const borrowRes = await axios.post(`${baseURL}/transactions/borrow`, {
        book_id: bookIds[i],
        member_id: memberId
      });
      transactionIds.push(borrowRes.data.data.id);
      console.log(`✅ Successfully borrowed book ${i + 1}`);
    } catch (error) {
      console.log(`❌ Failed to borrow book ${i + 1}: ${error.response?.data?.error}`);
    }
  }

  // Try to borrow 4th book (should fail)
  console.log('\nAttempting to borrow 4th book (should fail):');
  try {
    await axios.post(`${baseURL}/transactions/borrow`, {
      book_id: bookIds[3],
      member_id: memberId
    });
    console.log('❌ Should have failed - max 3 books limit not enforced');
  } catch (error) {
    console.log(`✅ Correctly rejected: ${error.response?.data?.error}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('RULE 2: Cannot borrow same book twice\n');

  // Try to borrow first book again (should fail)
  console.log('Attempting to borrow same book again:');
  try {
    await axios.post(`${baseURL}/transactions/borrow`, {
      book_id: bookIds[0],
      member_id: memberId
    });
    console.log('❌ Should have failed - book already borrowed');
  } catch (error) {
    console.log(`✅ Correctly rejected: ${error.response?.data?.error}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('RULE 3: Check 14-day loan period\n');

  // Check transaction details
  if (transactionIds.length > 0) {
    const transactionRes = await axios.get(`${baseURL}/transactions/${transactionIds[0]}`);
    const transaction = transactionRes.data.data;
    const borrowedAt = new Date(transaction.borrowed_at);
    const dueDate = new Date(transaction.due_date);
    const daysDiff = Math.round((dueDate - borrowedAt) / (1000 * 60 * 60 * 24));
    
    console.log(`Borrowed at: ${borrowedAt.toLocaleString()}`);
    console.log(`Due date: ${dueDate.toLocaleString()}`);
    console.log(`Loan period: ${daysDiff} days`);
    
    if (daysDiff === 14) {
      console.log('✅ 14-day loan period enforced correctly');
    } else {
      console.log(`❌ Loan period should be 14 days, but is ${daysDiff} days`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('RULE 4: Book status updates\n');

  // Check book status after borrowing
  const bookRes = await axios.get(`${baseURL}/books/${bookIds[0]}`);
  console.log(`Book status: ${bookRes.data.data.status}`);
  console.log(`Available copies: ${bookRes.data.data.available_copies}`);
  
  if (bookRes.data.data.status === 'borrowed' && bookRes.data.data.available_copies === 0) {
    console.log('✅ Book status correctly updated to borrowed');
  } else {
    console.log('❌ Book status not correctly updated');
  }

  console.log('\n' + '='.repeat(60));
  console.log('CLEANUP\n');

  // Return books
  for (const transactionId of transactionIds) {
    try {
      await axios.post(`${baseURL}/transactions/${transactionId}/return`);
      console.log(`✅ Returned book from transaction ${transactionId}`);
    } catch (error) {
      console.log(`❌ Failed to return: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ BUSINESS RULES TEST COMPLETED');
  console.log('='.repeat(60));
}

testBusinessRules().catch(console.error);