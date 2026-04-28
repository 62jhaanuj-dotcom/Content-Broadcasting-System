const {
  getApprovedLiveContentByTeacherAndSubject,
  getApprovedContentByTeacher,
} = require("../models/contentModel");
const { getScheduleByContentIds } = require("../models/scheduleModel");

const isWithinActiveWindow = (content, now) => {
  if (!content.start_time || !content.end_time) {
    return false;
  }

  const startTime = new Date(content.start_time);
  const endTime = new Date(content.end_time);

  return startTime <= now && endTime >= now;
};

const getActiveScheduledContent = async (contents, now = new Date()) => {
  const activeContents = contents.filter((content) => {
    return isWithinActiveWindow(content, now);
  });

  if (!activeContents.length) {
    return null;
  }

  const schedules = await getScheduleByContentIds(
    activeContents.map((content) => content.id),
  );

  if (!schedules.length) {
    return null;
  }

  const scheduledContentMap = new Map(
    activeContents.map((content) => [content.id, content]),
  );
  const orderedSchedules = schedules.filter((schedule) => {
    return scheduledContentMap.has(schedule.content_id);
  });

  if (!orderedSchedules.length) {
    return null;
  }

  const totalDuration = orderedSchedules.reduce((sum, schedule) => {
    return sum + schedule.duration;
  }, 0);

  if (totalDuration <= 0) {
    return null;
  }

  const currentMinute = Math.floor(now.getTime() / 60000);
  const currentSlot = currentMinute % totalDuration;
  let usedDuration = 0;

  for (const schedule of orderedSchedules) {
    usedDuration += schedule.duration;

    if (currentSlot < usedDuration) {
      const activeContent = scheduledContentMap.get(schedule.content_id);

      if (!activeContent) {
        continue;
      }

      return {
        content: activeContent,
        rotationInfo: {
          totalDuration,
          currentSlot,
          contentDuration: schedule.duration,
          rotationOrder: schedule.rotation_order,
        },
      };
    }
  }

  return null;
};

// Get the content that should be shown right now for one teacher and subject.
const getLiveContentService = async (teacherId, subject) => {
  const normalizedSubject = subject ? subject.trim().toLowerCase() : null;

  if (!normalizedSubject) {
    return {
      status: "no_content",
      message: "No content available",
      data: null,
    };
  }

  const contents = await getApprovedLiveContentByTeacherAndSubject(
    teacherId,
    normalizedSubject,
  );
  const result = await getActiveScheduledContent(contents);

  if (!result) {
    return {
      status: "no_content",
      message: "No content available",
      data: null,
    };
  }

  return {
    status: "success",
    message: "Content retrieved",
    data: result.content,
    rotationInfo: result.rotationInfo,
  };
};

// Get one currently active content item per subject for one teacher.
const getTeacherLiveContentBySubject = async (teacherId, now = new Date()) => {
  const contents = await getApprovedContentByTeacher(teacherId);
  const contentBySubject = {};

  for (const content of contents) {
    if (!isWithinActiveWindow(content, now)) {
      continue;
    }

    if (!contentBySubject[content.subject]) {
      contentBySubject[content.subject] = [];
    }

    contentBySubject[content.subject].push(content);
  }

  const activeBySubject = {};
  const subjects = Object.keys(contentBySubject).sort();

  for (const subject of subjects) {
    const result = await getActiveScheduledContent(contentBySubject[subject], now);

    if (!result) {
      continue;
    }

    activeBySubject[subject] = {
      content: result.content,
      rotationInfo: result.rotationInfo,
    };
  }

  return activeBySubject;
};

// Get one currently active content item for a teacher.
const getTeacherLiveContent = async (teacherId) => {
  const now = new Date();
  const activeBySubject = await getTeacherLiveContentBySubject(teacherId, now);
  const subjects = Object.keys(activeBySubject).sort();

  if (!subjects.length) {
    return {
      status: "no_content",
      message: "No content available",
      data: null,
    };
  }

  const currentMinute = Math.floor(now.getTime() / 60000);
  const selectedSubject = subjects[currentMinute % subjects.length];
  const selectedEntry = activeBySubject[selectedSubject];

  return {
    status: "success",
    message: "Content retrieved",
    data: selectedEntry.content,
    rotationInfo: {
      ...selectedEntry.rotationInfo,
      subject: selectedSubject,
      activeSubjectCount: subjects.length,
    },
  };
};

module.exports = {
  getLiveContentService,
  getTeacherLiveContentBySubject,
  getTeacherLiveContent,
};
