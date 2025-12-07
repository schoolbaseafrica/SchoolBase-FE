import { Suspense } from "react"
import PasswordReset from "../_components/password-reset"
import Loading from "@/app/loading"

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <PasswordReset />
    </Suspense>
  )
}

export default ResetPasswordPage
