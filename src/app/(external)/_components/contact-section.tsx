"use client"

import ContactForm from "@/app/(external)/_components/contact-form"
import { useSchoolStore } from "@/store/use-school-store"

export function ContactSection() {
  const contact = useSchoolStore((state) => state.school.contact)
  const hasEmail = Boolean(contact.email)
  const hasPhone = Boolean(contact.phone)

  return (
    <section id="contact" className="bg-gray-50 py-16">
      <div className="container flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="space-y-4 lg:w-1/4">
          <h3 className="text-3xl font-semibold">Contact Us</h3>
          <p className="text-lg text-[var(--text-secondary)]">
            We&apos;re here to help your school go digital.
          </p>
          <div className="space-y-4 text-[var(--text-secondary)]">
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Office Address</p>
              <p>{contact.office}</p>
            </div>
            {hasEmail && (
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Email</p>
                <a
                  className="text-accent hover:underline"
                  href={`mailto:${contact.email}`}
                >
                  {contact.email}
                </a>
              </div>
            )}
            {hasPhone && (
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Phone</p>
                <a className="text-accent hover:underline" href={`tel:${contact.phone}`}>
                  {contact.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm lg:w-3/4">
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
