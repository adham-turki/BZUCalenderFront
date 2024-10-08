import {  useState } from 'react';
import { FaBook, FaCode, FaDoorClosed, FaCalendarAlt, FaClock, FaChalkboardTeacher, FaListAlt } from 'react-icons/fa';
import CourseTable from './CourseTable';
import TimelineTable from './TimelineTable';

const ScheduleForm = () => {
  const [formData, setFormData] = useState({
    course_code: '',
    course_name_ar: '',
    course_name_en: '',
    teaching_language: '',
    course_type: '',
    course_section: '',
    course_instructor: '',
    course_room: '',
    course_days: '',
    course_time: '',
  });

  const [schedule, setSchedule] = useState([]);
  const [timelineSchedule, setTimelineSchedule] = useState({});
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'course_code' && value.length > 0) {
      fetchSuggestions(value);
    } else if (name === 'course_code') {
      setSuggestions([]);
    }
  };

  const fetchSuggestions = async (courseCode) => {
    try {
      const res = await fetch(`http://localhost:3000/search?courseCode=${courseCode}`);
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSuggestionClick = (course) => {
    setFormData({
      course_code: course.course_code,
      course_name_ar: course.course_name_ar,
      course_name_en: course.course_name_en,
      teaching_language: course.teaching_language,
      course_type: course.course_type,
      course_section: course.course_section,
      course_instructor: course.course_instructor,
      course_room: course.course_room,
      course_days: course.course_days,
      course_time: course.course_time,
    });
    setSuggestions([]);
  };

  const handleAddRecord = () => {
    const requiredFields = [
      formData.course_code,
      formData.course_name_en,
      formData.course_section,
      formData.course_instructor,
      formData.course_room,
      formData.course_days,
      formData.course_time,
    ];

    if (requiredFields.some(field => field.trim() === '')) {
      alert("الرجاء ادخال رمز المساق");
      return;
    }

    const startTime = formData.course_time.split(' - ')[0];
    const endTime = formData.course_time.split(' - ')[1];
    const courseEntry = {
      courseCode: formData.course_code,
      courseName: formData.course_name_en,
      CourseArabic: formData.course_name_ar,
      course_instructor: formData.course_instructor,
      course_section: formData.course_section,
      room: formData.course_room,
      days: formData.course_days,
      startTime: startTime,
      endTime: endTime,
    };

    setSchedule([...schedule, courseEntry]);

    const days = formData.course_days.split(',').map(day => day.trim());
  
    days.forEach(day => {
      const timeSlots = timelineSchedule[day] || {};
      const start = parseInt(startTime.replace(':', ''), 10);
      const end = parseInt(endTime.replace(':', ''), 10);
  
      for (let time = start; time < end; time++) {
        timeSlots[time] = formData.course_code;
      }
      setTimelineSchedule(prev => ({
        ...prev,
        [day]: timeSlots,
      }));
    });

    setFormData({
      course_code: '',
      course_name_ar: '',
      course_name_en: '',
      teaching_language: '',
      course_type: '',
      course_section: '',
      course_instructor: '',
      course_room: '',
      course_days: '',
      course_time: '',
    });
    setSuggestions([]);
  };

  return (
    <>
      {/* Header */}
      <div className="h-32 w-full bg-gradient-to-r from-blue-600 to-blue-400 flex justify-center items-center py-8 shadow-lg">
        <h1 className="text-4xl sm:text-3xl font-extrabold text-white">إنشاء التقويم</h1>
      </div>

      {/* Form Section */}
      <div className="flex flex-col items-center p-4 mt-6 w-full">
        <div className="w-full max-w-xl bg-white p-6 rounded-lg shadow-lg">
          <div className="space-y-4" dir="rtl">
            <h2 className="text-2xl sm:text-xl font-semibold text-gray-800 text-center">أدخل رمز المساق</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Course Code */}
              <div className="relative">
                <FaCode className="absolute top-3 right-3 text-gray-500" />
                <input
                  name="course_code"
                  value={formData.course_code}
                  onChange={handleChange}
                  className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-sm"
                  type="text"
                  placeholder="رمز المساق"
                />

                {/* Display suggestions */}
                {suggestions.length > 0 && (
                  <ul className="absolute z-20 top-12 right-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                    {suggestions.map((course, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-sm"
                        onClick={() => handleSuggestionClick(course)}
                      >
                        {course.course_code}/section {course.course_section} - {course.course_name_en}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Course Name */}
              <div className="relative">
                <FaBook className="absolute top-3 right-3 text-gray-500" />
                <input
                  name="course_name_en"
                  readOnly
                  value={formData.course_name_en}
                  className="w-full pr-10 py-2 border border-gray-300 rounded-lg cursor-default bg-gray-100 text-gray-600 text-right text-sm"
                  type="text"
                  placeholder="اسم المساق"
                />
              </div>

              {/* Instructor */}
              <div className="relative">
                <FaChalkboardTeacher className="absolute top-3 right-3 text-gray-500" />
                <input
                  name="course_instructor"
                  readOnly
                  value={formData.course_instructor}
                  className="w-full pr-10 py-2 border border-gray-300 rounded-lg cursor-default bg-gray-100 text-gray-600 text-right text-sm"
                  type="text"
                  placeholder="مدرس المساق"
                />
              </div>

              {/* Section */}
              <div className="relative">
                <FaListAlt className="absolute top-3 right-3 text-gray-500" />
                <input
                  name="course_section"
                  readOnly
                  value={formData.course_section}
                  className="w-full pr-10 py-2 border border-gray-300 rounded-lg cursor-default bg-gray-100 text-gray-600 text-right text-sm"
                  type="text"
                  placeholder="رقم الشعبة"
                />
              </div>

              {/* Room Number */}
              <div className="relative">
                <FaDoorClosed className="absolute top-3 right-3 text-gray-500" />
                <input
                  name="course_room"
                  readOnly
                  value={formData.course_room}
                  className="w-full pr-10 py-2 border border-gray-300 rounded-lg cursor-default bg-gray-100 text-gray-600 text-right text-sm"
                  type="text"
                  placeholder="رقم القاعة"
                />
              </div>

              {/* Days */}
              <div className="relative">
                <FaCalendarAlt className="absolute top-3 right-3 text-gray-500" />
                <input
                  name="course_days"
                  readOnly
                  value={formData.course_days}
                  className="w-full pr-10 py-2 border border-gray-300 rounded-lg cursor-default bg-gray-100 text-gray-600 text-right text-sm"
                  type="text"
                  placeholder="الأيام"
                />
              </div>

              {/* Time */}
              <div className="relative">
                <FaClock className="absolute top-3 right-3 text-gray-500" />
                <input
                  name="course_time"
                  readOnly
                  value={formData.course_time}
                  className="w-full pr-10 py-2 border border-gray-300 rounded-lg cursor-default bg-gray-100 text-gray-600 text-right text-sm"
                  type="text"
                  placeholder="الوقت"
                />
              </div>
            </div>

            {/* Add Record Button */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={handleAddRecord}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-6 rounded-lg text-base sm:text-sm font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition duration-200"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        {schedule.length !== 0 && (
          <div className="w-full mt-6">
            <CourseTable schedule={schedule} />
          </div>
        )}

        {/* Timeline Table */}
        <div className="w-full mt-6">
          <TimelineTable timelineSchedule={timelineSchedule} />
        </div>
      </div>
    </>
  );
};

export default ScheduleForm;
