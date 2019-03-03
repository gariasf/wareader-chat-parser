const htmlify = require('./htmlify.js');

describe('htmlify.js', () => {
  it('should return a message with <img> tag when a image is present', () => {
    const chat = `11.10.18, 22:41 - someuser: IMG-20181011-WA0005.jpg (Datei angehängt)`;
    const chatWithImage = `11.10.18, 22:41 - someuser: <img src=IMG-20181011-WA0005.jpg />`;
    return expect(htmlify(chat)).toEqual(chatWithImage);
  });
});
