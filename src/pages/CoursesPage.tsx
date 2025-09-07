import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  Star,
  TrendingUp,
  BookOpen,
  Video,
  FileText,
  Award,
} from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Advanced React Development',
    instructor: 'John Doe',
    category: 'Web Development',
    students: 1234,
    rating: 4.8,
    duration: '24 hours',
    progress: 75,
    image: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=React',
    modules: 12,
    assignments: 8,
  },
  {
    id: 2,
    title: 'Machine Learning Fundamentals',
    instructor: 'Jane Smith',
    category: 'Data Science',
    students: 892,
    rating: 4.9,
    duration: '32 hours',
    progress: 60,
    image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=ML',
    modules: 15,
    assignments: 10,
  },
  {
    id: 3,
    title: 'UI/UX Design Masterclass',
    instructor: 'Sarah Williams',
    category: 'Design',
    students: 567,
    rating: 4.7,
    duration: '18 hours',
    progress: 90,
    image: 'https://via.placeholder.com/300x200/ec4899/ffffff?text=Design',
    modules: 10,
    assignments: 6,
  },
  {
    id: 4,
    title: 'Mobile App Development',
    instructor: 'Mike Johnson',
    category: 'Mobile Development',
    students: 445,
    rating: 4.6,
    duration: '28 hours',
    progress: 40,
    image: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Mobile',
    modules: 14,
    assignments: 9,
  },
];

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Course Management
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage learning courses</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all">
          <Plus size={20} />
          Create Course
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="search"
            placeholder="Search courses..."
            className="w-full h-10 pl-10 pr-4 rounded-lg glass border border-border outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-border hover:bg-muted/50 transition-all">
          <Filter size={20} />
          Filters
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-xl overflow-hidden hover:shadow-xl hover:shadow-accent/10 transition-all gradient-border"
          >
            <div className="relative h-40 bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
              <BookOpen size={48} className="text-white/50" />
              <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-white">{course.rating}</span>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{course.instructor}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{course.students}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{course.duration}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Video size={12} />
                    <span>{course.modules}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText size={12} />
                    <span>{course.assignments}</span>
                  </div>
                </div>
                <button className="text-accent hover:text-accent/80 transition-all">
                  <TrendingUp size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}