import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Rocket } from "lucide-react"

interface FAQItem {
  id: number
  question: string
  answer: string
}

export default function HomeFAQ() {
  const faqData: FAQItem[] = [
    {
      id: 0,
      question: "What is SchoolBase?",
      answer:
        "SchoolBase is an open digital school management system that helps schools replace manual processes with automated tools for administration, academics, attendance, report cards, and parent engagement.",
    },
    {
      id: 1,
      question: "Who can use SchoolBase and what do they get?",
      answer:
        "SchoolBase supports Admins, Teachers, Students, and Parents, each with their own dashboard and permissions. Parents get read-only access, while teachers and admins can manage academic and administrative tasks.",
    },
    {
      id: 2,
      question: "How secure is the platform?",
      answer:
        "SchoolBase uses secure login, encrypted data, role-based access control (RBAC), and audit logs to ensure safety, privacy, and controlled access for all users.",
    },
    {
      id: 3,
      question: "How does school setup work?",
      answer:
        "Admins can create academic sessions, classes, and streams, then assign teachers and students. Everything automatically links to the active session to keep the academic structure organized.",
    },
  ]

  return (
    <section
      id="faq"
      className="font-outfit mb-8 h-full w-full scroll-mt-20 bg-[#fafafa] px-4 py-8 sm:px-4 lg:px-8"
    >
      <div className="mx-auto max-w-full px-4 lg:max-w-[1285px]">
        <h2
          className="mb-8 leading-none font-semibold text-gray-900"
          style={{ fontSize: "clamp(24px, 3vw, 32px)" }}
        >
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col items-stretch lg:flex-row lg:gap-[110px]">
          <div className="flex-1 lg:max-w-[860px]">
            <Accordion
              type="single"
              collapsible
              className="w-full space-y-4"
              defaultValue={`item-0`}
            >
              {faqData.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-md border border-[#2D2D2D]/15 bg-white px-4 py-2"
                >
                  <AccordionTrigger
                    className="flex w-full flex-row items-center py-2 text-left font-normal text-[#535353] transition-colors duration-200 hover:text-[#2d2d2d]"
                    style={{ fontSize: "clamp(16px, 2vw, 20px)" }}
                  >
                    <span className="block w-full sm:text-lg md:text-2xl">
                      {faq.question}
                    </span>
                  </AccordionTrigger>

                  <AccordionContent className="flex flex-col gap-4">
                    <p
                      className="leading-relaxed text-[#535353]/80"
                      style={{ fontSize: "clamp(14px, 2vw, 16px)" }}
                    >
                      <span className="text-sm md:text-xl">{faq.answer}</span>
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-16 lg:mt-0 lg:h-full lg:max-w-[330px]">
            <div className="flex h-full flex-col items-center justify-center rounded-lg border border-[#999] px-4 py-8 text-center lg:min-h-[400px]">
              <div className="mx-auto mb-4 flex h-[62px] w-[62px] max-w-32 items-center justify-center rounded-full bg-[#DA3743]/10">
                <Rocket className="h-8 w-8 text-[#DA3743]" />
              </div>
              <h2
                className="mb-2 font-bold lg:mb-4"
                style={{ fontSize: "clamp(16px, 2vw, 18px)" }}
              >
                Ready to transform your school?
              </h2>

              <p
                className="mb-2 leading-relaxed text-black lg:mb-4"
                style={{ fontSize: "clamp(14px, 2vw, 16px)" }}
              >
                Our team is ready to set up your school system. We respond fast.
              </p>

              <div className="my-2 w-full space-y-4 lg:my-0 lg:mt-6">
                <Button
                  asChild
                  className="w-full rounded-lg bg-[#DA3743] px-8 py-2 font-semibold text-white transition-colors duration-200"
                  style={{ fontSize: "clamp(14px, 2vw, 16px)" }}
                >
                  <Link href="/contact-us">Request Installation</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
