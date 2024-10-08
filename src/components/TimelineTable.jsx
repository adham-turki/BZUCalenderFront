
const weeklyTimelineData = [
  { day: 'Saturday', courses: [{ courseName: 'COMP2331', start: '07:00', end: '08:50' }, { courseName: 'COMP432', start: '09:00', end: '10:50' }] },
  { day: 'Monday', courses: [{ courseName: 'COMP2331', start: '08:00', end: '08:50' }, { courseName: 'COMP432', start: '10:00', end: '11:50' }] },
  { day: 'Tuesday', courses: [{ courseName: 'COMP2331', start: '07:00', end: '07:50' }, { courseName: 'COMP431', start: '09:00', end: '10:50' }] },
  { day: 'Wednesday', courses: [{ courseName: 'COMP2331', start: '07:00', end: '08:00' }, { courseName: 'COMP432', start: '08:00', end: '09:20' }] },
  { day: 'Thursday', courses: [{ courseName: 'COMP2331', start: '08:00', end: '08:50' }, { courseName: 'COMP432', start: '10:00', end: '11:50' }] },
];

const TimeLineTable = () => {
  const hours = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const timeToMinutes = (timeStr) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    return hour * 60 + minute;
  };

  const calculateSpan = (start, end) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    return Math.ceil((endMinutes - startMinutes) / 60);
  };

  const renderCourses = (courses) => {
    let courseIndex = 0;
    let hourIndex = 0;
    const row = [];

    while (hourIndex < hours.length) {
      const currentHour = hours[hourIndex];
      const currentHourMinutes = timeToMinutes(currentHour);
      const course = courses[courseIndex];

      if (course && timeToMinutes(course.start) === currentHourMinutes) {
        const span = calculateSpan(course.start, course.end);
        row.push(
          <td
            key={currentHour}
            className="border border-black bg-green-200 text-sm " // Bold course names
            colSpan={span}
            style={{ width: `${100 * span / (hours.length + 1)}%` }}
          >
            <span className=''></span>{course.courseName} {course.start}-{course.end}
          </td>
        );
        hourIndex += span;
        courseIndex++;
      } else {
        row.push(
          <td key={currentHour} className="border-b border-black" style={{ width: `${100 / (hours.length + 1)}%` }}>
            &nbsp;
          </td>
        );
        hourIndex++;
      }
    }

    return row;
  };

  return (
    <div className="flex flex-col mt-6">
      <div className="overflow-x-auto">
        <table className="table-auto w-full min-w-max">
          <thead>
            <tr className="bg-gray-400">
              <th className="border border-black font-bold" style={{ width: `${100 / (hours.length + 1)}%` }}>Day</th>
              {hours.map((hour) => (
                <th key={hour} className="border border-black font-bold" style={{ width: `${100 / (hours.length + 1)}%` }}>
                  {hour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeklyTimelineData.map((row, index) => (
              <tr key={index} className="text-center">
                <td className="border border-black font-bold">{row.day}</td> {/* Bold day names */}
                {renderCourses(row.courses)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeLineTable;
