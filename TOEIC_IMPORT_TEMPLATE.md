# 📊 TOEIC Import Template - Test All 7 Parts

## 🎯 **MỤC ĐÍCH**
Template để test import functionality cho tất cả 7 parts của TOEIC

## 📋 **CẤU TRÚC TEMPLATE**

### **📄 Sheet 1: Part 1 - Photos**
```csv
part,difficulty,prompt_text,choiceA,choiceB,choiceC,choiceD,correct_choice,explain_vi,explain_en,tags,status,image_url
1,easy,"Look at the photo","A man is reading a book","A woman is cooking","A child is playing","A dog is sleeping",A,"Người đàn ông đang đọc sách","A man is reading a book","photos,reading",published,"https://example.com/photo1.jpg"
1,medium,"Look at the photo","People are meeting","People are eating","People are shopping","People are exercising",A,"Mọi người đang họp","People are meeting","photos,meeting",published,"https://example.com/photo2.jpg"
```

### **📄 Sheet 2: Part 2 - Question-Response**
```csv
part,difficulty,prompt_text,choiceA,choiceB,choiceC,correct_choice,explain_vi,explain_en,tags,status,audio_url
2,easy,"Where is the meeting room?","It's on the second floor","Yes, I can help you","No, it's not available",A,"Phòng họp ở tầng hai","It's on the second floor","location,meeting",published,"https://example.com/audio1.mp3"
2,medium,"When does the store close?","At 9 PM","It's very expensive","I don't like shopping",A,"Cửa hàng đóng cửa lúc 9 giờ tối","At 9 PM","time,store",published,"https://example.com/audio2.mp3"
```

### **📄 Sheet 3: Part 3 - Conversations**
```csv
part,difficulty,prompt_text,choiceA,choiceB,choiceC,choiceD,correct_choice,explain_vi,explain_en,tags,status,passage_id,audio_url
3,easy,"What are they discussing?","A business proposal","A vacation plan","A new product","A job interview",A,"Họ đang thảo luận về đề xuất kinh doanh","They are discussing a business proposal","conversation,business",published,"passage_3_1","https://example.com/audio3.mp3"
3,medium,"Why is the man concerned?","The deadline is too tight","The budget is too high","The team is too small","The location is too far",A,"Người đàn ông lo lắng vì deadline quá gấp","The deadline is too tight","conversation,concern",published,"passage_3_2","https://example.com/audio4.mp3"
```

### **📄 Sheet 4: Part 4 - Talks**
```csv
part,difficulty,prompt_text,choiceA,choiceB,choiceC,choiceD,correct_choice,explain_vi,explain_en,tags,status,passage_id,audio_url
4,easy,"What is the main topic?","Company policies","Employee benefits","Safety procedures","Training programs",C,"Chủ đề chính là quy trình an toàn","The main topic is safety procedures","talk,safety",published,"passage_4_1","https://example.com/audio5.mp3"
4,medium,"Who should attend?","All employees","Only managers","New hires only","Part-time workers only",A,"Tất cả nhân viên nên tham dự","All employees should attend","talk,attendance",published,"passage_4_2","https://example.com/audio6.mp3"
```

### **📄 Sheet 5: Part 5 - Incomplete Sentences**
```csv
part,difficulty,prompt_text,choiceA,choiceB,choiceC,choiceD,correct_choice,explain_vi,explain_en,tags,status
5,easy,"The meeting will be held _____ the conference room.","in","on","at","by",A,"Cuộc họp sẽ được tổ chức trong phòng hội nghị","The meeting will be held in the conference room","grammar,preposition",published
5,medium,"_____ the weather was bad, the event was successful.","Although","Because","Since","If",A,"Mặc dù thời tiết xấu, sự kiện vẫn thành công","Although the weather was bad, the event was successful","grammar,conjunction",published
```

### **📄 Sheet 6: Part 6 - Text Completion**
```csv
part,difficulty,prompt_text,choiceA,choiceB,choiceC,choiceD,correct_choice,explain_vi,explain_en,tags,status,passage_id,blank_index
6,easy,"The company is looking _____ new employees.","for","at","in","on",A,"Công ty đang tìm kiếm nhân viên mới","The company is looking for new employees","grammar,preposition",published,"passage_6_1",1
6,medium,"_____ the recent changes, we need to update our procedures.","Due to","In spite of","Instead of","Apart from",A,"Do những thay đổi gần đây, chúng ta cần cập nhật quy trình","Due to the recent changes, we need to update our procedures","grammar,phrase",published,"passage_6_1",2
```

