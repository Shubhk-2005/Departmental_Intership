import { Phone } from "lucide-react";

// Placement Statistics
export const placementStats = {
  totalStudents: 120,
  placedStudents: 108,
  placementPercentage: 90,
  highestPackage: "24.5 LPA",
  averagePackage: "8.2 LPA",
  companiesVisited: 45,
  internshipsCompleted: 156,
};

// Testimonials
export const testimonials = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Software Engineer",
    company: "Microsoft",
    batch: "2023",
    testimonial:
      "The placement cell at our department provided exceptional support throughout my job search. The mock interviews and resume workshops were invaluable in preparing me for the rigorous selection process at Microsoft.",
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "Data Scientist",
    company: "Amazon",
    batch: "2022",
    testimonial:
      "I'm grateful for the comprehensive training programs organized by the TPO. The industry-relevant curriculum and practical projects gave me the edge I needed to secure my dream job at Amazon.",
  },
  {
    id: 3,
    name: "Amit Kumar",
    role: "Product Manager",
    company: "Google",
    batch: "2021",
    testimonial:
      "The alumni network and mentorship programs helped me understand the industry landscape. The TPO's dedication to student success is truly commendable.",
  },
];

// Team Members
export const teamMembers = {
  tpo: {
    name: "Dr. Mahendra Rane",
    designation: "Training & Placement Officer",
    email: "tpo@fcrit.ac.in",
    phone: "+91 9819072834",
  },
  hod: {
    name: "Dr.M. Kiruthika",
    designation: "Head of Department - Computer Engineering",
    email: "m.kiruthika@fcrit.ac.in ",
    phone: "+91 22 1234 5679",
  },
  coordinators: [
    {
      name: "Prof. Prachi Verma",
      designation: "Assistant Placement Officer",
      email: "prachi.verma@fcrit.ac.in",
      phone: "+91 8839560208",
    },
    {
      name: "Prof. Mritunjay Ojha",
      designation: "Assistant Placement Officer",
      email: "mritunjay.ojha@fcrit.ac.in",
      phone: "+91 9987800789",
    },
  ],
};

// Alumni Directory
export const alumniDirectory = [
  {
    id: 1,
    name: "Rahul Sharma",
    graduationYear: "2023",
    company: "Microsoft",
    role: "Software Engineer",
    linkedinUrl: "https://linkedin.com/in/rahul-sharma",
  },
  {
    id: 2,
    name: "Priya Patel",
    graduationYear: "2022",
    company: "Amazon",
    role: "Data Scientist",
    linkedinUrl: "https://linkedin.com/in/priya-patel",
  },
  {
    id: 3,
    name: "Amit Kumar",
    graduationYear: "2021",
    company: "Google",
    role: "Product Manager",
    linkedinUrl: "https://linkedin.com/in/amit-kumar",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    graduationYear: "2023",
    company: "Adobe",
    role: "UX Designer",
    linkedinUrl: "https://linkedin.com/in/sneha-reddy",
  },
  {
    id: 5,
    name: "Vikram Singh",
    graduationYear: "2020",
    company: "Flipkart",
    role: "Engineering Manager",
    linkedinUrl: "https://linkedin.com/in/vikram-singh",
  },
  {
    id: 6,
    name: "Neha Gupta",
    graduationYear: "2022",
    company: "Infosys",
    role: "Technical Lead",
    linkedinUrl: "https://linkedin.com/in/neha-gupta",
  },
];

// Internship statuses
export const internshipStatuses = ["Pending", "Ongoing", "Completed"];

// Internship Data
export const internships = [
  {
    id: 1,
    studentName: "Arjun Malhotra",
    rollNo: "CE2024001",
    company: "TCS",
    role: "Software Development Intern",
    domain: "Web Development",
    duration: "3 months",
    status: "Completed",
    category: "Internship",
    type: "On-campus",
  },
  {
    id: 2,
    studentName: "Meera Joshi",
    rollNo: "CE2024002",
    company: "Wipro",
    role: "Data Analytics Intern",
    domain: "Data Science",
    duration: "6 months",
    status: "Ongoing",
    category: "Internship",
    type: "Off-campus",
  },
  {
    id: 3,
    studentName: "Rohit Sharma",
    rollNo: "CE2024003",
    company: "Infosys",
    role: "ML Engineer Intern",
    domain: "Machine Learning",
    duration: "4 months",
    status: "Completed",
    category: "Internship",
    type: "On-campus",
  },
  {
    id: 4,
    studentName: "Anjali Nair",
    rollNo: "CE2024004",
    company: "Accenture",
    role: "Cloud Intern",
    domain: "Cloud Computing",
    duration: "3 months",
    status: "Pending",
    category: "Internship",
    type: "Off-campus",
  },
  {
    id: 5,
    studentName: "Karan Patel",
    rollNo: "CE2024005",
    company: "IBM",
    role: "Backend Developer Intern",
    domain: "Backend Development",
    duration: "6 months",
    status: "Ongoing",
    category: "Placement",
    type: "On-campus",
  },
];

// Companies for filter
export const companies = [
  "All Companies",
  "TCS",
  "Wipro",
  "Infosys",
  "Accenture",
  "IBM",
  "Microsoft",
  "Amazon",
  "Google",
  "Adobe",
  "Flipkart",
];

// Academic Years
export const academicYears = [
  "All Years",
  "2024-25",
  "2023-24",
  "2022-23",
  "2021-22",
];

// Placement Status
export const placementStatuses = [
  "All Status",
  "Placed",
  "Unplaced",
  "Opted Out",
];

// Company-wise placement data for charts
export const companyWisePlacements = [
  { company: "TCS", placements: 25 },
  { company: "Wipro", placements: 18 },
  { company: "Infosys", placements: 22 },
  { company: "Accenture", placements: 15 },
  { company: "IBM", placements: 12 },
  { company: "Others", placements: 16 },
];

// Year-wise placement trends
export const yearWiseTrends = [
  { year: "2021", placed: 85, total: 100 },
  { year: "2022", placed: 92, total: 105 },
  { year: "2023", placed: 98, total: 110 },
  { year: "2024", placed: 108, total: 120 },
];

// Package distribution
export const packageDistribution = [
  { range: "3-5 LPA", count: 30 },
  { range: "5-8 LPA", count: 35 },
  { range: "8-12 LPA", count: 25 },
  { range: "12-18 LPA", count: 12 },
  { range: "18+ LPA", count: 6 },
];

// Domains
export const domains = [
  "Web Development",
  "Data Science",
  "Machine Learning",
  "Cloud Computing",
  "Backend Development",
  "Mobile Development",
  "DevOps",
  "Cybersecurity",
];

