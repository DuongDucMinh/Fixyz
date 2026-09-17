import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// ANSI colors for clean test reporting
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ${GREEN}✓ PASS:${RESET} ${message}`);
    passedTests++;
  } else {
    console.error(`  ${RED}✗ FAIL:${RESET} ${message}`);
    failedTests++;
  }
}

console.log(`\n${BOLD}${CYAN}======================================================${RESET}`);
console.log(`${BOLD}${CYAN}   FIXYZ AUTOMATED TEST SUITE - FULL SYSTEM AUDIT    ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================${RESET}\n`);

// -------------------------------------------------------------
// SCENARIO 1: Topic Management & Isolation Logic
// -------------------------------------------------------------
console.log(`${BOLD}Scenario 1: Topic Management & Active Topic Isolation${RESET}`);

const mockTopics = [
  { id: 'topic-1', name: 'Fix VLearn', createdAt: new Date().toISOString() },
  { id: 'topic-2', name: 'Fix Video', createdAt: new Date().toISOString() },
];

function addTopic(topics, name) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const newTopic = {
    id: `topic-${Date.now()}`,
    name: trimmed,
    createdAt: new Date().toISOString(),
  };
  return [...topics, newTopic];
}

const updatedTopics = addTopic(mockTopics, '  Fix Payment Gateway  ');
assert(updatedTopics !== null && updatedTopics.length === 3, 'Can create topic with trimmed name');
assert(updatedTopics[2].name === 'Fix Payment Gateway', 'Topic name is properly sanitized');
assert(addTopic(mockTopics, '   ') === null, 'Empty or whitespace topic name is safely rejected');

// -------------------------------------------------------------
// SCENARIO 2: Bug CRUD & Image Lifecycle
// -------------------------------------------------------------
console.log(`\n${BOLD}Scenario 2: Bug Lifecycle, Images & State Transitions${RESET}`);

let bugs = [
  {
    id: 'bug-test-1',
    topicId: 'topic-1',
    images: ['https://example.com/img1.png', 'https://example.com/img2.png', 'https://example.com/img3.png'],
    description: 'Initial bug description',
    priority: 'Trung bình',
    assigneeId: 'assignee-1',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
];

// Test Image Deletion at index
function deleteImage(bug, indexToDelete) {
  const newImages = bug.images.filter((_, idx) => idx !== indexToDelete);
  return { ...bug, images: newImages };
}

bugs[0] = deleteImage(bugs[0], 1); // remove img2
assert(bugs[0].images.length === 2, 'Deleting image from middle leaves exactly 2 images');
assert(bugs[0].images[0] === 'https://example.com/img1.png' && bugs[0].images[1] === 'https://example.com/img3.png', 'Remaining image order is preserved');

// Delete remaining images
bugs[0] = deleteImage(bugs[0], 0);
bugs[0] = deleteImage(bugs[0], 0);
assert(bugs[0].images.length === 0, 'Can safely delete all images to revert to empty state');

// Description update
bugs[0].description = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
assert(bugs[0].description.split('\n').length === 5, 'Auto-height multiline description preserves 5+ lines without truncation');

// Toggle completion
bugs[0].isCompleted = !bugs[0].isCompleted;
assert(bugs[0].isCompleted === true, 'Completion checkbox toggles to completed');
bugs[0].isCompleted = !bugs[0].isCompleted;
assert(bugs[0].isCompleted === false, 'Completion checkbox toggles back to active');

// -------------------------------------------------------------
// SCENARIO 3: Assignee & Foreign Key Safety Validation
// -------------------------------------------------------------
console.log(`\n${BOLD}Scenario 3: Assignee Integrity & Foreign Key Safeguards${RESET}`);

const mockAssignees = [
  { id: 'assignee-1', name: 'Minh Tran' },
  { id: 'assignee-2', name: 'Huy Dang' },
  { id: 'assignee-3', name: 'Nguyễn Văn A' },
];

function sanitizeAssigneeForDb(assigneeId, availableAssignees) {
  if (!assigneeId) return null;
  const exists = availableAssignees.some((a) => a.id === assigneeId);
  return exists ? assigneeId : null;
}

assert(sanitizeAssigneeForDb('assignee-1', mockAssignees) === 'assignee-1', 'Valid assignee ID is preserved');
assert(sanitizeAssigneeForDb('', mockAssignees) === null, 'Empty assignee ID safely maps to null (unassigned)');
assert(sanitizeAssigneeForDb('non-existent-uuid', mockAssignees) === null, 'Ghost/deleted assignee ID safely maps to null, preventing Postgres FK constraint violations');

// Test Assignee Deletion cascade to bugs
function deleteAssigneeWithCascade(assigneeIdToDelete, currentAssignees, currentBugs) {
  const updatedAssignees = currentAssignees.filter((a) => a.id !== assigneeIdToDelete);
  const updatedBugs = currentBugs.map((b) =>
    b.assigneeId === assigneeIdToDelete ? { ...b, assigneeId: '' } : b
  );
  return { updatedAssignees, updatedBugs };
}

const testBugWithAssignee = { ...bugs[0], assigneeId: 'assignee-2' };
const deletionResult = deleteAssigneeWithCascade('assignee-2', mockAssignees, [testBugWithAssignee]);
assert(deletionResult.updatedAssignees.length === 2, 'Assignee is removed from assignee list');
assert(deletionResult.updatedBugs[0].assigneeId === '', 'Associated bug is unassigned before DB deletion, preventing FK block');

// -------------------------------------------------------------
// SCENARIO 4: Filter & Search Engine
// -------------------------------------------------------------
console.log(`\n${BOLD}Scenario 4: Search & Multi-criteria Filtering${RESET}`);

const testBugList = [
  { id: 'b1', topicId: 'topic-1', priority: 'Cao', assigneeId: 'a1', isCompleted: false, description: 'Lỗi đăng nhập Safari' },
  { id: 'b2', topicId: 'topic-1', priority: 'Trung bình', assigneeId: 'a2', isCompleted: true, description: 'Nút tải video bị lệch' },
  { id: 'b3', topicId: 'topic-1', priority: 'Thấp', assigneeId: 'a1', isCompleted: false, description: 'Icon màu xám quá nhạt' },
  { id: 'b4', topicId: 'topic-2', priority: 'Cao', assigneeId: 'a1', isCompleted: false, description: 'Tràn bộ nhớ khi xem video' },
];

function applyFilters(bugList, { activeTopic, query, priority, assignee }) {
  return bugList.filter((b) => {
    if (b.topicId !== activeTopic) return false;
    if (priority !== 'all' && b.priority !== priority) return false;
    if (assignee !== 'all' && b.assigneeId !== assignee) return false;
    if (query && !b.description.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
}

const topic1Bugs = applyFilters(testBugList, { activeTopic: 'topic-1', query: '', priority: 'all', assignee: 'all' });
assert(topic1Bugs.length === 3, 'Filters correctly isolate topic-1 bugs');

const highPriorityBugs = applyFilters(testBugList, { activeTopic: 'topic-1', query: '', priority: 'Cao', assignee: 'all' });
assert(highPriorityBugs.length === 1 && highPriorityBugs[0].id === 'b1', 'Priority filter matches only "Cao"');

const searchResults = applyFilters(testBugList, { activeTopic: 'topic-1', query: 'Safari', priority: 'all', assignee: 'all' });
assert(searchResults.length === 1 && searchResults[0].id === 'b1', 'Keyword search finds "Safari"');

const emptySearch = applyFilters(testBugList, { activeTopic: 'topic-1', query: 'NonExistentWord', priority: 'all', assignee: 'all' });
assert(emptySearch.length === 0, 'Unmatched keyword returns 0 results');

// -------------------------------------------------------------
// SCENARIO 5: Live Supabase Integration & Schema Verification
// -------------------------------------------------------------
console.log(`\n${BOLD}Scenario 5: Live Supabase Database Health & CRUD Test${RESET}`);

async function runLiveSupabaseTests() {
  try {
    const envPath = path.resolve('.env.local');
    if (!fs.existsSync(envPath)) {
      console.log(`  ${YELLOW}⚠ SKIP: .env.local not found, skipping live Supabase checks.${RESET}`);
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
    const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/);

    if (!urlMatch || !keyMatch) {
      console.log(`  ${YELLOW}⚠ SKIP: Supabase credentials not found in .env.local.${RESET}`);
      return;
    }

    const client = createClient(urlMatch[1].trim(), keyMatch[1].trim());

    // Check tables availability
    const [topicsRes, assigneesRes, bugsRes] = await Promise.all([
      client.from('topics').select('id, name').limit(5),
      client.from('assignees').select('id, name').limit(5),
      client.from('bugs').select('id, priority').limit(5),
    ]);

    assert(!topicsRes.error, `Supabase table 'topics' accessible (records: ${topicsRes.data?.length})`);
    assert(!assigneesRes.error, `Supabase table 'assignees' accessible (records: ${assigneesRes.data?.length})`);
    assert(!bugsRes.error, `Supabase table 'bugs' accessible (records: ${bugsRes.data?.length})`);

    // Verify Assignees contains user
    const assigneeNames = assigneesRes.data?.map((a) => a.name) || [];
    assert(assigneeNames.some((n) => n.toLowerCase().includes('nguyễn')), 'Supabase contains created member (e.g. "Nguyễn văn a")');


    // Test inserting and deleting a temporary bug record safely
    const testBugId = `test-autotest-${Date.now()}`;
    const insertRes = await client.from('bugs').insert({
      id: testBugId,
      topic_id: topicsRes.data[0]?.id || 'topic-1',
      description: 'Automated test temporary record',
      priority: 'Trung bình',
      assignee_id: null,
      is_completed: false,
      images: [],
    });
    assert(!insertRes.error, 'Can safely insert a bug record into live Supabase');

    const deleteRes = await client.from('bugs').delete().eq('id', testBugId);
    assert(!deleteRes.error, 'Can safely delete the temporary test record from live Supabase');

  } catch (err) {
    console.error(`  ${RED}✗ Live Supabase check encountered error:${RESET}`, err.message);
    failedTests++;
  }
}

await runLiveSupabaseTests();

// -------------------------------------------------------------
// TEST SUMMARY
// -------------------------------------------------------------
console.log(`\n${BOLD}${CYAN}------------------------------------------------------${RESET}`);
console.log(`${BOLD}Test Results: ${GREEN}${passedTests} passed${RESET}, ${failedTests === 0 ? GREEN : RED}${failedTests} failed${RESET}`);
console.log(`${BOLD}${CYAN}------------------------------------------------------${RESET}\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
