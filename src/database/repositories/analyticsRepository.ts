import { BaseRepository } from "./baseRepository";
import { AnalyticsTimePeriod } from "@/features/analytics/types/analytics";
import { Transaction } from "@/features/transactions/types/transaction";

export type AnalyticsTransaction = Transaction & {
  categoryName: string;
  categoryIcon: string | null;
};

class AnalyticsRepository extends BaseRepository {
  private formatISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  private getPeriodRange(period: AnalyticsTimePeriod) {
    const today = new Date();
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const start = new Date(today);

    switch (period) {
      case "week":
        start.setDate(today.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        break;
      case "month":
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case "quarter": {
        const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
        start.setFullYear(today.getFullYear(), quarterStartMonth, 1);
        start.setHours(0, 0, 0, 0);
        break;
      }
      case "custom":
        start.setDate(today.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        start.setDate(today.getDate() - 6);
        start.setHours(0, 0, 0, 0);
    }

    return {
      startDate: this.formatISODate(start),
      endDate: this.formatISODate(end),
    };
  }

  async getTransactionsForPeriod(period: AnalyticsTimePeriod): Promise<AnalyticsTransaction[]> {
    try {
      const db = await this.db();
      const { startDate, endDate } = this.getPeriodRange(period);

      console.log("start date and end date", startDate, endDate);

      return db.getAllAsync<AnalyticsTransaction>(
        `
        SELECT 
          t.*,
          c.name AS categoryName,
          c.icon AS categoryIcon
        FROM transactions t
        JOIN categories c ON c.id = t.category_id
        WHERE t.deleted_at IS NULL
          AND t.type = 'expense'
          AND t.transaction_date >= ?
          AND t.transaction_date <= ?
        ORDER BY t.transaction_date ASC, t.id ASC;
        `,
        [startDate, endDate]
      );
    } catch (error) {
      this.handleError("Get analytics transactions for period", error);
    }
  }
}

export default new AnalyticsRepository();