export interface Testimonial {
  id: number
  name: string
  role: string
  image: string
  title: string
  content: string
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "James Chiamaka",
    role: "JSS 3A Student",
    image: "/testimonials/t-student.png",
    title: "Learning and being a student has never been this easy!",
    content:
      "School Base helps me follow my lessons, submit assignments easily, and track my progress. I love how everything is in one place.",
  },
  {
    id: 2,
    name: "Mr. Matthew",
    role: "Mathematics Teacher",
    image: "/testimonials/t-teacher.png",
    title: "Teaching and class management made simple!",
    content:
      "School Base helps me follow my lessons, submit assignments easily, and track my progress. I love how everything is in one place.",
  },
  {
    id: 3,
    name: "Mrs. Thompson Janet",
    role: "School Admin",
    image: "/testimonials/t-admin.png",
    title: "A powerful tool for modern schools, Reliable, fast, and built for growth!",
    content:
      "School Base has improved communication, record keeping, and student management. Our staff and parents love it.",
  },
  {
    id: 4,
    name: "Mr. James Kennedy",
    role: "Parent",
    image: "/testimonials/t-parent.png",
    title: "I can finally monitor my child's education and progress!",
    content:
      "With School Base, I see my son's attendance, results, and school updates in real time. It keeps me involved and gives me peace of mind.",
  },
]
