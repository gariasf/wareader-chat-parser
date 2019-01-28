const { daysBeforeMonths, normalizeDate } = require('./date.js');
const {
  convertTime12to24,
  normalizeAMPM,
  normalizeTime,
} = require('./time.js');

const regexParser = /\[?(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}),? (\d{1,2}[.:]\d{1,2}(?:[.:]\d{1,2})?)(?: ([ap]\.?m\.?))?\]?(?: -|:)? (.+?): ((?:.|\s)*)/i;
const regexParserSystem = /\[?(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}),? (\d{1,2}[.:]\d{1,2}(?:[.:]\d{1,2})?)(?: ([ap]\.?m\.?))?\]?(?: -|:)? ((?:.|\s)+)/i;
const regexStartsWithDateTime = /\[?(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}),? (\d{1,2}[.:]\d{1,2}(?:[.:]\d{1,2})?)(?: ([ap]\.?m\.?))?\]?/i;

/**
 * Given an array of lines, detects the lines that are part of a previous
 * message (multiline messages) and merges them
 * It also labels the system messages
 * The result is an array of messages
 */
function makeArrayOfMessages(lines) {
  return lines.reduce((acc, line) => {
    /**
     * If the line doesn't conform to the regex it's probably part of the
     * previous message or a "whatsapp event"
     */
    if (!regexParser.test(line)) {
      /**
       * If it doesn't match the first regex but still starts with a datetime
       * it should be considered a "whatsapp event" so it gets labeled "system"
       */
      if (regexStartsWithDateTime.test(line)) {
        return acc.concat({ system: true, msg: line });
      }

      // Last element not set, just skip this (might be an empty file)
      if (typeof acc.slice(-1)[0] === 'undefined') {
        return acc;
      }

      // Else it's part of the previous message and it should be concatenated
      return acc.slice(0, -1).concat({
        system: acc.slice(-1)[0].system,
        msg: `${acc.slice(-1)[0].msg}\n${line}`,
      });
    }

    return acc.concat({ system: false, msg: line });
  }, []);
}

/**
 * Given an array of messages, parses them and returns an object with the fields
 * date, author, message
 */
function parseMessages(messages, options = { daysFirst: undefined }) {
  let { daysFirst } = options;
  const authorList = [];
  const finalObj = {};

  // Parse messages with regex
  const parsed = messages.map(obj => {
    const { system, msg } = obj;

    // If it's a system message another regex should be used to parse it
    if (system) {
      const [, date, time, ampm, message] = regexParserSystem.exec(msg);

      return { date, time, ampm: ampm || null, author: 'System', message };
    }

    const [, date, time, ampm, author, message] = regexParser.exec(msg);

    return { date, time, ampm: ampm || null, author, message };
  });

  // Understand date format if not supplied (days come first?)
  if (typeof daysFirst !== 'boolean') {
    const numericDates = Array.from(
      new Set(parsed.map(({ date }) => date)),
      date => date.split(/[-/.]/).map(Number),
    );

    daysFirst = daysBeforeMonths(numericDates);
  }

  // Convert date/time in date object, return final object
  const mappedParsedMessages = parsed.map(
    ({ date, time, ampm, author, message }, index) => {
      let day;
      let month;
      let year;
      let isPreviousAuthor = false;
      let isNextAuthor = false;

      if (daysFirst === false) {
        [month, day, year] = date.split(/[-/.]/);
      } else {
        [day, month, year] = date.split(/[-/.]/);
      }

      [year, month, day] = normalizeDate(year, month, day);

      const [hours, minutes, seconds] = normalizeTime(
        ampm ? convertTime12to24(time, normalizeAMPM(ampm)) : time,
      ).split(/[:.]/);

      if (!authorList.includes(author) && author !== 'System') {
        authorList.push(author);
      }

      if (parsed[index + 1]) {
        const previousAuthor = parsed[index + 1].author;

        isNextAuthor = author.toLowerCase() === previousAuthor.toLowerCase();
      }

      if (parsed[index - 1]) {
        const nextAuthor = parsed[index - 1].author;

        isPreviousAuthor = author.toLowerCase() === nextAuthor.toLowerCase();
      }

      const dateObj = new Date(year, month - 1, day, hours, minutes, seconds);

      return {
        date: dateObj,
        dateString: dateObj.toLocaleDateString('en-GB'),
        dateDay: dateObj.getDay(),
        time: dateObj
          .toLocaleTimeString('en-GB', { hc: 'h24' })
          .replace(/(:\d{2}| [AP]M)$/, ''),
        author,
        isPreviousAuthor,
        isNextAuthor,
        message,
      };
    },
  );

  if (mappedParsedMessages.length > 0) {
    finalObj.messages = mappedParsedMessages;
    finalObj.authorList = authorList;
    finalObj.isGroup = authorList.length > 2;
  }

  return finalObj;
}

module.exports = {
  makeArrayOfMessages,
  parseMessages,
};
