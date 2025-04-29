$(document).ready(function() {
    let currentDate = new Date();
    let selectedDate = new Date();
    let memos = JSON.parse(localStorage.getItem('memos')) || {};

    function updateCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        $('#currentMonth').text(`${year}년 ${month + 1}월`);
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        let calendarHTML = '';
        
        // 이전 달의 날짜들
        for (let i = 0; i < startingDay; i++) {
            calendarHTML += '<div class="calendar-day"></div>';
        }
        
        // 현재 달의 날짜들
        for (let day = 1; day <= totalDays; day++) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = isSameDay(new Date(year, month, day), new Date());
            const isSelected = isSameDay(new Date(year, month, day), selectedDate);
            const memoCount = memos[dateString] ? memos[dateString].length : 0;
            
            let className = 'calendar-day';
            if (isToday) className += ' today';
            if (isSelected) className += ' selected';
            if (memoCount > 0) className += ' has-memo';
            
            calendarHTML += `
                <div class="${className}" data-date="${dateString}">
                    <span class="day-number">${day}</span>
                    ${memoCount > 0 ? `<span class="memo-count">${memoCount}</span>` : ''}
                </div>
            `;
        }
        
        $('#calendarDays').html(calendarHTML);
        
        // 날짜 클릭 이벤트
        $('.calendar-day').click(function() {
            const dateStr = $(this).data('date');
            if (dateStr) {
                selectedDate = new Date(dateStr);
                updateCalendar();
                loadMemo();
            }
        });
    }
    
    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    function loadMemo() {
        const dateString = formatDate(selectedDate);
        $('#selectedDate').text(dateString);
        $('#memoText').val('');
        
        // 메모 목록 표시
        let memoListHTML = '';
        if (memos[dateString] && memos[dateString].length > 0) {
            memos[dateString].forEach((memo, index) => {
                memoListHTML += `
                    <div class="memo-item">
                        <div class="memo-content">${memo.content}</div>
                        <div class="memo-time">${memo.time}</div>
                        <button class="delete-memo" data-index="${index}">&times;</button>
                    </div>
                `;
            });
        }
        $('#memoList').html(memoListHTML);
        
        // 메모 삭제 이벤트
        $('.delete-memo').click(function() {
            const index = $(this).data('index');
            memos[dateString].splice(index, 1);
            if (memos[dateString].length === 0) {
                delete memos[dateString];
            }
            localStorage.setItem('memos', JSON.stringify(memos));
            loadMemo();
            updateCalendar();
        });
    }
    
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    function formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // 이전 달 버튼
    $('#prevMonth').click(function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });
    
    // 다음 달 버튼
    $('#nextMonth').click(function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });
    
    // 메모 저장
    $('#saveMemo').click(function() {
        const memoText = $('#memoText').val().trim();
        if (memoText) {
            const dateString = formatDate(selectedDate);
            if (!memos[dateString]) {
                memos[dateString] = [];
            }
            
            memos[dateString].push({
                content: memoText,
                time: formatTime(new Date())
            });
            
            localStorage.setItem('memos', JSON.stringify(memos));
            $('#memoText').val('');
            loadMemo();
            updateCalendar();
        }
    });
    
    // Enter 키로 메모 저장
    $('#memoText').keypress(function(e) {
        if (e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            $('#saveMemo').click();
        }
    });
    
    // 초기화
    updateCalendar();
    loadMemo();
}); 