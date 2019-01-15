const { makeArrayOfMessages, parseMessages } = require('./parser.js');

describe('parser.js', () => {
  describe('makeArrayOfMessages', () => {
    const multilineMessage = ['23/06/2018, 01:55 p.m. - Loris: one', 'two'];
    const systemMessage = ['06/03/2017, 00:45 - You created group "Test"'];
    const emptyMessage = ['03/02/17, 18:42 - Luke: '];
    const multilineSystemMessage = [
      '06/03/2017, 00:45 - You created group "Test"',
      'This is another line',
    ];

    it('should merge multiline messages', () => {
      expect(makeArrayOfMessages(multilineMessage)[0].msg).toBe(
        '23/06/2018, 01:55 p.m. - Loris: one\ntwo',
      );
    });

    it('should not flag normal messages as system messages', () => {
      expect(makeArrayOfMessages(multilineMessage)[0].system).toBe(false);

      /**
       * Sometimes a message could be empty (for reasons unknown) but should
       * still not be labeled as a system message
       */
      expect(makeArrayOfMessages(emptyMessage)[0].system).toBe(false);

      /**
       * In the unlikely case that whatsapp would start using multiline messages
       * for system notifications we should account for it
       */
      expect(makeArrayOfMessages(multilineSystemMessage)[0].system).toBe(true);
    });

    it('should flag system messages', () => {
      expect(makeArrayOfMessages(systemMessage)[0].system).toBe(true);
    });
  });

  describe('parseMessages', () => {
    describe('normal messages', () => {
      const messages = [
        { system: false, msg: '23/06/2018, 01:55 a.m. - Luke: Hey!' },
      ];
      const parsed = parseMessages(messages);

      describe('the date', () => {
        it('should be an instance of the Date object', () => {
          expect(parsed.messages[0].date).toBeInstanceOf(Date);
        });

        it('should contain the correct date', () => {
          expect(parsed.messages[0].date.getFullYear()).toBe(2018);
          expect(parsed.messages[0].date.getMonth()).toBe(5);
          expect(parsed.messages[0].date.getDate()).toBe(23);
        });

        it('should contain the correct time', () => {
          expect(parsed.messages[0].date.getHours()).toBe(1);
          expect(parsed.messages[0].date.getMinutes()).toBe(55);
          expect(parsed.messages[0].date.getSeconds()).toBe(0);
        });
      });

      describe('the author', () => {
        it('should contain the correct author', () => {
          expect(parsed.messages[0].author).toBe('Luke');
        });
      });

      describe('the message', () => {
        it('should contain the correct message', () => {
          expect(parsed.messages[0].message).toBe('Hey!');
        });
      });
    });

    describe('system messages', () => {
      const messages = [
        { system: true, msg: '06/03/2017, 00:45 - You created group "Test"' },
      ];
      const parsed = parseMessages(messages);

      describe('the date', () => {
        it('should be an instance of the Date object', () => {
          expect(parsed.messages[0].date).toBeInstanceOf(Date);
        });

        it('should contain the correct date', () => {
          expect(parsed.messages[0].date.getFullYear()).toBe(2017);
          expect(parsed.messages[0].date.getMonth()).toBe(2);
          expect(parsed.messages[0].date.getDate()).toBe(6);
        });

        it('should contain the correct time', () => {
          expect(parsed.messages[0].date.getHours()).toBe(0);
          expect(parsed.messages[0].date.getMinutes()).toBe(45);
          expect(parsed.messages[0].date.getSeconds()).toBe(0);
        });
      });

      describe('the author', () => {
        it('should contain the correct author', () => {
          expect(parsed.messages[0].author).toBe('System');
        });
      });

      describe('the message', () => {
        it('should contain the correct message', () => {
          expect(parsed.messages[0].message).toBe('You created group "Test"');
        });
      });
    });

    describe('formats', () => {
      /**
       * Examples of various date formats found in whatsapp chats
       *
       * m/d/yy, h:mm
       * m/d/yy, h:mm PM
       * m/d/yy, hh:mm
       * d.m.yyyy, hh:mm
       * dd/mm/yy, hh:mm
       * dd/mm/yy, hh.mm
       * dd-mm-yy hh:mm:ss
       * dd/mm/yyyy, hh:mm
       * dd/mm/yyyy, h:mm p.m.
       * [dd-mm-yy hh:mm:ss]
       * [dd/mm/yy, hh:mm:ss]
       */
      const format1 = [{ system: false, msg: '3/6/18, 1:55 p.m. - a: m' }];
      const format2 = [{ system: false, msg: '03-06-2018, 01.55 PM - a: m' }];
      const format3 = [{ system: false, msg: '13.06.18 21.25.15: a: m' }];
      const format4 = [{ system: false, msg: '[03.13.18 21:25:15] a: m' }];
      const parsed1 = parseMessages(format1);
      const parsed2 = parseMessages(format2);
      const parsed3 = parseMessages(format3);
      const parsed4 = parseMessages(format4);

      describe('the date', () => {
        it('should be parsed correctly in various formats', () => {
          /**
           * Checking for the year should be enough to know there were no errors
           * in parsing a specific format
           */
          expect(parsed1.messages[0].date.getFullYear()).toBe(2018);
          expect(parsed2.messages[0].date.getFullYear()).toBe(2018);
          expect(parsed3.messages[0].date.getFullYear()).toBe(2018);
          expect(parsed4.messages[0].date.getFullYear()).toBe(2018);
        });
      });
    });

    describe('options', () => {
      describe('daysFirst', () => {
        const messages = [{ system: false, msg: '3/6/18, 1:55 p.m. - a: m' }];
        const parsedDayFirst = parseMessages(messages, { daysFirst: true });
        const parsedMonthFirst = parseMessages(messages, { daysFirst: false });

        it('should allow the user to define if days come first or not', () => {
          expect(parsedDayFirst.messages[0].date.getDate()).toBe(3);
          expect(parsedDayFirst.messages[0].date.getMonth()).toBe(5);
          expect(parsedMonthFirst.messages[0].date.getDate()).toBe(6);
          expect(parsedMonthFirst.messages[0].date.getMonth()).toBe(2);
        });
      });
    });
  });
});
