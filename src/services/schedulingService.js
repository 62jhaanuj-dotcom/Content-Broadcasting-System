const {
  getApprovedLiveContentByTeacherAndSubject,
  getApprovedContentByTeacher,
} = require("../models/contentModel");
const { getScheduleByContentIds } = require("../models/scheduleModel");

/**
 *  REASON: SUBJECT-BASED ROTATION LOGIC
 *
 * ALGORITHM:
 * 1. Get all approved content for teacher + subject that's within time window
 * 2. Get schedules for these content items
 * 3. Calculate total rotation duration (sum of all durations)
 * 4. Find current position in rotation cycle
 * 5. Return the content that should be active now
 *
 * EXAMPLE:
 * Maths content:
 * - Content A: 5 minutes (cumulative: 0-5)
 * - Content B: 5 minutes (cumulative: 5-10)
 * - Content C: 3 minutes (cumulative: 10-13)
 *
 * If current time = 07 minutes:
 * - Total cycle = 13 minutes
 * - Current slot = 7 % 13 = 7
 * - Content B is active (5 <= 7 < 10)
 */
const getLiveContentService = async (teacherId, subject = null) => {
  try {
    const now = new Date();

    //  REASON: If subject is provided, get subject-specific content
    // Otherwise get all active content
    let activeContents;

    if (subject) {
      activeContents = await getApprovedLiveContentByTeacherAndSubject(
        teacherId,
        subject.toLowerCase(),
      );
    } else {
      // Get approved content that's within time window
      activeContents = await getApprovedContentByTeacher(teacherId);
      activeContents = activeContents.filter(
        (c) =>
          c.start_time &&
          c.end_time &&
          new Date(c.start_time) <= now &&
          new Date(c.end_time) >= now,
      );
    }

    if (!activeContents.length) {
      return {
        status: "no_content",
        message: "No content available",
        data: null,
      };
    }

    const contentIds = activeContents.map((c) => c.id);
    const schedules = await getScheduleByContentIds(contentIds);

    //  REASON: If no schedule exists, return first content
    if (!schedules.length) {
      return {
        status: "success",
        message: "Content retrieved",
        data: activeContents[0],
      };
    }

    // REASON: Calculate rotation position
    const total = schedules.reduce((sum, s) => sum + s.duration, 0);

    if (total === 0) {
      return {
        status: "success",
        message: "Content retrieved",
        data: activeContents[0],
      };
    }

    //  REASON: Get current time in minutes since epoch, then mod by total cycle
    const currentMinute = Math.floor(Date.now() / 60000);
    const slot = currentMinute % total;

    let cumulative = 0;

    for (let schedule of schedules) {
      cumulative += schedule.duration;

      if (slot < cumulative) {
        const activeContent = activeContents.find(
          (c) => c.id === schedule.content_id,
        );

        if (activeContent) {
          return {
            status: "success",
            message: "Content retrieved",
            data: activeContent,
            rotationInfo: {
              totalDuration: total,
              currentSlot: slot,
              contentDuration: schedule.duration,
            },
          };
        }
      }
    }

    //  REASON: Fallback (shouldn't reach here)
    return {
      status: "success",
      message: "Content retrieved",
      data: activeContents[0],
    };
  } catch (err) {
    throw err;
  }
};

/**
 *  REASON: Get all active content for a teacher organized by subject
 * Useful for showing all available content grouped by subject
 */
const getTeacherLiveContentBySubject = async (teacherId) => {
  try {
    const contents = await getApprovedContentByTeacher(teacherId);
    const now = new Date();

    //  REASON: Filter by time window - handle NULL start_time/end_time
    const activeContents = contents.filter(
      (c) =>
        c.start_time &&
        c.end_time &&
        new Date(c.start_time) <= now &&
        new Date(c.end_time) >= now,
    );

    if (!activeContents.length) {
      return {};
    }

    //  REASON: Group by subject
    const bySubject = {};
    for (let content of activeContents) {
      if (!bySubject[content.subject]) {
        bySubject[content.subject] = [];
      }
      bySubject[content.subject].push(content);
    }

    //  REASON: Add rotation info for each subject
    for (let subject in bySubject) {
      const contentIds = bySubject[subject].map((c) => c.id);
      const schedules = await getScheduleByContentIds(contentIds);

      bySubject[subject].rotationInfo = {
        total: schedules.reduce((sum, s) => sum + s.duration, 0),
        count: bySubject[subject].length,
      };
    }

    return bySubject;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  getLiveContentService,
  getTeacherLiveContentBySubject,
};
