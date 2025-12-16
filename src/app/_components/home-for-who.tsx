import Image from "next/image"

const forWhoData = [
  {
    id: 1,
    image: "/images/home/for-who/image1.png",
    alt: "Students",
    description:
      "For administrators who require streamlined control of school processes and information.",
  },
  {
    id: 2,
    image: "/images/home/for-who/image2.png",
    alt: "Teachers",
    description:
      "For teachers who require streamlined management of classroom activities and student records.",
  },
  {
    id: 3,
    image: "/images/home/for-who/image3.png",
    alt: "Parents",
    description:
      "For students who want fast, organized access to their timetable, results, and academic updates.",
  },
  {
    id: 4,
    image: "/images/home/for-who/image4.png",
    alt: "Administrators",
    description:
      "For parents who want organized, real-time updates on attendance, results and school activities of their ward .",
  },
]

const HomeForWho = () => {
  return (
    <div
      id="for-who"
      className="flex scroll-mt-9 flex-col gap-6 bg-white pb-8 md:gap-8 md:pb-12 lg:pb-18"
    >
      <div className="container flex flex-col gap-6 md:gap-8">
        <section className="flex w-full max-w-[1285px] flex-col gap-3 px-4 text-left md:gap-4">
          <h2 className="text-2xl font-semibold md:text-3xl">Who is it for?</h2>
          <p className="text-base leading-7 md:text-lg md:leading-8 lg:text-xl">
            With School Base, students, teachers, parents, and administrators stay
            connected to everything they need learning, communication, and school
            management anytime, anywhere.
          </p>
        </section>
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {forWhoData.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 md:gap-6 lg:gap-8">
              <Image
                src={item.image}
                alt={item.alt}
                width={400}
                height={400}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                loading="lazy"
                className="w-full rounded-2xl"
              />
              <p className="text-text-secondary text-base md:text-lg">
                {item.description}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

export default HomeForWho
