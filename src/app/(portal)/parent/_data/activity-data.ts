type ActivityProps = {
  teacher: string
  subject: string
  "time-start": string
  "time-end": string
  status: string
  class: string
  students: number
  venue: string
}

export const activityData: ActivityProps[] = [
  {
    teacher: "Mr Victor Ajadi",
    subject: "Mathematics",
    "time-start": "08:30am",
    "time-end": "09:15am",
    status: "completed",
    class: "JSS1A",
    students: 80,
    venue: "TFBRM1",
  },
  {
    teacher: "Miss Chiwendu Agu",
    subject: "Physics",
    "time-start": "08:30am",
    "time-end": "09:15am",
    status: "completed",
    class: "SS2B",
    students: 60,
    venue: "LAB1",
  },
  {
    teacher: "Mrs Ruth Samuel-Temi",
    subject: "Chemistry",
    "time-start": "09:20am",
    "time-end": "10:05am",
    status: "Up coming",
    class: "SSS3A",
    students: 17,
    venue: "LAB1",
  },
  {
    teacher: "Miss Funke Daniels",
    subject: "Biology",
    "time-start": "10:10am",
    "time-end": "10:55am",
    status: "Up coming",
    class: "JSS3C",
    students: 20,
    venue: "Lecture Room 2",
  },
  {
    teacher: "Mr David Junior",
    subject: "Literature",
    "time-start": "10:10am",
    "time-end": "10:55am",
    status: "Ongoing",
    class: "SS1A",
    students: 10,
    venue: "Lecture Room 1",
  },
]
