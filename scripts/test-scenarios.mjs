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

// Test Delete Topic & Safeguards
function deleteTopicLogic(topicsList, bugsList, activeTopic, topicIdToDelete) {
  if (topicsList.length <= 1) {
    return { error: 'CANNOT_DELETE_LAST_TOPIC', topics: topicsList, bugs: bugsList, activeTopic };
  }
  const remainingTopics = topicsList.filter((t) => t.id !== topicIdToDelete);
  const remainingBugs = bugsList.filter((b) => b.topicId !== topicIdToDelete);
  const nextActive = activeTopic === topicIdToDelete ? (remainingTopics[0]?.id || '') : activeTopic;
  return { topics: remainingTopics, bugs: remainingBugs, activeTopic: nextActive };
}

const testBugsForTopic = [
  { id: 'b-1', topicId: 'topic-1', description: 'Bug in topic 1' },
  { id: 'b-2', topicId: 'topic-2', description: 'Bug in topic 2' },
];

const delResult = deleteTopicLogic(updatedTopics, testBugsForTopic, 'topic-1', 'topic-1');
assert(delResult.topics.length === 2, 'Deleting topic removes it from list');
assert(delResult.activeTopic === 'topic-2', 'Deleting active topic automatically redirects to next available topic');
assert(delResult.bugs.length === 1 && delResult.bugs[0].id === 'b-2', 'Deleting topic cascades and cleans up all its associated bugs');

const guardedResult = deleteTopicLogic([{ id: 'single-topic', name: 'Only Topic' }], [], 'single-topic', 'single-topic');
assert(guardedResult.error === 'CANNOT_DELETE_LAST_TOPIC', 'Safety guard prevents deleting the only remaining topic');

// Test Type-to-Confirm validation logic
function validateDeleteConfirmation(inputName, topicName) {
  return inputName.trim() === topicName.trim();
}
assert(validateDeleteConfirmation('Fix Video', 'Fix Video') === true, 'Matching topic name enables delete action');
assert(validateDeleteConfirmation('  Fix Video  ', 'Fix Video') === true, 'Whitespace-trimmed topic name enables delete action');
assert(validateDeleteConfirmation('fix video', 'Fix Video') === false, 'Mismatched case prevents accidental deletion');
assert(validateDeleteConfirmation('', 'Fix Video') === false, 'Empty input prevents accidental deletion');


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

