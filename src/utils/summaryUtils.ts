export interface SummaryBreakdown {
  week1: number;
  week2: number;
  week3: number;
  week4: number;
  monthlyTotal: number;
}

export interface AttendanceSummaryBreakdown {
  week1Present: number;
  week2Present: number;
  week3Present: number;
  week4Present: number;
  monthlyPresent: number;
  totalRecords: number;
}

export interface SalesSummaryBreakdown {
  week1Count: number;
  week2Count: number;
  week3Count: number;
  week4Count: number;
  monthlyCount: number;
  week1Quantity: number;
  week2Quantity: number;
  week3Quantity: number;
  week4Quantity: number;
  monthlyQuantity: number;
}

/**
 * Calculates weekly & monthly summary for attendance records.
 */
export function getAttendanceSummary(
  records: Array<{ date?: string; timestamp?: string; status: string }>,
  targetMonthYear?: string // e.g. "2026-08" or current month
): AttendanceSummaryBreakdown {
  const now = new Date();
  const currentMonthStr = targetMonthYear || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let week1 = 0;
  let week2 = 0;
  let week3 = 0;
  let week4 = 0;
  let monthly = 0;
  let total = 0;

  records.forEach((r) => {
    const rawDate = r.date || r.timestamp || '';
    if (!rawDate) return;

    // Check if record falls in the target month (or include if date starts with currentMonthStr)
    const recordDateStr = rawDate.split('T')[0];
    const isCurrentMonth = recordDateStr.startsWith(currentMonthStr) || !recordDateStr.includes('-');

    if (isCurrentMonth) {
      total++;
      const day = parseInt(recordDateStr.split('-')[2] || '1', 10);
      const isPresent = r.status === 'present' || r.status === 'half_day';

      if (isPresent) {
        monthly++;
        if (day >= 1 && day <= 7) week1++;
        else if (day >= 8 && day <= 14) week2++;
        else if (day >= 15 && day <= 21) week3++;
        else week4++;
      }
    }
  });

  return {
    week1Present: week1,
    week2Present: week2,
    week3Present: week3,
    week4Present: week4,
    monthlyPresent: monthly,
    totalRecords: total,
  };
}

/**
 * Calculates weekly & monthly summary for sales records.
 */
export function getSalesSummary(
  records: Array<{ date?: string; timestamp?: string; quantity?: number }>,
  targetMonthYear?: string
): SalesSummaryBreakdown {
  const now = new Date();
  const currentMonthStr = targetMonthYear || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let w1Count = 0, w2Count = 0, w3Count = 0, w4Count = 0, mCount = 0;
  let w1Qty = 0, w2Qty = 0, w3Qty = 0, w4Qty = 0, mQty = 0;

  records.forEach((r) => {
    const rawDate = r.date || r.timestamp || '';
    if (!rawDate) return;

    const recordDateStr = rawDate.split('T')[0];
    const isCurrentMonth = recordDateStr.startsWith(currentMonthStr) || !recordDateStr.includes('-');

    if (isCurrentMonth) {
      const day = parseInt(recordDateStr.split('-')[2] || '1', 10);
      const qty = Number(r.quantity) || 1;

      mCount++;
      mQty += qty;

      if (day >= 1 && day <= 7) {
        w1Count++;
        w1Qty += qty;
      } else if (day >= 8 && day <= 14) {
        w2Count++;
        w2Qty += qty;
      } else if (day >= 15 && day <= 21) {
        w3Count++;
        w3Qty += qty;
      } else {
        w4Count++;
        w4Qty += qty;
      }
    }
  });

  return {
    week1Count: w1Count,
    week2Count: w2Count,
    week3Count: w3Count,
    week4Count: w4Count,
    monthlyCount: mCount,
    week1Quantity: w1Qty,
    week2Quantity: w2Qty,
    week3Quantity: w3Qty,
    week4Quantity: w4Qty,
    monthlyQuantity: mQty,
  };
}
