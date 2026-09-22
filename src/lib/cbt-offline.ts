export interface OfflineCbtAnswer {
  key: string
  attemptId: string
  questionId: string
  answer: { value: unknown }
  revision: number
  synced: boolean
  updatedAt: string
}

const DATABASE_NAME = "schoolbase-cbt"
const STORE_NAME = "answers"
const VERSION = 1

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "key" })
        store.createIndex("attemptId", "attemptId", { unique: false })
      }
    }
  })
}

export async function saveOfflineAnswer(
  answer: Omit<OfflineCbtAnswer, "key" | "updatedAt">
) {
  const database = await openDatabase()
  const record: OfflineCbtAnswer = {
    ...answer,
    key: `${answer.attemptId}:${answer.questionId}`,
    updatedAt: new Date().toISOString(),
  }
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite")
    transaction.objectStore(STORE_NAME).put(record)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
  database.close()
  return record
}

export async function getOfflineAnswers(attemptId: string): Promise<OfflineCbtAnswer[]> {
  const database = await openDatabase()
  const records = await new Promise<OfflineCbtAnswer[]>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly")
    const request = transaction
      .objectStore(STORE_NAME)
      .index("attemptId")
      .getAll(attemptId)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  database.close()
  return records
}

export async function markOfflineAnswerSynced(
  attemptId: string,
  questionId: string,
  revision: number
) {
  const records = await getOfflineAnswers(attemptId)
  const record = records.find((item) => item.questionId === questionId)
  if (record?.revision === revision) {
    await saveOfflineAnswer({
      attemptId: record.attemptId,
      questionId: record.questionId,
      answer: record.answer,
      revision: record.revision,
      synced: true,
    })
  }
}

export async function clearOfflineAnswers(attemptId: string) {
  const records = await getOfflineAnswers(attemptId)
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    records.forEach((record) => store.delete(record.key))
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
  database.close()
}