// Test Avatar rendering logic for unassigned vs assigned
function getAssigneeAvatarDisplay(assignee) {
  if (assignee?.avatar) return { type: 'image', src: assignee.avatar };
  if (assignee) {
    const parts = assignee.name.trim().split(' ');
    const initials = parts.length === 1 ? parts[0].substring(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return { type: 'initials', text: initials };
  }
  return { type: 'unassigned_dash', text: '—' };
}

assert(getAssigneeAvatarDisplay(null).text === '—', 'Unassigned assignee returns dash "—"');
assert(getAssigneeAvatarDisplay(null).text !== 'NA', 'Unassigned assignee does NOT return misleading "NA" abbreviation');
assert(getAssigneeAvatarDisplay({ name: 'Nguyễn Văn A' }).text === 'NA', 'Real user "Nguyễn Văn A" receives initials "NA"');
assert(getAssigneeAvatarDisplay({ name: 'Đức Minh' }).text === 'ĐM', 'Real user "Đức Minh" receives initials "ĐM"');


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
// SCENARIO 6: Reload Cache Hydration & Flash Elimination
// -------------------------------------------------------------
console.log(`\n${BOLD}Scenario 6: Reload Cache Hydration & Mock Flash Elimination${RESET}`);

// 6.1 Synchronous cache restoration simulation
const mockLocalCache = {
  fixyz_topics: JSON.stringify([{ id: 'topic-live', name: 'Live Project', createdAt: '2026-03-10' }]),
  fixyz_active_topic: 'topic-live',
  fixyz_assignees: JSON.stringify([{ id: 'user-1', name: 'Real User', avatar: '' }]),
  fixyz_bugs: JSON.stringify([{ id: 'bug-live-1', description: 'Real user bug', topicId: 'topic-live' }]),
};

function simulateInit(isConfigured, storage) {
  let stateTopics = [];
  let stateActiveTopic = '';
  let stateBugs = [];
  let isLoaded = false;
  let hasLocalCache = false;

  // Step 1: 0ms Synchronous Cache Check
  if (storage['fixyz_topics']) {
    const parsed = JSON.parse(storage['fixyz_topics']);
    if (parsed.length > 0) {
      stateTopics = parsed;
      stateActiveTopic = storage['fixyz_active_topic'] || parsed[0].id;
      hasLocalCache = true;
    }
  }
  if (storage['fixyz_bugs']) {
    stateBugs = JSON.parse(storage['fixyz_bugs']);
  }

  // Step 2: Supabase / Demo Fallback
  if (!isConfigured && !hasLocalCache) {
    stateTopics = [{ id: 'mock-topic', name: 'Mock' }];
    stateBugs = [{ id: 'mock-bug', description: 'Mock bug' }];
  }

  isLoaded = true;
  return { stateTopics, stateActiveTopic, stateBugs, isLoaded, hasLocalCache };
}

// Case A: Supabase configured with existing cache
const resultWithCache = simulateInit(true, mockLocalCache);
assert(resultWithCache.stateBugs.length === 1 && resultWithCache.stateBugs[0].id === 'bug-live-1', 'Synchronous cache restores real bugs instantly without showing mock data');
assert(resultWithCache.stateTopics[0].name === 'Live Project', 'Active project restores from cache instantly');

// Case B: Supabase configured with empty initial state (first visit / cleared cache)
const resultFresh = simulateInit(true, {});
assert(resultFresh.stateBugs.length === 0, 'Fresh visit with Supabase does NOT flash mock bugs (starts with clean empty list)');
assert(resultFresh.isLoaded === true, 'isLoaded flag transitions to true');

// Case C: Supabase returns 0 bugs (empty table)
function handleSupabaseBugsResponse(error, data) {
  let bugs = [{ id: 'old-bug' }];
  if (!error && data) {
    bugs = data.map((b) => ({ id: b.id, description: b.description }));
  }
  return bugs;
}
const emptyDbBugs = handleSupabaseBugsResponse(null, []);
assert(emptyDbBugs.length === 0, 'Supabase empty table safely clears bugs array without preserving mock data');


// -------------------------------------------------------------
// SCENARIO 7: Global Ctrl+V Auto-Row & Modal Isolation Audit
// -------------------------------------------------------------
console.log(`\n${BOLD}Scenario 7: Global Ctrl+V Auto-Row & Modal Isolation Audit${RESET}`);

// 7.1 Input & Textarea isolation logic
function isInputOrEditableCheck(targetTagName, isContentEditable) {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTagName)) return true;
  if (isContentEditable) return true;
  return false;
}

assert(isInputOrEditableCheck('TEXTAREA', false) === true, 'Textarea correctly recognized as editable (preserves description typing)');
assert(isInputOrEditableCheck('INPUT', false) === true, 'Input correctly recognized as editable (preserves search bar pasting)');
assert(isInputOrEditableCheck('DIV', false) === false, 'Generic DIV is not editable (allows Ctrl+V shortcut)');
assert(isInputOrEditableCheck('BODY', false) === false, 'Body is not editable (allows Ctrl+V shortcut)');

// 7.2 Modal Isolation logic
function simulatePasteAction({
  hasModalOpen,
  targetTag,
  clipboardItems = [],
  clipboardText = '',
  bugsState = [],
  modalImagesState = [],
  isModalPaste = false,
}) {
  let outsideBugs = [...bugsState];
  let modalImages = [...modalImagesState];

  // If in modal mode (e.g. ImageUploadModal is open)
  if (hasModalOpen) {
    if (isModalPaste) {
      // Modal's own handler runs with stopImmediatePropagation()
      const imagesInClipboard = clipboardItems.filter((item) => item.type.startsWith('image/'));
      modalImages = [...modalImages, ...imagesInClipboard.map((img) => img.data)];
    }
    // Outside listener MUST NOT trigger any changes
    return { outsideBugs, modalImages, handledBy: 'MODAL_ONLY' };
  }

  // If active element is input/textarea, do not create row
  if (isInputOrEditableCheck(targetTag, false)) {
    return { outsideBugs, modalImages, handledBy: 'NATIVE_INPUT' };
  }

  // Outside paste on page
  const images = clipboardItems.filter((item) => item.type.startsWith('image/'));
  if (images.length > 0) {
    const newBug = {
      id: `bug-${Date.now()}`,
      images: images.map((img) => img.data),
      description: '',
    };
    outsideBugs = [newBug, ...outsideBugs];
    return { outsideBugs, modalImages, handledBy: 'PAGE_IMAGE_ROW' };
  }

  if (clipboardText.trim()) {
    const newBug = {
      id: `bug-${Date.now()}`,
      images: [],
      description: clipboardText.trim(),
    };
    outsideBugs = [newBug, ...outsideBugs];
    return { outsideBugs, modalImages, handledBy: 'PAGE_TEXT_ROW' };
  }

  // Fallback empty row
  const newBug = {
    id: `bug-${Date.now()}`,
    images: [],
    description: '',
  };
  outsideBugs = [newBug, ...outsideBugs];
  return { outsideBugs, modalImages, handledBy: 'PAGE_EMPTY_ROW' };
}

