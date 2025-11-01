// Автоматическая сортировка записей по датам и добавление счетчика дней в тундре
(function() {
    const main = document.querySelector('main');
    if (!main) return;
    
    const entries = Array.from(main.querySelectorAll('.journal-entry'));
    
    // Дата начала жизни в тундре
    const startDate = new Date(2025, 2, 23); // 23 марта 2025
    
    // Функция для парсинга даты
    function parseDate(dateStr) {
        const months = {
            'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
            'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
            'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
        };
        
        // Парсинг формата "8 мая 2025" или "1 августа" или "20 марта 2025"
        const match = dateStr.match(/(\d{1,2})\s+([а-яё]+)(?:\s+(\d{4}))?/i);
        if (match) {
            const day = parseInt(match[1]);
            const monthName = match[2].toLowerCase();
            // Если год не указан, используем 2025 по умолчанию
            const year = match[3] ? parseInt(match[3]) : 2025;
            const month = months[monthName];
            
            if (month !== undefined) {
                return new Date(year, month, day);
            }
        }
        
        return new Date(0); // Если не удалось распарсить, ставим в начало
    }
    
    // Функция для вычисления количества дней в тундре
    function calculateDaysInTundra(entryDate) {
        // Нормализуем даты (убираем время)
        const date1 = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
        const date2 = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        
        // Вычисляем разницу в миллисекундах
        const diffTime = date1 - date2;
        // Конвертируем в дни
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }
    
    // Добавление счетчика дней к каждой записи
    entries.forEach(entry => {
        const dateElement = entry.querySelector('.date');
        if (!dateElement) return;
        
        // Получаем только текст даты без счетчика (если он уже есть)
        let dateText = dateElement.textContent.trim();
        // Удаляем счетчик дней, если он уже был добавлен
        dateText = dateText.replace(/День\s+\d+.*$/, '').trim();
        
        const entryDate = parseDate(dateText);
        
        // Если дата была успешно распарсена
        if (entryDate.getTime() !== 0) {
            const daysInTundra = calculateDaysInTundra(entryDate);
            
            // Показываем счетчик только если дата >= 23 марта 2025
            if (daysInTundra >= 0) {
                // Проверяем, есть ли уже счетчик
                if (!dateElement.querySelector('.day-counter')) {
                    const counter = document.createElement('span');
                    counter.className = 'day-counter';
                    counter.textContent = `День ${daysInTundra + 1}`; // +1 потому что первый день считается как день 1
                    dateElement.appendChild(counter);
                }
            }
        }
    });
    
    // Сортировка записей
    entries.sort((a, b) => {
        const dateA = a.querySelector('.date');
        const dateB = b.querySelector('.date');
        
        if (!dateA || !dateB) return 0;
        
        const parsedA = parseDate(dateA.textContent.trim());
        const parsedB = parseDate(dateB.textContent.trim());
        
        return parsedA - parsedB;
    });
    
    // Добавление ID к записям для навигации
    const dateIdMap = new Map(); // Для отслеживания первой записи каждой даты
    const dayIdMap = new Map(); // Для отслеживания первой записи каждого дня
    
    entries.forEach((entry, index) => {
        const dateElement = entry.querySelector('.date');
        if (dateElement) {
            // Получаем только текст даты без счетчика
            let dateText = dateElement.textContent.trim();
            // Удаляем счетчик дней, если он есть
            dateText = dateText.replace(/День\s+\d+.*$/, '').trim();
            const entryDate = parseDate(dateText);
            
            if (entryDate.getTime() !== 0) {
                const daysInTundra = calculateDaysInTundra(entryDate);
                const dateStr = entryDate.toISOString().split('T')[0];
                
                entry.dataset.date = dateStr;
                
                // Добавляем ID по дате (только для первой записи с этой датой)
                if (!dateIdMap.has(dateStr)) {
                    entry.id = `entry-date-${dateStr}`;
                    dateIdMap.set(dateStr, entry);
                }
                
                // Добавляем ID по дню (только для первой записи этого дня)
                if (daysInTundra >= 0) {
                    const dayNum = daysInTundra + 1;
                    entry.dataset.day = dayNum;
                    
                    if (!dayIdMap.has(dayNum)) {
                        // Если у записи еще нет ID, присваиваем по дню
                        // Если ID уже есть (по дате), используем его, но сохраняем в dayIdMap
                        if (!entry.id) {
                            entry.id = `entry-day-${dayNum}`;
                        }
                        dayIdMap.set(dayNum, entry);
                    }
                }
            }
            
            // Если ID не установлен, устанавливаем по индексу
            if (!entry.id) {
                entry.id = `entry-${index}`;
            }
        } else {
            entry.id = `entry-${index}`;
        }
    });
    
    // Переместить отсортированные записи
    entries.forEach(entry => {
        main.appendChild(entry);
    });
    
    // Создание календаря
    const calendarList = document.getElementById('calendarList');
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    let currentMode = 'days';
    
    // Сбор уникальных дат и дней
    const datesMap = new Map();
    const daysMap = new Map();
    
    entries.forEach(entry => {
        const dateElement = entry.querySelector('.date');
        if (!dateElement) return;
        
        // Получаем только текст даты без счетчика
        // Сначала проверяем, есть ли элемент счетчика
        const dayCounter = dateElement.querySelector('.day-counter');
        let dateText = dateElement.textContent.trim();
        
        // Если есть счетчик, удаляем его текст
        if (dayCounter) {
            dateText = dateText.replace(dayCounter.textContent, '').trim();
        } else {
            // Удаляем текст "День X", если он есть в тексте
            dateText = dateText.replace(/День\s+\d+.*$/, '').trim();
        }
        
        const entryDate = parseDate(dateText);
        
        if (entryDate.getTime() !== 0) {
            const dateStr = entryDate.toISOString().split('T')[0];
            const daysInTundra = calculateDaysInTundra(entryDate);
            
            if (daysInTundra >= 0) {
                const dayNum = daysInTundra + 1;
                if (!daysMap.has(dayNum)) {
                    daysMap.set(dayNum, {
                        day: dayNum,
                        date: entryDate,
                        dateText: dateText
                    });
                }
            }
            
            if (!datesMap.has(dateStr)) {
                datesMap.set(dateStr, {
                    date: entryDate,
                    dateText: dateText,
                    day: daysInTundra >= 0 ? daysInTundra + 1 : null
                });
            }
        }
    });
    
    // Функция для отображения календаря
    function renderCalendar(mode) {
        calendarList.innerHTML = '';
        
        if (mode === 'days') {
            const sortedDays = Array.from(daysMap.values()).sort((a, b) => a.day - b.day);
            sortedDays.forEach(item => {
                const calendarItem = document.createElement('div');
                calendarItem.className = 'calendar-item';
                calendarItem.textContent = `День ${item.day}`;
                calendarItem.dataset.day = item.day;
                calendarItem.addEventListener('click', () => {
                    scrollToEntry(`entry-day-${item.day}`);
                    setActiveItem(calendarItem);
                });
                calendarList.appendChild(calendarItem);
            });
        } else {
            const sortedDates = Array.from(datesMap.values()).sort((a, b) => a.date - b.date);
            sortedDates.forEach(item => {
                const calendarItem = document.createElement('div');
                calendarItem.className = 'calendar-item';
                // Убираем счетчик дней из текста даты, если он там есть
                let cleanDateText = item.dateText.replace(/День\s+\d+.*$/, '').trim();
                // Убираем год из даты (оставляем только день и месяц)
                cleanDateText = cleanDateText.replace(/\s+\d{4}$/, '').trim();
                calendarItem.textContent = cleanDateText;
                calendarItem.dataset.date = item.date.toISOString().split('T')[0];
                calendarItem.addEventListener('click', () => {
                    scrollToEntry(`entry-date-${item.date.toISOString().split('T')[0]}`);
                    setActiveItem(calendarItem);
                });
                calendarList.appendChild(calendarItem);
            });
        }
    }
    
    // Функция прокрутки к записи
    function scrollToEntry(entryId) {
        let entry = document.getElementById(entryId);
        
        // Если не нашли по ID, пробуем найти по dataset.day
        if (!entry && entryId.startsWith('entry-day-')) {
            const dayNum = parseInt(entryId.replace('entry-day-', ''));
            entry = Array.from(entries).find(e => e.dataset.day == dayNum);
        }
        
        if (entry) {
            entry.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    // Функция установки активного элемента
    function setActiveItem(activeItem) {
        document.querySelectorAll('.calendar-item').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }
    
    // Переключение режимов
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            renderCalendar(currentMode);
        });
    });
    
    // Отслеживание прокрутки для подсветки активного элемента
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const visibleEntries = entries.filter(entry => {
                const rect = entry.getBoundingClientRect();
                return rect.top >= 0 && rect.top < window.innerHeight / 2;
            });
            
            if (visibleEntries.length > 0) {
                const visibleEntry = visibleEntries[0];
                const dateElement = visibleEntry.querySelector('.date');
                if (dateElement) {
                    // Получаем только текст даты без счетчика
                    let dateText = dateElement.textContent.trim();
                    // Удаляем счетчик дней, если он есть
                    dateText = dateText.replace(/День\s+\d+.*$/, '').trim();
                    const entryDate = parseDate(dateText);
                    
                    if (entryDate.getTime() !== 0) {
                        if (currentMode === 'days') {
                            const daysInTundra = calculateDaysInTundra(entryDate);
                            if (daysInTundra >= 0) {
                                const dayItem = calendarList.querySelector(`[data-day="${daysInTundra + 1}"]`);
                                if (dayItem) setActiveItem(dayItem);
                            }
                        } else {
                            const dateStr = entryDate.toISOString().split('T')[0];
                            const dateItem = calendarList.querySelector(`[data-date="${dateStr}"]`);
                            if (dateItem) setActiveItem(dateItem);
                        }
                    }
                }
            }
        }, 100);
    });
    
    // Инициализация календаря
    renderCalendar(currentMode);
    
    // Добавить плавную анимацию появления
    entries.forEach((entry, index) => {
        entry.style.opacity = '0';
        entry.style.transform = 'translateY(20px)';
        setTimeout(() => {
            entry.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            entry.style.opacity = '1';
            entry.style.transform = 'translateY(0)';
        }, index * 50);
    });
})();

