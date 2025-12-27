# Debug White Screen Issue

## Vấn đề

Trang `http://localhost:3000/exam-sets/{examSetId}/take` hiển thị trang trắng sau khi load data.

## Các lỗi đã sửa

### 1. ✅ Thêm safety check cho currentQuestion

**Vấn đề:** Nếu `currentQuestion` undefined, component sẽ crash và hiển thị trang trắng.

**Giải pháp:**
```typescript
const currentQuestion = questions[currentQuestionIndex];

// Safety check: if no current question, show loading
if (!currentQuestion) {
  console.warn('⚠️ No current question found at index:', currentQuestionIndex, 'Total questions:', questions.length);
  return <LoadingScreen />;
}
```

### 2. ✅ Tăng cường debug logging

Thêm nhiều console.log để track state changes:

```typescript
console.log(`✅ Using cached/fetched questions: ${cachedQuestions.length} total`);
console.log(`📍 Current state - questions.length: ${questions.length}, timeLeft: ${timeLeft}`);
console.log(`📝 Questions set in state: ${cachedQuestions.length} questions`);
```

### 3. ✅ Fix logic set timeLeft

**Vấn đề:** useEffect có thể reset timeLeft mỗi khi re-render.

**Giải pháp:**
```typescript
// Only set initial time, don't reset if already started
if (timeLeft === -1) {
  // Keep as -1 until user clicks start button
  console.log(`⏰ Standard time mode ready: ${(examConfig.timeLimit || 0) * 60} seconds`);
} else {
  console.log(`⏰ Timer already running: ${timeLeft} seconds remaining`);
}
```

## Cách debug

### Bước 1: Mở DevTools Console

1. F12 hoặc Right-click → Inspect
2. Chọn tab **Console**
3. Refresh trang

### Bước 2: Kiểm tra logs mới

Bạn sẽ thấy logs chi tiết:

```
📋 Exam set loaded: { id: '...', title: '21.10', ... }
⚙️ Exam config created: { type: 'full', parts: [1,2,3,4,5,6,7], ... }
🎯 Generating Exam Set Questions - OPTIMIZED...
✅ Using cached/fetched questions: 200 total
📍 Current state - questions.length: 0, timeLeft: -1
📝 Questions set in state: 200 questions
⏰ Standard time mode ready: 7200 seconds for 200 questions
```

### Bước 3: Click "Bắt đầu làm bài"

**Nếu thấy warning:**
```
⚠️ No current question found at index: 0 Total questions: 0
```
→ Questions array bị empty, cần investigate tại sao setQuestions không hoạt động.

**Nếu thấy:**
```
⏰ Timer already running: 7200 seconds remaining
```
→ OK, component đang render đúng.

### Bước 4: Check React DevTools

1. Install React DevTools extension
2. F12 → tab **Components**
3. Tìm component `ExamSession`
4. Check state:
   - `questions`: [] hay có 200 items?
   - `timeLeft`: -1 hay 7200?
   - `currentQuestionIndex`: 0?

## Các trường hợp có thể xảy ra

### Case 1: currentQuestion undefined

**Logs:**
```
⚠️ No current question found at index: 0 Total questions: 200
```

**Nguyên nhân:** questions array có data nhưng không truy cập được index 0

**Giải pháp:** Check xem questions[0] có data không

### Case 2: questions array empty sau khi set

**Logs:**
```
📝 Questions set in state: 200 questions
📍 Current state - questions.length: 0, timeLeft: -1
```

**Nguyên nhân:** setQuestions không update state đúng

**Giải pháp:** Check React strict mode, có thể component mount 2 lần

### Case 3: Infinite re-render loop

**Logs:** Console bị spam logs

**Nguyên nhân:** useEffect dependencies không đúng

**Giải pháp:** Đã thêm `eslint-disable` comment

## Nếu vẫn bị white screen

### Check browser console errors

Mở Console tab, tìm errors màu đỏ:
```
Uncaught TypeError: Cannot read property 'xxx' of undefined
```

Nếu có error, copy **full stack trace** và gửi cho tôi.

### Check Network tab

1. F12 → tab **Network**
2. Refresh trang
3. Check xem có request nào fail không (màu đỏ)

### Export console logs

```javascript
// Paste vào Console tab để export logs
copy(console.log.history || 'No logs available')
```

Sau đó paste cho tôi để phân tích.

## Next Steps

Nếu vẫn bị white screen sau khi thử tất cả:

1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh (Ctrl+F5)
3. Try incognito mode (Ctrl+Shift+N)
4. Check if there are any React errors in console
5. Send me screenshot of:
   - Console logs
   - Network tab
   - React DevTools state












