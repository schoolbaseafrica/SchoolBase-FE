import { CheckCircle2 } from "lucide-react"

type PasswordCreateSuccessProps = {
  email?: string
}

const PasswordCreateSuccess = ({ email }: PasswordCreateSuccessProps) => {
  return (
    <article className="w-full text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Password Create</h1>
      <p className="text-sm text-gray-600">
        {email
          ? `Password for ${email} has been created. `
          : "Your password has been created. "}
        You can now sign in with your credentials.
      </p>
    </article>
  )
}

export default PasswordCreateSuccess
