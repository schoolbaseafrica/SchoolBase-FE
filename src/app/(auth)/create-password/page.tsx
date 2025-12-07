import { Suspense } from "react"
import PasswordCreate from "../_components/password-create"
import Loading from "@/app/loading"

const CreatePasswordPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <PasswordCreate />
    </Suspense>
  )
}

export default CreatePasswordPage
