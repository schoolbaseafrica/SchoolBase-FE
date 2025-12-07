import { apiFetch } from "./api/client"

export interface FeeComponent {
  id: string
  name: string
  amount: number
  session: string
  term: string
  frequency: string
  session_id?: string // Assuming these might be available
  term_id?: string
}

export interface Student {
  id: string
  name: string
  class: string
  session: string
  registration_number: string
  photo_url: string | null
}

export interface ActiveFeesResponse {
  data: FeeComponent[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface FeeStudentsResponse {
  data: Student[]
}

type ResponsePack<T> = {
  status_code: number
  message: string | null
  data: T
}

export interface FeesAnalyticsResponse {
  data: {
    totals: {
      total_expected_fees: number
      total_paid: number
      outstanding_balance: number
      transaction_this_month: number
    }
    monthly_payments: {
      month: string
      total_payment: number
    }[]
  }
}

export interface FeePayment {
  id: string
  student_id: string
  student: {
    id: string
    first_name: string
    last_name: string
  }
  fee_component_id: string
  fee_component: {
    id: string
    component_name: string
    amount: string
  }
  amount_paid: string
  payment_method: string
  payment_date: string
  term_id: string
  term: {
    id: string
    name: string
  }
  session_id: string
  invoice_number: string
  transaction_id: string
  receipt_url: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface FeePaymentsResponse {
  payments: FeePayment[]
  total: number
  page: number
  limit: number
}

export interface FeePaymentParams {
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: "ASC" | "DESC"
  search?: string
  student_id?: string
  fee_component_id?: string
  term_id?: string
  session_id?: string
  class?: string
  status?: string
  payment_method?: string
}

export const FeesAPI = {
  getActiveFees: () =>
    apiFetch<ResponsePack<ActiveFeesResponse>>("/fees/active", { method: "GET" }, true),

  getFeeStudents: (feeId: string) =>
    apiFetch<ResponsePack<FeeStudentsResponse>>(
      `/fees/${feeId}/students`,
      { method: "GET" },
      true
    ),

  createPayment: (data: FormData) =>
    apiFetch<ResponsePack<null>>(
      "/fee-payments",
      {
        method: "POST",
        data,
      },
      true
    ),

  getAnalytics: (params?: { year?: number; session_id?: string; term_id?: string }) =>
    apiFetch<ResponsePack<FeesAnalyticsResponse>>(
      "/fee-payments/dashboard/analytics",
      {
        method: "GET",
        params,
      },
      true
    ),

  getPayments: (params?: FeePaymentParams) =>
    apiFetch<ResponsePack<FeePaymentsResponse>>(
      "/fee-payments",
      {
        method: "GET",
        params,
      },
      true
    ),

  getStudentFeeDetails: (
    studentId: string,
    params: { term_id: string; session_id: string }
  ) =>
    apiFetch<ResponsePack<StudentFeeDetailsResponse>>(
      `/fees/student/${studentId}`,
      {
        method: "GET",
        params,
      },
      true
    ),
}

export interface StudentFeeDetailsResponse {
  data: {
    student_info: {
      student_id: string
      first_name: string
      last_name: string
      registration_number: string
      class: string
      term: string
      session: string
    }
    fee_breakdown: {
      component_name: string
      amount: number
      amount_paid: number
      outstanding_amount: number
      status: string
    }[]
    payment_history: {
      payment_date: string
      amount_paid: number
      payment_method: string
      transaction_reference: string
      fee_component: string
      term_label: string
    }[]
  }
}
