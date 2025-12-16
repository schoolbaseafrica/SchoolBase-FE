import { FaUserEdit } from "react-icons/fa"

const HomeHowItWorks = () => {
  return (
    <div className="bg-white px-4 pb-8 md:gap-8 md:pb-12 lg:pb-20">
      <div className="container flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <h2 className="text-3xl font-medium">How it works</h2>
          <p className="max-w-138 text-lg text-[#535353]">
            A simple, integrated system that connects schools, students, and parents, all
            in one place.
          </p>
        </section>
        <section className="flex w-full flex-col justify-between gap-4 max-md:items-center md:flex-row">
          <div className="flex w-fit flex-col items-center gap-8">
            <div className="bg-accent flex size-23 items-center justify-center rounded-[20px] shadow-[0px_1.85px_3.15px_0px_#DA374305,0px_8.15px_6.52px_0px_#DA374307,0px_20px_13px_0px_#DA374308,0px_38.52px_25.48px_0px_#DA37430A,0px_64.81px_46.8px_0px_#DA37430D,0px_100px_80px_0px_#DA374312]">
              <FaUserEdit className="h-8 w-10 text-white" />
            </div>
            <div className="flex w-full max-w-66 flex-col gap-4 text-center">
              <p className="text-2xl font-semibold">Set Up Your School</p>
              <p className="text-[#535353]">
                Create classes, add students, assign teachers, and configure fees within
                minutes.
              </p>
            </div>
          </div>
          <div className="flex w-fit flex-col items-center gap-8">
            <div className="flex size-23 items-center justify-center rounded-[20px] bg-[#10B981] shadow-[0px_1.85px_3.15px_0px_#10B98105,0px_8.15px_6.52px_0px_#10B98107,0px_20px_13px_0px_#10B98108,0px_38.52px_25.48px_0px_#10B9810A,0px_64.81px_46.8px_0px_#10B9810D,0px_100px_80px_0px_#10B98112]">
              <FaUserEdit className="h-8 w-10 text-white" />
            </div>
            <div className="flex w-full max-w-66 flex-col gap-4 text-center">
              <p className="text-2xl font-semibold">
                Manage Daily Activities Effortlessly
              </p>
              <p className="text-[#535353]">
                Take attendance, update results, share announcements, and track payments,
                all from your dashboard.
              </p>
            </div>
          </div>
          <div className="flex w-fit flex-col items-center gap-8">
            <div className="flex size-23 items-center justify-center rounded-[20px] bg-[#F59E0B] shadow-[0px_1.85px_3.15px_0px_#F59E0B05,0px_8.15px_6.52px_0px_#F59E0B07,0px_20px_13px_0px_#F59E0B08,0px_38.52px_25.48px_0px_#F59E0B0A,0px_64.81px_46.8px_0px_#F59E0B0D,0px_100px_80px_0px_#F59E0B12]">
              <FaUserEdit className="h-8 w-10 text-white" />
            </div>
            <div className="flex w-full max-w-66 flex-col gap-4 text-center">
              <p className="text-2xl font-semibold">Monitor and Improve Performance</p>
              <p className="text-[#535353]">
                Access insights, reports, attendance trends, and academic progress with
                just a tap
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomeHowItWorks
