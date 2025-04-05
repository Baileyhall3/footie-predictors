class DateUtils {
    static toLongDate(date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) return 'Invalid Date';
        return parsedDate.toDateString(); // Example: "Mon Dec 30 2024"
    }

    static toFullDateTime(date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) return 'Invalid Date';
    
        return parsedDate.toLocaleString('en-GB', {
            weekday: 'short',  // "Mon"
            year: 'numeric',   // "2024"
            month: 'short',    // "Dec"
            day: '2-digit',    // "30"
            hour: '2-digit',   // "15"
            minute: '2-digit', // "00"
            hour12: false      // Use 24-hour format
        }).replace(',', '');  // Example: Mon Dec 30 2024 15:00
    }    

    static toShortDayMonth(date, dayContext = false) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) return 'Invalid Date';
    
        if (dayContext) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to midnight
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
    
            // Compare only the date part
            const parsedDateStr = parsedDate.toDateString();
            const todayStr = today.toDateString();
            const yesterdayStr = yesterday.toDateString();
            const tomorrowStr = tomorrow.toDateString();
    
            if (parsedDateStr === todayStr) return 'Today';
            if (parsedDateStr === yesterdayStr) return 'Yesterday';
            if (parsedDateStr === tomorrowStr) return 'Tomorrow';    
        }
    
        const options = { weekday: 'short', month: 'short', day: '2-digit' };
        return parsedDate.toLocaleDateString('en-US', options);
    }
    

    static toShortDate(date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) return 'Invalid Date';

        const day = String(parsedDate.getDate()).padStart(2, '0');
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const year = parsedDate.getFullYear();

        return `${day}/${month}/${year}`; // Example: "30/12/2024"
    }

    static toDateTime(date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) return 'Invalid Date';

        const shortDate = DateUtils.toShortDate(parsedDate);
        const hours = String(parsedDate.getHours()).padStart(2, '0');
        const minutes = String(parsedDate.getMinutes()).padStart(2, '0');

        return `${shortDate} ${hours}:${minutes}`; // Example: "30/12/2024 15:45"
    }

    static toTime(date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) return 'Invalid Date';
    
        return parsedDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }     // Example: "15:45"

    static toInputFormatDate(date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) return 'Invalid Date';

        const day = String(parsedDate.getDate()).padStart(2, '0');
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const year = parsedDate.getFullYear();

        return `${year}-${month}-${day}`; // Example: "2024-12-30"
    }

    static getLast7Days() {
        let today = new Date();
        let last7Days = [];
    
        for (let i = 6; i >= 0; i--) {
            let date = new Date();
            date.setDate(today.getDate() - i);
            
            // Format the date as DD/MM/YYYY
            const formattedDate = ("0" + date.getDate()).slice(-2) + "/" +
                                  ("0" + (date.getMonth() + 1)).slice(-2) + "/" +
                                  date.getFullYear();
            last7Days.push(formattedDate);
        }
    
        return last7Days;
    }
}

export default DateUtils;