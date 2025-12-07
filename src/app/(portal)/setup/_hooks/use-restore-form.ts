"use client"

import { useEffect, useState } from "react"
import { FormData } from "../_types/setup"

const DB_NAME = "SchoolSetupDB"
const STORE_NAME = "WizardStore"
const KEY = "formData"

// ---------- IndexedDB Helpers (No Dependencies) ----------
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

function idbGet<T>(key: string): Promise<T | undefined> {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  })
}

function idbSet<T>(key: string, value: T): Promise<void> {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      store.put(value, key)

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  })
}

function idbDelete(key: string): Promise<void> {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      store.delete(key)

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  })
}

// ---------- Hook ----------
export function useSetupWizardPersistence(defaultFormData: FormData) {
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Infer which step should be active based on filled fields
  function calculateStep(data: FormData): number {
    const { database, school, admin } = data

    const dbComplete =
      database.host && database.name && database.username && database.password
    if (!dbComplete) return 0

    const schoolComplete = school.name && school.phone && school.address
    if (!schoolComplete) return 2

    const adminComplete =
      admin.firstName &&
      admin.lastName &&
      admin.email &&
      admin.password &&
      admin.confirmPassword
    if (!adminComplete) return 3

    return 3 // admin step; installation is next
  }

  // Load from IndexedDB on mount
  useEffect(() => {
    async function load() {
      const stored = await idbGet<FormData>(KEY)
      if (stored) {
        setFormData(stored)
        setCurrentStep(calculateStep(stored))
      }
      setIsLoaded(true)
    }
    load()
  }, [])

  // Save updates to IndexedDB
  useEffect(() => {
    async function save() {
      if (isLoaded) {
        try {
          await idbSet(KEY, formData)
        } catch (error) {
          console.error("Failed to save form data to IndexedDB:", error)
        }
      }
    }
    save()
  }, [formData, isLoaded])

  // Update form data
  function updateForm(
    section: keyof FormData,
    field: string,
    value: string | File | number
  ) {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }
      return updated
    })
  }

  function clearStorage() {
    return idbDelete(KEY)
  }

  return {
    formData,
    updateForm,
    setFormData,
    currentStep,
    setCurrentStep,
    isLoaded,
    clearStorage,
  }
}