### **📄 Sheet 7: Part 7 - Reading Comprehension**
```csv
part,difficulty,prompt_text,choiceA,choiceB,choiceC,choiceD,correct_choice,explain_vi,explain_en,tags,status,passage_id
7,easy,"What is the main purpose of the email?","To schedule a meeting","To cancel an appointment","To request information","To confirm attendance",A,"Mục đích chính của email là lên lịch cuộc họp","The main purpose of the email is to schedule a meeting","reading,email",published,"passage_7_1"
7,medium,"According to the notice, when will the office be closed?","Monday","Tuesday","Wednesday","Thursday",B,"Theo thông báo, văn phòng sẽ đóng cửa vào thứ Ba","According to the notice, the office will be closed on Tuesday","reading,notice",published,"passage_7_2"
```

## 📖 **PASSAGE TEMPLATES**

### **📄 Sheet 8: Passages for Parts 3, 4, 6, 7**
```csv
id,part,passage_type,texts,audio_url,image_url,created_by
passage_3_1,3,conversation,"{""title"": ""Business Meeting"", ""content"": ""A: Good morning, everyone. Let's start our weekly meeting. B: Morning! I have the quarterly report ready. A: Great! Can you share the key findings? B: Sure. Our sales increased by 15% this quarter.""}",https://example.com/audio3.mp3,,user123
passage_3_2,3,conversation,"{""title"": ""Project Discussion"", ""content"": ""A: I'm worried about the deadline. B: Why? We still have two weeks. A: Yes, but the client wants changes. B: What kind of changes? A: They want additional features.""}",https://example.com/audio4.mp3,,user123
passage_4_1,4,talk,"{""title"": ""Safety Training"", ""content"": ""Good morning, everyone. Today we'll discuss safety procedures. First, always wear protective equipment. Second, report any incidents immediately. Third, follow the emergency evacuation plan.""}",https://example.com/audio5.mp3,,user123
passage_4_2,4,talk,"{""title"": ""Company Meeting"", ""content"": ""Attention all employees. The annual company meeting will be held next Friday at 2 PM in the main auditorium. All employees are required to attend. Please arrive 10 minutes early.""}",https://example.com/audio6.mp3,,user123
passage_6_1,6,text_completion,"{""title"": ""Job Advertisement"", ""content"": ""Our company is looking _____ new employees to join our team. We offer competitive salaries and excellent benefits. _____ the recent changes in our industry, we need skilled professionals who can adapt quickly.""}",,,user123
passage_7_1,7,email,"{""title"": ""Meeting Request"", ""content"": ""Subject: Meeting Request\\n\\nDear Team,\\n\\nI would like to schedule a meeting to discuss the new project proposal. Please let me know your availability for next week.\\n\\nBest regards,\\nManager""}",,,user123
passage_7_2,7,notice,"{""title"": ""Office Closure"", ""content"": ""NOTICE\\n\\nOffice Closure\\n\\nDue to maintenance work, the office will be closed on Tuesday, January 15th. All employees should work from home on this day. Normal operations will resume on Wednesday.\\n\\nThank you for your understanding.\\n\\nManagement""}",,,user123
```

## 🧪 **TEST SCENARIOS**

### **✅ Test Case 1: Valid Import**
- Import all 7 parts with correct data
- Expected: All questions imported successfully
- Check: Database has correct count

### **✅ Test Case 2: Invalid Data**
- Import with missing required fields
- Expected: Validation errors shown
- Check: Error messages are clear

### **✅ Test Case 3: Mixed Difficulty**
- Import questions with different difficulty levels
- Expected: All difficulties imported
- Check: Filter by difficulty works

### **✅ Test Case 4: Passage Dependencies**
- Import Parts 3,4,6,7 without passages
- Expected: Error about missing passages
- Check: Import passages first, then questions

### **✅ Test Case 5: Large Batch**
- Import 100+ questions at once
- Expected: Batch processing works
- Check: Progress indicator shows

## 🔧 **TESTING STEPS**

1. **Prepare Data:**
   - Create Excel file with all sheets
   - Fill in sample data for each part
   - Include both valid and invalid examples

2. **Test Import:**
   - Upload Excel file
   - Check validation messages
   - Verify data import

3. **Verify Results:**
   - Check database records
   - Test question display
   - Verify passage relationships

4. **Test Edge Cases:**
   - Empty fields
   - Invalid formats
   - Large files
   - Special characters

## 📊 **EXPECTED RESULTS**

### **Success Metrics:**
- ✅ All 7 parts imported
- ✅ Passages created correctly
- ✅ Questions linked to passages
- ✅ Validation working
- ✅ Error handling working

### **Performance Metrics:**
- ⏱️ Import time < 30 seconds
- 💾 Memory usage stable
- 🔄 Progress indicator working
- 📊 Batch processing efficient

---

*Template created for comprehensive TOEIC import testing*
*Last updated: January 2024*




