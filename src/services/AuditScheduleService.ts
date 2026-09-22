import db from '../db/sqlite';

export const AuditScheduleService = {
  createSchedule: (schedule: {
    url: string,
    country: string,
    dayOfWeek: number, // 0-6
    time: string,
    email: string,
    complianceGoal: number,
    siteType: string
  }) => {
    const id = `sched-${Date.now()}`;
    db.prepare(`
      INSERT INTO recurring_schedules (id, url, country, day_of_month, time, email, status, compliance_goal, site_type, created_at, next_run_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      schedule.url,
      schedule.country,
      schedule.dayOfWeek,
      schedule.time,
      schedule.email,
      'ACTIVE',
      schedule.complianceGoal,
      schedule.siteType,
      new Date().toISOString(),
      new Date().toISOString() // Simplification: run next based on logic
    );
    return id;
  },

  getAllSchedules: () => {
    return db.prepare('SELECT * FROM recurring_schedules').all();
  }
};
