"use client"

export function UsersLoader({ userType }: { userType: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
        <p className="text-gray-600">Loading {userType}...</p>
      </div>
    </div>
  )
}
