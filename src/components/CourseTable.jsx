import PropTypes from 'prop-types';

const CourseTable = ({ schedule }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-400 shadow-lg">
        <thead>
          <tr className="bg-blue-600 text-white text-center shadow">
            <th className="border border-blue-600 p-1 font-bold text-xs">رمز المساق</th>
            <th className="border border-blue-600 p-1 font-bold text-xs">اسم المساق</th>
            <th className="border border-blue-600 p-1 font-bold text-xs">اسم المساق بالعربي</th>
            <th className="border border-blue-600 p-1 font-bold text-xs">اسم المدرس</th>
            <th className="border border-blue-600 p-1 font-bold text-xs">رقم الشعبة</th>
            <th className="border border-blue-600 p-1 font-bold text-xs">رقم القاعة</th>
            <th className="border border-blue-600 p-1 font-bold text-xs">الأيام</th>
            <th className="border border-blue-600 p-1 font-bold text-xs">وقت البداية</th>
            <th className="border border-blue-600 p-1 font-bold text-xs">وقت النهاية</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((record, index) => (
            <tr
              key={index}
              className={`text-center ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-100`}
            >
              <td className="border border-gray-300 p-1 text-xs">{record.courseCode}</td>
              <td className="border border-gray-300 p-1 text-xs">{record.courseName}</td>
              <td className="border border-gray-300 p-1 text-xs">{record.CourseArabic}</td>
              <td className="border border-gray-300 p-1 text-xs">{record.course_instructor}</td>
              <td className="border border-gray-300 p-1 text-xs">{record.course_section}</td>
              <td className="border border-gray-300 p-1 text-xs">{record.room}</td>
              <td className="border border-gray-300 p-1 text-xs">{record.days}</td>
              <td className="border border-gray-300 p-1 text-xs">{record.startTime}</td>
              <td className="border border-gray-300 p-1 text-xs">{record.endTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

CourseTable.propTypes = {
  schedule: PropTypes.arrayOf(
    PropTypes.shape({
      courseCode: PropTypes.string.isRequired,
      courseName: PropTypes.string.isRequired,
      building: PropTypes.string.isRequired,
      room: PropTypes.string.isRequired,
      days: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
      endTime: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default CourseTable;