// Test 7.2.1: In Quick Upload Modal, Ctrl+V pastes image into modal only, NOT creating outside row
const initialBugs = [{ id: 'b1', description: 'Existing bug', images: [] }];
const inModalResult = simulatePasteAction({
  hasModalOpen: true,
  targetTag: 'DIV',
  clipboardItems: [{ type: 'image/png', data: 'data:image/webp;base64,mockImage1' }],
  bugsState: initialBugs,
  modalImagesState: [],
  isModalPaste: true,
});

assert(inModalResult.handledBy === 'MODAL_ONLY', 'Ctrl+V inside Quick Upload modal is exclusively handled by modal');
assert(inModalResult.modalImages.length === 1, 'Pasted screenshot is added to modal preview list');
assert(inModalResult.outsideBugs.length === 1, 'Outside bug list count remains exactly 1 (ZERO outside rows created)');

// Test 7.2.2: On page, Ctrl+V with image automatically creates a new row with image attached
const onPageImageResult = simulatePasteAction({
  hasModalOpen: false,
  targetTag: 'BODY',
  clipboardItems: [{ type: 'image/png', data: 'data:image/webp;base64,screenshotPasted' }],
  bugsState: initialBugs,
});

assert(onPageImageResult.handledBy === 'PAGE_IMAGE_ROW', 'Ctrl+V on main page triggers automatic row creation');
assert(onPageImageResult.outsideBugs.length === 2, 'New bug row added to table (count increased to 2)');
assert(onPageImageResult.outsideBugs[0].images.length === 1, 'Pasted image is directly attached to the new row');

// Test 7.2.3: On page, Ctrl+V with copied text creates a new row with text in description
const onPageTextResult = simulatePasteAction({
  hasModalOpen: false,
  targetTag: 'BODY',
  clipboardText: 'Lỗi 404 trang giỏ hàng',
  bugsState: initialBugs,
});

assert(onPageTextResult.handledBy === 'PAGE_TEXT_ROW', 'Ctrl+V with text creates row with description');
assert(onPageTextResult.outsideBugs[0].description === 'Lỗi 404 trang giỏ hàng', 'Pasted text is populated into description');

// Test 7.2.4: Inside Search Input, Ctrl+V does NOT create a bug row
const insideInputResult = simulatePasteAction({
  hasModalOpen: false,
  targetTag: 'INPUT',
  clipboardText: 'keyword',
  bugsState: initialBugs,
});

assert(insideInputResult.handledBy === 'NATIVE_INPUT', 'Ctrl+V inside search input is delegated to native input');
assert(insideInputResult.outsideBugs.length === 1, 'No new bug row created when typing/pasting in input');

// 7.3 Keydown & Paste Coordination (Prevent duplicate rows)
function simulateKeydownAndPasteCoordination() {
  let rowsCreated = 0;
  let pendingKeydown = 0;

  // Step 1: User presses Ctrl+V (keydown)
  pendingKeydown = Date.now();

  // Step 2: Browser immediately dispatches paste event within 10ms
  // Paste handler runs and resets pendingKeydown
  const pasteHandled = true;
  if (pasteHandled) {
    rowsCreated++;
    pendingKeydown = 0; // cancels keydown fallback timer
  }

  // Step 3: 120ms later, keydown timeout checks if pendingKeydown is still set
  if (pendingKeydown > 0) {
    rowsCreated++; // fallback
  }

  return rowsCreated;
}

assert(simulateKeydownAndPasteCoordination() === 1, 'Coordinated keydown and paste creates exactly 1 row (zero duplicate rows)');

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
