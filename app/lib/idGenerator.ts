/**
 * Library ID Generator Utility
 * Generates human-readable unique IDs for library membership cards and visitor badges
 */

// Generate a random number with specified digits
const generateRandomNumber = (digits: number): string => {
  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1
  return Math.floor(Math.random() * (max - min + 1) + min).toString()
}

// Generate current year suffix
const getCurrentYearSuffix = (): string => {
  return new Date().getFullYear().toString().slice(-2) // Last 2 digits of year
}

// Generate month code (A=Jan, B=Feb, etc.)
const getMonthCode = (): string => {
  const months = 'ABCDEFGHIJKL'
  return months[new Date().getMonth()]
}

/**
 * Generate Library Member ID
 * Format: SPL-2025-001234
 * SPL = Special Library, 2025 = Year, 001234 = Sequential number
 */
export const generateMemberID = (): string => {
  const year = new Date().getFullYear()
  const randomNum = generateRandomNumber(6).padStart(6, '0')
  return `SPL-${year}-${randomNum}`
}

/**
 * Generate Visitor ID  
 * Format: SPL-2025-V-5678
 * SPL = Special Library, 2025 = Year, V = Visitor, 5678 = Random number
 */
export const generateVisitorID = (): string => {
  const year = new Date().getFullYear()
  const randomNum = generateRandomNumber(4)
  return `SPL-${year}-V-${randomNum}`
}

/**
 * Generate Student ID
 * Format: SPL-2025-ST-1234
 * SPL = Special Library, 2025 = Year, ST = Student, 1234 = Random number
 */
export const generateStudentID = (): string => {
  const year = new Date().getFullYear()
  const randomNum = generateRandomNumber(4)
  return `SPL-${year}-ST-${randomNum}`
}

/**
 * Generate VIP ID
 * Format: SPL-2025-VIP-123
 * SPL = Special Library, 2025 = Year, VIP = VIP, 123 = Random number
 */
export const generateVIPID = (): string => {
  const year = new Date().getFullYear()
  const randomNum = generateRandomNumber(3)
  return `SPL-${year}-VIP-${randomNum}`
}

/**
 * Generate Staff ID
 * Format: SPL-2025-STF-567
 * SPL = Special Library, 2025 = Year, STF = Staff, 567 = Random number
 */
export const generateStaffID = (): string => {
  const year = new Date().getFullYear()
  const randomNum = generateRandomNumber(3)
  return `SPL-${year}-STF-${randomNum}`
}

/**
 * Generate ID based on person type
 */
export const generatePersonID = (personType: string): string => {
  switch (personType.toUpperCase()) {
    case 'MEMBER':
      return generateMemberID()
    case 'VISITOR':
      return generateVisitorID()
    case 'STUDENT':
      return generateStudentID()
    case 'VIP':
      return generateVIPID()
    case 'STAFF':
      return generateStaffID()
    default:
      return generateVisitorID() // Default to visitor ID
  }
}

/**
 * Generate QR Code friendly ID (shorter)
 * Format: SPL25K1234 (9 characters)
 * SPL = Special Library, 25 = Year, K = Month, 1234 = Random
 */
export const generateQRID = (): string => {
  const yearSuffix = getCurrentYearSuffix()
  const monthCode = getMonthCode()
  const randomNum = generateRandomNumber(4)
  return `SPL${yearSuffix}${monthCode}${randomNum}`
}

/**
 * Generate Daily Attendance ID
 * Format: ATT-20250918-001
 * ATT = Attendance, 20250918 = Date, 001 = Sequential
 */
export const generateAttendanceID = (): string => {
  const date = new Date()
  const dateStr = date.getFullYear().toString() + 
                 (date.getMonth() + 1).toString().padStart(2, '0') + 
                 date.getDate().toString().padStart(2, '0')
  const randomNum = generateRandomNumber(3).padStart(3, '0')
  return `ATT-${dateStr}-${randomNum}`
}

/**
 * Validate ID format
 */
export const validateLibraryID = (id: string): { isValid: boolean; type: string | null } => {
  const patterns = {
    member: /^SPL-\d{4}-\d{6}$/,
    visitor: /^SPL-\d{4}-V-\d{4}$/,
    student: /^SPL-\d{4}-ST-\d{4}$/,
    vip: /^SPL-\d{4}-VIP-\d{3}$/,
    staff: /^SPL-\d{4}-STF-\d{3}$/,
    qr: /^SPL\d{2}[A-L]\d{4}$/,
    attendance: /^ATT-\d{8}-\d{3}$/,
  }

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(id)) {
      return { isValid: true, type }
    }
  }

  return { isValid: false, type: null }
}

/**
 * Extract information from ID
 */
export const parseLibraryID = (id: string) => {
  const validation = validateLibraryID(id)
  if (!validation.isValid) {
    return null
  }

  const parts = id.split('-')
  return {
    type: validation.type,
    prefix: parts[0],
    year: parts[1],
    suffix: parts[2],
    number: parts[3] || parts[2]?.slice(-4),
  }
}
