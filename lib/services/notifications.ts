import { db } from "@/lib/db";
import { notifications, type NotificationType } from "@/lib/db/schema";

interface CreateNotificationOptions {
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a new notification in the database
 */
export async function createNotification(options: CreateNotificationOptions) {
  const [notification] = await db
    .insert(notifications)
    .values({
      type: options.type,
      title: options.title,
      message: options.message,
      metadata: options.metadata || null,
    })
    .returning();

  return notification;
}

/**
 * Notification helper functions for common events
 */
export const NotificationService = {
  /**
   * Create notification when a new rater starts evaluation
   */
  async raterStarted(raterId: string, language: string) {
    return createNotification({
      type: "rater_started",
      title: "New Rater Started",
      message: `A new ${language} speaker started evaluation`,
      metadata: { raterId, language },
    });
  },

  /**
   * Create notification when a rater completes all ratings
   */
  async raterCompleted(raterId: string, language: string, totalRatings: number) {
    return createNotification({
      type: "rater_completed",
      title: "Evaluation Completed",
      message: `A ${language} speaker completed all ${totalRatings} ratings`,
      metadata: { raterId, language, totalRatings },
    });
  },

  /**
   * Create notification when audio samples are uploaded
   */
  async samplesUploaded(count: number, language: string, modelType: string) {
    return createNotification({
      type: "samples_uploaded",
      title: "Samples Uploaded",
      message: `${count} new ${modelType} samples added for ${language}`,
      metadata: { count, language, modelType },
    });
  },

  /**
   * Create notification for rating milestones
   */
  async ratingMilestone(totalRatings: number) {
    return createNotification({
      type: "rating_milestone",
      title: "Milestone Reached! 🎉",
      message: `Your study has reached ${totalRatings} total ratings`,
      metadata: { totalRatings },
    });
  },

  /**
   * Create notification when an export is completed
   */
  async exportCompleted(exportId: string, format: string, recordCount: number) {
    return createNotification({
      type: "export_completed",
      title: "Export Ready",
      message: `Your ${format.toUpperCase()} export with ${recordCount} records is ready`,
      metadata: { exportId, format, recordCount },
    });
  },

  /**
   * Create a system notification
   */
  async system(title: string, message: string) {
    return createNotification({
      type: "system",
      title,
      message,
    });
  },
};
