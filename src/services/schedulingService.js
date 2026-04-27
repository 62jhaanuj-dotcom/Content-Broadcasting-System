const {
  getApprovedLiveContentByTeacherAndSubject,
  getApprovedContentByTeacher,
} = require("../models/contentModel");
const { getScheduleByContentIds } = require("../models/scheduleModel");

// Get the content that should be shown right now.
const getLiveContentService = async (teacherId, subject = null) => {
  const now = new Date();

  let activeContents;

  if (subject) {
    activeContents = await getApprovedLiveContentByTeacherAndSubject(
      teacherId,
      subject.toLowerCase(),
    );
  } else {
    activeContents = await getApprovedContentByTeacher(teacherId);
    activeContents = activeContents.filter((content) => {
      const startTime = new Date(content.start_time);
      const endTime = new Date(content.end_time);

      return content.start_time && content.end_time && startTime <= now && endTime >= now;
    });
  }

  if (!activeContents.length) {
    return {
      status: "no_content",
      message: "No content available",
      data: null,
    };
  }

  const contentIds = activeContents.map((content) => content.id);
  const schedules = await getScheduleByContentIds(contentIds);

  if (!schedules.length) {
    return {
      status: "success",
      message: "Content retrieved",
      data: activeContents[0],
    };
  }

  const totalDuration = schedules.reduce((sum, schedule) => {
    return sum + schedule.duration;
  }, 0);

  if (totalDuration === 0) {
    return {
      status: "success",
      message: "Content retrieved",
      data: activeContents[0],
    };
  }

  const currentMinute = Math.floor(Date.now() / 60000);
  const currentSlot = currentMinute % totalDuration;
  let usedDuration = 0;

  for (const schedule of schedules) {
    usedDuration += schedule.duration;

    if (currentSlot < usedDuration) {
      const activeContent = activeContents.find((content) => {
        return content.id === schedule.content_id;
      });

      if (activeContent) {
        return {
          status: "success",
          message: "Content retrieved",
          data: activeContent,
          rotationInfo: {
            totalDuration,
            currentSlot,
            contentDuration: schedule.duration,
          },
        };
      }
    }
  }

  return {
    status: "success",
    message: "Content retrieved",
    data: activeContents[0],
  };
};

// Get all live content and group it by subject.
const getTeacherLiveContentBySubject = async (teacherId) => {
  const contents = await getApprovedContentByTeacher(teacherId);
  const now = new Date();

  const activeContents = contents.filter((content) => {
    const startTime = new Date(content.start_time);
    const endTime = new Date(content.end_time);

    return content.start_time && content.end_time && startTime <= now && endTime >= now;
  });

  if (!activeContents.length) {
    return {};
  }

  const contentBySubject = {};

  for (const content of activeContents) {
    if (!contentBySubject[content.subject]) {
      contentBySubject[content.subject] = [];
    }

    contentBySubject[content.subject].push(content);
  }

  for (const subject in contentBySubject) {
    const contentIds = contentBySubject[subject].map((content) => content.id);
    const schedules = await getScheduleByContentIds(contentIds);

    contentBySubject[subject].rotationInfo = {
      total: schedules.reduce((sum, schedule) => sum + schedule.duration, 0),
      count: contentBySubject[subject].length,
    };
  }

  return contentBySubject;
};

module.exports = {
  getLiveContentService,
  getTeacherLiveContentBySubject,
};
